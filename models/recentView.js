const mongoose = require("mongoose");
const recentViewSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "trainings",
        },
        facilityId: { //facility branch id
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilityBranch",
        },
        viewedOn: {
            type: Date,
            default: Date.now,
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
recentViewSchema.indexes({
    userId: 1,
    trainingId: 1
});


module.exports = mongoose.model("recentviews", recentViewSchema);