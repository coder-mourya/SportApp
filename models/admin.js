const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const adminSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    image :String,
    status: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
//generate hash password
adminSchema.methods.hash = (password) => bcrypt.hashSync(password, 4);
// compare hash password
adminSchema.methods.passwordVerify = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("admins", adminSchema);
