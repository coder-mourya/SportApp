const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Sports = require("../../models/sport");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const constant = require("../../constants");
const { Validator } = require("node-input-validator");
const SendResponse = require("../../apiHandler");
const FileUpload = require("../../services/upload-file");
const STORAGE_PATH = process.env.AWS_STORAGE_PATH;
const {dump} = require("../../services/dump");
const moment = require("moment");


module.exports = {
    //*********Sports list********** */
    list: async (req, res) => {
      try {
        let {limit = 10, page,search,sort, status } = req.query;
        limit = parseInt(limit) || 10;
        let skip =  page ? (page * limit - limit) : 0;
        let params = {};
        let sortparam = { createdAt: -1 };
  
        if (search != "" && search != null) {
          params = Object.assign(params, {
            $or: [
              {
                sports_name: { $regex: ".*" + search + ".*", $options: "i" },
              },
            
            ],
          });
        }

        if (status != "" && status != null) {
            params = Object.assign(params, {
                status: status == "active" ? true : false,
            });
        }

        if(sort!= "" && sort != null){
           sortparam = (sort == "asc" ? { createdAt: 1 } : { createdAt: -1 })
        }


        const [{ list, total }] = await Sports.aggregate([
          {
           $match:params
          },
          {
            
            $facet: {
              total: [{ $group: { _id: "null", count: { $sum: 1 } } }],
              list: [
                { $sort: sortparam },
                { $skip: skip },
                { $limit: limit },
                {
                  $project: {
                    sports_name: 1,
                    sports_name_sp: 1,
                    sports_name_it: 1,
                    image : 1,
                    selected_image : 1,
                    status: 1,
                    createdAt: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              total: {
                $cond: {
                  if: { gt: [{ $size: "$total" }, 0] },
                  then: { $arrayElemAt: ["$total.count", 0] },
                  else: 0,
                },
              },
            },
          },
        ]);
        return SendResponse(
          res,
          { sports: list, total: total },
          "Sports List",
          200
        );
      } catch (err) {
        dump(err);
        return SendResponse(
          res,
          { isBoom : true },
          "Something wents wrong, please try again",
          500
        );
      }
    },


     //********Sport details******* */
      sportDetails: async (req, res) => {
        try {
          if (!req.params.id) {
            return SendResponse(res, { isBoom : true }, "Sport id is required", 422);
          }

          let sport = await Sports.findById(req.params.id);
          if (!sport) {
            return SendResponse(res, { isBoom : true }, "No sport found", 422);
          }

          return SendResponse(
            res,
            { sport : sport},
            "Sport Details",
            200
          );
        } catch (err) {
          dump(err);
          return SendResponse(
            res,
            {isBoom : true },
            "Something went wrong, please try again",
            500
          );
        }
      },
  
    //*******Add New Sports******** */
    addSports: async (req, res) => {
      try {
        const v = new Validator(req.body, {
            sports_name: "required",
            // sports_name_sp: "required",
            // sports_name_it: "required"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
          let first_key = Object.keys(v.errors)[0];
          let err = v.errors[first_key]["message"];
          return SendResponse(res, { isBoom  : true }, err, 422);
        }

        if(!(req.files.image && req.files.selected_image)){
          return SendResponse(res, { isBoom : true }, "The image field is required", 422);
        }else{
          let sportImage = await FileUpload.uploadFile({ file : req.files.image, path : `${STORAGE_PATH}/sports/` });
          let selectedSportImage = await FileUpload.uploadFile({ file : req.files.selected_image, path : `${STORAGE_PATH}/sports/` });
                req.body.image = process.env.AWS_URL+ sportImage.Key;
                req.body.selected_image = process.env.AWS_URL+ selectedSportImage.Key;
        }

        let checkSports = await Sports.findOne({ 
          sports_name: req.body.sports_name ,
          // sports_name_sp: req.body.sports_name_sp ,
          // sports_name_it: req.body.sports_name_it ,
        });
        if (checkSports) {
          return SendResponse(res, { isBoom : true }, "Name already exists", 422);
        }
  
        const sports = new Sports(req.body);
        await sports.save();
  
        return SendResponse(res, {}, "Sports added successfully", 200);
      } catch (err) {
        dump(err);
        return SendResponse(
          res,
          { isBoom : true },
          "Something wents wrong, please try again",
          500
        );
      }
    },
  
    // ********Update Sport************ */
    updateSport: async (req, res) => {
      try {
        const v = new Validator(req.body, {
          _id: "required",
          sports_name: "required",
          // sports_name_sp: "required",
          // sports_name_it: "required",
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
          let first_key = Object.keys(v.errors)[0];
          let err = v.errors[first_key]["message"];
          return SendResponse(res, { isBoom : true }, err, 422);
        }
       
        const sport = await Sports.findById(req.body._id);
        if(req.files && req.files.image){
          if(sport.image != "" && sport.image != null){
              const removed = await FileUpload.unlinkFile(sport.image.slice(50));
          }
          let sportImage = await FileUpload.uploadFile({ file : req.files.image, path : `${STORAGE_PATH}/sports/` });
          sport.image = process.env.AWS_URL+ sportImage.Key;
        }
        if(req.files && req.files.selected_image){
          if(sport.selected_image != "" && sport.selected_image != null){
              const removed = await FileUpload.unlinkFile(sport.selected_image.slice(50));
          }
          let selectedSportImage = await FileUpload.uploadFile({ file : req.files.selected_image, path : `${STORAGE_PATH}/sports/` });
          sport.selected_image = process.env.AWS_URL+ selectedSportImage.Key;
        }
        sport.sports_name = req.body.sports_name;
        // sport.sports_name_sp = req.body.sports_name_sp;
        // sport.sports_name_it = req.body.sports_name_it;
        await sport.save();

        return SendResponse(res, {}, "Sport updated successfully", 200);
      } catch (err) {
        dump(err);
        return SendResponse(
          res,
          { isBoom : true },
          "Something wents wrong, please try again",
          500
        );
      }
    },
  
    //***********Change Status************ */
    updateStatus: async (req, res) => {
      try {
        const v = new Validator(req.body, {
          _id: "required",
          status: "required",
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
          let first_key = Object.keys(v.errors)[0];
          let err = v.errors[first_key]["message"];
          return SendResponse(res, { isBoom : true }, err, 422);
        }
        const user = await Sports.findByIdAndUpdate(
          req.body._id,
          {
            $set: { status: req.body.status },
          },
          { new: true }
        );
        return SendResponse(res, {}, "Sport Status changed successfully", 200);
      } catch (err) {
        dump(err);
        return SendResponse(
          res,
          { isBoom : true },
          "Something wents wrong, please try again",
          500
        );
      }
    },
  
    //**********Delete sport******** */
    deleteSport: async (req, res) => {
      try {
        if (!req.params.id) {
          return SendResponse(res, { isBoom : true }, "Sport id field is required", 422);
        }
        let sport = await Sports.findById(req.params.id);
        if (!sport) {
          return SendResponse(res, { isBoom : true }, "No data found", 422);
        }
       
        if(sport.image != "" && sport.image != null){
          const removed = await FileUpload.unlinkFile(sport.image.slice(50));
        }
        await sport.delete();
        return SendResponse(res, {}, "Sport deleted successfully", 200);
      } catch (err) {
        dump(err);
        return SendResponse(
          res,
          { isBoom : true },
          "Something went wrong, please try again",
          500
        );
      }
    },
  };