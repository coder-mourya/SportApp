const Event = require("../../../../models/event");
const Sport = require("../../../../models/sport");
const Member = require("../../../../models/member");
const User = require("../../../../models/user");
const Expense = require("../../../../models/eventExpense");
const TrainingSlot = require('../../../../models/trainingSlot');
const FacilityBranch = require("../../../../models/facilityBranch");
const Training = require('../../../../models/training');
const trainingBookingSlot = require("../../../../models/trainingBookingSlot");
const trainingBooking = require("../../../../models/trainingBooking");
const trainingEvaluation = require("../../../../models/trainingEvaluation");
const moment = require('moment');
const { forEach } = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Validator } = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const mail = require("../../../../services/mailServices");
const FileUpload = require("../../../../services/upload-file");
const STORAGE_PATH = process.env.AWS_STORAGE_PATH;
const { log } = require("firebase-functions/logger");
const XLSX = require("xlsx");
const xl = require("excel4node");
var path = require("path");
var mime = require("mime-types");
var fs = require("fs");
const { object } = require("firebase-functions/v1/storage");
const {dump}=require("../../../../services/dump");

module.exports = {

    getMyAllSchedules: async (req, res) => {
        try {
        //   req.params.date = '2023-10-09T06:30:00.000Z';
          let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
    
          sort = {
            [sort]: order == "desc" ? -1 : 1,
          };
          limit = parseInt(limit);
          page = req.query.page ? parseInt(req.query.page) : 1;
          var skipIndex = (page - 1) * limit;

          const start = (page - 1) * limit;
          const end = start + limit;
    
          // Assuming you have a universal timestamp stored in a variable called 'timestamp'
          const timestamp = new Date(req.params.date) ; 
          // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000));; // Replace this with your actual timestamp
    
          // // Add 24 hours to the timestamp
          // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000));
          const startDate = new Date(timestamp.setUTCHours(0, 0, 0, 0));
          const endDate = new Date(timestamp.setUTCHours(23, 59, 59, 999));
          const formattedstartDate = new Date(startDate.getTime()).toISOString();
          const formattedendDate = new Date(endDate.getTime()).toISOString();
          let params = {};
    
          let pendingEventParams = [


            {
              $eq: ["$_id", "$$eventId"],
            },
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
              {
                eventDate: {
                  $gte: formattedstartDate,
                  $lt: formattedendDate,
                },
              },
              {
                $or: [
                  {
                    $and: [
                      {
                        creatorId: ObjectId(req.user.id),
                      }
                    ],
                  },
                  {
                    $and: [
                      {
                        members: ObjectId(req.user.id),
                      }
                    ],
                  },
                ],
              },
            ],
          });
    
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
                location: 1,
                address: 1,
                eventDate: 1,
                eventDateUTC: 1,
                endTimeUTC: 1,
                startTime: 1,
                slotStartTime: "$startTime",
                endTime: 1,
                notes: 1,
                isSplitPayment: 1,
                isComplete: 1,
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
                      location: 1,
                      address: 1,
                      eventDate: 1,
                      eventDateUTC: 1,
                      endTimeUTC: 1,
                      startTime: 1,
                      slotStartTime: "$startTime",
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
            SplitPaymentBy: ObjectId(req.user.id),
            paymentStatus: 1,
            isSplitPayment : true
          }, 'creatorId members');
    
          const eventsMember = await Event.find({
            SplitPaymentBy : { $ne : ObjectId(req.user.id)},
            members: ObjectId(req.user.id),
            paymentStatus: 1,
            isSplitPayment : true
          }, 'creatorId members');
    
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


        let trainingParams = {
            userId : ObjectId(req.user.id)
        };
        if (req.query.search != "" && req.query.search != null) {
            trainingParams = Object.assign(trainingParams, {
                "trainingDetails.trainingName": {
                    $regex: ".*" + req.query.search + ".*",
                    $options: "i"
                },
            });
        }

       
        trainingParams = Object.assign(trainingParams, {
            slotStartTime: {
                $gte: new Date(startDate.getTime()).toISOString(),
                $lt: new Date(endDate.getTime()).toISOString()
            }
        });

        const bookingList = await trainingBookingSlot.aggregate([
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
                  path: "$trainingDetails"
                },
            },
            {
                $match: trainingParams
            },
            {
              $lookup : {
                  from: 'trainingbookings',
                  localField: 'trainingBookingId',
                  foreignField: '_id',
                  as : 'trainingBookingDetails'
              }
            },
            {
              $unwind: {
                  path: "$trainingBookingDetails"
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
                  preserveNullAndEmptyArrays : true
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
                  preserveNullAndEmptyArrays : true
                },
            },
            {
              $lookup : {
                from : 'users',
                let : { userId : "$userId"},
                pipeline : [
                  { $match : { $expr : { $eq : ["$_id","$$userId"]}}},
                  {
                    $project : {
                      _id : 1,
                      fullName : 1,
                      profileImage : 1,
                      email : 1
                    }
                  }
                ],
                as: 'userDetails'
              }
            },
            {
              $unwind: {
                  path: "$userDetails",
                  preserveNullAndEmptyArrays : true
                },
            },
            {
              $lookup : {
                from : 'members',
                let : { familyMemberId : "$familyMember"},
                pipeline : [
                  { $match : { $expr : { $eq : ["$_id","$$familyMemberId"]}}},
                  {
                    $project : {
                      _id : 1,
                      fullName : 1,
                      image : 1,
                      email : 1
                    }
                  }
                ],
                as: 'familyMemberDetails'
              }
            },
            {
              $unwind: {
                  path: "$familyMemberDetails",
                  preserveNullAndEmptyArrays : true
                },
            },
            {
                $project: {
                    _id: 1,
                    bookingFor: 1,
                    userId: 1,
                    familyMember: 1,
                    trainingId: 1,
                    userDetails: "$userDetails",
                    familyMemberDetails: "$familyMemberDetails",
                    trainingCompleted: "$trainingBookingDetails.isCompleted",
                    totalSession: "$trainingBookingDetails.totalSession",
                    totalAttendedSession: "$trainingBookingDetails.totalAttendedSession",
                    currentAttendancePercent: "$trainingBookingDetails.currentAttendancePercent",
                    isRequestingForEvaluation: "$trainingBookingDetails.isRequestingForEvaluation",
                    evalReqCount33: "$trainingBookingDetails.evalReqCount33",
                    evalReqCount66: "$trainingBookingDetails.evalReqCount66",
                    evalReqCount100: "$trainingBookingDetails.evalReqCount100",
                    evalMarkedFor33: "$trainingBookingDetails.evalMarkedFor33",
                    evalMarkedFor66: "$trainingBookingDetails.evalMarkedFor66",
                    evalMarkedFor100: "$trainingBookingDetails.evalMarkedFor100",
                    facilityAdminId: 1,
                    facilityId: 1,
                    sportId: 1,
                    date: 1,
                    day: 1,
                    slot: 1,
                    isSelected: 1,
                    maximumStudent: 1,
                    totalBooking: 1,
                    slotStartTime: 1,
                    slotEndTime: 1,
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
            res,
            {
              pendingPaymentsCount: pendingPaymentsCount,
              list: [...pendingEventList, ...acceptedEventList, ...bookingList].slice(
                start,
                end
              ),
              total : [...pendingEventList, ...acceptedEventList, ...bookingList].length
            },
            "All events and trainings list",
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
}