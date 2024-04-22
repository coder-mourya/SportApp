const UserTeam = require("../../../../models/userteam");
const Member = require("../../../../models/member");
const User = require("../../../../models/user");
const Colours = require("../../../../models/colourCode");
const Notification = require("../../../../models/notification");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Sport = require("../../../../models/sport");
const Chat = require("../../../../models/chat");
const express = require("express");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const mail = require("../../../../services/mailServices");
const FileUpload = require("../../../../services/upload-file");
const { log } = require("firebase-functions/logger");
const pushNotification = require("../../../../firebase/index");
const XLSX = require("xlsx");
const xl = require("excel4node");
var path = require("path");
var mime = require("mime-types");
var fs = require("fs");
const { dump } = require("../../../../services/dump");
const chatmessage = require("../../../../models/chatmessage");

module.exports = {
  //********** Get Team Colour Codes Listing**** */
  TeamColoursList: async (req, res) => {
    try {
      let colours_list = await Colours.find();
      return SendResponse(
        res,
        {
          colours_list: colours_list,
        },
        "Colours list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //************Create Team*********** */
  createTeam: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        teamName: "required",
        sports_id: "required",
        country: "required",
        // state: "required",
        // city: "required",
        teamColour_id: "required",
        aboutCreator: "required",
        jerseySize: "required",
        pantSize: "required",
        nameOnJersey: "required",
        numberOnJersey: "required",
        creatorIsAdmin: "required",
        expectations: "nullable",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }
      if (!(await Sport.findById(req.body.sports_id)))
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Sport id does not exist",
          422
        );
      if (!(await Colours.findById(req.body.teamColour_id)))
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team Colour id does not exist",
          422
        );
      let data = req.body;
      data.user_id = req.user.id;

      if (!req.files) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "The file field is required",
          422
        );
      }
      if (
        await UserTeam.findOne({
          // teamName: new RegExp("^" + req.body.teamName),
          teamName: req.body.teamName,
          user_id: ObjectId(req.user.id),
        })
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team name already created",
          422
        );
      let coverPhoto;
      let logo;
      let creatorImage;
      if (req.files && req.files.coverPhoto) {
        let coverImage = await FileUpload.aws(req.files.coverPhoto);
        coverPhoto = coverImage.Key;
      }

      if (req.files && req.files.logo) {
        let logoImage = await FileUpload.aws(req.files.logo);
        logo = logoImage.Key;
      }
      if (req.files && req.files.creatorImage) {
        let creatorImageObject = await FileUpload.aws(req.files.creatorImage);
        creatorImage = creatorImageObject.Key;

        // await User.findByIdAndUpdate(req.user.id, {
        //   $set: {
        //     profileImage: process.env.AWS_URL + creatorImage,
        //   },
        // });

        // await Member.update(
        //   {
        //     memberId: ObjectId(req.user.id),
        //   },
        //   {
        //     $set: {
        //       image: process.env.AWS_URL + creatorImage,
        //     },
        //   }
        // );
      }

      let user = await User.findById(req.user.id);
      let members = [ObjectId(req.user.id)];

      let admins =
        req.body.creatorIsAdmin == "true" ? [ObjectId(req.user.id)] : [];
      let teamData = {
        teamName: req.body.teamName,
        tagLine: req.body.tagLine ? req.body.tagLine : "",
        sports_id: req.body.sports_id,
        country: req.body.country,
        state: req.body.state ? req.body.state : null,
        city: req.body.city ? req.body.city : null,
        teamColour_id: req.body.teamColour_id,
        coverPhoto: process.env.AWS_URL + coverPhoto,
        logo: process.env.AWS_URL + logo,
        user_id: req.user.id,
        members: members,
        admins: admins,
        aboutCreator: {
          creatorImage: process.env.AWS_URL + creatorImage,
          aboutCreator: req.body.aboutCreator,
          pantSize: req.body.pantSize,
          jerseySize: req.body.jerseySize,
          nameOnJersey: req.body.nameOnJersey,
          numberOnJersey: req.body.numberOnJersey,
          expectations: req.body.expectations,
        },
        creatorIsAdmin: req.body.creatorIsAdmin == "true" ? true : false,
      };
      const joiningDate = Date.now();
      const team = await UserTeam.create(teamData);
      let groupChat = await Chat.create({
        senderId: req.user.id,
        chatType: 2, //team group
        teamId: team._id,
        members: [{ id : ObjectId(req.user.id), status : true , joiningDate : joiningDate }],
        admins: req.body.creatorIsAdmin == "true" ? [{ id : ObjectId(req.user.id), status : true,joiningDate : joiningDate}] : [],
        messageType: 7, //
        lastMessage: `${req.user.fullName} created this group`,
      });
      await chatmessage.create({
        roomId: groupChat.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 2,
        messageType: 6,
        message: `${req.user.fullName} joined this group`,
        teamMemberDetails: {
          name : `${req.user.fullName}`,
          expectations: req.body.expectations,
          image: process.env.AWS_URL + creatorImage,
          aboutMe: req.body.aboutCreator,
        },
      });
      if (req.body.creatorIsAdmin == "true") {
        let adminGroupChat = await Chat.create({
          senderId: req.user.id,
          chatType: 3, //team admin's group
          teamId: team._id,
          members: [{ id : ObjectId(req.user.id), status : true , joiningDate : joiningDate}],
          admins: [{ id : ObjectId(req.user.id), status : true , joiningDate : joiningDate}],
          messageType: 7,
          lastMessage: `${req.user.fullName} created this group`,
          status: false
        });
        await chatmessage.create({
          roomId: adminGroupChat.roomId,
          senderId: req.user.id,
          senderType: "user",
          chatType: 3,
          messageType: 6,
          message: `${req.user.fullName} joined this group`,
          teamMemberDetails: {
            name : `${req.user.fullName}`,
            expectations: req.body.expectations,
            image: process.env.AWS_URL + creatorImage,
            aboutMe: req.body.aboutCreator,
          },
        });
      }

      await Member.create({
        creatorId: user._id,
        memberId: user._id,
        isTeamMember: true,
        image: process.env.AWS_URL + creatorImage,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        countryAlphaCode: user.phoneCode,
        countryCode: user.phoneNumericCode,
        teamId: team._id,
        requestStatus: 2,
        aboutCreator: {
          creatorImage: process.env.AWS_URL + creatorImage,
          aboutCreator: req.body.aboutCreator,
          pantSize: req.body.pantSize,
          jerseySize: req.body.jerseySize,
          nameOnJersey: req.body.nameOnJersey,
          numberOnJersey: req.body.numberOnJersey,
          expectations: req.body.expectations,
        },
        isAdmin: true,
      });
      return SendResponse(
        res,
        {
          team: team,
        },
        "Team Created successfully",
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

  //******** Get User Team List ***********/
  myTeamList: async (req, res) => {
    try {
      //We will retrieve the list of all teams which the user has created or in which he is a member either in pending requestStatus or accepted requestStatus
      var date = new Date();
      date.setMonth(date.getMonth() - 3);

      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = { status: true };

      let pendingTeamParams = {};
      pendingTeamParams = Object.assign(pendingTeamParams, {
        memberId: ObjectId(req.user.id),
        requestStatus: 1,
        isTeamMember: true,
        isFamilyMember: false,
        isEventMember: false,
        isNormalMember: false,
        status: true,
      });

      // Get all the teams Ids in pending requestStatus
      let members = await Member.find(pendingTeamParams).sort({
        createdAt: -1,
      });
      // .skip(skipIndex).limit(limit)

      let teamIds = [];
      members.forEach((member) => {
        if (!teamIds.find((item) => item.teamId === member.teamId))
          teamIds.push({
            teamId: member.teamId,
          });
      });

      params = [
        {
          $or: [
            {
              user_id: ObjectId(req.user.id),
            },
            {
              $expr: {
                $in: [ObjectId(req.user.id), "$members"],
              },
            },
            {
              _id: {
                $in: teamIds.map((member) => member.teamId),
              },
            },
          ],
        },
        {
          createdAt: {
            $gte: date,
          },
        },
        {
          status: true,
        },
      ];

      if (req.query.myTeams && req.query.myTeams == "true") {
        params = [
          {
            user_id: ObjectId(req.user.id),
          },
          {
            createdAt: {
              $gte: date,
            },
          },
          {
            status: true,
          },
        ];
      }

      if (req.query.search != "" && req.query.search != null) {
        params.push({
          teamName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ teamList, total }] = await UserTeam.aggregate([
        {
          $match: {
            $and: params,
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              teamId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
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
                  email: 1,
                  profileImage: "$image",
                  requestStatus: 1,
                  teamId: 1,
                  status: 1,
                },
              },
            ],
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              userId: "$user_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                },
              },
            ],
            as: "creatorDetails",
          },
        },
        { $unwind: "$creatorDetails" },
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
                  coverPhoto: 1,
                  logo: 1,
                  user_id: 1,
                  aboutCreator: 1,
                  creatorIsAdmin: 1,
                  memberDetails: "$memberDetails",
                  creatorDetails: "$creatorDetails",
                  members: 1,
                  admins: 1,
                  isPending: {
                    $cond: {
                      if: {
                        $in: [ObjectId(req.user.id), "$members"],
                      },
                      then: false,
                      else: true,
                    },
                  },
                  sport: "$sportDetails",
                  colour: "$teamColourDetails",
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
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
  //add team member
  addMemberInTeam: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        // fullName: "required",
        // mobile: "required",
        teamId: "required",
        // email: "required",
        // isAdmin: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      // if (!req.files) {
      //   return SendResponse(
      //     res,
      //     {
      //       isBoom: true,
      //     },
      //     "The file field is required",
      //     422
      //   );
      // }

      //check team is created or not
      let team = await UserTeam.findById(req.body.teamId).populate("sports_id");
      if (!team)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team not found",
          422
        );

      if (!team.members.includes(ObjectId(req.user.id))) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "You are no longer part of this team",
          422
        );
      }

      if (req.body.memberId) {
        let memberDetails = await Member.findById(req.body.memberId);

        // if(memberDetails.memberId != null){
        let memberData = await Member.findOne({
          teamId: ObjectId(req.body.teamId),
          email: memberDetails.email,
          // memberId: memberDetails.memberId,
          requestStatus: {
            $in: [1, 2],
          },
        });

        if (memberData) {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "This user already a member of this team or already requested",
            422
          );
        }
        // }

        let teamMember = {
          memberId: memberDetails.memberId,
          isTeamMember: true,
          image: memberDetails.image,
          fullName: memberDetails.fullName,
          email: memberDetails.email,
          mobile: memberDetails.mobile,
          countryAlphaCode: memberDetails.countryAlphaCode,
          countryCode: memberDetails.countryCode,
          teamId: team._id,
          creatorId: req.user.id,
        };
        let insertedMember = await Member.create(teamMember);

        //send notification to member to accept request if he is registered as user on platform
        let isMemberRegisteredAsUser = await User.findOne({
          email: memberDetails.email,
          isDeleted: false,
          status: true,
        });
        if (
          isMemberRegisteredAsUser &&
          isMemberRegisteredAsUser.deviceToken &&
          isMemberRegisteredAsUser.deviceToken != null &&
          isMemberRegisteredAsUser.deviceToken != ""
        ) {
          let data = {
            title: "Team Invitation Request",
            message: `You have been invited to join ${team.teamName} team`,
            teamId: team._id.toString(),
            memberId: insertedMember._id.toString(),
            email: insertedMember.email,
            type: "teamInvitationRequest",
          };

          await pushNotification.sendNotification(
            isMemberRegisteredAsUser.deviceToken,
            data
          );
          await Notification.create({
            title: data.title,
            message: data.message,
            receiverEmail: data.email,
            teamId: data.teamId,
            senderId: req.user.id,
            receiverId: isMemberRegisteredAsUser._id,
            type: data.type,
            senderType: "user",
          });
        }

        //send email to member to accept reauest
        let mailSend = mail.sendTemplate({
          email: insertedMember.email,
          subject: `Request to join team ${team.teamName}`,
          locale: "en",
          template: "teamInvitation.ejs",
          adminName: req.user.fullName,
          memberName: insertedMember.fullName,
          teamName: team.teamName,
          tagLine: team.tagLine,
          sportsName: team.sports_id.sports_name,
          link: `${process.env.Url}/api/v1/user/team/request/${team._id}/${insertedMember.email}/${insertedMember._id}`,
          // html: `Hi ${insertedMember.fullName}, <br><br>${req.user.fullName} sent you a request to join the team.<br><br>
          //       <a href= "${process.env.Url}/api/v1/user/team/request/${team._id}/${insertedMember.email}/${insertedMember._id}">Click here</a><br><br>
          //       To join the team.
          //       <br><br>
          //       Thanks & Regards,
          //       <br>
          //       Sports Nerve Team
          //       `,
        });

        if (!mailSend) {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "Internal server error",
            500
          );
        } else {
          return SendResponse(
            res,
            {},
            "Invitation has been sent to member successfully",
            200
          );
        }
      } else {
        //check user already a member
        let memberData = await Member.findOne({
          teamId: ObjectId(req.body.teamId),
          email: req.body.email,
          requestStatus: {
            $in: [1, 2],
          },
        });
        if (memberData)
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "This user already a member of this team or already requested",
            422
          );

        const user = await User.findOne({
          email: req.body.email,
          isDeleted: false,
          status: true,
        });
        if (user) {
          req.body.memberId = user._id;
        }

        let image;
        if (req.files && req.files.image) {
          let Image = await FileUpload.aws(req.files.image);
          image = Image.Key;
          req.body.image = process.env.AWS_URL + image;
        }

        req.body.creatorId = team.user_id;
        req.body.isTeamMember = true;

        let member = await Member.create(req.body);

        if (user) {
          //send notification to member to accept request if he is registered as user on platform
          let data = {
            title: "Team Invitation Request",
            message: `You have been invited to join ${team.teamName} team`,
            teamId: team._id.toString(),
            memberId: member._id.toString(),
            email: req.body.email,
            type: "teamInvitationRequest",
          };

          await pushNotification.sendNotification(user.deviceToken, data);
          await Notification.create({
            title: data.title,
            message: data.message,
            receiverEmail: data.email,
            teamId: data.teamId,
            senderId: req.user.id,
            receiverId: user._id,
            type: data.type,
            senderType: "user",
          });
        }

        //send email to member to accept reauest
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: `Request to join team ${team.teamName}`,
          locale: "en",
          template: "teamInvitation.ejs",
          adminName: req.user.fullName,
          memberName: req.body.fullName,
          teamName: team.teamName,
          tagLine: team.tagLine,
          sportsName: team.sports_id.sports_name,
          link: `${process.env.Url}/api/v1/user/team/request/${team._id}/${req.body.email}/${member._id}`,
          // html: `Hi ${req.body.fullName}, <br><br>${req.user.fullName} sent you a request to join the team.<br><br>
          //     <a href= "${process.env.Url}/api/v1/user/team/request/${team._id}/${req.body.email}/${member._id}">Click here</a><br><br>
          //     To join the team.
          //     <br><br>
          //     Thanks & Regards,
          //     <br>
          //     Sports Nerve Team
          //     `,
        });
        if (!mailSend) {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "Internal server error",
            500
          );
        }

        return SendResponse(
          res,
          {
            member: member,
          },
          "Invitation has been sent to member successfully",
          200
        );
      }
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
  //get team details/${req.body.deepLink}
  teamDetails: async (req, res) => {
    try {
      let [teamDetails] = await UserTeam.aggregate([
        {
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
            pipeline: [
              {
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
                      requestStatus: {
                        $in: [1, 2],
                      },
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
                  status: 1,
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
            sport: "$sportDetails",
            colour: "$teamColourDetails",
          },
        },
      ]);
      let teamGroupExit = await Chat.findOne({
        teamId : ObjectId(req.params.teamId),
        chatType : 2
      }).lean();

      let teamAdminGroupExit = await Chat.findOne({
        teamId : ObjectId(req.params.teamId),
        chatType : 3,
        status : true
      }).lean();


      let team = await UserTeam.findById(req.params.teamId);
      teamDetails.teamGroupchat = teamGroupExit;
      if (teamDetails.teamGroupchat && Object.keys(teamDetails.teamGroupchat).length > 0) {
        teamDetails.teamGroupchat.team = team;
      }
      if(team.admins.includes(ObjectId(req.user.id))){
        teamDetails.teamAdminGroupChat = teamAdminGroupExit;
      }
      if (teamDetails.teamAdminGroupChat && Object.keys(teamDetails.teamAdminGroupChat).length > 0) {
          teamDetails.teamAdminGroupChat.team = team;
      }
      return SendResponse(
        res,
        {
          teamDetails: teamDetails,
        },
        "Team details",
        200
      );
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

  //download team members list
  downloadMembersList: async (req, res) => {
    try {
      let [teamDetails] = await UserTeam.aggregate([
        {
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
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $in: ["$memberId", "$$userId"],
                      },
                    },
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
                  status: 1,
                },
              },
            ],
            as: "memberDetails",
          },
        },
        // {
        //   $lookup: {
        //     from: "users",
        //     let: {
        //       userId: "$members",
        //       admins: "$admins",
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $in: ["$_id", "$$userId"],
        //           },
        //         },
        //       },
        //       {
        //         $project: {
        //           _id: 1,
        //           fullName: 1,
        //           profileImage: 1,
        //           email: 1,
        //           isAdmin: {
        //             $cond: {
        //               if: {
        //                 $in: ["$_id", "$$admins"],
        //               },
        //               then: true,
        //               else: false,
        //             },
        //           },
        //           jerseyDetails: 1,
        //           description: 1,
        //         },
        //       },
        //     ],
        //     as: "memberDetails",
        //   },
        // },
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
            sport: "$sportDetails",
            colour: "$teamColourDetails",
          },
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Name",
        "Team Name",
        "Team Sport",
        "Is Admin",
        "Shirt Size",
        "Pant Size",
        "Name on jersey",
        "Number on Jersey",
        "About Me",
        "Expectations from team",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Report.xlsx";

      //get wanted params by mapping
      const result = Object.values(teamDetails.members).map((val, index) => {
        if (val.memberId.toString() == teamDetails.user_id.toString()) {
          return [
            index + 1,
            val.fullName,
            teamDetails.teamName,
            teamDetails.sport.sports_name,
            val.isAdmin == true ? "true" : "false",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.jerseySize
              : "",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.pantSize
              : "",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.nameOnJersey
              : "",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.numberOnJersey
              : "",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.aboutCreator
              : "",
            teamDetails.aboutCreator != null
              ? teamDetails.aboutCreator.expectations
              : "",
          ];
        } else {
          return [
            index + 1,
            val.fullName,
            teamDetails.teamName,
            teamDetails.sport.sports_name,
            val.isAdmin == true ? "true" : "false",
            val.jerseyDetails != null ? val.jerseyDetails.shirt_size : "",
            val.jerseyDetails != null ? val.jerseyDetails.pant_size : "",
            val.jerseyDetails != null ? val.jerseyDetails.name : "",
            val.jerseyDetails != null ? val.jerseyDetails.number : "",
            val.description != null ? val.description : "",
            val.expectations != null ? val.expectations : "",
          ];
        }
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

  //get team details to add member in team invited via email
  getTeamRequestDetails: async (req, res) => {
    try {
      let member = await Member.findById(req.params.memberId);
      if (!member) {
        res.status(422).send("<h1> Request not found </h1>");
      }
      if (
        (member.requestStatus == 2 ||
          member.requestStatus == 3 ||
          member.requestStatus == 4) &&
        member.isNormalMember == true
      ) {
        res.status(422).send("<h1> The link has been expired. </h1>");
      }
      if (member.requestStatus == 2 && member.isTeamMember == true) {
        res.status(422).send("<h1> You are already a member </h1>");
      }
      if (member.requestStatus == 3 && member.isTeamMember == true) {
        res
          .status(422)
          .send(
            "<h1> You have rejected the request. Please contact team creator/admin for a fresh invitation </h1>"
          );
      }

      if (member.requestStatus == 4 && member.isTeamMember == true) {
        res.status(422).send("<h1> The link has been expired. </h1>");
      }

      res
        .status(201)
        .send(
          `<script>window.location.href='${process.env.APP_URL}?teamId=${req.params.teamId}&email=${req.params.email}&memberId=${req.params.memberId}'</script>`
        );
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
  //accept/reject team request
  acceptTeamRequest: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        teamId: "required",
        status: "required|in:accept,reject",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }
      //check team is created or not
      let team = await UserTeam.findById(req.body.teamId);
      if (!team)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team not found",
          422
        );

      let user = await User.findById(req.user.id);

      if (req.body.status == "accept") {
        const joiningDate = Date.now();
        let pushObj = {
          members: ObjectId(req.user.id),
        };
        let chatPushObj = {
          members : { id : ObjectId(req.user.id), status : true , joiningDate : joiningDate }
        }
        // let memberDetails = await Member.findOne({
        //   memberId : ObjectId(req.user.id),
        //   email : user.email,
        //   teamId : ObjectId(req.body.teamId),
        //   requestStatus : 1
        // });

        // if(memberDetails){
        //    memberDetails.requestStatus = 2;
        //    await memberDetails.save();
        // }
        // else{
        //   return SendResponse(
        //     res, {
        //       isBoom: true,
        //     },
        //     "You are no longer part of this team",
        //     422
        //   );
        // }
        if (
          req.body.memberId &&
          req.body.memberId != "null" &&
          req.body.memberId != null
        ) {
          const member = await Member.findOne({
            _id: ObjectId(req.body.memberId),
            teamId: ObjectId(req.body.teamId),
            requestStatus: 1,
          });
          if (!member) {
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              "You are no longer part of this team",
              422
            );
          }
          if (member.isAdmin == true) {
            pushObj.admins = ObjectId(req.user.id);
            chatPushObj.admins = { id : ObjectId(req.user.id), status : true, joiningDate : joiningDate }
          }

          await Member.findByIdAndUpdate(req.body.memberId, {
            $set: {
              requestStatus: 2,
              memberId: req.user.id,
            },
          });
        } else {
          let memberObj = {
            fullName: user.fullName,
            mobile: user.mobile,
            countryAlphaCode: user.phoneCode,
            countryCode: user.phoneNumericCode,
            teamId: req.body.teamId,
            email: user.email,
            memberId: user.id,
            isAdmin: false,
            requestStatus: 2,
            creatorId: team.user_id,
            isTeamMember: true,
          };

          let createMember = await Member.create(memberObj);
        }
        let userTeamUpdate = await UserTeam.updateOne(
          {
            _id: req.body.teamId,
          },
          {
            $push: pushObj,
          }
        );

        await Chat.updateMany({
          teamId : ObjectId(req.body.teamId),
          chatType : { $in : [ 2,3 ]}
        },{
          $push : chatPushObj
        });

        let adminExist = await Chat.findOne({
          teamId : ObjectId(req.body.teamId),
          chatType : 3
        });

        if (adminExist && adminExist.admins && adminExist.admins.length > 1) {
          await Chat.findByIdAndUpdate(adminExist._id, {
            $set: { status: true }
          });
        }
        return SendResponse(
          res,
          {},
          "You have been added to the team successfully",
          200
        );
      }
      if (req.body.status == "reject") {
        if (
          (req.body.memberId && req.body.memberId != "null") ||
          req.body.memberId != null
        ) {
          let memberDetails = await Member.findOne({
            _id: ObjectId(req.body.memberId),
            email: user.email,
            teamId: ObjectId(req.body.teamId),
            requestStatus: 1,
          });

          if (!memberDetails) {
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              "You are no longer part of this team",
              422
            );
          }
          await Member.findByIdAndUpdate(req.body.memberId, {
            $set: {
              requestStatus: 3,
              memberId: req.user.id,
            },
          });
        }

        return SendResponse(res, {}, "Request rejected", 200);
      }
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
  //add normal member to future use
  addNormalMember: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        fullName: "required",
        // countryAlphaCode : "required",
        // countryCode : "required",
        mobile: "required",
        sportId: "required",
        email: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }
      // if (!req.files) {
      //   return SendResponse(
      //     res, {
      //       isBoom: true,
      //     },
      //     "The file field is required",
      //     422
      //   );
      // }

      let userDetails = await User.findById(req.user.id);

      if (userDetails.email == req.body.email) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "You can't add yourself as a member.",
          422
        );
      }

      //check user already a member
      let memberData = await Member.findOne({
        creatorId: ObjectId(req.user.id),
        email: req.body.email,
        requestStatus: {
          $in: [1, 2],
        },
        isNormalMember: true,
      });
      if (memberData)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "This user already a member",
          422
        );

      let sportDetails = await Sport.findById(req.body.sportId);

      const user = await User.findOne({
        email: req.body.email,
      });
      if (user) {
        req.body.memberId = user._id;
        req.body.image = user.profileImage;
      }

      let image;
      if (req.files && req.files.image) {
        let Image = await FileUpload.aws(req.files.image);
        image = Image.key;
        req.body.image = process.env.AWS_URL + image;
      }
      req.body.creatorId = req.user.id;
      req.body.isNormalMember = true;
      req.body.requestStatus = 2;

      let member = await Member.create(req.body);

      //send notification to member if he is registered as user on platform
      let isMemberRegisteredAsUser = await User.findOne({
        email: member.email,
        isDeleted: false,
        status: true,
      });
      if (
        isMemberRegisteredAsUser &&
        isMemberRegisteredAsUser.deviceToken &&
        isMemberRegisteredAsUser.deviceToken != null &&
        isMemberRegisteredAsUser.deviceToken != ""
      ) {
        let data = {
          title: "Added As Member",
          message: `${req.user.fullName} added you as a member`,
          email: req.body.email,
          type: "normalMemberAdded",
        };

        await pushNotification.sendNotification(
          isMemberRegisteredAsUser.deviceToken,
          data
        );
        await Notification.create({
          title: data.title,
          message: data.message,
          receiverEmail: data.email,
          senderId: req.user.id,
          receiverId: isMemberRegisteredAsUser._id,
          type: data.type,
          senderType: "user",
        });
      }

      //send email to member to accept reauest
      let mailSend = mail.sendTemplate({
        email: req.body.email,
        subject: "Join Sports Nerve",
        locale: "en",
        template: "manualMember.ejs",
        name: req.body.fullName,
        adminName: req.user.fullName,
        sportsName: sportDetails.sports_name,
        // html: `Hi ${req.body.fullName}, <br><br>${req.user.fullName} added you as a member.<br><br>
        //     Thanks & Regards,
        //     <br>
        //     Sports Nerve Team
        //     `,
      });
      if (!mailSend) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Internal server error",
          500
        );
      }

      return SendResponse(
        res,
        {
          member: member,
        },
        "Member added successfully",
        200
      );
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
  //get member details to add member  invited via email
  getMemberRequestDetails: async (req, res) => {
    try {
      let member = await Member.findById(req.params.member_id);
      if (!member) res.status(422).send("<h1> Request not found </h1>");
      if (member.requestStatus == 2)
        res.status(422).send("<h1> You are already a member </h1>");

      member.requestStatus = 2;
      member.save();
      res
        .status(201)
        .send(
          `<script>window.location.href='${process.env.APP_URL}?memberId=${req.params.member_id}'</script>`
        );
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
  //accept/reject member  request
  acceptMemberRequest: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        memberId: "required",
        status: "required|in:accept,reject",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      if (req.body.status == "accept") {
        await Member.findByIdAndUpdate(req.body.memberId, {
          $set: {
            requestStatus: 2,
            memberId: req.user.id,
          },
        });
      }
      if (req.body.status == "reject") {
        await Member.findByIdAndUpdate(req.body.memberId, {
          $set: {
            requestStatus: 3,
            memberId: req.user.id,
          },
        });
      }

      return SendResponse(
        res,
        {},
        "Request " + req.body.status == "accept" ? "Accepted" : "Rejected",
        200
      );
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
  //get all members
  getAllMembers: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;

      let teams = await UserTeam.aggregate([
        {
          $match: {
            $expr: {
              $in: [ObjectId(req.user.id), "$admins"],
            },
          },
        },
      ]);
      let teamIds = [];
      teams.forEach((team) => {
        if (!teamIds.find((item) => item._id === team._id))
          teamIds.push(team._id);
      });
      let params = {};
      let allMembers = [
        {
          creatorId: ObjectId(req.user.id),
          memberId: { $ne: ObjectId(req.user.id) },
          // requestStatus: {
          //   $in: [1, 2]
          // },
          requestStatus: 2,
          isNormalMember: true,
          isFamilyMember: false,
          isEventMember: false,
          isTeamMember: false,
          status: true,
        },
        {
          creatorId: ObjectId(req.user.id),
          memberId: { $ne: ObjectId(req.user.id) },
          requestStatus: 2,
          isTeamMember: true,
          isFamilyMember: false,
          isEventMember: false,
          isNormalMember: false,
          status: true,
        },
      ];

      if (req.query.event && req.query.event == "true") {
        allMembers.push({
          teamId: { $in: teamIds },
          memberId: { $ne: ObjectId(req.user.id) },
          requestStatus: 2,
          isTeamMember: true,
          isFamilyMember: false,
          isEventMember: false,
          isNormalMember: false,
          status: true,
        });
      }

      params = Object.assign(params, {
        $or: allMembers,
      });

      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          fullName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      // let memberList = await Member.aggregate([{
      //     $match: {
      //       _id: {
      //         $in: teamMemberIds.map(member => ObjectId(member._id))
      //       }
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "user_teams",
      //       as: "TeamDetails",
      //       let: {
      //         teamId: "$teamId",
      //       },
      //       pipeline: [{
      //           $match: {
      //             $expr: {
      //               $eq: ["$_id", "$$teamId"],
      //             },
      //           },
      //         },
      //         {
      //           $lookup: {
      //             from: "sports",
      //             let: {
      //               sportsId: "$sports_id",
      //             },
      //             pipeline: [{
      //               $match: {
      //                 $expr: {
      //                   $eq: ["$_id", "$$sportsId"],
      //                 },
      //               },
      //             }, ],
      //             as: "TeamSportsDetails",
      //           },
      //         },
      //         {
      //           $unwind: {
      //             path: "$TeamSportsDetails",
      //             preserveNullAndEmptyArrays: true,
      //           },
      //         },
      //       ],
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$TeamDetails",
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "sports",
      //       localField: "sportId",
      //       foreignField: "_id",
      //       as: "sportDetails",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$sportDetails",
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "memberId",
      //       foreignField: "_id",
      //       as: "userDetails",
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: "$userDetails",
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      //   // {
      //   //   $project: {
      //   //     _id: 1,
      //   //     member_id: 1,
      //   //     count: 1,
      //   //     memberId: 1,
      //   //     fullName: 1,
      //   //     email: 1,
      //   //     image: 1,
      //   //     mobile: 1,
      //   //     sportId: 1,
      //   //     isNormalMember: 1,
      //   //     isTeamMember: 1,
      //   //     requestStatus: 1,
      //   //     sport: '$sportDetails',
      //   //     isAdmin: 1,
      //   //     teamSport: {
      //   //       $cond: {
      //   //         if: ['$TeamDetails.TeamSportsDetails', null],
      //   //         then: [],
      //   //         else: "$TeamDetails.TeamSportsDetails"
      //   //       }
      //   //     },
      //   //     teamIds: {
      //   //       $cond:{
      //   //         if:["$teamId",null],
      //   //         then:[],
      //   //         else:"$teamId"
      //   //       }
      //   //     },
      //   //     teamDetails: "$TeamDetails",
      //   //     jerseyDetails: '$userDetails.jerseyDetails',
      //   //     description: '$userDetails.description',
      //   //     expectations: '$TeamDetails.aboutCreator.expectations',
      //   //   },
      //   // },
      //   {
      //     $facet: {
      //       memberList: [{
      //           $group: {
      //             count: {
      //               $sum: 1,
      //             },
      //             _id: "$email",
      //             id: {
      //               $first: "$_id",
      //             },
      //             member_id: {
      //               $first: "$_id",
      //             },
      //             memberId: {
      //               $first: "$memberId",
      //             },
      //             fullName: {
      //               $first: "$fullName",
      //             },
      //             email: {
      //               $first: "$email",
      //             },
      //             image: {
      //               $first: "$image",
      //             },
      //             sportId: {
      //               $first: "$sportId",
      //             },
      //             mobile: {
      //               $first: "$mobile",
      //             },
      //             requestStatus: {
      //               $first: "$requestStatus",
      //             },
      //             isAdmin: {
      //               $first: "$isAdmin",
      //             },
      //             sport: {
      //               $first: "$sportDetails",
      //             },
      //             teamSport: {
      //               $push: "$TeamDetails.TeamSportsDetails",
      //             },
      //             teamIds: {
      //               $push: "$TeamDetails._id",
      //             },
      //             jerseyDetails: {
      //               $first: "$userDetails.jerseyDetails",
      //             },
      //             description: {
      //               $first: "$userDetails.description",
      //             },
      //             expectations: {
      //               $first: "$TeamDetails.aboutCreator.expectations",
      //             },
      //           },
      //         },
      //         {
      //           $project: {
      //             _id:"$id",
      //             member_id: 1,
      //             memberId: 1,
      //             fullName: 1,
      //             email: 1,
      //             image: 1,
      //             mobile: 1,
      //             sportId: 1,
      //             requestStatus: 1,
      //             sport: 1,
      //             isAdmin: 1,
      //             teamSport: 1,
      //             teamIds: 1,
      //             jerseyDetails: 1,
      //             description: 1,
      //             expectations: 1,
      //           },
      //         },
      //         {
      //           $sort: {
      //             createdAt: -1,
      //           },
      //         },
      //         {
      //           $skip: skipIndex,
      //         },
      //         {
      //           $limit: limit,
      //         },
      //       ],
      //     }
      //   }
      // ]);
      // return SendResponse(
      //   res, {
      //     membersData: {
      //       memberList: memberList
      //     },
      //     total: teamMemberIds.length
      //   },
      //   "All Member list",
      //   200
      // );

      // const [{
      //   memberList,
      //   total
      // }]
      let [{ memberList }] = await Member.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "user_teams",
            as: "TeamDetails",
            let: {
              teamId: "$teamId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$teamId"],
                  },
                },
              },
              {
                $lookup: {
                  from: "sports",
                  let: {
                    sportsId: "$sports_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$sportsId"],
                        },
                      },
                    },
                  ],
                  as: "TeamSportsDetails",
                },
              },
              {
                $unwind: {
                  path: "$TeamSportsDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$TeamDetails",
            preserveNullAndEmptyArrays: true,
          },
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
          $unwind: {
            path: "$sportDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "memberId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            isTeam: {
              $cond: {
                if: {
                  $eq: ["$isTeamMember", true],
                },
                then: 2,
                else: 1,
              },
            },
          },
        },
        {
          $sort: { isTeam: -1 },
        },
        {
          $facet: {
            memberList: [
              {
                $group: {
                  count: {
                    $sum: 1,
                  },
                  _id: "$email",
                  id: {
                    $first: "$_id",
                  },
                  member_id: {
                    $first: "$_id",
                  },
                  memberId: {
                    $first: "$memberId",
                  },
                  fullName: {
                    $first: "$fullName",
                  },
                  email: {
                    $first: "$email",
                  },
                  image: {
                    $first: "$image",
                  },
                  sportId: {
                    $first: "$sportId",
                  },
                  mobile: {
                    $first: "$mobile",
                  },
                  countryCode: {
                    $first: "$countryCode",
                  },
                  countryAlphaCode: {
                    $first: "$countryAlphaCode",
                  },
                  requestStatus: {
                    $first: "$requestStatus",
                  },
                  isAdmin: {
                    $first: "$isAdmin",
                  },
                  sport: {
                    $push: "$sportDetails",
                  },
                  teamSport: {
                    $push: "$TeamDetails.TeamSportsDetails",
                  },
                  teamIds: {
                    $push: "$TeamDetails._id",
                  },
                  jerseyDetails: {
                    $first: "$userDetails.jerseyDetails",
                  },
                  description: {
                    $first: "$userDetails.description",
                  },
                  expectations: {
                    $first: "$TeamDetails.aboutCreator.expectations",
                  },
                },
              },
              {
                $project: {
                  _id: "$id",
                  member_id: 1,
                  memberId: 1,
                  fullName: 1,
                  email: 1,
                  image: 1,
                  countryAlphaCode: 1,
                  countryCode: 1,
                  mobile: 1,
                  sportId: 1,
                  requestStatus: 1,
                  sport: 1,
                  isAdmin: 1,
                  teamSport: 1,
                  teamIds: 1,
                  jerseyDetails: 1,
                  description: 1,
                  expectations: 1,
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
      ]);
      let membersData = {
        memberList,
        total: memberList.length || 0,
      };
      return SendResponse(
        res,
        {
          membersData: membersData,
        },
        "All Member list",
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

  //get member teams list
  getMemberTeamsList: async (req, res) => {
    try {
      var date = new Date();
      date.setMonth(date.getMonth() - 3);

      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {};
      params = [
        {
          user_id: ObjectId(req.params.creatorId),
        },
        {
          $expr: {
            $in: [ObjectId(req.params.memberId), "$members"],
          },
        },
        {
          createdAt: {
            $gte: date,
          },
        },
        {
          status: true,
        },
      ];

      if (req.query.search != "" && req.query.search != null) {
        params.push({
          teamName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ teamList, total }] = await UserTeam.aggregate([
        {
          $match: {
            $and: params,
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              teamId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      memberId: ObjectId(req.params.memberId),
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
                  email: 1,
                  profileImage: "$image",
                  requestStatus: 1,
                  teamId: 1,
                  aboutCreator: 1,
                  expectations: 1,
                  jerseyDetails: 1,
                  description: 1,
                  status: 1,
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
                  coverPhoto: 1,
                  logo: 1,
                  user_id: 1,
                  aboutCreator: 1,
                  creatorIsAdmin: 1,
                  members: "$memberDetails",
                  admins: 1,
                  sport: "$sportDetails",
                  colour: "$teamColourDetails",
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
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

  //Delete member
  allMemberDelete: async (req, res) => {
    try {
      if (req.body.memberId) {
        let member = await Member.findOne({
          memberId: req.body.memberId,
          creatorId: ObjectId(req.user.id),
        });
        if (!member) {
          return SendResponse(res, {}, "Member not found", 200);
        }

        await Member.updateMany(
          {
            memberId: req.body.memberId,
            creatorId: ObjectId(req.user.id),
          },
          {
            $set: {
              requestStatus: 4,
            },
          }
        );

        let teamIds = JSON.parse(req.body.teamId);
        if (teamIds.length > 0) {
          teamIds.forEach(async (teamId) => {
            await UserTeam.updateOne(
              {
                _id: teamId,
              },
              {
                $pull: {
                  admins: ObjectId(req.body.memberId),
                  members: ObjectId(req.body.memberId),
                },
              }
            );

            await Chat.updateMany({
              teamId : ObjectId(teamId),
              chatType : { $in : [ 2,3 ]}
            },{
                $pull: {
                  admins: {
                    'id': ObjectId(req.body.memberId)
                  },
                  members: {
                    'id': ObjectId(req.body.memberId)
                  },
                }
            });
          });
        }

        return SendResponse(res, {}, "Member Deleted Successfully", 200);
      }

      if (req.body.member_id) {
        let member = await Member.findById(req.body.member_id);
        if (!member) {
          return SendResponse(res, {}, "Member not found", 200);
        }

        // await Member.updateOne({
        //   _id: req.body.member_id
        // }, {
        //   $set: {
        //     requestStatus: 4,
        //   },
        // });

        let pendingPayemnts = await Member.find({
          email: member.email,
          SplitPaymentBy: { $ne: null },
          paymentReceiptStatus: 1,
        });
        if (pendingPayemnts.length > 0) {
          return SendResponse(
            res,
            {},
            "Member can't be deleted, pending dues in event",
            200
          );
        }

        await Member.updateMany(
          {
            email: member.email,
          },
          {
            $set: {
              requestStatus: 4,
            },
          }
        );

        return SendResponse(res, {}, "Member Deleted Successfully", 200);
      }
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

  addFamilyMember: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        fullName: "required",
        dob: "required|dateFormat:YYYY-MM-DD",
        gender: "required|in:male,female,transgender,other",
        relationWithCreator: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }
      if (!req.files) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "The file field is required",
          422
        );
      }

      //check user already a family member
      let memberData = await Member.findOne({
        creatorId: ObjectId(req.user.id),
        fullName: req.body.fullName,
        gender: req.body.gender,
        relationWithCreator: req.body.relationWithCreator,
      });
      if (memberData)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "This user already a family member",
          422
        );

      let image;
      if (req.files && req.files.image) {
        let Image = await FileUpload.aws(req.files.image);
        image = Image.Key;
      }

      req.body.image = process.env.AWS_URL + image;
      req.body.creatorId = req.user.id;
      req.body.isFamilyMember = true;
      req.body.requestStatus = 2;

      let member = await Member.create(req.body);
      return SendResponse(
        res,
        {
          member: member,
        },
        "Member added successfully",
        200
      );
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

  editFamilyMember: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        fullName: "required",
        dob: "required|dateFormat:YYYY-MM-DD",
        gender: "required|in:male,female,transgender,other",
        relationWithCreator: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      //check user already a family member
      let memberData = await Member.findById(req.params.memberId);

      if (!memberData)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Member not found",
          422
        );

      let image;
      if (req.files && req.files.image) {
        let Image = await FileUpload.aws(req.files.image);
        image = Image.Key;
        req.body.image = process.env.AWS_URL + image;
      }

      let member = await Member.findByIdAndUpdate(
        req.params.memberId,
        req.body
      );
      return SendResponse(res, {}, "Member updated successfully", 200);
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
  //get all members
  getFamilyMembers: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;

      let params = { status: true };

      params = Object.assign(params, {
        creatorId: ObjectId(req.user.id),
        isFamilyMember: true,
      });

      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          fullName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ members, total }] = await Member.aggregate([
        {
          $match: params,
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
            members: [
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  image: 1,
                  relationWithCreator: 1,
                  gender: 1,
                  dob: 1,
                  status: 1,
                },
              },
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
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

      return SendResponse(
        res,
        {
          members,
          total: total || 0,
        },
        "All family members",
        200
      );
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

  //delete member from team
  deleteTeamMember: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        teamId: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      let teamDetails = await UserTeam.findById(req.body.teamId);

      if (teamDetails.user_id.toString() == req.body.memberId) {
        return SendResponse(res, {}, "Creator can't be deleted.", 200);
      }

      // if (
      //   teamDetails.admins.length == 1 &&
      //   teamDetails.admins.toString() == req.body.memberId
      // ) {
      //   return SendResponse(
      //     res,
      //     {},
      //     "Can't Be Deleted As No Other Admin Available In This Team",
      //     200
      //   );
      // }

      if (req.body.member_id) {
        let memberData = await Member.findById(req.body.member_id);
        if (!memberData) {
          return SendResponse(res, {}, "Member not found", 200);
        } else {
          (memberData.requestStatus = 2),
            (memberData.teamId = null),
            (memberData.isAdmin = false),
            (memberData.aboutCreator = null),
            (memberData.description = null),
            (memberData.jerseyDetails = null),
            (memberData.isTeamMember = false),
            (memberData.isNormalMember = true),
            (memberData.sportId = teamDetails.sports_id);
          await memberData.save();

          return SendResponse(res, {}, "Member Deleted Successfully", 200);
        }
      } else {
        await UserTeam.updateOne(
          {
            _id: ObjectId(req.body.teamId),
          },
          {
            $pull: {
              admins: ObjectId(req.body.memberId),
              members: ObjectId(req.body.memberId),
            },
          }
        );

        await Chat.updateMany({ 
          teamId : ObjectId(req.body.teamId),
          chatType : { $in : [ 2,3 ] }
        },{
          $pull: {
            admins: {
              'id': ObjectId(req.body.memberId)
            },
            members: {
              'id': ObjectId(req.body.memberId)
            },
          },
        });

        await Member.updateOne(
          {
            memberId: ObjectId(req.body.memberId),
            teamId: ObjectId(req.body.teamId),
            requestStatus: {
              $in: [1, 2],
            },
            status: true,
          },
          {
            requestStatus: 2,
            teamId: null,
            isAdmin: false,
            aboutCreator: null,
            description: null,
            jerseyDetails: null,
            isTeamMember: false,
            isNormalMember: true,
            sportId: teamDetails.sports_id,
          }
        );

        return SendResponse(res, {}, "Member Deleted Successfully", 200);
      }
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

  //mark member as admin
  changeAdminStatus: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        teamId: "required",
        memberId: "required",
        isAdmin: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      let team = await UserTeam.findById(req.body.teamId);
      if (team.user_id == req.body.memberId) {
        return SendResponse(
          res,
          {},
          "Admin Status of Creator Can't Be Changed",
          200
        );
      }

      if (req.body.isAdmin == false) {
        let teamAdmin = await UserTeam.updateOne(
          {
            _id: req.body.teamId,
          },
          {
            $pull: {
              admins: ObjectId(req.body.memberId),
            },
          }
        );
        const teamDetails = await UserTeam.findById(req.body.teamId).lean();
        await Chat.updateMany({
          teamId : ObjectId(req.body.teamId),
          chatType : { $in : [ 2,3 ]}
        },{
          $pull: {
            admins: {
              'id': ObjectId(req.body.memberId)
            },
          },
        });

        if(teamDetails.admins.length > 1){
          await Chat.updateMany({
            teamId : ObjectId(req.body.teamId),
            chatType : { $in : [ 2,3 ]}
          },{
            $set: { status : true },
          });
        }
      } else {
        let teamAdmin = await UserTeam.updateOne(
          {
            _id: req.body.teamId,
          },
          {
            $push: {
              admins: ObjectId(req.body.memberId),
            },
          }
        );
        const teamDetails = await UserTeam.findById(req.body.teamId).lean();
        // await Chat.updateMany({
        //   teamId : ObjectId(req.body.teamId),
        //   chatType : { $eq : 3 }
        // },{
        //   $push: {
        //     members: {id : ObjectId(req.body.memberId), status : true, joiningDate : Date.now() },
        //   },
        // });
        await Chat.updateMany({
          teamId : ObjectId(req.body.teamId),
          chatType : { $in : [ 2,3 ]}
        },{
          $push: {
            admins: {id : ObjectId(req.body.memberId), status : true, joiningDate : Date.now() },
          },
        });

        if(teamDetails.admins.length > 1){
          await Chat.updateMany({
            teamId : ObjectId(req.body.teamId),
            chatType : { $in : [ 2,3 ]}
          },{
            $set: { status : true },
          });
        }
      }

      let member = await Member.findOneAndUpdate(
        {
          teamId: ObjectId(req.body.teamId),
          memberId: ObjectId(req.body.memberId),
          requestStatus: {
            $eq: 2,
          },
        },
        {
          isAdmin: req.body.isAdmin,
        }
      );

      // let member = await Member.findByIdAndUpdate(
      //   req.body.memberId,
      //   {
      //     isAdmin: req.body.isAdmin,
      //   }
      // );

      return SendResponse(
        res,
        {},
        "Admin Status of Member Changed Successfully",
        200
      );
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

  //Edit team
  teamEdit: async (req, res) => {
    try {
      let team = await UserTeam.findById(req.params.teamId);
      if (!team) {
        return SendResponse(res, {}, "Team not found", 200);
      }
      // if (req.body.sports_id && !(await Sport.findById(req.body.sports_id)))
      //   return SendResponse(
      //     res,
      //     {
      //       isBoom: true,
      //     },
      //     "Sport id does not exist",
      //     422
      //   );

      if (
        req.body.teamColour_id &&
        !(await Colours.findById(req.body.teamColour_id))
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team Colour id does not exist",
          422
        );

      if (
        req.body.teamName &&
        (await UserTeam.findOne({
          // teamName: new RegExp("^" + req.body.teamName),
          teamName: req.body.teamName,
          user_id: ObjectId(req.user.id),
        }))
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Team name already created",
          422
        );

      let coverPhoto;
      let logo;
      if (req.files && req.files.coverPhoto) {
        let coverImage = await FileUpload.aws(req.files.coverPhoto);
        coverPhoto = coverImage.Key;
        req.body.coverPhoto = process.env.AWS_URL + coverPhoto;
      }

      if (req.files && req.files.logo) {
        let logoImage = await FileUpload.aws(req.files.logo);
        logo = logoImage.Key;
        req.body.logo = process.env.AWS_URL + logo;
      }

      await UserTeam.findByIdAndUpdate(req.params.teamId, req.body);

      // if (req.body.sports_id) {
      //   await Member.updateMany(
      //     {
      //       teamId: ObjectId(req.params.teamId),
      //     },
      //     {
      //       $set: {
      //         sportId: req.body.sports_id,
      //       },
      //     }
      //   );
      // }

      return SendResponse(res, {}, "Team Updated Successfully", 200);
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

  //Delete team
  teamDelete: async (req, res) => {
    try {
      let team = await UserTeam.findById(req.params.teamId);
      if (!team) {
        return SendResponse(res, {}, "Team not found", 200);
      }

      await Member.updateMany(
        {
          teamId: ObjectId(req.params.teamId),
        },
        {
          $set: {
            requestStatus: 2,
            teamId: null,
            isAdmin: false,
            aboutCreator: null,
            description: null,
            jerseyDetails: null,
            isTeamMember: false,
            isNormalMember: true,
            sportId: team.sports_id,
          },
        }
      );

      await UserTeam.deleteOne({
        _id: ObjectId(req.params.teamId),
      });

      return SendResponse(res, {}, "Team Deleted Successfully", 200);
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
