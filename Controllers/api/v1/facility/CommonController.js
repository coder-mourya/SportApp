const Facility = require("../../../../models/facility");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const {
    Validator
} = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const bcrypt = require("bcrypt");
const auth = require("../../../../middleware/auth");
const CMS = require("../../../../models/cms");
const Support = require('../../../../models/helpQuerie');
module.exports = {
    getProfile: async (req, res) => {
        try {
            const v = new Validator(req.query, {
                userType: "required:in,facility_admin,coach"
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let facility = await Facility.findOne({
                _id: ObjectId(req.user.id),
                userType: req.query.userType
            });
            if (!facility)
                return SendResponse(res, {
                    isBoom: true
                }, "User not found", 422);

            let data = {};
            if (req.query.userType == "facility_admin") {
                data = {
                    _id: facility._id,
                    name: facility.name,
                    adminName: facility.adminName,
                    email: facility.email,
                    countryAlphaCode: facility.countryAlphaCode,
                    countryCode: facility.countryCode,
                    mobile: facility.mobile,
                    userType: facility.userType,
                    profileImage: facility.profileImage,
                }
            } else {
                data = {
                    _id: facility._id,
                    name: facility.name,
                    coverImage: facility.coverImage,
                    profileImage: facility.profileImage,
                    countryAlphaCode: facility.countryAlphaCode,
                    countryCode: facility.countryCode,
                    mobile: facility.mobile,
                    email: facility.email,
                    address: facility.address,
                    country: facility.country,
                    state: facility.state,
                    city: facility.city,
                    pincode: facility.pincode,
                    about: facility.about,
                    userType: facility.userType
                }
            }
            return SendResponse(
                res, data,
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
    //change password for both facility admin and coach
    changePassword: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                userType: "required:in,facility_admin,coach",
                oldPassword: "required",
                newPassword: "required|same:confirmPassword",
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let facility = await Facility.findOne({
                _id: ObjectId(req.user.id),
                userType: req.body.userType
            });
            if (!facility)
                return SendResponse(res, {
                    isBoom: true
                }, "User not found", 422);
            const isPasswordMatch = await auth.checkPassword(req.body.oldPassword, facility);
            if (!isPasswordMatch) {
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "Wrong Old Password",
                    422
                );
            }
            if( req.body.oldPassword == req.body.newPassword){
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "New and Old Password Can't Be Same",
                    422
                );
            }
            const hashPass = await bcrypt.hashSync(req.body.newPassword, 4);
            await Facility.findByIdAndUpdate(req.user.id, {
                $set: {
                    password: hashPass
                }
            });
            return SendResponse(
                res, {

                },
                "Your password updated",
                200
            );
        } catch (error) {
            dump('error', error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    },
    getCms: async (req, res) => {
        try {
            let cms = await CMS.findOne({
                userType: req.query.userType,
                type: req.query.type
            }, {
                _id: 1,
                userType: 1,
                type: 1,
                slug: 1,
                description: 1,
                updatedAt: 1
            });
            return SendResponse(
                res, {
                    cms: cms
                },
                "cms data",
                200
            );
        } catch (error) {
            dump('error', error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    },
    postHelpQuery: async (req, res) => {
        try {

            const v = new Validator(req.body, {
                title: "required",
                message: "required",
                suggestion: "nullable"
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            let userDetails = await Facility.findById(req.user.id);
            req.body.mobile = userDetails.mobile;
            req.body.phoneCode = userDetails.phoneNumericCode;
            req.body.userType = req.user.userType;
            req.body.senderId = req.user.id;
            await Support.create(req.body);
            return SendResponse(
                res, {},
                "Your query submitted successfully",
                200
            );
        } catch (error) {
            dump('error', error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    }
}