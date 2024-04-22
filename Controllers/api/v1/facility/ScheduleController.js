const Training = require('../../../../models/training');
const TrainingSlot = require('../../../../models/trainingSlot');
const SendResponse = require("../../../../apiHandler");
const {dump}=require('../../../../services/dump');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const {
    Validator
} = require("node-input-validator");
const moment = require('moment');
module.exports = {
    getSchedules: async (req, res) => {
        try {
            const v = new Validator(req.query, {
                currentDate: "required|dateFormat:YYYY-MM-DD"

            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            var d = new Date(req.query.currentDate);
            var dayName = days[d.getDay()];
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
            let params = {};
            if (req.user.userType == "facility_admin") {
                params = {
                    facilityAdminId: ObjectId(req.user.id),
                    isDeleted: false,
                    status: true
                };
            }
            if (req.user.userType == "coach") {
                params = {
                    coachesId: ObjectId(req.user.id),
                    isDeleted: false,
                    status: true
                };
            }
            // params = Object.assign(params, {
            //     $expr: {
            //         $and: [{
            //             $lte: [{
            //                     $dateToString: {
            //                         format: "%Y-%m-%d",
            //                         date: "$startDate"
            //                     }
            //                 },
            //                 req.query.currentDate
            //             ]
            //         }, {
            //             $gte: [{
            //                     $dateToString: {
            //                         format: "%Y-%m-%d",
            //                         date: "$endDate"
            //                     }
            //                 },
            //                 req.query.currentDate
            //             ]
            //         }]
            //     }
            // })

            params = Object.assign(params, {
                slots: {
                    $in: [req.query.currentDate]
                }
            })

            // params = Object.assign(params, {
            //     days: dayName
            // })


            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    trainingName: {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }
            if (req.query.facilityId != "" && req.query.facilityId != null) {
                params = Object.assign(params, {
                    facilityId: ObjectId(req.query.facilityId)
                })
            }
            if (req.query.coachId != "" && req.query.coachId != null) {
                params = Object.assign(params, {
                    coachesId: ObjectId(req.query.coachId)
                })
            }
            if (req.query.sportId != "" && req.query.sportId != null) {
                params = Object.assign(params, {
                    sportId: ObjectId(req.query.sportId)
                })
            }

            const [{
                trainingList,
                total
            }] = await Training.aggregate([{
                    $match: params
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
                                    startDate: 1,
                                    endDate: 1,
                                    createdAt: 1,
                                    students: 1
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
            let trainingData = {
                trainingList: trainingList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    trainingData: trainingData
                },
                "Training list",
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