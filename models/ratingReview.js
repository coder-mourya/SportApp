const mongoose = require("mongoose");
const ratingReviewSchema = new mongoose.Schema({
        ratingFor: {
            type: String,
            enum: ['training', 'coach','facility']
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
        facilityId: { //facility branch id
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilityBranch",
        },
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilities",
        },
        rating: {
            type: Number,
            default: 0
        },
        review: {
            type: String,
            default: ""
        },
        ratedOn: {
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
ratingReviewSchema.indexes({
    userId: 1,
    trainingId: 1
});


module.exports = mongoose.model("ratingreviews", ratingReviewSchema);