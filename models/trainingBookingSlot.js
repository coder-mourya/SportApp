const mongoose = require('mongoose');
const trainingSlotSchema = new mongoose.Schema({
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainings'
    },
    trainingBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainingbookings'
    },
    bookingFor: {
        type: String,
        enum: ['self', 'family'],
        default: 'self'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    familyMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "members",
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
    slot: {
        type : String
    },
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
    qrCode: {
        type : String,
        default: null
    },
    attendance: {
        type: String,
        enum: ['present', 'absent'],
        default: 'absent'
    },
    attendanceMarkedAt : {
        type: Date,
        default: null
    },
    attendanceMarkedBy : { // attendence will be marked by either coach or facility admin
        type: mongoose.Schema.Types.ObjectId,
        ref: "facilities",
    },
    showPreviousEvaluation: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("trainingbookingslots", trainingSlotSchema);