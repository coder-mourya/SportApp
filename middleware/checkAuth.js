const jwt = require("jsonwebtoken");
const User = require("../models/user");
const constant = require("../constants");
const {dump} = require("../services/dump");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, `${constant.jwtSecret}`);

    const user = await User.findOne({ _id: verify.id });
    if( user.token != token ){
      res.status(200).json({
        status: 401,
        message: "Session Expired.",
      });
    }
    else if (user.status == false) {
      res.status(200).json({
        status: 401,
        message: "User Blocked.",
      });
    } else {
      req.user = verify;
      next();
    }
   
  } catch (err) {
    dump("user console===========>>>>>>>>");
    res.status(200).json({
      status: 401,
      message: "Session Expired.",
    });
  }
};
