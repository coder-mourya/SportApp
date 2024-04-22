const mongoose = require("mongoose");
const adminnotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: Number, //1=>all,2=>individual
    },
    userType: {
      type: Number, //1=>user,2=>facility,3=>both
    },
    location: {
      type: String,
    },
    notificationType:{
        type:Number,//1=>push,2=>email
        default:1
    },
    status: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);
adminnotificationSchema.indexes({
  title: 1,
});

module.exports = mongoose.model("adminnotifications", adminnotificationSchema);
