const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const bcrypt = require('bcrypt-nodejs')
const versionSchema = new mongoose.Schema({
    appVersion: {
      type: String,
    },
    type: {
      type: String,
    },
    appType: {
      type: String,
    },
    forceUpdate: {
      type: Boolean,
      default: false
    },
  },

  {
    timestamps: true,
  }
);
versionSchema.indexes({
    appVersion: 1
});


module.exports = mongoose.model("appversions", versionSchema);