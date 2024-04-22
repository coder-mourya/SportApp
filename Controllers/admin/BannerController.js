const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Banner = require("../../models/bannerImages");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const FileUpload = require("../../services/upload-file");
const {dump} = require("../../services/dump");
module.exports = {
    getBannerList: async (req,res) => {
    try{
        let { type, limit = 10, order = "desc", sort = "createdAt" } = req.query;
        sort = {
        [sort]: order == "desc" ? -1 : 1,
        };
        limit = parseInt(limit);
        page = req.query.page ? parseInt(req.query.page) : 1;
        var skipIndex = (page - 1) * limit;
        let params = {
            status: true
        };

        const [{ bannerList, total }] = await Banner.aggregate([
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
                bannerList: [
                    {
                    $project: {
                        _id: 1,
                        bannerName: 1,
                        bannerImage: 1,
                        status: 1,
                        createdAt: 1
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

        let bannerData = {
            bannerList: bannerList,
            total: total || 0,
        };
        return SendResponse(
            res,
            {
                bannerData: bannerData,
            },
            "Banner list",
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

  addBanner: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            bannerName : "required"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }

        if(!req.files || !req.files.bannerImage){
            res,
            { isBoom : true},
            "Banner image required",
            422
        }

        if (req.files && req.files.bannerImage) {
              let Image = await FileUpload.aws(req.files.bannerImage);
            req.body.bannerImage =  process.env.AWS_URL + Image.Key;
        }

        await Banner.create(req.body);
    
        return SendResponse(
            res,
            {},
            "Banner added successfully",
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

  editBanner: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            bannerId : "required"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }

        const bannerDetails = await Banner.findById(req.body.bannerId);
        if( !bannerDetails ){
        return SendResponse(
            res,
            { isBoom  : true },
            "Banner not found",
            422
        );
        }

        if (req.files && req.files.bannerImage) {
            let Image = await FileUpload.aws(req.files.bannerImage);
          
          req.body.bannerImage =  process.env.AWS_URL + Image.Key;
        }

        delete req.body.bannerId;
        await Banner.findByIdAndUpdate(bannerDetails._id,req.body);

        return SendResponse(
            res,
            {},
            "Banner updated successfully",
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

  deleteBanner: async (req,res) => {
    try {
        let BannerDetails = await Banner.findById(req.params.id);
        if (!BannerDetails) {
          return SendResponse(res, { isBoom : true }, "No banner found", 422);
        }
  
        await BannerDetails.delete();
        return SendResponse(res, {}, "Banner deleted successfully", 200);
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

  bannerDetails: async(req,res) =>{
    try{
    const bannnerDetails  = await Banner.findOne({
        _id : ObjectId(req.params.id),
        status : true
    });

    if(!bannnerDetails){
        return SendResponse(
            res,
            { isBoom : true },
            "No banner found",
            422
        ); 
    }

    return SendResponse(
        res,
        { bannnerDetails : bannnerDetails },
        "Banner Details",
        422
    ); 

    }catch (err) {
        dump(err);
        return SendResponse(
            res,
            { isBoom : true },
            "Something went wrong, please try again",
            500
        );
    }
  },

  getAllBannersList: async(req,res) => {
      try{

        const bannerList = await Banner.find({ status : true });
        return SendResponse(
            res,
            {
                bannerList: bannerList,
            },
            "Banner list",
            200
        );
      }catch (err) {
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