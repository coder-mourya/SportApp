const mongoose = require("mongoose");
const promotionSchema = new mongoose.Schema({
        promotionAddedBy: {
            type: String,
            enum: ['facility', 'superAdmin'],
            default: "facility"
        },
        promotionType: {
            type: String,
            enum: ['training', 'facility'],
            default: 'training'
        },
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'trainings'
        },
        facilityAdminId: { // facility id (added by)
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilities",
        },
        facilityId: { //facility branch id
            type: mongoose.Schema.Types.ObjectId,
            ref:  "facilityBranch",
        },
        sportId: { //sport id
            type: mongoose.Schema.Types.ObjectId,
            ref:  "sports",
        },
        location: { // location of the facility
            type: {
                type: String,
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0] //[longitude,latitude]
            },
        },
        promotionName: {
            type: String
        },
        description: {
            type: String,
            default: null
        },
        maximumUses: {
            type: Number,
            default: null
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        bannerImage : {
          type : String
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
        promoCode: {
            type: String
        },
        discountType: {
            type: String,
            enum: ['amount', 'percent'],
            default: 'amount'
        },
        amount: {
            type: String,
            default: null
        },
        percent: {
            type: String,
            default: null
        },
        termsAndCondition: {
            type: String,
            default : null
        },
        maximumDiscountValue: {
            type: String,
            default: null
        },
        minimumPurchaseValue: {
           type : String,
           default: null
        },
        currency: {
            type: String,
            default: null
        },
        others: {
            type: String,
            default: null
        },
        color: {
            type: String
        },
        country: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
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
        timestamps: true,
    }
);
promotionSchema.indexes({
    promotionName: 1
});
promotionSchema.index({
    location: "2dsphere"
});


module.exports = mongoose.model("promotions", promotionSchema);