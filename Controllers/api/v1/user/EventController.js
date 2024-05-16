const Event = require("../../../../models/event");
const Sport = require("../../../../models/sport");
const Member = require("../../../../models/member");
const User = require("../../../../models/user");
const Expense = require("../../../../models/eventExpense");
const Chat = require("../../../../models/chat");
const chatmessage = require("../../../../models/chatmessage");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Validator } = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const mail = require("../../../../services/mailServices");
const FileUpload = require("../../../../services/upload-file");
const STORAGE_PATH = process.env.AWS_STORAGE_PATH;
const { log } = require("firebase-functions/logger");
const FacilityBranch = require("../../../../models/facilityBranch");
const XLSX = require("xlsx");
const pushNotification = require("../../../../firebase/index");
const Notification = require("../../../../models/notification");
const {dump}=require("../../../../services/dump");
const xl = require("excel4node");
var path = require("path");
var mime = require("mime-types");
var fs = require("fs");
const { object } = require("firebase-functions/v1/storage");
const moment = require("moment");
const tzlookup = require('tz-lookup');
const momentTZ = require('moment-timezone');
const member = require("../../../../models/member");

// Function to get timezone from latitude and longitude using tz-lookup
function getTimezone(latitude, longitude) {
  try {
    const timezone = tzlookup(latitude, longitude);
    if (timezone) {
      timezoneAbbreviation = momentTZ.tz(timezone).format('z');
    } else {
      dump('Unable to retrieve timezone information.');
    }
    return timezoneAbbreviation;
  } catch (error) {
    dump(error.message);
    return null;
  }
}


