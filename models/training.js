const mongoose = require("mongoose");
const trainingSchema = new mongoose.Schema({
        trainingName: {
            type: String,
        },
        sportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sports'
        },
        coverImage: [{
            type: String,
            default: null
        }],
        address: {
            type: String,
            default: ''
        },
        location: {
            type: {
                type: String,
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0] //[longitude,latitude]
            },
        },
        country: {
            type: String,
        },
        state: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            default: "",
        },
        curriculum: {
            type: String,
            default: ''
        },
        ageGroupFrom: {
            type: Number,
            default: null
        },
        ageGroupTo: {
            type: Number,
            default: null
        },
        proficiencyLevel: {
            type: String,
            enum: ['Beginners', 'Intermediate', 'Advanced']
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
        startDate: {
            type: String
        },
        endDate: {
            type: String
        },
        startDateUTC: {
            type: String
        },
        endDateUTC: {
            type: String
        },
        days: [],
        sessionTimeDuration: {
            type: String
        },
        localCountry: {
            type: String
        },
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        slots: [], //for information purpose only
        minimumSession: {
            type: Number,
            default: 1
        },
        maximumSession: {
            type: Number,
            default: 1
        },
        minimumStudent: {
            type: Number,
            default: 1
        },
        maximumStudent: {
            type: Number,
            default: 1
        },
        price: { //price per session
            type: Number
        },
        currency: {
            type: String,
            default: "USD"
        },
        inclusiveTax: {
            type: Boolean,
            default: false
        },
        tax: { //tax in percentage
          type: Number,
          default: null
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
        students: { // total enrolled number of students
            type: Number,
            default: 0
        },
        totalSeatsAvailable: { // total number of seats available in all sessions
            type: Number,
            default: 0
        },
        totalRemainingSeats: { // total  number of remaining seats in all sessions
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        }

    },

    {
        timestamps: true,
    }
);
trainingSchema.indexes({
    trainingName: 1
});
trainingSchema.index({
    location: "2dsphere"
});


module.exports = mongoose.model("trainings", trainingSchema);