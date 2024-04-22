const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const bcrypt = require('bcrypt-nodejs')
const sportSchema = new mongoose.Schema({
    sports_name: {
      type: String,
    },
    sports_name_sp: {
      type: String,
    },
    sports_name_it: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    selected_image: {
      type: String,
      default: "",
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
sportSchema.indexes({
  sports_name: 1,
  unique: true
});


module.exports = mongoose.model("sports", sportSchema);