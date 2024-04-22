const User = require("../../../../models/user");
const Member = require("../../../../models/member");
const Country = require("../../../../models/countrie");
const {
    Validator
} = require("node-input-validator");
const auth = require("../../../../middleware/auth");
const SendResponse = require("../../../../apiHandler");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const FileUpload = require("../../../../services/upload-file");
const bcrypt = require("bcrypt");
const member = require("../../../../models/member");
const {dump}=require("../../../../services/dump");


module.exports = {
    getProfile: async (req, res) => {
        try {
            let userDetails = await User.findById(req.user.id).lean();
            let countryDetails = await Country.findOne({
                name : userDetails.country
            });

            // userDetails.phoneCode = countryDetails.phoneCode;
            userDetails.countryCode = countryDetails.sortname;
            
            return SendResponse(
                res, {
                    userDetails: userDetails
                },
                "User profile",
                200
            );
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    },
    updateProfile: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                fullName: "required",
                // countryCode: "required",
                mobile: "required",
                dateOfBirth: "required"
            });
            const CheckValidation = await v.check();
            if (!CheckValidation) {
                let first_key = Object.keys(v.errors)[0];
                let err = v.errors[first_key]["message"];
                return SendResponse(res, {
                    isBoom: true
                }, err, 422);
            }
            
            if (req.files && req.files.profileImage) {
                let profileImage = await FileUpload.aws(req.files.profileImage);
                req.body.profileImage = process.env.AWS_URL + profileImage.Key;

               await Member.updateMany(
                {   memberId : ObjectId(req.user.id), 
                    isNormalMember : true,
                    image : null
                },
                {
                    $set : {
                     image : process.env.AWS_URL + profileImage.Key
                    }
                });

                await Member.updateOne(
                    {
                        memberId : ObjectId(req.user.id),
                        creatorId : ObjectId(req.user.id),
                        isFamilyMember : true,
                        relationWithCreator : "self"
                    },
                    {
                        $set : {
                            image : process.env.AWS_URL + profileImage.Key
                        }
                    }
                );
            
            }
            await User.findByIdAndUpdate(req.user.id, {
                $set: req.body
            });

            return SendResponse(res, {

            }, "Profile updated", 200);
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something went wrong,please try again",
                500
            );
        }
    },
    changePassword: async (req, res) => {
        try {
            const v = new Validator(req.body, {
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
            let user = await User.findById(req.user.id);
            if (!user) {
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "User not found",
                    422
                );
            }
            const isPasswordMatch = await auth.checkPassword(req.body.oldPassword, user);
            if (!isPasswordMatch) {
                return SendResponse(
                    res, {
                        isBoom: true
                    },
                    "Wrong Old Password",
                    422
                );
            }
            const hashPass = await bcrypt.hashSync(req.body.newPassword, 4);
            await User.findByIdAndUpdate(req.user.id, {
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
            dump(error);
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