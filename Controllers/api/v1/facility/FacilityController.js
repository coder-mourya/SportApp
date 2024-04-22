const i18n = require("i18n");
const mongoose = require("mongoose");
const {dump} = require("../../../../services/dump");
const SendResponse = require("../../../../apiHandler");
const Facility = require("../../../../models/facility");
const Training = require("../../../../models/training");
const mail = require("../../../../services/mailServices");
const FileUpload = require("../../../../services/upload-file");
const FacilityBranch = require("../../../../models/facilityBranch");
const TrainingBooking = require("../../../../models/trainingBooking");
const TimeConvertor = require("../../../../services/timeConversion");
const ObjectId = mongoose.Types.ObjectId;
const { Validator } = require("node-input-validator");
const { first } = require("lodash");
const trainingBooking = require("../../../../models/trainingBooking");
const Stripe = require("stripe")(process.env.STRIP_SECRATE_KEY);
module.exports = {
  getFacility: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        facilityId: ObjectId(req.user.id),
        isDeleted: false,
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          name: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ facilityList, total }] = await FacilityBranch.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            let: {
              sportId: "$chosenSports",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$sportId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  sports_name: 1,
                  image: 1,
                },
              },
            ],
            as: "sportDetails",
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
            facilityList: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  location: {
                    "type" : "$location.type",
                    "coordinates": [
                    { $arrayElemAt: ["$location.coordinates", 1] },
                    { $arrayElemAt: ["$location.coordinates", 0] },
                    ]
                  },
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  openingTime: 1,
                  closingTime: 1,
                  about: 1,
                  color: 1,
                  rating: 1,
                  sports: "$sportDetails",
                  status: 1,
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
      let facilityData = {
        facilityList: facilityList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          facilityData: facilityData,
        },
        "Facility list",
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
  //add or update facility
  addNewFacility: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        action: "required|in:add,update",
        name: "required",
        countryAlphaCode: "required",
        countryCode: "required",
        mobile: "required",
        address: "required",
        country: "required",
        // state: "required",
        // city: "required",
        // pincode: "required",
        latitude: "required",
        longitude: "required",
        openingTime: "required",
        closingTime: "required",
        googleMapId: "nullable",
        color: "required",
        chosenSports: "required",
        stripeId: "nullable",
        facilityId: "requiredIf:action,update",
      });
      if (req.user.userType == "coach")
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "You have not rights to add facility",
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
      let regex = "^([1-9]|0[1-9]|1[0-2]):[0-5][0-9] ([AP][M])$";
      if (req.body.openingTime && !req.body.openingTime.match(regex))
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Invalid opening time format",
          422
        );
      if (req.body.closingTime && !req.body.closingTime.match(regex))
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Invalid closing time format",
          422
        );

      let facility  = await Facility.findById(req.user.id);

      if (!req.body.stripeId || req.body.stripeId == "") {
        try {
          // create stripe connect account
          const account = await Stripe.accounts.create({
            type: "express",
            email: req.user.email,
            capabilities: {
              card_payments: {
                requested: true,
              },
              transfers: {
                requested: true,
              },
            },
          });
          req.body.stripeId = account.id;
          // await Facility.findByIdAndUpdate(req.user.id, {
          //   $set : {
          //     stripeId : req.body.stripeId
          //   }
          // });
          //create account setup link
          const accountLink = await Stripe.accountLinks.create({
            account: account.id,
            refresh_url:
            process.env.STRIPE_REFRESH_URL +
              "/" +
              account.id,
            return_url: process.env.STRIPE_RETURN_URL,
            type: "account_onboarding",
          });

          mail.sendTemplate({
            email: req.user.email,
            subject: 'Stripe Account Setup Link',
            locale: "en",
            template: "facilityStripeSetUp.ejs",
            name : facility.name, 
            link : `${accountLink.url}`,
            // html: `Here is your Stripe account setup link: <a href="${accountLink.url}">Click here</a>
            // <br><br>
            // Thanks & Regards,
            // <br>
            // Sports Nerve Team`,
            
          });
        } catch (error) {
           dump('stripe error', error);
        }
      }
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
      }
      let coverImages = [];
      if (req.files && req.files.coverImage) {

        if( !Array.isArray(req.files.coverImage)){
          req.files.coverImage = [req.files.coverImage];
        }

        for (const image of req.files.coverImage) {
          let Image = await FileUpload.aws(image);
          coverImages.push(process.env.AWS_URL + Image.Key);
        }
        req.body.coverImage = coverImages;
      }

      if (typeof req.body.chosenSports == "string") {
        req.body.chosenSports = req.body.chosenSports.split(",");
      }
      req.body.startTime = await TimeConvertor.conver12HourTo24Hour(
        req.body.openingTime
      );
      req.body.endTime = await TimeConvertor.conver12HourTo24Hour(
        req.body.closingTime
      );

      if (req.body.action == "update") {
        let facilityBranchId = req.body.facilityId;
        req.body.facilityId = req.user.id;
        await FacilityBranch.findByIdAndUpdate(facilityBranchId, {
          $set: req.body,
        });
      } else {
        if (
          await FacilityBranch.findOne({
            name: req.body.name,
            facilityId: ObjectId(req.user.id),
          })
        )
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            i18n.__("Facility name already exist"),
            422
          );
        req.body.facilityId = req.user.id;
        req.body.status = false;
        await FacilityBranch.create(req.body);
        mail.sendTemplate({
          email: req.user.email,
          subject: 'Acknowledgement of Facility Registration',
          locale: "en",
          template: "acknowledgedFacilityRegistration.ejs",
          name : facility.name, 
          facilityName : req.body.name,
          // html: `We have acknowledged that you have registered the facility ${req.body.name} and admin will come back to you soon.
          // <br><br>
          // Thanks & Regards,
          // <br>
          // Sports Nerve Team`,
          
        });
        //if facility added then update total facility count in facility admin model
        await Facility.findByIdAndUpdate(req.user.id, {
          $inc: {
            totalFacility: 1,
          },
        });
      }
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

  //update facility admin profile
  updateFacilityProfile: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        adminName: "required",
        countryAlphaCode: "required",
        countryCode: "required",
        mobile: "required",
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
      //incase email come from frontend
      if (req.body.email) {
        delete req.body.email;
      }
      // //incase mobile come from frontend
      // if (req.body.mobile) {
      //     delete req.body.countryCode
      //     delete req.body.mobile
      // }

      let facilityAdmin = await Facility.findById(req.user.id);
      if (!facilityAdmin) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No data found",
          422
        );
      }
      if (req.files && req.files.profileImage) {
        if (facilityAdmin.profileImage)
          await FileUpload.unlinkFile(facilityAdmin.profileImage.slice(50));
        let Image = await FileUpload.aws(req.files.profileImage);
        req.body.profileImage = process.env.AWS_URL + Image.Key;
      }
      await Facility.findByIdAndUpdate(req.user.id, {
        $set: req.body,
      });
      return SendResponse(
        res,
        {},
        i18n.__("Profile_updated_successfully"),
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
  verifyStripeAccount: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        stripeId: "required",
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
      const account = await Stripe.accounts.retrieve(req.body.stripeId);
      if (!account) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Stripe account not found",
          422
        );
      } else if (!account.details_submitted) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Stripe account exit but details not submitted yet",
          422
        );
      }
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
  //get facility branch details added by facility admin as facility
  getFacilityDetails: async (req, res) => {
    try {
      const v = new Validator(req.query, {
        facilityId: "required",
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
      let facilityDetails = await FacilityBranch.findById(
        req.query.facilityId, 
        "_id chosenSports coverImage name countryAlphaCode countryCode mobile address country state city pincode openingTime closingTime googleMapId color chosenSports location googleMapId stripeId about rating status"
      )
        .populate("chosenSports", {
          _id: 1,
          selected_image: 1,
          image: 1,
          sports_name: 1,
        })
        .lean();

        let latitude = facilityDetails.location.coordinates[1];
        let longitude = facilityDetails.location.coordinates[0];

        facilityDetails.location.coordinates[0] = latitude;
        facilityDetails.location.coordinates[1] = longitude;

      if (!facilityDetails)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Facility details not found",
          422
        );

      let training = await Training.findOne({
        facilityId: req.query.facilityId,
        $and: [
          {
            startDate: {
              $gte: new Date(),
            },
          },
          {
            endDate: {
              $lte: new Date(),
            },
          },
        ],
      });
      
      let trainings  = await Training.find({
        facilityId: ObjectId(req.query.facilityId),
        status: true,
        isDeleted: false,
      });

      if ( trainings.length > 0){
        facilityDetails.isEditable = false;
      }
      else{
        facilityDetails.isEditable = true;
      }
        return SendResponse(
          res,
          {
            facilityDetails: facilityDetails,
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

  deleteFacility : async( req,res ) =>{
    try{
        const v = new Validator(req.params, {
          facilityId : "required"
        });

        const CheckValidation = await v.check();
        if( !CheckValidation ){
          let first_key = Object.keys(v.errors)[0];
          let err = v.errors[first_key]["message"];
          return SendResponse(
            res, 
            { isBoom : true },
            err,
            422
          );
        }

        let facilityDetails = await FacilityBranch.findById(req.params.facilityId);
        if( !facilityDetails ){
          return SendResponse(
            res,
            { isBoom : true },
            "No such facility found",
            422
          );
        }

        let trainings = await Training.findOne({
          facilityId : ObjectId(req.params.facilityId),
          isDeleted : false
        }); 

        if(trainings){
          return SendResponse (
          res,
          { isBoom : true },
          "Facility already booked in training. Can't be deleted",
          500
          );
        }

        await FacilityBranch.findByIdAndUpdate(req.params.facilityId, {
          $set: {
              isDeleted: true
          }
        });
        return SendResponse(res, {}, i18n.__('success'), 200);
    } catch (error){
      dump("error", error);
      return SendResponse(
        res,
        {
          isBoom : true,
        },
        i18n.__("Something_went_wrong_please_try_again"),
        500
      );
    }
  }
};
