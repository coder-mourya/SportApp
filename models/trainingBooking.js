const mongoose = require("mongoose");
const trainingBookingSchema = new mongoose.Schema({
        bookingId: {
            type: Number,
            default: Date.now,
            unique: true, // Ensure uniqueness
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
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "trainings",
        },
        facilityAdminId: { //facility id
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilities",
        },
        facilityId: { //facility branch id
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilityBranch",
        },
        coachesId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilities",
        }],
        sportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "sports"
        },
        startDate: {
            type: String
        },
        endDate: {
            type: String
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
        expectations: {
            type: String
        },
        localCountry: {
            type: String
        },
        promotionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'promotions'
        },
        promocode: {
            type: String,
            default: null
        },
        discount: {
            type: String
        },
        totalPrice: {
            type: String
        },
        platformFees: {      //This platform fees will be added to totalSuperAdminCommission 
            type: Number     // and added by admin panel 
        },
        tax: {              // This tax is provided by facility admin while creating the training 
            type: Number
        },
        trainingCost: {    // Only training cost i.e pricePerSession * no. of sessions
            type: Number
        },
        facilityToSuperAdminCommission: { //share which facility admin will give to super admin 
            type: Number              // and this amount will be added to totalSuperAdminCommission
        },
        facilityAdminCommission:{//remaining total facility admin's share after giving to superAdmin
            type: Number
        },
        facilityAdminLocalCommission:{//remaining total facility admin's share in USD currency  after giving to superAdmin
            type: Number
        },
        isFundTransferred: {
            type: Boolean,
            default: false
        },
        fundTransferDate: {
            type: String
        },
        superAdminCommission: { // sum of platformFees and facilityToSuperAdminCommission
            type: Number
        },
        superAdminLocalCommission:{//super admin's share in USD currency
            type: Number
        },
        currency: {
            type: String,
            default: "USD"
        },
        paymentId: {
            type: String,
            default: ''
        },
        paymentInfo: {
            type: String,
            default: ''
        },
        evaluation: {
            type: String,
            enum: ['Beginner', 'Advanced', 'Proficient', 'Expert'],
            default: 'Beginner'
        },
        showPreviousEvaluation: {
            type: Boolean,
            default: false
        },
        isRequestingForEvaluation: {
            type: Boolean,
            default: false
        },
        totalAttendedSession: {
            type: Number,
            default: 0
        },
        currentAttendancePercent: {
            type: Number,
            default: 0
        },
        evalReqCount33: { // Evaluation request count for attendance range 0-33%
            type: Number,
            default: 0
        },
        evalReqCount66: { // Evaluation request count for attendance range 33-66%
            type: Number,
            default: 0
        },
        evalReqCount100: { // Evaluation request count for attendance range 66-100%
            type: Number,
            default: 0
        },
        evalMarkedFor33: { // Evaluation marked or not for attendance range 0-33 by coach / facility
            type: Boolean,
            default: false
        },
        evalMarkedFor66: { // Evaluation marked or not for attendance range 33-66 by coach / facility
            type: Boolean,
            default: false
        },
        evalMarkedFor100: { // Evaluation marked or not for attendance range 66-100 by coach / facility
            type: Boolean,
            default: false
        },
        reviewPosted: {
            type: Boolean,
            default: false
        },
        status: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isCompleted: {
            type: Boolean,
            default: false
        },


    },

    {
        timestamps: true,
    }
);
trainingBookingSchema.indexes({
    user: 1,
    trainingId: 1
});


module.exports = mongoose.model("trainingbookings", trainingBookingSchema);