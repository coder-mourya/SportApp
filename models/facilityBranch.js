const mongoose = require("mongoose");
const facilityBranchSchema = new mongoose.Schema({
        name: {
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
        address: {
            type: String,
            default: ''
        },
        coverImage : [],
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
        pincode: {
            type: String,
            default: ""
        },
        openingTime: {
            type: String,
            default: ""
        },
        closingTime: {
            type: String,
            default: ""
        },
        startTime: { //for backend use only
            type: String,
            default: ""
        },
        endTime: { //for backend use only
            type: String,
            default: ""
        },
        googleMapId: {
            type: String,
            default: ""
        },
        color: {
            type: String,
            default: ""
        },
        chosenSports: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "sports",
        }],
        stripeId: { //connected user stripe account id
            type: String,
            default: null
        },
        about: {
            type: String,
            default: ""
        },
        facilityId: { //facility admin id
            type: mongoose.Schema.Types.ObjectId,
            ref: 'facilities'
        },
        status: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0
        },
        isReachedMaxBooking: {
            type: Boolean,
            default: false
        },
        isStripeAccountConnected: { //make it true if user submit the account details
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true,
    }
);
facilityBranchSchema.indexes({
    name: 1
});


module.exports = mongoose.model("facilityBranch", facilityBranchSchema);