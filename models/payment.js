const mongoose = require("mongoose");
const eventExpenseSchema = new mongoose.Schema({
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events",
            default: null
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        paymentType: {
            type: String, 
            enum: ['event','training']
        },
        paymentScreenshots : [],
        paymentReceiptStatus : {
            type: Number,
            enum: [1,2,3], //0=>pending , 2 => paid, 1=> confirmed by event creator
            default: 0
        },
        paymentReminderCount: {
            type: Number,
            default: 0,
        }
    },

    {
        timestamps: true,
    }
);
eventExpenseSchema.indexes({
    title: 1
});


module.exports = mongoose.model("eventexpenses", eventExpenseSchema);