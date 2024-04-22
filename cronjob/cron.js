const User = require("../models/user");
const Member = require("../models/member");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require('../models/training');
const TrainingSlot = require('../models/trainingSlot');
const {
    Validator
} = require("node-input-validator");
const i18n = require('i18n');
const {dump}=require('../services/dump');
const SendResponse = require("../apiHandler");
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const trainingBooking = require("../models/trainingBooking");
const trainingBookingSlot = require("../models/trainingBookingSlot");
const Event = require("../models/event");
const Chat = require("../models/chat");
const stripe = require('stripe')(process.env.STRIP_SECRATE_KEY);
const STRIP = require('stripe')(process.env.STRIP_PUBLISH_KEY);
const fs = require('fs');
const mail = require("../services/mailServices");

module.exports = {

    transferMoney: async()=>{
        try{
          const currentDate = new Date();
          const bookedTrainings = await trainingBooking.find({
            isFundTransferred : false,
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
                moment(currentDate).format("YYYY-MM-DD"),
              ],
            },
          }).populate('facilityId facilityAdminId');
          
          let isSufficientBalance = false;
          for await (let training of bookedTrainings){
            try {
              const balance = await stripe.balance.retrieve();
              if ( balance.available[0].amount < (training.facilityAdminLocalCommission * 100) ){
                  isSufficientBalance = true;
              }else{
                const transfer = await stripe.transfers.create({
                  amount: (training.facilityAdminLocalCommission) * 100, 
                  currency: "USD", 
                  destination: training.facilityId.stripeId, // Facility Admin's Stripe Account ID
                  metadata: {
                    trainingBookingId : training.trainingBookingId,
                    paymentId : training.paymentId
                  }
                });
                training.fundTransferDate = moment(currentDate).format("YYYY-MM-DD");
                training.isFundTransferred = true;
                await training.save();
                dump('Money transfer was successful:', transfer);
              }
            } catch (error) {
              dump('Money transfer failed:', error);
            }
          }
          if( isSufficientBalance ){
            mail.send({
              email: process.env.mail_user,
              subject: 'Insufficient balance in stripe account',
              html: `Some of the funds could not be shared to facility admins due to insufficient balance in your stripe account.</a>
              <br><br>
              Thanks & Regards,
              <br>
              Sports Nerve Team`,
              
            });
          }
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

    archiveEvents: async()=> {
      try{
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        const passedEvents = await Event.find({
          isAllPaymentsConfirmed : true,
          $expr: {  
            $lte: [
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date:  {
                    $toDate: "$eventDate" // Convert the string to a date
                  },
                },
              },
              moment(currentDate).format("YYYY-MM-DD"),
            ],
          },
        });
        await Chat.updateMany({
          eventId: { $in: passedEvents.map((event) => ObjectId(event._id)) } ,
          isArchived : false 
        },
        {
          $set: {
            isArchived: true,
            archivedDate: moment(new Date()).format("YYYY-MM-DD")
          }
        });

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
   
}


