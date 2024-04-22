const mongoose = require("mongoose");
const favouriteSchema = new mongoose.Schema({
        trainingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'trainings'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
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

module.exports = mongoose.model("favourites", favouriteSchema);