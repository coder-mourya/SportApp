const mongoose = require("mongoose");
const eventExpenseSchema = new mongoose.Schema({
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events"
        },
        memberId: { //id of the user who is adding the expense
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        title: {
            type: String,
        },
        cost: {
            type: Number,
        },
        currencyCode: {
            type: String,
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