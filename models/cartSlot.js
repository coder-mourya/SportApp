const mongoose = require('mongoose');
const cartSlotSchema = new mongoose.Schema({
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainings'
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default : null
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "members",
        default : null
    },
    coachesId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "facilities",
    }],
    facilityAdminId: { //facility id
        type: mongoose.Schema.Types.ObjectId,
        ref: "facilities",
    },
    facilityId: { //facility branch id
        type: mongoose.Schema.Types.ObjectId,
        ref: "facilityBranch",
    },
    date: {
        type: Date
    },
    day: {
        type: String
    },
    slot: {
        type: String
    },
    // isSelected : {
    //     type : Boolean,
    //     default : null
    // },
    // maximumStudent : {
    //     type : Number,
    //     default : 0,
    // },
    // totalBooking : {
    //     type : Number,
    //     default : 0
    // }
}, {
    timestamps: true
});
module.exports = mongoose.model("cartslots", cartSlotSchema);