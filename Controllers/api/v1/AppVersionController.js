const { Mongoose } = require("mongoose");
const AppVersion = require("../../models/app_version");
const SendResponse = require("../../apiHandler");
const {dump}=require("../../../services/dump");


module.exports = {

  //***********App version ********* */
  versionDetails: async (req, res) => {
    try {
      if(!req.query.deviceType){
        return SendResponse(res, {}, "Please enter Device Type", 422);
      }
      const data = await AppVersion.findOne(
         {deviceType:req.query.deviceType}
      );
      return SendResponse(res, {versionData: data}, "We've enhanced the app, and added some new features!", 200);
    } catch (err) {
      dump(err);
      return SendResponse(res, {}, "Something went wrong", 500);
    }
  },
 

};

