const { dump } = require("./dump");
const ChatMessage = require("../models/chatmessage");
const Chat = require("../models/chat");
const ChatMessageCount = require("../models/chatmessagecount");
const User = require("../models/user");
const Facility = require("../models/facility");
const Training = require("../models/training");
const TrainingBooking = require("../models/trainingBooking");
const Team = require("../models/userteam");
const Event = require("../models/event");
const pushNotification = require("../firebase/index");
const Notification = require("../models/notification");
const Member = require("../models/member");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const base64 = require("base-64");
const utf8 = require("utf8");
module.exports = (io) => {
  io.on("connection", (socket) => {
    // Store user ID when a user connects
    socket.userId = socket.handshake.query.userId;
    // Store user type when a user connects
    socket.userType = socket.handshake.query.userType;
    // update isOnline status of the logged in user
    if (socket.userId && socket.userType) {
      if (socket.userType == "user") {
        User.findByIdAndUpdate(socket.userId, {
          isOnline: true,
        });
      } else if (socket.userType == "facility") {
        Facility.findByIdAndUpdate(socket.userId, {
          isOnline: true,
        });
      }
    }
    socket.on("disconnect", async () => {
      console.log("User disconnected: " + socket.userId);
      if (socket.userId && socket.userType) {
        if (socket.userType == "user") {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } else if (socket.userType == "facility") {
          await Facility.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
        // } else {
        //     await Admin.findByIdAndUpdate(socket.userId, {
        //         isOnline: false,
        //         lastSeen: new Date()
        //     })
        // }
        //update sidebar while user connect
        updateUserSideBar({
          senderId: socket.userId,
        });
      }
    });

    socket.on("chatList", async (data) => {
      updateUserSideBar(data);
    });

    // //get chat messages
    // socket.on("chatMessage", async (data) => {
    //   let message = await ChatMessage.find({
    //     roomId: data.roomId,
    //     status: true
    //   }).lean()
    //   if (!await ChatMessage.findOne({
    //       roomId: data.roomId,
    //       seenBy: {
    //         $in: data.senderId
    //       }
    //     })) {
    //     await ChatMessage.findOneAndUpdate({
    //       roomId: data.roomId
    //     }, {
    //       $push: {
    //         seenBy: data.senderId
    //       }
    //     })
    //   }
    //   for (let index = 0; index < message.length; index++) {
    //     let sender = {}
    //     if (message[index].senderType == 'user') {
    //       sender = await User.findById(message[index].senderId)

    //     } else if (message[index].senderType == 'facility') {
    //       sender = await Facility.findById(message[index].senderId)
    //     }
    //     //add sender data in list
    //     message[index].sender = {
    //       senderId: sender._id,
    //       name: (message[index].senderType == 'facility') ? sender.name : sender.fullName ,
    //       // email: sender.email ? sender.email : '',
    //       // isOnline: sender.isOnline,
    //       // lastSeen: sender.lastSeen,
    //       profileImage: sender.profileImage ? sender.profileImage : null,
    //     }
    //   }
    //   //
    //   socket.join(data.roomId);
    //   io.to(data.roomId).emit("receiveMessages", {
    //     status: 200,
    //     message: "Message list data",
    //     result: message,
    //   });
    // });

    // update all user list
    async function updateUserSideBar(data) {
      try {
        let existInEvent = await Event.find({
          members: {
            $elemMatch: {
              $eq: ObjectId(data.senderId),
            },
          },
        });

        let existInTeam = await Team.find({
          members: {
            $elemMatch: {
              $eq: ObjectId(data.senderId),
            },
          },
        });
        let existInTraining = await Training.find({
          $or: [
            {
              coachesId: {
                $elemMatch: {
                  $eq: ObjectId(data.senderId),
                },
              },
            },
            {
              facilityAdminId: ObjectId(data.senderId),
            },
          ],
        });

        let existInTrainingBooking = await TrainingBooking.find({
          userId: ObjectId(data.senderId),
        });
        let params = {
          isArchived: false,
          status: true,
          $or: [
            {
              senderId: ObjectId(data.senderId),
            },
            {
              receiverId: ObjectId(data.senderId),
            },
            {
              trainingId: {
                $in: existInTraining.map((training) => ObjectId(training._id)),
              },
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

        if (
          data.isArchived &&
          data.isArchived != "" &&
          data.isArchived != null
        ) {
          params = Object.assign(params, {
            isArchived: true,
          });
        }

        let chatList = await Chat.aggregate([
          {
            $match: params,
          },
          {
            $lookup: {
              from: "users",
              let: { userIds: "$mentionedUsers.id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$userIds"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: "$fullName",
                    userType: "user",
                  },
                },
              ],
              as: "mentionedUserDetails",
            },
          },
          {
            $lookup: {
              from: "facilities",
              let: { facilityIds: "$mentionedUsers.id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$facilityIds"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    userType: "facility",
                  },
                },
              ],
              as: "mentionedFacilityDetails",
            },
          },
          {
            $addFields: {
              mentionedUsersWithDetails: {
                $map: {
                  input: "$mentionedUsers",
                  as: "mentionedUser",
                  in: {
                    $cond: {
                      if: { $eq: ["$$mentionedUser.userType", "user"] },
                      then: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$mentionedUserDetails",
                              as: "userDetail",
                              cond: {
                                $eq: ["$$userDetail._id", "$$mentionedUser.id"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      else: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$mentionedFacilityDetails",
                              as: "facilityDetail",
                              cond: {
                                $eq: [
                                  "$$facilityDetail._id",
                                  "$$mentionedUser.id",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $sort: { updatedAt: -1 },
          },
        ]);
        // let chatList = await Chat.find({
        //   status: true,
        //   $or: [
        //     {
        //       senderId: ObjectId(data.senderId),
        //     },
        //     {
        //       receiverId: ObjectId(data.senderId),
        //     },
        //     {
        //       trainingId: {
        //         $in: existInTraining.map((training) => ObjectId(training._id)),
        //       },
        //     },
        //     {
        //       trainingId: {
        //         $in: existInTrainingBooking.map((booking) =>
        //           ObjectId(booking.trainingId)
        //         ),
        //       },
        //     },
        //     {
        //       eventId: {
        //         $in: existInEvent.map((event) => ObjectId(event._id)),
        //       },
        //     },
        //     {
        //       teamId: {
        //         $in: existInTeam.map((team) => ObjectId(team._id)),
        //       },
        //     },
        //   ],
        // })
        //   .sort({ updatedAt: -1 })
        //   .lean();
        let list = [];
        for await (const chat of chatList) {
          let isAdmin = false;
          if (chat.admins.length) {
             isAdmin = chat.admins.some(admin => (admin.id).toString() === data.senderId)
          }
          let receiverInfo = {
            receiverId: "",
            receiverType: "",
          };
          if (chat.senderId.toString() == data.senderId) {
            receiverInfo.receiverId = chat.receiverId;
            receiverInfo.receiverType = chat.receiverType;
          } else {
            receiverInfo.receiverId = chat.senderId;
            receiverInfo.receiverType = chat.senderType;
          }
          let receiver;
          if (receiverInfo.receiverId && receiverInfo.receiverType == "user") {
            receiver = await User.findById(receiverInfo.receiverId);
            receiver.name = receiver.fullName;
          } else if (
            receiverInfo.receiverId &&
            receiverInfo.receiverType == "facility"
          ) {
            receiver = await Facility.findById(receiverInfo.receiverId);
          }
          let team = {};
          if (chat.teamId) {
            team = await Team.findOne({
              _id: chat.teamId,
            });
          }

          let event = {};
          if (chat.eventId) {
            event = await Event.findOne({
              _id: chat.eventId,
            }).populate("sportId");
          }

          let training = {};
          if (chat.trainingId) {
            training = await Training.findOne({
              _id: chat.trainingId,
            });
          }

          let messageCountParams = {
            roomId: chat.roomId,
            status: true,
            seenBy: {
              $nin: [ObjectId(data.senderId)],
            },
          }
          if(chat.chatType == 2 || chat.chatType == 3 || chat.chatType == 4 || chat.chatType == 5 || chat.chatType == 6 || chat.chatType == 7){
            let senderId = await chat.members.find(member => (member.id).toString() == data.senderId);
            if (!senderId) {
                let adminId = await chat.admins.find(admin => (admin.id).toString() == data.senderId);
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
              list.push({
                user: {
                  _id: receiver ? receiver._id : "",
                  name: receiver ? receiver.name : "",
                  profileImage: receiver ? receiver.profileImage : "",
                },
                // receiverId: receiver ? receiver._id : "",
                // name: receiver ? receiver.name : '',
                // email: receiver ? receiver.email : '',
                // isOnline: receiver ? receiver.isOnline : '',
                // lastSeen: receiver ? receiver.lastSeen : '',
                // profileImage: receiver.profileImage ? receiver.profileImage : null,
                receiverType: receiverInfo.receiverType,
                roomId: chat.roomId,
                messageType: chat.messageType,
                lastMessage: chat.lastMessage,
                chatType: chat.chatType,
                team: team,
                event: event,
                training: training,
                mentionedUsersWithDetails: chat.mentionedUsersWithDetails,
                count: count,
              });
             }
          }else{
            list.push({
              user: {
                _id: receiver ? receiver._id : "",
                name: receiver ? receiver.name : "",
                profileImage: receiver ? receiver.profileImage : "",
              },
              // receiverId: receiver ? receiver._id : "",
              // name: receiver ? receiver.name : '',
              // email: receiver ? receiver.email : '',
              // isOnline: receiver ? receiver.isOnline : '',
              // lastSeen: receiver ? receiver.lastSeen : '',
              // profileImage: receiver.profileImage ? receiver.profileImage : null,
              receiverType: receiverInfo.receiverType,
              roomId: chat.roomId,
              messageType: chat.messageType,
              lastMessage: chat.lastMessage,
              chatType: chat.chatType,
              team: team,
              event: event,
              training: training,
              mentionedUsersWithDetails: chat.mentionedUsersWithDetails,
              count: count,
            });
          }
          
        }
        // console.log("list-----------", list);
        socket.join(data.senderId);
        // console.log(chatUsers);
        io.to(data.senderId).emit("chatUserList", {
          status: 200,
          message: "user chat list",
          result: list,
        });
      } catch (error) {
        console.log(error);
      }
    }

    //initiate chat
    socket.on("initiateChat", async (data) => {
      try {
        // data={senderId:loginUserId,receiverId:opponent user id,type:1/2/3/4/5/6/7 1=>one to one,2=>team group 3=>team admin group,4=>event group,5=>event admin group,6=>training group,7=>training facility admins and coaches group, messageType:1/2/3/4/5/6 1 => message, 2 => image, 3 => video, 4 => doc, 5 => location, 6 => new member added / ( team/event ) group created, senderType: user/facility, receiverType: user/facility, trainingId: If Training Group Chat, eventId: If Event Group Chat, teamId: If Team Group Chat}
        // console.log(data, 'initiatechat');
        if (
          !data.senderId ||
          !data.receiverId ||
          !data.senderType ||
          !data.receiverType
        ) {
          invalidData(data.senderId, "Please send required data");
          if (data.senderType != "user" || data.senderType != "facility") {
            invalidData(data.senderId, "Please send required data");
          }
          if (data.receiverType != "user" || data.receiverType != "facility") {
            invalidData(data.senderId, "Please send required data");
          }
        }
        console.log("initiate chat--------------");
        console.log("data --------------", data);
        let chatExist = await Chat.findOne({
          $or: [
            {
              senderId: ObjectId(data.senderId),
              receiverId: ObjectId(data.receiverId),
            },
            {
              senderId: ObjectId(data.receiverId),
              receiverId: ObjectId(data.senderId),
            },
          ],
        });
        let sender;
        if (data.senderType == "user") {
          sender = await User.findById(data.senderId);
        } else {
          sender = await Facility.findById(data.senderId);
        }

        let receiver;
        if (data.receiverType == "user") {
          receiver = await User.findById(data.receiverId);
        } else {
          receiver = await Facility.findById(data.receiverId);
        }
        if (chatExist) {
          socket.join(chatExist.roomId);
          io.to(chatExist.roomId).emit("getRoomId", {
            roomId: chatExist.roomId,
            senderId: data.senderId,
            sendername: sender.fullName,
            senderimage: sender.profileImage,
            receiverId: data.receiverId,
            receivername: receiver.fullName,
            receiverimage: receiver.profileImage,
          });
        } else {
          let chatDetails = await Chat.create(data);

          socket.join(chatDetails.roomId);
          io.to(chatDetails.roomId).emit("getRoomId", {
            roomId: chatDetails.roomId,
            senderId: data.senderId,
            sendername: sender.fullName,
            senderimage: sender.profileImage,
            receiverId: data.receiverId,
            receiverfullName: receiver.fullName,
            receiverimage: receiver.profileImage,
          });
        }
        updateUserSideBar(data);
      } catch (error) {
        console.log(error);
      }
    });

    //send and receive message
    socket.on("sendMessage", async (data) => {
      console.log("data in send message-------------", data);
      const chatDetails = await Chat.findOne({ roomId : Number(data.roomId)});
      // if (chatDetails && chatDetails.chatType !== 1 ) {
      //   let senderId = await chatDetails.members.some(member => (member.id).toString() == data.senderId);
      //   let adminId = await chatDetails.admins.some(admin => (admin.id).toString() == data.senderId);
      //   if (!senderId && !adminId ) {
      //     socket.join(data.senderId);
      //     io.to(data.senderId).emit("receiveMessage", {
      //       status: 200,
      //       message: "You are no longer part of this group"
      //     });
      //   }
      // }
      let chatMessage;
      if (data.messageType == 1) {
        chatMessage = await ChatMessage.create({
          roomId: data.roomId,
          senderId: data.senderId,
          receiverId: data.receiverId ? data.receiverId : null,
          senderType: data.senderType,
          receiverType: data.receiverType,
          chatType: data.chatType,
          trainingId: data.trainingId ? data.trainingId : null,
          eventId: data.eventId ? data.eventId : null,
          teamId: data.teamId ? data.teamId : null,
          message: data.message,
          messageType: data.messageType,
          isForwarded: data.isForwarded,
          isReplied: data.isReplied ? data.isReplied : false,
          oldMessage: data.oldMessage ? data.oldMessage : {},
          mentionedUsers: data.mentionedUsers ? data.mentionedUsers : [],
          seenBy: [ObjectId(data.senderId)],
        });
        await Chat.updateOne(
          {
            roomId: data.roomId,
          },
          {
            $set: {
              lastMessage: data.message,
              messageType: data.messageType,
              mentionedUsers:
                data.mentionedUsers && data.mentionedUsers.length > 0
                  ? data.mentionedUsers
                  : [],
              updatedAt: new Date(),
            },
          }
        );
      } else {
        chatMessage = await ChatMessage.create({
          roomId: data.roomId,
          senderId: data.senderId,
          receiverId: data.receiverId ? data.receiverId : null,
          senderType: data.senderType,
          receiverType: data.receiverType,
          chatType: data.chatType,
          trainingId: data.trainingId ? data.trainingId : null,
          eventId: data.eventId ? data.eventId : null,
          teamId: data.teamId ? data.teamId : null,
          media: data.media ? data.media : [],
          latitude: data.latitude ? data.latitude : null,
          longitude: data.longitude ? data.longitude : null,
          message: null,
          messageType: data.messageType,
          isForwarded: data.isForwarded,
          isReplied: data.isReplied ? data.isReplied : false,
          oldMessage: data.oldMessage ? data.oldMessage : {},
          mentionedUsers: data.mentionedUsers ? data.mentionedUsers : [],
          seenBy: [ObjectId(data.senderId)],
        });

        await Chat.updateOne(
          {
            roomId: data.roomId,
          },
          {
            lastMessage: data.media ? "" : "location",
            messageType: data.messageType,
            mentionedUsers:
              data.mentionedUsers && data.mentionedUsers.length > 0
                ? data.mentionedUsers
                : [],
            updatedAt: new Date(),
          }
        );

        data.media = chatMessage.media;
      }
      let sender;
      if (data.senderType == "user") {
        sender = await User.findById(data.senderId);
      } else {
        sender = await Facility.findById(data.senderId).lean();
        sender.fullName = sender.name;
      }

      // let receiver;
      // if (data.receiverType == 'user') {
      //   receiver = await User.findById(data.receiverId);
      // } else {
      //   receiver = await Facility.findById(data.receiverId);
      // }
      data.senderDetails = sender;
      // data.receiver = receiver
      socket.join(data.roomId);
      data._id = chatMessage._id;
      data.createdAt = chatMessage.createdAt;
      // Send Notifications to members of roomIds
      if (data.chatType == 1) {
        let receiverId ; 
        // send notification to reciverId only in case of one 2 one chat
        const chatDetails = await Chat.findOne({ roomId: data.roomId });
        if( chatDetails.receiverId.toString() != data.senderId ){
          receiverId = chatDetails.receiverId
        }else {
          receiverId = chatDetails.senderId;
        }
        let isMemberRegisteredAsUser;
        if (data.receiverType == "user") {
          isMemberRegisteredAsUser = await User.findById(
            receiverId
          );
        } else {
          isMemberRegisteredAsUser = await Facility.findById(
            receiverId
          );
        }
        if (
          isMemberRegisteredAsUser &&
          isMemberRegisteredAsUser.deviceToken &&
          isMemberRegisteredAsUser.deviceToken != null &&
          isMemberRegisteredAsUser.deviceToken != ""
        ) {
          let decodedMessage = data.message ? base64.decode(data.message) : '';
          let notificationData = {
            title: `${sender.fullName}`,
            roomId: data.roomId.toString(),
            chatType: data.chatType.toString(),
            messageType: data.messageType.toString(),
            message: data.message
              ?  decodedMessage.replace(/\@\[([^\]]+)\]/g, "@$1").replace(/\([^)]+\)/g, "")
              : data.messageType == 2
              ? "Photo"
              : data.messageType == 3
              ? "Video"
              : data.messageType == 4
              ? "Document"
              : data.messageType == 5
              ? "Location"
              : data.messageType == 6
              ? "Please Welcome"
              : "",
            latitude: data.latitude ? data.latitude.toString() : "",
            longitude: data.longitude ? data.longitude.toString() : "",
            type: "chatNotification",
          };
          await pushNotification.sendNotification(
            isMemberRegisteredAsUser.deviceToken,
            notificationData
          );
          // await Notification.create({
          //   title: notificationData.title,
          //   message: notificationData.message,
          //   roomId: data.roomId,
          //   chatType: data.chatType,
          //   messageType: data.messageType,
          //   media: data.media,
          //   latitude: data.latitude,
          //   longitude: data.longitude,
          //   senderId: sender._id,
          //   senderType: data.senderType,
          //   receiverId: isMemberRegisteredAsUser._id,
          //   receiverType: data.receiverType,
          //   type: notificationData.type,
          // });
        }
      } else if (data.chatType == 6 || data.chatType == 7) {
        // send notification to users present in members array and facility admins/coaches present in admins array separately
        const chatDetails = await Chat.findOne({
          roomId: data.roomId,
        }).populate("trainingId");
        for await (const member of chatDetails.members) {
          let isMemberRegisteredAsUser = await User.findById(member.id);
          if (
            isMemberRegisteredAsUser &&
            isMemberRegisteredAsUser._id.toString() != data.senderId &&
            isMemberRegisteredAsUser.deviceToken &&
            isMemberRegisteredAsUser.deviceToken != null &&
            isMemberRegisteredAsUser.deviceToken != ""
          ) {
            let decodedMessage = data.message ? base64.decode(data.message) : '';
            let notificationData = {
              title: chatDetails.trainingId.trainingName,
              message: data.message
                ? decodedMessage.replace(/\@\[([^\]]+)\]/g, "@$1").replace(/\([^)]+\)/g, "")
                : data.messageType == 2
                ? "Photo"
                : data.messageType == 3
                ? "Video"
                : data.messageType == 4
                ? "Document"
                : data.messageType == 5
                ? "Location"
                : data.messageType == 6
                ? "Please Welcome"
                : "",
              roomId: data.roomId.toString(),
              chatType: data.chatType.toString(),
              messageType: data.messageType.toString(),
              latitude: data.latitude ? data.latitude.toString() : "",
              longitude: data.longitude ? data.longitude.toString() : "",
              type: "chatNotification",
            };
            await pushNotification.sendNotification(
              isMemberRegisteredAsUser.deviceToken,
              notificationData
            );
            // await Notification.create({
            //   title: notificationData.title,
            //   message: notificationData.message,
            //   roomId: data.roomId,
            //   chatType: data.chatType,
            //   messageType: data.messageType,
            //   media: data.media,
            //   latitude: data.latitude,
            //   longitude: data.longitude,
            //   senderId: sender._id,
            //   senderType: data.senderType,
            //   receiverId: isMemberRegisteredAsUser._id,
            //   receiverType: data.receiverType,
            //   type: notificationData.type,
            // });
          }
        }

        for await (const admin of chatDetails.admins) {
          let isMemberRegisteredAsUser = await Facility.findById(admin.id);
          if (
            isMemberRegisteredAsUser &&
            isMemberRegisteredAsUser._id.toString() != data.senderId &&
            isMemberRegisteredAsUser.deviceToken &&
            isMemberRegisteredAsUser.deviceToken != null &&
            isMemberRegisteredAsUser.deviceToken != ""
          ) {
            let decodedMessage = data.message ? base64.decode(data.message) : '';
            let notificationData = {
              title: chatDetails.trainingId.trainingName,
              message: data.message
                ? decodedMessage.replace(/\@\[([^\]]+)\]/g, "@$1").replace(/\([^)]+\)/g, "")
                : data.messageType == 2
                ? "Photo"
                : data.messageType == 3
                ? "Video"
                : data.messageType == 4
                ? "Document"
                : data.messageType == 5
                ? "Location"
                : data.messageType == 6
                ? "Please Welcome"
                : "",
              roomId: data.roomId.toString(),
              chatType: data.chatType.toString(),
              messageType: data.messageType.toString(),
              latitude: data.latitude ? data.latitude.toString() : "",
              longitude: data.longitude ? data.longitude.toString() : "",
              type: "chatNotification",
            };
            await pushNotification.sendNotification(
              isMemberRegisteredAsUser.deviceToken,
              notificationData
            );
            // await Notification.create({
            //   title: notificationData.title,
            //   message: notificationData.message,
            //   roomId: data.roomId,
            //   chatType: data.chatType,
            //   messageType: data.messageType,
            //   media: data.media,
            //   latitude: data.latitude,
            //   longitude: data.longitude,
            //   senderId: sender._id,
            //   senderType: data.senderType,
            //   receiverId: isMemberRegisteredAsUser._id,
            //   receiverType: data.receiverType,
            //   type: notificationData.type,
            // });
          }
        }
      } else {
        // send notification to all the users present in members array as all the admins of team/event will be memvers for sure.
        const chatDetails = await Chat.findOne({
          roomId: data.roomId,
        }).populate("teamId eventId");
        for await (const member of chatDetails.members) {
          let isMemberRegisteredAsUser = await User.findById(member.id);
          if (
            isMemberRegisteredAsUser &&
            isMemberRegisteredAsUser._id.toString() != data.senderId &&
            isMemberRegisteredAsUser.deviceToken &&
            isMemberRegisteredAsUser.deviceToken != null &&
            isMemberRegisteredAsUser.deviceToken != ""
          ) {
            let decodedMessage = data.message ? base64.decode(data.message) : '';
            let notificationData = {
              title: `${
                data.chatType == 2 || data.chatType == 3
                  ? chatDetails.teamId.teamName
                  : data.chatType == 4 || data.chatType == 5
                  ? chatDetails.eventId.eventName
                  : ""
              }`,
              message: data.message
                ? decodedMessage.replace(/\@\[([^\]]+)\]/g, "@$1").replace(/\([^)]+\)/g, "")
                : data.messageType == 2
                ? "Photo"
                : data.messageType == 3
                ? "Video"
                : data.messageType == 4
                ? "Document"
                : data.messageType == 5
                ? "Location"
                : data.messageType == 6
                ? "Please Welcome"
                : "",
              roomId: data.roomId.toString(),
              chatType: data.chatType.toString(),
              messageType: data.messageType.toString(),
              latitude: data.latitude ? data.latitude.toString() : "",
              longitude: data.longitude ? data.longitude.toString() : "",
              type: "chatNotification",
            };
            await pushNotification.sendNotification(
              isMemberRegisteredAsUser.deviceToken,
              notificationData
            );
            // await Notification.create({
            //   title: notificationData.title,
            //   message: notificationData.message,
            //   roomId: data.roomId,
            //   chatType: data.chatType,
            //   messageType: data.messageType,
            //   media: data.media,
            //   latitude: data.latitude,
            //   longitude: data.longitude,
            //   senderId: sender._id,
            //   senderType: data.senderType,
            //   receiverId: isMemberRegisteredAsUser._id,
            //   receiverType: data.receiverType,
            //   type: notificationData.type,
            // });
          }
        }
      }
      socket.join(data.roomId);
      io.to(data.roomId).emit("receiveMessage", {
        status: 200,
        message: "Mesage data",
        result: data,
      });
    });
    //get chat messages
    socket.on("chatMessage", async (data) => {
      console.log(data, "chetMessage");
      let { limit = 15 } = data;
      limit = parseInt(limit);
      page = data.page ? parseInt(data.page) : 1;
      var skipIndex = (page - 1) * limit;
      let chatDetails = await Chat.aggregate([
        {
          $match: { roomId: data.roomId },
        },
        {
          $lookup: {
            from: "users",
            let: { userIds: "$members.id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$userIds"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  userType: "user",
                },
              },
            ],
            as: "userDetails",
          },
        },
        {
          $addFields: {
            userDetails: {
              $map: {
                input: "$userDetails",
                as: "user",
                in: {
                  _id: "$$user._id",
                  fullName: "$$user.fullName",
                  userType: "$$user.userType",
                  status: {
                    $let: {
                      vars: {
                        matchedMember: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$members",
                                as: "member",
                                cond: { $eq: ["$$member.id", "$$user._id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$matchedMember.status",
                    },
                  },
                  joiningDate: {
                    $let: {
                      vars: {
                        matchedMember: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$members",
                                as: "member",
                                cond: { $eq: ["$$member.id", "$$user._id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$matchedMember.joiningDate",
                    },
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "facilities",
            let: { adminIds: "$admins.id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$adminIds"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: "$name",
                  userType: "facility",
                },
              },
            ],
            as: "facilityAdminDetails",
          },
        },
        {
          $addFields: {
            facilityAdminDetails: {
              $map: {
                input: "$facilityAdminDetails",
                as: "facility",
                in: {
                  _id: "$$facility._id",
                  fullName: "$$facility.fullName",
                  userType: "$$facility.userType",
                  status: {
                    $let: {
                      vars: {
                        matchedAdmin: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$admins",
                                as: "admin",
                                cond: { $eq: ["$$admin.id", "$$facility._id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$matchedAdmin.status",
                    },
                  },
                  joiningDate: {
                    $let: {
                      vars: {
                        matchedAdmin: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$admins",
                                as: "admin",
                                cond: { $eq: ["$$admin.id", "$$facility._id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$matchedAdmin.joiningDate",
                    },
                  },
                },
              },
            },
          },
        },
      ]);
      let params = {
        roomId: data.roomId,
        status: true,
      }
      let joiningDate;
      if (chatDetails.length > 0 && chatDetails[0].chatType !== 1) {
        let senderId = await chatDetails[0].members.find(member => (member.id).toString() == data.senderId);
        if (!senderId) {
            let adminId = await chatDetails[0].admins.find(admin => (admin.id).toString() == data.senderId);
            if (adminId) {
                joiningDate = adminId.joiningDate;
            }
        } else {
            joiningDate = senderId.joiningDate;
        }
        if (joiningDate) {
            // params = Object.assign(params, {
            //     createdAt: { $gte: joiningDate }
            // });
        }
      }
      const [ { message , total }] = await ChatMessage.aggregate([
        {
          $match: params
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
                  from: "colourcodes",
                  let: {
                    teamColourId: "$teamColour_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$teamColourId"],
                        },
                      },
                    },
                  ],
                  as: "TeamColourDetails",
                },
              },
              {
                $unwind: {
                  path: "$TeamColourDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  TeamColourDetails: "$TeamColourDetails",
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
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "facilities",
            localField: "senderId",
            foreignField: "_id",
            as: "facilityDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
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
              total: [{
                  $group: {
                      _id: "null",
                      count: {
                          $sum: 1
                      }
                  }
              }],
              message: [
                  
                  {
                    $addFields: {
                      mergedDetails: {
                        $cond: {
                          if: { $eq: ["$senderType", "user"] },
                          then: "$userDetails",
                          else: "$facilityDetails",
                        },
                      },
                    },
                  },
                  {
                    $unwind: {
                      path: "$mergedDetails",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      roomId: 1,
                      senderId: 1,
                      senderType: 1,
                      receiverType: 1,
                      receiverId: 1,
                      senderDetails: {
                        _id: "$mergedDetails._id",
                        name: "$mergedDetails.name",
                        fullName: "$mergedDetails.fullName",
                        profileImage: "$mergedDetails.profileImage",
                      },
                      TeamColourDetails: "$TeamDetails.TeamColourDetails",
                      chatType: 1,
                      messageType: 1,
                      latitude: 1,
                      longitude: 1,
                      message: 1,
                      teamMemberDetails: 1,
                      eventDetails: 1,
                      eventMemberDetails: 1,
                      media: 1,
                      clearBy: 1,
                      seenBy: 1,
                      isForwarded: 1,
                      isReplied: 1,
                      oldMessage: 1,
                      deletedBy: 1,
                      createdAt: 1,
                    },
                  },
                  {
                    $sort: {
                      createdAt: -1,
                    },
                  },
                  // {
                  //   $skip: skipIndex,
                  // },
                  // {
                  //   $limit: limit,
                  // },


              ],
          },
        },
        {
            $addFields: {
                total: {
                    $cond: {
                        if: {
                            gt: [{
                                $size: "$total"
                            }, 0]
                        },
                        then: {
                            $arrayElemAt: ["$total.count", 0]
                        },
                        else: 0,
                    },
                },
            },
        },
      ]);
      
      let combinedArray = [
        ...chatDetails[0].userDetails,
        ...chatDetails[0].facilityAdminDetails,
      ];
      await ChatMessage.updateMany(
        {
          roomId: Number(data.roomId),
          status: true,
          seenBy: {
            $nin:  [ObjectId(data.senderId)],
          },
        },
        {
          $push: {
            seenBy: ObjectId(data.senderId),
          },
        }
      );
      socket.join(data.roomId);
      io.to(data.roomId).emit("receiveMessages", {
        status: 200,
        message: "Message list data",
        result: message,
        total : total,
        senderJoiningDate: joiningDate,
        membersList: combinedArray,
      });
    });

    //delete messages
    socket.on("deleteMessage", async (data) => {
      const messageExist = await ChatMessage.findById(data.id);
      let lastMessageExist = false;
      if (data.deletedMedia && data.deletedMedia.length) {
        if (messageExist.media.length > 1) {
          await Chat.updateOne(
            {
              roomId: data.roomId,
            },
            {
              $set: {
                lastMessage: "",
                messageType: messageExist.messageType,
              },
            }
          );
        } else {
          const messageList = await ChatMessage.find({
            roomId: data.roomId,
            status: true,
          }).sort({ createdAt: -1 });
          if (messageList[0]._id.toString() == data.id) {
            lastMessageExist = true;
          }
          if (lastMessageExist) {
            if (messageList.length > 1) {
              await Chat.updateOne(
                {
                  roomId: data.roomId,
                },
                {
                  $set: {
                    lastMessage: messageList[1].message,
                    messageType: messageList[1].messageType,
                    mentionedUsers:
                      messageList[1].mentionedUsers &&
                      messageList[1].mentionedUsers.length > 0
                        ? messageList[0].mentionedUsers
                        : [],
                  },
                }
              );
            } else {
              await Chat.updateOne(
                {
                  roomId: data.roomId,
                },
                {
                  $set: {
                    lastMessage: "",
                    messageType: 1,
                  },
                }
              );
            }
          }
          await ChatMessage.updateOne(
            {
              _id: ObjectId(data.id),
            },
            {
              $set: {
                status: false,
              },
            }
          );
        }
        for (let i = 0; i < data.deletedMedia.length; i++) {
          await ChatMessage.updateOne(
            {
              _id: ObjectId(data.id),
            },
            {
              $pull: {
                media: {
                  _id: new ObjectId(data.deletedMedia[i]),
                },
              },
            }
          );
        }
      } else {
        const messageList = await ChatMessage.find({
          roomId: data.roomId,
          status: true,
        }).sort({ createdAt: -1 });
        if (messageList[0]._id.toString() == data.id) {
          lastMessageExist = true;
        }

        if (lastMessageExist) {
          if (messageList.length > 1) {
            await Chat.updateOne(
              {
                roomId: data.roomId,
              },
              {
                $set: {
                  lastMessage: messageList[1].message,
                  messageType: messageList[1].messageType,
                  mentionedUsers:
                    messageList[1].mentionedUsers &&
                    messageList[1].mentionedUsers.length > 0
                      ? messageList[1].mentionedUsers
                      : [],
                },
              }
            );
          } else {
            await Chat.updateOne(
              {
                roomId: data.roomId,
              },
              {
                $set: {
                  lastMessage: "",
                  messageType: 1,
                },
              }
            );
          }
        }

        await ChatMessage.updateOne(
          {
            _id: ObjectId(data.id),
          },
          {
            $set: {
              status: false,
            },
          }
        );
      }
      socket.join(data.roomId);
      io.to(data.roomId).emit("messageDeleted", {
        status: 200,
        message: "Message deleted successfully",
        result: {
          deletedMessageId: data.id,
          deletedMedia: data.deletedMedia ? data.deletedMedia : []
        },
      });
    });

    //typing indicator
    socket.on("typeIndicator", async (data) => {
      let sender;
      if (data.senderType == "user") {
        sender = await User.findById(data.senderId);
      } else {
        sender = await Facility.findById(data.senderId);
      }

      io.to(data.roomId).emit("typing", {
        status: 200,
        message: "Typing status",
        result: {
          message: `${
            data.senderType == "user" ? sender.fullName : sender.name
          } is typing ...`,
          roomId: data.roomId,
          senderId: data.senderId,
        },
      });
    });

    async function invalidData(data) {
      socket.join(data.senderId);
      io.to(data.senderId).emit("invalidData", {
        status: 200,
        message: data.message,
        result: {},
      });
    }

    // Server-side code
    // socket.on('leaveRoom', (roomId, senderId) => {
    //   // Check if the senderId is the one requesting to leave the room 
    //   // if (senderId === socket.id) {
    //   if (senderId === socket.userId) {
    //     // Leave the specified room
    //     socket.leave(roomId);
    //     console.log(`User ${senderId} left room ${roomId}`);
    //     // Optionally, you can emit a confirmation message to the sender
    //     socket.emit('leaveRoomConfirmation', {
    //       roomId: roomId,
    //       message: `You have left room ${roomId}`
    //     });
    //   } else {
    //     // If the senderId doesn't match the current socket id, emit an error message
    //     socket.emit('error', { message: 'You are not authorized to leave this room' });
    //   }
    // });
  });
};
