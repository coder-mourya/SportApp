const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const colourCodeSchema = new mongoose.Schema({
    colour: {
      type: String,
      default: "",
    },
    border_colour: {
        type: String,
        default: "",
      },
  },

  {
    timestamps: true,
  }
);
colourCodeSchema.indexes({
  name: 1,
  unique: true
});


module.exports = mongoose.model("colourCodes", colourCodeSchema);