const { Mongoose } = require("mongoose");
const Boom = require("boom");
const User = require("../../models/user");
const Member = require("../../models/member");
const UserTeam = require("../../models/userteam");
const UserEvent = require("../../models/event");
const UserTrainings = require("../../models/training");
const TrainingBookings = require("../../models/trainingBooking");
const TrainingBookingSlots = require("../../models/trainingBookingSlot");
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

module.exports = {
  //*******Trainings list********** */
  list: async (req, res) => {
    try {
      let { limit = 10, search, page, status, sort } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      let params = { };
      let sortparam = { createdAt: -1 };

      if (search != "" && search != null) {
        params = Object.assign(params, {
              trainingName: { $regex: ".*" + search + ".*", $options: "i" },
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

      const [{ trainingList, total }] = await UserTrainings.aggregate([
        {
          $match: params,
        },
        {
            $lookup : {
               from : "sports",
               let : { sportId : "$sportId"},
               pipeline : [
                { $match : { $expr : { $eq : [ "$_id", "$$sportId"]}}},
                {
                  $project : {
                    _id : 1,
                    sports_name : 1,
                  }
                }
               ],
               as : "sportDetails"
            }
        },
        { $unwind : {
             path : "$sportDetails",
             preserveNullAndEmptyArrays : true
           }
        },
        {
            $lookup : {
                 from : "facilitybranches",
                 let : { facilityId : "$facilityId"},
                 pipeline : [
                  { $match : { $expr : { $eq : ["$_id", "$$facilityId"]}}},
                  {
                    $project : {
                      _id : 1,
                      name : 1,
                      country  : 1,
                      state : 1,
                      city : 1
                    }
                  }
                 ],
                 as : "facilityBranchDetails"
            }
        },
        { $unwind : {
            path : "$facilityBranchDetails",
            preserveNullAndEmptyArrays : true
          }
        },
        {
            $lookup : {
                from : "trainingbookingslots",
                let : { trainingId : "$_id"},
                pipeline : [
                  { $match : { 
                      $expr : { $eq : ["$trainingId", "$$trainingId"]},
                      // isSelected : true,
                    }
                  },
                ],
                as : "trainingBookedSlots"
            }
        },
        // {
        //    $unwind : {
        //     path : "$trainingBookedSlots",
        //     preserveNullAndEmptyArrays : true,
        //    }
        // },
        {
            $lookup : {
                from : "trainingslots",
                let : { trainingId : "$_id" },
                pipeline : [
                  { $match : {
                    $expr : { $eq : ["$trainingId", "$$trainingId"]},
                    isSelected : true
                  }}
                ],
                as : "trainingSlots"
            }
        },
        // {
        //     $unwind : {
        //         path : "$trainingSlots",
        //         preserveNullAndEmptyArrays : false,
        //     }
        // },
        {
            $lookup : {
              from : "facilities",
              let: {
                  coachId: "$coachesId",
              },
              pipeline: [{
                  $match: {
                  $and: [{
                      $expr: {
                          $in: ["$_id", "$$coachId"],
                      },
                      },
                  ],
                  },
              },
              {
                  $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  coverImage: 1,
                  about: 1,
                  rating: 1,
                  },
              },
              ],
              as: "coachDetails",
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
                  trainingList: [{
                          $project: {
                              _id: 1,
                              trainingName: 1,
                              address: 1,
                              coverImage: 1,
                              location: 1,
                              startDate: 1,
                              endDate: 1,
                              days: 1,
                              createdAt: 1,
                              students: 1,
                              rating: 1,
                              coachDetails : "$coachDetails",
                              sport : "$sportDetails",
                              facilityId  : 1,
                              facilityBranchDetails : "$facilityBranchDetails",
                              students : 1,
                              trainingBookedSlots : "$trainingBookedSlots",
                              trainingSlots : "$trainingSlots"
                            }

                      },
                      {
                          $sort: sortparam
                      },
                      {
                          $skip: skip
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
            "Training details",
            200
        );
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

   // Download Trainings List

   downloadTrainingList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" , status, search} = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = { };

      if (search != "" && search != null) {
        params = Object.assign(params, {
            trainingName: { $regex: ".*" + search + ".*", $options: "i" },
        });
      }
      if (status != "" && status != null) {
        params = Object.assign(params, {
          status: status == "active" ? true : false,
        });
      }

      const trainingList = await UserTrainings.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
             from : "sports",
             let : { sportId : "$sportId"},
             pipeline : [
              { $match : { $expr : { $eq : [ "$_id", "$$sportId"]}}},
              {
                $project : {
                  _id : 1,
                  sports_name : 1,
                }
              }
             ],
             as : "sportDetails"
          }
      },
      { $unwind : {
           path : "$sportDetails",
           preserveNullAndEmptyArrays : true
         }
      },
      {
          $lookup : {
               from : "facilitybranches",
               let : { facilityId : "$facilityId"},
               pipeline : [
                { $match : { $expr : { $eq : ["$_id", "$$facilityId"]}}},
                {
                  $project : {
                    _id : 1,
                    name : 1,
                    country  : 1,
                    state : 1,
                    city : 1
                  }
                }
               ],
               as : "facilityBranchDetails"
          }
      },
      { $unwind : {
          path : "$facilityBranchDetails",
          preserveNullAndEmptyArrays : true
        }
      },
      {
          $lookup : {
              from : "trainingbookingslots",
              let : { trainingId : "$_id"},
              pipeline : [
                { $match : { 
                    $expr : { $eq : ["$trainingId", "$$trainingId"]},
                    // isSelected : true,
                  }
                },
              ],
              as : "trainingBookedSlots"
          }
      },
      // {
      //    $unwind : {
      //     path : "$trainingBookedSlots",
      //     preserveNullAndEmptyArrays : true,
      //    }
      // },
      {
          $lookup : {
              from : "trainingslots",
              let : { trainingId : "$_id" },
              pipeline : [
                { $match : {
                  $expr : { $eq : ["$trainingId", "$$trainingId"]},
                  isSelected : true
                }}
              ],
              as : "trainingSlots"
          }
      },
      // {
      //     $unwind : {
      //         path : "$trainingSlots",
      //         preserveNullAndEmptyArrays : false,
      //     }
      // },
        {
            $lookup : {
              from : "facilities",
              let: {
                  coachId: "$coachesId",
              },
              pipeline: [{
                  $match: {
                  $and: [{
                      $expr: {
                          $in: ["$_id", "$$coachId"],
                      },
                      },
                  ],
                  },
              },
              {
                  $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  coverImage: 1,
                  about: 1,
                  rating: 1,
                  },
              },
              ],
              as: "coachDetails",
           },
        },
        {
          $project: {
            _id: 1,
            trainingName: 1,
            address: 1,
            coverImage: 1,
            location: 1,
            startDate: 1,
            endDate: 1,
            days: 1,
            sunday: 1,
            monday: 1,
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            wednesday: 1,
            createdAt: 1,
            students: 1,
            rating: 1,
            coachDetails : "$coachDetails",
            sport : "$sportDetails",
            facilityId  : 1,
            facilityBranchDetails : "$facilityBranchDetails",
            students : 1,
            trainingBookedSlots : "$trainingBookedSlots",
            trainingSlots : "$trainingSlots"
          },
        },
        {
          $sort: sort ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Training Name",
        "Sport Type",
        "Facility Name",
        "Country",
        "State",
        "City",
        "Duration",
        "Attendees",
        "Completed Sessions",
        "Remaining Sessions"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Training.xlsx";
      const currentDate = new Date();

      //get wanted params by mapping
      const result = trainingList.map((val, index) => {

        const date1 = new Date(val.startDate);
        const date2 = new Date(val.endDate);
   
        // Difference in months
        const differenceInMonths = (date2.getMonth() - date1.getMonth()) + (12 * (date2.getFullYear() - date1.getFullYear()));
        val.trainingDuration = differenceInMonths;

        if( date1 > currentDate){
          val.trainingStatus = 'Upcoming'
        }

        if( date1 < currentDate && date2 > currentDate){
          val.trainingStatus = 'In Progress'
        }

        if( date2 < currentDate ){
          val.trainingStatus = 'Completed'
        }

        val.completedSessions = 0;
        val.remainingSessions = 0;

        for( let j = 0; j < val.trainingSlots.length; j++){
          const date3  = new Date(val.trainingSlots[j].date);
          if( date3 < currentDate){
            val.completedSessions = val.completedSessions 
            + 1;
          }
          if( date3 >= currentDate){
            val.remainingSessions = val.remainingSessions 
            + 1;
          }
        }

    
        return [
          index + 1,
          val.trainingName,
          val.sport ? val.sport.sports_name : '',
          val.facilityBranchDetails ? val.facilityBranchDetails.name : '',
          val.facilityBranchDetails.country != null ? val.facilityBranchDetails.country : '',
          val.facilityBranchDetails.state != null ? val.facilityBranchDetails.state : '',
          val.facilityBranchDetails.city != null ? val.facilityBranchDetails.city : '',
          val.trainingDuration + '' + ( val.trainingDuration > 1 ? 'months' : 'month'),
          val.students,
          val.completedSessions,
          val.remainingSessions
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

  trainingDetails : async(req, res) => {
    try{
       let team = await UserTrainings.findById(req.params.id);

       if(!team) {
         return SendResponse(
          res,
          { isBoom : true },
          "No training found",
          500
         );
        }

        const [data] = await UserTrainings.aggregate([
          {
            $match : { _id : ObjectId(req.params.id )}
          },
          {
            $lookup : {
               from : "sports",
               let : { sportId : "$sportId"},
               pipeline : [
                { $match : { $expr : { $eq : [ "$_id", "$$sportId"]}}},
                {
                  $project : {
                    _id : 1,
                    sports_name : 1,
                  }
                }
               ],
               as : "sportDetails"
            }
        },
        { $unwind : {
             path : "$sportDetails",
             preserveNullAndEmptyArrays : true
           }
        },
        {
            $lookup : {
                 from : "facilitybranches",
                 let : { facilityId : "$facilityId"},
                 pipeline : [
                  { $match : { $expr : { $eq : ["$_id", "$$facilityId"]}}},
                  {
                    $project : {
                      _id : 1,
                      name : 1,
                      country  : 1,
                      state : 1,
                      city : 1
                    }
                  }
                 ],
                 as : "facilityBranchDetails"
            }
        },
        { $unwind : {
            path : "$facilityBranchDetails",
            preserveNullAndEmptyArrays : true
          }
        },
        {
            $lookup : {
                from : "trainingbookingslots",
                let : { trainingId : "$_id"},
                pipeline : [
                  { $match : { 
                      $expr : { $eq : ["$trainingId", "$$trainingId"]},
                    }
                  },
                ],
                as : "trainingBookedSlots"
            }
        },
        // {
        //    $unwind : {
        //     path : "$trainingBookedSlots",
        //     preserveNullAndEmptyArrays : true,
        //    }
        // },
        {
            $lookup : {
                from : "trainingslots",
                let : { trainingId : "$_id" },
                pipeline : [
                  { $match : {
                    $expr : { $eq : ["$trainingId", "$$trainingId"]},
                    isSelected : true
                  }}
                ],
                as : "trainingSlots"
            }
        },
        // {
        //     $unwind : {
        //         path : "$trainingSlots",
        //         preserveNullAndEmptyArrays : false,
        //     }
        // },
          {
            $lookup : {
              from : "facilities",
              let: {
                  coachId: "$coachesId",
              },
              pipeline: [{
                  $match: {
                  $and: [{
                      $expr: {
                          $in: ["$_id", "$$coachId"],
                      },
                      },
                  ],
                  },
              },
              {
                  $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  coverImage: 1,
                  about: 1,
                  rating: 1,
                  },
              },
              ],
              as: "coachDetails",
           },
          },

          {
            $project : {
                _id: 1,
                trainingName: 1,
                address: 1,
                coverImage: 1,
                location: 1,
                startDate: 1,
                endDate: 1,
                days: 1,
                sunday: 1,
                monday: 1,
                tuesday: 1,
                wednesday: 1,
                thursday: 1,
                friday: 1,
                saturday: 1,
                wednesday: 1,
                createdAt: 1,
                students: 1,
                rating: 1,
                coachDetails : "$coachDetails",
                sport : "$sportDetails",
                facilityId  : 1,
                facilityBranchDetails : "$facilityBranchDetails",
                students : 1,
                trainingBookedSlots : "$trainingBookedSlots",
                trainingSlots : "$trainingSlots"
            }
          }
        ]);

      return SendResponse(
        res,
        { trainingDetails : data },
        "Training Details",
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

  studentsList : async(req, res) => {
    try{
      let { limit = 10, search, page } = req.query;
      limit = parseInt(limit) || 10;
      let skip =  page ? (page * limit - limit) : 0;
      // const start = (page - 1) * limit;
      const start = page ? (page * limit - limit) : 0;
      const end = start + limit;
      let training = await UserTrainings.findById(req.params.id);

      if(!training) {
        return SendResponse(
        res,
        { isBoom : true },
        "No training found",
        500
        );
      }
      let params = { trainingId: ObjectId(req.params.id) };

      if (search && search !== "" && search !== null) {
        params = Object.assign(params, {
          "$expr": {
            "$regexMatch": {
              "input": "$combinedDetails.fullName",
              "regex": ".*" + search + ".*",
              "options": "i"
            }
          }
        });
      }
      let trainingBookings = await TrainingBookings.aggregate([
        {
          $lookup: {
            from: "users",
            let: { lookupId: "$userId"},
            pipeline: [
              {
                $match:  {
                  $expr: {
                    $eq: ["$_id", "$$lookupId"]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  profileImage: 1,
                  email: 1,
                  isFamilyMember: "no"
                }
              }
            ],
            as: "userDetails"
          }
        },
        {
          $lookup: {
            from: "members",
            let: { familyMemberId: "$familyMember" },
            pipeline: [
              {
                $match:  {
                  $expr: {
                    $eq: ["$_id", "$$familyMemberId"]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  image: 1,
                  email: 1,
                  isFamilyMember: "yes"
                }
              }
            ],
            as: "memberDetails"
          }
        },
        {
          $addFields: {
            combinedDetails: {
              $cond: {
                if: { $eq: ["$bookingFor", "self"] },
                then: "$userDetails",
                else: "$memberDetails"
              }
            }
          }
        },
        {
          $unwind: {
            path : "$combinedDetails",
            preserveNullAndEmptyArrays : true
          }
        },
        {
          $match: params
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            familyMember: 1,
            userDetails: "$combinedDetails",
            memberDetails: {
              $cond: {
                if: { $eq: ["$bookingFor", "self"] },
                then: null, // Exclude memberDetails for self bookings
                else: "$memberDetails"
              }
            }
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ]);
      
      let students = [];
      for await ( const booking of trainingBookings) {
            let trainingBookedSlots = await TrainingBookingSlots.find({
              trainingBookingId : ObjectId(booking._id)
            });
            let completedSlots = await trainingBookedSlots.filter((item) => item.attendance == "present");
            if ( booking.familyMember && booking.familyMember != null && booking.familyMember != "null"){
              students.push({
                bookingId: booking.bookingId,
                familyMemberId: booking.familyMember,
                fullName: booking.userDetails.fullName,
                email: booking.userDetails.email,
                image: booking.userDetails.image,
                bookedSessionsCount : trainingBookedSlots.length,
                completedSessionsCount : completedSlots.length,
                remainingSessionsCount : (trainingBookedSlots.length) - (completedSlots.length)
              })
            }
            else{
              students.push({
                bookingId: booking.bookingId,
                userId: booking.userId,
                fullName: booking.userDetails.fullName,
                email: booking.userDetails.email,
                image: booking.userDetails.profileImage,
                bookedSessionsCount : trainingBookedSlots.length,
                completedSessionsCount : completedSlots.length,
                remainingSessionsCount : (trainingBookedSlots.length) - (completedSlots.length)
              })
            }
        };
  
        return SendResponse(
          res,
          {
            studentsList : students.slice(
              start,
              end
            ),
            total : students.length
          },
          "Students List",
          200
        );
         
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