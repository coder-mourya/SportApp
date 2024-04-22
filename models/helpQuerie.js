const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const helpSchema = new mongoose.Schema({
    userType: {
      type: String,
      enum: ["user", "facility_admin", "facility_manager", "coach"]
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    phoneCode: {
      type: String,
      default: "",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    suggestion: {
      type: String,
    },
    status: {
      type: Number,
      enum: [1, 2], //1=>pending for admin reply,2=>replied
      default: 1
    },
    adminReply: {
      type: String,
      default: null
    },
  },

  {
    timestamps: true,
  }
);
helpSchema.indexes({
  title: 1,
  unique: true
});


module.exports = mongoose.model("helpQueries", helpSchema);
