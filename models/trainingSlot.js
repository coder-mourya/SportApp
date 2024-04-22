const mongoose = require('mongoose');
const trainingSlotSchema = new mongoose.Schema({
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainings'
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
        ref:  "facilityBranch",
    },
    sportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "sports"
    },
    date: {
        type: Date
    },
    day: {
        type: String
    },
    // slots: [{
    //     slot : { type : String },
    //     isSelected : { type : Boolean },
    //     maximumStudent : { type : String },
    //     totalBooking : { type : Number }
    // }],
    slotStartTime: {
        type : String
    },
    slotEndTime: {
        type : String
    },
    slotStartTimeUtc: {
        type : String
    },
    slotEndTimeUtc: {
        type : String
    },
    localCountry: {
        type: String
    },
    slot: {
        type: String
    },
    isSelected : {
        type : Boolean,
        default : null
    },
    maximumStudent : {
        type : Number,
        default : 0,
    },
    totalBooking : {
        type : Number,
        default : 0
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("trainingslots", trainingSlotSchema);