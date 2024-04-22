const mongoose = require("mongoose");
const bannerImageSchema = new mongoose.Schema({
        bannerName: {
            type: String,
            default: null
        },
        bannerImage : {
          type : String
        },
        status: {
            type: Boolean,
            default: true
        },
    },

    {
        timestamps: true,
    }
);
bannerImageSchema.indexes({
    bannerName: 1
});


module.exports = mongoose.model("bannerimages", bannerImageSchema);