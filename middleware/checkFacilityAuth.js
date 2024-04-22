const jwt = require("jsonwebtoken");
const Facility = require("../models/facility");
const constant = require("../constants");
const {dump} = require("../services/dump");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, `${constant.jwtSecret}`);
    const user = await Facility.findOne({
      _id: verify.id
    });
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
     // dump(verify);     
      req.user = verify;
      next();
    }

  } catch (err) {
    dump(err, "auth error");
    res.status(200).json({
      status: 401,
      message: "Session Expired.",
    });
  }
};