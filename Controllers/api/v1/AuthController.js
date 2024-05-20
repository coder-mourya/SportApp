const {
  Mongoose
} = require("mongoose");
const Boom = require("boom");
const User = require("../../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require('i18n');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
var randtoken = require("rand-token");
const auth = require("../../../middleware/auth");
const utils = require("../../../middleware/utils");
const constant = require("../../../constants");
const appVersion = require("../../../models/appVersion");
const {
  Validator
} = require("node-input-validator");
const SendResponse = require("../../../apiHandler");
const mail = require("../../../services/mailServices");
const Country = require("../../../models/countrie");
const State = require("../../../models/state");
const City = require("../../../models/citie");
const Member = require("../../../models/member");
const {dump}=require("../../../services/dump");


module.exports = {

  getVersion: async(req, res) => {
    try{
      const v = new Validator(req.query, {
        type: "required",
        appType: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      let versionDetails = await appVersion.findOne({
        type : req.query.type,
        appType : req.query.appType
      });

      return SendResponse(
        res, {
          versionDetails: versionDetails
        },
        i18n.__('success'),
        200
      );

    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        i18n.__('Something_went_wrong_please_try_again'),
        500
      );
    }
  },
  //**********User register*********** */
  register: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        fullName: "required",
        mobile: "required",
        email: "required|email",
        countryCode: "required",
        phoneCode: "required",
        phoneNumericCode: "required",
        dateOfBirth: "required",
        deviceType: "required|in:ios,android,web",
        userType: "required|in:user,facility_admin,facility_manager,coach",
        country: "required",
        password: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      const hashPass = await bcrypt.hashSync(req.body.password, 4);
      req.body.password = hashPass;

      //insert user
      const user = new User(req.body);
      const randomToken = randtoken.generate(50);
      await user.save();

      const members = await Member.updateMany({
        email: req.body.email
      }, {
        $set: {
          memberId: ObjectId(user._id)
        }
      });

      await Member.create({
        creatorId : user._id,
        memberId : user._id,
        fullName : user.fullName,
        gender : user.gender ? user.gender.toLowerCase() : '',
        dob : user.dateOfBirth,
        requestStatus : 2,
        email : user.email,
        isFamilyMember : true,
        relationWithCreator : "self"
      });

      const token = jwt.sign({
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile
        },
        `${constant.jwtSecret}`, {
          expiresIn: "365d",
        }
      );

      await User.findByIdAndUpdate( user._id, { token : token })
      //send email verification link
      let mailSend = mail.sendTemplate({
        email: req.body.email,
        subject: "Sports Nerve Account Verification Request",
        locale: "en",
        template: "verifyEmail.ejs",
        name : user.fullName, 
        link : `${process.env.Url}/api/v1/auth/account_verification/${token}`
        // html: `Dear ${user.fullName}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
        //        Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
        //     To verify your email, please click on the button below: <br><br>
        //     <a href= "${process.env.Url}/api/v1/auth/account_verification/${token}">Verify Email</a><br><br>
        //     By verifying your email, you'll have access to all the exciting features our platform has to offer. You can build your team, manage team events, Split and manage Payments, explore exciting training opportunities, check your training progress and many more. <br><br>
        //     We can't wait for you to join us and start exploring our platform. If you have any questions or concerns, please don't hesitate to reach out to our support team.
        //     <br><br>
        //     Thank you 
        //     for choosing us and we look forward to partner with you in your sports activities!
        //     <br><br> 
        //     Best regards,
        //     <br>
        //     Team Sports Nerve
        //     `,
      });
      if (!mailSend) {
        return SendResponse(res, {
          isBoom: true
        }, i18n.__('Internal_server_error'), 500);
      }

      return SendResponse(
        res, {
          user: user,
          message: i18n.__('Please_check_your_email_for_email_verifaction')
        },
        i18n.__('User_created_successfully'),
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        i18n.__('Something_went_wrong_please_try_again'),
        500
      );
    }
  },


  // *********** Resend Verification Link *******************//
  sendLink: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "User not found",
          422
        );
      } else {

        if (user.isEmailVerify == true) {
          return SendResponse(
            res, {
              isBoom: true
            },
            "This email is already verified",
            422
          );
        }

        const token = jwt.sign({
            id: user._id,
            fullName: user.fullName,
            mobile: user.mobile
          },
          `${constant.jwtSecret}`, {
            expiresIn: "365d",
          }
        );



        //send email verification link
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Sports Nerve Account Verification Request",
          locale: "en",
          template: "verifyEmail.ejs",
          name : user.fullName, 
          link : `${process.env.Url}/api/v1/auth/account_verification/${token}`,
          // html: `Dear ${user.fullName}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
          //       Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
          //     To verify your email, please click on the button below: <br><br>
          //     <a href= "${process.env.Url}/api/v1/auth/account_verification/${token}">Verify Email</a><br><br>
          //     By verifying your email, you'll have access to all the exciting features our platform has to offer. You can build your team, manage team events, Split and manage Payments, explore exciting training opportunities, check your training progress and many more. <br><br>
          //     We can't wait for you to join us and start exploring our platform. If you have any questions or concerns, please don't hesitate to reach out to our support team.
          //     <br><br>
          //     Thank you 
          //     for choosing us and we look forward to partner with you in your sports activities!
          //     <br><br> 
          //     Best regards,
          //     <br>
          //     Team Sports Nerve
          //     `,
        });
        if (!mailSend) {
          return SendResponse(res, {
            isBoom: true
          }, i18n.__('Internal_server_error'), 500);
        }
        
        user.token = token;
        user.isEmailVerify = false;
        await user.save();

        return SendResponse(
          res, {
            message: i18n.__('Please_check_your_email_for_email_verifaction')
          },
          "Email Updated successfully",
          200
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        i18n.__('Something_went_wrong_please_try_again'),
        500
      );
    }
  },


  // *********** Resend Verification Link *******************//
  resendLink: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required",
        id : "required"
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      const user = await User.findById(req.body.id);

      if (!user) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "User not found",
          422
        );
      } else {

        const token = jwt.sign({
            id: user._id,
            fullName: user.fullName,
            mobile: user.mobile
          },
          `${constant.jwtSecret}`, {
            expiresIn: "365d",
          }
        );



        //send email verification link
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Sports Nerve Account Verification Request",locale: "en",
          template: "verifyEmail.ejs",
          name : user.fullName, 
          link : `${process.env.Url}/api/v1/auth/account_verification/${token}`,
          // html: `Dear ${user.fullName}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
          //       Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
          //     To verify your email, please click on the button below: <br><br>
          //     <a href= "${process.env.Url}/api/v1/auth/account_verification/${token}">Verify Email</a><br><br>
          //     By verifying your email, you'll have access to all the exciting features our platform has to offer. You can build your team, manage team events, Split and manage Payments, explore exciting training opportunities, check your training progress and many more. <br><br>
          //     We can't wait for you to join us and start exploring our platform. If you have any questions or concerns, please don't hesitate to reach out to our support team.
          //     <br><br>
          //     Thank you 
          //     for choosing us and we look forward to partner with you in your sports activities!
          //     <br><br> 
          //     Best regards,
          //     <br>
          //     Team Sports Nerve
          //     `,
        });
        if (!mailSend) {
          return SendResponse(res, {
            isBoom: true
          }, i18n.__('Internal_server_error'), 500);
        }
        
        user.token = token;
        user.isEmailVerify = false;
        user.email = req.body.email;
        await user.save();

        return SendResponse(
          res, {
            message: i18n.__('Please_check_your_email_for_email_verifaction')
          },
          "Email Updated successfully",
          200
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        i18n.__('Something_went_wrong_please_try_again'),
        500
      );
    }
  },


  // *********Verify Account********* /
  verifyEmail: async (req, res) => {
    jwt.verify(req.params.token, `${constant.jwtSecret}`, async function (err, decoded) {
      if (err) {
        // if err occurs, token has expired
        dump(err);
        res.status(422).send("<h1> The link has been expired or invalid </h1>");
      } else {

        dump(decoded);
        let user = await User.findOne({
          _id: decoded.id,
          token: req.params.token, 
        });

        if ( !user ) {
          res
            .status(422)
            .send("<h1> The link has been expired or invalid </h1>");
        }

        if (user.isEmailVerify == true) {
          res.status(422).send("<h1> This link has been expired.You have already verified your account. </h1>");
        }

        // else all ok, verify email now

        await User.updateOne({
            _id: decoded.id
          }, {
            isEmailVerify: true,
          }, )
          .then((flag) => {
            if (flag) {
              res.status(201)
                .send(`<script>window.location.href='${process.env.APP_URL}?&&email=${user.email}'</script>`);
            }
          })
          .catch((err) => {
            dump(err);
            return SendResponse(
              res, {
                isBoom: true
              },
              i18n.__('Something_went_wrong_please_try_again'),
              500
            );
          })
      }
    });
  },





  //**********User Login************ */
  login: async (req, res) => {
    try {
      let v;
      v = new Validator(req.body, {
        email: "required",
        password: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }
      let data = req.body;
      const user = await User.findOne({
        email: data.email,
        status: true,
        isDeleted: false
      }).populate('chosenSports');
      
      if (!user) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "Please enter the registered email",
          422
        );
      }
      
      if (user && user.isDeleted == true) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "User not found",
          422
        );
      }
     

      const isPasswordMatch = await auth.checkPassword(data.password, user);

      if (!isPasswordMatch) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "Wrong Password",
          422
        );
      }

      if (user && user.status == false) {
        return SendResponse(
          res, {
            isBoom: true
          },
          "User Blocked",
          422
        );
      }

      if (user && user.isEmailVerify == false) {
        return SendResponse(
          res, {
            isEmailVerify: false
          },
          "Please verify your email first",
          200
        );
      }
      const token = jwt.sign({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          deviceToken: user.deviceToken,
          notificationStatus: user.notificationStatus,
        },
        `${constant.jwtSecret}`, {
          expiresIn: "365d",
        }
      );

      if (user.chosenSports.length > 0) {
        user.sportsSelection = true;
      } else {
        user.sportsSelection = false;
      }
      
      user.token = token;
      user.deviceToken = req.body.deviceToken;
      user.lastLoginTime = Date.now();
      await user.save();
    
      const members = await Member.updateMany({
        email: req.body.email
      }, {
        $set: {
          memberId: ObjectId(user._id)
        }
      });

      return SendResponse(
        res, {
          user: user
        },
        i18n.__('User_logged_in_successfully'),
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        i18n.__('Something_went_wrong_please_try_again'),
        500
      );
    }
  },

  logout: async(req,res) =>{
    try{
      let userDetails = await User.findOne({
        _id : ObjectId(req.user.id),
        isDeleted : false,
        status : true
      });

      if(!userDetails){
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "User not found",
          422
        );
      }

      const token = jwt.sign(
        {
          id: userDetails._id,
          name: userDetails.name,
          email: userDetails.email,
          deviceToken: userDetails.deviceToken,
          notificationStatus: userDetails.notificationStatus,
          userType: userDetails.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );

      await User.findByIdAndUpdate(req.user.id,{
        $set : {
          token: token,
          deviceToken: ""
        }
      })

      return SendResponse(
        res,
        {},
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


  //**********Forgot Password*************** */
  forgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      const user = await User.findOne({
        email: req.body.email,
        isDeleted: false,
      });

      if (user && user.isEmailVerify == false) {
        return SendResponse(
          res, {
            isEmailVerify:false
          },
          "Please verify your email first",
          422
        );
      }

      if (user) {
        const randomToken = randtoken.generate(50);
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.resetPasswordToken = randomToken;

        await user.save();
        //send mail
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Password Reset Link",
          locale: "en",
          template: "resetPassword.ejs",
          name : user.fullName, 
          link : `${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/user`,
          // html: `Dear ${user.fullName}, <br><br> We noticed that you recently requested a password reset. We hope you
          // didn't encounter any issues while using our application. If you have any
          // questions or concerns, please don't hesitate to contact our support team. <br><br>

          // To reset your password, please click on the following link: 
          // <a href= "${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/user" >${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/user</a><br>
          // If the link above does not work, you can copy and paste the URL into your web browser.<br><br>
          // Please note that this link will expire in 1 hour. If you do not reset your password before it expires, you will need to request a new reset link.<br><br>
          // Thank you for choosing “SportsNerve”. We hope you continue to find it useful.
          // <br><br>
          // Best regards,<br>
          // Team Sports Nerve 
          // `,
        });
        if (!mailSend) {
          return SendResponse(res, {
            isBoom: true
          }, i18n.__('Internal_server_error'), 500);
        }
        //end
        return SendResponse(
          res, {},
          "Please check your email inbox. Password reset instructions sent to the associated email address.",
          200
        );
      } else {
        return SendResponse(
          res, {
            isBoom: true
          },
          "No account with that email address exists",
          422
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong, please try again",
        500
      );
    }
  },
  //**********Update Reset Password******** */
  updateForgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        newPassword: "required",
        confirmPassword: "required|same:newPassword",
        token: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }
      let data = req.body;
      let user = await User.findOne({
        resetPasswordToken: data.token,
      });

      if (user && user.resetPasswordExpires >= Date.now()) {
        const token = jwt.sign({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          deviceToken: user.deviceToken,
          notificationStatus: user.notificationStatus,
        },
        `${constant.jwtSecret}`, {
          expiresIn: "365d",
        }
        );
        let hasPassword = await bcrypt.hashSync(data.newPassword, 15);
        await User.updateOne({
          _id: user._id
        }, {
          $set: {
            resetPasswordToken: null,
            password: hasPassword,
            token: token
          }
        });
        return SendResponse(res, {}, "Password updated successfully.", 200);
      } else {
        return SendResponse(
          res, {
            isBoom: true
          },
          "Invalid Link or Link has been expired.",
          422
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(res, {
        isBoom: true
      }, "Something went wrong, please try again", 500);
    }
  },




  //********Check mobile number exists or not****** */
  CheckMobileExists: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        mobile: "required",
        phoneNumericCode: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      let checkMobileAlreadyExists = await User.findOne({
        mobile: req.body.mobile,
        phoneNumericCode: req.body.phoneNumericCode,
        isDeleted: false
      });

      if (checkMobileAlreadyExists) {
        return SendResponse(res, {
          isBoom: true
        }, "This mobile number already exists", 422);
      }

      return SendResponse(res, {}, "Continue to signup", 200);
    } catch (err) {
      dump(err);
      SendResponse(res, {
        isBoom: true
      }, "Something went wrong,please try again", 500);
    }
  },

  //*******Check email exists or not  */
  checkEmailExists: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      let checkEmailAlreadyExists = await User.findOne({
        email: req.body.email,
        isDeleted: false,
      });
      if (checkEmailAlreadyExists) {
        return SendResponse(res, {
          isBoom: true
        }, "This email address already exists", 422);
      }

      return SendResponse(res, {}, "Success", 200);
    } catch (err) {
      dump(err);
      SendResponse(res, {
        isBoom: true
      }, "Something went wrong,please try again", 500);
    }
  },



  //*****Country list**** */
  countryList: async (req, res) => {
    try {
      const country_list = await Country.find().lean();

      for await (const country of country_list) {
        country.flag = `${process.env.IMG_URL}flags/${country.sortName}.png`;
      }


      return SendResponse(
        res, {
          country_list: country_list
        },
        "Country list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(res, {
        isBoom: true
      }, "Something went wrong,please try again", 500);
    }
  },

  // //*********State list**** */
  stateList: async (req, res) => {
    try {
      if (!req.params.countryId) {
        return SendResponse(res, {
          isBoom: true
        }, "Country Id field is required", 422);
      }
      const state_list = await State.find({
        country_id : Number(req.params.countryId)
      })
      
      let stateList = state_list.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      return SendResponse(
        res, {
          state_list: stateList
        },
        "State list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(res, {
        isBoom: true
      }, "Something went wrong, please try again", 500);
    }
  },

  // //******City list****** */
  cityist: async (req, res) => {
    try {

      if (!req.params.stateId) {
        return SendResponse(res, {
          isBoom: true
        }, "State Id field is required", 422);
      }
      const city_list = await City.find({
        state_id: Number(req.params.stateId)
      })

      let cityList = city_list.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      return SendResponse(
        res, {
          city_list: cityList
        },
        "City list retrieved successfully",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(res, {
        isBoom: true
      }, "Something went wrong,please try again", 500);
    }
  },


};