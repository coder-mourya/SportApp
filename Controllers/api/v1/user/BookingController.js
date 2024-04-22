const User = require("../../../../models/user");
const Member = require("../../../../models/member");
const Cart = require('../../../../models/cart');
const CartSlot = require('../../../../models/cartSlot');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require('../../../../models/training');
const TrainingSlot = require('../../../../models/trainingSlot');
const {
    Validator
} = require("node-input-validator");
const i18n = require('i18n');
const SendResponse = require("../../../../apiHandler");
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const trainingBooking = require("../../../../models/trainingBooking");
const trainingBookingSlot = require("../../../../models/trainingBookingSlot");
const Promotion = require('../../../../models/promotion');
const PromotionSlot = require('../../../../models/promotionSlot');
const TrainingEvaluation = require('../../../../models/trainingEvaluation');
const FileUpload = require("../../../../services/upload-file");
const stripe = require('stripe')(process.env.STRIP_SECRATE_KEY);
const STRIP = require('stripe')(process.env.STRIP_PUBLISH_KEY);
const qrCode = require('qrcode');
const QRCode = require('../../../../services/QRCode');
const fs = require('fs');
const facility = require("../../../../models/facility");
const Commission = require("../../../../models/commission");
const pushNotification = require("../../../../firebase/index");
const Notification = require("../../../../models/notification");
const {dump}=require("../../../../services/dump");
const { start } = require("repl");
const axios = require('axios');
const Chat = require("../../../../models/chat");
const ChatMessage = require("../../../../models/chatmessage");
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

    createCustomer: async (req, res) => {
        try {
          const v = new Validator(req.body, {
            name: "required",
            city: "required",
            state: "required",
            country: "required",
            email: "required"
          });
          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }

          const data = req.body;
          let customer;
          try{
             customer = await stripe.customers.create({
              address: {
                city: data.city,
                state: data.state,
                country: data.country
              },
              name: data.name, 
              email: data.email
            });
          } catch (error) {
            dump("error while creating customer on stripe =============",error);
          }

          await User.findByIdAndUpdate(req.user.id,
            {
              customerId : customer.id
            });
      
          return SendResponse(
            res, {
              customer: customer,
            },
            i18n.__('success'),
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
      
      //  Create Payment Method 
      
      createPaymentMethod: async(req, res) => {
        try{
          const v = new Validator(req.body, {
            cardNumber: "required",
            expMonth : "required",
            expYear: "required",
            cvc: "required"
          });
          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }

          const data = req.body;
          const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: data.cardNumber,
              exp_month: data.expMonth,
              exp_year:data.expYear,
              cvc: data.cvc,
            },
          });
      
          const paymentMethodId = paymentMethod.id;
      
          return SendResponse(
            res, {
              paymentIntent: paymentIntent,
            },
            i18n.__('success'),
            200
          );
        }catch(error){
          dump('Error creating payment method:', error);
          return SendResponse(
              res, {
                  isBoom: true
              },
              i18n.__('Something_went_wrong_please_try_again'),
              500
          );
        }
      },
      
      
      paymentConfirm: async (req, res) => {
        try {
          const v = new Validator(req.query, {
            clientSecret: "required",
            paymentMethodId : "required"
          });
          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }

          const data = req.query;
          const clientSecret = data.clientSecret;
          const paymentIntent = await STRIP.paymentIntents.confirm(clientSecret, {
            payment_method: data.paymentMethodId,
          });
      
          // Set the return URL for the payment intent
          paymentIntent.return_url = 'https://uat.acclem.org'; // Replace with your actual return URL
          await paymentIntent.save();
      
          // Redirect the user to the specified return URL
          res.redirect(paymentIntent.return_url);
      
        } catch (error) {
          dump('Error confirming payment:', error);
          return SendResponse(
              res, {
                  isBoom: true
              },
              i18n.__('Something_went_wrong_please_try_again'),
              500
          );
        }
      },

      saveCard: async(req,res) => {
        try{
          const v = new Validator(req.body, {
            customerId: "required",
            cardToken : "required"
          });
          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }

          await stripe.customers.createSource(req.body.customerId, {
            source: req.body.cardToken, // Test token representing a card
          });
          
          return SendResponse(
            res, {},
            i18n.__("success"),
            200
          );

        }catch(error){
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

      deleteCard: async(req,res) => {
        try{
          await stripe.customers.deleteSource(
            req.params.customerId,
            req.params.cardId,
            function(err, confirmation) {
              if (err) {
                // Handle error
                dump(err);
              } else {
                // Card successfully deleted
                dump(confirmation);
              }
            }
          );
          
          return SendResponse(
            res, {},
            i18n.__("success"),
            200
          );
        }catch(error){
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

      getCardsList: async(req,res) => {
         try{
            let { limit = 10} = req.query;
               // Fetch cards list of a customer
             let cardsList  = await stripe.customers.listSources(req.params.customerId,  { object: 'card', limit: limit }, // Limit to 10 cards, adjust as needed
             (err, cards) => {
               if (err) {
                 dump(err);
                 // Handle the error
               } else {
                 // The 'cards' variable contains the list of saved cards
                 return SendResponse(
                    res, {
                      cardsList: cards.data
                    },
                    "Customer Saved Cards List",
                    200
                  );
                }
             });

         }catch(error){
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

      applyPromoCode: async (req,res) => {
        try{
          const v = new Validator(req.body, {
            trainingId: "required",
            promotionId: "required",
            startDate: "required",
            endDate: "required",
            days: "required",
            totalSession: "required",
            sessionTimeDuration: "required",
            pricePerSession: "required",
            grandTotalPrice: "required",
            currency: "required",
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

          const PromotionDetails = await Promotion.findOne({ 
            _id : ObjectId(req.body.promotionId),
            status : true,
            isDeleted : false
          });
          if (!PromotionDetails) {
            return SendResponse(
              res,
              { isBoom: true },
              "No such promo code found",
              422
            );
          }

          if( Number(TrainingDetails.price) !== Number(req.body.pricePerSession)){
            return SendResponse(
              res,
              { isBoom: true },
              "Training has been updated. Kindly proceed with fresh booking.",
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

          if(Number(PromotionDetails.minimumPurchaseValue) > Number(req.body.grandTotalPrice)){
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              "Offer not valid",
              422
            );
          }

          if(!(new Date(req.body.startDate) <= new Date(PromotionDetails.endDate)) && !(new Date(req.body.endDate) <= new Date(PromotionDetails.startDate))){
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              "Offer not valid",
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
                    trainingId: ObjectId(req.body.trainingId),
                    day: moment(currentDate.date).format("dddd"),
                    date: `${moment(currentDate.date).format(
                      "YYYY-MM-DD"
                    )}T00:00:00.000+00:00`,
                    slot: slotDay.slot,
                    $expr: { $eq: ["$maximumStudent", "$totalBooking"] }
                  });
    
                  // availableSlots.forEach(async (training) => {
                  //   let [filteredSlots] = await training.slots.filter(
                  //     (item) =>
                  //       item.slot == slotDay.slot &&
                  //       parseInt(item.maximumStudent) == parseInt(item.totalBooking)
                  //   );
    
                  //   if (
                  //     filteredSlots &&
                  //     filteredSlots != null &&
                  //     filteredSlots != undefined
                  //   ) {
                  //     return SendResponse(
                  //       res,
                  //       { isBoom: true },
                  //       "Training can't be booked as some of the sessions are already booked",
                  //       422
                  //     );
                  //   }
                  // });
                    if ( availableSlots && availableSlots.length > 0 ) {
                      return SendResponse(
                        res,
                        { isBoom: true },
                        "Training can't be booked as some of the sessions are already booked",
                        422
                      );
                    }
              
                });
              });
            }
          });
          
          let validPromotionSlots = 0;

          for await (let day of req.body.days){
            if(req.body[`${day}`]){
              for await (let slotDay of req.body[`${day}`]){
                for await (let currentDate of slotDay.date){
                  let availablePromotionSlots = await PromotionSlot.findOne({
                    promotionId: ObjectId(req.body.promotionId),
                    day: moment(currentDate.date).format("dddd"),
                    date: `${moment(currentDate.date).format(
                      "YYYY-MM-DD"
                    )}T00:00:00.000+00:00`,
                    slot : slotDay.slot
                  });
                  
                  if(availablePromotionSlots) {
                  // availablePromotionSlots.forEach(async (promotion) => {
                    // let filteredSlots = await availablePromotionSlots.slots.filter(
                    //   (item) =>
                    //     item.slot == slotDay.slot 
                    // );
                    // if (
                    //   filteredSlots &&
                    //   filteredSlots != null &&
                    //   filteredSlots != undefined
                    // ) {
                      validPromotionSlots = validPromotionSlots + 1;
                    // }
                  // });
                  }
                }
              }
            }
          }
          if(validPromotionSlots == 0){
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              "Offer not valid",
              422
            );
          }
          let totalDiscount = 0;

          if( validPromotionSlots > 0){
            if(PromotionDetails.discountType == 'amount'){
                totalDiscount = validPromotionSlots*PromotionDetails.amount
            }else {
                let discount = req.body.pricePerSession * (PromotionDetails.percent / 100);
                totalDiscount = validPromotionSlots*discount;
                if( Number(totalDiscount) > Number(PromotionDetails.maximumDiscountValue)){
                  totalDiscount = Number(PromotionDetails.maximumDiscountValue);
                }
            }
           
          }

          // let discountedPrice = Number(req.body.grandTotalPrice) - totalDiscount;

          return SendResponse(
            res,
            {
              discountedPrice : totalDiscount
            },
            i18n.__("success"),
            200
          );


        }catch(error){
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

      trainingBooking: async (req, res) => {
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
            expectations: "required",
            // cardToken : "required",
            // customerId : "required",
            localCountry : "required",
            // saveCard: "required"
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

          if( Number(TrainingDetails.price) !== Number(req.body.pricePerSession) || TrainingDetails.currency !== req.body.currency ){
            return SendResponse(
              res,
              { isBoom: true },
              "Training has been updated. Kindly proceed with fresh booking.",
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
          
          const facilityAdminDetails = await facility.findById(TrainingDetails.facilityAdminId);
          let totalBookedSessions = 0;

          for await (let day of req.body.days){
            if (req.body[`${day}`]) {
              for await (let slotDay of req.body[`${day}`]){
                // slotDay.date = JSON.parse(slotDay.date);
                for await (let currentDate of slotDay.date){
                  let availableSlots = await TrainingSlot.find({
                    trainingId: ObjectId(req.body.trainingId),
                    day: moment(currentDate.date).format("dddd"),
                    date: `${moment(currentDate.date).format(
                      "YYYY-MM-DD"
                    )}T00:00:00.000+00:00`,
                    slot: slotDay.slot,
                    $expr: { $eq: ["$maximumStudent", "$totalBooking"] }
                  });
                  if ( availableSlots && availableSlots.length > 0 ) {
                    return SendResponse(
                      res,
                      { isBoom: true },
                      "Training can't be booked as some of the sessions are already booked",
                      422
                    );
                  }
                }
              }
            }
          }
          
          let card;
          let createCharge;
          try{
            if(req.body.saveCard && req.body.saveCard == 'true' && req.body.cardToken && req.body.cardToken != "" && req.body.cardToken != null){
              // Attach a card to the customer
              card = await stripe.customers.createSource(req.body.customerId, {
                source: req.body.cardToken, // Test token representing a card
              });

              createCharge = await stripe.charges.create({
                amount: Math.round(Number(req.body.totalPrice) * 100), //amount*100
                currency: req.body.currency,
                card: card.id, 
                customer: req.body.customerId, //Customer Id generated on stripe via create customer api
              });
            }
            else if( req.body.cardId && req.body.cardId != null && req.body.cardId != "" && req.body.saveCard && req.body.saveCard == 'false'){
              createCharge = await stripe.charges.create({
                amount: Math.round(Number(req.body.totalPrice) * 100), //amount*100
                currency: req.body.currency,
                card: req.body.cardId, 
                customer: req.body.customerId, //Customer Id generated on stripe via create customer api
              });
            }
            else{
              createCharge = await stripe.charges.create({
                amount: Math.round(Number(req.body.totalPrice) * 100), //amount*100
                currency: req.body.currency,
                source: req.body.cardToken,
                // customer: req.body.customerId, //Customer Id generated on stripe via create customer api
              });
            }
          } catch(error){
            dump("error", error);
            return SendResponse(
              res,
              {
                isBoom: true,
              },
              error.message,
              500
            );
          }

          // let commissionParams = {
          //   type: "commission",
          //   status : true,
          //   applicableTo : "trainingSessions",
          //   $or : [
          //       {
          //           $expr: {
          //               $in: [ObjectId(TrainingDetails.facilityId), "$facilityId"],
          //           },
          //       },
          //       {
          //           city: TrainingDetails.city
          //       },
          //       {
          //           state: TrainingDetails.state
          //       },
          //       {
          //           country: TrainingDetails.country
          //       },
          //       {
          //           sportId: ObjectId(TrainingDetails.sportId)
          //       }
          //   ],
          // };
        
        let commissionDetails;
        let sportCommissionDetails = await Commission.findOne({
          type: "commission",
          status : true,
          applicableTo : "trainingSessions",
          criteria : "sports",
          sportId: ObjectId(TrainingDetails.sportId)
          });
          if(sportCommissionDetails){
          commissionDetails = sportCommissionDetails;
          }

          let countryCommissionDetails = await Commission.findOne({
            type: "commission",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "country",
            sportId: ObjectId(TrainingDetails.sportId),
            country: TrainingDetails.country
          });
          if(countryCommissionDetails){
          commissionDetails = countryCommissionDetails;
          }

          let stateCommissionDetails = await Commission.findOne({
            type: "commission",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "state",
            sportId: ObjectId(TrainingDetails.sportId),
            country: TrainingDetails.country,
            state: TrainingDetails.state
          });
          if(stateCommissionDetails){
          commissionDetails = stateCommissionDetails;
          }

          let cityCommissionDetails = await Commission.findOne({
            type: "commission",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "city",
            sportId: ObjectId(TrainingDetails.sportId),
            country: TrainingDetails.country,
            state: TrainingDetails.state,
            city: TrainingDetails.city
          });
          if(cityCommissionDetails){
          commissionDetails = cityCommissionDetails;
          }

          let facilityCommissionDetails = await Commission.findOne({
            type: "commission",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "facility",
            sportId: ObjectId(TrainingDetails.sportId),
            country: TrainingDetails.country,
            // state: TrainingDetails.state,
            // city: TrainingDetails.city,
            $expr: {
                $in: [ObjectId(TrainingDetails.facilityId), "$facilityId"],
            },
          });
          if(facilityCommissionDetails){
          commissionDetails = facilityCommissionDetails;
          }

        req.body.platformFees = Number(req.body.platformFees);
        req.body.tax = Number(req.body.tax);
        req.body.trainingCost = Number(req.body.trainingCost);
        let facilityToSuperAdminCommission = 0;
        if(commissionDetails){
          if((new Date(req.body.startDate) <= new Date(commissionDetails.dateTo)) && (new Date(req.body.endDate) >= new Date(commissionDetails.dateFrom))){
            if (commissionDetails?.commissionType === 'percent') {
              facilityToSuperAdminCommission = ((parseFloat(req.body.trainingCost))*((parseFloat(commissionDetails.percent)) / 100)).toFixed(2);
            } else {
              facilityToSuperAdminCommission = (commissionDetails?.amount).toFixed(2)
            }
          }
        }
          req.body.facilityToSuperAdminCommission = Number(facilityToSuperAdminCommission);
          req.body.superAdminCommission = Number(req.body.platformFees) + Number(req.body.facilityToSuperAdminCommission);
          req.body.facilityAdminCommission = (Number(req.body.totalPrice) - Number(req.body.superAdminCommission)).toFixed(2);
          req.body.facilityAdminId = TrainingDetails.facilityAdminId;
          req.body.facilityId = TrainingDetails.facilityId;
          req.body.coachesId = TrainingDetails.coachesId;
          req.body.sportId = TrainingDetails.sportId;
          req.body.userId = ObjectId(req.user.id);
          // convert facility Admin's share to USD currency to calculate his revenue
          // if(facilityAdminDetails.currency && facilityAdminDetails.currency != null && facilityAdminDetails.currency != ""){
            req.body.fundTransferDate = req.body.startDate;
            req.body.facilityAdminLocalCommission = await convertCurrency( req.body.facilityAdminCommission , req.body.currency , "USD");
            req.body.superAdminLocalCommission = await convertCurrency( req.body.superAdminCommission , req.body.currency , "USD");
          // }
          let insertedItem = await trainingBooking.create(req.body);
          let slots = [];

          for await (let day of req.body.days){
            if (req.body[`${day}`]) {
              for await (let slotDay of req.body[`${day}`]){
                // slotDay.date = JSON.parse(slotDay.date);
                 for await (let currentDate of slotDay.date){
                  // let time = slotDay.slot.split("-");
                  
                  // // Parse the input date as UTC
                  // const date = momentTimeZone.utc(currentDate);

                  // // Convert the date to the target country's time zone
                  // date.tz(req.body.localCountry);

                  // // Format the time as HH:mm:ss (e.g., "06:00:00")
                  // const formattedStartTime = momentTimeZone(time[0], 'h:mm a').format('HH:mm:ss');

                  // // Combine the formatted date and time
                  // const formattedStartDateTime = date.format('YYYY-MM-DD') + 'T' + formattedStartTime + date.format('Z');
                  // const  utcStartTimeFormat = momentTimeZone(formattedStartDateTime);
                  // // Convert to UTC
                  // const startTimeUTC = utcStartTimeFormat.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

                  // // Format the time as HH:mm:ss (e.g., "06:00:00")
                  // const formattedEndTime = momentTimeZone(time[1], 'h:mm a').format('HH:mm:ss');
                
                  // // Combine the formatted date and time
                  // const formattedEndDateTime = date.format('YYYY-MM-DD') + 'T' + formattedEndTime + date.format('Z');
                  // const  utcEndTimeFormat = momentTimeZone(formattedEndDateTime);
                 
                  // // Convert to UTC
                  // const endTimeUTC = utcEndTimeFormat.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

                  let bookedSlot = await trainingBookingSlot.create({
                    bookingFor: req.body.bookingFor,
                    trainingBookingId: insertedItem._id,
                    userId: req.user.id,
                    familyMember: req.body.familyMember
                      ? req.body.familyMember
                      : null,
                    trainingId: req.body.trainingId,
                    facilityAdminId: TrainingDetails.facilityAdminId,
                    facilityBranchId : TrainingDetails.facilityBranchId,
                    showPreviousEvaluation: req.body.showPreviousEvaluation ? req.body.showPreviousEvaluation : false,
                    facilityId: TrainingDetails.facilityId,
                    coachesId: TrainingDetails.coachesId,
                    sportId : TrainingDetails.sportId,
                    date: moment(currentDate.date).format('YYYY-MM-DD'),
                    slotStartTime: currentDate.slotStartTime,
                    slotEndTime: currentDate.slotEndTime,
                    slotStartTimeUtc: currentDate.slotStartTimeUtc,
                    slotEndTimeUtc: currentDate.slotEndTimeUtc,
                    localCountry: currentDate.localCountry,
                    day: moment(currentDate.date).format("dddd"),
                    slot: slotDay.slot,
                    maximumStudent: TrainingDetails.maximumStudent,
                    totalBooking: TrainingDetails.totalBooking,
                  });
    
                  slots.push(moment(currentDate).format("YYYY-MM-DD"));

                  await TrainingSlot.updateOne(
                    {
                      trainingId: ObjectId(req.body.trainingId),
                      day: moment(currentDate.date).format("dddd"),
                      date: `${moment(currentDate.date).format(
                        "YYYY-MM-DD"
                      )}T00:00:00.000+00:00`,
                      slot : slotDay.slot
                    },
                    {  $inc : { "totalBooking" : 1 }}
                  );

                  //qr code data
                  let qrcode_name = Date.now();
                  let data = {
                      bookingId : bookedSlot._id
                  }
                  //generating qr code using helper method
                  let qr_code = await QRCode.generateQr(JSON.stringify(data), qrcode_name); 

                  //updating qr code
                  await trainingBookingSlot.findByIdAndUpdate( bookedSlot._id, {
                     $set : {
                      qrCode : process.env.AWS_URL + qr_code
                     }
                  }, {
                    new: true
                  });
                  //update totalBookedSession Count for calculating attendance
                  totalBookedSessions = totalBookedSessions + 1;
                }

                 
              }
            }
          }

          await trainingBooking.findByIdAndUpdate(insertedItem._id, {
            $set: {
              slots: slots,
              paymentId: createCharge.id,
              totalSession: totalBookedSessions 
            },
          });

          await Training.findByIdAndUpdate( req.body.trainingId ,{
            $inc : {
              students : 1
            }
          });
          const memberJoiningDate = Date.now();
          let trainingChatExist = await Chat.findOne({ trainingId: ObjectId(req.body.trainingId), chatType: 6});
          await ChatMessage.create({
            roomId: trainingChatExist.roomId,
            senderId: req.user.id,
            senderType: "user",
            chatType: 6,
            messageType: 6,
            message: `${req.user.fullName} joined this group`,
          });
          
          await Chat.updateOne({ 
            trainingId : ObjectId(req.body.trainingId),
            chatType : 6
          }, { 
            $push : {
              members : { id : ObjectId(req.user.id), status : true, joiningDate : memberJoiningDate}
            },
            $set : {
              status : true
            }
          });
          return SendResponse(
            res,
            {
              createCharge : createCharge
            },
            i18n.__("success"),
            200
          );
          
          // // Handle the createCharge response
          // if (createCharge.status === 'succeeded') {
          //   // Payment was successful
          //   // Redirect the user to the specified return URL
          //   res.status(201)
          //       .send(`<script>window.location.href='${process.env.APP_URL}'</script>`);
          // } else {
          //   // Payment failed or requires further action
          //   res.status(500)
          //   .send(`<script>window.location.href='${process.env.APP_URL}'</script>`);
          // }
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

      getBookedTrainingLists: async (req, res) => {
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
                userId : ObjectId(req.user.id)
            };
            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    "trainingDetails.trainingName": {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }

            if (req.query.date != "" && req.query.date != null) {
              const timestamp = new Date(req.query.date) ; 
              // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000));; // Replace this with your actual timestamp
        
              // // Add 24 hours to the timestamp
              // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000));
              const startDate = new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0));
              const endDate = new Date(new Date(req.query.date).setUTCHours(23, 59, 59, 999));
              const formattedstartDate = new Date(startDate.getTime()).toISOString();
              const formattedendDate = new Date(endDate.getTime()).toISOString();
              params = Object.assign(params, {
                slotStartTime: {
                  $gte: formattedstartDate,
                  $lt: formattedendDate
                }
              });
            }

            if (req.query.familyMember != "" && req.query.familyMember != null) {
              params = Object.assign(params, {
                familyMember : ObjectId(req.query.familyMember) 
              });
            }

            const [{
                bookingList,
                total
            }] = await trainingBookingSlot.aggregate([
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
                    $match: params
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
                    $facet: {
                        total: [{
                            $group: {
                                _id: "null",
                                count: {
                                    $sum: 1
                                }
                            }
                        }],
                        bookingList: [{
                                $project: {
                                    _id: 1,
                                    bookingFor: 1,
                                    userId: 1,
                                    familyMember: 1,
                                    trainingId: 1,
                                    userDetails : "$userDetails",
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
            let bookingData = {
                bookingList: bookingList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    bookingData: bookingData
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
        let [bookingDetails] = await trainingBookingSlot.aggregate([
          {
            $match: {
              _id: ObjectId(req.params.bookingId),
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
            $lookup: {
              from: "facilitybranches",
              localField: "facilityId",
              foreignField: "_id",
              as: "facilityBranchDetails",
            },
          },
          {
            $unwind: {
                path: "$facilityBranchDetails",
                preserveNullAndEmptyArrays : true
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
            $unwind: {
                path: "$facilityAdminDetails",
                preserveNullAndEmptyArrays : true
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
              from : 'members',
              localField : 'familyMember',
              foreignField : '_id',
              as: 'familyMemberDetail'
            }
          },
          {
            $unwind: {
                path: "$familyMemberDetail",
                preserveNullAndEmptyArrays : true
              },
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
              bookingId: "$trainingBookingDetails.bookingId",
              userId: 1,
              familyMember: 1,
              trainingId: 1,
              trainingBookingId: 1,
              facilityAdminId: 1,
              facilityId: 1,
              sportId: 1,
              date: 1,
              day: 1,
              slot: 1,
              isSelected: 1,
              attendance: 1,
              maximumStudent: 1,
              totalBooking: 1,
              slotStartTime: 1,
              slotEndTime: 1,
              slotStartTimeUtc: 1,
              slotEndTimeUtc: 1,
              localCountry: 1,
              sports: "$sportDetails",
              trainingDetails: "$trainingDetails",
              coaches: "$coaches",
              facilityBranchDetails: "$facilityBranchDetails",
              familyMemberDetail: "$familyMemberDetail",
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
              reviewPosted: "$trainingBookingDetails.reviewPosted",
              expectations: "$trainingBookingDetails.expectations"
            },
          },
        ]);

        let plannedSessions= [];
        if(bookingDetails.familyMember === null){
          plannedSessions = await trainingBookingSlot.find({
            trainingBookingId: ObjectId(bookingDetails.trainingBookingId),
            trainingId : ObjectId(bookingDetails.trainingId),
            userId : ObjectId(bookingDetails.userId),
            familyMember : null,
            slot : bookingDetails.slot,
         });
        }
         else{
          plannedSessions = await trainingBookingSlot.find({
            trainingBookingId: ObjectId(bookingDetails.trainingBookingId),
            trainingId : ObjectId(bookingDetails.trainingId),
            userId : ObjectId(bookingDetails.userId),
            familyMember : ObjectId(bookingDetails.familyMember),
            slot : bookingDetails.slot,
         });
        }
        let plannedSessionDates = [];

        for await( let trainingSlot of plannedSessions){
            if (!plannedSessionDates.find(item => item === trainingSlot.date))
              plannedSessionDates.push( trainingSlot.date)
        }

        const groupedDates = await groupDatesByMonthName(plannedSessionDates);
        const groupedSessions = await groupSessionsByMonth(plannedSessions);
        bookingDetails.plannedSessions = plannedSessions;
        bookingDetails.plannedSessionDates = groupedDates;
        bookingDetails.groupedPlannedSessions = groupedSessions;

        let trainingGroupExit = await Chat.findOne({
          trainingId : ObjectId(bookingDetails.trainingId),
          chatType : 6,
          status : true
          }).lean();
          let training = await Training.findById(bookingDetails.trainingId);
          bookingDetails.trainingGroupchat = trainingGroupExit;
          if (bookingDetails.trainingGroupchat && Object.keys(bookingDetails.trainingGroupchat).length > 0) {
              bookingDetails.trainingGroupchat.training = training;
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

    getBookingsList: async (req,res) => {
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
            userId : ObjectId(req.user.id),
            familyMember : null
        };
        if (req.query.search != "" && req.query.search != null) {
            params = Object.assign(params, {
              "trainingDetails.trainingName": {
                    $regex: ".*" + req.query.search + ".*",
                    $options: "i"
                },
            });
        }

        if (req.query.familyMember != "" && req.query.familyMember != null) {
          delete params.familyMember;
          params = Object.assign(params, {
            familyMember : ObjectId(req.query.familyMember) 
          });
        }
        const [{
            bookingList,
            total
        }] = await trainingBooking.aggregate([
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
                $match: params
            },
            {
              $lookup : {
                  from: 'trainingbookingslots',
                  localField: '_id',
                  foreignField: 'trainingBookingId',
                  as : 'trainingBookingSlots'
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
                    bookingList: [{
                            $project: {
                                _id: 1,
                                bookingId: 1,
                                bookingFor: 1,
                                userId: 1,
                                familyMember: 1,
                                trainingId: 1,
                                trainingCompleted: 1,
                                totalSession: 1,
                                totalAttendedSession: 1,
                                currentAttendancePercent: 1,
                                isRequestingForEvaluation: 1,
                                evalReqCount33: 1,
                                evalReqCount66: 1,
                                evalReqCount100: 1,
                                evalMarkedFor33: 1,
                                evalMarkedFor66: 1,
                                evalMarkedFor100: 1,
                                facilityAdminId: 1,
                                facilityId: 1,
                                sportId: 1,
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
                                showPreviousEvaluation: 1,
                                sports: "$sportDetails",
                                trainingDetails: "$trainingDetails",
                                trainingBookingSlots: "$trainingBookingSlots",
                                facilityBranchDetails: "$facilityBranchDetails",
                                familyMember: "$familyMember",
                                createdAt: 1
                                
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
        let bookingData = {
            bookingList: bookingList,
            total: total || 0
        }
        return SendResponse(
            res, {
                bookingData: bookingData
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
    
    getTrainingBookingDetails: async (req,res) => {
      try{
        let [bookingDetails] = await trainingBooking.aggregate([
          {
            $match: {
              _id: ObjectId(req.params.bookingId),
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
            $lookup: {
              from: "facilitybranches",
              localField: "facilityId",
              foreignField: "_id",
              as: "facilityBranchDetails",
            },
          },
          {
            $unwind: {
                path: "$facilityBranchDetails",
                preserveNullAndEmptyArrays : true
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
            $unwind: {
                path: "$facilityAdminDetails",
                preserveNullAndEmptyArrays : true
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
              from : 'members',
              localField : 'familyMember',
              foreignField : '_id',
              as: 'familyMemberDetail'
            }
          },
          {
            $unwind: {
                path: "$familyMemberDetail",
                preserveNullAndEmptyArrays : true
              },
          },
          {
            $lookup : {
                from: 'trainingbookingslots',
                localField: '_id',
                foreignField: 'trainingBookingId',
                as : 'trainingBookingSlots'
            }
          },
          {
            $project: {
              _id: 1,
              bookingFor: 1,
              bookingId: 1,
              userId: 1,
              familyMember: 1,
              trainingId: 1,
              facilityAdminId: 1,
              facilityId: 1,
              sportId: 1,
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
              sports: "$sportDetails",
              trainingDetails: "$trainingDetails",
              coaches: "$coaches",
              facilityBranchDetails: "$facilityBranchDetails",
              familyMemberDetail: "$familyMemberDetail",
              trainingBookingSlots: "$trainingBookingSlots",
              trainingCompleted: "$isCompleted",
              totalSession: 1,
              totalAttendedSession: 1,
              currentAttendancePercent: 1,
              isRequestingForEvaluation: 1,
              evalReqCount33: 1,
              evalReqCount66: 1,
              evalReqCount100: 1,
              evalMarkedFor33: 1,
              evalMarkedFor66: 1,
              evalMarkedFor100: 1,
              reviewPosted: 1,
              showPreviousEvaluation: 1,
              expectations: 1
            },
          },
        ]);

        let plannedSessions= [];
        if(!bookingDetails.familyMember){
          plannedSessions = await trainingBookingSlot.find({
            trainingId : ObjectId(bookingDetails.trainingId),
            trainingBookingId : ObjectId(bookingDetails._id),
            userId : ObjectId(bookingDetails.userId),
            familyMember : null
         });
        }
         else{
          plannedSessions = await trainingBookingSlot.find({
            trainingId : ObjectId(bookingDetails.trainingId),
            trainingBookingId : ObjectId(bookingDetails._id),
            userId : ObjectId(bookingDetails.userId),
            familyMember : ObjectId(bookingDetails.familyMember)
         });
        }
        let plannedSessionDates = [];

        for await( let trainingSlot of plannedSessions){
            if (!plannedSessionDates.find(item => item === trainingSlot.date))
              plannedSessionDates.push( trainingSlot.date)
        }

        const groupedDates = await groupDatesByMonthName(plannedSessionDates);
        const groupedSessions = await groupSessionsByMonth(plannedSessions);
        bookingDetails.plannedSessions = plannedSessions;
        bookingDetails.plannedSessionDates = groupedDates;
        bookingDetails.groupedPlannedSessions = groupedSessions;
         
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

    getSyncedBookedTrainingLists: async (req, res) => {
      try {
          let params = {
              userId : ObjectId(req.user.id),
              // familyMember : null
          };
          if (req.query.search != "" && req.query.search != null) {
              params = Object.assign(params, {
                  "trainingDetails.trainingName": {
                      $regex: ".*" + req.query.search + ".*",
                      $options: "i"
                  },
              });
          }

          if (req.query.date != "" && req.query.date != null) {
            const timestamp = new Date(req.query.date) ; 
            // const startDate = new Date(timestamp.getTime() - (12 * 60 * 60 * 1000)).toISOString(); // Replace this with your actual timestamp
      
            // // Add 24 hours to the timestamp
            // const endDate = new Date(timestamp.getTime() + (12 * 60 * 60 * 1000)).toISOString();
            const startDate = new Date(new Date(req.query.date).setUTCHours(0, 0, 0, 0));
            const endDate = new Date(new Date(req.query.date).setUTCHours(23, 59, 59, 999));
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

          // if (req.query.familyMember != "" && req.query.familyMember != null) {
          //   params = Object.assign(params, {
          //     familyMember : ObjectId(req.query.familyMember) 
          //   });
          // }

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

    getAttendanceHistory: async(req,res) => {
      try{
          const v = new Validator(req.query, {
              trainingId: "required",
              userId: "required"
          });

          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }
          if (!await Training.findOne({ _id : ObjectId(req.query.trainingId), isDeleted : false }))
              return SendResponse(res, {
                  isBoom: true
              }, 'Training not found', 422);
          
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
              userId : ObjectId(req.query.userId),
              trainingId : ObjectId(req.query.trainingId),
              attendance : 'present'
          };

          if(!req.query.familyMemberId){
              params = Object.assign(params, {
                  familyMember: null,
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
          }] = await trainingBookingSlot.aggregate([
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
                                  userDetails: "$userDetails",
                                  familyMember: "$familyMember",
                                  attendanceMarkedBy: 1,
                                  attendanceMarkedByDetails: "$attendanceMarkedByDetails",
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

  requestEvaluation: async(req,res) => {
    try{
          const v = new Validator(req.body, {
            trainingBookingId: "required",
            attendanceRange: "required",
          });

          const CheckValidation = await v.check();
          if (!CheckValidation) {
              let first_key = Object.keys(v.errors)[0];
              let err = v.errors[first_key]["message"];
              return SendResponse(res, {
                  isBoom: true
              }, err, 422);
          }

          let trainingBookingDetail = await trainingBooking.findById(req.body.trainingBookingId);
          let trainingDetails = await Training.findById(trainingBookingDetail.trainingId);

          if (!trainingBookingDetail)
          return SendResponse(res, {
              isBoom: true
          }, 'Booking not found', 422);

          let increamentCountField = (req.body.attendanceRange == 0 ? 'evalReqCount33' : req.body.attendanceRange == 1 ? 'evalReqCount66' : 'evalReqCount100');
      
          await trainingBooking.findByIdAndUpdate( req.body.trainingBookingId, {
            $inc: {
              [increamentCountField] : 1
            },
            $set : {
              isRequestingForEvaluation : true
            }
          });
          
          const facilityAdminDetails = await facility.findById(trainingBookingDetail.facilityAdminId);
          let data = { 
            title : 'Evaluation Request',
            trainingBookingId : (req.body.trainingBookingId).toString() ,
            trainingId : (trainingBookingDetail.trainingId).toString(),
            sportId : (trainingBookingDetail.sportId).toString(),
            facilityId: (trainingBookingDetail.facilityId).toString(),
            type: 'evaluationRequest',
            attendanceRange: (req.body.attendanceRange).toString(),
            trainingCurriculum: trainingDetails.curriculum
          };

          if(trainingBookingDetail.familyMember && trainingBookingDetail.familyMember != null && trainingBookingDetail.familyMember != ""){
            let familyMemberDetails = await Member.findOne({
              _id : ObjectId(trainingBookingDetail.familyMember),
              status : true
            });
            data.message = `Please evaluate the ${familyMemberDetails.fullName}'s training`
            data.familyMemberId = (trainingBookingDetail.familyMember).toString();
            data.studentName = familyMemberDetails.fullName;
          } else{
              let userDetails = await User.findOne({
                _id : ObjectId(trainingBookingDetail.userId),
                isDeleted : false,
                status : true
              });
              data.message = `Please evaluate the ${userDetails.fullName}'s training`
              data.userId = (trainingBookingDetail.userId).toString();
              data.studentName = userDetails.fullName;
          }

          if(trainingBookingDetail.showPreviousEvaluation == true){
            data.showPreviousEvaluation = true;
          }
          if( facilityAdminDetails.deviceToken && facilityAdminDetails.deviceToken != null && facilityAdminDetails.deviceToken != ""){
            data.receiverType = "facilityAdmin"
            await pushNotification.sendNotification(facilityAdminDetails.deviceToken, data);
            data.receiverEmail = facilityAdminDetails.email;
            data.senderId = (req.user.id).toString();
            data.receiverId = (facilityAdminDetails._id).toString();
            data.senderType = "user";
            await Notification.create(data);
          }

          for await (const coach of trainingBookingDetail.coachesId){
             let coachDetails = await facility.findById(coach);
             if( coachDetails.deviceToken && coachDetails.deviceToken != null && coachDetails.deviceToken != ""){
              data.receiverType = "coach"
              await pushNotification.sendNotification(coachDetails.deviceToken, data);
              data.receiverEmail = coachDetails.email;
              data.senderId = (req.user.id).toString();
              data.receiverId = (coachDetails._id).toString();
              data.senderType = "user";
              await Notification.create(data);
             }

          }

          return SendResponse(res, {}, i18n.__("success"), 200);
    

    }catch(error){
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

  getEvaluationsList: async(req,res) => {
      try{
       
          if(!await Training.findOne({ _id : ObjectId(req.params.trainingId), isDeleted : false })){
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
            trainingId : ObjectId(req.params.trainingId),
            isDeleted : false,
            status : true
        };

        let userDetails;
        
        if( req.query.familyMemberId && req.query.familyMemberId != null && req.query.familyMemberId != ""){
            params = Object.assign(params, {
              familyMemberId : ObjectId(req.query.familyMemberId),
            });

            userDetails = await Member.findById(req.query.familyMemberId).select('_id fullName image').lean();
        }

        if( req.query.userId && req.query.userId != null && req.query.userId != ""){
          params = Object.assign(params, {
            userId : ObjectId(req.query.userId),
          });

          userDetails = await User.findById(req.query.userId).select('_id fullName profileImage').lean();
        }
        const [{
            evaluationList,
            total
        }] = await TrainingEvaluation.aggregate([
            {
                $match: params
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
              $lookup : {
                from : 'facilities',
                let: {
                  'markId': '$evaluationMarkedBy'
              },
              pipeline: [{
                      $match: {
                          $expr: {
                              $eq: ['$_id', '$$markId']
                          }
                      }
                  },
                  {
                      $project: {
                          _id: 1,
                          name: 1,
                          profileImage: 1,
                          coverImage: 1
                      }
                  }
              ],
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
              $lookup : {
                from : 'facilitybranches',
                let: { facilityId: "$facilityId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$facilityId"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      address: 1,
                      city: 1,
                      state: 1,
                      country: 1,
                      about: 1,
                      status: 1,
                      coverImage: 1,
                      location: 1
                    },
                  },
                ],
                as: "facilityBranchDetails",
              }
            },
            {
                $unwind: {
                    path: "$facilityBranchDetails",
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
                                location: "$facilityBranchDetails.location",
                                trainingDetails: "$trainingDetails"
                            }

                        },
                        {
                            $sort: {
                                createdAt: -1,
                                _id: -1
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
          userDetails: userDetails,
          total: total || 0
      }
      return SendResponse(
          res, {
              evaluationData: evaluationData
          },
          "Evaluation list",
          200
      );

      }catch(error){
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

  getAllPromotionList: async(req,res) => {
    try{
      let userDetails = await User.findById(req.user.id);
      let { country,state,city } = req.query;
      let params =  { 
        sportId : { $in : userDetails.chosenSports.map((x) => ObjectId(x))}
      };
      const latitude = req.query.latitude ? parseFloat(req.query.latitude) : '';
      const longitude = req.query.longitude ? parseFloat(req.query.longitude) : '';
      let cond = {
        $match: {}
      }
      if (latitude && longitude ) {
        cond = {
            $geoNear: { 
                near: {
                    type: "Point",
                    coordinates: [longitude,latitude],
                },
                distanceField: "distance",
                maxDistance: 15000,
                includeLocs: "dist.location",
                spherical: true,
                key: "location",
            },
        }
    }
      // if(country && country!= null && country != ""){
      //   params = Object.assign(params, {
      //     country : country
      //   });
      // } 
      // if(state && state!= null && state != ""){
      //   params = Object.assign(params, {
      //     state : state
      //   });
      // }
      // if(city && city!= null && city != ""){
      //   params = Object.assign(params, {
      //     city : city
      //   });
      // }
      // const promotionsList = await Promotion.find(params).populate('facilityId');
      const promotionsList = await Promotion.aggregate([
        cond,
        {
          $match : params
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
            from: 'promotionslots',
            localField: '_id',
            foreignField: 'promotionId',
            as: 'promotionSlots'
          }
        },
        {
          $lookup : {
            from: 'trainings',
            let : { trainingId  : "$trainingId"},
            pipeline : [
              { $match : { $expr : { $eq  : ["$_id", "$$trainingId" ]} }},
              {
                $lookup: {
                  from: 'sports',
                  let: { sportId: '$sportId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$sportId'] } } }
                  ],
                  as: 'sportDetails',
                },
              },
              {
                $unwind : {
                  path : "$sportDetails"
                }
              },
              {
                $project : {
                  _id: 1,
                  trainingName: 1,
                  address: 1,
                  coverImage: 1,
                  startDate: 1,
                  localCountry: 1,
                  endDate: 1,
                  days : 1,
                  createdAt: 1,
                  rating: 1,
                  students: 1,
                  sportDetails: "$sportDetails"
                }
              }
            ],
            as: 'trainingDetails'
          }
        },
        {
          $lookup : {
            from : "trainingslots",
            let : { trainingId : "$trainingId"},
            pipeline : [
              { $match : 
                { 
                  $expr : { $eq : ["$trainingId", "$$trainingId"]},
                  isSelected : true
                }
              }
            ],
            as : "trainingSlots"
          }
        },
        {
          $project : {
            _id : 1,
            promotionAddedBy: 1,
            promotionType: 1,
            trainingId: 1,
            facilityAdminId: 1,
            facilityId: "$facilityBranchDetails",
            promotionSlots: "$promotionSlots",
            trainingDetails: "$trainingDetails",
            trainingSlots: "$trainingSlots",
            sportId: 1,
            location: 1,
            distance: "$distance",
            promotionName: 1,
            description: 1,
            maximumUses: 1,
            startDate: 1,
            endDate: 1,
            bannerImage: 1,
            days: 1,
            promoCode: 1,
            discountType: 1,
            amount: 1,
            percent: 1,
            termsAndCondition: 1,
            maximumDiscountValue: 1,
            minimumPurchaseValue: 1,
            currency: 1,
            others: 1,
            color: 1,
            country: 1,
            state: 1,
            city: 1,
            status: 1,
            isDeleted: 1
          }
        }
      ]);
      return SendResponse(
        res,
        {
          promotionsList : promotionsList
        },
        "Promotions List",
        200
    );
    }catch(error){
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
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    // Get your API key by signing up at https://open.er-api.com/
    const apiKey = process.env.CURRENCY_CONVERSION_API_KEY;
    
    // Make a request to the Open Exchange Rates API
    const response = await axios.get(`https://open.er-api.com/v6/latest/${fromCurrency}?apikey=${apiKey}`);
    
    // Check if the API request was successful
    if (response.status === 200) {
      // Extract exchange rates from the API response
      const exchangeRates = response.data.rates;
      
      // Check if the target currency is available
      if (exchangeRates[toCurrency]) {
        // Calculate the converted amount
        const convertedAmount = amount * exchangeRates[toCurrency];
        return convertedAmount.toFixed(2);
      } else {
        return null;
      }
    } else {
      dump('Failed to fetch exchange rates.');
      return null;
    }
  } catch (error) {
    dump('Error:', error.message);
    return null;
  }
}
