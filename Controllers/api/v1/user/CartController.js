const User = require("../../../../models/user");
const Cart = require("../../../../models/cart");
const CartSlot = require("../../../../models/cartSlot");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require("../../../../models/training");
const TrainingSlot = require("../../../../models/trainingSlot");
const TrainingBooking = require("../../../../models/trainingBooking");
const TrainingBookingSlot = require("../../../../models/trainingBookingSlot");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const {dump}=require("../../../../services/dump");
const SendResponse = require("../../../../apiHandler");
const Promotion = require("../../../../models/promotion");
const PromotionSlot = require("../../../../models/promotionSlot");
const TrainingEvaluation = require("../../../../models/trainingEvaluation");
const moment = require("moment");
module.exports = {
  checkTrainingAvailability: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        trainingId: "required",
        startDate: "required",
        days: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }
      const TrainingDetails = await Training.findOne({
        _id : ObjectId(req.body.trainingId),
        isDeleted : false
      });
      if (!TrainingDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No such training found",
          422
        );
      }

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

      let slots = [];
      let SundayAvailableTrainings = [];
      let MondayAvailableTrainings = [];
      let TuesdayAvailableTrainings = [];
      let WednesdayAvailableTrainings = [];
      let ThursdayAvailableTrainings = [];
      let FridayAvailableTrainings = [];
      let SaturdayAvailableTrainings = [];

      if (req.body.sunday && typeof req.body.sunday == "string") {
        req.body.sunday = req.body.sunday.split(",");
      }
      if (req.body.monday && typeof req.body.monday == "string") {
        req.body.monday = req.body.monday.split(",");
      }
      if (req.body.tuesday && typeof req.body.tuesday == "string") {
        req.body.tuesday = req.body.tuesday.split(",");
      }
      if (req.body.wednesday && typeof req.body.wednesday == "string") {
        req.body.wednesday = req.body.wednesday.split(",");
      }
      if (req.body.thursday && typeof req.body.thursday == "string") {
        req.body.thursday = req.body.thursday.split(",");
      }
      if (req.body.friday && typeof req.body.friday == "string") {
        req.body.friday = req.body.friday.split(",");
      }
      if (req.body.saturday && typeof req.body.saturday == "string") {
        req.body.saturday = req.body.saturday.split(",");
      }

      var currentDate = moment(req.body.startDate, "YYYY-MM-DD"); //start date
      var stopDate = moment(TrainingDetails.endDate, "YYYY-MM-DD"); //end date
      while (currentDate <= stopDate) {
        let newSlot = [];
        let dateDay = moment(currentDate).format("dddd");
        let dateDayLower = dateDay.toLowerCase();
        if (req.body.days.includes(dateDay.toLowerCase())) {
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
          let params = {
            trainingId: ObjectId(req.body.trainingId),
            day: dateDay,
            date: `${moment(currentDate).format(
              "YYYY-MM-DD"
            )}T00:00:00.000+00:00`,
          };
          // let params = {
          //   trainingId: ObjectId(req.body.trainingId),
          //   day: dateDay,
          //   date: moment(currentDate).tz('America/New_York').startOf('day').format(),
          // };
          
          let AvailableSlots = await TrainingSlot.find(params);
          if (dateDay == "Sunday") {
            for (const slot of req.body.sunday) {
              for (const training of AvailableSlots) {
                if (
                  !await SundayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )
                ) {
                  training.slots = newSlot;
                  if(await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                        SundayAvailableTrainings.push(training);
                    }
                 }
                } 
              };
            };
          }
          if (dateDay == "Monday") {
            for (const slot of req.body.monday) {
              for (const training of AvailableSlots) {
                if (
                  !await MondayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )
                ) {
                  if(await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                      MondayAvailableTrainings.push(training);
                    }
                  }
                }
              };
            };
          }
          if (dateDay == "Tuesday") {
            for (const slot of req.body.tuesday) {
              for (const training of AvailableSlots) {
                if (
                  !await TuesdayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )
                ) {
                  if( await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                      TuesdayAvailableTrainings.push(training);
                    }
                  }
                } 
              }
            }
          }
          if (dateDay == "Wednesday") {
            for (const slot of req.body.wednesday) {
              for (const training of AvailableSlots) {
                if (
                  !await WednesdayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )
                ) {
                  if(await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                      WednesdayAvailableTrainings.push(training);
                    }
                  }
                } 
              }
            }
          }
          if (dateDay == "Thursday") {
            for (const slot of req.body.thursday) {
              for (const training of AvailableSlots) {
                if (
                  !await ThursdayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )
                ) {
                  if( await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                      ThursdayAvailableTrainings.push(training);
                    }
                  }
                } 
              }
            }
          }
        
          if (dateDay == "Friday") {
            for (const slot of req.body.friday) {
              for (const training of AvailableSlots) {
                if (
                  !(await FridayAvailableTrainings.find((item) => item._id === training._id))
                ) {
                  if (await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking)) {
                    let bookingParams = {
                      trainingId: ObjectId(training.trainingId),
                      day: training.day,
                      date: `${moment(training.date).format("YYYY-MM-DD")}T00:00:00.000+00:00`,
                      slot: training.slot,
                    };
                    if (req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "") {
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    } else {
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if (!(await TrainingBookingSlot.findOne(bookingParams).exec())) {
                      FridayAvailableTrainings.push(training);
                    }
                  }
                }
              }
            }
          }
          
          if (dateDay == "Saturday") {
            for (const slot of req.body.saturday) {
              for (const training of AvailableSlots) {
                if (
                  !await SaturdayAvailableTrainings.find(
                    (item) => item._id === training._id
                  )  
                ) {
                  if( await training.slot == slot && training.isSelected == true && parseInt(training.maximumStudent) != parseInt(training.totalBooking) ){
                    let bookingParams = {
                      trainingId : ObjectId(training.trainingId),
                      day : training.day,
                      date : `${moment(training.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : training.slot,
                    };
                    if( req.body.familyMember && req.body.familyMember != null && req.body.familyMember != "" ){
                      bookingParams.familyMember = ObjectId(req.body.familyMember);
                    }else{
                      bookingParams.userId = ObjectId(req.user.id);
                    }
                    if(!await TrainingBookingSlot.findOne(bookingParams)){
                      SaturdayAvailableTrainings.push(training);
                    }
                  }
                } 
              };
            };
          }
        }

        currentDate = moment(currentDate).add(1, "days");
      }

      let shareEvaluation = false;
      let evalParams = {
        userId : ObjectId(req.user.id),
        sportId : ObjectId(TrainingDetails.sportId)
      };
      if(req.body.familyMember && req.body.familyMember != null && req.body.familyMember != ""){
          evalParams = {
            familyMemberId: ObjectId(req.body.familyMember)
          }
      }

      const evaluations = await TrainingEvaluation.find(evalParams);
      if (evaluations.length > 0) {
        shareEvaluation = true;
      }

      return SendResponse(
        res,
        {
          sharePreviousEvaluation: shareEvaluation,
          SundayAvailableTrainings: SundayAvailableTrainings,
          MondayAvailableTrainings: MondayAvailableTrainings,
          TuesdayAvailableTrainings: TuesdayAvailableTrainings,
          WednesdayAvailableTrainings: WednesdayAvailableTrainings,
          ThursdayAvailableTrainings: ThursdayAvailableTrainings,
          FridayAvailableTrainings: FridayAvailableTrainings,
          SaturdayAvailableTrainings: SaturdayAvailableTrainings,
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

  addToCart: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        bookingFor: "required",
        trainingId: "required",
        startDate: "required",
        endDate: "required",
        days: "required",
        totalSession: "required",
        sessionTimeDuration: "required",
        pricePerSession: "required",
        totalPrice: "required",
        currency: "required",
        expectations: "required"
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }

      const TrainingDetails = await Training.findOne({
        _id : ObjectId(req.body.trainingId),
        isDeleted : false
      });
      if (!TrainingDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No such training found",
          422
        );
      }

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

      if (req.body.sunday) {
        req.body.sunday = JSON.parse(req.body.sunday);
      }
      if (req.body.monday) {
        req.body.monday = JSON.parse(req.body.monday);
      }
      if (req.body.tuesday) {
        req.body.tuesday = JSON.parse(req.body.tuesday);
      }
      if (req.body.wednesday) {
        req.body.wednesday = JSON.parse(req.body.wednesday);
      }
      if (req.body.thursday) {
        req.body.thursday = JSON.parse(req.body.thursday);
      }
      if (req.body.friday) {
        req.body.friday = JSON.parse(req.body.friday);
      }
      if (req.body.saturday) {
        req.body.saturday = JSON.parse(req.body.saturday);
      }

      req.body.days.forEach(async (day) => {
        if (req.body[`${day}`]) {
          req.body[`${day}`].forEach((slotDay) => {
            slotDay.date.forEach(async (currentDate) => {
              let availableSlots = await TrainingSlot.find({
                day: moment(currentDate).format("dddd"),
                date: `${moment(currentDate).format(
                  "YYYY-MM-DD"
                )}T00:00:00.000+00:00`,
              });

              availableSlots.forEach(async (training) => {
                let [filteredSlots] = await training.slots.filter(
                  (item) =>
                    item.slot == slotDay.slot &&
                    parseInt(item.maximumStudent) == parseInt(item.totalBooking)
                );
                if (
                  filteredSlots &&
                  filteredSlots != null &&
                  filteredSlots != undefined
                ) {
                  return SendResponse(
                    res,
                    { isBoom: true },
                    "Training can't be added to cart as some of the sessions are already booked",
                    422
                  );
                }
              });
            });
          });
        }
      });

      req.body.facilityAdminId = TrainingDetails.facilityAdminId;
      req.body.facilityId = TrainingDetails.facilityId;
      req.body.coachesId = TrainingDetails.coachesId;
      req.body.userId = ObjectId(req.user.id);
      let insertedItemInCart = await Cart.create(req.body);
      let slots = [];

      req.body.days.forEach((day) => {
        if (req.body[`${day}`]) {
          req.body[`${day}`].forEach((slotDay) => {
            slotDay.date.forEach((currentDate) => {
              CartSlot.create({
                cartId: insertedItemInCart._id,
                userId: req.body.userId ? req.body.userId : null,
                familyMember: req.body.familyMember
                  ? req.body.familyMember
                  : null,
                trainingId: req.body.trainingId,
                facilityAdminId: TrainingDetails.facilityAdminId,
                facilityId: TrainingDetails.facilityId,
                coachesId: TrainingDetails.coachesId,
                date: moment(currentDate).format("YYYY-MM-DD"),
                day: moment(currentDate).format("dddd"),
                slot: slotDay.slot,
                maximumStudent: TrainingDetails.maximumStudent,
                totalBooking: TrainingDetails.totalBooking,
              });
              slots.push(moment(currentDate).format("YYYY-MM-DD"));
            });
          });
        }
      });
      await Cart.findByIdAndUpdate(insertedItemInCart._id, {
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

  updateCart: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        cartId: "required",
        bookingFor: "required",
        trainingId: "required",
        startDate: "required",
        endDate: "required",
        days: "required",
        totalSession: "required",
        sessionTimeDuration: "required",
        pricePerSession: "required",
        totalPrice: "reuired",
        currency: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }

      const cartDetails = await Cart.findById(req.params.cartId);
      if (!cartDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No such cart item found",
          422
        );
      }
      const TrainingDetails = await Training.findOne({
        _id : ObjectId(req.body.trainingId),
        isDeleted : false
      });
      if (!TrainingDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No such training found",
          422
        );
      }

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

      if (req.body.sunday) {
        req.body.sunday = JSON.parse(req.body.sunday);
      }
      if (req.body.monday) {
        req.body.monday = JSON.parse(req.body.monday);
      }
      if (req.body.tuesday) {
        req.body.tuesday = JSON.parse(req.body.tuesday);
      }
      if (req.body.wednesday) {
        req.body.wednesday = JSON.parse(req.body.wednesday);
      }
      if (req.body.thursday) {
        req.body.thursday = JSON.parse(req.body.thursday);
      }
      if (req.body.friday) {
        req.body.friday = JSON.parse(req.body.friday);
      }
      if (req.body.saturday) {
        req.body.saturday = JSON.parse(req.body.saturday);
      }

      req.body.days.forEach(async (day) => {
        if (req.body[`${day}`]) {
          req.body[`${day}`].forEach((slotDay) => {
            slotDay.date.forEach(async (currentDate) => {
              let availableSlots = await TrainingSlot.find({
                day: moment(currentDate).format("dddd"),
                date: `${moment(currentDate).format(
                  "YYYY-MM-DD"
                )}T00:00:00.000+00:00`,
              });

              availableSlots.forEach(async (training) => {
                let [filteredSlots] = await training.slots.filter(
                  (item) =>
                    item.slot == slotDay.slot &&
                    parseInt(item.maximumStudent) == parseInt(item.totalBooking)
                );

                if (
                  filteredSlots &&
                  filteredSlots != null &&
                  filteredSlots != undefined
                ) {
                  return SendResponse(
                    res,
                    { isBoom: true },
                    "Training can't be added to cart as some of the sessions are already booked",
                    422
                  );
                }
              });
            });
          });
        }
      });

      req.body.facilityAdminId = TrainingDetails.facilityAdminId;
      req.body.facilityId = TrainingDetails.facilityId;
      req.body.coachesId = TrainingDetails.coachesId;
      req.body.userId = ObjectId(req.user.id);
      await Cart.findByIdAndUpdate(req.params.cartId, {
        $set: req.body,
      });
      await CartSlot.deleteMany({
        cartId: req.params.cartId,
      });

      let slots = [];

      req.body.days.forEach((day) => {
        if (req.body[`${day}`]) {
          req.body[`${day}`].forEach((slotDay) => {
            slotDay.date.forEach((currentDate) => {
              CartSlot.create({
                cartId: req.params.cartId,
                userId: req.body.userId ? req.body.userId : null,
                familyMember: req.body.familyMember
                  ? req.body.familyMember
                  : null,
                trainingId: req.body.trainingId,
                facilityAdminId: TrainingDetails.facilityAdminId,
                facilityId: TrainingDetails.facilityId,
                coachesId: TrainingDetails.coachesId,
                date: moment(currentDate).format("YYYY-MM-DD"),
                day: moment(currentDate).format("dddd"),
                slot: slotDay.slot,
                maximumStudent: TrainingDetails.maximumStudent,
                totalBooking: TrainingDetails.totalBooking,
              });
              slots.push(moment(currentDate).format("YYYY-MM-DD"));
            });
          });
        }
      });
      await Cart.findByIdAndUpdate(req.params.cartId, {
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

  getCartList: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        userId: ObjectId(req.user.id),
      };
      if (req.query.search) {
        params = Object.assign(params, {
          "trainingDetails.trainingName": {
            $regex: new RegExp(req.query.search, "i"),
          },
        });
      }

      const [{ cartList, total }] = await Cart.aggregate([
        {
          $lookup: {
            from: "trainings",
            localField: "trainingId",
            foreignField: "_id",
            as: "trainingDetails",
          },
        },
        {
          $match: params,
        },
        {
          $lookup: {
            from: "facilitybranches",
            localField: "facilityId",
            foreignField: "_id",
            as: "facilityBranchDetails",
          },
        },
        {
          $lookup: {
            from: "facilities",
            localField: "facilityAdminId",
            foreignField: "_id",
            as: "facilityAdminDetails",
          },
        },
        {
          $lookup: {
            from: "facilities",
            let: {
              coachId: "$coachesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$coachId"],
                  },
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
            cartList: [
              {
                $project: {
                  _id: 1,
                  bookingFor: 1,
                  userId: 1,
                  familyMember: 1,
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
                  createdAt: 1,
                  totalSession: 1,
                  sessionTimeDuration: 1,
                  pricePerSession: 1,
                  totalPrice: 1,
                  currency: 1,
                  status: 1,
                  isDeleted: 1,
                  expectations: 1,
                  trainingDetails: "$trainingDetails",
                  coachDetails: "$coachDetails",
                  facilityAdminDetails: "$facilityAdminDetails",
                  facilityBranchDetails: "$facilityBranchDetails",
                },
              },
              {
                $sort: sort,
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
      let cartData = {
        cartList: cartList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          cartData: cartData,
        },
        "Cart List",
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

  getCartDetails: async (req, res) => {
    try {
      let [cartDetails] = await Cart.aggregate([
        {
          $match: {
            _id: ObjectId(req.params.cartId),
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
          $lookup: {
            from: "facilitybranches",
            localField: "facilityId",
            foreignField: "_id",
            as: "facilityBranchDetails",
          },
        },
        {
          $lookup: {
            from: "facilities",
            localField: "facilityAdminId",
            foreignField: "_id",
            as: "facilityAdminDetails",
          },
        },
        {
          $lookup: {
            from: "facilities",
            let: {
              coachId: "$coachesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$coachId"],
                  },
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
            bookingFor: 1,
            userId: 1,
            familyMember: 1,
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
            createdAt: 1,
            totalSession: 1,
            sessionTimeDuration: 1,
            pricePerSession: 1,
            totalPrice: 1,
            currency: 1,
            status: 1,
            isDeleted: 1,
            expectations: 1,
            trainingDetails: "$trainingDetails",
            coachDetails: "$coachDetails",
            facilityAdminDetails: "$facilityAdminDetails",
            facilityBranchDetails: "$facilityBranchDetails",
          },
        },
      ]);

      let unAvailableSlots = [];

      for await (let day of cartDetails.days) {
        if (cartDetails[`${day}`]) {
          for await (let slotDay of cartDetails[`${day}`]) {
            for await (let currentDate of slotDay.date) {
              let availableSlots = await TrainingSlot.find({
                day: moment(currentDate).format("dddd"),
                date: `${moment(currentDate).format(
                  "YYYY-MM-DD"
                )}T00:00:00.000+00:00`,
              });

              for await (let training of availableSlots) {
                let [filteredSlots] = training.slots.filter(
                  (item) =>
                    item.slot == slotDay.slot &&
                    parseInt(item.maximumStudent) == parseInt(item.totalBooking)
                );

                if (
                  filteredSlots &&
                  filteredSlots != null &&
                  filteredSlots != undefined
                ) {
                    filteredSlots.date = `${moment(currentDate).format("YYYY-MM-DD")}T00:00:00.000+00:00`;
                    filteredSlots.day = moment(currentDate).format("dddd");
                  unAvailableSlots.push(filteredSlots);
                }
              }
            }
          }
        }
      }
      cartDetails.unAvailableSlots = unAvailableSlots;

      return SendResponse(
        res,
        {
          cartDetails: cartDetails
        },
        "Cart Details",
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

  getPromotion: async (req, res) => {
    try {
        const v = new Validator(req.params, {
            trainingId: "required",
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
            trainingId: ObjectId(req.params.trainingId),
            isDeleted: false

        };
        if (req.query.search != "" && req.query.search != null) {
            params = Object.assign(params, {
                $or: [{
                    promotionName: {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    }
                }, {
                    promoCode: {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    }
                }],
            });
        }

        const [{
            promoList,
            total
        }] = await Promotion.aggregate([{
                $match: params
            },
            {
                $lookup: {
                    from: 'trainings',
                    let: {
                        'trainingId': '$trainingId'
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$trainingId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                trainingName: 1,
                                coverImage: 1
                            }
                        }
                    ],
                    'as': 'trainingDetails'
                }
            },
            {
                $unwind: {
                    path: '$trainingDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'facilitybranches',
                    let: {
                        'facilityId': '$facilityId'
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$facilityId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                coverImage: 1
                            }
                        }
                    ],
                    'as': 'facilityDetails'
                }
            },
            {
                $unwind: {
                    path: '$facilityDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
              $lookup : {
                from : 'promotionslots',
                localField : "_id",
                foreignField : "promotionId",
                as : 'promotionSlots'
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
                    promoList: [{
                            $project: {
                                _id: 1,
                                promotionType: 1,
                                promotionName: 1,
                                promoCode: 1,
                                discountType: 1,
                                amount: 1,
                                percent: 1,
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
                                createdAt: 1,
                                color: 1,
                                training: "$trainingDetails",
                                facility: "$facilityDetails",
                                promotionSlots: "$promotionSlots",
                                bannerImage: 1,
                                termsAndCondition: 1,
                                maximumDiscountValue: 1,
                                minimumPurchaseValue: 1,
                                currency: 1,
                                others: 1
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
        let promoData = {
            promoList: promoList,
            total: total || 0
        }
        return SendResponse(
            res, {
                promoData: promoData
            },
            "Promo list",
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

  getPromotionDetails : async (req, res) => {
    try{
        const v = new Validator(req.params, {
            promotionId: "required",
        });

        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, {
                isBoom: true
            }, err, 422);
        }


       let PromotionDetail = await Promotion.findById(req.params.promotionId);
       if ( !PromotionDetail) {
          return SendResponse(
              res,
              { isBoom : true },
              "No such promotion found",
              422
          )
       }

       const [PromotionDetails] = await Promotion.aggregate([
          {
              $match : {
                  _id : ObjectId(req.params.promotionId)
              }
          },
          {
            $lookup: {
                from: 'trainings',
                let: {
                    'trainingId': '$trainingId'
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$trainingId']
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            trainingName: 1,
                            coverImage: 1
                        }
                    }
                ],
                'as': 'trainingDetails'
            }
        },
        {
            $unwind: {
                path: '$trainingDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'facilitybranches',
                let: {
                    'facilityId': '$facilityId'
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$facilityId']
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            coverImage: 1
                        }
                    }
                ],
                'as': 'facilityDetails'
            }
        },
        {
            $unwind: {
                path: '$facilityDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
          {
              $project : {
                _id: 1,
                promotionType: 1,
                promotionName: 1,
                promoCode: 1,
                discountType: 1,
                amount: 1,
                percent: 1,
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
                createdAt: 1,
                color: 1,
                training: "$trainingDetails",
                facility: "$facilityDetails",
                bannerImage: 1,
                termsAndCondition: 1,
                maximumDiscountValue: 1,
                minimumPurchaseValue: 1,
                currency: 1
              }
          }
      ]);

      return SendResponse(
          res,
          { PromotionDetails : PromotionDetails },
          "Promotion Details",
          200
      );
    }catch (error){
      dump("error", error);
      return SendResponse(
          res,
          { isBoom : true },
          i18n.__('Something_went_wrong_please_try_again'),
          500
      )
    }
  },
};
