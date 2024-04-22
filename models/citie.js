const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const bcrypt = require('bcrypt-nodejs')
const citySchema = new mongoose.Schema({
    name: {
      type: String,
      default: "",
    },
    state_id: {
      type: Number
    }
  },

  {
    timestamps: true,
  }
);
citySchema.indexes({
  name: 1,
  unique: true
});


module.exports = mongoose.model("cities", citySchema);