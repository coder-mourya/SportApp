const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const bcrypt = require('bcrypt-nodejs')
const stateSchema = new mongoose.Schema({
    name: {
      type: String,
      default: "",
    },
    country_id: {
      type: Number
    }
  },

  {
    timestamps: true,
  }
);
stateSchema.indexes({
  name: 1,
  unique: true
});


module.exports = mongoose.model("states", stateSchema);