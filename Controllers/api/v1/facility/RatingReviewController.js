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
const fs = require('fs');
const Facility = require("../../../../models/facility");
const pushNotification = require("../../../../firebase/index");
const facility = require("../../../../models/facility");

module.exports = {
    //api for coach
    getCoachReviewsList: async (req, res) => {

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
               coachId : ObjectId(req.params.coachId),
               ratingFor : 'coach'
            };

            if(req.query.coachId && req.query.coachId != null && req.query.coachId != ""){
                delete  params.coachId;
                params = Object.assign(params, {
                    coachId : ObjectId(req.query.coachId),
                });
            }
            const [{
                coachReviewsList,
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
                        profileImage: 1
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
                        coachReviewsList: [{
                                $project: {
                                    _id: 1,
                                    ratingFor: 1,
                                    userId: 1,
                                    coachId: 1,
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
            let coachReviewData = {
                coachReviewsList: coachReviewsList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    coachReviewData: coachReviewData
                },
                "Coach Review List",
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

     //api for particular facility branch
     getFacilityReviewsList: async (req, res) => {

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
               facilityId : ObjectId(req.params.facilityId),
               ratingFor : 'facility'
            };
            
            const [{
                facilityReviewsList,
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
                        profileImage: 1
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
                        facilityReviewsList: [{
                                $project: {
                                    _id: 1,
                                    ratingFor: 1,
                                    userId: 1,
                                    facilityId: 1,
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
            let facilityReviewData = {
                facilityReviewsList: facilityReviewsList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    facilityReviewData: facilityReviewData
                },
                "Facility Review List",
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

    //api for facility
    getReviewsList: async (req, res) => {
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
            const trainingDetails = await Training.findById(req.params.trainingId);
            if( !trainingDetails){
                return SendResponse(res, {
                    isBoom: true
                }, 'No training found', 422);
            }
            if(req.query.facility == 'true' || req.query.facility === true){
                delete params.ratingFor;
                params = Object.assign(params, {
                    ratingFor: 'facility',
                    facilityId : ObjectId(trainingDetails.facilityId),
                  });
            }

            if(req.query.coach == 'true' || req.query.coach === true){
                delete params.ratingFor;
                params = Object.assign(params, {
                    ratingFor: 'coach',
                    coachId : { $in : trainingDetails.coachesId.map(coach => ObjectId(coach))},
                  });
            }
            const [{
                ReviewsList,
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
                        profileImage: 1
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
                    $lookup : {
                      from : "facilities",
                      let: {
                          coachId: "$coachId",
                      },
                      pipeline: [{
                          $match: {
                              $expr : {
                                  $eq : ['$_id', '$$coachId']
                              },
                          },
                      },
                      {
                          $project: {
                          _id: 1,
                          name: 1,
                          email: 1,
                          profileImage: 1
                          },
                      },
                      ],
                      as: "coachDetails",
                   },
                },
                {
                    $unwind: {
                        path: "$coachDetails",
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
                        ReviewsList: [{
                                $project: {
                                    _id: 1,
                                    ratingFor: 1,
                                    userId: 1,
                                    facilityId: 1,
                                    trainingId: 1,
                                    coachId: 1,
                                    rating: 1,
                                    review: 1,
                                    ratedOn: 1,
                                    status: 1,
                                    userDetails : "$userDetails",
                                    coachDetails : "$coachDetails"
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
            let ReviewData = {
                ReviewsList: ReviewsList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    ReviewData: ReviewData
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
}