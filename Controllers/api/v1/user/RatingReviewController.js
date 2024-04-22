const User = require("../../../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require('../../../../models/training');
const TrainingSlot = require('../../../../models/trainingSlot');
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
const RecentViews = require("../../../../models/recentView");
const fs = require('fs');
const Facility = require("../../../../models/facility");
const pushNotification = require("../../../../firebase/index");
const facility = require("../../../../models/facility");
module.exports = {

    postRatingReview: async(req,res) => {
         try{
            const v = new Validator(req.body, {
                trainingId: "required",
                trainingBookingId: "required",
                trainingRating : "required"
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
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

            if (!await TrainingBooking.findById(req.body.trainingBookingId)) {
                return SendResponse(
                res,
                { isBoom: true },
                "No such training booking found",
                422
                );
            }
            
            if(req.body.facilityId && req.body.facilityId != "" && req.body.facilityId != null){
                if (!await FacilityBranch.findById(req.body.facilityId)) {
                    return SendResponse(
                    res,
                    { isBoom: true },
                    "No such facility found",
                    422
                    );
                }
                if(!req.body.facilityRating){
                    return SendResponse(
                        res,
                        { isBoom: true },
                        "Rating field is mandatory for facility",
                        422
                    );
                }
            }

            if(req.body.coaches && req.body.coaches != "" && req.body.coaches != null){
                req.body.coaches = JSON.parse(req.body.coaches);
                for await (let coach of  req.body.coaches){
                    if (!await Facility.findById(coach.id)) {
                        return SendResponse(
                        res,
                        { isBoom: true },
                        "No such coach found",
                        422
                        );
                    }

                    if (!coach.rating) {
                        return SendResponse(
                        res,
                        { isBoom: true },
                        "Rating field is mandatory for coach",
                        422
                        );
                    }
                }
            }
            await RatingReview.create({
                ratingFor: 'training',
                userId: req.user.id,
                trainingId: req.body.trainingId,
                rating: Number(req.body.trainingRating),
                review: req.body.trainingReview ? req.body.trainingReview : ''
            });
            
            let trainingRatings = await RatingReview.find({ trainingId : ObjectId(req.body.trainingId ), ratingFor: 'training'});

            let trainingRatingSum = 0;
            for await (let rating of trainingRatings){
                trainingRatingSum = trainingRatingSum + Number(rating.rating)
            }

            await Training.findByIdAndUpdate(req.body.trainingId,{
               $set : {
                rating : trainingRatingSum / trainingRatings.length
               }
            });
            if(req.body.facilityId && req.body.facilityId != "" && req.body.facilityId != null){
                await RatingReview.create({
                    ratingFor: 'facility',
                    userId: req.user.id,
                    trainingId : req.body.trainingId,
                    facilityId: req.body.facilityId,
                    rating: Number(req.body.facilityRating),
                    review: (req.body.facilityReview) ? (req.body.facilityReview) : ""
                });
            }

            let facilityRatings = await RatingReview.find({ facilityId : ObjectId(req.body.facilityId ), ratingFor: 'facility'});

            let facilityRatingSum = 0;
            for await (let rating of facilityRatings){
                facilityRatingSum = facilityRatingSum + Number(rating.rating)
            }
            
            await FacilityBranch.findByIdAndUpdate(req.body.facilityId,{
                $set : {
                 rating : facilityRatingSum / facilityRatings.length
                }
             });

            if(req.body.coaches && req.body.coaches != "" && req.body.coaches != null){
                // req.body.coaches = JSON.parse(req.body.coaches);
                for await (let coach of  req.body.coaches){
                    await RatingReview.create({
                        ratingFor: 'coach',
                        userId: req.user.id,
                        trainingId: req.body.trainingId,
                        coachId: coach.id,
                        rating: Number(coach.rating),
                        review: coach.review ? coach.review : ''
                    });
                    
                    let coachRatings = await RatingReview.find({ coachId : ObjectId(coach.id), ratingFor: 'coach'});

                    let coachRatingSum = 0;
                    for await (let rating of coachRatings){
                        coachRatingSum = coachRatingSum + Number(rating.rating)
                    }
                    
                    await facility.findByIdAndUpdate(coach.id,{
                        $set : {
                        rating : coachRatingSum / coachRatings.length
                        }
                    });
                }
                
            }

            await TrainingBooking.findByIdAndUpdate(req.body.trainingBookingId, {
                $set : {
                    reviewPosted : true
                }
            });

            return SendResponse(
                res, {},
                i18n.__('success'),
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

    getTrainingReviewsList: async (req, res) => {

        try {

            let {
                limit = 10, order = "desc", sort = "createdAt"
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;
            let params = {
               trainingId : ObjectId(req.params.trainingId),
               ratingFor : 'training'
            };
            const [{
                trainingReviewsList,
                total
            }] = await RatingReview.aggregate([
                {
                    $match: params
                },
                {
                  $lookup : {
                    from : "users",
                    let: {
                        userId: "$userId",
                    },
                    pipeline: [{
                        $match: {
                            $expr : {
                                $eq : ['$_id', '$$userId']
                            },
                        },
                    },
                    {
                        $project: {
                        _id: 1,
                        fullName: 1,
                        email: 1,
                        profileImage: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        },
                    },
                    ],
                    as: "userDetails",
                 },
                },
                {
                    $unwind: {
                        path: "$userDetails",
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
                        trainingReviewsList: [{
                                $project: {
                                    _id: 1,
                                    ratingFor: 1,
                                    userId: 1,
                                    trainingId: 1,
                                    rating: 1,
                                    review: 1,
                                    ratedOn: 1,
                                    status: 1,
                                    userDetails : "$userDetails"
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
            let reviewData = {
                trainingReviewsList: trainingReviewsList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    reviewData: reviewData
                },
                "Review List",
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

    getRecentViewsList: async (req,res) => {
        try{
            let {
                limit = 10, order = "desc", sort = "viewedOn"
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
            
            const currentDate = new Date();
            const [{
                recentViewsList,
                total
            }] = await RecentViews.aggregate([
                {
                    $match: params
                },
                {
                    $lookup: {
                      from: "trainings",
                      let: { trainingId: "$trainingId" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                               $and : [
                                {
                                  $eq : ["$_id", "$$trainingId"],
                                },
                                {
                                    $gte:  [
                                            {
                                                $dateToString: { 
                                                    format: "%Y-%m-%d",
                                                    date: {
                                                        $toDate: "$endDateUTC" // Convert the string to a date
                                                    }
                                                }
                                            },
                                            moment(new Date()).format("YYYY-MM-DD")
                                       ]
                                },
                                {
                                    $eq : ["$isDeleted", false], 
                                }
                                
                               ],
                            }
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            sportId: 1,
                            trainingName: 1,
                            coverImage: 1,
                            address: 1,
                            curriculum: 1,
                            ageGroupFrom: 1,
                            ageGroupTo: 1,
                            proficiencyLevel: 1,
                            coachesId: 1,
                            startDate: 1,
                            endDate: 1,
                          },
                        },
                      ],
                      as: "trainingDetails",
                    },
                },
                {
                    $unwind:{
                        path : "$trainingDetails",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup: {
                      from: "facilitybranches",
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
                          },
                        },
                      ],
                      as: "facilityBranchDetails",
                    },
                },
                {
                    $unwind:"$facilityBranchDetails"
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
                        recentViewsList: [{
                                $project: {
                                    _id: 1,
                                    userId: 1,
                                    trainingId: 1,
                                    viewedOn: 1,
                                    status: 1,
                                    trainingDetails: "$trainingDetails",
                                    facilityBranchDetails: "$facilityBranchDetails"
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
            let recentViewData = {
                recentViewsList: recentViewsList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    recentViewData: recentViewData
                },
                "Recent Views List",
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