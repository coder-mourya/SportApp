const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const facilitySchema = new mongoose.Schema({
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
        email: {
            type: String,
            default: "",
        },
        isEmailVerify: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            default: null,
        },
        country: {
            type: String,
        },
        currency: {
            type: String,
            default: null
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
        status: {
            type: Boolean,
            default: true,
        },
        deviceType: {
            type: String,
            enum: ["ios", "android"],
            default: "android",
        },
        userType: {
            type: String,
            enum: ["facility_admin", "facility_manager", "coach"],
        },
        chosenSports: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "sports",
        }],
        profileImage: {
            type: String,
            default: null
        },
        coverImage: {
            type: String,
            default: null
        },
        adminName: {
            type: String,
            default: null,
        },
        lastLoginTime: {
            type: Date,
            default: Date.now,
        },
        loginCount: {
            type: Number,
            default: 0,
        },
        notificationStatus: {
            type: Boolean,
            default: true,
        },
        deviceToken: {
            type: String,
            default: "",
        },
        // stripeId: { //connected user stripe account id
        //     type: String,
        //     default: null
        // },
        token: {
            type: String,
            default: null
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: String,
            default: "",
        },
        totalFacility: {
            type: Number,
            default: 0
        },
        about: {
            type: String,
            default: ""
        },
        facilityAdminId: [],//for the coach and facility manager
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
        rating: {
            type: Number,
            default: 0
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        lastSeen: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);
facilitySchema.indexes({
    name: 1
});
facilitySchema.indexes({
    email: 1,
    unique: true
});

//generate hash password
facilitySchema.methods.hash = (password) => bcrypt.hashSync(password, 4);
// compare hash password
facilitySchema.methods.passwordVerify = async function (password) {
    return await bcrypt.compare(password, this.password);
};
module.exports = mongoose.model("facilities", facilitySchema);