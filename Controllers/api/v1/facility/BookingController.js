const FacilityBranch = require("../../../../models/facilityBranch");
const Facility = require("../../../../models/facility");
const Training = require('../../../../models/training');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const {
    Validator
} = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const FileUpload = require('../../../../services/upload-file');
const DateConverter = require('../../../../services/timeConversion');
const TrainingSlot = require('../../../../models/trainingSlot');
const TrainingBooking = require('../../../../models/trainingBooking');
const TrainingBookingSlots = require('../../../../models/trainingBookingSlot');
const User = require('../../../../models/user');
const Member = require('../../../../models/member');
const moment = require('moment');
const { forEach } = require("lodash");
const trainingBookingSlot = require("../../../../models/trainingBookingSlot");
const trainingBooking = require("../../../../models/trainingBooking");
const trainingEvaluation = require("../../../../models/trainingEvaluation");
const sport = require("../../../../models/sport");
const pushNotification = require("../../../../firebase/index");
const Notification = require("../../../../models/notification");
const Chat = require("../../../../models/chat");
const ChatMessage = require("../../../../models/chatmessage");
const momentTimeZone = require('moment-timezone');
// Function to group dates by month name
const groupDatesByMonthName = (datesArray)=> {
    const monthMap = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
    };

    return datesArray.reduce((result, dateString) => {
    const date = new Date(dateString);
    const monthName = monthMap[date.getMonth()];
    if (!result[monthName]) {
        result[monthName] = [];
    }
    result[monthName].push(date);
    return result;
    }, {});
};

// Function to group sessions by month
const groupSessionsByMonth = (sessions) => {
const groupedSessions = {};

for (const session of sessions) {
    const date = new Date(session.date);
    const monthName = date.toLocaleString('default', { month: 'long' }); // Get month name

    if (!groupedSessions[monthName]) {
    groupedSessions[monthName] = [];
    }

    groupedSessions[monthName].push(session);
}

return groupedSessions;
}


