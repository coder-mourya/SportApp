const { Mongoose } = require("mongoose");
const Boom = require("boom");
var randtoken = require("rand-token");
const Admin = require("../../models/admin");
const User = require("../../models/user");
const Facility = require("../../models/facility");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constant = require("../../constants");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../apiHandler");
const mail = require("../../services/mailServices");
const FileUpload = require("../../services/upload-file");
const STORAGE_PATH = process.env.AWS_STORAGE_PATH;
const {dump} = require("../../services/dump");

module.exports = {
  //********Admin Register*********** */
  register: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        fullName: "required",
        email: "required|email",
        password: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom : true }, err, 422);
      }

      let checkUserAlreadyExists = await Admin.findOne({
        email: req.body.email,
      });

      if (checkUserAlreadyExists) {
        return SendResponse(res, { isBoom : true }, "This email id already exists", 422);
      }

      //insert user
      const user = new Admin(req.body);
      user.password = user.hash(user.password);
      await user.save();

      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "24h",
        }
      );

      let data = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      };
      return SendResponse(
        res,
        { user: data, token: token },
        "User created successfully",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        {},
        "Something went wrong, please try again",
        500
      );
    }
    //
  },

  //*****************Admin Login************ */
  login: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
        password: "required",
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {}, err, 422);
      }

      const checkEmail = await Admin.findOne({ email: req.body.email });
      if (!checkEmail) {
        return SendResponse(res, { isBoom : true }, "Email id is not found", 422);
      }
      //dump(checkEmail[0].password);

      let checkPassword = await bcrypt.compare(
        req.body.password,
        checkEmail.password
      );
      const token = jwt.sign(
        {
          id: checkEmail._id,
          fullName: checkEmail.fullName,
          email: checkEmail.email,
        },
        `${constant.jwtSecret}`,
        {
          expiresIn: "365d",
        }
      );
      let user = {
        _id: checkEmail._id,
        fullName: checkEmail.fullName,
        email: checkEmail.email,
      };
      if (checkPassword) {
        if (checkEmail.status == false) {
          return SendResponse(
            res,
            { isBoom : true },
            "Your account is blocked.Please connect to system administration.",
            423
          );
        }
        return SendResponse(
          res,
          { user: user, token: token },
          "User Logged in successfully",
          200
        );
      } else {
        return SendResponse(res, { isBoom : true }, "Password is invalid", 422);
      }
    } catch (err) {
      dump(err);
      return SendResponse(res, { isBoom : true }, "Something went to wrong", 500);
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
        return SendResponse(res, { isBoom : true }, err, 422);
      }

      const user = await Admin.findOne({ email: req.body.email });
      if (user) {
        const randomToken = randtoken.generate(50);
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.resetPasswordToken = randomToken;

        user.save();
        //send mail
        let mailSend = mail.sendTemplate({
          email: req.body.email,
          subject: "Password Reset Link",
          locale: "en",
          template: "resetPassword.ejs",
          name : user.fullName, 
          link : `${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/admin`,
          // html: `Dear ${user.fullName}, <br><br> We noticed that you recently requested a password reset. We hope you
          // didn't encounter any issues while using our application. If you have any
          // questions or concerns, please don't hesitate to contact our support team. <br><br>

          // To reset your password, please click on the following link: 
          // <a href= "${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/admin">${process.env.RESET_PASSWORD_URL}/#/reset-password/${randomToken}/admin</a><br>
          // If the link above does not work, you can copy and paste the URL into your web browser.<br><br>
          // Please note that this link will expire in 1 hour. If you do not reset your password before it expires, you will need to request a new reset link.<br><br>
          // Thank you for choosing “SportsNerve”. We hope you continue to find it useful.
          // <br><br>
          // Best regards,<br>
          // Team Sports Nerve 
          // `,
        });
        if (!mailSend) {
          return SendResponse(res, { isBoom : true }, "Internal server error", 500);
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
          { isBoom : true },
          "No account with that email address exists",
          422
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom : true },
        "Something went wrong, please try again",
        500
      );
    }
  },
  //**************Admin Update Reset Password********* */
  updateForgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        newPassword: "required",
        confirmPassword: "required|same:newPassword",
        token:"required",
        type:"required"
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom : true }, err, 422);
      }

      let data = req.body;
      let user;
      if(data.type == "admin"){
        user = await Admin.findOne({
          resetPasswordToken: data.token,
        });
        if (user) {
          let hasPassword = await bcrypt.hashSync(data.newPassword, 15);
          await Admin.updateOne(
            { _id: user._id },
            { $set: { resetPasswordToken: null, password: hasPassword } }
          );
          return SendResponse(res, { }, "Password updated successfully.", 200);
        } else {
          return SendResponse(
            res,
            {isBoom : true},
            "Invalid Link or Link has been expired.",
            422
          );
        }
      } 
      else if(data.type == "user"){
        user = await User.findOne({
          resetPasswordToken: data.token,
        });
        if (user) {
          let hasPassword = await bcrypt.hashSync(data.newPassword, 15);
          await User.updateOne(
            { _id: user._id },
            { $set: { resetPasswordToken: null, password: hasPassword } }
          );
          return SendResponse(res, { }, "Password updated successfully.", 200);
        } else {
          return SendResponse(
            res,
            { isBoom : true },
            "Invalid Link or Link has been expired.",
            422
          );
        }
      }
      else if(data.type == "facility"){
        user = await Facility.findOne({
          resetPasswordToken: data.token,
        });
        if (user) {
          let hasPassword = await bcrypt.hashSync(data.newPassword, 15);
          await Facility.updateOne(
            { _id: user._id },
            { $set: { resetPasswordToken: null, password: hasPassword } }
          );
          return SendResponse(res, { }, "Password updated successfully.", 200);
        } else {
          return SendResponse(
            res,
            { isBoom : true },
            "Invalid Link or Link has been expired.",
            422
          );
        }
      }
     
    } catch (err) {
      dump(err);
      return SendResponse(res, { isBoom : true }, "Something went wrong, please try again", 500);
    }
  },

  //***********User Fogot Password********** */
  userForgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        newPassword: "required",
        confirmPassword: "required|same:newPassword",
        token:"required"
      });

      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom : true }, err, 422);
      }
      let user = await User.findOne({
        resetPasswordToken: req.body.token,
      });
      if (user) {
        let hasPassword = await bcrypt.hashSync(req.body.newPassword, 15);
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hasPassword } }
        );
        return SendResponse(res, { isBoom : true }, "Password updated successfully.", 200);
      } else {
        return SendResponse(
          res,
          { isBoom : true },
          "Invalid Link or Link has been expired.",
          422
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom : true },
        "Something went wrong, please try gain",
        500
      );
    }
  },

  //*************Admin Change Password********* */
  changePassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        old_password: "required",
        new_password: "required",
        confirm_password: "required|same:new_password",
      });
      const match = await v.check();

      if (!match) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom : true }, err, 422);
      }
      //check old password
      let user = await Admin.findById(req.user.id);

      if (bcrypt.compareSync(req.body.old_password, user.password)) {
        let hasPassword = await bcrypt.hashSync(req.body.new_password, 15);

        await Admin.findOneAndUpdate(
          { _id: req.user.id },

          { password: hasPassword }
        );
        SendResponse(res, {}, "Password updated successfully", 200);
      } else {
        SendResponse(res, { isBoom : true }, "Old password is incorrect", 422);
      }
    } catch (err) {
      dump(err);
      SendResponse(res, { isBoom : true }, "Something went wrong, please try again", 500);
    }
  },

   //***************User Account Verify***************** */
   accountVerify: async (req, res) => {
    try {
      // dump(req.params.token);
      let user = await User.findOne({ resetPasswordToken: req.params.token });
      if (user) {
        user.isEmailVerify = true;
        user.save();
        return SendResponse(
          res,
          {},
          "Thank you, your account has been verified successfully.",
          200
        );
      } else {
        return SendResponse(
          res,
          { isBoom : true },
          "Invalid Link or Link has been expired",
          422
        );
      }
    } catch (err) {
      dump(err);
      return SendResponse(res, { isBoom : true }, "Something went to wrong", 500);
    }
  },

  //**********************Upload Admin Media*********** *//
  uploadAdminMedia: async (req,res) =>{
    try{
      if (!req.files.image || !req.body.path) {
        // check if image and path missing
        return SendResponse(res, { isBoom : true }, "Image or Path is missing", 422);
      }

      let media = await FileUpload.uploadFile({
        file: req.files.image,
        path: `${STORAGE_PATH}/${req.body.path}/`,
      });
      let mediaurl = process.env.AWS_URL+media.key;
      return SendResponse(res, { path : mediaurl }, "Image Path is retreived", 200);
      
    }
    catch(error){
      dump(error);
      return SendResponse(res, { isBoom : true }, "Something went to wrong", 500);
    }


  }
};
