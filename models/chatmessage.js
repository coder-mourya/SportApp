const array = require("joi/lib/types/array");
const mongoose = require("mongoose");
const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: Number,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    senderType: {
      type: String,
      enum: ["user", "facility"],
    },
    receiverType: {
      type: String,
      enum: ["user", "facility"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    chatType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7], //1=>one to one,2=>team group 3=>team admin group,4=>event group,5=>event admin group,6=>training group,7=>training facility admins and coaches group,
    },
    messageType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7], // 1 => message, 2 => image, 3 => video, 4 => doc, 5 => location, 6 => new member added / ( team/event )  7=>group created
    },
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'trainings',
      default: null
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        default: null
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_teams',
        default: null
    },
    latitude: {
      type: String,
      default: null
    },
    longitude: {
      type: String,
      default: null
    },
    message: String,
    teamMemberDetails: {
      type : Object,
      default : null
    },
    eventDetails: {
       type : Object,
       default : null
    },
    eventMemberDetails: {
      type : Object,
      default : null
    },
    trainingMemberDetails: {
      type : Object,
      default : null
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
    mentionedUsers: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        userType: {
          type: String
        },
      },
    ],
    clearBy: [],
    seenBy: [],
    deletedBy: [],
    isForwarded: {
      type: Boolean,
      default: false,
    },
    oldMessage: {},
    isReplied: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    }
  },

  {
    timestamps: true,
  }
);
chatMessageSchema.indexes({
  senderId: 1,
  receiverId: 1,
});

module.exports = mongoose.model("chatmessages", chatMessageSchema);