module.exports = {

    getAssignedTrainingList: async (req, res) => {
        try {
            let {
                limit = 10,
                    order = "desc",
                    sort = "createdAt",
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;
            let params = { 
                isDeleted: false,
                isSelected: true,                   
                status : true
            };
            if (req.user.userType == "facility_admin") {
                params = Object.assign(params, {
                    facilityAdminId: ObjectId(req.user.id)
                });
            }
            if (req.user.userType == "coach") {
                params = Object.assign(params, {
                    $expr : {
                        $in: [ ObjectId(req.user.id), "$coachesId"],
                    }
                });
            }

            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    "trainingDetails.trainingName": {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }

            // if (req.query.date != "" && req.query.date != null) {
            //     params = Object.assign(params, {
            //         date : new Date(req.query.date),
            //     });
            // }

            // if (req.query.date != "" && req.query.date != null) {
            //     params = Object.assign(params, {
            //         date : new Date(req.query.date),
            //     });
            // }

            if (req.query.date != "" && req.query.date != null) {
                const timestamp = new Date(req.query.date) ; 
                // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000)).toISOString(); // Replace this with your actual timestamp
          
                // // Add 24 hours to the timestamp
                // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000)).toISOString();

                const startDate = new Date(timestamp.setUTCHours(0, 0, 0, 0));
                const endDate = new Date(timestamp.setUTCHours(23, 59, 59, 999));
                const formattedstartDate = new Date(startDate.getTime()).toISOString();
                const formattedendDate = new Date(endDate.getTime()).toISOString();
                params = Object.assign(params, {
                    slotStartTime: {
                    $gte: formattedstartDate,
                    $lt: formattedendDate
                  }
                });
            }

            if(req.query.currentDate != "" && req.query.currentDate != null ){
                params = Object.assign(params, {
                    slotStartTimeUtc : { 
                        $gte: new Date(req.query.currentDate).toISOString()
                    }
                });

                sort = { slotStartTimeUtc : 1 };
            }

            if(req.query.sportId && req.query.sportId != "" && req.query.sportId != null){
                let sportIdArray= [];
                sportIdArray = req.query.sportId.split(',');
                const sportObjectIdArray = sportIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    sportId : { $in : sportObjectIdArray }
                });
            }


            if(req.query.facilityId  && req.query.facilityId != "" && req.query.facilityId != null){
                let facilityIdArray = [];
                facilityIdArray = req.query.facilityId.split(',');
                const facilityObjectIdArray = facilityIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    facilityId : { $in : facilityObjectIdArray },
                });
            } 

            if(req.query.coachesId && req.query.coachesId != "" && req.query.coachesId != null){
                let coachesIdArray = [];
                coachesIdArray = req.query.coachesId.split(',');
                const coachObjectIdArray = coachesIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    coachesId : { $in : coachObjectIdArray},
                });
            }
            const [{
                assignedTrainingList,
                total
            }] = await TrainingSlot.aggregate([
                {
                  $lookup : {
                      from: 'trainings',
                      localField: 'trainingId',
                      foreignField: '_id',
                      as : 'trainingDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$trainingDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                    $match: params
                },
                {
                  $lookup : {
                     from: 'sports',
                     localField: 'sportId',
                     foreignField: '_id',
                     as: 'sportDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$sportDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                  $lookup : {
                    from: 'facilitybranches',
                    localField: 'facilityId',
                    foreignField: '_id',
                    as: 'facilityBranchDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$facilityBranchDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                // {
                //   $lookup : {
                //     from : 'members',
                //     localField : 'familyMember',
                //     foreignField : '_id',
                //     as: 'familyMember'
                //   }
                // },
                // {
                //     $unwind: {
                //         path: "$familyMember",
                //         preserveNullAndEmptyArrays: true,
                //       },
                // },
                {
                    $facet: {
                        total: [{
                            $group: {
                                _id: "null",
                                count: {
                                    $sum: 1
                                }
                            }
                        },
                       ],
                        assignedTrainingList: [
                            {
                                $addFields: {
                                    slotStartTimeUtc: {
                                        $toDate: "$slotStartTimeUtc"
                                    },
                                    slotEndTimeUtc: {
                                        $toDate: "$slotEndTimeUtc"
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    bookingFor: 1,
                                    // userId: 1,
                                    // familyMember: 1,
                                    trainingId: 1,
                                    facilityAdminId: 1,
                                    facilityId: 1,
                                    sportId: 1,
                                    date: 1,
                                    day: 1,
                                    slot: 1,
                                    slotStartTime: 1,
                                    slotEndTime: 1,
                                    slotStartTimeUtc: 1,
                                    slotEndTimeUtc: 1,
                                    localCountry: 1,
                                    isSelected: 1,
                                    maximumStudent: 1,
                                    totalBooking: 1,
                                    sports: "$sportDetails",
                                    trainingDetails: "$trainingDetails",
                                    facilityBranchDetails: "$facilityBranchDetails",
                                    // familyMember: "$familyMember"
                                }

                            },
                            {
                                $sort: sort
                            },
                            {
                                $skip: skipIndex
                            },
                            {
                                $limit: limit
                            }


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

            const unseenNotifications = await Notification.find({
                receiverId : ObjectId(req.user.id),
                isSeen : false
              }).lean();

            let bookingData = {
                notifications_count: unseenNotifications.length,
                bookingList: assignedTrainingList,
                total: total || 0
            }

            let existInTraining = await Training.find({
                $or: [
                  {
                    coachesId: {
                      $elemMatch: {
                        $eq: ObjectId(req.user.id),
                      },
                    },
                  },
                  {
                    facilityAdminId: ObjectId(req.user.id),
                  },
                ],
            });
            
            let chatParams = {
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
                      $in: existInTraining.map((training) => ObjectId(training._id)),
                    },
                  },
                ],
            };
    
            let chatList = await Chat.aggregate([
            {
                $match: chatParams,
            },
            {
                $sort: { updatedAt: -1 },
            },
            ]);
            let unSeenChatMessagesCount = 0;
            for await (const chat of chatList) {
              let isAdmin = false;
              if (chat.admins.length) {
                  isAdmin = chat.admins.some(admin => (admin.id).toString() === req.user.id)
              }
              
              let messageCountParams = {
                roomId: chat.roomId,
                status: true,
                seenBy: {
                  $nin: [ObjectId(req.user.id)],
                },
              };
              if( chat.chatType == 6 || chat.chatType == 7 ){
                let senderId = await chat.members.find(member => (member.id).toString() == req.user.id);
                  if (!senderId) {
                      let adminId = await chat.admins.find(admin => (admin.id).toString() == req.user.id);
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
              if(chat.chatType == 7 ){
                  if( isAdmin ){
                    unSeenChatMessagesCount = unSeenChatMessagesCount + count;
                  }
              }else{
                unSeenChatMessagesCount = unSeenChatMessagesCount + count;
              }
              
            }

            bookingData.chat_count = unSeenChatMessagesCount;
            return SendResponse(
                res, {
                    bookingData: bookingData,
                    // chat_count: unSeenChatMessagesCount
                },
                "Booking list",
                200
            );
        } catch (error) {
            dump('error', error)
            return SendResponse(
                res, {
                    isBoom: true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    getScheduleAssignedTrainingList: async (req, res) => {
        try {
           
            let params = { 
                isDeleted: false,
                isSelected: true,
                status : true
            };
            if (req.user.userType == "facility_admin") {
                params = Object.assign(params, {
                    facilityAdminId: ObjectId(req.user.id)
                });
            }
            if (req.user.userType == "coach") {
                params = Object.assign(params, {
                    $expr : {
                        $in: [ ObjectId(req.user.id), "$coachesId"],
                    }
                });
            }
            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    "trainingDetails.trainingName": {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }

            // if (req.query.date != "" && req.query.date != null) {
            //     params = Object.assign(params, {
            //         date : new Date(req.query.date),
            //     });
            // }

            // if (req.query.date != "" && req.query.date != null) {
            //     params = Object.assign(params, {
            //         date : new Date(req.query.date),
            //     });
            // }

            if (req.query.date != "" && req.query.date != null) {
                const timestamp = new Date(req.query.date) ; 
                // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000)).toISOString(); // Replace this with your actual timestamp
          
                // // Add 24 hours to the timestamp
                // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000)).toISOString();
                const startDate = new Date(timestamp.setUTCHours(0, 0, 0, 0));
                const endDate = new Date(timestamp.setUTCHours(23, 59, 59, 999));
                const formattedstartDate = new Date(startDate.getTime()).toISOString();
                const formattedendDate = new Date(endDate.getTime()).toISOString();
                
                params = Object.assign(params, {
                    slotStartTimeUtc: {
                    $gte: formattedstartDate,
                    $lt: formattedendDate
                  }
                });
            }

            if (req.query.updatedAt != "" && req.query.updatedAt != null) {
                params = Object.assign(params, {
                  createdAt: { $gte: new Date(req.query.updatedAt) },
                });
            }

            if( req.query.sportId != "" && req.query.sportId != null){
                let sportIdArray= [];
                sportIdArray = req.query.sortId.split(',');
                const sportObjectIdArray = sportIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    sportId : { $in : sportObjectIdArray }
                });
            }


            if(req.query.facilityId != "" && req.query.facilityId != null){
                let facilityIdArray = [];
                facilityIdArray = req.query.facilityId.split(',');
                const facilityObjectIdArray = facilityIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    facilityId : { $in : facilityObjectIdArray },
                });
            }

            if(req.query.coachesId != "" && req.query.coachesId != null){
                let coachesIdArray = [];
                coachesIdArray = req.query.coachesId.split(',');
                const coachObjectIdArray = coachesIdArray.map(id => ObjectId(id));
                params = Object.assign(params, {
                    coachesId : { $in : coachObjectIdArray},
                });
            }

            const bookingList = await TrainingSlot.aggregate([
                {
                  $lookup : {
                      from: 'trainings',
                      localField: 'trainingId',
                      foreignField: '_id',
                      as : 'trainingDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$trainingDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                    $match: params
                },
                {
                  $lookup : {
                     from: 'sports',
                     localField: 'sportId',
                     foreignField: '_id',
                     as: 'sportDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$sportDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                  $lookup : {
                    from: 'facilitybranches',
                    localField: 'facilityId',
                    foreignField: '_id',
                    as: 'facilityBranchDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$facilityBranchDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                  $lookup : {
                    from : 'members',
                    localField : 'familyMember',
                    foreignField : '_id',
                    as: 'familyMember'
                  }
                },
                {
                    $unwind: {
                        path: "$familyMember",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                    $addFields: {
                        slotStartTimeUtc: {
                            $toDate: "$slotStartTimeUtc"
                        },
                        slotEndTimeUtc: {
                            $toDate: "$slotEndTimeUtc"
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bookingFor: 1,
                        userId: 1,
                        familyMember: 1,
                        trainingId: 1,
                        facilityAdminId: 1,
                        facilityId: 1,
                        sportId: 1,
                        date: 1,
                        day: 1,
                        slot: 1,
                        slotStartTime: 1,
                        slotEndTime: 1,
                        slotStartTimeUtc: 1,
                        slotEndTimeUtc: 1,
                        localCountry: 1,
                        isSelected: 1,
                        maximumStudent: 1,
                        totalBooking: 1,
                        isCompleted: true,
                        sports: "$sportDetails",
                        trainingDetails: "$trainingDetails",
                        facilityBranchDetails: "$facilityBranchDetails",
                        familyMember: "$familyMember"
                    }

                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
                  
            ]);

            return SendResponse(
                res, {
                    bookingList: bookingList
                },
                "Booking list",
                200
            );
        } catch (error) {
            dump('error', error)
            return SendResponse(
                res, {
                    isBoom: true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    getBookingDetails: async(req,res) => {
      try{
        let [bookingDetails] = await TrainingSlot.aggregate([
          {
            $match: {
              _id: ObjectId(req.params.bookingId),
            },
          },
          {
            $lookup : {
                from: 'trainings',
                localField: 'trainingId',
                foreignField: '_id',
                as : 'trainingDetails'
            }
          },
          {
              $unwind: {
                  path: "$trainingDetails",
                  preserveNullAndEmptyArrays: true,
                },
          },
          {
            $lookup : {
               from: 'sports',
               localField: 'sportId',
               foreignField: '_id',
               as: 'sportDetails'
            }
          },
          {
              $unwind: {
                  path: "$sportDetails",
                  preserveNullAndEmptyArrays: true,
                },
          },
          {
            $lookup : {
              from: 'facilitybranches',
              localField: 'facilityId',
              foreignField: '_id',
              as: 'facilityBranchDetails'
            }
          },
          {
              $unwind: {
                  path: "$facilityBranchDetails",
                  preserveNullAndEmptyArrays: true,
                },
          },
          {
            $lookup : {
              from : 'members',
              localField : 'familyMember',
              foreignField : '_id',
              as: 'familyMember'
            }
          },
          {
              $unwind: {
                  path: "$familyMember",
                  preserveNullAndEmptyArrays: true,
                },
          },
          {
            $lookup: {
                from: 'facilities',
                let: {
                    'coachId': '$coachesId'
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$coachId']
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profileImage: 1,
                            rating: 1,
                            about: 1,
                            rating: 1,
                        }
                    }
                ],
                'as': 'coaches'
            }
          },
          {
            $addFields: {
                slotStartTimeUtc: {
                    $toDate: "$slotStartTimeUtc"
                },
                slotEndTimeUtc: {
                    $toDate: "$slotEndTimeUtc"
                }
            }
          },
          {
            $project: {
              _id: 1,
              bookingFor: 1,
              userId: 1,
              familyMember: 1,
              trainingId: 1,
              facilityAdminId: 1,
              facilityId: 1,
              sportId: 1,
              date: 1,
              day: 1,
              slot: 1,
              slotStartTime: 1,
              slotEndTime: 1,
              slotStartTimeUtc: 1,
              slotEndTimeUtc: 1,
              isSelected: 1,
              maximumStudent: 1,
              totalBooking: 1,
              sports: "$sportDetails",
              trainingDetails: "$trainingDetails",
              facilityBranchDetails: "$facilityBranchDetails",
              familyMember: "$familyMember",
              coaches: "$coaches"
            }, 
          },
        ]);
        // let trainingSlots = await TrainingBookingSlots.find({
        //     trainingId : ObjectId(bookingDetails.trainingId),
        //     date : new Date(bookingDetails.date),
        //     slot : bookingDetails.slot
        // });

        let trainingSlots = await TrainingBookingSlots.aggregate([{
            $match: {
                trainingId : ObjectId(bookingDetails.trainingId),
                slot : bookingDetails.slot,
                $expr: {    
                    $eq: [{
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: {
                                    $toDate: "$date" // Convert the string to a date
                                  }
                            }
                        },
                        moment(bookingDetails.date).format("YYYY-MM-DD")
                    ]
                }   
            }
        }]);
        let studentIds = [];
        trainingSlots.forEach(slot => {

            if ( slot.familyMember && slot.familyMember != null && slot.familyMember != "null"){
                if(!studentIds.find(item => item.familyMemberId && (item.familyMemberId.toString() === slot.familyMember.toString()))){
                    studentIds.push({
                        familyMemberId: slot.familyMember,
                        attendance: slot.attendance,
                        trainingBookingId: slot.trainingBookingId
                    })
                }
            }
            else{
                if (!studentIds.find(item => item.userId && (item.userId.toString() === slot.userId.toString()))){
                    studentIds.push({
                        userId: slot.userId,
                        attendance: slot.attendance,
                        trainingBookingId: slot.trainingBookingId
                    })
                }
            }
        });
        let userParams =  {
            _id: {
                $in: studentIds.map(student => student.userId)
              }
        };

        let familyParams =  {
            _id: {
                $in: studentIds.map(student => student.familyMemberId)
              }
        };

        if (req.query.search != "" && req.query.search != null) {
            userParams = Object.assign(userParams, {
                fullName: {
                    $regex: ".*" + req.query.search + ".*",
                    $options: "i"
                },
            });

            familyParams = Object.assign(familyParams, {
                fullName: {
                    $regex: ".*" + req.query.search + ".*",
                    $options: "i"
                },
            });
        }

        let users = await User.aggregate([
            {
                $match : userParams
            },
            {
                $project : {
                    _id: 1,
                    fullName: 1,
                    profileImage: 1,
                    email: 1, 
                    isFamilyMember: "no"
                }
            }
        ]);

        let familyMembers = await Member.aggregate([
            {
                $match : familyParams
            },
            {
                $project : {
                    _id: 1,
                    fullName: 1,
                    image: 1,
                    email: 1, 
                    isFamilyMember: "yes"
                }
            }
        ]);

        const students = [...users,...familyMembers];

        const updatedStudents = students.map(item1 => {

            const matchingItem3 = studentIds.find(item3 => item3.familyMemberId ? (item3.familyMemberId).toString() === (item1._id).toString() : (item3.userId).toString() === (item1._id).toString());
            
            if (matchingItem3) {
                return { ...item1, attendance: matchingItem3.attendance, trainingBookingId : matchingItem3.trainingBookingId };
            }
        });
        bookingDetails.students = updatedStudents;
        // find chat group details
        let training = await Training.findById(bookingDetails.trainingId);
        let trainingGroupExit = await Chat.findOne({
            trainingId : ObjectId(bookingDetails.trainingId),
            chatType : 6,
            status : true
        }).lean();
        bookingDetails.trainingGroupchat = trainingGroupExit;
        if (bookingDetails.trainingGroupchat && Object.keys(bookingDetails.trainingGroupchat).length > 0) {
            bookingDetails.trainingGroupchat.training = training;
        }

        let trainingAdminGroupExit = await Chat.findOne({
            trainingId : ObjectId(bookingDetails.trainingId),
            chatType : 7,
            status : true
        }).lean();
        bookingDetails.trainingAdminGroupchat = trainingAdminGroupExit;
        if (bookingDetails.trainingAdminGroupchat && Object.keys(bookingDetails.trainingAdminGroupchat).length > 0) {
            bookingDetails.trainingAdminGroupchat.training = training;
        }

        return SendResponse(
          res,
          {
            bookingDetails: bookingDetails
          },
          "Booking Details",
          200
        );
  
      } catch (error) {
        dump('error', error)
        return SendResponse(
            res, {
                isBoom: true
            },
            i18n.__('Something_went_wrong_please_try_again'),
            500
        );
      }
    },

    getStudentDetails: async(req,res) => {
        try{

            const v = new Validator(req.query, {
                trainingId: "required",
                trainingBookingId: "required",
                // userId: "required",
                // date: "required",
                slot: "required"
            });

            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            if (!await Training.findOne({ 
                _id : ObjectId(req.query.trainingId),
                 isDeleted : false
            })){
                return SendResponse(res, {
                    isBoom: true
                }, 'Training not found', 422);
            }
            
            let trainingSlots = [];
            let studentDetails;
            let trainingDetails;
            if(!req.query.familyMemberId){
                trainingSlots = await TrainingBookingSlots.find({
                    trainingBookingId : ObjectId(req.query.trainingBookingId),
                    userId : ObjectId(req.query.userId),
                    trainingId : ObjectId(req.query.trainingId),
                    slot : req.query.slot
                });

                studentDetails = await User.findById( req.query.userId).select('_id fullName mobile countryCode phoneCode phoneNumericCode email profileImage').lean();

                trainingDetails = await trainingBooking.findOne({
                    _id : ObjectId(req.query.trainingBookingId),
                    userId : ObjectId(req.query.userId),
                    familyMember : null,
                    trainingId : ObjectId(req.query.trainingId)
                });
            }

           
            if( req.query.familyMemberId && req.query.familyMemberId != null && req.query.familyMemberId != ""){
                trainingSlots = await TrainingBookingSlots.find({
                    trainingBookingId : ObjectId(req.query.trainingBookingId),
                    familyMember : ObjectId(req.query.familyMemberId),
                    trainingId : ObjectId(req.query.trainingId),
                    slot : req.query.slot
                });
                
                
                studentDetails = await Member.findById(req.query.familyMemberId).select('_id fullName email mobile image').lean();

                trainingDetails = await trainingBooking.findOne({
                    _id : ObjectId(req.query.trainingBookingId),
                    familyMember : ObjectId(req.query.familyMemberId),
                    trainingId : ObjectId(req.query.trainingId)
                });

                let userDetails = await User.findById(trainingDetails.userId).select('_id fullName mobile countryCode phoneCode phoneNumericCode email profileImage').lean();
                studentDetails.mobile = userDetails.mobile;
                studentDetails.countryCode = userDetails.countryCode;
                studentDetails.phoneNumericCode = userDetails.phoneNumericCode;
            }
            

            if(trainingDetails.showPreviousEvaluation === true){
                studentDetails.showPreviousEvaluation = true;
                studentDetails.sportId = trainingDetails.sportId;
            }
            
            studentDetails.expectations = trainingDetails.expectations;
            studentDetails.isRequestingForEvaluation = trainingDetails.isRequestingForEvaluation;
            studentDetails.trainingBookingId = req.query.trainingBookingId;
          
            let plannedSessionDates = [];

            for await( let trainingSlot of trainingSlots){
                if (!plannedSessionDates.find(item => item === trainingSlot.date))
                  plannedSessionDates.push( trainingSlot.date)
            }

            const groupedDates = await groupDatesByMonthName(plannedSessionDates);
            const groupedSessions = await groupSessionsByMonth(trainingSlots);
            let data = {
               plannedSessions : groupedDates,
               fullPlannedSessions : trainingSlots,
               groupedplannedSession: groupedSessions,
               personalDeatils : studentDetails
            };

            return SendResponse(
                res,
                {
                  studentDetails: data
                },
                "Student Details",
                200
              );

            

        } catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    getAttendanceHistory: async(req,res) => {
        try{
            const v = new Validator(req.query, {
                trainingId: "required"
            });

            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            if (!await Training.findOne({ 
                _id : ObjectId(req.query.trainingId),
                 isDeleted : false
            })){
                return SendResponse(res, {
                    isBoom: true
                }, 'Training not found', 422);
            }
            
            let {
                limit = 10,
                    order = "desc",
                    sort = "createdAt",
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;

            let params = {
                trainingId : ObjectId(req.query.trainingId),
                attendance : 'present'
            };

            if(!req.query.familyMemberId){
                params = Object.assign(params, {
                    familyMember: null,
                });
            }

            if(req.query.userId && req.query.userId != null && req.query.userId != ""){
                params = Object.assign(params, {
                    userId: ObjectId(req.query.userId),
                });
            }

            
            if( req.query.familyMemberId && req.query.familyMemberId != null && req.query.familyMemberId != ""){
                params = Object.assign(params, {
                    familyMember : ObjectId(req.query.familyMemberId),
                });
            }

            const [{
                attendanceHistoryList,
                total
            }] = await TrainingBookingSlots.aggregate([
                {
                    $match: params
                },
                {
                    $lookup : {
                      from : 'users',
                      localField : 'userId',
                      foreignField : '_id',
                      as: 'userDetails'
                    }
                  },
                {
                    $unwind: {
                        path: "$userDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup : {
                      from : 'facilities',
                      localField : 'attendanceMarkedBy',
                      foreignField : '_id',
                      as: 'attendanceMarkedByDetails'
                    }
                },
                {
                    $unwind: {
                        path: "$attendanceMarkedByDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup : {
                      from: 'facilitybranches',
                      localField: 'facilityId',
                      foreignField: '_id',
                      as: 'facilityBranchDetails'
                    }
                },
                {
                    $unwind: {
                        path: "$facilityBranchDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                  $lookup : {
                    from : 'members',
                    localField : 'familyMember',
                    foreignField : '_id',
                    as: 'familyMember'
                  }
                },
                {
                    $unwind: {
                        path: "$familyMember",
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
                        attendanceHistoryList: [
                            {
                                $addFields: {
                                    slotStartTimeUtc: {
                                        $toDate: "$slotStartTimeUtc"
                                    },
                                    slotEndTimeUtc: {
                                        $toDate: "$slotEndTimeUtc"
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    bookingFor: 1,
                                    userId: 1,
                                    familyMember: 1,
                                    trainingId: 1,
                                    facilityAdminId: 1,
                                    facilityId: 1,
                                    sportId: 1,
                                    date: 1,
                                    day: 1,
                                    slot: 1,
                                    slotStartTime: 1,
                                    slotEndTime: 1,
                                    slotStartTimeUtc: 1,
                                    slotEndTimeUtc: 1,
                                    localCountry: 1,
                                    isSelected: 1,
                                    maximumStudent: 1,
                                    totalBooking: 1,
                                    attendance: 1,
                                    attendanceMarkedAt: 1,
                                    attendanceMarkedBy: 1,
                                    attendanceMarkedByDetails: "$attendanceMarkedByDetails",
                                    userDetails: "$userDetails",
                                    familyMember: "$familyMember",
                                    facilityBranchDetails: "$facilityBranchDetails",
                                    createdAt: 1
                                }

                            },
                            {
                                $sort: {
                                    attendanceMarkedAt: -1
                                }
                            },
                            {
                                $skip: skipIndex
                            },
                            {
                                $limit: limit
                            }


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
            let atendanceData = {
                attendanceHistoryList: attendanceHistoryList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    atendanceData: atendanceData
                },
                "Attendance list",
                200
            );
            
        } catch(error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },


    getFacilityList: async(req,res) => {
        try{
            let assignedTrainingList = await Training.find({
                coachesId: { $in : [ObjectId(req.user.id)]},
                isDeleted: false,
                status: true
            }).populate('facilityId');

            let facilityBranches = [];
            await assignedTrainingList.forEach(async (training) => {
               if( !facilityBranches.find( item => item._id == training.facilityId._id)){
                facilityBranches.push(training.facilityId);
               }
            });

            return SendResponse(
                res,
                { facilityList : facilityBranches },
                "Facility List",
                200
            );

        } catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    markAttendance: async (req,res) => {
         try{
            const v = new Validator(req.query, {
                bookingId: "required"
            });

            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }

            let bookingSlotDetail = await trainingBookingSlot.findById(req.query.bookingId);
            if (!bookingSlotDetail){
                return SendResponse(res, {
                    isBoom: true
                }, 'Booking not found', 422);
            }
            const date1 = new Date(bookingSlotDetail.date);
            const date2 = new Date(req.query.date);
            if(date1.getTime() !== date2.getTime()){
                return SendResponse(res, {
                    isBoom: true
                }, 'Invalid QR code', 422);
            }

            if(bookingSlotDetail.slot != req.query.slot){
                return SendResponse(res, {
                    isBoom: true
                }, 'Invalid QR code', 422);
            }

            let data = { 
                title : 'Attendance Marked',
                trainingBookingId : (req.query.bookingId).toString() ,
                type: 'attendanceMarked',
            };
            let userDetails;

            if(req.query.familyMemberId && req.query.familyMemberId != '' && req.query.familyMemberId != null && req.query.trainingId && req.query.trainingId != '' && req.query.trainingId != null ){
                if( bookingSlotDetail.trainingId.toString() != req.query.trainingId ){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Invalid QR code', 422);
                }
                
                if( bookingSlotDetail.familyMember.toString() != req.query.familyMemberId ){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Invalid QR code', 422);
                }
                let familyMemberDetails = await Member.findOne({ _id : ObjectId(req.query.familyMemberId)});
                data.message = `${familyMemberDetails.fullName}'s attendace has been marked successfully.`;

                userDetails = await User.findOne({ _id : ObjectId(familyMemberDetails.creatorId)});
            }

            if(req.query.userId && req.query.userId != '' && req.query.userId != null && req.query.trainingId && req.query.trainingId != '' && req.query.trainingId != null ){
                if( bookingSlotDetail.trainingId.toString() != req.query.trainingId ){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Invalid QR code', 422);
                }

                if( bookingSlotDetail.userId.toString() != req.query.userId ){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Invalid QR code', 422);
                }

                data.message = "Your attendance has been marked successfully."
                userDetails = await User.findOne({ _id : ObjectId(req.query.userId)});
            }

            if(bookingSlotDetail.attendance == 'present'){
                return SendResponse(res, {
                    isBoom: true
                }, 'Attendance already marked for this session.', 422);
            }

            const timeZone = bookingSlotDetail.localCountry; // Replace with the desired timezone
            const currentDateTimeInTimeZone = momentTimeZone.tz(timeZone);

            await trainingBookingSlot.findByIdAndUpdate( req.query.bookingId, {
                $set : {
                    attendance : 'present',
                    attendanceMarkedAt : currentDateTimeInTimeZone.format('YYYY-MM-DD HH:mm:ss'),
                    attendanceMarkedBy : ObjectId(req.user.id)
                }
            });

            if( userDetails.deviceToken && userDetails.deviceToken != null && userDetails.deviceToken != ""){
                await pushNotification.sendNotification(userDetails.deviceToken, data);
                await Notification.create({
                    title: data.title,
                    message: data.message,
                    receiverEmail: userDetails.email,
                    trainingBookingId : data.trainingBookingId,
                    senderId : req.user.id,
                    receiverId : userDetails._id,
                    type : data.type,
                    senderType : "facility"
                  });
            }

            await trainingBooking.findByIdAndUpdate( bookingSlotDetail.trainingBookingId, {
                $inc : {
                    totalAttendedSession : 1
                }
            });

            let trainingBookingDetail = await trainingBooking.findById(bookingSlotDetail.trainingBookingId);

            await trainingBooking.findByIdAndUpdate(bookingSlotDetail.trainingBookingId, {
                $set : {
                    currentAttendancePercent : (trainingBookingDetail.totalAttendedSession / trainingBookingDetail.totalSession) * 100 
                }
            });

            if(!await trainingBookingSlot.findOne({ 
                trainingBookingId : ObjectId(bookingSlotDetail.trainingBookingId), 
                attendance : "absent"
            })){
               await trainingBooking.findByIdAndUpdate(bookingSlotDetail.trainingBookingId,{
                  $set : {
                    isCompleted : true
                  }
               });
            }

            return SendResponse(
                res,
                {},
                "Attendence marked successfully",
                200
            );
         } catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    getTrainingHistory : async(req,res) => {
        try{
            const v = new Validator(req.query, {
                type: "required|in:current,previous"

            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let {
                limit = 10,
                    order = "desc",
                    sort = "createdAt",
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;
            let params = {
                isDeleted: false,
                status: true
            };

            let evaluationParam = {};

            if(req.query.userId && req.query.userId != null && req.query.userId != ""){
                params = Object.assign(params, {
                    userId : ObjectId(req.query.userId)
                });
                
                evaluationParam = { userId : ObjectId(req.query.userId)};
            }

            if(req.query.familyMemberId && req.query.familyMemberId != null && req.query.familyMemberId != ""){
                params = Object.assign(params, {
                    familyMember : ObjectId(req.query.familyMemberId)
                });

                evaluationParam = { familyMember : ObjectId(req.query.familyMemberId)};
            }
           
            if (req.query.type == 'current') {
                params = Object.assign(params, {
                    isCompleted : false
                })
            }
           
            if (req.query.type == 'previous') {
                params = Object.assign(params, {
                    isCompleted : true
                })
            }

            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    "trainingDetails.trainingName": {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }

            const [{
                trainingList,
                total
            }] = await TrainingBooking.aggregate([
               {
                  $lookup : {
                      from: 'trainings',
                      localField: 'trainingId',
                      foreignField: '_id',
                      as : 'trainingDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$trainingDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                    $match: params
                },
                {
                    $lookup : {
                        from: 'trainingevaluations',
                        let: {
                           trainingId : '$trainingId' 
                        },
                        pipeline : [
                            { 
                                $match : {
                                    $expr : {
                                        $and : [
                                           { $eq : [ '$trainingId', '$$trainingId']},
                                           evaluationParam
                                        ]
                                    }
                                }
                            }
                        ],
                        as : 'trainingevaluationDetails'
                    }
                },
                {
                  $lookup : {
                     from: 'sports',
                     localField: 'sportId',
                     foreignField: '_id',
                     as: 'sportDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$sportDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                  $lookup : {
                    from: 'facilitybranches',
                    localField: 'facilityId',
                    foreignField: '_id',
                    as: 'facilityBranchDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$facilityBranchDetails",
                        preserveNullAndEmptyArrays: true,
                      },
                },
                {
                    $match: {
                      "trainingevaluationDetails": { $exists: true, $not: { $size: 0 } }
                    }
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
                        trainingList: [{
                                $project: {
                                    _id: 1,
                                    bookingFor: 1,
                                    userId: 1,
                                    familyMember: 1,
                                    trainingId: 1,
                                    facilityAdminId: 1,
                                    facilityId: 1,
                                    sportId: 1,
                                    startDate: 1,
                                    endDate: 1,
                                    maximumStudent: 1,
                                    minimumStudent: 1,
                                    coverImage: 1,
                                    students: 1,
                                    sports: "$sportDetails",
                                    trainingDetails: "$trainingDetails",
                                    facilityBranchDetails: "$facilityBranchDetails",
                                    familyMember: "$familyMember",
                                    trainingevaluationDetails: "$trainingevaluationDetails",
                                    showPreviousEvaluation: 1
                                }

                            },
                            {
                                $sort: {
                                    createdAt: -1
                                }
                            },
                            {
                                $skip: skipIndex
                            },
                            {
                                $limit: limit
                            }


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
            let trainingData = {
                trainingList: trainingList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    trainingData: trainingData
                },
                "Training History list",
                200
            );

        }catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    markEvaluation : async(req,res) => {
        try{
            const v = new Validator(req.body, {
             trainingId: "required",
             facilityId: "required",
             sportId : "required",
             trainingBookingId: "required",
             evaluation: "required",
            });

            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }

            let trainingBookingDetail = await trainingBooking.findById(req.body.trainingBookingId).lean();

            if (!trainingBookingDetail)
            return SendResponse(res, {
                isBoom: true
            }, 'Booking not found', 422);
            
            let trainingDetails = await Training.findById(req.body.trainingId);
            if ((!trainingDetails) || trainingDetails.isDeleted == true)
            return SendResponse(res, {
                isBoom: true
            }, 'Training not found', 422);

            if (!await FacilityBranch.findById(req.body.facilityId))
            return SendResponse(res, {
                isBoom: true
            }, 'Fcaility not found', 422);

            if (!await sport.findById(req.body.sportId))
            return SendResponse(res, {
                isBoom: true
            }, 'Sport not found', 422);
    
            let commentImages = [];
            if (req.files && req.files.commentImage) {
  
              if( !Array.isArray(req.files.commentImage)){
                req.files.commentImage = [req.files.commentImage];
              }
      
              for (const image of req.files.commentImage) {
                let Image = await FileUpload.aws(image);
                commentImages.push(process.env.AWS_URL + Image.Key);
              }
              req.body.commentImage = commentImages;
            }
  
          

            let strokeImages = [];
            if (req.files && req.files.strokeImage) {
  
              if( !Array.isArray(req.files.strokeImage)){
                req.files.strokeImage = [req.files.strokeImage];
              }
      
              for (const image of req.files.strokeImage) {
                let Image = await FileUpload.aws(image);
                strokeImages.push(process.env.AWS_URL + Image.Key);
              }
              req.body.strokeImage = strokeImages;
            }

            const facilityAdminDetails = await Facility.findOne({ _id : ObjectId(req.user.id)});
            let data = { 
              title : 'Evaluation Marked',
              trainingBookingId : (req.body.trainingBookingId).toString() ,
              trainingId : (trainingBookingDetail.trainingId).toString(),
              sportId : (trainingBookingDetail.sportId).toString(),
              facilityId: (trainingBookingDetail.facilityId).toString(),
              type: 'evaluationMarked'
            };
            
            let userDetails;
            if(req.body.familyMember && req.body.familyMember != null && req.body.familyMember != ""){
                req.body.familyMemberId = req.body.familyMember;
                let familyMemberDetails = await Member.findOne({_id : ObjectId(req.body.familyMemberId)}).lean();
                userDetails = await User.findOne({
                     _id : ObjectId(familyMemberDetails.creatorId),
                     isDeleted : false,
                     status : true
                    });
                data.message = `Evaluation marked for ${familyMemberDetails.fullName} for training ${trainingDetails.trainingName} by ${facilityAdminDetails.name}`
            } 

            if(req.body.userId && req.body.userId != null && req.body.userId != ""){
                req.body.userId = req.body.userId;
                userDetails = await User.findOne({ 
                    _id : ObjectId(req.body.userId),
                    isDeleted : false,
                    status : true
                });
                data.message = `Evaluation marked for you for training ${trainingDetails.trainingName} by ${facilityAdminDetails.name}`
            } 

            if( userDetails && userDetails.deviceToken && userDetails.deviceToken != null && userDetails.deviceToken != ""){
                await pushNotification.sendNotification(userDetails.deviceToken, data);
                await Notification.create({
                    title: data.title,
                    message: data.message,
                    receiverEmail: userDetails.email,
                    senderId : req.user.id,
                    receiverId : userDetails._id,
                    type : data.type,
                    senderType : "facility",
                    trainingBookingId : data.trainingBookingId ,
                    trainingId : data.trainingId,
                    sportId : data.sportId,
                    facilityId: data.facilityId,
                  });
            }

            const timeZone = trainingBookingDetail.localCountry; // Replace with the desired timezone
            const currentDateTimeInTimeZone = momentTimeZone.tz(timeZone);
            req.body.evaluationMarkedBy = req.user.id;
            req.body.evaluationMarkedAt = currentDateTimeInTimeZone.format('YYYY-MM-DD HH:mm:ss');

            await trainingEvaluation.create(req.body);
            let previousNotifications = await Notification.find({ 
                  trainingBookingId : ObjectId(req.body.trainingBookingId),
                  type : "evaluationRequest"
                 });
            if(previousNotifications.length){
               await Notification.updateMany({
                trainingBookingId : req.body.trainingBookingId,
                type : "evaluationRequest"
               },
               { $set : { isEvaluationMarked : true } }
               );
            }
            if(trainingBookingDetail.currentAttendancePercent > 0 && trainingBookingDetail.currentAttendancePercent <= 33){
                await trainingBooking.findByIdAndUpdate(req.body.trainingBookingId, {
                   $set : {
                     evalMarkedFor33 : true,
                     isRequestingForEvaluation: false
                   }
                });
            } else if(trainingBookingDetail.currentAttendancePercent > 33 && trainingBookingDetail.currentAttendancePercent <= 66){
                await trainingBooking.findByIdAndUpdate(req.body.trainingBookingId, {
                    $set : {
                        evalMarkedFor66 : true,
                        isRequestingForEvaluation : false
                    }
                });
            }else{
                await trainingBooking.findByIdAndUpdate(req.body.trainingBookingId, {
                    $set : {
                        evalMarkedFor100 : true,
                        isRequestingForEvaluation : false
                    }
                });
            }

            return SendResponse(res, {}, i18n.__("success"), 200);
        } catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    getEvaluationList: async(req,res) => {
        try{
            let {
                limit = 10,
                    order = "desc",
                    sort = "createdAt",
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;
    
            let params = {};
            
            if( req.query.trainingId && req.query.trainingId != null && req.query.trainingId != ""){
                let trainingDetails = await Training.findById(req.query.trainingId);
                if(!trainingDetails){
                    return SendResponse(res, {
                      isBoom: true
                  }, 'Training Booking not found', 422);
                }
                params = Object.assign(params, {
                    facilityId : ObjectId(trainingDetails.facilityId),
                    sportId : ObjectId(trainingDetails.sportId),
                });
            }

            if( req.query.userId && req.query.userId != null && req.query.userId != ""){
            params = Object.assign(params, {
                userId : ObjectId(req.query.userId),
            });
            }


            if( req.query.familyMemberId && req.query.familyMemberId != null && req.query.familyMemberId != ""){
                params = Object.assign(params, {
                    familyMemberId : ObjectId(req.query.familyMemberId),
                });
            }

            if( req.query.sportId && req.query.sportId != null && req.query.sportId != ''){
                delete params.facilityId;
                params = Object.assign(params, {
                  sportId : ObjectId(req.query.sportId),
                });
            }

            const [{
                evaluationList,
                total
            }] = await trainingEvaluation.aggregate([
                {
                    $match: params
                },
                {
                  $lookup : {
                    from : 'facilities',
                    localField : 'evaluationMarkedBy',
                    foreignField : '_id',
                    as: 'evaluationMarkedByDetails'
                  }
                },
                {
                    $unwind: {
                        path: "$evaluationMarkedByDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                      from: "trainings",
                      localField: "trainingId",
                      foreignField: "_id",
                      as: "trainingDetails",
                    },
                  },
                  {
                    $unwind: {
                        path: "$trainingDetails",
                        preserveNullAndEmptyArrays : true
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
                        evaluationList: [{
                                $project: {
                                    _id: 1,
                                    attendanceRange: 1,
                                    userId: 1,
                                    familyMemberId: 1,
                                    trainingId: 1,
                                    trainingBookingId: 1,
                                    sportId: 1,
                                    facilityId: 1,
                                    evaluationMarkedBy: 1,
                                    evaluationMarkedAt: 1,
                                    evaluation: 1,
                                    comment: 1,
                                    recommendedStrokes: 1,
                                    commentImage: 1,
                                    strokeImage: 1,
                                    status: 1,
                                    isDeleted: 1,
                                    evaluationMarkedByDetails: "$evaluationMarkedByDetails",
                                    trainingDetails: "$trainingDetails"
                                }
    
                            },
                            {
                                $sort: {
                                    evaluationMarkedAt: -1
                                }
                            },
                            {
                                $skip: skipIndex
                            },
                            {
                                $limit: limit
                            }
    
    
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
    
            let evaluationData = {
              evaluationList: evaluationList,
              total: total || 0
          }
          return SendResponse(
              res, {
                  evaluationData: evaluationData
              },
              "Evaluation list",
              200
          );

        } catch (error){
            dump('error', error)
            return SendResponse(
                res,
                {
                    isBoom : true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    }

}