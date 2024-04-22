const { Mongoose } = require("mongoose");
const Boom = require("boom");
const User = require("../../models/user");
const UserTeam = require("../../models/userteam");
const UserEvent = require("../../models/event");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const constant = require("../../constants");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../apiHandler");
const {dump} = require("../../services/dump");
const moment = require("moment");
const XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");
const member = require("../../models/member");

module.exports = {
  //*******User list********** */
  list: async (req, res) => {
    try {
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = { };
      let sortparam = { createdAt: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
              teamName: { $regex: ".*" + search + ".*", $options: "i" },
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

      const [{ team, total }] = await UserTeam.aggregate([
        {
          $match: params,
        },
        {
            $lookup: {
              from: "members",
              let: {
                userId: "$members",
                teamId: "$_id",
              },
              pipeline: [{
                  $match: {
                    $and: [{
                        $expr: {
                          $in: ["$memberId", "$$userId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$teamId", "$$teamId"],
                        },
                      },
                      {
                        requestStatus: 2,
                      },
                      {
                        status: true
                      }
                    ],
                  },
                },
                {
                  $project: {
                    _id: 1,
                    memberId: 1,
                    fullName: 1,
                    email: 1,
                    profileImage: "$image",
                    requestStatus: 1,
                    teamId: 1,
                    status: 1
                  },
                },
              ],
              as: "memberDetails",
            },
        },
        {
          $lookup : {
            from : "users",
            localField: "user_id",
            foreignField: "_id",
            as : "teamCraetorDetails"
          }
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
          $facet: {
            total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
            team: [
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
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
                    aboutCreator: 1,
                    creatorIsAdmin: 1,
                    memberDetails: "$memberDetails",
                    members: 1,
                    admins: 1,
                    sport: "$sportDetails",
                    colour: "$teamColourDetails",
                    teamCreatorDetails : "$teamCreatorDetails"
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
      
      return SendResponse(res, { team: team, total: total }, "Teams List", 200);
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

  // Download Teams List

  downloadTeamList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" , status, search} = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = { };

      if (search != "" && search != null) {
        params = Object.assign(params, {
              teamName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      const teamList = await UserTeam.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              teamId: "$_id",
            },
            pipeline: [{
                $match: {
                  $and: [{
                      $expr: {
                        $in: ["$memberId", "$$userId"],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$teamId", "$$teamId"],
                      },
                    },
                    {
                      requestStatus: 2,
                    },
                    {
                      status: true
                    }
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  memberId: 1,
                  fullName: 1,
                  email: 1,
                  profileImage: "$image",
                  requestStatus: 1,
                  teamId: 1,
                  status: 1
                },
              },
            ],
            as: "memberDetails",
          },
        },
        {
          $lookup : {
            from : "users",
            localField: "user_id",
            foreignField: "_id",
            as : "teamCraetorDetails"
          }
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
            aboutCreator: 1,
            creatorIsAdmin: 1,
            memberDetails: "$memberDetails",
            members: 1,
            admins: 1,
            sport: "$sportDetails",
            colour: "$teamColourDetails",
            teamCreatorDetails : "$teamCreatorDetails"
          },
        },
        {
          $sort: sort ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Team Name",
        "Date & Time",
        "Sports Type",
        "Country",
        "State",
        "City"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Team.xlsx";

      const options = {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      };

      //get wanted params by mapping
      const result = teamList.map((val, index) => {
        return [
          index + 1,
          val.teamName,
          (new Date(val.createdAt)).toLocaleString("en-US", options),
          val.sport ? val.sport.sports_name : '',
          val.country != null ? val.country : '',
          val.state != null ? val.state : '',
          val.city != null ? val.city : '',
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
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
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

  teamDetails : async(req, res) => {
    try{
       let team = await UserTeam.findById(req.params.id);

       if(!team) {
         return SendResponse(
          res,
          { isBoom : true },
          "No team found",
          500
         );
        }

        const [data] = await UserTeam.aggregate([
          {
            $match : { _id : ObjectId(req.params.id )}
          },
          {
            $lookup : {
              from : "users",
              foreignField : "_id",
              localField : "user_id",
              as : "teamCreatorDetails"
            }
          },
          {
            $lookup: {
              from: "members",
              let: {
                userId: "$members",
                teamId: "$_id",
              },
              pipeline: [{
                  $match: {
                    $and: [{
                        $expr: {
                          $in: ["$memberId", "$$userId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$teamId", "$$teamId"],
                        },
                      },
                      {
                        requestStatus: 2,
                      },
                      {
                        status : true
                      }
                    ],
                  },
                },
                {
                  $project: {
                    _id: 1,
                    memberId: 1,
                    fullName: 1,
                    email: 1,
                    profileImage: "$image",
                    requestStatus: 1,
                    teamId: 1,
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
            $project : {
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
              aboutCreator: 1,
              creatorIsAdmin: 1,
              memberDetails: "$memberDetails",
              members: 1,
              admins: 1,
              sport: "$sportDetails",
              colour: "$teamColourDetails",
              teamCreatorDetails : "$teamCreatorDetails"
            }
          }
        ]);

      return SendResponse(
        res,
        { teamDetails : data },
        "Team Details",
        200
      );
    }
    catch (err){
      dump(err);
      return SendResponse (
        res,
        { isBoom : true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  getTeamMembersList : async(req, res) => {
    try{
      let team = await UserTeam.findById(req.params.id);
      if(!team) {
        return SendResponse(
         res,
         { isBoom : true },
         "No team found",
         500
        );
      }
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = { };
      let sortparam = { createdAt: -1 };
      params = {
        $and: [{
            $expr: {
              $in: ["$memberId", team.members ],
            },
          },
          {
            $expr: {
              $eq: ["$teamId", ObjectId(team._id)],
            },
          },
          {
            requestStatus: 2,
          },
          {
            status: true
          }
        ],
      };
      if (search != "" && search != null) {
        params = Object.assign(params, {
          fullName: { $regex: ".*" + search + ".*", $options: "i" },
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

      const [{ members, total }] = await member.aggregate([
        {
          $match: params,
        },
        {
          $facet: {
            total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
            members: [
              { $sort: sortparam },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  memberId: 1,
                  fullName: 1,
                  email: 1,
                  profileImage: "$image",
                  requestStatus: 1,
                  teamId: 1,
                  createdAt: 1,
                  status: 1
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
      return SendResponse(res, { members, total: total }, "Members List", 200);
    }catch (err){
      dump(err);
      return SendResponse (
        res,
        { isBoom : true },
        "Something wents wrong, please try again",
        500
      );
    }
  }

}