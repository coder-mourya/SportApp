const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    roomId: {
        type: Number,
        default: function () {
            // Combine timestamp with a random number to ensure uniqueness
            return Date.now() + Math.floor(Math.random() * 1000);
        },
        unique: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        senderType: {
            type: String,
            enum: ['user', 'facility'],
        },
        receiverType: {
            type: String,
            enum: ['user', 'facility', null],
        },
        chatType: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7] //1=>one to one,2=>team group 3=>team admin group,4=>event group,5=>event admin group,6=>training group,7=>training facility admins and coaches group,
        },
        messageType: {
            type: Number,
            enum: [1, 2, 3, 4, 5, 6, 7] // 1 => message, 2 => image, 3 => video, 4 => doc, 5 => location, 6 => new member added / ( team/event/training )  7=>group created
        },
        lastMessage: {
            type: String,
            default: null
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
        isDeleted: {
            type: Boolean,
            default: false, 
        },
        status: {
            type: Boolean,
            default: true
        },
        members: [
            {
                id: {
                  type: mongoose.Schema.Types.ObjectId,
                },
                status: {
                  type: Boolean
                },
                joiningDate: {
                    type: Date
                }
            },
        ] ,//request accepted user's id ( but in case of training its is the array of users who booked the training )
        admins: [
            {
                id: {
                  type: mongoose.Schema.Types.ObjectId,
                },
                status: {
                  type: Boolean
                },
                joiningDate: {
                    type: Date
                }
            },
        ] , // admin user's id ( but in case of training its the facility admin and coaches )
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
        isArchived: {
            type: Boolean,
            default: false,
        },
        archivedDate: {
            type: String,
        }
    },

    {
        timestamps: true,
    }
);
chatSchema.indexes({
    senderId: 1,
    receiverId: 1,
});

module.exports = mongoose.model("chats", chatSchema);