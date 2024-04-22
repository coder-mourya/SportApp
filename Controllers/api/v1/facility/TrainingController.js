const FacilityBranch = require("../../../../models/facilityBranch");
const Training = require("../../../../models/training");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require("i18n");
const {dump}=require("../../../../services/dump");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const FileUpload = require("../../../../services/upload-file");
const TimeConvertor = require("../../../../services/timeConversion");
const TrainingSlot = require("../../../../models/trainingSlot");
const TrainingBooking = require("../../../../models/trainingBooking");
const TrainingBookingSlots = require("../../../../models/trainingBookingSlot");
const Chat = require("../../../../models/chat");
const ChatMessage = require("../../../../models/chatmessage");
const Promotion = require("../../../../models/promotion");
const Facility = require("../../../../models/facility");
const User = require("../../../../models/user");
const Member = require("../../../../models/member");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");
const { forEach } = require("lodash");
const trainingBookingSlot = require("../../../../models/trainingBookingSlot");
module.exports = {
  getFacilityList: async (req, res) => {
    try {
      let facilities = await FacilityBranch.find(
        {
          facilityId: ObjectId(req.user.id),
          isDeleted: false,
          status: true,
        },
        {
          _id: 1,
          name: 1,
          openingTime: 1,
          closingTime: 1,
          chosenSports: 1,
          status: 1
        }
      ).populate('chosenSports');
      return SendResponse(
        res,
        {
          facilities: facilities,
        },
        i18n.__("success"),
        200
      );
    } catch (error) {
      dump("error", error);
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

  getCoachList: async (req, res) => {
    try {
      let coaches = await Facility.find(
        {
          facilityAdminId: ObjectId(req.user.id),
          isDeleted: false,
          status: true,
        },
        {
          _id: 1,
          name: 1,
          chosenSports: 1,
          facilityAdminId: 1
        }
      ).populate('chosenSports');
      return SendResponse(
        res,
        {
          coaches: coaches,
        },
        i18n.__("success"),
        200
      );
    } catch (error) {
      dump("error", error);
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

  createTraining: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        sportId: "required",
        trainingName: "required",
        facilityId: "required",
        curriculum: "required",
        coachesId: "required",
        ageGroupFrom: "required",
        ageGroupTo: "required",
        proficiencyLevel: "required|in:Beginners,Intermediate,Advanced",
        startDate: "required",
        endDate: "required",
        days: "required",
        sessionTimeDuration: "required",
        minimumSession: "required",
        // inclusiveTax: "required",
        localCountry: "required",
        // maximumSession: "required",
        minimumStudent: "required",
        // maximumStudent: "required",
        price: "required",
        // currency: "nullable",
      });

      if (req.user.userType == "coach")
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "You have not rights to add training",
          422
        );
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
      // const v2 = new Validator(req.files, {
      //     coverImage: 'required|array',
      //     'coverImage.*': 'required|mime:jpg,png'
      // });
      // const matched2 = await v2.check();
      // if (!matched2) {
      //     let first_key = Object.keys(v.errors)[0];
      //     let err = v.errors[first_key]["message"];
      //     return SendResponse(res, {
      //         isBoom: true
      //     }, err, 422);
      // }
      let facilityBranch = await FacilityBranch.findOne({ _id : ObjectId(req.body.facilityId), isDeleted : false , status : true });
      if (!facilityBranch)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Selected facility not found",
          422
        );
      req.body.location = facilityBranch.location;
      req.body.address = facilityBranch.address;
      req.body.country = facilityBranch.country;
      req.body.state = facilityBranch.state ? facilityBranch.state : "";
      req.body.city = facilityBranch.city ? facilityBranch.city : "";
      req.body.facilityAdminId = req.user.id;
      if (typeof req.body.days == "string") {
        req.body.days = req.body.days.split(",");
      }
      if (!req.body.days && req.body.days.length < 1) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Days required",
          422
        );
      }
      if (typeof req.body.coachesId == "string") {
        req.body.coachesId = req.body.coachesId.split(",");
      }
      if (!req.body.coachesId && req.body.coachesId.length < 1) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Coaches id required",
          422
        );
      }

      let slots = [];
     
      if (req.body.days.includes("sunday") && !req.body.sunday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Sunday slots required",
          422
        );
      }
      if (req.body.days.includes("monday") && !req.body.monday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Monday slots required",
          422
        );
      }
      if (req.body.days.includes("tuesday") && !req.body.tuesday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Tuesday slots required",
          422
        );
      }
      if (req.body.days.includes("wednesday") && !req.body.wednesday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Wednesday slots required",
          422
        );
      }
      if (req.body.days.includes("thursday") && !req.body.thursday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Thursday slots required",
          422
        );
      }
      if (req.body.days.includes("friday") && !req.body.friday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Friday slots required",
          422
        );
      }
      if (req.body.days.includes("saturday") && !req.body.saturday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Saturday slots required",
          422
        );
      }

      let coverImages = [];
      if (req.files && req.files.coverImage) {
        if (!Array.isArray(req.files.coverImage)) {
          req.files.coverImage = [req.files.coverImage];
        }

        for (const image of req.files.coverImage) {
          let Image = await FileUpload.aws(image);
          coverImages.push(process.env.AWS_URL + Image.Key);
        }
      }
      req.body.coverImage = coverImages;
      if (req.body.days.includes("sunday") && req.body.sunday) {
        req.body.sunday = JSON.parse(req.body.sunday);
      } else {
        delete req.body.sunday;
      }
      if (req.body.days.includes("monday") && req.body.monday) {
        req.body.monday = JSON.parse(req.body.monday);
      } else {
        delete req.body.monday;
      }
      if (req.body.days.includes("tuesday") && req.body.tuesday) {
        req.body.tuesday = JSON.parse(req.body.tuesday);
      } else {
        delete req.body.tuesday;
      }
      if (req.body.days.includes("wednesday") && req.body.wednesday) {
        req.body.wednesday = JSON.parse(req.body.wednesday);
      } else {
        delete req.body.wednesday;
      }
      if (req.body.days.includes("thursday") && req.body.thursday) {
        req.body.thursday = JSON.parse(req.body.thursday);
      } else {
        delete req.body.thursday;
      }
      if (req.body.days.includes("friday") && req.body.friday) {
        req.body.friday = JSON.parse(req.body.friday);
      } else {
        delete req.body.friday;
      }
      if (req.body.days.includes("saturday") && req.body.saturday) {
        req.body.saturday = JSON.parse(req.body.saturday);
      } else {
        delete req.body.saturday;
      }
      req.body.ageGroupFrom = Number(req.body.ageGroupFrom);
      req.body.ageGroupTo = Number(req.body.ageGroupTo);
      req.body.minimumStudent = req.body.minimumStudent
        ? Number(req.body.minimumStudent)
        : 1;
      req.body.maximumStudent = req.body.maximumStudent
        ? Number(req.body.maximumStudent)
        : 1;
      req.body.price = Number(req.body.price);
      var startDateUTC = momentTimeZone.tz(req.body.startDate, req.body.localCountry);
      var endDateUTC = momentTimeZone.tz(req.body.endDate, req.body.localCountry);
      req.body.startDateUTC = startDateUTC.clone().utc().format();
      req.body.endDateUTC = endDateUTC.clone().utc().format();
      let insertedTraining = await Training.create(req.body);
      //   var dateArray = [];
      var currentDate = moment
        .tz(new Date(req.body.startDate), "UTC")
        .format("YYYY-MM-DD");
      var stopDate = moment
        .tz(new Date(req.body.endDate), "UTC")
        .format("YYYY-MM-DD");
      while (currentDate <= stopDate) {
        // let slot = [];
        let dateDay = moment(currentDate).format("dddd");
        let dateDayLower = dateDay.toLowerCase();
        if (req.body.days.includes(dateDayLower)) {
          let daySlot =
            dateDayLower == "sunday"
              ? req.body.sunday
              : dateDayLower == "monday"
              ? req.body.monday
              : dateDayLower == "tuesday"
              ? req.body.tuesday
              : dateDayLower == "wednesday"
              ? req.body.wednesday
              : dateDayLower == "thursday"
              ? req.body.thursday
              : dateDayLower == "friday"
              ? req.body.friday
              : dateDayLower == "saturday"
              ? req.body.saturday
              : [];

          daySlot.forEach(async (timeSlot) => {
            let time = timeSlot.slot.split("-");
              // Extract year, month, and day from the date
              const [year, month, day] = currentDate.split('-').map(Number);
             // Extract start and end times
              const [startTimeStr, endTimeStr] = timeSlot.slot.split('-');
              // Define a function to convert time in HH:mm AM/PM format to 24-hour format
              const convertTo24HourFormat = (newTime) => {
                newTime = newTime.trimRight();
                let [time, period] = newTime.split(/\s/);
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) {
                  hours += 12;
                } else if (period === 'AM' && hours === 12) {
                  hours = 0;
                }
                return [hours, minutes];
              };
           
              let newStartTime = convertTo24HourFormat(startTimeStr);
              let newEndTime = convertTo24HourFormat(endTimeStr);
              // converting the received date and time to local time
              let sourceStartDateTime = momentTimeZone.tz(
                [year, month-1, day, newStartTime[0], newStartTime[1]],
                req.body.localCountry
              );
              // Adjust for DST transitions
              if (sourceStartDateTime.isDST()) {
                sourceStartDateTime.subtract(1, 'hour');
              }

              // Convert the source time to the target time zone
              let targetStartDateTime = momentTimeZone.tz(sourceStartDateTime, "UTC");

              let sourceEndDateTime = momentTimeZone.tz(
                [year, month-1, day, newEndTime[0], newEndTime[1]],
                req.body.localCountry
              );
              // Adjust for DST transitions
              if (sourceEndDateTime.isDST()) {
                sourceEndDateTime.subtract(1, 'hour');
              }

              // Convert the source time to the target time zone
              let targetEndDateTime = moment.tz(sourceEndDateTime , "UTC");
            let dateArray = {
              trainingId: insertedTraining._id,
              coachesId: req.body.coachesId,
              facilityAdminId: req.user.id,
              sportId: req.body.sportId,
              facilityId: req.body.facilityId,
              date: moment(currentDate).format("YYYY-MM-DD"),
              day: moment(currentDate).format("dddd"),
              slot: timeSlot.slot,
              slotStartTimeUtc: targetStartDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotEndTimeUtc: targetEndDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotStartTime: sourceStartDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotEndTime: sourceEndDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              localCountry: req.body.localCountry,
              isSelected: timeSlot.isSelected,
              maximumStudent: req.body.maximumStudent,
              totalBooking: 0,
            };

            await TrainingSlot.create(dateArray);
          });
         
          slots.push(currentDate);
        }
        currentDate = moment(currentDate).add(1, "days").format("YYYY-MM-DD");
      }
      const adminJoiningDate = Date.now();
      let adminGroupChat = await Chat.create({
        senderId: req.user.id,
        senderType: "facility",
        chatType: 7, //training facility admins and coach group
        trainingId: insertedTraining._id,
        members: [],
        admins: [],
        messageType: 7, //
        lastMessage: `${req.user.name} created this group`,
      });
      await ChatMessage.create({
        roomId: adminGroupChat.roomId,
        senderId: req.user.id,
        senderType: "facility",
        chatType: 7,
        messageType: 6,
        message: `${req.user.name} joined this group`,
      });

      let groupChat = await Chat.create({
        senderId: req.user.id,
        senderType: "facility",
        trainingId: insertedTraining._id,
        members: [],
        admins: [],
        chatType: 6, //training ( all user, coaches and facility admins) group
        messageType: 7,
        lastMessage: `${req.user.name} created this group`,
        status: false
      });
      await ChatMessage.create({
        roomId: groupChat.roomId,
        senderId: req.user.id,
        senderType: "facility",
        chatType: 6,
        messageType: 6,
        message: `${req.user.name} joined this group`,
      });
     
      let adminsArray = [ { id : ObjectId(req.user.id), status : true, joiningDate : adminJoiningDate } ]
      for await (const coach of insertedTraining.coachesId){
        const coachJoiningDate = Date.now() ;
        let coachDetails = await Facility.findById(coach);
        adminsArray.push({ id : ObjectId(coach), status : true, joiningDate : coachJoiningDate  })
        await ChatMessage.create({
          roomId: adminGroupChat.roomId,
          senderId: coachDetails._id,
          senderType: "facility",
          chatType: 7,
          messageType: 6,
          message: `${coachDetails.name} joined this group`,
        });

        await ChatMessage.create({
          roomId: groupChat.roomId,
          senderId: coachDetails._id,
          senderType: "facility",
          chatType: 6,
          messageType: 6,
          message: `${coachDetails.name} joined this group`,
        });

      }

      await Chat.findByIdAndUpdate(groupChat._id, {
        admins : adminsArray
      });
      await Chat.findByIdAndUpdate(adminGroupChat._id, {
        admins : adminsArray
      });
      await Training.findByIdAndUpdate(insertedTraining._id, {
        $set: {
          slots: slots,
        },
      });
      return SendResponse(res, {}, i18n.__("success"), 200);
    } catch (error) {
      dump("error", error);
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
  getTraining: async (req, res) => {
    try {
      const v = new Validator(req.query, {
        type: "required|in:current,upcoming,previous,notPrevious",
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
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        facilityAdminId: ObjectId(req.user.id),
        isDeleted: false,
        status: true,
      };

      let currentDate = new Date().toISOString();
      // currentDate.setUTCHours(0, 0, 0, 0);
      if (req.query.type == "current") {
        params = Object.assign(params, {
          startDateUTC: {
            $lte: currentDate,
          },
          // endDate: {
          //     $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59)
          // }
          endDateUTC: {
            $gte: currentDate,
          },
        });
      }
      if (req.query.type == "upcoming") {
        params = Object.assign(params, {
          startDateUTC: {
            $gt: currentDate,
          },
        });
      }
      if (req.query.type == "previous") {
        params = Object.assign(params, {
          endDateUTC: {
            $lt: currentDate,
          },
        });
      }

      if (req.query.type == "notPrevious") {
        params = Object.assign(params, {
          endDateUTC: {
            $gte: currentDate,
          },
        });
      }

      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          trainingName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      if (req.query.facilityId != "" && req.query.facilityId != null) {
        params = Object.assign(params, {
          facilityId: ObjectId(req.query.facilityId),
        });
      }
      if (req.query.coachId != "" && req.query.coachId != null) {
        params = Object.assign(params, {
          coachesId: ObjectId(req.query.coachId),
        });
      }
      if (req.query.sportId != "" && req.query.sportId != null) {
        params = Object.assign(params, {
          sportId: ObjectId(req.query.sportId),
        });
      }

      const [{ trainingList, total }] = await Training.aggregate([
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
            trainingList: [
              {
                $project: {
                  _id: 1,
                  trainingName: 1,
                  address: 1,
                  coverImage: 1,
                  startDate: 1,
                  startDateUTC: 1,
                  endDateUTC: 1,
                  localCountry: 1,
                  endDate: 1,
                  createdAt: 1,
                  rating: 1,
                  students: 1,
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
      let trainingData = {
        trainingList: trainingList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          trainingData: trainingData,
        },
        "Training list",
        200
      );
    } catch (error) {
      dump("error", error);
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
  getTrainingDetails: async (req, res) => {
    try {
      const v = new Validator(req.query, {
        trainingId: "required",
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
      let trainingDetails = await Training.findOne(
        { _id : ObjectId(req.query.trainingId), isDeleted : false})
        .populate("coachesId", "_id name profileImage coverImage")
        .populate("sportId facilityAdminId facilityId")
        .lean();
      if (!trainingDetails)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Training not found",
          422
        );

      let trainingSlots = await TrainingSlot.find({
        trainingId: req.query.trainingId,
      });
      let trainings = await TrainingBooking.find({
        trainingId: ObjectId(req.query.trainingId),
        status: true,
        isDeleted: false,
      });

      if (trainings.length > 0) {
        trainingDetails.isEditable = false;
      } else {
        trainingDetails.isEditable = true;
      }
      return SendResponse(
        res,
        {
          trainingDetails: trainingDetails,
        },
        "Training details",
        200
      );
    } catch (error) {
      dump("error", error);
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
  updateTraining: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        trainingId: "required",
        sportId: "required",
        trainingName: "required",
        facilityId: "required",
        curriculum: "required",
        coachesId: "required",
        ageGroupFrom: "required",
        ageGroupTo: "required",
        proficiencyLevel: "required|in:Beginners,Intermediate,Advanced",
        startDate: "required",
        endDate: "required",
        days: "required",
        sessionTimeDuration: "required",
        minimumSession: "required",
        // maximumSession: "required",
        minimumStudent: "required",
        // maximumStudent: "required",
        localCountry: "required",
        price: "required",
        currency: "nullable",
        inclusiveTax: "required",
      });

      if (req.user.userType == "coach")
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "You have not rights to add training",
          422
        );
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
      let trainingDetails = await Training.findOne({ _id : ObjectId(req.body.trainingId), isDeleted : false });
      if (!trainingDetails )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Training not found",
          422
        );
      // Extract common coaches those were already existing in training so that the new message does not get generated in training chat group
      let commonCoaches = (req.body.coachesId).filter((item) => trainingDetails.coachesId.includes(ObjectId(item)));
      let previousCoaches = (trainingDetails.coachesId).filter( item => !(req.body.coachesId.includes(item)));
      let traing = await Training.aggregate([
        {
          $match: {
            $expr: {
              $lte: [
                {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date:  {
                      $toDate: "$startDate" // Convert the string to a date
                    },
                  },
                },
                moment(new Date()).format("YYYY-MM-DD"),
              ],
            },
          },
        },
      ]);

      if (!traing)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Update not allow",
          422
        );

      let facilityBranch = await FacilityBranch.findOne({ _id : ObjectId(req.body.facilityId), isDeleted : false , status : true });
      if (!facilityBranch)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Selected facility not found",
          422
        );
      if(await Promotion.findOne({ trainingId : ObjectId(req.body.trainingId), isDeleted : false, status : true })){
         if(Number(trainingDetails.price) < Number(req.body.price)){
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "Training price can't be less than existing price as promotions are already added.",
            422
          );
         }
      }
      req.body.location = facilityBranch.location;
      req.body.address = facilityBranch.address;
      req.body.facilityAdminId = req.user.id;
      if (typeof req.body.days == "string") {
        req.body.days = req.body.days.split(",");
      }
      if (!req.body.days && req.body.days.length < 1) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Days required",
          422
        );
      }
      if (typeof req.body.coachesId == "string") {
        req.body.coachesId = req.body.coachesId.split(",");
      }
      if (!req.body.coachesId && req.body.coachesId.length < 1) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Coaches id required",
          422
        );
      }
      let slots = [];
     
      if (req.body.days.includes("sunday") && !req.body.sunday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Sunday slots required",
          422
        );
      }
      if (req.body.days.includes("monday") && !req.body.monday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Monday slots required",
          422
        );
      }
      if (req.body.days.includes("tuesday") && !req.body.tuesday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Tuesday slots required",
          422
        );
      }
      if (req.body.days.includes("wednesday") && !req.body.wednesday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Wednesday slots required",
          422
        );
      }
      if (req.body.days.includes("thursday") && !req.body.thursday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Thursday slots required",
          422
        );
      }
      if (req.body.days.includes("friday") && !req.body.friday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Friday slots required",
          422
        );
      }
      if (req.body.days.includes("saturday") && !req.body.saturday) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Saturday slots required",
          422
        );
      }

      // if (req.files && req.files.coverImage) {
      //     let Image = await FileUpload.aws(req.files.coverImage);
      //     req.body.coverImage = process.env.AWS_URL + Image.key;
      // }
      await Training.findByIdAndUpdate(req.body.trainingId, {
        $set: {
          sunday : [],
          monday : [],
          tuesday : [],
          wednesday : [],
          thursday : [],
          friday : [],
          saturday : []
        },
      });
      let coverImages = [];
      if(req.body.currency && req.body.currency != null && req.body.currency != ''){
        await Promotion.updateMany(
          { trainingId : ObjectId(req.body.trainingId)},
          {
            $set : {
              currency : req.body.currency
            }
          }
        );
      }

      if (req.files && req.files.coverImage) {
        if (!Array.isArray(req.files.coverImage)) {
          req.files.coverImage = [req.files.coverImage];
        }

        for (const image of req.files.coverImage) {
          let Image = await FileUpload.aws(image);
          coverImages.push(process.env.AWS_URL + Image.Key);
          req.body.coverImage = coverImages;
        }
      }

      if (req.body.days.includes("sunday") && req.body.sunday) {
        req.body.sunday = JSON.parse(req.body.sunday);
      } else {
        delete req.body.sunday;
      }
      if (req.body.days.includes("monday") && req.body.monday) {
        req.body.monday = JSON.parse(req.body.monday);
      } else {
        delete req.body.monday;
      }
      if (req.body.days.includes("tuesday") && req.body.tuesday) {
        req.body.tuesday = JSON.parse(req.body.tuesday);
      } else {
        delete req.body.tuesday;
      }
      if (req.body.days.includes("wednesday") && req.body.wednesday) {
        req.body.wednesday = JSON.parse(req.body.wednesday);
      } else {
        delete req.body.wednesday;
      }
      if (req.body.days.includes("thursday") && req.body.thursday) {
        req.body.thursday = JSON.parse(req.body.thursday);
      } else {
        delete req.body.thursday;
      }
      if (req.body.days.includes("friday") && req.body.friday) {
        req.body.friday = JSON.parse(req.body.friday);
      } else {
        delete req.body.friday;
      }
      if (req.body.days.includes("saturday") && req.body.saturday) {
        req.body.saturday = JSON.parse(req.body.saturday);
      } else {
        delete req.body.saturday;
      }

      if (
        req.body.minimumStudent &&
        req.body.minimumStudent != null &&
        req.body.minimumStudent != ""
      ) {
        req.body.minimumStudent = Number(req.body.minimumStudent);
      }

      if (
        req.body.maximumStudent &&
        req.body.maximumStudent != null &&
        req.body.maximumStudent != ""
      ) {
        req.body.maximumStudent = Number(req.body.maximumStudent);
      }

      if (req.body.price && req.body.price != "" && req.body.price != null) {
        req.body.price = Number(req.body.price);
      }
      
      var startDateUTC = momentTimeZone.tz(req.body.startDate, req.body.localCountry);
      var endDateUTC = momentTimeZone.tz(req.body.endDate, req.body.localCountry);
      req.body.startDateUTC = startDateUTC.clone().utc().format();
      req.body.endDateUTC = endDateUTC.clone().utc().format();
      await Training.findByIdAndUpdate(req.body.trainingId, {
        $set: req.body,
      });
      await TrainingSlot.deleteMany({
        trainingId: req.body.trainingId,
      });
      // var dateArray = [];
      var currentDate = moment
      .tz(new Date(req.body.startDate), "UTC")
      .format("YYYY-MM-DD");
      var stopDate = moment
      .tz(new Date(req.body.endDate), "UTC")
      .format("YYYY-MM-DD");
      while (currentDate <= stopDate) {
        let slot = [];
        let dateDay = moment(currentDate).format("dddd");
        let dateDayLower = dateDay.toLowerCase();
        if (req.body.days.includes(dateDayLower)) {
          let daySlot =
            dateDayLower == "sunday"
              ? req.body.sunday
              : dateDayLower == "monday"
              ? req.body.monday
              : dateDayLower == "tuesday"
              ? req.body.tuesday
              : dateDayLower == "wednesday"
              ? req.body.wednesday
              : dateDayLower == "thursday"
              ? req.body.thursday
              : dateDayLower == "friday"
              ? req.body.friday
              : dateDayLower == "saturday"
              ? req.body.saturday
              : [];

          // Parse the input date as UTC
          const date = momentTimeZone.utc(currentDate);

          daySlot.forEach(async (timeSlot) => {
            let time = timeSlot.slot.split("-");

              // Extract year, month, and day from the date
              const [year, month, day] = currentDate.split('-').map(Number);
             // Extract start and end times
              const [startTimeStr, endTimeStr] = timeSlot.slot.split('-');

              // Define a function to convert time in HH:mm AM/PM format to 24-hour format
              const convertTo24HourFormat = (newTime) => {
                newTime = newTime.trimRight();
                let [time, period] = newTime.split(/\s/);
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) {
                  hours += 12;
                } else if (period === 'AM' && hours === 12) {
                  hours = 0;
                }
                return [hours, minutes];
              };
           
              let newStartTime = convertTo24HourFormat(startTimeStr);
              let newEndTime = convertTo24HourFormat(endTimeStr);
              // Get the offset for req.body.localCountry time zone at the given date
              const timeZone = moment.tz.zone(req.body.localCountry);
              const offset = timeZone.utcOffset(moment([year, month - 1, day]));
              let sourceStartDateTime = moment.tz(
                [year, month-1, day, newStartTime[0], newStartTime[1]],
                req.body.localCountry
              );
              // Adjust for DST transitions
              if ( sourceStartDateTime.isDST()) {
                sourceStartDateTime.subtract(1, 'hour');
              }

              // Convert the source time to the target time zone
              let targetStartDateTime = moment.tz(sourceStartDateTime, "UTC");

              let sourceEndDateTime = moment.tz(
                [year, month-1, day, newEndTime[0], newEndTime[1]],
                req.body.localCountry
              );
              // Adjust for DST transitions
              if ( sourceEndDateTime.isDST()) {
                sourceEndDateTime.subtract(1, 'hour');
              }

              // Convert the source time to the target time zone
              let targetEndDateTime = moment.tz(sourceEndDateTime , "UTC");

            let dateArray = {
              trainingId: req.body.trainingId,
              coachesId: req.body.coachesId,
              facilityAdminId: req.user.id,
              sportId: req.body.sportId,
              facilityId: req.body.facilityId,
              date: moment(currentDate).format("YYYY-MM-DD"),
              day: moment(currentDate).format("dddd"),
              slot: timeSlot.slot,
              slotStartTimeUtc: targetStartDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotEndTimeUtc: targetEndDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotStartTime: sourceStartDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              slotEndTime: sourceEndDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
              localCountry: req.body.localCountry,
              isSelected: timeSlot.isSelected,
              maximumStudent: req.body.maximumStudent,
              totalBooking: 0,
            };

            await TrainingSlot.create(dateArray);
          });

          slots.push(date.format("YYYY-MM-DD"));
        }
        currentDate = moment(currentDate).add(1, "days").format("YYYY-MM-DD");
      }
      await Training.findByIdAndUpdate(req.body.trainingId, {
        $set: {
          slots: slots,
        },
      });
      //update new coach added message in chat group
      let groupChat = await Chat.find({ trainingId : ObjectId(req.body.trainingId), chatType : 6 });
      let adminGroupChat = await Chat.find({ trainingId : ObjectId(req.body.trainingId), chatType : 7 });
      let adminsArray = [ { id : ObjectId(req.user.id), status : true , joiningDate : Date.now()} ]
      for await (const coach of req.body.coachesId){
        let coachDetails = await Facility.findById(coach);
        adminsArray.push({ id : ObjectId(coach), status : true, joiningDate : Date.now() })
        if(!commonCoaches.includes(coach)){
          await ChatMessage.create({
            roomId: adminGroupChat.roomId,
            senderId: coachDetails._id,
            senderType: "facility",
            chatType: 7,
            messageType: 6,
            message: `${coachDetails.name} joined this group`,
          });

          await ChatMessage.create({
            roomId: groupChat.roomId,
            senderId: coachDetails._id,
            senderType: "facility",
            chatType: 6,
            messageType: 6,
            message: `${coachDetails.name} joined this group`,
          });
        }
      }

      for await(const prevCoach of previousCoaches){
        adminsArray.push({ id : ObjectId(prevCoach), status : false, joiningDate : prevCoach.joiningDate })
      }

      await Chat.findByIdAndUpdate(groupChat._id, {
        admins : adminsArray
      });

      await Chat.findByIdAndUpdate(adminGroupChat._id, {
        admins : adminsArray
      });

      return SendResponse(res, {}, i18n.__("success"), 200);
    } catch (error) {
      dump("error", error);
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

  deleteTraining: async (req, res) => {
    try {
      const v = new Validator(req.params, {
        trainingId: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }
      let trainingDetails = await Training.findOne({
        _id : ObjectId(req.params.trainingId),
        isDeleted : false
      });
      if (!trainingDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No such training found",
          422
        );
      }

      let booking = await TrainingBooking.findOne({
        trainingId: ObjectId(req.params.trainingId),
        isDeleted: false,
      });

      if (booking) {
        return SendResponse(
          res,
          { isBoom: true },
          "Training already booked by user. Can't be deleted",
          500
        );
      }

      await Training.findByIdAndUpdate(req.params.trainingId, {
        $set: {
          isDeleted: true,
        },
      });

      await TrainingSlot.updateMany(
        {
          trainingId: ObjectId(req.params.trainingId),
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
      return SendResponse(res, {}, i18n.__("success"), 200);
    } catch (error) {
      dump("error", error);
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

  getSportsList: async (req, res) => {
    try {
      let trainingList = await Training.find({
        facilityAdminId: ObjectId(req.user.id),
        isDeleted: false,
        status: true,
      }).populate("sportId");

      let sports = [];
      await trainingList.forEach(async (training) => {
        if (
          !sports.find(
            (item) => item.sports_name == training.sportId.sports_name
          )
        ) {
          sports.push(training.sportId);
        }
      });

      return SendResponse(res, { sportsList: sports }, "Sports List", 200);
    } catch (error) {
      dump("error", error);
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
};
