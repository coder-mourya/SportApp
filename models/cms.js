const mongoose = require('mongoose');
const cmsSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ["user", "facility_admin", "facility_manager", "coach"],
        default: null
    },
    type: {
        type: String,
        enum: ['about', 'privacy', 'terms']
    },
    slug: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true,
});
const Cms = mongoose.model("cms", cmsSchema);
module.exports = Cms;