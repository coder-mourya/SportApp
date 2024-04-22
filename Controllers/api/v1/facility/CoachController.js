const Facility = require("../../../../models/facility");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const mail = require("../../../../services/mailServices");
const bcrypt = require("bcrypt");
const {
    Validator
} = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const FileUpload = require('../../../../services/upload-file');
const generateRandomString= (length)=>{
    // const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    // let randomString = '';
  
    // for (let i = 0; i < length; i++) {
    //   const randomIndex = Math.floor(Math.random() * characters.length);
    //   randomString += characters.charAt(randomIndex);
    // }

    const numbers = '0123456789';
    const alphabets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specials = '!@#$%^&*';

    let randomString = '';

    // Ensure at least one number, one alphabet, and one special character
    randomString += numbers.charAt(Math.floor(Math.random() * numbers.length));
    randomString += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    randomString += specials.charAt(Math.floor(Math.random() * specials.length));

    // Fill the remaining characters randomly
    for (let i = 3; i < length; i++) {
        const allCharacters = numbers + alphabets + specials;
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        randomString += allCharacters.charAt(randomIndex);
    }

    // Shuffle the string to randomize the order
    randomString = randomString.split('').sort(() => Math.random() - 0.5).join('');  

    return randomString;
  }
  
module.exports = {
    getCoaches: async (req, res) => {
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
                $expr : 
                {
                    $in: [ ObjectId(req.user.id), "$facilityAdminId" ],
                },
                isDeleted: false,
                status: true
            };
            if (req.query.search != "" && req.query.search != null) {
                params = Object.assign(params, {
                    name: {
                        $regex: ".*" + req.query.search + ".*",
                        $options: "i"
                    },
                });
            }

            if (req.query.sportId && req.query.sportId != "") {
                params = Object.assign(params, {
                    chosenSports: ObjectId(req.query.sportId)
                });
            }
            const [{
                coachList,
                total
            }] = await Facility.aggregate([{
                    $match: params
                },
                {
                    $lookup: {
                        from: 'sports',
                        let: {
                            'sportId': '$chosenSports'
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$sportId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    sports_name: 1,
                                    selected_image: 1
                                }
                            }
                        ],
                        'as': 'sportDetails'
                    }
                },
                {
                    $lookup : {
                        from: 'trainings',
                        localField: '_id',
                        foreignField: 'coachesId',
                        as : 'trainingsList'
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
                        coachList: [{
                                $project: {
                                    _id: 1,
                                    createdAt: 1,
                                    name: 1,
                                    coverImage: 1,
                                    profileImage: 1,
                                    countryCode: 1,
                                    countryAlphaCode: 1,
                                    mobile: 1,
                                    email: 1,
                                    address: 1,
                                    about: 1,
                                    facilityAdminId:1,
                                    sports: "$sportDetails",
                                    rating: 1,
                                    isAvailabaleInTrainings : {
                                        $cond : {
                                            if : {
                                                $size:  {
                                                $ifNull: ["$trainingsList", []]
                                                }
                                            },
                                            then : true,
                                            else : false
                                        }
                                    }
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
            let coachData = {
                coachList: coachList,
                total: total || 0
            }
            return SendResponse(
                res, {
                    coachData: coachData
                },
                "Coach list",
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

    getCoachDetails : async (req, res) => {
      try{
         let Coach = await Facility.findById(req.params.id);
         if ( !Coach) {
            return SendResponse(
                res,
                { isBoom : true },
                "No such coach found",
                422
            )
         }

         const [CoachDetails] = await Facility.aggregate([
            {
                $match : {
                    _id : ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'sports',
                    let: {
                        'sportId': '$chosenSports'
                    },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $in: ['$_id', '$$sportId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                sports_name: 1,
                                selected_image: 1
                            }
                        }
                    ],
                    'as': 'sportDetails'
                }
            },
            {
                $lookup : {
                    from: 'trainings',
                    localField: '_id',
                    foreignField: 'coachesId',
                    as : 'trainingsList'
                }
            },
            {
                $project : {
                    _id: 1,
                    createdAt: 1,
                    name: 1,
                    coverImage: 1,
                    profileImage: 1,
                    countryCode: 1,
                    countryAlphaCode: 1,
                    country : 1,
                    state : 1,
                    city : 1,
                    mobile: 1,
                    email: 1,
                    address: 1,
                    about: 1,
                    pincode: 1,
                    facilityAdminId:1,
                    sports: "$sportDetails",
                    rating : 1,
                    isAvailabaleInTrainings : {
                        $cond : {
                            if : {
                                $size:  {
                                $ifNull: ["$trainingsList", []]
                                }
                            },
                            then : true,
                            else : false
                        }
                    }
                }
            }
        ]);

        return SendResponse(
            res,
            { CoachDetails : CoachDetails },
            "Coach Details",
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

    addNewCoach: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                name: "required",
                countryAlphaCode: "required",
                countryCode: "nullable",
                mobile: "nullable",
                email: "required|email",
                address: "required",
                country: "required",
                // state: "required",
                // city: "required",
                // pincode: "required",
                latitude: "nullable",
                longitude: "nullable",
                about: "nullable",
                chosenSports: "required"

            });

            if (req.user.userType == 'coach')
                return SendResponse(res, {
                    isBoom: true
                }, 'You have not rights to add coach', 422);

            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let facilityAdmin = await Facility.findById(req.user.id);
            let coach = await Facility.findOne({ email : req.body.email , userType : "coach", isDeleted : false});

            if( coach ){
               await Facility.findByIdAndUpdate( coach._id , { 
                $push : {
                    facilityAdminId : ObjectId(req.user.id)
                }
               })

               //send email to member to accept reauest
                let mailSend = mail.sendTemplate({
                    email: req.body.email,
                    subject: `Sports Nerve`,
                    locale: "en",
                    template: "coachCredentials.ejs",
                    name : req.body.name, 
                    facilityAdmin : req.user.name,
                    facilityAdminEmail : facilityAdmin.email,
                    facilityAdminMobile : `${facilityAdmin.countryCode != "null" ? (facilityAdmin.countryCode != null ? facilityAdmin.countryCode : '') : ''} ${facilityAdmin.mobile}`
                //     html: `Hi ${req.body.name}, <br><br>${req.user.name} added you as a coach.<br><br>
                // <br><br>
                // Thanks & Regards,
                // <br>
                // Sports Nerve Team
                // `,
                });


                if (!mailSend) {
                    return SendResponse(res, {
                        isBoom: true
                    }, "Internal server error", 500);
                }

               return SendResponse(
                    res, {},
                    i18n.__('success'),
                    200
                );
            }
            else{
                const v2 = new Validator(req.files, {
                    coverImage: 'required|mime:jpg,png',
                    profileImage: 'required|mime:jpg,png'
                });
                const matched2 = await v2.check();
                if (!matched2) {
                    let first_key = Object.keys(v.errors)[0];
                    let err = v.errors[first_key]["message"];
                    return SendResponse(res, {
                        isBoom: true
                    }, err, 422);
                }
                if (req.body.latitude && req.body.longitude) {
                    let coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
                    let location = {
                        type: "Point",
                        coordinates,
                    };
                    req.body.location = location;
                }
                req.body.facilityAdminId = [ObjectId(req.user.id)];
                if (typeof req.body.chosenSports == "string") {
                    req.body.chosenSports = req.body.chosenSports.split(",");

                }
                if (req.files && req.files.coverImage) {
                    let Image = await FileUpload.aws(req.files.coverImage);
                    req.body.coverImage = process.env.AWS_URL + Image.Key;
                }
                if (req.files && req.files.profileImage) {
                    let Image = await FileUpload.aws(req.files.profileImage);
                    req.body.profileImage = process.env.AWS_URL + Image.Key;
                }
                req.body.userType = 'coach';
                // let password = Math.random().toString(36).slice(2, 10)
                let randomString = generateRandomString(8);
                const hashPass = await bcrypt.hashSync(randomString, 4);
                req.body.password = hashPass;
                req.body.isEmailVerify = true;
                await Facility.create(req.body);

                //send email to member to accept reauest
                let mailSend = mail.sendTemplate({
                    email: req.body.email,
                    subject: `Sports Nerve`,
                    locale: "en",
                    template: "coachCredentials.ejs",
                    name : req.body.name, 
                    facilityAdmin : req.user.name,
                    userName : req.body.email,
                    password : randomString,
                    facilityAdminEmail : facilityAdmin.email,
                    facilityAdminMobile : `${facilityAdmin.countryCode != "null" ? (facilityAdmin.countryCode != null ? facilityAdmin.countryCode : '') : ''} ${facilityAdmin.mobile}`
                //     html: `Hi ${req.body.name}, <br><br>${req.user.name} added as a coach.<br><br>
                //     Your login credential <br><br>
                //     Username : ${req.body.email},<br><br>
                //     Password : ${randomString}
                // <br><br>
                // Thanks & Regards,
                // <br>
                // Sports Nerve Team
                // `,
                });
                if (!mailSend) {
                    return SendResponse(res, {
                        isBoom: true
                    }, "Internal server error", 500);
                }
                return SendResponse(
                    res, {},
                    i18n.__('success'),
                    200
                );
            }
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
    deleteCoach: async (req, res) => {
        try {
            if (!req.params.coachId) {
                return SendResponse(res, {
                    isBoom: true
                }, "Please enter coach id", 422);
            }
            let user = await Facility.findById(req.params.coachId);
            if (!user) {
                return SendResponse(res, {
                    isBoom: true
                }, "No data found", 422);
            }
            await Facility.findByIdAndUpdate(req.params.coachId, {
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
    updateCoachProfile: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                // name: "required",
                // countryAlphaCode: "nullable",
                // countryCode: "nullable",
                // mobile: "nullable",
                // address: "required",
                // country: "required",
                // state: "required",
                // city: "required",
                // pincode: "required",
                // latitude: "nullable",
                // longitude: "nullable",
                // about: "nullable",
                // chosenSports: "required"

            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }

            // const v2 = new Validator(req.files, {
            //     coverImage: 'required|mime:jpg,png',
            //     profileImage: 'required|mime:jpg,png'
            // });
            // const matched2 = await v2.check();
            // if (!matched2) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let coach = await Facility.findById(req.user.id);
            if (!coach) {
                return SendResponse(res, {
                    isBoom: true
                }, "No data found", 422);
            }
            //incase email come from frontend
            if (req.body.email) {
                delete req.body.email
            }
            if (req.body.latitude && req.body.longitude) {
                let coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
                let location = {
                    type: "Point",
                    coordinates,
                };
                req.body.location = location;
            }

            if (typeof req.body.chosenSports == "string") {
                req.body.chosenSports = req.body.chosenSports.split(",");

            }
            if (req.files && req.files.coverImage) {
                // await FileUpload.unlinkFile(coach.coverImage.slice(50));
                let Image = await FileUpload.aws(req.files.coverImage);
                req.body.coverImage = process.env.AWS_URL + Image.Key;
            }
            if (req.files && req.files.profileImage) {
                // await FileUpload.unlinkFile(coach.profileImage.slice(50));
                let Image = await FileUpload.aws(req.files.profileImage);
                req.body.profileImage = process.env.AWS_URL + Image.Key;
            }

            await Facility.findByIdAndUpdate(req.user.id, {
                $set: req.body
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
    }
}