const { Mongoose } = require("mongoose");
const Boom = require("boom");
var randtoken = require("rand-token");
const User = require("../../../models/user");
const UserTeam = require("../../../models/userteam");
const Member = require("../../../models/member");
const Sport = require("../../../models/sport");
const Help = require("../../../models/helpQuerie");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../../../apiHandler");
const mail = require("../../../services/mailServices");
const FileUpload = require("../../../services/upload-file");
const { findOne } = require("../../../models/user");
const Notification = require("../../../models/notification");
const { dump } = require("../../../services/dump");
const Chat = require("../../../models/chat");
const ChatMessage = require("../../../models/chatmessage");
const Team = require("../../../models/userteam");
const Event = require("../../../models/event");
const Training = require("../../../models/training");
const TrainingBooking = require("../../../models/trainingBooking");
const Helper = require("../../../services/helper");

module.exports = {
  //**********Profile Details************ */
  // profileDetail: async (req, res) => {
  //   try {
  //     let user = await User.findOne({ _id: req.user.id });
  //     let allergies = await Allergies.findOne(
  //       { userId: req.user.id },
  //       { allergies: 1 }
  //     );
  //     return SendResponse(
  //       res,
  //       { user: user, allergies: allergies ? allergies : { allergies: [] } },
  //       "Profile detail retrieved successfully",
  //       200
  //     );
  //   } catch (err) {
  //     return SendResponse(
  //       res,
  //       {},
  //       i18n.__('Something_went_wrong_please_try_again'),
  //       500
  //     );
  //   }
  // },

  // //************Update Profile*********** */
  // updateProfile: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       firstName: "required",
  //       lastName: "required",
  //       email: "required|email",
  //       mobile: "required",
  //       countryCode: "required",
  //       gender: "required|in:Male,Female",
  //       dateOfBirth: "required|dateFormat:MM-DD-YYYY",
  //     });
  //     const CheckValidation = await v.check();
  //     if (!CheckValidation) {
  //       let first_key = Object.keys(v.errors)[0];
  //       let err = v.errors[first_key]["message"];
  //       return SendResponse(res, {}, err, 422);
  //     }
  //     let allergies = await Allergies.findOne(
  //       { userId: req.user.id },
  //       { allergies: 1 }
  //     );

  //     // let checkEmailExits = await User.findOne({
  //     //   _id: { $ne: ObjectId(req.user.id) },
  //     //   email: req.body.email,
  //     // });
  //     // if (checkEmailExits) {
  //     //   return SendResponse(res, {}, "This email address already exists", 422);
  //     // }

  //     const user = await User.findOne({ _id: req.user.id });
  //     user.firstName = req.body.firstName;
  //     user.lastName = req.body.lastName;
  //     user.blodGroup = req.body.blodGroup;
  //     user.mobile = req.body.mobile;
  //     user.countryCode = req.body.countryCode;
  //     user.gender = req.body.gender;
  //     user.changeGender = req.body.changeGender;
  //     user.dateOfBirth = moment(req.body.dateOfBirth).format("YYYY-MM-DD");

  //     user.pronouns = req.body.pronouns;

  //     //send email verification link
  //     const randomToken = randtoken.generate(50);
  //     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  //     user.resetPasswordToken = randomToken;
  //     if (req.body.email && req.body.email != user.email) {
  //       user.isEmailVerify = false;
  //       let mailSend = mail.send({
  //         email: req.body.email,
  //         subject: "Mednovate Account Verification Request",
  //         html: `Hi ${user.firstName}, <br><br>Please click on the link below to verify your account with Mednovate.<br><br>
  //           <a href= "${process.env.Url}/account_verification/${randomToken}">${process.env.Url}/account_verification/${randomToken}</a><br><br>
  //           If you cannot click on the link, please copy and paste it into the address bar of your web browser.
  //           <br><br>
  //           Thanks & Regards,
  //           <br>
  //           Mednovate Team
  //           `,
  //       });
  //       if (!mailSend) {
  //         return SendResponse(res, {}, "Internal server error", 500);
  //       }
  //     }

  //     user.email = req.body.email;

  //     await user.save();

  //     return SendResponse(
  //       res,
  //       { user: user, allergies: allergies ? allergies : { allergies: [] } },
  //       "Profile updated successfully",
  //       200
  //     );
  //   } catch (err) {
  //     dump(err);
  //     return SendResponse(
  //       res,
  //       {},
  //       i18n.__('Something_went_wrong_please_try_again'),
  //       500
  //     );
  //   }
  // },

  //********  Delete Account ***********/
  deleteAccount: async (req,res) => {
    try{
       // If status is active then push back to the teams and events which he has created or he is member of those teams and events else pull from those teams and events.
       console.log("status of user", await User.findById(req.user.id));
       await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: { status: false },
        },
        { new: true }
      );
        await Helper.changeStatus(req.user.id, "false" , "update");
        await Member.updateMany({
          isTeamMember : true,
          memberId : ObjectId(req.user.id),
          status : true
        },{
          $set : {
            status : false
          }
        });
        await Member.updateMany({
          isEventMember : true,
          memberId : ObjectId(req.user.id),
          status : true
        },{
          $set : {
            status : false
          }
        });
        await UserTeam.updateMany({
          user_id : ObjectId(req.user.id)
        },{
          $set : { status : false }
        });
        await Event.updateMany({
          creatorId : ObjectId(req.user.id)
        },{
          $set : { status : false }
        });

        return SendResponse(
          res,
          {},
          "Account deleted successfully",
          200
        );
    } catch (err) {
      dump("err-----------------", err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //******** Get Sports List Added By Admin ***********/
  SportsList: async (req, res) => {
    try {
      let search = req.query.search;
      const sports_list = await Sport.find({
        status: true,
        sports_name: {
          $regex: new RegExp(search, "i"),
        },
      });

      return SendResponse(
        res,
        {
          sports_list: sports_list,
        },
        "Sports list retrieved successfully",
        200
      );
    } catch (err) {
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //************Update User Chosen Sports*********** */
  UpdateSports: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        chosenSports: "required",
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

      let data = req.body;

      if (typeof data.chosenSports == "string") {
        data.chosenSports = JSON.parse(data.chosenSports);
      }

      const user = await User.findOne({
        _id: req.user.id,
      });
      user.chosenSports = data.chosenSports;

      await user.save();

      return SendResponse(
        res,
        {
          user: await User.findOne(
            {
              _id: req.user.id,
            },
            "chosenSports"
          ).populate("chosenSports"),
        },
        "Sports updated successfully",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //******** Get User Sports Count ***********/
  UserSportsCount: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.user.id,
      });

      const unseenNotifications = await Notification.find({
        receiverId: ObjectId(req.user.id),
        isSeen: false,
      }).lean();

      // check the event chats which have been in archived list for 3 months and delete them from db
      let currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - 3);
      const archivedEventChats = await Chat.find({
        isArchived : true,
        chatType : { $in : [ 4,5 ]},
        $expr: {  
          $lte: [
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date:  {
                  $toDate: "$archivedDate" // Convert the string to a date
                },
              },
            },
            moment(currentDate).format("YYYY-MM-DD"),
          ],
        },
      });

      await ChatMessage.deleteMany({ roomId : {
        $in: archivedEventChats.map(chat => chat.roomId)
      } });
      await Chat.deleteMany({ roomId : {
        $in: archivedEventChats.map(chat => chat.roomId)
      } });

      // deleted above all the chats who were in archived chat list for equal or more than 3 months


      let existInEvent = await Event.find({
        members: {
          $elemMatch: {
            $eq: ObjectId(req.user.id),
          },
        },
      });

      let existInTeam = await Team.find({
        members: {
          $elemMatch: {
            $eq: ObjectId(req.user.id),
          },
        },
      });

      let existInTrainingBooking = await TrainingBooking.find({
        userId: ObjectId(req.user.id),
      });
      let params = {
        status: true,
        $or: [
          {
            senderId: ObjectId(req.user.id),
          },
          {
            receiverId: ObjectId(req.user.id),
          },
          {
            trainingId: {
              $in: existInTrainingBooking.map((booking) =>
                ObjectId(booking.trainingId)
              ),
            },
          },
          {
            eventId: {
              $in: existInEvent.map((event) => ObjectId(event._id)),
            },
          },
          {
            teamId: {
              $in: existInTeam.map((team) => ObjectId(team._id)),
            },
          },
        ],
      };

      let chatList = await Chat.aggregate([
        {
          $match: params,
        },
        {
          $sort: { updatedAt: -1 },
        },
      ]);
      let unSeenChatMessagesCount = 0;
        for await (const chat of chatList) {
          let isAdmin = false;
          if (chat.admins && Array.isArray(chat.admins) && chat.admins.length > 0) {
              isAdmin = chat.admins.some(admin => (admin.id).toString() === req.user.id)
          }
          let messageCountParams = {
            roomId: chat.roomId,
            status: true,
            seenBy: {
              $nin: [ObjectId(req.user.id)],
            },
          };
          if(chat.chatType == 2 || chat.chatType == 3 || chat.chatType == 4 || chat.chatType == 5 || chat.chatType == 6 || chat.chatType == 7){
            let joiningDate = null; 
            let senderId = chat.members &&  await chat.members.find(member => (member.id).toString() == req.user.id);
              if (!senderId) {
                  let adminId = chat.admins && await chat.admins.find(admin => (admin.id).toString() == req.user.id);
                  if (adminId) {
                      joiningDate = adminId.joiningDate;
                  }
              } else {
                  joiningDate = senderId.joiningDate;
              }

              if (joiningDate) {
                messageCountParams = Object.assign(messageCountParams, {
                    createdAt: { $gte: joiningDate }
                });
              }
          }
          let count = await ChatMessage.count(messageCountParams);
          if(chat.chatType == 3 || chat.chatType == 5 || chat.chatType == 7 ){
              if( isAdmin ){
                unSeenChatMessagesCount = unSeenChatMessagesCount + count;
              }
          }else{
            unSeenChatMessagesCount = unSeenChatMessagesCount + count;
          }
          
        }

      return SendResponse(
        res,
        {
          sports_count: user.chosenSports.length,
          notifications_count: unseenNotifications.length,
          chat_count: unSeenChatMessagesCount
        },
        "User sports count retrieved successfully",
        200
      );
    } catch (err) {
      dump("err=======================", err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //******** Get My Selected Sports List  ***********/
  MySportsList: async (req, res) => {
    try {
      let userDetails = await User.findById(req.user.id);
      const sports_list = await Sport.aggregate([
        {
          $match: {
            _id: { $in: userDetails.chosenSports },
            status: true,
          },
        },
      ]);

      return SendResponse(
        res,
        {
          sports_list: sports_list,
        },
        "Sports list retrieved successfully",
        200
      );
    } catch (err) {
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //************Update About Me*********** */
  UpdateAboutMe: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        jerseyDetails: "required",
        description: "required",
        expectations: "required",
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
      let data = req.body;
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

      let profile;
      if (req.files && req.files.profileImage) {
        let profileImage = await FileUpload.aws(req.files.profileImage);
        profile = profileImage.Key;
      }
      let memberDetails = await Member.findOne({
        teamId: ObjectId(data.teamId),
        memberId: ObjectId(req.user.id),
        requestStatus: 2,
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
      data.profileImage = profile;

      // let user = await User.findOne({
      //   _id: req.user.id
      // });
      // user.jerseyDetails = JSON.parse(data.jerseyDetails);
      // user.description = data.description;
      // user.profileImage = process.env.AWS_URL + data.profileImage;

      // await user.save();

      data.jerseyDetails = JSON.parse(data.jerseyDetails);

      // find if the user is existing as member then update his profile there also
      await Member.updateMany(
        {
          teamId: ObjectId(data.teamId),
          memberId: ObjectId(req.user.id),
        },
        {
          $set: {
            description: data.description,
            jerseyDetails: data.jerseyDetails,
            image: process.env.AWS_URL + data.profileImage,
            expectations: data.expectations,
          },
        }
      );

      // find if the user is existing as teamcreator then update his profile there also
      let creator = await UserTeam.findOne({
        _id: ObjectId(data.teamId),
        user_id: ObjectId(req.user.id),
      });

      if (creator) {
        creator.aboutCreator.creatorImage =
          process.env.AWS_URL + data.profileImage;
        creator.aboutCreator.aboutCreator = data.description;
        creator.aboutCreator.pantSize = data.jerseyDetails.pant_size;
        creator.aboutCreator.jerseySize = data.jerseyDetails.shirt_size;
        creator.aboutCreator.nameOnJersey = data.jerseyDetails.name;
        creator.aboutCreator.numberOnJersey = data.jerseyDetails.number;
        creator.aboutCreator.expectations = data.expectations
          ? data.expectations
          : creator.aboutCreator.expectations;
        creator.markModified("aboutCreator");
        await creator.save();

        let memberCreator = await Member.updateMany(
          {
            teamId: ObjectId(data.teamId),
            memberId: ObjectId(req.user.id),
          },
          {
            $set: {
              aboutCreator: {
                creatorImage: process.env.AWS_URL + data.profileImage,
                aboutCreator: data.description,
                pantSize: data.jerseyDetails.pant_size,
                jerseySize: data.jerseyDetails.shirt_size,
                nameOnJersey: data.jerseyDetails.name,
                numberOnJersey: data.jerseyDetails.number,
                expectations: data.expectations
                  ? data.expectations
                  : creator.aboutCreator.expectations,
              },
            },
          }
        );
        
      }

      let isTeamAdmin = await UserTeam.findOne({
        _id: ObjectId(data.teamId),
        admins: { $in: [ObjectId(req.user.id)] },
      });
      if (isTeamAdmin) {
        let adminChatExist = await Chat.findOne({ teamId: ObjectId(data.teamId), chatType: 3});
        let adminMember;
        if (!adminChatExist) {
          let adminGroupChat = await Chat.create({
            senderId: req.user.id,
            chatType: 3, //team admin's group
            teamId: ObjectId(data.teamId),
            messageType: 7,
            lastMessage: `${req.user.fullName} created this group`,
          });
          adminMember = await ChatMessage.create({
            roomId: adminGroupChat.roomId,
            senderId: req.user.id,
            senderType: "user",
            chatType: 3,
            messageType: 6,
            message: `${req.user.fullName} created this group`,
            teamMemberDetails: {
              name: `${req.user.fullName}`,
              expectations: data.expectations,
              image: process.env.AWS_URL + data.profileImage,
              aboutMe: data.description,
            },
          });
        } else {
          if (isTeamAdmin.admins.length > 1) {
            await Chat.findByIdAndUpdate(adminChatExist._id, { status: true });
          }
          adminMember = await ChatMessage.create({
            roomId: adminChatExist.roomId,
            senderId: req.user.id,
            senderType: "user",
            chatType: 3,
            messageType: 6,
            message: `${req.user.fullName} joined this group`,
            teamMemberDetails: {
              name : `${req.user.fullName}`,
              expectations: data.expectations,
              image: process.env.AWS_URL + data.profileImage,
              aboutMe: data.description,
            },
          });
        }
      }

      let teamChatExist = await Chat.findOne({ teamId: ObjectId(data.teamId), chatType: 2});
      let teamMember = await ChatMessage.create({
        roomId: teamChatExist.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 2,
        messageType: 6,
        message: `${req.user.fullName} joined this group`,
        teamMemberDetails: {
          name : req.user.fullName,
          expectations: data.expectations,
          image: process.env.AWS_URL + data.profileImage,
          aboutMe: data.description,
        },
      });

      return SendResponse(res, {}, "Profile updated successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //************Update About Me*********** */
  postHelpQuery: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        title: "required",
        message: "required",
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

      let userDetails = await User.findById(req.user.id);

      let data = req.body;
      data.userType = "user";
      data.mobile = userDetails.mobile;
      data.phoneCode = userDetails.phoneNumericCode;
      data.senderId = req.user.id;

      await Help.create(data);

      return SendResponse(
        res,
        {},
        "Your Query Sent To Admin Successfully",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  // //************Create Team*********** */
  // createTeam: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       teamName: "required",
  //       sports_id: "required",
  //       country: "required",
  //       state: "required",
  //       city: "required",
  //       teamColour: "required"
  //     });
  //     const CheckValidation = await v.check();
  //     if (!CheckValidation) {
  //       let first_key = Object.keys(v.errors)[0];
  //       let err = v.errors[first_key]["message"];
  //       return SendResponse(res, { isBoom : true }, err, 422);
  //     }

  //     let data = req.body;
  //     data.user_id = req.user.id;

  //     if (!req.files) {
  //       return SendResponse(res, {isBoom : true }, "The file field is required", 422);
  //     }

  //     let coverPhoto;
  //     let logo;
  //     if (req.files && req.files.coverPhoto) {
  //       let coverImage = await FileUpload.aws(req.files.coverPhoto);
  //       coverPhoto = coverImage.key;
  //     }

  //     if (req.files && req.files.logo) {
  //       let logoImage = await FileUpload.aws(req.files.logo);
  //       logo = logoImage.key;
  //     }

  //     data.coverPhoto = process.env.AWS_URL+coverPhoto;
  //     data.logo = process.env.AWS_URL+logo;

  //     const team = await UserTeam.create(data);

  //     return SendResponse(
  //       res,
  //       { team: team  },
  //       "Team Created successfully",
  //       200
  //     );
  //   } catch (err) {
  //     dump(err);
  //     return SendResponse(
  //       res,
  //       {isBoom : true },
  //       i18n.__('Something_went_wrong_please_try_again'),
  //       500
  //     );
  //   }
  // },

  //*******Logout********** */
  logout: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.deviceToken = "";
      await user.save();
      return SendResponse(res, {}, "Account logout successfully.", 200);
    } catch (err) {
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  },

  //***************Resend Verification Link*************** */
  // resendVerificationLink: async (req, res) => {
  //   try {
  //     const user = await User.findOne({ _id: req.user.id });
  //     if (user) {
  //       if (!user.email) {
  //         return SendResponse(
  //           res,
  //           {},
  //           "No email address found, please update your email first",
  //           422
  //         );
  //       }
  //       //send verification link
  //       const randomToken = randtoken.generate(50);
  //       user.resetPasswordToken = randomToken;
  //       await user.save();
  //       let mailSend = mail.send({
  //         email: user.email,
  //         subject: "Resend Account Verification Request",

  //         html: `Hi ${user.firstName}, <br><br>Please click on the link below to verify your account with Mednovate.<br><br>
  //           <a href= "${process.env.Url}/account_verification/${user.resetPasswordToken}">${process.env.Url}/account_verification/${user.resetPasswordToken}</a><br>
  //           If you cannot click on the link, please copy and paste it into the address bar of your web browser.
  //           <br><br>
  //           Thanks & Regards,
  //           <br>
  //           Mednovate Team
  //           `,
  //       });
  //       if (!mailSend) {
  //         return SendResponse(res, {}, "Internal server error", 500);
  //       }
  //       return SendResponse(
  //         res,
  //         {},
  //         "Resend verification link has been send successfully",
  //         200
  //       );
  //     } else {
  //       return SendResponse(res, {}, "No user found!", 422);
  //     }
  //   } catch (err) {
  //     dump(err);
  //     return SendResponse(res, {}, "Something went to wrong", 500);
  //   }
  // },

  //*********Check email Id or mobile number exists */
  // checkEmailOrMobileExists: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       mobile: "required",
  //       countryCode: "required",
  //       email: "required|email",
  //     });
  //     const match = await v.check();

  //     if (!match) {
  //       let first_key = Object.keys(v.errors)[0];
  //       let err = v.errors[first_key]["message"];
  //       return SendResponse(res, {}, err, 422);
  //     }
  //     const checkUserMobileExists = await User.findOne({
  //       _id: { $ne: ObjectId(req.user.id) },
  //       mobile: req.body.mobile,
  //     });
  //     if (checkUserMobileExists) {
  //       return SendResponse(
  //         res,
  //         {},
  //         "This mobile number already exists, please try another",
  //         422
  //       );
  //     } else {
  //       const checkUserEmailExists = await User.findOne({
  //         _id: { $ne: ObjectId(req.user.id) },
  //         email: req.body.email,
  //       });

  //       if (checkUserEmailExists) {
  //         return SendResponse(
  //           res,
  //           {},
  //           "This email id already exists, please try another",
  //           422
  //         );
  //       } else {
  //         return SendResponse(res, {}, "success", 200);
  //       }
  //     }
  //   } catch (err) {
  //     dump(err);
  //     return SendResponse(
  //       res,
  //       {},
  //       i18n.__('Something_went_wrong_please_try_again'),
  //       500
  //     );
  //   }
  // },
};
