const Facility = require("../../../../models/facility");
const FacilityBranch = require("../../../../models/facilityBranch");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const i18n = require("i18n");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var randtoken = require("rand-token");
const auth = require("../../../../middleware/auth");
// const auth = require("../../../../../middleware/auth");
const constant = require("../../../../constants");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../../../apiHandler");
const mail = require("../../../../services/mailServices");
const {dump}=require("../../../../services/dump");
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const countryCurrencyMap = require('country-currency-map');
const moment = require('moment');

module.exports = {

  //******** Delete Account ****** */
  deleteAccount: async (req,res) => {
    try{
        await Facility.findByIdAndUpdate(
        req.user.id,
        { $set : { status : false }}
        );
        
        await FacilityBranch.updateMany({ facilityId : ObjectId(req.user.id) },
         { 
           $set : { 
            status : false
           }
         });
        //Delete facility branches and coaches also by removing from facilityAdminId array and setting facility banches status false and also delete their trainings
        return SendResponse(
          res,
          {},
          "Account deleted successfully",
          200
        );
    } catch (err) {
      dump("error", err);
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


  //**********Facility register*********** */
  register: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        countryAlphaCode: "required",
        countryCode: "required",
        mobile: "required",
        email: "required|email",
        deviceType: "required|in:ios,android",
        userType: "required|in:facility_admin,facility_manager,coach",
        adminName: "required",
        password: "required",
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
      
      req.body.currency = await getCurrencyFromCountry(req.body.country);
      const hashPass = await bcrypt.hashSync(req.body.password, 4);
      req.body.password = hashPass;

      //insert facility
      const facility = new Facility(req.body);
      const randomToken = randtoken.generate(50);
      await facility.save();

      const token = jwt.sign(
        {
          id: facility._id,
          name: facility.name,
          email: facility.email,
          userType: facility.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );

      await Facility.findByIdAndUpdate( facility._id, { token : token });

      //send email verification link
      let mailSend = mail.sendTemplate({
        email: req.body.email,
        subject: "Sports Nerve Account Verification Request",
        locale: "en",
        template: "facilityVerificationEmail.ejs",
        name : facility.name, 
        link : `${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}`,
        // html: `Dear ${facility.name}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
        //        Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
        //     To verify your email, please click on the button below: <br><br>
        //     <a href= "${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}">Verify Email</a><br><br>
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          i18n.__("Internal_server_error"),
          500
        );
      }

      return SendResponse(
        res,
        {
          user: facility,
          token: token,
          message: i18n.__("Please_check_your_email_for_email_verifaction"),
        },
        i18n.__("User_created_successfully"),
        200
      );
    } catch (err) {
      dump("error", err);
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      const facility = await Facility.findOne({
        email: req.body.email,
      });

      if (!facility) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "User not found",
          422
        );
      } else {
        if (facility.isEmailVerify == true) {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            "This email is already verified",
            422
          );
        }

        const token = jwt.sign(
          {
            id: facility._id,
            name: facility.name,
            email: facility.email,
            userType: facility.userType,
          },
          `${constant.jwtSecret}`,
          {
            expiresIn: "365d",
          }
        );

        //send email verification link
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Sports Nerve Account Verification Request",
          locale: "en",
          template: "facilityVerificationEmail.ejs",
          name : facility.name, 
          link : `${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}`,
          // html: `Dear ${facility.name}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
          //       Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
          //     To verify your email, please click on the button below: <br><br>
          //     <a href= "${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}">Verify Email</a><br><br>
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
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            i18n.__("Internal_server_error"),
            500
          );
        }

        facility.token = token;
        facility.isEmailVerify = false;
        await facility.save();

        return SendResponse(
          res,
          {
            message: i18n.__("Please_check_your_email_for_email_verifaction"),
          },
          "Email Updated successfully",
          200
        );
      }
    } catch (err) {
      dump("error", err);
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

  // *********** Resend Verification Link *******************//
  resendLink: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        id: "required",
        email: "required",
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

      const facility = await Facility.findOne({
        _id: ObjectId(req.body.id),
      });

      if (!facility) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "User not found",
          422
        );
      } else {
        const token = jwt.sign(
          {
            id: facility._id,
            name: facility.name,
            email: facility.email,
            userType: facility.userType,
          },
          `${constant.jwtSecret}`,
          {
            expiresIn: "365d",
          }
        );

        //send email verification link
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Sports Nerve Account Verification Request",
          locale: "en",
          template: "facilityVerificationEmail.ejs",
          name : facility.name, 
          link : `${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}`,
          // html: `Dear ${facility.name}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
          //       Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
          //     To verify your email, please click on the button below: <br><br>
          //     <a href= "${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}">Verify Email</a><br><br>
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
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            i18n.__("Internal_server_error"),
            500
          );
        }

        facility.token = token;
        facility.email = req.body.email;
        facility.isEmailVerify = false;
        await facility.save();

        return SendResponse(
          res,
          {
            message: i18n.__("Please_check_your_email_for_email_verifaction"),
          },
          "Email Updated successfully",
          200
        );
      }
    } catch (err) {
      dump("error", err);
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

  // *********Verify Account********* /
  verifyEmail: async (req, res) => {
    jwt.verify(
      req.params.token,
      `${constant.jwtSecret}`,
      async function (err, decoded) {
        if (err) {
          // if err occurs, token has expired
          dump(err, "decoded");
          res.status(422).send("<h1> The link has been expired or invalid </h1>");
        } else {
          let facility = await Facility.findOne({
            _id: decoded.id,
            token: req.params.token, 
          });
          
          if ( !facility ) {
            res
              .status(422)
              .send("<h1> The link has been expired or invalid </h1>");
          }

          if( facility.isEmailVerify == true ){
            res.status(422).send("<h1> This link has been expired.You have already verified your account. </h1>");
          }

          // else all ok, verify email now
          await Facility.updateOne(
            {
              _id: decoded.id,
            },
            {
              isEmailVerify: true,
            }
          )
            .then((flag) => {
              if (flag) {
                res
                  .status(201)
                  .send(
                    `<script>window.location.href='${process.env.FACILITY_APP_URL}'</script>`
                  );
              }
            })
            .catch((err) => {
              dump("error", err);
              return SendResponse(
                res,
                {
                  isBoom: true,
                },
                i18n.__("Something_went_wrong_please_try_again"),
                500
              );
            });
        }
      }
    );
  },

  //**********User Login************ */
  login: async (req, res) => {
    try {
      let v = new Validator(req.body, {
        userType: "required|in:facility_admin,facility_manager,coach",
        email: "required",
        password: "required",
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
      let data = req.body;
      const facility = await Facility.findOne({
        email: data.email,
        userType: data.userType,
        isDeleted: false,
        status: true
      });
      if (!facility) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Please enter the registered email",
          422
        );
      }
      const isPasswordMatch = await auth.checkPassword(data.password, facility);

      if (!isPasswordMatch) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Wrong Password",
          422
        );
      }
      
      if (facility && facility.isEmailVerify == false) {
        return SendResponse(
          res,
          {
            isEmailVerify: false,
          },
          "Please verify your email first",
          200
        );
      }

      if (facility && facility.status == false) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "User Blocked",
          422
        );
      }

     
      const token = jwt.sign(
        {
          id: facility._id,
          name: facility.name,
          email: facility.email,
          deviceToken: facility.deviceToken,
          notificationStatus: facility.notificationStatus,
          userType: facility.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );
      
      facility.token = token;
      facility.deviceToken = req.body.deviceToken;
      facility.lastLoginTime = Date.now();
      facility.loginCount = facility.loginCount + 1;
      await facility.save();
      return SendResponse(
        res,
        {
          facility: await Facility.findById(facility._id, [
            "_id",
            "email",
            "countryAlphaCode",
            "countryCode",
            "mobile",
            "name",
            "adminName",
            "userType",
            "totalFacility",
            "profileImage",
            "coverImage",
            "chosenSports",
            // "stripeId"
          ]).populate('chosenSports'),
          token: token,
        },
        i18n.__("User_logged_in_successfully"),
        200
      );
    } catch (err) {
      dump("error", err);
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


  updateDeviceToken: async(req,res) => {
    try{
      let v = new Validator(req.body, {
        deviceType: "required",
        deviceToken: "required"
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


    await Facility.findByIdAndUpdate(req.user.id, {
      deviceType : req.body.deviceType,
      deviceToken : req.body.deviceToken
    });

    return SendResponse(
      res,
      {
        facility: await Facility.findById(req.user.id, [
          "_id",
          "email",
          "countryAlphaCode",
          "countryCode",
          "mobile",
          "name",
          "adminName",
          "userType",
          "totalFacility",
          "profileImage",
          "coverImage",
          "chosenSports",
          "deviceToken"
          // "stripeId"
        ]).populate('chosenSports')
      },
      "Token updated successfully",
      200
    );

    } catch (err) {
      dump("error", err);
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      const facility = await Facility.findOne({
        email: req.body.email,
        isDeleted: false,
      });
      if (facility) {
        const randomToken = randtoken.generate(50);
        facility.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        facility.resetPasswordToken = randomToken;

        await facility.save();
        //send mail
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Password Reset Link",
          locale: "en",
          template: "resetPassword.ejs",
          name : facility.name, 
          link : `${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/facility`,
          // html: `Dear ${facility.name}, <br><br> We noticed that you recently requested a password reset. We hope you
          // didn't encounter any issues while using our application. If you have any
          // questions or concerns, please don't hesitate to contact our support team. <br><br>

          // To reset your password, please click on the following link: 
          // <a href= "${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/facility" >${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/facility</a><br>
          // If the link above does not work, you can copy and paste the URL into your web browser.<br><br>
          // Please note that this link will expire in 1 hour. If you do not reset your password before it expires, you will need to request a new reset link.<br><br>
          // Thank you for choosing “SportsNerve”. We hope you continue to find it useful.
          // <br><br>
          // Best regards,<br>
          // Team Sports Nerve 
          // `,
        });
        if (!mailSend) {
          return SendResponse(
            res,
            {
              isBoom: true,
            },
            i18n.__("Internal_server_error"),
            500
          );
        }
        //end
        return SendResponse(
          res,
          {},
          "Please check your email inbox. Password reset instructions sent to the associated email address.",
          200
        );
      } else {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "No account with that email address exists",
          422
        );
      }
    } catch (err) {
      dump("error", err);
      return SendResponse(
        res,
        {
          isBoom: true,
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }
      let data = req.body;
      let facility = await Facility.findOne({
        resetPasswordToken: data.token,
      });

      const token = jwt.sign(
        {
          id: facility._id,
          name: facility.name,
          email: facility.email,
          deviceToken: facility.deviceToken,
          notificationStatus: facility.notificationStatus,
          userType: facility.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );

      if (facility && facility.resetPasswordExpires >= Date.now()) {
        let hasPassword = await bcrypt.hashSync(data.newPassword, 15);
        await facility.updateOne(
          {
            _id: facility._id,
          },
          {
            $set: {
              resetPasswordToken: null,
              password: hasPassword,
              token: token
            },
          }
        );
        return SendResponse(res, {}, "Password updated successfully.", 200);
      } else {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Invalid Link or Link has been expired.",
          422
        );
      }
    } catch (err) {
      dump("error", err);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong, please try again",
        500
      );
    }
  },

  //********Check mobile number exists or not****** */
  CheckMobileExists: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        mobile: "required",
        countryCode: "required",
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

      let checkMobileAlreadyExists = await Facility.findOne({
        mobile: req.body.mobile,
        countryCode: req.body.countryCode,
        isDeleted: false,
      });

      if (checkMobileAlreadyExists) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "This mobile number already exists",
          422
        );
      }

      return SendResponse(res, {}, "Continue to signup", 200);
    } catch (err) {
      dump("error", err);
      SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          err,
          422
        );
      }

      let checkEmailAlreadyExists = await Facility.findOne({
        email: req.body.email,
        isDeleted: false,
      });

      if (checkEmailAlreadyExists) {
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "This email address already exists",
          422
        );
      }

      return SendResponse(res, {}, "Success", 200);
    } catch (err) {
      dump("error", err);
      SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },
  refreshAccountSetupLink: async (req, res) => {
    try {
      if (
        !(await Facility.findOne({
          email: req.params.email,
        }))
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Email not found with us",
          422
        );
      const accountLink = await Stripe.accountLinks.create({
        account: req.params.accountId,
        refresh_url:
          process.env.STRIPE_REFRESH_URL +
          "/" +
          account.id +
          "/" +
          req.user.email,
        return_url: STRIPE_RETURN_URL,
        type: "account_onboarding",
      });
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
  returnSuccess: async (req, res) => {
    try {
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
  updateEmail: async (req, res) => {
    //change email after signup before verification
    try {
      const v = new Validator(req.body, {
        email: "required|email",
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
      if (
        await Facility.findOne({
          email: req.body.email,
          userType: req.user.userType,
        })
      )
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Email already taken",
          422
        );
      let facility = await Facility.findById(req.user.id);
      if (!facility)
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          "Data not found",
          422
        );

      const token = jwt.sign(
        {
          id: facility._id,
          name: facility.name,
          email: req.body.email,
          userType: facility.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );
    

    let upFacility = await Facility.findByIdAndUpdate(req.user.id, {
        $set: {
          token: token,
          email: req.body.email,
          isEmailVerify: false,
        },
      });

      //send email verification link
      let mailSend = mail.sendTemplate({
        email: req.body.email,
        subject: "Sports Nerve Account Verification Request",
        locale: "en",
        template: "facilityVerificationEmail.ejs",
        name : facility.name, 
        link : `${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}`,
        // html: `Dear ${facility.name}, <br><br>Welcome to SportsNerve! Your sports partner!! We're thrilled to have you join our community.<br><br>
        //        Before you get started, we need to verify your email address. This is a simple step to ensure the security of your account and our platform. <br><br>
        //     To verify your email, please click on the button below: <br><br>
        //     <a href= "${process.env.Url}/api/v1/facility/auth/email_account_verification/${token}">Verify Email</a><br><br>
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
        return SendResponse(
          res,
          {
            isBoom: true,
          },
          i18n.__("Internal_server_error"),
          500
        );
      }

      return SendResponse(res, {
        message: i18n.__('Please_check_your_email_for_email_verifaction')
      }, "Email updated. ", 200);
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

  logout: async(req,res) =>{
    try{
      let facilityDetails = await Facility.findOne({
        _id : ObjectId(req.user.id),
        isDeleted : false,
        status : true
      });

      if(!facilityDetails){
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
          id: facilityDetails._id,
          name: facilityDetails.name,
          email: facilityDetails.email,
          deviceToken: facilityDetails.deviceToken,
          notificationStatus: facilityDetails.notificationStatus,
          userType: facilityDetails.userType,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );

      await Facility.findByIdAndUpdate(req.user.id,{
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
  checkCoachExists: async(req,res) => {
    try{
      const v = new Validator(req.body, {
        email: "required|email",
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

      let checkCoachAlreadyExists = await Facility.findOne({
        email: req.body.email,
        userType: "coach",
        isDeleted: false,
        facilityAdminId: { $in : [ObjectId(req.user.id)]}
      });

      if (checkCoachAlreadyExists) {
        return SendResponse(
          res,
          { isBoom : true },
          "You have already added this coach",
          425
        );
      }

      let checkEmailAlreadyExists = await Facility.findOne({
        email: req.body.email,
        userType: "coach",
        isDeleted: false,
      });

      if (checkEmailAlreadyExists) {
        return SendResponse(
          res,
          { coachDetails : checkEmailAlreadyExists},
          "This email address already exists",
          200
        );
      }

      return SendResponse(res, {}, "Email does not exists", 422);

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
  }
};

async function getCurrencyFromCountry(countryName) {
  const countryInfo = await countryCurrencyMap.getCountry(countryName);
  if (countryInfo) {
    return(countryInfo.currency);
  } else {
    return null;
  }
}

const getWeekNumbersInMonth = async(year, month, yearWeekNumbers) =>{
  const weekNumbersInMonth = [];

  for (let i=0; i< yearWeekNumbers.length; i++) {
    console.log("iajbxjhsxbsjibh");
    // Create a date for the first day of the specified year and month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = firstDayOfMonth.getDay();
    // Calculate the date of the first day of the first week of the month
    const firstWeekStart = new Date(year, month, 1 + (7 - dayOfWeek));
    
    // Calculate the date for the given week number in the month
    const weekStart = new Date(firstWeekStart);
    weekStart.setDate(firstWeekStart.getDate() + (yearWeekNumbers[i] - 1) * 7);
    
    // Check if the calculated week falls within the specified month
    if (weekStart.getMonth() === month) {
      weekNumbersInMonth.push(weekNumber[i]);
    }
  }

  return weekNumbersInMonth;
}



