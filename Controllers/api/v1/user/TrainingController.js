const User = require("../../../../models/user");
const FavouriteTraining = require('../../../../models/favourites');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Training = require('../../../../models/training');
const Commission = require('../../../../models/commission');
const RecentViews = require('../../../../models/recentView');
const {
    Validator
} = require("node-input-validator");
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const SendResponse = require("../../../../apiHandler");
const Notification = require("../../../../models/notification");
const Chat = require("../../../../models/chat");
const moment = require('moment');
module.exports = {
    favouriteUnfavouriteTraining: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                trainingId: "required"

            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            if (await FavouriteTraining.findOne({
                    trainingId: ObjectId(req.body.trainingId),
                    userId: ObjectId(req.user.id)
                })) {
                await FavouriteTraining.findOneAndDelete({
                    trainingId: ObjectId(req.body.trainingId),
                    userId: ObjectId(req.user.id)
                });
            } else {
                let data = {
                    trainingId: req.body.trainingId,
                    userId: req.user.id
                }
                let training = await FavouriteTraining.create(data);
            }
            return SendResponse(
                res, {

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

    favouriteTrainings: async (req,res) => {
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
                userId : ObjectId(req.user.id)
            };

            if (req.query.search) {
                params = Object.assign(params, {
                    trainingName: {
                        $regex: new RegExp(req.query.search, "i")
                    }
                })
            }

            const [{ trainingsList, total }] = await FavouriteTraining.aggregate([
                {
                  $match: params,
                },
                {
                    $lookup : {
                        from: "trainings",
                        let: {
                            'trainingId': '$trainingId'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { 
                                                $eq: ['$_id', '$$trainingId']
                                            },
                                            {
                                                $eq : ["$isDeleted", false], 
                                            }
                                        ]
                                       
                                    }
                                }
                            },
                            {
                                $lookup : {
                                    from : "sports",
                                    let : { 'sportId' : '$sportId'},
                                    pipeline: [
                                        {
                                            $match : {
                                                $expr : { $eq : ['$_id', '$$sportId'] }
                                            }
                                        }
                                    ],
                                    as : "sportDetails"
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    trainingId: "$_id",
                                    sportId: 1,
                                    trainingName: 1,
                                    coverImage: 1,
                                    address: 1,
                                    curriculum: 1,
                                    ageGroupFrom: 1,
                                    ageGroupTo: 1,
                                    proficiencyLevel: 1,
                                    coachesId: 1,
                                    localCountry: 1,
                                    startDate: 1,
                                    endDate: 1,
                                    days: 1,
                                    sessionTimeDuration: 1,
                                    sunday: 1,
                                    monday: 1,
                                    tuesday: 1,
                                    wednesday: 1,
                                    thursday: 1,
                                    friday: 1,
                                    saturday: 1,
                                    rating: 1,
                                    facilityId: 1,
                                    price: 1,
                                    minimumSession: 1,
                                    currency: 1,
                               },
                            },
                        ],
                        as: "trainingDetails"
                    }
                },
                {
                  $unwind : "$trainingDetails"
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
                    trainingsList: [
                      {
                        $project: {
                          _id: 1,
                          userId: 1,
                          trainingId: 1,
                          trainingDetails: "$trainingDetails",
                          sportDetails: "$sportDetails",
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

            let favouriteTrainings = {
            trainingsList: trainingsList,
            total: total || 0,
            };

            return SendResponse(
            res,
            {
                favouriteTrainings: favouriteTrainings,
            },
            "Favourite Trainings list",
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
    },

    getTrainingsList: async (req, res) => {

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
                $expr: {
                    $gte: [{
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
                isDeleted : false,
                status : true
            };

            const [allTrainings] = await Training.aggregate([
                {
                  $match: params // Use the provided params for filtering
                },
                {
                  $group: {
                    _id: null,
                    maxPrice: { $max: "$price" } // Calculate the maxPrice
                  }
                }
            ]);

            if (req.query.search) {
                params = Object.assign(params, {
                    trainingName: {
                        $regex: new RegExp(req.query.search, "i")
                    }
                })
            }
            let sportId = [];
            if (req.query.sportId && typeof req.query.sportId == "string") {
                sportId = req.query.sportId.split(",");

            } else {
                sportId = req.query.sportId;
            }
            if (sportId && sportId.length > 0) {
                let sportIds = sportId.map(x => ObjectId(x))
                params = Object.assign(params, {
                    sportId: {
                        $in: sportIds
                    }
                })
            }

            if(req.query.rating && req.query.rating != "" && req.query.rating != null){
                params = Object.assign(params, {
                    rating: {
                        $gte: Number(req.query.rating)
                    }
                })
            }

            if(req.query.proficiencyLevel && req.query.proficiencyLevel != "" && req.query.proficiencyLevel != null){
                params = Object.assign(params, {
                    proficiencyLevel: req.query.proficiencyLevel
                })
            }

            if(req.query.ageGroupFrom && req.query.ageGroupFrom != "" && req.query.ageGroupFrom != null && req.query.ageGroupTo && req.query.ageGroupTo != "" && req.query.ageGroupTo != null){
                params = Object.assign(params, {
                    $and : [
                        { ageGroupFrom: {
                            $gte: Number(req.query.ageGroupFrom)
                            }
                        },
                        { ageGroupTo: {
                            $lte: Number(req.query.ageGroupTo)
                            }
                        }
                    ]
                    
                })
            }
            

            if(req.query.priceFrom && req.query.priceFrom != "" && req.query.priceFrom != null && req.query.priceTo && req.query.priceTo != "" && req.query.priceTo != null){
                params = Object.assign(params, {
                    price : {
                        $gte : Number(req.query.priceFrom),
                        $lte : Number(req.query.priceTo)
                    },
                })
            }

            if(req.query.days && req.query.days != "" && req.query.days != null){
                let daysArray = req.query.days.split(',');
                params = Object.assign(params, {
                    days : { $in : daysArray },
                });
            }


            if (req.query.topRated && req.query.topRated == true) {
                sort = "rating"
                sort = {
                    [sort]: order == "desc" ? -1 : 1,
                };
            }
            const latitude = req.query.latitude ? parseFloat(req.query.latitude) : '';
            const longitude = req.query.longitude ? parseFloat(req.query.longitude) : '';
            const minDistance = req.query.minDistance ? parseFloat(req.query.minDistance) : '';
            const maxDistance = req.query.maxDistance ? parseFloat(req.query.maxDistance) : '';
            let cond = {
                $match: {}
            }
            if (latitude && longitude  && maxDistance) {
                cond = {
                    $geoNear: { 
                        near: {
                            type: "Point",
                            coordinates: [longitude,latitude],
                        },
                        distanceField: "distance",
                        minDistance: minDistance,
                        maxDistance: maxDistance, //in metres
                        includeLocs: "dist.location",
                        spherical: true,
                        key: "location",
                    },
                }
            }
            
           
            if (latitude && longitude && !minDistance && !maxDistance) {
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

            if(req.query.country && req.query.country != "" && req.query.country != null){
                params = Object.assign(params, {
                    country: req.query.country
                })
            }

            if(req.query.state && req.query.state != "" && req.query.state != null){
                params = Object.assign(params, {
                    state: req.query.state
                })
            }

            if(req.query.city && req.query.city != "" && req.query.city != null){
                params = Object.assign(params, {
                    city: req.query.city
                })
            }

            const [{
                trainingList,
                total
            }] = await Training.aggregate([
                cond,
                {
                    $match: params
                },
                {
                    $lookup : {
                       from : "sports",
                       localField : "sportId",
                       foreignField : "_id",
                       as : "sportDetails"
                    }
                },
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
                        trainingList: [
                            {
                                $project: {
                                    _id: 1,
                                    trainingId: "$_id",
                                    trainingName: 1,
                                    address: 1,
                                    coverImage: 1,
                                    // location: 1,
                                    location: {
                                        "type" : "$location.type",
                                        "coordinates": [
                                        { $arrayElemAt: ["$location.coordinates", 1] },
                                        { $arrayElemAt: ["$location.coordinates", 0] },
                                        ]
                                    },
                                    startDate: 1,
                                    endDate: 1,
                                    localCountry: 1,
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
                                    price: 1,
                                    sportDetails : "$sportDetails"
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
                        }
                    },
                },

            ]);
            let trainingData = {
                trainingList: trainingList,
                total: total || 0,
                maxPrice : allTrainings.maxPrice || 0
            }
            return SendResponse(
                res, {
                    trainingData: trainingData
                },
                "Training details",
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
    getTrainingDetails: async (req, res) => {
        try {
            const v = new Validator(req.query, {
                trainingId: "required"
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }

            if( !await Training.findOne({ _id : ObjectId(req.query.trainingId), isDeleted : false})){
                return SendResponse(
                    res,
                    { isBoom: true },
                    "No such training found",
                    422
                  );
            }

            let [trainingDetails] = await Training.aggregate([{
                    $match: {
                        _id: ObjectId(req.query.trainingId)
                    }
                },
                // {
                //     $lookup: {
                //         from: "trainingslots",
                //         localField: "_id",
                //         foreignField: "trainingId",
                //         as: "trainingSlots"
                //     }
                // },
                {
                    $lookup : {
                       from : "favourites",
                       let : { 'trainingId' : '$_id' },
                       pipeline: [{
                        $match : {
                            $expr : {
                                $eq : ['$trainingId', '$$trainingId']
                            },
                            userId : ObjectId(req.user.id),
                            status : true
                        }
                       }],
                       as : "isFavouriteTraining"
                    }
                },
                {
                    $lookup: {
                        from: 'trainingslots',
                        let: {
                            'traingId': '$_id'
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ['$trainingId', '$$traingId']
                                    },
                                    isSelected: true
                                }
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
                                    date: 1,
                                    day: 1,
                                    slot: 1,
                                    slotStartTime: 1,
                                    slotEndTime: 1,
                                    slotStartTimeUtc: 1,
                                    slotEndTimeUtc: 1,
                                    localCountry: 1,
                                    maximumStudent: 1,
                                    totalBooking: 1
                                }
                            }
                        ],
                        'as': 'trainingSlots'
                    }
                },
                {
                    $lookup: {
                        from: 'sports',
                        let: {
                            'sportId': '$sportId'
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$sportId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    sports_name: 1,
                                    image: 1,
                                    selected_image: 1

                                }
                            }
                        ],
                        'as': 'sportDeatils'
                    }
                },
                {
                    $unwind:"$sportDeatils"
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
                            location: 1
                          },
                        },
                      ],
                      as: "facilityBranchDetails",
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
                                    about: 1
                                }
                            }
                        ],
                        'as': 'coaches'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        trainingId: "$_id",
                        sportId: 1,
                        trainingName: 1,
                        coverImage: 1,
                        address: 1,
                        curriculum: 1,
                        ageGroupFrom: 1,
                        ageGroupTo: 1,
                        proficiencyLevel: 1,
                        coachesId: 1,
                        localCountry: 1,
                        startDate: 1,
                        endDate: 1,
                        days: 1,
                        sessionTimeDuration: 1,
                        sunday: 1,
                        monday: 1,
                        tuesday: 1,
                        wednesday: 1,
                        thursday: 1,
                        friday: 1,
                        saturday: 1,
                        rating: 1,
                        trainingSlots: "$trainingSlots",
                        sport: "$sportDeatils",
                        coaches: "$coaches",
                        facilityId: 1,
                        facilityBranchDetails: "$facilityBranchDetails",
                        price: 1,
                        minimumSession: 1,
                        maximumSession: 1,
                        currency: 1,
                        inclusiveTax: 1,
                        tax: 1,
                        isFavouriteTraining: {
                            $cond : {
                                if : {
                                    $size : "$isFavouriteTraining"
                                },
                                then : true,
                                else : false
                            }
                        }
                    }
                }
            ]);

            trainingDetails.allSlotsFull = false;
            
            const currentUtcDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
          
            if ( trainingDetails.trainingSlots.length && (!trainingDetails.trainingSlots.find(item => parseInt(item.maximumStudent) != parseInt(item.totalBooking) && moment(item.slotStartTimeUtc).format('YYYY-MM-DD HH:mm:ss') >= currentUtcDateTime))){
                trainingDetails.allSlotsFull = true;
            }

            const Views = await RecentViews.find({
                userId : ObjectId(req.user.id)
            }).exec(); 

            if( Views.length > 10){
               await RecentViews.findByIdAndDelete(Views[0]._id);
            }
            let previousView = await RecentViews.find({ 
                trainingId : ObjectId(req.query.trainingId),
                userId : ObjectId(req.user.id)
            });

            if( !previousView.length ){
                await RecentViews.create({
                    trainingId : req.query.trainingId,
                    userId : req.user.id,
                    facilityId : trainingDetails.facilityId
                });
            } else{
               await RecentViews.findByIdAndUpdate(previousView._id,{
                  $set : {
                    viewedOn : Date.now()
                  }
               });
            }

            let trainingGroupExit = await Chat.findOne({
            trainingId : ObjectId(req.params.trainingId),
            chatType : 6,
            status : true
            }).lean();
    
            let trainingAdminGroupExit = await Chat.findOne({
            trainingId : ObjectId(req.params.trainingId),
            chatType : 7,
            }).lean();
            
            let training = await Training.findById(req.params.trainingId);
            trainingDetails.trainingGroupchat = trainingGroupExit;
            if (trainingDetails.trainingGroupchat && Object.keys(trainingDetails.trainingGroupchat).length > 0) {
                trainingDetails.trainingGroupchat.training = training;
            }
            trainingDetails.trainingAdminGroupChat = trainingAdminGroupExit;
            if (trainingDetails.trainingAdminGroupChat && Object.keys(trainingDetails.trainingAdminGroupChat).length > 0) {
                trainingDetails.trainingAdminGroupChat.training = training;
            }

            return SendResponse(
                res, {
                    trainingId : req.query.trainingId,
                    trainingDetails: trainingDetails
                },
                "Training details",
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
  
    getPlatformFees: async(req,res) => {
        try{

            const v = new Validator(req.body, {
                trainingId: "required",
                startDate: "required",
                endDate: "required"

            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }

            const trainingDetails = await Training.findOne({ 
                _id : ObjectId(req.body.trainingId),
                isDeleted : false
            });
            if( !trainingDetails ){
                return SendResponse(
                    res,
                    { isBoom: true },
                    "No such training found",
                    422
                  );
            }

            let commissionDetails;
            let sportCommissionDetails = await Commission.findOne({
            type: "platformFees",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "sports",
            sportId: ObjectId(trainingDetails.sportId)
            });
            if(sportCommissionDetails){
            commissionDetails = sportCommissionDetails;
            }

            let countryCommissionDetails = await Commission.findOne({
            type: "platformFees",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "country",
            sportId: ObjectId(trainingDetails.sportId),
            country: trainingDetails.country
            });
            if(countryCommissionDetails){
            commissionDetails = countryCommissionDetails;
            }

            let stateCommissionDetails = await Commission.findOne({
            type: "platformFees",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "state",
            sportId: ObjectId(trainingDetails.sportId),
            country: trainingDetails.country,
            state: trainingDetails.state
            });
            if(stateCommissionDetails){
            commissionDetails = stateCommissionDetails;
            }

            let cityCommissionDetails = await Commission.findOne({
            type: "platformFees",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "city",
            sportId: ObjectId(trainingDetails.sportId),
            country: trainingDetails.country,
            state: trainingDetails.state,
            city: trainingDetails.city
            });
            if(cityCommissionDetails){
            commissionDetails = cityCommissionDetails;
            }

            let facilityCommissionDetails = await Commission.findOne({
            type: "platformFees",
            status : true,
            applicableTo : "trainingSessions",
            criteria : "facility",
            sportId: ObjectId(trainingDetails.sportId),
            country: trainingDetails.country,
            // state: trainingDetails.state,
            // city: trainingDetails.city,
            $expr: {
                $in: [ObjectId(trainingDetails.facilityId), "$facilityId"],
            },
            });
            if(facilityCommissionDetails){
            commissionDetails = facilityCommissionDetails;
            }
            if(!commissionDetails){  
                return SendResponse(
                    res, {},
                    "No platform fees found",
                    200
                );
            }else{
                if((new Date(req.body.startDate) <= new Date(commissionDetails.dateTo)) && (new Date(req.body.endDate) >= new Date(commissionDetails.dateFrom))){
                    return SendResponse(
                        res, {
                            commissionDetails : commissionDetails
                        },
                        "Commission Details",
                        200
                    );
                }else{
                    return SendResponse(
                        res, {},
                        "No platform fees found",
                        200
                    );
                }
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
    }

}