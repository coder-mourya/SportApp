const mongoose = require("mongoose");
const trainingEvaluationSchema = new mongoose.Schema({
        attendanceRange: {
            type: Number,
            enum: [0, 1, 2] // o for (0-33%) attendance range, 1 for (33-66%) and 2 for(66-100%)
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        familyMemberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "members",
        },
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "trainings",
        },
        // trainingBookingId: { 
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "trainingbookings",
        //     default: null
        // },
        sportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "sports"
        },
        facilityId: { //facility branch id
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilityBranch",
        },
        evaluationMarkedBy: { // evaluation marked by either coach or facility admin
            type: mongoose.Schema.Types.ObjectId,
            ref: "facilities",
        },
        evaluationMarkedAt: {
            type: Date
        },
        evaluation: {
            type: String,
            enum: ['Beginner', 'Advanced', 'Proficient', 'Expert'],
            default: 'Beginner'
        },
        comment: {
            type: String,
            default: ""
        },
        recommendedStrokes: {
            type: String,
            default: ""
        },
        commentImage: [{
            type: String
        }],
        strokeImage: [{
            type: String,
            default: ""
        }],
        status: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    },

    {
        timestamps: true,
    }
);
trainingEvaluationSchema.indexes({
    trainingBookingId: 1
});


module.exports = mongoose.model("trainingevaluations", trainingEvaluationSchema);