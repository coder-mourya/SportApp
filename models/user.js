const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isInteger } = require("lodash");
// const bcrypt = require('bcrypt-nodejs')
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    nickName: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "",
    },
    phoneCode: {
      type: String,
      default: "",
    },
    phoneNumericCode: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    isEmailVerify: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female","Other"]
    },
    dateOfBirth: {
      type: Date,
      default: "",
    },
    country: {
      type: String,
    },
    state: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["ios", "android"],
      default: "android",
    },
    userType: {
      type: String,
      enum: ["user", "facility_admin","facility_manager","coach"],
    },
    description: {
      type: String,
      default: null
    },
    jerseyDetails: {
      type: Object,
      default: null
    },
    chosenSports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "sports",
    }],
    sportsSelection: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default : null
    },
    lastLoginTime: {
      type: Date,
      default: Date.now,
    },
    notificationStatus: {
      type: Boolean,
      default: true,
    },
    markAdmin: {
      type: Boolean,
      default: false,
    },
    customerId: {
      type: String,
      default: null
    },
    deviceToken: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);
userSchema.indexes({ fullName: 1 });
userSchema.indexes({ nickName: 1 });
userSchema.indexes({ mobile: 1 , unique : true });
userSchema.indexes({ email: 1 , unique : true });

//generate hash password
userSchema.methods.hash = (password) => bcrypt.hashSync(password, 4);
// compare hash password
userSchema.methods.passwordVerify = async function (password) {
  return await bcrypt.compare(password, this.password);
};



module.exports = mongoose.model("users", userSchema);
