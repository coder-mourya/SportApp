const mongoose = require("mongoose");
const chatMessageCountSchema = new mongoose.Schema({
        roomId: {
            type : Number
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        userType: {
            type: String,
            enum: ['user', 'facility'],
        },
        count: {
            type: Number,
            default: 0,
        }
    },

    {
        timestamps: true,
    }
);
chatMessageCountSchema.indexes({
    senderId: 1,
    receiverId: 1,
});

module.exports = mongoose.model("chatmessagecount", chatMessageCountSchema);