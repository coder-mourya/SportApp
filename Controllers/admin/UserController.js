const { Mongoose } = require("mongoose");
const Boom = require("boom");
const User = require("../../models/user");
const UserTeam = require("../../models/userteam");
const UserEvent = require("../../models/event");
const TrainingBooking = require("../../models/trainingBooking");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const constant = require("../../constants");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../apiHandler");
const moment = require("moment");
const Country = require("../../models/countrie");
const State = require("../../models/state");
const City = require("../../models/citie");
const XLSX = require("xlsx");
const Member = require("../../models/member");
const {dump} = require("../../services/dump");
const Helper = require("../../services/helper");

module.exports = {
  //*******User list********** */
  list: async (req, res) => {
    try {
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = { isDeleted : false };
      let sortparam = { createdAt: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
          $or: [
            {
              fullName: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              email: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              mobile: { $regex: ".*" + search + ".*", $options: "i" },
            },
          ],
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const [{ user, total }] = await User.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "chosenSports",
            foreignField: "_id",
            as: "userSports",
          },
        },
        {
          $lookup : {
            from : "trainingbookings",
            localField: "_id",
            foreignField: "userId",
            as: "userTrainingBookings",
          }
        },
        {
          $lookup : {
            from : "events",
            let : { userId : "$_id" },
            pipeline: [
              { $match : {
                $and : [
                  {
                    $expr : {
                      $in : ["$$userId", "$members"]
                    },
                  },
                  {
                    $expr  :{
                      $ne : [ "$creatorId", "$$userId"]
                    }
                  }
                ]
              }
            }
            ],
            as : "userEventBookings"
          }
        },
        {
          $facet: {
            total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
            user: [
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  fullName: 1,
                  nickName: 1,
                  email: 1,
                  mobile: 1,
                  phoneNumericCode: 1,
                  countryCode: 1,
                  gender: 1,
                  dateOfBirth: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  status: 1,
                  userType: 1,
                  description: 1,
                  profileImage: 1,
                  chosenSports: 1,
                  userSports : "$userSports",
                  userTrainingBookings: { $size: "$userTrainingBookings" },
                  userEventBookings: { $size: "$userEventBookings" },
                  userSports: 1,
                  markAdmin: 1,
                  isDeleted: 1,
                  lastLoginTime: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: { gt: [{ $size: "$total" }, 0] },
                then: { $arrayElemAt: ["$total.count", 0] },
                else: 0,
              },
            },
          },
        },
      ]);
      return SendResponse(res, { user: user, total: total }, "User List", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

   //download Users list
   downloadUsersList: async (req, res) => {
    try {

      let { search, status, sort } = req.query;
      let params = { isDeleted : false };
      let sortparam = { createdAt: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
          $or: [
            {
              fullName: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              email: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              mobile: { $regex: ".*" + search + ".*", $options: "i" },
            },
          ],
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      
      const usersList = await User.aggregate([
        {
          $match: params ,
        },
        {
          $lookup: {
            from: "sports",
            localField: "chosenSports",
            foreignField: "_id",
            as: "userSports",
          },
        },
        {
          $project: {
            fullName: 1,
            nickName: 1,
            email: 1,
            mobile: 1,
            countryCode: 1,
            phoneNumericCode: 1,
            gender: 1,
            dateOfBirth: 1,
            country: 1,
            state: 1,
            city: 1,
            status: 1,
            userType: 1,
            description: 1,
            profileImage: 1,
            chosenSports: 1,
            userSports : "$userSports",
            userSports: 1,
            markAdmin: 1,
            isDeleted: 1,
            lastLoginTime: 1,
            createdAt: 1,
          },
        },
        { $sort: sortparam },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Name",
        "Email",
        "Sports Type",
        "Mobile No.",
        "Country",
        "State",
        "City",
        "Registered On",
        "Bookings",
        "Status"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Users.xlsx";

      //get wanted params by mapping
      const result = usersList.map((val, index) => {
        val.sports = [];
        val?.userSports.forEach( ele => {
          val.sports.push( ele.sports_name);
        });
        val.sports = val.sports.join(", ");

        return [
          index + 1,
          val.fullName,
          val.email,
          val.sports,
          `+${val.phoneNumericCode} ${val.mobile}`,
          val.country,
          val.state,
          val.city,
          val.createdAt,
          "",
          val.status == true ? "Active" : "Inactive"
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //********User details******* */
  userDetails: async (req, res) => {
    try {
      if (!req.params.id) {
        return SendResponse(res, { isBoom: true }, "User id is required", 422);
      }

      let user = await User.findById(req.params.id);
      if (!user) {
        return SendResponse(res, { isBoom: true }, "No user found", 422);
      }

      const [data] = await User.aggregate([
        {
          $match: { _id: ObjectId(req.params.id) },
        },
        {
          $lookup: {
            from: "sports",
            localField: "chosenSports",
            foreignField: "_id",
            as: "userSports",
          },
        },
        {
          $project: {
            fullName: 1,
            nickName: 1,
            email: 1,
            mobile: 1,
            countryCode: 1,
            phoneNumericCode: 1,
            gender: 1,
            dateOfBirth: 1,
            country: 1,
            state: 1,
            city: 1,
            status: 1,
            userType: 1,
            description: 1,
            profileImage: 1,
            jerseyDetails: 1,
            userSports: 1,
            markAdmin: 1,
            isDeleted: 1,
            isEmailVerify: 1,
            lastLoginTime: 1,
            createdAt: 1,
          },
        },
      ]);

      return SendResponse(res, { user: data }, "User Details", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  //************Update User******** */
  updateUser: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        id: "required"
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {}, err, 422);
      }

      const user = await User.findOne({ _id: ObjectId(req.body.id) });
      if(!user){
        return SendResponse(
          res,
          { isBoom: true },
          "User not found",
          422
        );
      }
      
      if( req.body.mobile && req.body.phoneNumericCode ){
        let checkMobileExits = await User.findOne({
          _id: { $ne: ObjectId(req.body.id) },
          mobile: req.body.mobile,
          phoneNumericCode: req.body.phoneNumericCode,
        });
        if (checkMobileExits) {
          return SendResponse(
            res,
            { isBoom: true },
            "This mobile number already exists",
            422
          );
        }
      }
      
      await User.findByIdAndUpdate( req.body.id, req.body);
      return SendResponse(res, {}, "User updated successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  //********Change Status********** */
  updateStatus: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        id: "required",
        status: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }
      const user = await User.findByIdAndUpdate(
        req.body.id,
        {
          $set: { status: req.body.status },
        },
        { new: true }
      );
    
      // If status is active then push back to the teams and events which he has created or he is member of those teams and events else pull from those teams and events.
      console.log("status of user", await User.findById(req.body.id));
      if(req.body.status == "false"){ 
        await Helper.changeStatus(req.body.id, req.body.status, "update");
        await Member.updateMany({
          isTeamMember : true,
          memberId : ObjectId(req.body.id),
          status : true
        },{
          $set : {
            status : false
          }
        });
        await Member.updateMany({
          isEventMember : true,
          memberId : ObjectId(req.body.id),
          status : true
        },{
          $set : {
            status : false
          }
        });
        await UserTeam.updateMany({
          user_id : ObjectId(req.body.id)
        },{
          $set : { status : false }
        });
        await UserEvent.updateMany({
          creatorId : ObjectId(req.body.id)
        },{
          $set : { status : false }
        });
      }else{
        await Helper.changeStatus(req.body.id, req.body.status );
        await Member.updateMany({
          isTeamMember : true,
          memberId : ObjectId(req.body.id),
          status : false
        },{
          $set : {
             status : true
          }
        });
        await Member.updateMany({
          isEventMember : true,
          memberId : ObjectId(req.body.id),
          status : false
        },{
          $set : {
             status : true
          }
        });
        await UserTeam.updateMany({
          user_id : ObjectId(req.body.id)
        },{
          $set : { status : true }
        });
        await UserEvent.updateMany({
          creatorId : ObjectId(req.body.id)
        },{
          $set : { status : true }
        });
      }
      return SendResponse(res, {}, "User status changed successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  //**********Delete User*********** */
  deleteUser: async (req, res) => {
    try {
      if (!req.params.id) {
        return SendResponse(res, { isBoom: true }, "Please enter user id", 422);
      }
      let user = await User.findById(req.params.id);
      if (!user) {
        return SendResponse(res, { isBoom: true }, "No data found", 422);
      }
      if (user.profileImage != "" && user.profileImage != null) {
        const removed = await FileUpload.unlinkFile(
          user.profileImage.slice(50)
        );
      }
      user.isDeleted = true;
      await user.save();

      // await UserTeam.updateMany({
      //   members : { $in : ObjectId(req.params.id) }
      // },
      // {
      //   $pull: {
      //     admins: ObjectId(req.params.id),
      //     members: ObjectId(req.params.id),
      //   },
      // }
      // );

      // await User.deleteMany({
      //   user_id : ObjectId(req.params.id)
      // });

      // await UserEvent.updateMany({
      //   members : { $in : ObjectId(req.params.id) }
      // },
      // {
      //   $pull: {
      //     admins: ObjectId(req.params.id),
      //     members: ObjectId(req.params.id),
      //   },
      // }
      // );

      // await UserEvent.deleteMany({
      //   creatorId : ObjectId(req.params.id)
      // });
      // await user.delete();
      return SendResponse(res, {}, "User deleted successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  //*****Country list**** */
  countryList: async (req, res) => {
    try {
      const country_list = await Country.find().lean();

      for await (const country of country_list) {
        country.flag = `${process.env.IMG_URL}flags/${country.sortname}.png`;
      }

      return SendResponse(
        res,
        { country_list: country_list },
        "Country list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong,please try again",
        500
      );
    }
  },

  // //*********State list**** */
  stateList: async (req, res) => {
    try {
      if (!req.params.countryId) {
        return SendResponse(
          res,
          { isBoom: true },
          "Country Id field is required",
          422
        );
      }
      const state_list = await State.find({ country_id: req.params.countryId });

      return SendResponse(
        res,
        { state_list: state_list },
        "State list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  // //******City list****** */
  cityist: async (req, res) => {
    try {
      if (!req.params.stateId) {
        return SendResponse(
          res,
          { isBoom: true },
          "State Id field is required",
          422
        );
      }
      const city_list = await City.find({ state_id: req.params.stateId });

      return SendResponse(
        res,
        { city_list: city_list },
        "City list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //***  Get User Teams which he has created or is part of which team   ***** */

  UserTeamList: async (req, res) => {
    try {
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = {};
      let sortparam = { createdAt: -1 };

      params = [
        {
          $or: [
            { user_id: ObjectId(req.params.id) },
            {
              $expr: {
                $in: [ObjectId(req.params.id), "$members"],
              },
            },
          ],
        },
      ];

      if (search != "" && search != null) {
        params.push({
          teamName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }

        if (status != "" && status != null) {
          params.push({
            status: status == "active" ? true : false,
          });
        }

        if (sort != "" && sort != null) {
          sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
        }
        const [{ teamList, total }] = await UserTeam.aggregate([
          {
            $match: {
              $and: params,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "creatorDetails",
            },
          },
          {
            $facet: {
              total: [
                {
                  $group: {
                    _id: "null",
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
              teamList: [
                {
                  $project: {
                    _id: 1,
                    createdAt: 1,
                    teamName: 1,
                    tagLine: 1,
                    sports_id: 1,
                    country: 1,
                    state: 1,
                    city: 1,
                    teamColour_id: 1,
                    teamId: 1,
                    coverPhoto: 1,
                    logo: 1,
                    user_id: 1,
                    creatorDetails: 1,
                    aboutCreator: 1,
                    creatorIsAdmin: 1,
                    members: 1,
                    admins: 1,
                    status: 1,
                  },
                },
                { $sort: sortparam },
                { $skip: skip },
                { $limit: limit },
              ],
            },
          },
          {
            $addFields: {
              total: {
                $cond: {
                  if: {
                    gt: [
                      {
                        $size: "$total",
                      },
                      0,
                    ],
                  },
                  then: {
                    $arrayElemAt: ["$total.count", 0],
                  },
                  else: 0,
                },
              },
            },
          },
        ]);
        let teamData = {
          teamList: teamList,
          total: total || 0,
        };

        return SendResponse(
          res,
          {
            teamData: teamData,
          },
          "Team list",
          200
        );
      
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //**           Get User Team Deatils            */
  teamDetails: async (req, res) => {
    try {
      let [teamDetails] = await UserTeam.aggregate([{
          $match: {
            _id: ObjectId(req.params.teamId),
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              admins: "$admins",
            },
            pipeline: [{
                $match: {
                  $and: [
                    // {
                    //   $expr: {
                    //     $in: ["$memberId", "$$userId"],
                    //   },
                    // },
                    {
                      teamId: ObjectId(req.params.teamId),
                    },
                    {
                      requestStatus: 2,
                    },
                    {
                      status: true,
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  memberId: 1,
                  fullName: 1,
                  memberId: 1,
                  email: 1,
                  profileImage: "$image",
                  isAdmin: 1,
                  aboutCreator: 1,
                  expectations: 1,
                  description: 1,
                  jerseyDetails: 1,
                  requestStatus: 1,
                  status: 1
                },
              },
            ],
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "sports",
            localField: "sports_id",
            foreignField: "_id",
            as: "sportDetails",
          },
        },
        {
          $unwind: {
            path: "$sportDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_",
            foreignField: "_id",
            as: "creatorDetails",
          },
        },
        {
          $lookup: {
            from: "colourcodes",
            localField: "teamColour_id",
            foreignField: "_id",
            as: "teamColourDetails",
          },
        },
        {
          $unwind: {
            path: "$teamColourDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            teamName: 1,
            tagLine: 1,
            sports_id: 1,
            country: 1,
            state: 1,
            city: 1,
            teamColour_id: 1,
            coverPhoto: 1,
            logo: 1,
            aboutCreator: 1,
            creatorIsAdmin: 1,
            members: "$memberDetails",
            admins: 1,
            user_id: 1,
            creatorDetails : "$creatorDetails",
            sport: "$sportDetails",
            colour: "$teamColourDetails",
          },
        },
      ]);
      return SendResponse(
        res, {
          teamDetails: teamDetails,
        },
        "Team details",
        200
      );
    } catch (error) {
      dump(error);
      return SendResponse(
        res, {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },



  //download User Teams list
  downloadTeamsList: async (req, res) => {
    try {
      let { search, status, sort } = req.query;
      let params = {};
      let sortparam = { createdAt: -1 };

      params = [
        {
          $or: [
            { user_id: ObjectId(req.params.id) },
            {
              $expr: {
                $in: [ObjectId(req.params.id), "$members"],
              },
            },
          ],
        },
      ];

      if (search != "" && search != null) {
        params.push({
          teamName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }

      if (status != "" && status != null) {
        params.push({
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }
      const teamList = await UserTeam.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "creatorDetails",
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            teamName: 1,
            tagLine: 1,
            sports_id: 1,
            country: 1,
            state: 1,
            city: 1,
            teamColour_id: 1,
            coverPhoto: 1,
            logo: 1,
            user_id: 1,
            teamId: 1,
            creatorDetails: 1,
            aboutCreator: 1,
            creatorIsAdmin: 1,
            members: 1,
            admins: 1,
            status: 1,
          },
        },
        { $sort : sortparam }
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Team Id",
        "Team Name",
        "Number of Members",
        "Team Owner",
        "Date Created",
        "Status",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Teams.xlsx";

      //get wanted params by mapping
      const result = teamList.map((val, index) => {
        return [
          index + 1,
          val.teamId,
          val.teamName,
          val.members.length,
          val.user_id == req.params.id
            ? "User Himself"
            : val.creatorDetails.fullName,
          new Date(val.createdAt),
          val.status == true ? "Active" : "Inactive",
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //***  Get User Events which he has created or is part of which team   ***** */

  UserEventList: async (req, res) => {
    try {
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = {};
      let sortparam = { createdAt: -1 };

      params = [
        {
          $or: [
            { creatorId: ObjectId(req.params.id) },
            {
              $expr: {
                $in: [ObjectId(req.params.id), "$members"],
              },
            },
          ],
        },
      ];

      if (search != "" && search != null) {
        params.push({
          eventName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }
      if (status != "" && status != null) {
        params.push({
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const [{ eventList, total }] = await UserEvent.aggregate([
        {
          $match: {
            $and : params
          },
        },
        {
          $lookup: {
            from: "users",
            let: { creatorId: "$creatorId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$creatorId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  profileImage: 1,
                },
              },
            ],
            as: "creatorDetails",
          },
        },
        {
          $unwind: {
            path: "$creatorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "facilitybranches",
            let: { facilityId: "$facilityId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$facilityId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  address: 1,
                  city: 1,
                  state: 1,
                  country: 1,
                  status: 1,
                },
              },
            ],
            as: "facilityDetails",
          },
        },
        {
          $unwind: {
            path: "$facilityDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            eventList: [
              {
                $project: {
                  _id: 1,
                  createdAt: 1,
                  creatorId: 1,
                  eventName: 1,
                  eventType: 1,
                  eventId: 1,
                  teamId: 1,
                  address: 1,
                  opponentName: 1,
                  sportId: 1,
                  facilityId: 1,
                  eventDate: 1,
                  startTime: 1,
                  endTime: 1,
                  notes: 1,
                  members: 1,
                  creatorDetails: 1,
                  facilityDetails: 1,
                  paymentStatus: 1,
                },
              },
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      let evendata = {
        eventList: eventList,
        total: total || 0,
      };

      return SendResponse(
        res,
        {
          evendata: evendata,
        },
        "Event list",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download User Events list
  downloadEventsList: async (req, res) => {
    try {
      let { search, status, sort } = req.query;
      let params = {};
      let sortparam = { createdAt: -1 };
      const currentDate = new Date().getTime();
      params = [
        {
          $or: [
            { creatorId: ObjectId(req.params.id) },
            {
              $expr: {
                $in: [ObjectId(req.params.id), "$members"],
              },
            },
          ],
        },
      ];

      if (search != "" && search != null) {
        params.push({
          eventName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }
      if (status != "" && status != null) {
        params.push({
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }
      const eventList = await UserEvent.aggregate([
        {
          $match: params
        },
        {
          $lookup: {
            from: "users",
            let: { creatorId: "$creatorId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$creatorId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  profileImage: 1,
                },
              },
            ],
            as: "creatorDetails",
          },
        },
        {
          $unwind: {
            path: "$creatorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            creatorId: 1,
            eventName: 1,
            eventType: 1,
            eventId: 1,
            teamId: 1,
            opponentName: 1,
            sportId: 1,
            facilityId: 1,
            eventDate: 1,
            startTime: 1,
            endTime: 1,
            notes: 1,
            members: 1,
            address: 1,
            creatorDetails: "$creatorDetails",
            paymentStatus: 1,
          },
        },
        {
          $sort : sortparam
        }
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Event Id",
        "Event Name",
        "Event Type",
        "Event Date",
        "Event Organizer",
        "Event Location",
        "No of Attendees",
        "Status",
        "Payment Status",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Events.xlsx";
      
      //get wanted params by mapping
      const result = eventList.map((val, index) => {
        return [
          index + 1,
          val.eventId,
          val.eventName,
          capitalizeFirstLetter(val.eventType),
          new Date(val.eventDate),
          val.creatorDetails ? val.creatorDetails.fullName : '',
          val.address ? val.address : '',
          val.members.length,
          val.isComplete == true
            ? "Completed"
            : new Date(val.eventDate) > currentDate
            ? "Upcoming"
            : "In Progress",
          val.paymentStatus == 1 ? "Pending" : "Paid",
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },
  
  userTrainingsBookingList: async(req, res) =>{
    try{
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = {
          userId : ObjectId(req.params.id)
      };
      let sortparam = { startDate: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
          $or: [
            {
              bookingId: parseInt(req.query.search),
            },
            {
              'facilityBranchDetails.name': { $regex: ".*" + search + ".*", $options: "i" },
            }
          ],
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { startDate: 1 } : { startDate: -1 };
      }

      const [{ trainingBookings, total }] = await TrainingBooking.aggregate([
        {
          $lookup : {
            from : "facilitybranches",
            localField : "facilityId",
            foreignField : "_id",
            as : "facilityBranchDetails"
          },
        },
        {
           $unwind : {
            path : "$facilityBranchDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "sportId",
            foreignField: "_id",
            as: "sportDetails",
          },
        },
        {
          $unwind : {
            path : "$sportDetails"
          }
        },
        {
          $lookup : {
            from: "trainings",
            let: { 'trainingId' : '$trainingId'},
            pipeline : [
              { 
                $match : {
                  $expr: {
                    $eq: [ '$_id', '$$trainingId']
                  }
                }
              },
              {
                $project : {
                  _id : 1,
                  trainingName : 1,
                }
              }
            ],
            as : "trainingDetails"
          }
        },
        {
          $unwind : {
            path : "$trainingDetails"
          }
        },
        {
          $facet: {
            total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
            trainingBookings: [
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  bookingId: 1,
                  bookingFor: 1,
                  userId: 1,
                  familyMember: 1,
                  trainingId: 1,
                  facilityId: 1,
                  trainingDetails: "$trainingDetails",
                  facilityBranchDetails: "$facilityBranchDetails",
                  sportDetails: "$sportDetails",
                  paymentId: 1,
                  paymentInfo: 1,
                  startDate: 1,
                  endDate: 1,
                  totalPrice: 1,
                  currency: 1,
                  createdAt: 1,
                  updatedAt: 1
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: { gt: [{ $size: "$total" }, 0] },
                then: { $arrayElemAt: ["$total.count", 0] },
                else: 0,
              },
            },
          },
        },
      ]);
      return SendResponse(res, { trainingBookings: trainingBookings, total: total }, "User Training Bookings List", 200);

    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download User Training Bookings list
  downloadTrainingBookingList: async (req, res) => {
    try {
      let { search, status, sort } = req.query;
      let params = {
          userId : ObjectId(req.params.id),
          // familyMember : ObjectId(req.params.id)
      };
      let sortparam = { startDate: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
          $or: [
            {
              bookingId: parseInt(req.query.search),
            },
            {
              'facilityBranchDetails.name': { $regex: ".*" + search + ".*", $options: "i" },
            }
          ],
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { startDate: 1 } : { startDate: -1 };
      }
      const trainingBookings = await TrainingBooking.aggregate([
        {
          $lookup : {
            from : "facilitybranches",
            localField : "facilityId",
            foreignField : "_id",
            as : "facilityBranchDetails"
          },
        },
        {
           $unwind : {
            path : "$facilityBranchDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "sportId",
            foreignField: "_id",
            as: "sportDetails",
          },
        },
        {
          $unwind : {
            path : "$sportDetails"
          }
        },
        {
          $lookup : {
            from: "trainings",
            let: { 'trainingId' : '$trainingId'},
            pipeline : [
              { 
                $match : {
                  $expr: {
                    $eq: [ '$_id', '$$trainingId']
                  }
                }
              },
              {
                $project : {
                  _id : 1,
                  trainingName : 1,
                }
              }
            ],
            as : "trainingDetails"
          }
        },
        {
          $unwind : {
            path : "$trainingDetails"
          }
        },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            bookingFor: 1,
            userId: 1,
            familyMember: 1,
            trainingId: 1,
            facilityId: 1,
            paymentId: 1,
            paymentInfo: 1,
            trainingDetails: "$trainingDetails",
            facilityBranchDetails: "$facilityBranchDetails",
            sportDetails: "$sportDetails",
            totalPrice: 1,
            currency: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1,
            updatedAt: 1
          },
        },
      ]);
      let workSheetColumnName;
      if(req.query.type == "finances"){
        // set xls Column Name
        workSheetColumnName = [
          "Payment Id",
          "Payment type",
          "Payment for",
          "Facility name",
          "Type of booking",
          "Coaching Type",
          "Booking Date & Time",
          "Amount",
          "Payment Status"
        ];
      }else{
        // set xls Column Name
        workSheetColumnName = [
          "Booking Id",
          "Facility name",
          "Type of booking",
          "Coaching Type",
          "Booking Date & Time",
          "Booking Status"
        ];
      }
      

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "TrainingBookings.xlsx";
      
      if(req.query.type == "finances"){
         //get wanted params by mapping
        result = trainingBookings.map((val, index) => {
          return [
            val.paymentId,
            "Card",
            "Training booking",
            val.facilityBranchDetails.name,
            "Coaching/TrainingSesiions",
            val.sportDetails.sports_name,
            new Date(val.createdAt),
            `${Number(val.totalPrice)} ${val.currency}`,
            "Confirmed",
          ];
        });
      }else{
         //get wanted params by mapping
        result = trainingBookings.map((val, index) => {
          return [
            val.bookingId,
            val.facilityBranchDetails.name,
            "Coaching/TrainingSesiions",
            val.sportDetails.sports_name,
            new Date(val.createdAt),
            "Done",
          ];
        });
      }
     

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  userEventBookingList: async(req, res) =>{
    try{
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = {
          members : { $in : [ObjectId(req.params.id)]},
          creatorId : { $ne : ObjectId(req.params.id) },
      };
      let sortparam = { eventDate : -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
              eventName: { $regex: ".*" + search + ".*", $options: "i" }
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { eventDate: 1 } : { eventDate: -1 };
      }

      const [{ eventBookings, total }] = await UserEvent.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "sportId",
            foreignField: "_id",
            as: "sportDetails",
          },
        },
        {
          $unwind : {
            path : "$sportDetails"
          }
        },
        {
          $lookup : {
            from: "members",
            let: { 'eventId' : '$_id'}, 
            pipeline: [
              {
                $match : {
                  memberId : ObjectId(req.params.id),
                  isEventMember  : true,
                  $expr : {
                    $eq : [ '$eventId', '$$eventId']
                  },
                  requestStatus : 2,
                  // status: true
                }
              },
              {
                $project : {
                  _id : 1,
                  memberId  : 1,
                  isEventMember : 1,
                  eventId : 1,
                  requestStatus : 1,
                  expenseContribution : 1,
                  currencyCode : 1, 
                  SplitPaymentBy : 1, 
                  paymentScreenshots : 1,
                  paymentReceiptStatus : 1,
                  paymentReceiptUploadTime : {
                    $toDate: "$paymentReceiptUploadTime"
                  },
                  paymentNotes : 1,
                  status: 1
                }
              }
            ],
            as : "memberDetails"
          }
        },
        {
          $unwind : {
            path : "$memberDetails"
          }
        },
        {
          $facet: {
            total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
            eventBookings: [
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  eventId: 1,
                  eventName: 1,
                  eventType: 1,
                  sportId: 1,
                  eventDate: 1,
                  status: 1,
                  sportDetails: "$sportDetails",
                  memberDetails: "$memberDetails",
                  currencyCode: 1,
                  startTime: 1,
                  endTime: 1,
                  createdAt: 1,
                  updatedAt: 1
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: { gt: [{ $size: "$total" }, 0] },
                then: { $arrayElemAt: ["$total.count", 0] },
                else: 0,
              },
            },
          },
        },
      ]);
      return SendResponse(res, { eventBookings: eventBookings, total: total }, "User Event Bookings List", 200);

    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download User Event Bookings list
  downloadEventBookingList: async (req, res) => {
    try {
      let { search, status, sort } = req.query;
      let params = {
        members : { $in : [ObjectId(req.params.id)]},
        creatorId : { $ne : ObjectId(req.params.id) },
    };
    let sortparam = { eventDate : -1 };

    if (search != "" && search != null) {
      params = Object.assign(params, {
            eventName: { $regex: ".*" + search + ".*", $options: "i" }
      });
    }
    if (status != "" && status != null) {
      params = Object.assign(params, {
        status: status == "active" ? true : false,
      });
    }

    if (sort != "" && sort != null) {
      sortparam = sort == "asc" ? { eventDate: 1 } : { eventDate: -1 };
    }
      const eventBookings = await UserEvent.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "sportId",
            foreignField: "_id",
            as: "sportDetails",
          },
        },
        {
          $unwind : {
            path : "$sportDetails"
          }
        },
        {
          $lookup : {
            from: "members",
            let: { 'eventId' : '$_id'}, 
            pipeline: [
              {
                $match : {
                  memberId : ObjectId(req.params.id),
                  isEventMember  : true,
                  $expr : {
                    $eq : [ '$eventId', '$$eventId']
                  },
                  requestStatus : 2
                }
              },
              {
                $project : {
                  _id : 1,
                  memberId  : 1,
                  isEventMember : 1,
                  eventId : 1,
                  requestStatus : 1,
                  expenseContribution : 1,
                  currencyCode : 1, 
                  SplitPaymentBy : 1, 
                  paymentScreenshots : 1,
                  paymentReceiptStatus : 1,
                  paymentReceiptUploadTime : {
                    $toDate: "$paymentReceiptUploadTime"
                  },
                  paymentNotes : 1
                }
              }
            ],
            as : "memberDetails"
          }
        },
        {
          $unwind : {
            path : "$memberDetails"
          }
        },
        {
          $project: {
            _id: 1,
            eventId: 1,
            eventName: 1,
            eventType: 1,
            sportId: 1,
            eventDate: 1,
            status: 1,
            sportDetails: "$sportDetails",
            memberDetails: "$memberDetails",
            currencyCode: 1,
            startTime: 1,
            endTime: 1,
            createdAt: 1,
            updatedAt: 1
          },
        },
      ]);
      
      let workSheetColumnName;
      if(req.query.type == 'finances'){
         // set xls Column Name
        workSheetColumnName = [
          "Sr.no.",
          "Payment for",
          "Type of booking",
          "Event Type",
          "Event Date & Time",
          "Amount",
          "Payment Status"
        ];
      }else{
         // set xls Column Name
        workSheetColumnName = [
          "Sr.no.",
          "Event name",
          "Type of booking",
          "Event Type",
          "Event Date & Time",
          "Booking Status"
        ];
      }
     

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "EventBookings.xlsx";
      let result;
      if(req.query.type == "finances"){
        //get wanted params by mapping
        result = eventBookings.map((val, index) => {
          return [
            index + 1,
            "Part of split payment",
            "Event",
            val.sportDetails.sports_name,
            new Date(val.startTime),
            `${val.memberDetails.expenseContribution} ${val.currencyCode}`,
            `${val.memberDetails.paymentReceiptStatus == 1 ? "Pending" : (val.memberDetails.paymentReceiptStatus == 2 ? "Paid" : (val.memberDetails.paymentReceiptStatus == 3 ? "Confirmed" : "" ) )}`,
          ];
        });
      }else{
         //get wanted params by mapping
          result = eventBookings.map((val, index) => {
            return [
              index + 1,
              val.eventName,
              "Event",
              val.sportDetails.sports_name,
              new Date(val.startTime),
              "Confirmed",
            ];
          });
      }
      
      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

};
function capitalizeFirstLetter(string) {
  const name = string.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
  return name;
}
