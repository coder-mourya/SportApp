const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const bcrypt = require('bcrypt-nodejs')
const countrySchema = new mongoose.Schema({
    name: {
      type: String,
      default: "",
    },
    sortname: {
      type: String,
      default: "",
    },
    phoneCode: {
        type: String,
        default: "",
    }
  },

  {
    timestamps: true,
  }
);
countrySchema.indexes({
  name: 1,
  unique: true
});


module.exports = mongoose.model("countries", countrySchema);