const mongoose = require('mongoose');
const promotionSlotSchema = new mongoose.Schema({
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'promotions'
    },
    date: {
        type: Date
    },
    day: {
        type: String
    },
    slot: {
        type : String
    },
    // slotStartTime: {
    //     type : Date
    // },
    // slotEndTime: {
    //     type : Date
    // },
    limit: {
        type : String
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("promotionslots", promotionSlotSchema);