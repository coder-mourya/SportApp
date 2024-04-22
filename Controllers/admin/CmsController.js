const { Mongoose } = require("mongoose");
const Boom = require("boom");
const CMS = require("../../models/cms");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const {dump} = require("../../services/dump");
module.exports = {
  getCmsList: async (req,res) => {
    try{
        let { type, limit = 10, order = "desc", sort = "createdAt" } = req.query;
        sort = {
        [sort]: order == "desc" ? -1 : 1,
        };
        limit = parseInt(limit);
        page = req.query.page ? parseInt(req.query.page) : 1;
        var skipIndex = (page - 1) * limit;
        let params = {
            // type: type,
            status: true
        };

        const [{ cmsList, total }] = await CMS.aggregate([
            {
            $match: params,
            },
            {
                $facet: {
                total: [
                    {
                    $group: {
                        _id: "null",
                        count: {
                        $sum: 1,
                        },
                    },
                    },
                ],
                cmsList: [
                    {
                    $project: {
                        _id: 1,
                        userType: 1,
                        type: 1,
                        slug: 1,
                        description: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1
                    },
                    },
                    {
                     $sort: sort,
                    },
                    {
                      $skip: skipIndex,
                    },
                    {
                      $limit: limit,
                    },
                ],
                },
            },
            {
            $addFields: {
                total: {
                $cond: {
                    if: {
                    gt: [
                        {
                          $size: "$total",
                        },
                        0,
                    ],
                    },
                    then: {
                      $arrayElemAt: ["$total.count", 0],
                    },
                    else: 0,
                },
                },
            },
            },
        ]);

        let cmsData = {
            cmsList: cmsList,
            total: total || 0,
        };
        return SendResponse(
            res,
            {
                cmsData: cmsData,
            },
            "Cms list",
            200
        );
    } catch (err) {
        dump(err);
        SendResponse(
          res,
          { isBoom: true },
          "Something went wrong,please try again",
          500
        );
    }
  },

  getCmsDetails: async (req, res) => {
    try {
      let cmsDetails = await CMS.findById(req.params.id);
      if (!cmsDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No content found",
          422
        );
      }

      return SendResponse(
        res,
        { cmsDetails: cmsDetails },
        "Cms Details",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },
  
  // add or update cms
  editCms: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            action : "required|in:add,update",
            type : "required|in:about,privacy,terms",
            slug : "requiredIf:action,add", 
            description : "requiredIf:action,add",
            cmsId : "requiredIf:action,update"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }
        if(req.body.action == "update"){
            const CmsDetails = await CMS.findById(req.body.cmsId);
            if( !CmsDetails ){
            return SendResponse(
                res,
                { isBoom  : true },
                "Cms not found",
                422
            );
            }
            delete req.body.cmsId;
            await CMS.findByIdAndUpdate(CmsDetails._id,req.body);
        }else{
           await CMS.create(req.body);
        }
       
        return SendResponse(
            res,
            {},
            "success",
            200
        );
    } catch (err) {
        dump(err);
        SendResponse(
          res,
          { isBoom: true },
          "Something went wrong,please try again",
          500
        );
    }
  },

  deleteCms: async (req,res) => {
    try {
        let CmsDetails = await CMS.findById(req.params.id);
        if (!CmsDetails) {
          return SendResponse(res, { isBoom : true }, "No content found", 422);
        }
  
        await CmsDetails.delete();
        return SendResponse(res, {}, "Content deleted successfully", 200);
    } catch (err) {
        dump(err);
        return SendResponse(
            res,
            { isBoom : true },
            "Something went wrong, please try again",
            500
        );
    }
  }
}