module.exports = {
  //************Create event*********** */
  createEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventName: "required",
        eventType: "required|in:practice,game,tournament",
        // opponentName: "requiredNotIf:eventType,practice",
        sportId: "required",
        // facilityId: "required",
        eventDate: "required",
        startTime: "required",
        latitude: "required",
        longitude: "required",
        address: "required",
        // endTime: "requiredNotIf:eventType,game",
        notes: "required",
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
      if (!(await Sport.findById(req.body.sportId)))
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Sport id does not exist",
          422
        );
      req.body.creatorId = req.user.id;
      req.body.members = [ObjectId(req.user.id)];
      req.body.admins = [ObjectId(req.user.id)];
      let user = await User.findById(req.user.id);
      let coordinates = [
        parseFloat(req.body.longitude),
        parseFloat(req.body.latitude),
      ];
      let location = {
        type: "Point",
        coordinates,
      };
      req.body.location = location;
      // req.body.teamIds = JSON.parse(req.body.teamIds);
      var event = await Event.create(req.body);
      const timezone = getTimezone(event.location.coordinates[1], event.location.coordinates[0]);
      const inputString = event.eventType;
      // Convert the first letter to uppercase and concatenate the rest of the string
      const eventType = inputString.charAt(0).toUpperCase() + inputString.slice(1);

      await Member.create({
        creatorId: user.id,
        memberId: user.id,
        isEventMember: true,
        image: user.profileImage,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        countryCode: user.phoneNumericCode,
        countryAlphaCode: user.phoneCode,
        eventId: event._id,
        requestStatus: 2,
        paymentReceiptStatus: 1,
        isAdmin: true,
      });
      
      const joiningDate = Date.now();
      let groupChat = await Chat.create({
        senderId: req.user.id,
        chatType: 4, //event group
        eventId: event._id,
        admins: [{ id : ObjectId(req.user.id), status : true ,joiningDate : joiningDate}],
        members: [{id : ObjectId(req.user.id), status : true ,joiningDate : joiningDate}],
        messageType: 7, //
        lastMessage: `${req.user.fullName} created this group`,
      });
      await chatmessage.create({
        roomId: groupChat.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 4,
        messageType: 7,
        message: `${req.user.fullName} created this group`,
        latitude : event.location.coordinates[1],
        longitude : event.location.coordinates[0],
        eventDetails: {
          eventName: event.eventName,
          eventType: event.eventType,
          eventLocation : event.address,
          startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
          startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
          latitude : event.location.coordinates[1],
          longitude : event.location.coordinates[0],
        },
      });
      await chatmessage.create({
        roomId: groupChat.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 4,
        messageType: 6,
        message: `${req.user.fullName} joined this group`,
        eventMemberDetails: {
          fullName : req.user.fullName
        }
      });
      let adminGroupChat = await Chat.create({
        senderId: req.user.id,
        senderType: "user",
        chatType: 5, //event admin's group
        messageType: 7,
        lastMessage: `${req.user.fullName} created this group`,
        status: false,
        eventId: event._id,
        admins: [{ id : ObjectId(req.user.id), status : true ,joiningDate : joiningDate}],
        members: [{ id : ObjectId(req.user.id), status : true ,joiningDate : joiningDate}],
      });
      await chatmessage.create({
        roomId: adminGroupChat.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 5, //event admin's group
        messageType: 7,
        message: `${req.user.fullName} created this group`,
        latitude : event.location.coordinates[1],
        longitude : event.location.coordinates[0],
        eventDetails: {
          eventName: event.eventName,
          eventType: event.eventType,
          eventLocation : event.address,
          startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
          startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
          latitude : event.location.coordinates[1],
          longitude : event.location.coordinates[0],
        },
      });

      await chatmessage.create({
        roomId: adminGroupChat.roomId,
        senderId: req.user.id,
        senderType: "user",
        chatType: 5, //event admin's group
        messageType: 6,
        message: `${req.user.fullName} joined this group`,
        eventMemberDetails: {
          fullName : req.user.fullName
        }
      });
      

      if (req.body.teamId) {
        let members = await Member.find({
          teamId: ObjectId(req.body.teamId),
          requestStatus: 2,
          status: true,
          memberId: { $ne : ObjectId(req.user.id) }
        });
        members.forEach(async (member) => {
          let eventMember = {
            creatorId: req.user.id,
            memberId: member.memberId,
            isEventMember: true,
            image: member.image,
            fullName: member.fullName,
            email: member.email,
            mobile: member.mobile,
            countryAlphaCode: member.countryAlphaCode,
            countryCode: member.countryCode,
            teamId: req.body.teamId,
            eventId: event._id,
            paymentReceiptStatus: 1,
          };
          //create event members
          let insertedMember = await Member.create(eventMember);
          let isMemberRegisteredAsUser = await User.findOne({
            email : insertedMember.email,
            isDeleted : false,
            status : true
          });
          // send notification to member to accept request
          if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
            let data = { 
              title : 'Event Invitation Request',
              message : `You have been invited to join ${event.eventName} event`,
              eventId : (event._id).toString() ,
              memberId : (insertedMember._id).toString(),
              email : insertedMember.email,
              type: 'eventInvitationRequest'
            };

            await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
            await Notification.create({
              title: data.title,
              message: data.message,
              receiverEmail: data.email,
              eventId : data.eventId,
              senderId : req.user.id,
              memberId : insertedMember._id,
              receiverId : isMemberRegisteredAsUser._id,
              eventId : data.eventId,
              type : data.type,
              senderType : "user"          
            });
          }
          //send email to member to accept reauest
          mail.sendTemplate({
            email: member.email,
            subject: `Request to join ${req.body.eventName}  event`,
            locale: "en",
            template: "eventInvitation.ejs",
            memberName : member.fullName, 
            adminName : req.user.fullName,
            eventName : event.eventName,
            eventType : eventType,
            eventLocation : event.address,
            startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
            startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
            link : `${process.env.Url}/api/v1/user/event/request/${event._id}/${member.email}/${insertedMember._id}`,
            // html: `Hi ${member.fullName}, <br><br>${req.user.fullName} sent you a request to join ${req.body.eventName}  event.<br><br>
            //                     <a href= "${process.env.Url}/api/v1/user/event/request/${event._id}/${member.email}/${insertedMember._id}">Click here</a><br><br>
            //                     To join the event.
            //                     <br><br>
            //                     Thanks & Regards,
            //                     <br>
            //                     Sports Nerve Team
            //                     `,
          });
        });
      }
      if (typeof req.body.eventMembers == "string") {
        req.body.eventMembers = JSON.parse(req.body.eventMembers);
      }
      if (req.body.eventMembers && req.body.eventMembers.length > 0) {
        req.body.eventMembers.forEach(async (member) => {
          let memberDetails = await Member.findById(ObjectId(member));
          if (memberDetails && ( (memberDetails.memberId).toString() != (req.user.id).toString())) {
            let eventMember = {
              creatorId: req.user.id,
              memberId: memberDetails.memberId,
              isEventMember: true,
              image: memberDetails.image,
              fullName: memberDetails.fullName,
              email: memberDetails.email,
              mobile: memberDetails.mobile,
              countryAlphaCode: memberDetails.countryAlphaCode,
              countryCode: memberDetails.countryCode,
              eventId: event._id,
              paymentReceiptStatus: 1,
            };

            //insert members
            let insertedMember = await Member.create(eventMember);
            let isMemberRegisteredAsUser = await User.findOne({
              email : insertedMember.email,
              isDeleted : false,
              status : true
            });
            // send notification to member to accept request
            if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
              let data = { 
                title : 'Event Invitation Request',
                message : `You have been invited to join ${event.eventName} event`,
                eventId : (event._id).toString() ,
                memberId : (insertedMember._id).toString(),
                email : insertedMember.email,
                type: 'eventInvitationRequest'
              };
    
              await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
              await Notification.create({
                title: data.title,
                message: data.message,
                receiverEmail: data.email,
                eventId : data.eventId,
                senderId : req.user.id,
                memberId : insertedMember._id,
                receiverId : isMemberRegisteredAsUser._id,
                eventId : data.eventId,
                type : data.type,
                senderType : "user"            
              });
            }
            //send email to member to accept reauest
            mail.sendTemplate({
              email: memberDetails.email,
              subject: `Request to join ${req.body.eventName} event`,
              locale: "en",
              template: "eventInvitation.ejs",
              memberName : memberDetails.fullName, 
              adminName : req.user.fullName,
              eventName : event.eventName,
              eventType : eventType,
              eventLocation : event.address,
              startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
              startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
              link : `${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${insertedMember._id}`,
              // html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to join ${req.body.eventName}  event.<br><br>
              //                   <a href= "${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${insertedMember._id}">Click here</a><br><br>
              //                   To join the event.
              //                   <br><br>
              //                   Thanks & Regards,
              //                   <br>
              //                   Sports Nerve Team
              //                   `,
            });
          }
        });
      }
      return SendResponse(
        res,
        {
          event: event,
        },
        "Event Created successfully",
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

  //Edit Event
  eventEdit: async (req, res) => {
    try {
      let event = await Event.findById(req.params.eventId);
      if (!event) {
        return SendResponse(res, {}, "Event not found", 200);
      }
      if (event.members.length > 1) {
        return SendResponse(
          res,
          {},
          "You cannot edit event as members has already joned this event",
          200
        );
      }

      if (
        req.body.eventName &&
        (await Event.findOne({
          eventName: req.body.eventName,
          creatorId: ObjectId(req.user.id),
        }))
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Event name already created",
          422
        );

      if (req.body.latitude && req.body.longitude) {
        let coordinates = [
          parseFloat(req.body.longitude),
          parseFloat(req.body.latitude),
        ];
        let location = {
          type: "Point",
          coordinates,
        };
        req.body.location = location;
        delete req.body.latitude;
        delete req.body.longitude;
      }

      await Event.findByIdAndUpdate(req.params.eventId, req.body);

      return SendResponse(res, {}, "Event Updated Successfully", 200);
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

  getEventRequestDetails: async (req, res) => {
    try {
      let member = await Member.findById(req.params.memberId);
      if (!member) {
        res.status(422).send("<h1> Request not found </h1>");
      }

      if (member.requestStatus == 4) {
        res.status(422).send("<h1> The link has been expired. </h1>");
      }

      if (member.requestStatus == 2) {
        res.status(422).send("<h1> You are already a member </h1>");
      }
      if (member.requestStatus == 3) {
        res
          .status(422)
          .send(
            "<h1> You have rejected the request. Please contact event creator/admin for a fresh invitation </h1>"
          );
      }
      res
        .status(201)
        .send(
          `<script>window.location.href='${process.env.APP_URL}?eventId=${req.params.eventId}&email=${req.params.email}&memberId=${req.params.memberId}'</script>`
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
  acceptEventRequest: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
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

      let user = await User.findById(req.user.id);

      //check team is created or not
      let event = await Event.findById(req.body.eventId);
      if (!event)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Event not found",
          422
        );
      if (req.body.status == "accept") {
        if(event.members.includes(ObjectId(req.user.id))){
          return SendResponse(
            res,
            { isBoom : true },
            "You are already part of this event",
            422
          );
        }
        let pushObj = { members: ObjectId(req.user.id) };

        if (
          req.body.memberId &&
          req.body.memberId != "null" &&
          req.body.memberId != null
        ) {
          const member = await Member.findById(req.body.memberId);
          if(!member){
            return SendResponse(
              res,
              { isBoom : true },
              "You are no longer part of this event",
              422
            );
          }
          if(member.status == false ){
            return SendResponse(
              res,
              { isBoom : true },
              "You are no longer part of this event",
              422
            );
          }
          if (member.isAdmin == true) {
            pushObj.admins = ObjectId(req.user.id);
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
            eventId: req.body.eventId,
            email: user.email,
            memberId: user.id,
            isAdmin: false,
            requestStatus: 2,
            creatorId: event.creatorId,
            isEventMember: true,
          };

          await Member.create(memberObj);
        }

        await Event.findByIdAndUpdate(req.body.eventId, {
          $push: pushObj,
        });
        let eventDetails = await Event.findById(req.body.eventId);
        const timezone = getTimezone(eventDetails.location.coordinates[1], eventDetails.location.coordinates[0]);
        const joiningDate = Date.now();
        if(member.isAdmin == true){
          let adminChatExist = await Chat.findOne({ eventId: ObjectId(req.body.eventId), chatType: 5});
          await Chat.findByIdAndUpdate(adminChatExist._id, {
            $push : {
              members : { id : ObjectId(req.user.id), status : true , joiningDate : joiningDate },
              admins : { id : ObjectId(req.user.id), status : true, joiningDate : joiningDate }
            }
          });
          if (eventDetails.admins.length > 1) { //check if there are 2 admins, then only make this group visible to user
            await Chat.findByIdAndUpdate(adminChatExist._id, {
              $set :{
                status: true 
              }
            });
          }
          let user = await User.findById(req.user.id);
          await chatmessage.create({
            roomId: adminChatExist.roomId,
            senderId: req.user.id,
            senderType: "user",
            chatType: 5,
            messageType: 6,
            message: `${req.user.fullName} joined this group`,
            eventMemberDetails: {
              fullName : req.user.fullName,
              profileImage : user.profileImage
            }
          });
        }

        let eventGroupChatExist = await Chat.findOne({ eventId: ObjectId(req.body.eventId), chatType: 4});
        if( !member.isAdmin ){
          await Chat.updateOne({
            eventId: ObjectId(req.body.eventId), chatType: 5
          },{
            $push : {
            members : { id : ObjectId(req.user.id), status : true , joiningDate : joiningDate }
          }
          });
        }
        await Chat.findByIdAndUpdate(eventGroupChatExist._id, {
          $push : {
            members : { id : ObjectId(req.user.id), status : true , joiningDate : joiningDate }
          }
          });
        await chatmessage.create({
          roomId: eventGroupChatExist.roomId,
          senderId: req.user.id,
          senderType: "user",
          chatType: 4,
          messageType: 6,
          message: `${req.user.fullName} joined this group`,
          eventMemberDetails: {
            fullName : req.user.fullName,
            profileImage : user.profileImage
          }
        });

        return SendResponse(
          res,
          {},
          "You have been added to the event successfully",
          200
        );
      }
      if (req.body.status == "reject") {
        if (req.body.memberId != "null" || req.body.memberId != null) {
          const member = await Member.findById(req.body.memberId);
          if(!member){
            return SendResponse(
              res,
              { isBoom : true },
              "You are no longer part of this event",
              422
            );
          }

          if(member.status == false ){
            return SendResponse(
              res,
              { isBoom : true },
              "You are no longer part of this event",
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

        return SendResponse(res, {}, "Request Rejected", 200);
      }
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
  eventDetails: async (req, res) => {
    try {
      let params = {};

      params = Object.assign(params, {
        _id: ObjectId(req.params.eventId),
      });

      let memberParams = [
        {
          $eq: ["$eventId", "$$eventId"],
        },
        {
          $in: ["$requestStatus", [1, 2, 3]],
        },
        {
          status: true
        }
      ];

      // if (req.query.memberType == "yes") {
      //   memberParams.push({
      //     $eq: ["$requestStatus", 2],
      //   });
      // }

      // if (req.query.memberType == "no") {
      //   memberParams.push({
      //     $eq: ["$requestStatus", 3],
      //   });
      // }

      // if (req.query.memberType == "pending") {
      //   memberParams.push({
      //     $eq: ["$requestStatus", 1],
      //   });
      // }

      let [eventDetails] = await Event.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              eventId: "$_id",
              location: "$location"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$memberId", "$$userId"] },
                      { $eq: ["$eventId", "$$eventId"] },
                      { $eq: ["$requestStatus", 2] },
                      { $eq: ["$status", true ] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  image: 1,
                  isAdmin: 1,
                  expenseContribution: 1,
                  requestStatus: 1,
                  memberId: 1,
                  eventId: 1,
                  email: 1,
                  confirmationReminderCount: 1,
                  paymentReminderCount: 1,
                  paymentReceiptStatus: 1,
                  paymentReminderTime: 1,
                  paymentReceiptUploadTime: {
                    $toDate: "$paymentReceiptUploadTime"
                  },
                  paymentNotes: 1,
                  currencyCode: 1,
                  paymentScreenshots: 1,
                  accountDetails: 1,
                  location: "$$location",
                  status: 1,
                  // yourContribution: {
                  //   $cond: {
                  //     if: {
                  //       $eq: ["$isSplitEqually", true],
                  //     },
                  //     then: "$perHeadExpenses",
                  //     else: "$expenseContribution",
                  //   },
                  // },
                  yourContribution: "$expenseContribution",
                },
              },
            ],
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              eventId: "$_id",
              location: "$location"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: memberParams,
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  image: 1,
                  isAdmin: 1,
                  expenseContribution: 1,
                  requestStatus: 1,
                  memberId: 1,
                  eventId: 1,
                  email: 1,
                  confirmationReminderTime: 1,
                  confirmationReminderCount: 1,
                  paymentReminderCount: 1,
                  paymentReminderTime: 1,
                  paymentReceiptUploadTime: {
                    $toDate: "$paymentReceiptUploadTime"
                  },
                  paymentReceiptStatus: 1,
                  paymentNotes: 1,
                  currencyCode: 1,
                  paymentScreenshots: 1,
                  location : "$$location",
                  status  : 1,
                  // yourContribution: {
                  //   $cond: {
                  //     if: {
                  //       $eq: ["$isSplitEqually", true],
                  //     },
                  //     then: "$perHeadExpenses",
                  //     else: "$expenseContribution",
                  //   },
                  // },
                  yourContribution: "$expenseContribution",
                },
              },
            ],
            as: "allMemberDetails",
          },
        },
        {
          $lookup: {
            from: "eventexpenses",
            // localField: "_id",
            // foreignField: "eventId",
            let : { eventId : "$_id"},
            pipeline : [
              { 
                $match : { $expr : { $eq : ["$eventId", "$$eventId"]} }
              },
              {
                $lookup : {
                  from : "users",
                  let : { userId : "$memberId" },
                  pipeline : [ 
                    {
                      $match : { $expr : { $eq : ["$_id", "$$userId"] } }
                    },
                    {
                      $project : {
                        fullName : 1,
                        email : 1
                      }
                    },
                  ],
                  as : "userDetails"
                },
              },
              {
                $unwind : "$userDetails"
              }
            ],
            as: "eventExpensesDetails",
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
          $project: {
            _id: 1,
            eventName: 1,
            eventType: 1,
            opponentName: 1,
            eventDate: 1,
            eventDateUTC: 1,
            startTime: 1,
            endTimeUTC: 1,
            endTime: 1,
            notes: 1,
            creatorIsAdmin: 1,
            creatorId: 1,
            currencyCode: 1,
            members: "$memberDetails",
            allMemberDetails: "$allMemberDetails",
            sport: "$sportDetails",
            teamIds: 1,
            address: 1,
            location: 1,
            isSplitEqually: 1,
            SplitPaymentBy: 1,
            isSplitPayment: 1,
            paymentStatus: 1,
            accountDetails: 1,
            isComplete: 1,
            eventExpenses: "$eventExpensesDetails",
            totalExpenses: {
              $sum: "$eventExpensesDetails.cost",
            },
            perHeadExpenses: 1
          },
        },
      ]);

      let eventGroupExit = await Chat.findOne({
        eventId : ObjectId(req.params.eventId),
        chatType : 4
      }).lean();

      let eventAdminGroupExit = await Chat.findOne({
        eventId : ObjectId(req.params.eventId),
        chatType : 5,
        status : true
      }).lean();
      
      let event = await Event.findById(req.params.eventId);
      eventDetails.eventGroupchat = eventGroupExit;
      if (eventDetails.eventGroupchat && Object.keys(eventDetails.eventGroupchat).length > 0) {
          eventDetails.eventGroupchat.event = event;
      }
      if( event.admins.includes(ObjectId(req.user.id)) ){
        eventDetails.eventAdminGroupChat = eventAdminGroupExit;
      }
      if (eventDetails.eventAdminGroupChat && Object.keys(eventDetails.eventAdminGroupChat).length > 0) {
          eventDetails.eventAdminGroupChat.event = event;
      }

      return SendResponse(
        res,
        {
          eventDetails: eventDetails,
        },
        "Event details",
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
  addMemberInEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        // memberId: "required",
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
      let event = await Event.findById(req.body.eventId);
      if(!event){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event found",
          422
        );
      }
      const timezone = getTimezone(event.location.coordinates[1], event.location.coordinates[0]);
      const inputString = event.eventType;
      // Convert the first letter to uppercase and concatenate the rest of the string
      const eventType = inputString.charAt(0).toUpperCase() + inputString.slice(1);
      let members = [];
      if (req.body.memberId) {
        if (typeof req.body.memberId == "string") {
          members = req.body.memberId.split(",");
        } else {
          members = req.body.memberId;
        }
      }

      let deletedMembers = [];
      if (req.body.deleteMemberId) {
        if (typeof req.body.deleteMemberId == "string") {
          deletedMembers = req.body.deleteMemberId.split(",");
        } else {
          deletedMembers = req.body.deleteMemberId;
        }
      }

      let msg;
      if (deletedMembers.length > 0) {
        deletedMembers.forEach(async (memberId) => {
          let memberDetails = await Member.findById(memberId);

          await Event.findByIdAndUpdate(ObjectId(req.body.eventId), {
            $pull: {
              members: ObjectId(memberDetails.memberId),
              admins: ObjectId(memberDetails.memberId),
            },
          });

          await Chat.updateMany({
            eventId : ObjectId(req.body.eventId),
            chatType: { $in : [ 4,5 ]}
          },{
            $pull: {
              members: {
                'id': ObjectId(memberDetails.memberId)
              },
              admins: {
                'id': ObjectId(memberDetails.memberId)
              },
            },
          });

          await memberDetails.delete();
        });

        msg = "Member deleted successfully";
      }

      if (members.length > 0) {
        let isMailError = false;
        if (req.body.teamIds) {
          let eventupadte = await Event.findByIdAndUpdate(req.body.eventId, {
            $set: {
              teamIds: req.body.teamIds,
            },
          });
        }
        members.forEach(async (memberId) => {
          let memberDetails = await Member.findById(memberId);
          //check user already a member
          if (req.body.accepted && req.body.accepted == "true") {
            let eventMemberDetails = await Member.findOne({
              email: memberDetails.email,
              isEventMember: true,
              requestStatus: 3,
              creatorId: req.user.id,
              eventId: ObjectId(req.body.eventId),
              status: true
            });

            if (eventMemberDetails) {
              eventMemberDetails.requestStatus = 2;
              eventMemberDetails.save();

               //send notification to member if he is registered as user on platform
                let isMemberRegisteredAsUser = await User.findOne({ 
                  email : eventMemberDetails.email,
                  isDeleted : false,
                  status : true
                });
                if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
                  let data = { 
                    title : 'Member Added In Event',
                    message : `You have been added to ${event.eventName} event`,
                    eventId : (event._id).toString() ,
                    memberId : (eventMemberDetails._id).toString(),
                    email : eventMemberDetails.email,
                    type: 'eventMemberAdded'
                  };

                  await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
                  await Notification.create({
                    title: data.title,
                    message: data.message,
                    receiverEmail: data.email,
                    senderId : req.user.id,
                    memberId : eventMemberDetails._id,
                    receiverId : isMemberRegisteredAsUser._id,
                    eventId : data.eventId,
                    type : data.type,
                    senderType : "user"
                  });
                }
            } else {
              let eventMember = await Member.create({
                creatorId: req.user.id,
                memberId: memberDetails.memberId
                  ? memberDetails.memberId
                  : null,
                isEventMember: true,
                image: memberDetails.image,
                fullName: memberDetails.fullName,
                email: memberDetails.email,
                mobile: memberDetails.mobile,
                countryAlphaCode: memberDetails.countryAlphaCode,
                countryCode: memberDetails.countryCode,
                eventId: event._id,
                paymentReceiptStatus: 1,
                requestStatus: 2,
              });
              //send notification to member if he is registered as user on platform
              let isMemberRegisteredAsUser = await User.findOne({ 
                email : eventMember.email,
                isDeleted : false,
                status : true
              });
              if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
                let data = { 
                  title : 'Member Added In Event',
                  message : `You have been added to ${event.eventName} event`,
                  eventId : (event._id).toString() ,
                  memberId : (eventMember._id).toString(),
                  email : eventMember.email,
                  type: 'eventMemberAdded'
                };

                await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
                await Notification.create({
                  title: data.title,
                  message: data.message,
                  receiverEmail: data.email,
                  senderId : req.user.id,
                  memberId : eventMember._id,
                  receiverId : isMemberRegisteredAsUser._id,
                  eventId : data.eventId,
                  type : data.type,
                  senderType : "user"
                });
              }
            }

            await Event.findByIdAndUpdate(ObjectId(req.body.eventId), {
              $push: {
                members: ObjectId(memberDetails.memberId),
              },
            });

            await Chat.updateMany({
              eventId : ObjectId(req.body.eventId),
              chatType : { $in : [ 4,5 ]}
            },{
              $push : {
              members: { id : ObjectId(memberDetails.memberId), status : true, joiningDate : Date.now() },
              }
            });

            msg = "Member added successfully";
          } else {
            let eventMemberDetails = await Member.findOne({
              email: memberDetails.email,
              isEventMember: true,
              requestStatus: 3,
              status: true,
              creatorId: req.user.id,
              eventId: ObjectId(req.body.eventId),
            });

           

            if (eventMemberDetails) {
              eventMemberDetails.requestStatus = 1;
              eventMemberDetails.save();
              // send notification to member to accept request

              let isMemberRegisteredAsUser = await User.findOne({ 
                email : eventMemberDetails.email,
                isDeleted : false,
                status : true
               });
              if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
                let data = { 
                  title : 'Event Invitation Request',
                  message : `You have been invited to join ${event.eventName} event`,
                  eventId : (event._id).toString() ,
                  memberId : (eventMemberDetails._id).toString(),
                  email : memberDetails.email,
                  type: 'eventInvitationRequest'
                };
      
                await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
                await Notification.create({
                  title: data.title,
                  message: data.message,
                  receiverEmail: data.email,
                  eventId : data.eventId,
                  senderId : req.user.id,
                  memberId : eventMemberDetails._id,
                  receiverId : isMemberRegisteredAsUser._id,
                  type : data.type,
                  senderType : "user"              
                });
              }

              //send email to member to accept reauest
              let mailSend = mail.sendTemplate({
                email: memberDetails.email,
                subject: `Request to join ${event.eventName} event`,
                locale: "en",
                template: "eventInvitation.ejs",
                memberName : memberDetails.fullName, 
                adminName : req.user.fullName,
                eventName : event.eventName,
                eventType : eventType,
                eventLocation : event.address,
                startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
                startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
                link : `${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${eventMemberDetails._id}`,
                // html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to join ${event.eventName}  event.<br><br>
                //       <a href= "${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${eventMemberDetails._id}">Click here</a><br><br>
                //       To join the event.
                //       <br><br>
                //       Thanks & Regards,
                //       <br>
                //       Sports Nerve Team
                //       `,
              });

              if (!mailSend) {
                isMailError = true;
              }

              msg = isMailError
                ? "Mail can't send to some of the users for event request"
                : "Event request sent";
            } else {
              let eventMember = {
                creatorId: req.user.id,
                memberId: memberDetails.memberId
                  ? memberDetails.memberId
                  : null,
                isEventMember: true,
                image: memberDetails.image,
                fullName: memberDetails.fullName,
                email: memberDetails.email,
                countryAlphaCode: memberDetails.countryAlphaCode,
                countryCode: memberDetails.countryCode,
                mobile: memberDetails.mobile,
                eventId: event._id,
                paymentReceiptStatus: 1,
              };
              let insertedMember = await Member.create(eventMember);

              let isMemberRegisteredAsUser = await User.findOne({ 
                email : insertedMember.email,
                isDeleted : false,
                status : true
               });
              // send notification to member to accept request
              if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
                let data = { 
                  title : 'Event Invitation Request',
                  message : `You have been invited to join ${event.eventName} event`,
                  eventId : (event._id).toString() ,
                  memberId : (insertedMember._id).toString(),
                  email : memberDetails.email,
                  type: 'eventInvitationRequest'
                };
      
                await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
                await Notification.create({
                  title: data.title,
                  message: data.message,
                  receiverEmail: data.email,
                  eventId : data.eventId,
                  senderId : req.user.id,
                  memberId : insertedMember._id,
                  receiverId : isMemberRegisteredAsUser._id, 
                  type : data.type,
                  senderType : "user"             
                });
              }
              //send email to member to accept reauest
              let mailSend = mail.sendTemplate({
                email: memberDetails.email,
                subject: `Request to join ${event.eventName} event`,
                locale: "en",
                template: "eventInvitation.ejs",
                memberName : memberDetails.fullName, 
                adminName : req.user.fullName,
                eventName : event.eventName,
                eventType : eventType,
                eventLocation : event.address,
                startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
                startTime : `${moment(event.startTime).format('h:mm a')} ${timezone}`,
                link : `${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${insertedMember._id}`,
                // html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to join ${event.eventName}  event.<br><br>
                //         <a href= "${process.env.Url}/api/v1/user/event/request/${event._id}/${memberDetails.email}/${insertedMember._id}">Click here</a><br><br>
                //         To join the event.
                //         <br><br>
                //         Thanks & Regards,
                //         <br>
                //         Sports Nerve Team
                //         `,
              });

              if (!mailSend) {
                isMailError = true;
              }
            }

            msg = isMailError
              ? "Mail can't send to some of the users for event request"
              : "Event request sent";
          }
        });
      }

      return SendResponse(res, {}, msg, 200);
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
  getEventList: async (req, res) => {
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
          creatorId: ObjectId(req.user.id),
        },
        {
          eventDate: { $gte: date.toISOString() },
        },
        {
          status : true
        }
      ];

      if (req.query.type == "practice") {
        params.push({
          eventType: "practice",
        });
      }

      if (req.query.type == "game") {
        params.push({
          eventType: "game",
        });
      }

      if (req.query.type == "tournament") {
        params.push({
          eventType: "tournament",
        });
      }

      if (req.query.search != "" && req.query.search != null) {
        params.push({
          eventName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      const [{ eventList, total }] = await Event.aggregate([
        {
          $match: {
            $and: params,
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              userId: "$members",
              location: "$location"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  profileImage: 1,
                  email: 1,
                  location: "$$location"
                },
              },
            ],
            as: "memberDetails",
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
                  teamId: 1,
                  opponentName: 1,
                  sportId: 1,
                  location: 1,
                  address: 1,
                  // facilityId: 1,
                  eventDate: 1,
                  startTime: 1,
                  endTime: 1,
                  notes: 1,
                  paymentStatus: 1,
                  isSplitPayment: 1,
                  members: "$memberDetails",
                  sport: "$sportDetails",
                  status: 1
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
      let eventData = {
        eventList: eventList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          eventData: eventData,
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

  getFacilityList: async (req, res) => {
    try {
      let search = req.query.search;
      const facility_list = await FacilityBranch.find({
        status: true,
        name: {
          $regex: new RegExp(search, "i"),
        },
      });

      return SendResponse(
        res,
        {
          facility_list: facility_list,
        },
        "Facility list retrieved successfully",
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

  addExpenseInEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        title: "required",
        cost: "required",
        currencyCode: "required",
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
      let event = await Event.findById(ObjectId(req.body.eventId));
      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event exists",
          422
        );
      }

      if ( event.isSplitPayment == true ){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Event expenses cannot be added, Split already initiated.",
          422
        );
      }

      if(event.currencyCode && event.currencyCode != null && event.currencyCode != " " && event.currencyCode != req.body.currencyCode){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          `Please select currency ${event.currencyCode}`,
          422
        );
      }

      req.body.memberId = req.user.id;
      let expense = await Expense.create(req.body);

      let expenseList = await Expense.find({
        eventId: req.body.eventId,
      });

      event.totalExpenses = expenseList.reduce(
        (acc, val) => (acc += parseFloat(val.cost)),
        0
      );
      event.currencyCode = req.body.currencyCode;
      event.save();

      return SendResponse(
        res,
        {
          expense: expense,
        },
        "Expense Added Successfully",
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

 
  editExpenseInEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        title: "required",
        cost: "required",
        currencyCode: "required",
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
      let expense = await Expense.findById(ObjectId(req.params.expenseId));
      if (!expense) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such expense exists",
          422
        );
      }

      if(expense.memberId.toString() != req.user.id){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Only expense creator can update the expense",
          422
        );
      }
      // data.memberId = req.user.id;

      expense.title = data.title;
      expense.cost = data.cost;
      expense.currencyCode = data.currencyCode;
      // expense.memberId = data.memberId;

      expense.save();
      let event = await Event.findById(ObjectId(expense.eventId));

      let expenseList = await Expense.find({
        eventId: expense.eventId,
      });

      event.totalExpenses = expenseList.reduce(
        (acc, val) => (acc += parseFloat(val.cost)),
        0
      );

      event.currencyCode = req.body.currencyCode;
      event.save();

      return SendResponse(
        res,
        {
          expense: expense,
        },
        "Expense Updated Successfully",
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

  deleteExpenseInEvent: async (req,res) => {
     try{
       
      let expense = await Expense.findById(ObjectId(req.params.expenseId));
      if (!expense) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such expense exists",
          422
        );
      }

      if( expense.memberId.toString() != req.user.id ){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Only expense creator can delete the expense",
          422
        );
      }
        let event = await Event.findById(ObjectId(expense.eventId));
        await expense.delete();

       
        let expenseList = await Expense.find({
          eventId: event._id,
        });
  
        
        if( expenseList.length > 0 ){

          event.totalExpenses = expenseList.reduce(
            (acc, val) => (acc += parseFloat(val.cost)),
            0
          );
  
        }else{
          event.currencyCode = null;
          event.totalExpenses = null;
        }

        event.save();
  
        return SendResponse(
          res,
          { },
          "Expense Deleted Successfully",
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

  //mark member as admin
  changeEventAdminStatus: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
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

      let event = await Event.findById(req.body.eventId);
      if (event.creatorId == req.body.memberId) {
        return SendResponse(
          res,
          {},
          "Admin Status of Creator Can't Be Changed",
          200
        );
      }

      if (req.body.isAdmin == false) {
        let event = await Event.findByIdAndUpdate(ObjectId(req.body.eventId), {
          $pull: {
            admins: ObjectId(req.body.memberId),
          },
        });

        await Chat.updateMany({
          eventId : ObjectId(req.body.eventId),
          chatType : { $in : [ 4,5 ] }
        },{
          $pull: {
            admins: {
              'id': ObjectId(req.body.memberId)
            },
          },
        });
        let eventDetails = await Event.findById(req.body.eventId);
        if(eventDetails.admins.length > 1 ){
          await Chat.updateMany({
            eventId : ObjectId(req.body.eventId),
            chatType : { $in : [ 4,5 ] }
          },{
            $set: { status : true },
          });
        }
      } else {
        await Event.findByIdAndUpdate(ObjectId(req.body.eventId), {
          $push: {
            admins: ObjectId(req.body.memberId),
          },
        });
        const joiningDate = Date.now();
        await Chat.updateMany({
          eventId : ObjectId(req.body.eventId),
          chatType : { $in : [ 4,5 ] }
        },{
          $push: {
            admins: {id : ObjectId(req.body.memberId), status: true, joiningDate : joiningDate },
          },
        });
        await Chat.updateOne({
          eventId : ObjectId(req.body.eventId),
          chatType : { $eq : 5 }
        },{
          $push: {
            members: {id : ObjectId(req.body.memberId), status: true, joiningDate : joiningDate },
          },
        });
        let eventDetails = await Event.findById(req.body.eventId);
        if(eventDetails.admins.length > 1 ){
          await Chat.updateMany({
            eventId : ObjectId(req.body.eventId),
            chatType : { $in : [ 4,5 ] }
          },{
            $set: { status : true },
          });
        }
      }

      await Member.findOneAndUpdate(
        {
          eventId: ObjectId(req.body.eventId),
          memberId: ObjectId(req.body.memberId),
          requestStatus: { $eq: 2 },
        },
        {
          isAdmin: req.body.isAdmin,
        }
      );

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

  getMySchedules: async (req, res) => {
    try {
      if (!req.query.date) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "The date field is required",
          500
        );
      }

      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      // let { order = "desc", sort = "createdAt" } = req.query;

      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;

      const start = (page - 1) * limit;
      const end = start + limit;

      // Assuming you have a universal timestamp stored in a variable called 'timestamp'
      const timestamp = new Date(req.query.date) ; 
      // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000));; // Replace this with your actual timestamp

      // // Add 24 hours to the timestamp
      // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000));
      const startDate = new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0));
      const endDate = new Date(new Date(req.query.date).setUTCHours(23, 59, 59, 999));
      const formattedstartDate = new Date(startDate.getTime()).toISOString();
      const formattedendDate = new Date(endDate.getTime()).toISOString();
      let params = {};

      let pendingEventParams = [
        {
          $eq: ["$_id", "$$eventId"],
        },
        // {
        //   $eq: ["$isComplete", false],
        // },
        // {
        //   $gte: [
        //     "$eventDate",
        //     new Date(new Date(req.query.date).setHours(0, 0, 0)),
        //   ],
        // },
        // {
        //   $lt: [
        //     "$eventDate",
        //     new Date(new Date(req.query.date).setHours(23, 59, 59)),
        //   ],
        // },
         {
          $gte: [
            "$eventDate", formattedstartDate,
          ],
        },
        {
          $lt: [
            "$eventDate", formattedendDate,
          ],
        },
      ];

      params = Object.assign(params, {
        $and: [
          // {
          //   eventDate: {
          //     $gte: new Date(new Date(req.query.date).setHours(0, 0, 0)),
          //     $lt: new Date(new Date(req.query.date).setHours(23, 59, 59)),
          //   },
          // },
          {
            eventDate: {
              $gte: startDate.toISOString(),
              $lt: endDate.toISOString(),
            },
          },
          {
            $or: [
              {
                $and: [
                  {
                    creatorId: ObjectId(req.user.id),
                  },
                  // {
                  //   isComplete: false,
                  // },
                ],
              },
              {
                $and: [
                  {
                    members: ObjectId(req.user.id),
                  },
                  // {
                  //   isComplete: false,
                  // },
                ],
              },
            ],
          },
        ],
      });

      if (req.query.type == "practice") {
        params = Object.assign(params, {
          eventType: "practice",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "practice"],
        });
      }

      if (req.query.type == "game") {
        params = Object.assign(params, {
          eventType: "game",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "game"],
        });
      }

      if (req.query.type == "tournament") {
        params = Object.assign(params, {
          eventType: "tournament",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "tournament"],
        });
      }

      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          eventName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const acceptedEventList = await Event.aggregate([
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
          $unwind: {
            path: "$sportDetails",
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
            teamId: 1,
            opponentName: 1,
            sportId: 1,
            // facilityId: 1,
            location: 1,
            address: 1,
            eventDate: 1,
            eventDateUTC: 1,
            endTimeUTC: 1,
            startTime: 1,
            endTime: 1,
            notes: 1,
            isSplitPayment: 1,
            isComplete: 1,
            // members: "$memberDetails",
            sport: "$sportDetails",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const pendingEventList = await Member.aggregate([
        {
          $match: {
            memberId: ObjectId(req.user.id),
            requestStatus: 1,
            isEventMember: true,
          },
        },
        {
          $lookup: {
            from: "events",
            let: {
              eventId: "$eventId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: pendingEventParams,
                  },
                },
              },
              {
                $lookup: {
                  from: "sports",
                  let: {
                    sportId: "$sportId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$sportId"],
                        },
                      },
                    },
                  ],
                  as: "sportDetails",
                },
              },
              {
                $project: {
                  _id: 1,
                  createdAt: 1,
                  creatorId: 1,
                  eventName: 1,
                  eventType: 1,
                  teamId: 1,
                  opponentName: 1,
                  sportId: 1,
                  // facilityId: 1,
                  location: 1,
                  address: 1,
                  eventDate: 1,
                  eventDateUTC: 1,
                  endTimeUTC: 1,
                  startTime: 1,
                  endTime: 1,
                  notes: 1,
                  isSplitPayment: 1,
                  isComplete: 1,
                  sport: "$sportDetails",
                },
              },
            ],
            as: "eventDetails",
          },
        },
        {
          $unwind: "$eventDetails",
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            image: 1,
            isAdmin: 1,
            eventId: 1,
            event: "$eventDetails",
            startTime: "$eventDetails.startTime",
            requestStatus: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      let pendingPaymentsCount = 0;

      const eventsCreator = await Event.find({
        // creatorId: ObjectId(req.user.id),
        SplitPaymentBy: ObjectId(req.user.id),
        paymentStatus: 1,
        isSplitPayment : true
      }, 'creatorId members');

      const eventsMember = await Event.find({
        // creatorId: { $ne : ObjectId(req.user.id) },
        SplitPaymentBy : { $ne : ObjectId(req.user.id)},
        members: ObjectId(req.user.id),
        paymentStatus: 1,
        isSplitPayment : true
      }, 'creatorId members');

      // let membersArray = [];

      for( const creator of eventsCreator){
        let eventId = creator._id
        for ( const member of creator.members){
          let memberDetails = await Member.findOne({
            memberId : ObjectId(member),
            eventId : ObjectId(eventId),
            requestStatus: 2,
            paymentReceiptStatus: 1
          });
          
          if (memberDetails && ( (memberDetails.memberId).toString() != req.user.id))
          {
            pendingPaymentsCount = pendingPaymentsCount + 1
          }
        }
      }


      for ( const event of eventsMember){
        let details = await Member.findOne({
          eventId : event._id,
          memberId : ObjectId(req.user.id),
          requestStatus : 2,
          paymentReceiptStatus : 1
        })

        if(details){
          pendingPaymentsCount = pendingPaymentsCount + 1
        }
      }
      

      return SendResponse(
        res,
        {
          pendingPaymentsCount: pendingPaymentsCount,
          eventList: [...pendingEventList, ...acceptedEventList].slice(
            start,
            end
          ),
          total : [...pendingEventList, ...acceptedEventList].length
          // eventList: [...pendingEventList, ...acceptedEventList],
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

  getMySchedulesForSync: async (req, res) => {
    try {
      let params = {};

      let pendingEventParams = [
        {
          $eq: ["$_id", "$$eventId"],
        },
        // {
        //   $eq: ["$isComplete", false],
        // }
      ];

      params = Object.assign(params, {
        $and: [
          // {
          // eventDate: {
          //   $gte: new Date(new Date(req.query.date).setHours(00, 00, 00)),
          //   $lt: new Date(new Date(req.query.date).setHours(23, 59, 59)),
          // },
          // },
          {
            $or: [
              {
                $and: [
                  {
                    creatorId: ObjectId(req.user.id),
                  },
                  // {
                  //   isComplete: false,
                  // },
                ],
              },
              {
                $and: [
                  {
                    members: ObjectId(req.user.id),
                  },
                  // {
                  //   isComplete: false,
                  // },
                ],
              },
            ],
          },
        ],
      });

      if (req.query.type == "practice") {
        params = Object.assign(params, {
          eventType: "practice",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "practice"],
        });
      }

      if (req.query.type == "game") {
        params = Object.assign(params, {
          eventType: "game",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "game"],
        });
      }

      if (req.query.type == "tournament") {
        params = Object.assign(params, {
          eventType: "tournament",
        });

        pendingEventParams.push({
          $eq: ["$eventType", "tournament"],
        });
      }

      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          eventName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      if (req.query.updatedAt != "" && req.query.updatedAt != null) {
        params = Object.assign(params, {
          createdAt: { $gte: new Date(req.query.updatedAt) },
        });

        pendingEventParams.push({
          $gte: ["$createdAt", new Date(req.query.updatedAt)],
          // createdAt: { $gte: new Date(req.query.updatedAt) }
        });
      }
      const acceptedEventList = await Event.aggregate([
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
          $unwind: {
            path: "$sportDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $lookup: {
        //     from: "members",
        //     let: {
        //       userId: "$members",
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $in: ["$memberId", "$$userId"],
        //           },
        //         },
        //       },
        //       {
        //         $project: {
        //           _id: 1,
        //           fullName: 1,
        //           email: 1,
        //           image: 1,
        //           isAdmin: 1,
        //           memberId: 1,
        //           requestStatus: 1,
        //         },
        //       },
        //     ],
        //     as: "memberDetails",
        //   },
        // },
        // {
        //   $lookup: {
        //     from: "sports",
        //     localField: "sportId",
        //     foreignField: "_id",
        //     as: "sportDetails",
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$sportDetails",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            creatorId: 1,
            eventName: 1,
            eventType: 1,
            teamId: 1,
            opponentName: 1,
            sportId: 1,
            // facilityId: 1,
            location: 1,
            address: 1,
            eventDate: 1,
            eventDateUTC: 1,
            endTimeUTC: 1,
            startTime: 1,
            endTime: 1,
            notes: 1,
            isSplitPayment: 1,
            isComplete: 1,
            // members: "$memberDetails",
            // sport: "$sportDetails",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const pendingEventList = await Member.aggregate([
        {
          $match: {
            memberId: ObjectId(req.user.id),
            requestStatus: 1,
            isEventMember: true,
          },
        },
        {
          $lookup: {
            from: "events",
            let: {
              eventId: "$eventId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: pendingEventParams,
                  },
                },
              },
              // {
              //   $lookup: {
              //     from: "sports",
              //     let: {
              //       sportId: "$sportId",
              //     },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: {
              //             $eq: ["$_id", "$$sportId"],
              //           },
              //         },
              //       },
              //     ],
              //     as: "sportDetails",
              //   },
              // },
              // {
              //   $lookup: {
              //     from: "members",
              //     let: {
              //       userId: "$members",
              //     },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: {
              //             $in: ["$memberId", "$$userId"],
              //           },
              //         },
              //       },
              //       {
              //         $project: {
              //           _id: 1,
              //           fullName: 1,
              //           email: 1,
              //           image: 1,
              //           isAdmin: 1,
              //         },
              //       },
              //     ],
              //     as: "memberDetails",
              //   },
              // },
              {
                $project: {
                  _id: 1,
                  createdAt: 1,
                  creatorId: 1,
                  eventName: 1,
                  eventType: 1,
                  teamId: 1,
                  opponentName: 1,
                  sportId: 1,
                  // facilityId: 1,
                  location: 1,
                  address: 1,
                  eventDate: 1,
                  eventDateUTC: 1,
                  endTimeUTC: 1,
                  startTime: 1,
                  endTime: 1,
                  notes: 1,
                  isSplitPayment: 1,
                  isComplete: 1,
                  // members: "$memberDetails",
                  // sport: "$sportDetails",
                },
              },
            ],
            as: "eventDetails",
          },
        },
        {
          $unwind: "$eventDetails",
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            image: 1,
            isAdmin: 1,
            eventId: 1,
            event: "$eventDetails",
            startTime: "$eventDetails.startTime",
            requestStatus: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return SendResponse(
        res,
        {
          eventList: [...pendingEventList, ...acceptedEventList],
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

  getPendingPaymentsList: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
     
      let members = await Member.find(
        { $or: [ 
        {
          memberId: ObjectId(req.user.id),
          // creatorId: { $ne : ObjectId(req.user.id)},
          SplitPaymentBy : { $ne : ObjectId(req.user.id)},
          isEventMember: true,
          requestStatus: 2,
          paymentReceiptStatus: 1,
        },
        {
          // creatorId: ObjectId(req.user.id),
          SplitPaymentBy: ObjectId(req.user.id),
          memberId: { $ne : ObjectId(req.user.id)},
          isEventMember: true,
          requestStatus: 2,
          paymentReceiptStatus: 1,
        },
        // {
        //   creatorId: ObjectId(req.user.id),
        //   memberId:  ObjectId(req.user.id),
        //   isEventMember: true,
        //   requestStatus: 2,
        //   paymentReceiptStatus: 1,
        // }
      ]
      })
      .sort({
          createdAt: 1
        })
      // .skip(skipIndex).limit(limit)
        let eventIds = [];
        members.forEach(member => {
          if (!eventIds.find(item => item === member.eventId))
            eventIds.push(member.eventId)
        });


      const [{ eventList, total }] = await Event.aggregate([
        {
          $match: {
            _id: {
              $in: eventIds
            },
            paymentStatus: 1,
            isSplitPayment : true,
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              eventId: "$_id"
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$memberId", "$$userId"] },
                      { $eq: ["$eventId", "$$eventId"] },
                      { $eq: ["$requestStatus", 2] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  image: 1,
                  isAdmin: 1,
                  requestStatus: 1,
                  memberId: 1,
                  paymentScreenshots: 1,
                  paymentReceiptStatus: 1,
                  paymentReminderCount: 1,
                  paymentNotes: 1
                },
              },
            ],
            as: "memberDetails",
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
                  opponentName: 1,
                  sportId: 1,
                  location:1,
                  address: 1,
                  // facilityId: 1,
                  eventDate: 1,
                  startTime: 1,
                  endTime: 1,
                  notes: 1,
                  isComplete: 1,
                  isSplitPayment: 1,
                  SplitPaymentBy: 1,
                  members: 1,
                  memberDetails: "$memberDetails",
                  sport: "$sportDetails",
                },
              },
              {
                $sort: {
                  eventDate: 1,
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
      



      let eventData = {
        eventList: eventList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          eventData: eventData,
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

  sendEventRequestReminder: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        memberId: "required",
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

      let event = await Event.findById(ObjectId(req.body.eventId));
       
      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Event Not Found",
          422
        );
      }
      const timezone = getTimezone(event.location.coordinates[1], event.location.coordinates[0]);

      let members = [];

      if (typeof req.body.memberId == "string") {
        members = req.body.memberId.split(",");
      } else {
        members = req.body.memberId;
      }
      let pendingMemberExists = false;
      const memberPromises = members.map(async (member) => {
        let eventMemberDetails = await Member.findById(member);
        if(eventMemberDetails.requestStatus == 1 ){
          pendingMemberExists = true;
          eventMemberDetails.confirmationReminderCount =
          eventMemberDetails.confirmationReminderCount + 1;
        eventMemberDetails.confirmationReminderTime = new Date();
        await eventMemberDetails.save();
        let isMemberRegisteredAsUser = await User.findOne({
          email : eventMemberDetails.email,
          isDeleted : false,
          status : true
        });
        // send notification to member to accept request
        if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
          let data = { 
            title : 'Event Invitation Request',
            message : `You have been invited to join ${event.eventName} event`,
            eventId : (event._id).toString() ,
            memberId : (eventMemberDetails._id).toString(),
            email : eventMemberDetails.email,
            type: 'eventInvitationRequest'
          };

          await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
          await Notification.create({
            title: data.title,
            message: data.message,
            receiverEmail: data.email,
            eventId : data.eventId,
            senderId : req.user.id,
            memberId : eventMemberDetails._id,
            receiverId : isMemberRegisteredAsUser._id,
            type : data.type,
            senderType : "user"
          });
        }

        //send email to eventMemberDetails to pay expense
        let mailSend = await mail.sendTemplate({
          email: eventMemberDetails.email,
          subject: `Request to join ${event.eventName} event`,
          locale: "en",
          template: "eventContribution.ejs",
          memberName : eventMemberDetails.fullName, 
          adminName : req.user.fullName,
          currencyCode : event.currencyCode,
          expenseContribution : expenseContribution, 
          eventName : event.eventName,
          link : `${process.env.Url}/api/v1/user/event/request/${event._id}/${eventMemberDetails.email}/${eventMemberDetails._id}`,
          accountDetails : event.accountDetails,
          eventLocation : event.address,
          startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
          time : `${moment(event.startTime).format('h:mm a')} - ${moment(event.endTime).format('h:mm a')} ${timezone}`,
          // html: `Hi ${eventMemberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to  join ${event.eventName} event.<br><br>
          //                     <a href= "${process.env.Url}/api/v1/user/event/request/${event._id}/${eventMemberDetails.email}/${eventMemberDetails._id}">Click here</a><br><br>
          //                     to join the event.
          //                     <br><br>
          //                     Thanks & Regards,
          //                     <br>
          //                     Sports Nerve Team
          //                     `,
        });

        if (!mailSend) {
          return false; // indicate mail send failure
        }
        }
        return true; // indicate mail send success
      });

      const results = await Promise.all(memberPromises);
      let msg;
      if(pendingMemberExists){
        const isMailError = results.includes(false);
        msg = isMailError
        ? "Reminder mail can't send to some of the users for event request"
        : "Event request sent";
      }else{
        msg = "No member exists in pending state";
      }
      return SendResponse(res, {}, msg, 200);
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

  //split payment

  splitPaymentInEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        isSplitEqually: "required",
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
      let event = await Event.findById(ObjectId(req.body.eventId));
      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event exists",
          422
        );
      }

      if ( event.isSplitPayment == true ){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Event expenses payment already split",
          422
        );
      }

      event.isSplitPayment = true;
      event.SplitPaymentBy = req.user.id;
      event.accountDetails = req.body.accountDetails; 
      const timezone = getTimezone(event.location.coordinates[1], event.location.coordinates[0]);


      if (req.body.isSplitEqually == "true") {

        let members = await Member.find({
          eventId: event._id,
          requestStatus: 2,
        });

        members.forEach(async (member) => {
          member.expenseContribution =
            event.totalExpenses / event.members.length;

          let isMemberRegisteredAsUser = await User.findOne({ 
            email : member.email,
            isDeleted : false,
            status : true
            });

          if( member.memberId.toString() == req.user.id){
            await Member.findByIdAndUpdate(member._id, {
              $set: {
                expenseContribution: event.totalExpenses / event.members.length,
                currencyCode: event.currencyCode,
                paymentReceiptStatus: 2,
                SplitPaymentBy : req.user.id
              },
            });
          }else{

            await Member.findByIdAndUpdate(member._id, {
              $set: {
                expenseContribution: event.totalExpenses / event.members.length,
                currencyCode: event.currencyCode,
                SplitPaymentBy: req.user.id
              },
            });
            // send notification to member to pay expense
            if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
              let data = { 
                title : 'Event Payment Request',
                message : `Pay your contribution ${(member.expenseContribution).toFixed(2)} ${event.currencyCode} for ${event.eventName}`,
                eventId : (event._id).toString() ,
                memberId : (member._id).toString(),
                email : member.email,
                type: 'eventPaymentRequest'
              };
    
              await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
              await Notification.create({
                title: data.title,
                message: data.message,
                receiverEmail: data.email,
                eventId : data.eventId,
                senderId : req.user.id,
                memberId : memberDetails._id,
                receiverId : isMemberRegisteredAsUser._id, 
                type : data.type,
                senderType : "user"
              });
            }
            //send email to member to pay expense
            mail.sendTemplate({
              email: member.email,
              subject: "Request to pay your contribution for event",
              locale: "en",
              template: "eventContribution.ejs",
              memberName : member.fullName, 
              adminName : req.user.fullName,
              currencyCode : event.currencyCode,
              expenseContribution : member.expenseContribution.toFixed(2), 
              eventName : event.eventName,
              link : `${process.env.Url}/api/v1/user/event/payment/request/${member._id}/${event._id}/${member.email}`,
              accountDetails : event.accountDetails,
              eventLocation : event.address,
              startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
              time : `${moment(event.startTime).format('h:mm a')} - ${moment(event.endTime).format('h:mm a')} ${timezone}`,
              // html: `Hi ${member.fullName}, <br><br>${req.user.fullName} sent you a request to pay your contribution ${event.currencyCode} ${(member.expenseContribution).toFixed(2)} in expenses in ${event.eventName} event.<br><br>
              //       <a href= "${process.env.Url}/api/v1/user/event/payment/request/${member._id}/${event._id}/${member.email}">Click here</a><br><br>
              //       To upload the payment screenshot for the event.
              //       <br><br>
              //       Thanks & Regards,
              //       <br>
              //       Sports Nerve Team
              //       `,
            });
          }
        });

        event.perHeadExpenses = (
          event.totalExpenses / event.members.length
        ).toFixed(2);
        event.isSplitEqually = true;
        await event.save();

        return SendResponse(
          res,
          {},
          "Payment Split Successfully And Mail Sent To Members For Payment",
          200
        );
      } else {
        // req.body.members = JSON.parse(req.body.members);
        if ( Math.round(event.totalExpenses) === Math.round(total) ) {
          req.body.members.forEach(async (member) => {
            let memberDetails = await Member.findById(
              ObjectId(member.memberId)
            );
            let isMemberRegisteredAsUser = await User.findOne({ 
              email : member.email,
              isDeleted : false,
              status : true
              });
            if (memberDetails) {
              memberDetails.expenseContribution = member.contribution;
              memberDetails.currencyCode = event.currencyCode;
              memberDetails.SplitPaymentBy = req.user.id
              memberDetails.save(); 
              // send notification to member to pay expense
            if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
              let data = { 
                title : 'Event Payment Request',
                message : `Pay your contribution ${(memberDetails.expenseContribution).toFixed(2)} 
                ${event.currencyCode} for ${event.eventName}`,
                eventId : (event._id).toString() ,
                memberId : (memberDetails._id).toString(),
                email : memberDetails.email,
                type: 'eventPaymentRequest'
              };
    
              await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
              await Notification.create({
                title: data.title,
                message: data.message,
                receiverEmail: data.email,
                eventId : data.eventId,
                senderId : req.user.id,
                memberId : memberDetails._id,
                receiverId : isMemberRegisteredAsUser._id,
                type : data.type,
                senderType : "user"
              });
            }
              if( memberDetails.memberId.toString() != req.user.id){
                //send email to member to pay expense
                mail.sendTemplate({
                  email: memberDetails.email,
                  subject: "Request to pay your contribution for event",
                  locale: "en",
                  template: "eventContribution.ejs",
                  memberName : memberDetails.fullName, 
                  adminName : req.user.fullName,
                  currencyCode : event.currencyCode,
                  expenseContribution : memberDetails.expenseContribution.toFixed(2), 
                  eventName : event.eventName,
                  link : `${process.env.Url}/api/v1/user/event/payment/request/${memberDetails._id}/${event._id}/${memberDetails.email}`,
                  accountDetails : event.accountDetails,
                  eventLocation : event.address,
                  startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
                  time : `${moment(event.startTime).format('h:mm a')} - ${moment(event.endTime).format('h:mm a')} ${timezone}`,
                  // html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to pay your contribution  ${(memberDetails.expenseContribution).toFixed(2)} ${event.currencyCode}in expenses in ${event.eventName} event.<br><br>
                  //             <a href= "${process.env.Url}/api/v1/user/event/payment/request/${memberDetails._id}/${event._id}/${memberDetails.email}">Click here</a><br><br>
                  //             To upload the payment screenshot for the event.
                  //             <br><br>
                  //             Thanks & Regards,
                  //             <br>
                  //             Sports Nerve Team
                  //             `,
                });
              }
            }
          });
          await event.save();
          return SendResponse(
            res,
            {},
            "Payment Split Successfully And Mail Sent To Members For Payment",
            200
          );
        } else {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "Expense Contribution per head not valid",
            422
          );
        }
      }
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

  getEventPaymentDetails: async (req, res) => {
    try {
      let eventMemberDetails = await Member.findById(req.params.memberId);

      if (!eventMemberDetails)
        res.status(422).send("<h1> Event request not found </h1>");

      res
        .status(201)
        .send(
          `<script>window.location.href='${process.env.APP_URL}?eventId=${req.params.eventId}&email=${req.params.email}&memberId=${req.params.memberId}&isSplitPayment=true'</script>`
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

  addExpenseReceipt: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        memberId: "required",
        notes: "required",
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

      const eventDetails = await Event.findById(req.body.eventId);

      let member = await Member.findById(req.body.memberId);

      if (!member) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such member exists",
          422
        );
      }

      if (req.files && req.files.paymentScreenshots) {
        if( !Array.isArray(req.files.paymentScreenshots)){
          req.files.paymentScreenshots = [req.files.paymentScreenshots];
        }
        for (const image of req.files.paymentScreenshots) {
          let paymentScreenshot = await FileUpload.uploadFile({
            file: image,
            path: `${STORAGE_PATH}/eventReceipts/`,
          });
          await member.paymentScreenshots.push(
            process.env.AWS_URL + paymentScreenshot.Key
          );
        }
      }

      member.paymentReceiptStatus = 2;
      member.paymentReceiptUploadTime = req.body.paymentReceiptUploadTime;
      member.paymentNotes = req.body.notes;
      member.save();
      
      if (
        !(await Member.findOne({
          eventId: ObjectId(req.body.eventId),
          requestStatus: 2,
          paymentReceiptStatus: 1,
        }))
      ) {
        await Event.findByIdAndUpdate(ObjectId(req.body.eventId), {
          $set: {
            paymentStatus: 2,
          },
        });
      }
      const eventPaymentSplitByDetails = await User.findOne({
        _id : ObjectId(eventDetails.SplitPaymentBy),
        status : true,
        isDeleted : false
      });


      // send notification to the user who has split payment 
      if( eventPaymentSplitByDetails && eventPaymentSplitByDetails.deviceToken && eventPaymentSplitByDetails.deviceToken != null && eventPaymentSplitByDetails.deviceToken != ""){
        let data = { 
          title : 'Payment receipt uploaded',
          message : `${member.fullName} has uploaded payment receipt for ${eventDetails.eventName}.`,
          eventId : (eventDetails._id).toString() ,
          type: 'eventExpenseReceipt'
        };

        await pushNotification.sendNotification(eventPaymentSplitByDetails.deviceToken, data);
        await Notification.create({
          title: data.title,
          message: data.message,
          eventId : data.eventId,
          senderId : req.user.id,
          receiverId : eventPaymentSplitByDetails._id,
          type : data.type,
          senderType : "user"
        });
      }

      return SendResponse(res, {}, "Receipt Uploaded Successfully", 200);
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

  confirmPaymentReceipt: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        memberId: "required",
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

      let member = await Member.findOne({
        _id: req.body.memberId,
        paymentReceiptStatus: 2,
      });

      if (!member) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such payment of member exists",
          422
        );
      }

      member.paymentReceiptStatus = 3;
      member.save();
      const eventDetails = await Event.findById(req.body.eventId).populate('SplitPaymentBy');
      if( !await Member.findOne({
           memberId : { $in : eventDetails.members.map((item) => { ObjectId(item)})},
           eventId : ObjectId(req.body.eventId),
           requestStatus : 2,
           paymentReceiptStatus : { $in : [ 1,2 ] }
      })){
        eventDetails.isAllPaymentsConfirmed = true;
        await eventDetails.save();
      }
      let userDetails = await User.findOne({
        _id : ObjectId(member.memberId),
        status : true,
        isDeleted : false
      });
       // send notification to the user who had uploaded the receipt
       if( userDetails && userDetails.deviceToken && userDetails.deviceToken != null && userDetails.deviceToken != ""){
        let data = { 
          title : 'Payment confirmation',
          message : `Your payment for ${eventDetails.eventName} has been approved by ${eventDetails.SplitPaymentBy.fullName}`,
          eventId : (eventDetails._id).toString() ,
          type: 'eventPaymentConfirm'
        };

        await pushNotification.sendNotification(userDetails.deviceToken, data);
        await Notification.create({
          title: data.title,
          message: data.message,
          eventId : data.eventId,
          senderId : req.user.id,
          receiverId : userDetails._id,
          type : data.type,
          senderType : "user"
        });
      }

      return SendResponse(res, {}, "Payment Confirmed Successfully", 200);
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

  sendPaymentReminder: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
        memberId: "required",
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

      let event = await Event.findById(ObjectId(req.body.eventId));
      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event exists",
          422
        );
      }
      
      const timezone = getTimezone(event.location.coordinates[1], event.location.coordinates[0]);
      let members = [];
      let msg;
      let isMailError = false;

      if (typeof req.body.memberId == "string") {
        members = req.body.memberId.split(",");
      } else {
        members = req.body.memberId;
      }

      for (const member of members) {
        memberDetails = await Member.findById(member);

        memberDetails.paymentReminderCount =
          memberDetails.paymentReminderCount + 1;
        memberDetails.paymentReminderTime = new Date();
        memberDetails.save();

        let isMemberRegisteredAsUser = await User.findOne({
          email : memberDetails.email,
          isDeleted : false,
          status: true
        });

         // send notification to member to accept request
         if( isMemberRegisteredAsUser && isMemberRegisteredAsUser.deviceToken && isMemberRegisteredAsUser.deviceToken != null && isMemberRegisteredAsUser.deviceToken != ""){
          let data = { 
            title : 'Event Payment Request',
            message : `Pay your contribution ${(memberDetails.expenseContribution).toFixed(2)} 
            ${event.currencyCode} for ${event.eventName}`,
            eventId : (event._id).toString() ,
            memberId : (memberDetails._id).toString(),
            email : memberDetails.email,
            type: 'eventPaymentRequest'
          };

          await pushNotification.sendNotification(isMemberRegisteredAsUser.deviceToken, data);
          await Notification.create({
            title: data.title,
            message: data.message,
            receiverEmail: data.email,
            eventId : data.eventId,
            senderId : req.user.id,
            memberId : memberDetails._id,
            receiverId : isMemberRegisteredAsUser._id,
            type : data.type,
            senderType : "user"        
          });
        }

        //send email to member to pay expense
        let mailSend = await mail.sendTemplate({
          email: memberDetails.email,
          subject: "Request to pay your contribution for event",
          locale: "en",
          template: "eventContribution.ejs",
          memberName : memberDetails.fullName, 
          adminName : req.user.fullName,
          currencyCode : event.currencyCode,
          expenseContribution : memberDetails.expenseContribution.toFixed(2), 
          eventName : event.eventName,
          link : `${process.env.Url}/api/v1/user/event/payment/request/${memberDetails._id}/${event._id}/${memberDetails.email}`,
          accountDetails : event.accountDetails,
          eventLocation : event.address,
          startDate : moment(event.eventDate).format('DD MMMM, YYYY'),
          time : `${moment(event.startTime).format('h:mm a')} - ${moment(event.endTime).format('h:mm a')} ${timezone}`,
          // html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to pay your contribution in expenses in ${event.eventName} event.<br><br>
          //                 <a href= "${process.env.Url}/api/v1/user/event/payment/request/${memberDetails._id}/${event._id}/${memberDetails.email}">Click here</a><br><br>
          //                 To upload the payment screenshot for the event.
          //                 <br><br>
          //                 Thanks & Regards,
          //                 <br>
          //                 Sports Nerve Team
          //                 `,
        });

        if (!mailSend) {
          isMailError = true;
        }

        msg = isMailError
          ? "Reminder mail can't send to some of the users for event payment"
          : "Payment Reminder Sent Successfully";
      }

      // members.forEach(async (member) => {

      //   memberDetails = await Member.findById(member);

      //   memberDetails.paymentReminderCount = memberDetails.paymentReminderCount + 1;
      //   memberDetails.save();

      //   //send email to member to pay expense
      //   let mailSend = await mail.send({
      //     email: memberDetails.email,
      //     subject: "Request to pay your contribution for event",
      //     html: `Hi ${memberDetails.fullName}, <br><br>${req.user.fullName} sent you a request to pay your contribution in expenses in ${event.eventName} event.<br><br>
      //                     <a href= "${process.env.Url}/api/v1/user/event/payment/request/${memberDetails._id}">Click here</a><br><br>
      //                     To upload the payment screenshot for the event.
      //                     <br><br>
      //                     Thanks & Regards,
      //                     <br>
      //                     Sports Nerve Team
      //                     `,
      //   });

      //   if (!mailSend) {
      //     isMailError = true;
      //   }

      //   msg = isMailError
      //   ? "Reminder mail can't send to some of the users for event payment"
      //   : "Payment Reminder Sent Successfully";
      // });
      return SendResponse(res, {}, msg, 200);
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

  //end event admin
  endEvent: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        eventId: "required",
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

      let event = await Event.findById(ObjectId(req.body.eventId));

      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event found",
          500
        );
      }

      event.isComplete = true;
      event.save();

      return SendResponse(res, {}, "Event Ended Successfully", 200);
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

  //cancel event
  cancelEvent: async (req, res) => {
    try {
      let event = await Event.findById(ObjectId(req.params.eventId));

      if (!event) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No such event found",
          500
        );
      }

      await event.delete();

      const members = await Member.deleteMany({
        eventId: ObjectId(req.params.eventId),
      });

      return SendResponse(res, {}, "Event Deleted Successfully", 200);
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

  //download event members list
  downloadMembersList: async (req, res) => {
    try {
      let params = {};

      params = Object.assign(params, {
        _id: ObjectId(req.params.eventId),
      });

      let memberParams = [
        // {
        //   $in: ["$memberId", "$$userId"],
        // },
        {
          $eq: ["$eventId", "$$eventId"],
        },
        { $eq: ["$status", true] },
      ];

      if (req.query.memberType == "yes") {
        memberParams.push({
          $eq: ["$requestStatus", 2],
        });
      }

      if (req.query.memberType == "no") {
        memberParams.push({
          $eq: ["$requestStatus", 3],
        });
      }

      if (req.query.memberType == "pending") {
        memberParams.push({
          $eq: ["$requestStatus", 1],
        });
      }

      let [eventDetails] = await Event.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              eventId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$memberId", "$$userId"] },
                      { $eq: ["$eventId", "$$eventId"] },
                      { $eq: ["$requestStatus", 2] },
                      { $eq: ["$status", true] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  image: 1,
                  isAdmin: 1,
                  expenseContribution: 1,
                  requestStatus: 1,
                  memberId: 1,
                  eventId: 1,
                  email: 1,
                  confirmationReminderCount: 1,
                  paymentReminderCount: 1,
                  paymentReceiptStatus: 1,
                  paymentNotes: 1,
                  currencyCode: 1,
                  paymentScreenshots: 1,
                  // yourContribution: {
                  //   $cond: {
                  //     if: {
                  //       $eq: ["$isSplitEqually", true],
                  //     },
                  //     then: "$perHeadExpenses",
                  //     else: "$expenseContribution",
                  //   },
                  // },
                  yourContribution: "$expenseContribution",
                  status: 1
                },
              },
            ],
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "members",
            let: {
              userId: "$members",
              eventId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: memberParams,
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  image: 1,
                  isAdmin: 1,
                  expenseContribution: 1,
                  requestStatus: 1,
                  memberId: 1,
                  eventId: 1,
                  email: 1,
                  confirmationReminderCount: 1,
                  paymentReminderCount: 1,
                  paymentReceiptStatus: 1,
                  paymentNotes: 1,
                  currencyCode: 1,
                  paymentScreenshots: 1,
                  // yourContribution: {
                  //   $cond: {
                  //     if: {
                  //       $eq: ["$isSplitEqually", true],
                  //     },
                  //     then: "$perHeadExpenses",
                  //     else: "$expenseContribution",
                  //   },
                  // },
                  yourContribution: "$expenseContribution",
                  status: 1
                },
              },
            ],
            as: "allMemberDetails",
          },
        },
        // {
        //   $lookup: {
        //     from: "eventexpenses",
        //     localField: "_id",
        //     foreignField: "eventId",
        //     as: "eventExpensesDetails",
        //   },
        // },
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
          $project: {
            _id: 1,
            eventName: 1,
            eventType: 1,
            opponentName: 1,
            eventDate: 1,
            startTime: 1,
            endTime: 1,
            notes: 1,
            creatorIsAdmin: 1,
            creatorId: 1,
            currencyCode: 1,
            members: "$memberDetails",
            allMemberDetails: "$allMemberDetails",
            sport: "$sportDetails",
            location: 1,
            address: 1,
            // acceptedMembersCount : 3,
            // pendingMembersCount: 2,
            // rejectedMembersCount : 8,
            isSplitEqually: 1,
            SplitPaymentBy: 1,
            isSplitPayment: 1,
            paymentStatus: 1,
            // eventExpenses: "$eventExpensesDetails",
            // totalExpenses: {
            //   $sum: "$eventExpensesDetails.cost",
            // },
          },
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Name",
        "Team Name",
        "About me",
        "Expectations",
        "Jersey Name",
        "Jersey No.",
        "Shirt Size",
        "Pant Size",
        "Team Sport",
        "Team Admin",
        "EventAdmin",
        "Event Sport",
        "Event Type",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Report.xlsx";
      let eventMembers = [];
      for( const member of eventDetails.members){
        let eventTeamMembers = await Member.aggregate([{
          $match: {
            memberId : ObjectId(member.memberId),
            creatorId : ObjectId(eventDetails.creatorId),
            requestStatus : 2,
            status : true,
            isTeamMember : true,
            isEventMember : false,
            isFamilyMember : false,
            isNormalMember : false,
          },
        },
        {
          $lookup : {
            from : "user_teams",
            as: "TeamDetails",
            let: {
              teamId: "$teamId"
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$teamId"]
                  }
                }
              },
              {
                $lookup: {
                  from: "sports",
                  let: {
                    sportsId: "$sports_id"
                  },
                  pipeline: [{
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$sportsId"]
                      }
                    }
                  }, ],
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
          }
        },
        {
          $unwind: {
            path: "$TeamDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            memberId: 1,
            creatorId:1,
            fullName: 1,
            email: 1,
            image: 1,
            countryCode: 1,
            countryAlphaCode: 1,
            mobile: 1,
            requestStatus: 1,
            isAdmin: 1,
            teamDetails: "$TeamDetails",
            aboutCreator : 1,
            jerseyDetails: 1,
            description: 1,
            expectations: 1,
            status: 1
          },
        },
      ]);

          let teamMembers = await Member.find({
            memberId : ObjectId(member.memberId),
            creatorId : ObjectId(eventDetails.creatorId),
            requestStatus : 2,
            status: true,
            isTeamMember : true,
            isEventMember : false,
            isFamilyMember : false,
            isNormalMember : false,
          }).populate('teamId');
          if( eventTeamMembers.length > 0){
             for (const team of eventTeamMembers){
                // team.teamDetails = JSON.parse(team.teamDeatils);
                if (team.memberId.toString() == team.teamDetails.user_id.toString()) {
                  eventMembers.push({
                    fullName : member.fullName,
                    teamName : team.teamDetails.teamName,
                    teamSport : team.teamDetails.TeamSportsDetails.sports_name,
                    teamAdmin : team.isAdmin == true ? "true" : "false",
                    jersySize : team.teamDetails.aboutCreator != null ?
                    team.teamDetails.aboutCreator.jerseySize :
                    "",
                    pantSize : team.teamDetails.aboutCreator != null ?
                    team.teamDetails.aboutCreator.pantSize :
                    "",
                    nameOnJersey : team.teamDetails.aboutCreator != null ?
                    team.teamDetails.aboutCreator.nameOnJersey :
                    "",
                    numberOnJersey : team.teamDetails.aboutCreator != null ?
                    team.teamDetails.aboutCreator.numberOnJersey :
                    "",
                    expectations : team.teamDetails.aboutCreator ? team.teamDetails.aboutCreator.expectations : "",
                    description : team.teamDetails.aboutCreator ? team.teamDetails.aboutCreator.aboutCreator : "",
                    isAdmin : member.isAdmin
                  });
                }else{
                 eventMembers.push({
                   fullName : member.fullName,
                   teamName : team.teamDetails.teamName,
                   teamSport : team.teamDetails.TeamSportsDetails.sports_name,
                   teamAdmin : team.isAdmin == true ? "true" : "false",
                   jersySize : team.jerseyDetails != null ? team.jerseyDetails.shirt_size : "",
                   pantSize :  team.jerseyDetails != null ? team.jerseyDetails.pant_size : "",
                   nameOnJersey : team.jerseyDetails != null ? team.jerseyDetails.name : "",
                   numberOnJersey : team.jerseyDetails != null ? team.jerseyDetails.number : "",
                   expectations : team.expectations,
                   description :  team.description,
                   isAdmin : member.isAdmin
                 });
                }
             } 
          }else{
            eventMembers.push(member);
          }
      }
      //get wanted params by mapping
      const result = Object.values(eventMembers).map((val, index) => {
        return [
          index + 1,
          val.fullName,
          val.teamName ? val.teamName : "",
          val.description ? val.description : "",
          val.expectations ? val.expectations : "",
          val.nameOnJersey ? val.nameOnJersey : "",
          val.numberOnJersey ? val.numberOnJersey : "", 
          val.jersySize ? val.jersySize : "",
          val.pantSize ? val.pantSize : "",
          val.teamSport ? val.teamSport : "",
          val.teamAdmin ? val.teamAdmin : "",
          val.isAdmin == true ? "true" : "false",
          eventDetails.sport.sports_name,
          eventDetails.eventType,
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
};
