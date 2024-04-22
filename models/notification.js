const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trainings",
      default: null,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_teams",
      default: null,
    },
    trainingBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "trainingbookings",
      default: null,
    },
    sportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sports",
      default: null,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "events",
      default: null,
    },
    attendanceRange: {
      type: String,
      default: null,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facilitybranches",
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    receiverEmail: {
      type: String,
      default: null,
    },
    studentName: {
      type: String,
      default: null,
    },
    type: {
      type: String,
    },
    isEvaluationMarked: {
      type: Boolean,
      default: false,
    },
    trainingCurriculum: {
      type: String,
      default: null,
    },
    senderType: {
      type: String,
    },
    receiverType: {
      type: String,
      default: null,
    },
    adminNotificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminnotifications",
      default: null,
    },
    roomId: {
      type: Number
    },
    chatType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7] //1=>one to one,2=>team group 3=>team admin group,4=>event group,5=>event admin group,6=>training group,7=>training facility admins and coaches group,
    },
    messageType: {
        type: Number,
        enum: [1, 2, 3, 4, 5, 6, 7] // 1 => message, 2 => image, 3 => video, 4 => doc, 5 => location, 6 => new member added / ( team/event/training )  7=>group created
    },
    media: [
      {
        link: {
          type: String
        },
        name: {
          type: String
        },
        thumbnail: {
          type: String
        },
      },
    ],
    latitude: {
      type: String,
      default: null
    },
    longitude: {
      type: String,
      default: null
    },
    isSeen: {
      type: Boolean,
      default: false,
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
notificationSchema.indexes({
  title: 1,
});

module.exports = mongoose.model("notifications", notificationSchema);
