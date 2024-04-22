const User = require("../../../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require('../../../../models/training');
const TrainingSlot = require('../../../../models/trainingSlot');
const Sport = require("../../../../models/sport");
const {
    Validator
} = require("node-input-validator");
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const SendResponse = require("../../../../apiHandler");
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const TrainingBooking = require("../../../../models/trainingBooking");
const TrainingBookingSlot = require("../../../../models/trainingBookingSlot");
const TrainingEvaluation = require('../../../../models/trainingEvaluation');
const RatingReview = require('../../../../models/ratingReview');
const FileUpload = require("../../../../services/upload-file");
const FacilityBranch = require("../../../../models/facilityBranch");
const fs = require('fs');
const Facility = require("../../../../models/facility");
const pushNotification = require("../../../../firebase/index");
const Notification = require("../../../../models/notification");
const facility = require("../../../../models/facility");
const Chat = require("../../../../models/chat");
const ChatMessage = require("../../../../models/chatmessage");

module.exports = {
    //api for facility admin
    getDashboardSummary: async (req, res) => {

        try {
            let facilityDetails = await Facility.findOne({
              _id : ObjectId(req.user.id),
              isDeleted : false,
              status : true
            });
            if( !facilityDetails){
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "No such user found",
                    422
                ); 
            }
            let totalBookings = 0;
            let currentMonthBookingsCount = 0;
            let previousMonthBookingsCount = 0;
            let currentMonthTrainingsCount = 0;
            let previousMonthTrainingsCount = 0;
            let totalTrainings = 0;
            let totalRevenue = 0;
            let currentMonthRevenue = 0;
            let previousMonthRevenue = 0;
            let datesArray = [];

            let trainings = await Training.find({ 
                facilityAdminId : ObjectId(req.user.id),
                isDeleted : false,
                status : true
            });

            const END_DAY = new Date(moment().utc().endOf("day"));
            const START_DAY = (moment( END_DAY.setMonth(END_DAY.getMonth() - 1)).utc().startOf("day")).toISOString();
            const PREVIOUS_START_DAY = (moment( END_DAY.setMonth(END_DAY.getMonth() - 2)).utc().startOf("day")).toISOString();
            for await (let training of trainings){
                datesArray.push(new Date(training.endDateUTC));
                totalTrainings = totalTrainings + 1;

                let bookings = await TrainingBooking.find({
                    trainingId : training._id,
                    isDeleted: false,
                    status: true
                });

                for await (let booking of bookings){
                    totalBookings = totalBookings + 1;
                  if( booking.isFundTransferred == true ){
                    totalRevenue = totalRevenue + booking.facilityAdminLocalCommission;
                  }
                }

                let currentMonthBookings = await TrainingBooking.find({
                    trainingId : training._id,
                    isDeleted: false,
                    status: true,
                    startDate: {
                        $gte : START_DAY,
                        $lte :(moment().utc().endOf("day")).toISOString()
                    }
                });

                let previousMonthBookings = await TrainingBooking.find({
                    trainingId : training._id,
                    isDeleted: false,
                    status: true,
                    startDate: {
                        $gte : PREVIOUS_START_DAY,
                        $lt : START_DAY
                    }
                });

                for await (let current of currentMonthBookings){
                    currentMonthBookingsCount = currentMonthBookingsCount + 1;
                    if( current.isFundTransferred == true ){
                     currentMonthRevenue = currentMonthRevenue + current.facilityAdminLocalCommission;
                    }
                }

                for await (let previous of previousMonthBookings){
                    previousMonthBookingsCount = previousMonthBookingsCount + 1;
                    if( previous.isFundTransferred == true ){
                      previousMonthRevenue = previousMonthRevenue + previous.facilityAdminLocalCommission;
                    }
                }
            }
            // Extract years using map
            const yearsArray = datesArray.map(date => date.getFullYear());
            // Find the maximum year using Math.max
            const greatestYear = Math.max(...yearsArray);
            let bookingGrowthPercentage =0;

            if(previousMonthBookingsCount == 0){
                bookingGrowthPercentage = currentMonthBookingsCount
            } else {
                // Calculate the growth percentage
             bookingGrowthPercentage = ((currentMonthBookingsCount - previousMonthBookingsCount) / previousMonthBookingsCount) * 100;

            }


            let revenueGrowthPercentage =0;

            if(previousMonthRevenue == 0){
                revenueGrowthPercentage = currentMonthRevenue
            } else {
                // Calculate the growth percentage
             revenueGrowthPercentage = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

            }
            let currentMonthTrainings = await Training.find({ 
                facilityAdminId : ObjectId(req.user.id),
                isDeleted : false,
                status : true,
                startDateUTC: {
                    $gte : START_DAY,
                    $lte : (moment().utc().endOf("day")).toISOString()
                }
            });

            let previousMonthTrainings = await Training.find({
                facilityAdminId : ObjectId(req.user.id),
                isDeleted : false,
                status : true,
                startDateUTC: {
                    $gte : PREVIOUS_START_DAY,
                    $lt : START_DAY
                }
            });

            for await (let current of currentMonthTrainings){
                currentMonthTrainingsCount = currentMonthTrainingsCount + 1;
            }

            for await (let previous of previousMonthTrainings){
                previousMonthTrainingsCount = previousMonthTrainingsCount + 1;
            }

            let trainingGrowthPercentage;
            if(previousMonthTrainingsCount == 0){
                trainingGrowthPercentage = currentMonthTrainingsCount
            }else{
               // Calculate the growth percentage
             trainingGrowthPercentage = ((currentMonthTrainingsCount - previousMonthTrainingsCount) / previousMonthTrainingsCount) * 100;

            }
            const unseenNotifications = await Notification.find({
              receiverId : ObjectId(req.user.id),
              isSeen : false
            }).lean();

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
                    $in: existInTraining.map((training) => ObjectId(training._id)),
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
            return SendResponse(
                res, {
                    greatestYear : greatestYear,
                    notifications_count: unseenNotifications.length,
                    chat_count: unSeenChatMessagesCount,
                    totalBookings : totalBookings,
                    currentMonthBookingsCount: currentMonthBookingsCount,
                    previousMonthBookingsCount: previousMonthBookingsCount,
                    bookingGrowthPercentage: bookingGrowthPercentage.toFixed(2),
                    currency : facilityDetails.currency,
                    totalRevenue : totalRevenue,
                    currentMonthRevenue: currentMonthRevenue,
                    previousMonthRevenue: previousMonthRevenue,
                    revenueGrowthPercentage: revenueGrowthPercentage.toFixed(2),
                    totalTrainings: totalTrainings,
                    currentMonthTrainingsCount: currentMonthTrainingsCount,
                    previousMonthTrainingsCount: previousMonthTrainingsCount,
                    trainingGrowthPercentage: trainingGrowthPercentage.toFixed(),
                    totalStudents : totalBookings,
                    currentMonthStudentsCount: currentMonthBookingsCount,
                    previousMonthStudentsCount: previousMonthBookingsCount,
                    studentGrowthPercentage: bookingGrowthPercentage.toFixed(2),
                },
                "Dashboard Summary List",
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

    getBookingsGraph: async(req,res) => {
        try{
            let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
            sort = {
              [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;
            if( !await Facility.findById(req.user.id)){
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "No such user found",
                    422
                ); 
            }

            let allTrainings = await Training.find({
                facilityAdminId: ObjectId(req.user.id),
                isDeleted: false,
                status: true
            });

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthOfYear = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
            let params = {};
              if (req.query.filter == "weekly") {
                if(req.query.startDate && req.query.endDate ){
                    params = Object.assign( params, {
                        trainingId : {
                          $in: allTrainings.map(training => training._id)
                        },
                        startDate: {
                          $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                          $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                        },
                      });
                }else{
                    params = Object.assign( params, {
                        trainingId : {
                          $in: allTrainings.map(training => training._id)
                        },
                        startDate: {
                          $gte: moment().startOf("week").format('YYYY-MM-DD'),
                          $lte: moment().endOf("week").format('YYYY-MM-DD'),
                        },
                      });
                }
                var con1 = [
                  {
                    $match: params,
                  },
                  {
                    $addFields: {
                      startDate: {
                        $toDate: "$startDate", // Convert string to date
                      },
                    },
                  },
                  {
                    $group : {
                      _id : {
                        $dayOfWeek : "$startDate"
                      },
                      count : {
                        $sum : 1
                      }
                    }
                  },
                ];
              } else if (req.query.filter == "monthly") {
                const currentYear = new Date().getFullYear();
                if(req.query.month){
                    params = Object.assign(params,{
                        facilityAdminId: ObjectId(req.user.id),
                        startDate: {
                            // $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                            // $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                            $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                            $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                        }
                    });
                }else{
                    params = Object.assign(params,{
                      facilityAdminId : ObjectId(req.user.id),
                      startDate: {
                        $gte: moment().startOf("month").format('YYYY-MM-DD'),
                        $lte: moment().endOf("month").format('YYYY-MM-DD'),
                      },
                    });
                }
                var con1 = [
                  {
                    $match: params,
                  },    
                  {
                    $addFields: {
                      startDate: {
                        $toDate: "$startDate", // Convert string to date
                      },
                    },
                  },            
                  {
                    $group: { 
                      _id: {
                        $week: "$startDate"
                      },
                      count: {
                        $sum: 1
                      }
                    }
                  }
                ];
              }  else if (req.query.filter == "yearly") {
                params = {
                  trainingId : {
                        $in: allTrainings.map(training => training._id)
                  },
                  startDate: {
                    $gte: moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD'),
                    $lte: moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD'),
                  },
                };
              
                var con1 = [
                  {
                    $match: params,
                  },
                  {
                    $addFields: {
                      startDate: {
                        $toDate: "$startDate", // Convert string to date
                      },
                    },
                  },
                  {
                    $group:{
                      _id : {
                        $month : "$startDate"
                      },
                      count : {
                        $sum : 1
                      }
                    }
                  }
                ];
              } else {
                params = {
                  trainingId : {
                    $in: allTrainings.map(training => training._id)
                  },
                  startDate: {
                    $gte: moment().startOf("week").format('YYYY-MM-DD'),
                    $lte: moment().endOf("week").format('YYYY-MM-DD'),
                  },
                };
                var con1 = [
                  {
                    $match: params,
                  },
                  {
                    $addFields: {
                      startDate: {
                        $toDate: "$startDate", // Convert string to date
                      },
                    },
                  },
                  {
                    $group : {
                      _id : {
                        $dayOfWeek : "$startDate"
                      },
                      count : {
                        $sum : 1
                      }
                    }
                  },
                ];
              }
              const bookingGraphData = await TrainingBooking.aggregate(con1);
              const trainingBookingData = await TrainingBooking.find(params);
              let bookingData;
              // Now, map the weekNumber to dayName in your application code

              if(req.query.filter == "yearly"){
                bookingData = await bookingGraphData.map(item => (
                    {
                    ...item,
                    month: monthOfYear[item._id],
                }));
              } else{
                
                bookingData = await bookingGraphData.map(item => (
                    {
                    ...item,
                    day: daysOfWeek[item._id -1 ],
                }));
              }
              let trainingIds = [];
              trainingBookingData.forEach(element => {
                if (!trainingIds.find(item => (item).toString() === (element.trainingId).toString())){
                  trainingIds.push(element.trainingId)
                }
              });
              let bookedTraining = await Training.find({
                _id : { $in : trainingIds.map((item) => ObjectId(item))}
              }).populate('facilityId sportId').skip(skipIndex).limit(limit).lean();
              
              // Add studentsCount key with value 0 to each element
              bookedTraining = bookedTraining.map(training => ({ ...training, studentsCount: 0 }));

              trainingBookingData.forEach(element => {
                let index = bookedTraining.findIndex(item => (item._id).toString() === (element.trainingId).toString())
                 bookedTraining[index].studentsCount = bookedTraining[index].studentsCount + 1
              });

              let bookedTrainingTotal = await Training.find({
                _id : { $in : trainingIds.map((item) => ObjectId(item))}
              });
               
              return SendResponse(
                res, {
                  bookingData ,
                  bookedTrainingTotal : bookedTrainingTotal.length,
                  bookedTraining 
                },
                i18n.__('success'),
                200
              );
             

        }catch (error) {
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

    getTrainingsGraph: async(req,res) => {
      try{
          let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
          sort = {
            [sort]: order == "desc" ? -1 : 1,
          };
          limit = parseInt(limit);
          page = req.query.page ? parseInt(req.query.page) : 1;
          var skipIndex = (page - 1) * limit;
          if( !await Facility.findById(req.user.id)){
              return SendResponse(
                  res, {
                      isBoom: true
                  },
                  "No such user found",
                  422
              ); 
          }

          let params = {
            facilityAdminId: ObjectId(req.user.id),
            isDeleted: false,
            status: true
          };

          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthOfYear = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
            if (req.query.filter == "weekly") {
              if(req.query.startDate && req.query.endDate ){
                  params = Object.assign( params, {
                      startDate: {
                        $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                        $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                      },
                    });
              }else{
                  params = Object.assign( params, {
                      startDate: {
                        $gte: moment().startOf("week").format('YYYY-MM-DD'),
                        $lte: moment().endOf("week").format('YYYY-MM-DD'),
                      },
                    });
              }
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                },
              ];
            } else if (req.query.filter == "monthly") {
              const currentYear = new Date().getFullYear();
              if(req.query.month){
                  params = Object.assign(params,{
                      facilityAdminId: ObjectId(req.user.id),
                      isDeleted: false,
                      status: true,
                      startDate: {
                          // $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                          // $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                          $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                          $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                      }
                  });
              }else{
                  params = Object.assign(params,{
                    facilityAdminId: ObjectId(req.user.id),
                    isDeleted: false,
                    status: true,
                    startDate: {
                      $gte: moment().startOf("month").format('YYYY-MM-DD'),
                      $lte: moment().endOf("month").format('YYYY-MM-DD'),
                    },
                  });
              }
              var con1 = [
                {
                  $match: params,
                }, 
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },               
                {
                  $group: {
                    _id: {
                      $week: "$startDate"
                    },
                    count: {
                      $sum: 1
                    }
                  }
                }
              ];
              
            }  else if (req.query.filter == "yearly") {
              params = {
                facilityAdminId: ObjectId(req.user.id),
                isDeleted: false,
                status: true,
                startDate: {
                  $gte: moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD'),
                  $lte: moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD'),
                  // $gte: new Date(moment().year(parseInt(req.query.year)).startOf("year").toISOString()),
                  // $lte: new Date(moment().year(parseInt(req.query.year)).endOf("year").toISOString()),
                },
              };
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group:{
                    _id : {
                      $month : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                }
              ];
            } else {
              params = {
                facilityAdminId: ObjectId(req.user.id),
                isDeleted: false,
                status: true,
                startDate: {
                  $gte: moment().startOf("week").format('YYYY-MM-DD'),
                  $lte: moment().endOf("week").format('YYYY-MM-DD'),
                },
              };
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                },
              ];
            }
            const trainingGraphData = await Training.aggregate(con1);
            let trainingData;
            // Now, map the weekNumber to dayName in your application code

            if(req.query.filter == "yearly"){
              trainingData = await trainingGraphData.map(item => (
                  {
                  ...item,
                  month: monthOfYear[item._id],
              }));
            } else{
              
              trainingData = await trainingGraphData.map(item => (
                  {
                  ...item,
                  day: daysOfWeek[item._id -1 ],
              }));
            }
            let trainings = await Training.find(params).populate('facilityId sportId').skip(skipIndex).limit(limit);
            
            let trainingTotal = await Training.find(params);
             
            return SendResponse(
              res, {
                  trainingData,
                  trainings,
                  trainingTotal : trainingTotal.length
              },
              i18n.__('success'),
              200
            );
           

      }catch (error) {
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

    getStudentsGraph: async(req,res) => {
      try{
          let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
          sort = {
            [sort]: order == "desc" ? -1 : 1,
          };
          limit = parseInt(limit);
          page = req.query.page ? parseInt(req.query.page) : 1;
          var skipIndex = (page - 1) * limit;
          if( !await Facility.findById(req.user.id)){
              return SendResponse(
                  res, {
                      isBoom: true
                  },
                  "No such user found",
                  422
              ); 
          }

          let allTrainings = await Training.find({
              facilityAdminId: ObjectId(req.user.id),
              isDeleted: false,
              status: true
          });

          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthOfYear = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
            let params = {};
            if (req.query.filter == "weekly") {
              if(req.query.startDate && req.query.endDate ){
                  params = Object.assign( params, {
                      trainingId : {
                        $in: allTrainings.map(training => training._id)
                      },
                      startDate: {
                        $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                        $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                      },
                    });
              }else{
                  params = Object.assign( params, {
                      trainingId : {
                        $in: allTrainings.map(training => training._id)
                      },
                      startDate: {
                        $gte: moment().startOf("week").format('YYYY-MM-DD'),
                        $lte: moment().endOf("week").format('YYYY-MM-DD'),
                      },
                    });
              }
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                },
              ];
            } else if (req.query.filter == "monthly") {
              const currentYear = new Date().getFullYear();
              if(req.query.month){
                  params = Object.assign(params,{
                      trainingId : {
                          $in: allTrainings.map(training => training._id)
                      },
                      // startDate: {
                      //     $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                      //     $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                      // }
                      startDate: {
                        $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                        $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                      }
                  });
              }else{
                  params = Object.assign(params,{
                      trainingId : {
                          $in: allTrainings.map(training => training._id)
                    },
                    startDate: {
                      $gte: new Date(moment().startOf("month").format('YYYY-MM-DD')),
                      $lte: new Date(moment().endOf("month").format('YYYY-MM-DD')),
                    },
                  });
              }
              var con1 = [
                {
                  $match: params,
                }, 
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },               
                {
                  $group: {
                    _id: {
                      $week: "$startDate"
                    },
                    count: {
                      $sum: 1
                    }
                  }
                }
              ];
            }  else if (req.query.filter == "yearly") {
              params = {
                trainingId : {
                      $in: allTrainings.map(training => training._id)
                },
                startDate: {
                  $gte: new Date(moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD')),
                  $lte: new Date(moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD')),
                },
              };
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group:{
                    _id : {
                      $month : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                }
              ];
            } else {
              params = {
                trainingId : {
                  $in: allTrainings.map(training => training._id)
                },
                startDate: {
                  $gte: moment().startOf("week").format('YYYY-MM-DD'),
                  $lte: moment().endOf("week").format('YYYY-MM-DD'),
                },
              };
              var con1 = [
                {
                  $match: params,
                },
                {
                  $addFields: {
                    startDate: {
                      $toDate: "$startDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$startDate"
                    },
                    count : {
                      $sum : 1
                    }
                  }
                },
              ];
            }
            const bookingGraphData = await TrainingBooking.aggregate(con1);
            const trainingBookingData = await TrainingBooking.find(params);
            let studentsData;
            // Now, map the weekNumber to dayName in your application code

            if(req.query.filter == "yearly"){
              studentsData = await bookingGraphData.map(item => (
                  {
                  ...item,
                  month: monthOfYear[item._id],
              }));
            } else{
              
              studentsData = await bookingGraphData.map(item => (
                  {
                  ...item,
                  day: daysOfWeek[item._id -1 ],
              }));
            }

            let sportIds = [];
            trainingBookingData.forEach(element => {
              if (!sportIds.find(item => (item.sportId).toString() === (element.sportId).toString())){
                sportIds.push({ sportId : element.sportId , count : 1 })
              }else{
                let index = sportIds.findIndex((item) => (item.sportId).toString() === (element.sportId).toString());
                sportIds[index].count += 1 
              }
            });

            let sportsList = await Sport.aggregate([
              { 
                $match : {
                  _id : { $in : sportIds.map((item) => ObjectId(item.sportId))}
                },
              },
              {
                $addFields: {
                  count: {
                    $sum: {
                      $map: {
                        input: sportIds,
                        as: "sport",
                        in: {
                          $cond: {
                            if: { $eq: ["$$sport.sportId", "$_id"] },
                            then: "$$sport.count",
                            else: 0,
                          },
                        },
                      },
                    },
                  },
                },
              },
              {
                $skip: skipIndex
              },
              {
                  $limit: limit
              }
            ]);

            let sportsListCount = await Sport.find({
              _id : { $in : sportIds.map((item) => ObjectId(item.sportId))}
            });
            return SendResponse(
              res, {
                  studentsData,
                  sportsList,
                  sportsListCount  : sportsListCount.length || 0
              },
              i18n.__('success'),
              200
            );
           

      }catch (error) {
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

    getRevenueGraph: async(req,res) => {
      try{
          let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
          sort = {
            [sort]: order == "desc" ? -1 : 1,
          };
          limit = parseInt(limit);
          page = req.query.page ? parseInt(req.query.page) : 1;
          var skipIndex = (page - 1) * limit;
          const facilityAdminDetails = await Facility.findById(req.user.id);
          if( !facilityAdminDetails){
              return SendResponse(
                  res, {
                      isBoom: true
                  },
                  "No such user found",
                  422
              ); 
          }

          let allTrainings = await Training.find({
              facilityAdminId: ObjectId(req.user.id),
              isDeleted: false,
              status: true
          });
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthOfYear = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
          let params = {};
          let trainingListParams = {};
            if (req.query.filter == "weekly") {
              if(req.query.startDate && req.query.endDate ){
                  params = Object.assign( params, {
                      trainingId : {
                        $in: allTrainings.map(training => training._id)
                      },
                      // startDate: {
                      //   $gte: moment(req.query.startDate).startOf("day").toISOString(),
                      //   $lte: moment(req.query.endDate).endOf("day").toISOString(),
                      // },
                      fundTransferDate: {
                        $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                        $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                      },
                      isFundTransferred : true
                    });
                  trainingListParams = Object.assign( trainingListParams, {
                    trainingId : {
                      $in: allTrainings.map(training => training._id)
                    },
                    startDate: {
                      $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                      $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                    }
                  });
              }else{
                  params = Object.assign( params, {
                      trainingId : {
                        $in: allTrainings.map(training => training._id)
                      },
                      // startDate: {
                      //   $gte: moment().startOf("week").toISOString(),
                      //   $lte: moment().endOf("week").toISOString(),
                      // },
                      fundTransferDate: {
                        $gte: moment().startOf("week").format('YYYY-MM-DD'),
                        $lte: moment().endOf("week").format('YYYY-MM-DD'),
                      },
                      isFundTransferred : true
                    });
                    trainingListParams = Object.assign( trainingListParams, {
                      trainingId : {
                        $in: allTrainings.map(training => training._id)
                      },
                      startDate: {
                        $gte: moment().startOf("week").format('YYYY-MM-DD'),
                        $lte: moment().endOf("week").format('YYYY-MM-DD'),
                      }
                    });
              }
              var con1 = [
                {
                  $match: params,
                },
                // {
                //   $addFields: {
                //     startDate: {
                //       $toDate: "$startDate", // Convert string to date
                //     },
                //   },
                // },
                {
                  $addFields: {
                    fundTransferDate: {
                      $toDate: "$fundTransferDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$fundTransferDate"
                    },
                    count : {
                      $sum : "$facilityAdminLocalCommission"
                    }
                  }
                },
              ];
            } else if (req.query.filter == "monthly") {
              const currentYear = new Date().getFullYear();
              if(req.query.month){
                  params = Object.assign(params,{
                      trainingId : {
                          $in: allTrainings.map(training => training._id)
                      },
                      // startDate: {
                      //     $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                      //     $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                      // },
                      // fundTransferDate: {
                      //   $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                      //   $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                      // },
                      fundTransferDate: {
                        $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                        $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                      },
                      isFundTransferred : true
                  });
                  trainingListParams  = Object.assign(trainingListParams,{
                    trainingId : {
                        $in: allTrainings.map(training => training._id)
                    },
                    startDate: {
                      $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                      $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                    }
                  });
              }else{
                  params = Object.assign(params,{
                      trainingId : {
                          $in: allTrainings.map(training => training._id)
                    },
                    // startDate: {
                    //   $gte: moment().startOf("month").toISOString(),
                    //   $lte: moment().endOf("month").toISOString(),
                    // },
                    fundTransferDate: {
                      $gte: moment().startOf("month").format('YYYY-MM-DD'),
                      $lte: moment().endOf("month").format('YYYY-MM-DD'),
                    },
                    isFundTransferred : true
                  });
                  trainingListParams = Object.assign(trainingListParams,{
                      trainingId : {
                          $in: allTrainings.map(training => training._id)
                    },
                    startDate: {
                      $gte: moment().startOf("month").format('YYYY-MM-DD'),
                      $lte: moment().endOf("month").format('YYYY-MM-DD'),
                    },
                  });
              }
              var con1 = [
                {
                  $match: params,
                },   
                // {
                //   $addFields: {
                //     startDate: {
                //       $toDate: "$startDate", // Convert string to date
                //     },
                //   },
                // }, 
                {
                  $addFields: {
                    fundTransferDate: {
                      $toDate: "$fundTransferDate", // Convert string to date
                    },
                  },
                },             
                {
                  $group: {
                    _id: {
                      $week: "$fundTransferDate"
                    },
                    count: {
                      $sum: "$facilityAdminLocalCommission"
                    }
                  }
                }
              ];
            }  else if (req.query.filter == "yearly") {
              params = {
                trainingId : {
                      $in: allTrainings.map(training => training._id)
                },
                // startDate: {
                //   $gte: moment().year(parseInt(req.query.year)).startOf("year").toISOString(),
                //   $lte: moment().year(parseInt(req.query.year)).endOf("year").toISOString(),
                // },
                fundTransferDate: {
                  $gte: moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD'),
                  $lte: moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD'),
                },
                isFundTransferred : true
              };

              trainingListParams = Object.assign(trainingListParams, {
                trainingId : {
                      $in: allTrainings.map(training => training._id)
                },
                startDate: {
                  $gte: moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD'),
                  $lte: moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD'),
                }
              });


              var con1 = [
                {
                  $match: params,
                },
                // {
                //   $addFields: {
                //     startDate: {
                //       $toDate: "$startDate", // Convert string to date
                //     },
                //   },
                // },
                {
                  $addFields: {
                    fundTransferDate: {
                      $toDate: "$fundTransferDate", // Convert string to date
                    },
                  },
                },
                {
                  $group:{
                    _id : {
                      $month : "$fundTransferDate"
                    },
                    count : {
                      $sum : "$facilityAdminLocalCommission"
                    }
                  }
                }
              ];
            } else {
              params = {
                trainingId : {
                  $in: allTrainings.map(training => training._id)
                },
                // startDate: {
                //   $gte: moment().startOf("week").toISOString(),
                //   $lte: moment().endOf("week").toISOString(),
                // },
                fundTransferDate: {
                  $gte: moment().startOf("week").format('YYYY-MM-DD'),
                  $lte: moment().endOf("week").format('YYYY-MM-DD'),
                },
                isFundTransferred : true
              };
              trainingListParams = Object.assign( trainingListParams , {
                trainingId : {
                  $in: allTrainings.map(training => training._id)
                },
                startDate: {
                  $gte: moment().startOf("week").format('YYYY-MM-DD'),
                  $lte: moment().endOf("week").format('YYYY-MM-DD'),
                }
              });
              var con1 = [
                {
                  $match: params,
                },
                // {
                //   $addFields: {
                //     startDate: {
                //       $toDate: "$startDate", // Convert string to date
                //     },
                //   },
                // },
                {
                  $addFields: {
                    fundTransferDate: {
                      $toDate: "$fundTransferDate", // Convert string to date
                    },
                  },
                },
                {
                  $group : {
                    _id : {
                      $dayOfWeek : "$fundTransferDate"
                    },
                    count : {
                      $sum : "$facilityAdminLocalCommission"
                    }
                  }
                },
              ];
            }
            const revenueGraphData = await TrainingBooking.aggregate(con1);
            // const trainingRevenueData = await TrainingBooking.find(params);
            const trainingRevenueData = await TrainingBooking.find(trainingListParams);
            let revenueData;
            // Now, map the weekNumber to dayName in your application code

            if(req.query.filter == "yearly"){
              revenueData = await revenueGraphData.map(item => (
                  {
                  ...item,
                  month: monthOfYear[item._id],
              }));
            } else{
              
              revenueData = await revenueGraphData.map(item => (
                  {
                  ...item,
                  day: daysOfWeek[item._id -1 ],
              }));
            }
            let totalRevenue =  revenueData.reduce((accumulator, currentValue) => {
              return accumulator + currentValue.count;
            }, 0);
            let trainingIds = [];
            trainingRevenueData.forEach(element => {
              if (!trainingIds.find(item => (item.trainingId).toString() === (element.trainingId).toString())){
                trainingIds.push({ trainingId : element.trainingId, revenue : element.facilityAdminLocalCommission, isFundTransferred : element.isFundTransferred })
              }else{
                let index = trainingIds.findIndex((item) => (item.trainingId).toString() === (element.trainingId).toString());
                if(element.isFundTransferred == true ){
                 trainingIds[index].revenue += element.facilityAdminLocalCommission;
                }
              }
            });

            let revenueTraining = await Training.aggregate([
              { 
                $match : {
                  _id : { $in : trainingIds.map((item) => ObjectId(item.trainingId))}
                },
              },
              {
                $addFields: {
                  revenue: {
                    $sum: {
                      $map: {
                        input: trainingIds,
                        as: "training",
                        in: {
                          $cond: {
                            if: { $and: [
                              { $eq: ["$$training.trainingId", "$_id"] },
                              { $eq: ["$$training.isFundTransferred", true] } // Check if isFundTransferred is true
                            ] },
                            // if: { $eq: ["$$training.trainingId", "$_id"] },
                            then: "$$training.revenue",
                            else: 0,
                          },
                        },
                      },
                    },
                  }
                },
              },
              {
                $skip: skipIndex
              },
              {
                  $limit: limit
              }
            ]);

            let revenueTrainingTotal = await Training.find({
              _id : { $in : trainingIds.map((item) => ObjectId(item.trainingId))}
            });
             
            return SendResponse(
              res, {
                revenueData ,
                revenueTrainingTotal : revenueTrainingTotal.length,
                totalRevenue : totalRevenue,
                revenueTraining ,
                currency : "USD"
              },
              i18n.__('success'),
              200
            );
           

      }catch (error) {
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

    getTrainingRevenueDetails: async( req,res ) =>{
      try{
        let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
        sort = {
          [sort]: order == "desc" ? -1 : 1,
        };
        limit = parseInt(limit);
        page = req.query.page ? parseInt(req.query.page) : 1;
        var skipIndex = (page - 1) * limit;
        let trainingDetails = await Training.findById(req.params.id).select('_id trainingName startDate endDate sportId').populate('sportId');

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthOfYear = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
        let params = { trainingId : ObjectId(req.params.id) };
          if (req.query.filter == "weekly") {
            if(req.query.startDate && req.query.endDate ){
                params = Object.assign( params, {
                  // startDate: {
                  //     $gte: moment(req.query.startDate).startOf("day").toISOString(),
                  //     $lte: moment(req.query.endDate).endOf("day").toISOString(),
                  //   }
                  fundTransferDate: {
                    $gte: moment(req.query.startDate).startOf("day").format('YYYY-MM-DD'),
                    $lte: moment(req.query.endDate).endOf("day").format('YYYY-MM-DD'),
                  }
                  });
            }else{
                params = Object.assign( params, {
                  // startDate: {
                  //     $gte: moment().startOf("week").toISOString(),
                  //     $lte: moment().endOf("week").toISOString(),
                  //   }
                  fundTransferDate: {
                    $gte: moment().startOf("week").format('YYYY-MM-DD'),
                    $lte: moment().endOf("week").format('YYYY-MM-DD'),
                  }
                  });
            }
          } else if (req.query.filter == "monthly") {
            const currentYear = new Date().getFullYear();
            if(req.query.month){
                params = Object.assign(params,{
                  // startDate: {
                  //       $gte: new Date(currentYear, parseInt(req.query.month) - 1, 1).toISOString(), // Month is 0-based, so subtract 1 from targetMonth
                  //       $lt: new Date(currentYear, parseInt(req.query.month), 0).toISOString() // End of the month of the target month
                  //   }
                  fundTransferDate: {
                    $gte: moment(`${currentYear}-${req.query.month}-01`).format('YYYY-MM-DD'), // Month is 0-based, so subtract 1 from targetMonth
                    $lt: moment(`${currentYear}-${req.query.month}-01`).endOf('month').format('YYYY-MM-DD') // End of the month of the target month
                }
                });
            }else{
                params = Object.assign(params,{
                  // startDate: {
                  //   $gte: moment().startOf("month").toISOString(),
                  //   $lte: moment().endOf("month").toISOString(),
                  // }
                  fundTransferDate: {
                    $gte: moment().startOf("month").format('YYYY-MM-DD'),
                    $lte: moment().endOf("month").format('YYYY-MM-DD'),
                  }
                });
            }
          }  else if (req.query.filter == "yearly") {
            params = Object.assign(params,{
              // startDate: {
              //   $gte: moment().year(parseInt(req.query.year)).startOf("year").toISOString(),
              //   $lte: moment().year(parseInt(req.query.year)).endOf("year").toISOString(),
              // }
              fundTransferDate: {
                $gte: moment().year(parseInt(req.query.year)).startOf("year").format('YYYY-MM-DD'),
                $lte: moment().year(parseInt(req.query.year)).endOf("year").format('YYYY-MM-DD'),
              }
            });

          } else {
            params = Object.assign(params,{
              // startDate: {
              //   $gte: moment().startOf("week").toISOString(),
              //   $lte: moment().endOf("week").toISOString(),
              // }
              fundTransferDate: {
                $gte: moment().startOf("week").format('YYYY-MM-DD'),
                $lte: moment().endOf("week").format('YYYY-MM-DD'),
              }
            });
          }
        const [{studentsList, total}] = await TrainingBooking.aggregate([
            {
              $match : params
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
                  preserveNullAndEmptyArrays : true
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
                    studentsList: [{
                            $project: {
                                _id: 1,
                                bookingFor: 1,
                                bookingId: 1,
                                userId: 1,
                                familyMember: 1,
                                trainingId: 1,
                                startDate: 1,
                                fundTransferDate: 1,
                                facilityAdminLocalCommission: 1,
                                facilityAdminCommission: 1,
                                isFundTransferred: 1,
                                userDetails: "$userDetails",
                                familyMember: "$familyMember"
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

        return SendResponse(
          res, {
            trainingDetails: trainingDetails,
              studentsList: studentsList,
              total: total || 0
          },
          "Students list",
          200
      );

      }catch (error) {
          dump('error', error)
          return SendResponse(
              res, {
                  isBoom: true
              },
              i18n.__('Something_went_wrong_please_try_again'),
              500
          );
      }
    }

   // code updated  

}