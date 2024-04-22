const mongoose = require("mongoose");
const userTeamMemberSchema = new mongoose.Schema({
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        isTeamMember: {
            type: Boolean,
            default: false,
        },
        isNormalMember: {
            type: Boolean,
            default: false,
        },
        isFamilyMember: {
            type: Boolean,
            default: false,
        },
        isEventMember: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: null
        },
        fullName: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
        },
        countryAlphaCode: {
            type: String,
            default: "",
        },
        countryCode: {
            type: String,
            default: "",
        },
        mobile: {
            type: String,
            default: "",
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_teams",

        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events",
        },
        sportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "sports",
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        about: {
            type: Object,
            default: null
        },
        dob: {
            type: Date,
            default: ""
        },
        gender: {
            type: String,
            enum: ["", "male", "female", "transgender", "other"],
            default: ""
        },
        description: {
            type: String,
            default: null
        },
        expectations: {
            type: String,
            default: null
        },
        jerseyDetails: {
            type: Object,
            default: null
        },
        aboutCreator: {
            type: Object,
            default : null
        },
        relationWithCreator: {
            type: String,
            default: ""
        },
        requestStatus: { 
            type: Number,
            enum: [1, 2, 3, 4], //1=>request/invitation sent,2=>accepted,3=>rejected,4=>deleted
            default: 1
        },
        confirmationReminderCount: {
            type: Number,
            default: 0,
        },
        confirmationReminderTime: {
            type: Date,
            default: null,
        },
        currencyCode: {
            type: String,
        },
        expenseContribution :{
            type: Number,
            default: ""
        },
        SplitPaymentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default : null,
        }, 
        paymentScreenshots : [],
        paymentReceiptStatus : {
            type: Number,
            enum: [1,2,3], //1=>pending , 2 => paid, 3=> confirmed by event creator
        },
        paymentReceiptUploadTime: {
            type: String,
            default: null,
        },
        paymentReminderCount: {
            type: Number,
            default: 0,
        },
        paymentReminderTime: {
            type: Date,
            default: null,
        },
        paymentNotes :{
            type: String,
            default: ""
        },
        status: {
            type: Boolean,
            default: true
        }

    },

    {
        timestamps: true,
    }
);
userTeamMemberSchema.indexes({
    fullName: 1,
    email: 1,
});

//user team/normal/family/event members
module.exports = mongoose.model("members", userTeamMemberSchema);