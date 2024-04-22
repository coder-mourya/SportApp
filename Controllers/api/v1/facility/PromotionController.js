const FacilityBranch = require('../../../../models/facilityBranch');
const Promotion = require('../../../../models/promotion');
const Banner = require('../../../../models/bannerImages');
const PromotionSlot = require('../../../../models/promotionSlot');
const Training = require('../../../../models/training');
const FileUpload = require("../../../../services/upload-file");
const SendResponse = require("../../../../apiHandler");
const {dump}=require('../../../../services/dump');
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const {
    Validator
} = require("node-input-validator");
const trainingBooking = require('../../../../models/trainingBooking');
const TrainingController = require('./TrainingController');
module.exports = {
    createPromotion: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                promotionType: "required|in:training,facility",
                trainingId: "requiredIf:promotionType,training",
                facilityId: "requiredIf:promotionType,facility",
                promotionName: "required",
                startDate: "required",
                endDate: "required",
                days: "requiredIf:promotionType,training",
                promoCode: "required",
                discountType: "required|in:amount,percent",
                amount: "requiredIf:discountType,amount",
                percent: "requiredIf:discountType,percent",
                localCountry: "required",
                // color: "required"
            });

            if (req.user.userType == 'coach')
                return SendResponse(res, {
                    isBoom: true
                }, 'You have not rights to add promotion', 422);
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            if(await Promotion.findOne({
                facilityAdminId: ObjectId(req.user.id),
                promoCode: req.body.promoCode,
                trainingId: ObjectId(req.body.trainingId)
            })){
                return SendResponse(res, {
                    isBoom: true
                }, 'Promo code already used for this training', 422);
            }
            // if( !req.files.bannerImage){
            //     return SendResponse(
            //         res,
            //         { isBoom : true },
            //         "Banner image is required",
            //         422
            //     );
            // }
            if (await Promotion.findOne({
                    facilityAdminId: ObjectId(req.user.id),
                    promoCode: req.body.promoCode,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate
                }))
                return SendResponse(res, {
                    isBoom: true
                }, 'Promo code already added for this time interval', 422);
            if (req.body.promotionType == 'facility') {
                let facilityBranch = await FacilityBranch.findOne({ _id : ObjectId(req.body.facilityId), isDeleted : false , status : true });
                if (!facilityBranch){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Selected facility not found', 422);
                }
                req.body.country = facilityBranch.country;
            }

            req.body.facilityAdminId = req.user.id;
            let slot = [];
            if (req.body.promotionType == 'training') {
                const trainingDetails  = await Training.findOne({
                    _id : ObjectId(req.body.trainingId),
                    isDeleted : false
                   });
               
                if (!trainingDetails){
                   return SendResponse(res, {
                       isBoom: true
                   }, 'Training not found', 422);
                }
                if (typeof req.body.days == "string") {
                    req.body.days = req.body.days.split(",");
                }
                if (!req.body.days && req.body.days.length < 1) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Days required', 422);
                }

                if( req.body.discountType == 'amount' && parseFloat(req.body.amount) > parseFloat(trainingDetails.price)){
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Discount cant be greater than training session price', 422);
                }


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
                //return SendResponse(res, req.body.monday, 'Sunday slots ', 422);
                if (req.body.days.includes('sunday') && !req.body.sunday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Sunday slots required', 422);
                }
                if (req.body.days.includes('monday') && !req.body.monday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Monday slots required', 422);
                }
                if (req.body.days.includes('tuesday') && !req.body.tuesday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Tuesday slots required', 422);
                }
                if (req.body.days.includes('wednesday') && !req.body.wednesday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Wednesday slots required', 422);
                }
                if (req.body.days.includes('thursday') && !req.body.thursday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Thursday slots required', 422);
                }
                if (req.body.days.includes('friday') && !req.body.friday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Friday slots required', 422);
                }
                if (req.body.days.includes('saturday') && !req.body.saturday) {
                    return SendResponse(res, {
                        isBoom: true
                    }, 'Saturday slots required', 422);
                }

                if (req.body.sunday && req.body.sunday.length > 0) {
                    slot.push({
                        sunday: req.body.sunday
                    });
                }
                if (req.body.monday && req.body.monday.length > 0) {
                    slot.push({
                        monday: req.body.monday
                    });
                }
                if (req.body.tuesday && req.body.tuesday.length > 0) {
                    slot.push({
                        tuesday: req.body.tuesday
                    });
                }
                if (req.body.wednesday && req.body.wednesday.length > 0) {
                    slot.push({
                        wednesday: req.body.wednesday
                    });
                }
                if (req.body.thursday && req.body.thursday.length > 0) {
                    slot.push({
                        thursday: req.body.thursday
                    });
                }
                if (req.body.friday && req.body.friday.length > 0) {
                    slot.push({
                        friday: req.body.friday
                    });
                }
                if (req.body.saturday && req.body.saturday.length > 0) {
                    slot.push({
                        saturday: req.body.saturday
                    });
                }
                req.body.location = trainingDetails.location;
                req.body.country = trainingDetails.country;
                req.body.state = trainingDetails.state;
                req.body.city = trainingDetails.city;
                req.body.facilityId = trainingDetails.facilityId;
                req.body.sportId = trainingDetails.sportId;
            }
            req.body.slots = slot;

            // if( req.files.bannerImage ){
            //     let Image = await FileUpload.aws( req.files.bannerImage );
            //     req.body.bannerImage =  process.env.AWS_URL + Image.Key;
            // }
            let insertedPromotion = await Promotion.create(req.body);
            if (req.body.promotionType == 'training') {
                var currentDate = moment(req.body.startDate, 'YYYY-MM-DD'); //start date
                var stopDate = moment(req.body.endDate, 'YYYY-MM-DD'); //end date
                while (currentDate <= stopDate) {
                    let slot = [];
                    let dateDay = moment(currentDate).format('dddd');
                    let dateDayLower = dateDay.toLowerCase();
                    if (req.body.days.includes(dateDay.toLowerCase())) {
                        let daySlot = dateDayLower == 'sunday' ? (req.body.sunday) : (dateDayLower == 'monday' ? (req.body.monday) : (dateDayLower == 'tuesday' ? req.body.tuesday : (dateDayLower == 'wednesday' ? req.body.wednesday : (dateDayLower == 'thursday' ? req.body.thursday : (dateDayLower == 'friday' ? req.body.friday : (dateDayLower == 'saturday' ? req.body.saturday : []))))));

                        daySlot.forEach(async timeSlot => {
                            
                            // let time = timeSlot.split("-");

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

                            let dateArray = {
                                promotionId: insertedPromotion._id,
                                date: currentDate.format('YYYY-MM-DD'),
                                day: dateDay,
                                slot: timeSlot,
                                // slotStartTime: startTimeUTC,
                                // slotEndTime: endTimeUTC
                            }
                            await PromotionSlot.create(dateArray);
                        })
                       
                    }

                    currentDate = moment(currentDate).add(1, 'days');
                }
            }
            return SendResponse(
                res, {},
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
    getPromotion: async (req, res) => {
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
                facilityAdminId: ObjectId(req.user.id),
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
                                    bannerImage: 1,
                                    termsAndCondition: 1,
                                    maximumDiscountValue: 1,
                                    minimumPurchaseValue: 1,
                                    others: 1,
                                    currency: 1
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
    deletePromotion: async (req, res) => {
        try {
            const v = new Validator(req.params, {
                promotionId: "required",
            });

            if (req.user.userType == 'coach')
                return SendResponse(res, {
                    isBoom: true
                }, 'You have not rights to delete promotion', 422);
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let user = await Promotion.findById(req.params.promotionId);
            if (!user) {
                return SendResponse(res, {
                    isBoom: true
                }, "No data found", 422);
            }

            if( await trainingBooking.findOne({ promotionId : ObjectId(req.params.promotionId) })){
                return SendResponse(res, {
                    isBoom: true
                }, "Promotion can't be deleted as it is apllied by any user.", 422);
            }
            await Promotion.findByIdAndUpdate(req.params.promotionId, {
                $set: {
                    isDeleted: true
                }
            });
            return SendResponse(res, {}, i18n.__('success'), 200);
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
    getAllBannersList: async (req,res) => {
       try{
          const bannersList = await Banner.find({ status : true });
          return SendResponse(
            res, {
                bannersList : bannersList
            },
            "Banners List",
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
}