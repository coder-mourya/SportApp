const jwt = require("jsonwebtoken");
const jwtKEY = require("../constants/index");
const User = require("../models/user");
const {dump} = require("../services/dump");
module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, jwtKEY.jwtSecret);

    req.user = verify;
    next();

  } catch (err) {
    res.status(200).json({
      status: 401,
      message: "Session Expired.",
    });
  }
};