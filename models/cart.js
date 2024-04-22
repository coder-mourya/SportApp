const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cartSchema = new mongoose.Schema({
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
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "trainings",
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
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    days: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    slots: [], //for information purpose only
    totalSession: {
        type: Number,
        default: 1
    },
    sessionTimeDuration: {
        type: String
    },
    pricePerSession: {
        type: String
    },
    totalPrice: {
        type: String
    },
    currency: {
        type: String,
        default: "USD"
    },
    expectations: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

    },
    {
        timestamps : true,
    }
);

cartSchema.indexes({
   userId : 1,
   trainingId: 1,
});

module.exports = mongoose.model("carts",cartSchema);