const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Banner = require("../../models/bannerImages");
const Promotion = require("../../models/promotion");
const FacilityBranches = require("../../models/facilityBranch");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const FileUpload = require("../../services/upload-file");
const {dump} = require("../../services/dump");
const axios = require('axios');
// const fetch = require('node-fetch');
const findCurrencyByCountryName = async(countryName) =>{
    try {
      const response = await axios.get(`https://restcountries.com/v3/name/${countryName}`);
      const data = response.data; // Use response.data to access the response JSON data

      if (data.status === 404) {
        throw new Error('Country not found');
      }
  
      const country = data[0];
      const currency = country.currencies[0].name;
      return currency;
    } catch (error) {
      dump(error);
      return null;
    }
  }
  
  
module.exports = {
    getPromotionList: async (req,res) => {
    try{
        let { type, limit = 10, order = "desc", sort = "createdAt" } = req.query;
        sort = {
        [sort]: order == "desc" ? -1 : 1,
        };
        limit = parseInt(limit);
        page = req.query.page ? parseInt(req.query.page) : 1;
        var skipIndex = (page - 1) * limit;
        let params = {
            promotionAddedBy: "superAdmin",
            isDeleted: false,
            status: true
        };

        const [{ promotionList, total }] = await Promotion.aggregate([
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
                promotionList: [
                    {
                    $project: {
                        _id: 1,
                        promotionAddedBy: 1,
                        promotionType: 1,
                        facilityId: 1,
                        promotionName: 1,
                        description: 1,
                        maximumUses: 1,
                        startDate: 1,
                        endDate: 1,
                        bannerImage: 1,
                        promoCode: 1,
                        discountType: 1,
                        amount: 1,
                        percent: 1,
                        termsAndCondition: 1,
                        currency: 1,
                        country: 1,
                        others: 1,
                        color: 1,
                        status: 1,
                        isDeleted: 1,
                        createdAt: 1,
                    },
                    },
                    {
                     $sort: {
                        createdAt : -1
                     },
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

        let promotionData = {
            promotionList: promotionList,
            total: total || 0,
        };
        return SendResponse(
            res,
            {
                promotionData: promotionData,
            },
            "Promotion list",
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

  addPromotion: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            promotionType: "required",
            facilityId : "required",
            promotionName : "required",
            description : "required",
            maximumUses : "required",
            startDate : "required",
            endDate : "required",
            bannerImage : "required",
            promoCode: "required",
            discountType: "required",

        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }

        if( req.body.discountType == 'percent' && (!req.body.percent || req.body.percent == null || req.body.percent == "")){
            return SendResponse(
                res,
                { isBoom : true },
                "Percent field is required",
                422
            );
        }

        if( req.body.discountType == 'amount' && (!req.body.amount || req.body.amount == null || req.body.amount == "")){
            return SendResponse(
                res,
                { isBoom : true },
                "Amount field is required",
                422
            );
        }

        let facilityDetails = await FacilityBranches.findOne({
            _id : ObjectId(req.body.facilityId),
            isDeleted : false,
            status : true
        });

        if(!facilityDetails){
            return SendResponse(
                res,
                { isBoom : true },
                "Facility not found",
                422
            );
        }
        req.body.country = facilityDetails.country;
        req.body.sportId = facilityDetails.sportId;
        // req.body.currency = await findCurrencyByCountryName(facilityDetails.country);
        req.body.promotionAddedBy = "superAdmin",
        await Promotion.create(req.body);
    
        return SendResponse(
            res,
            {},
            "Promotion added successfully",
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

  editPromotion: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            promotionId : "required"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }

        const promotionDetails = await Promotion.findOne( {
            _id : ObjectId(req.body.promotionId),
            isDeleted : false,
            status : true
        });
        if( !promotionDetails ){
        return SendResponse(
            res,
            { isBoom  : true },
            "Promotion not found",
            422
        );
        }

        if(req.body.facilityId){
            let facilityDetails = await FacilityBranches.findOne({
                _id : ObjectId(req.body.facilityId),
                isDeleted : false,
                status : true
            });
    
            if(!facilityDetails){
                return SendResponse(
                    res,
                    { isBoom : true },
                    "Facility not found",
                    422
                );
            }
            // req.body.currency = findCurrencyByCountryName(facilityDetails.country);
            req.body.sportId = facilityDetails.sportId;
        }
        
        await Promotion.findByIdAndUpdate(promotionDetails._id,req.body);

        return SendResponse(
            res,
            {},
            "Promotion updated successfully",
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

   deletePromotion: async (req,res) => {
        try {
            let PromotionDetails = await Promotion.findById(req.params.id);
            if (!PromotionDetails) {
            return SendResponse(res, { isBoom : true }, "No promotion found", 422);
            }
    
            await PromotionDetails.delete();
            return SendResponse(res, {}, "Promotion deleted successfully", 200);
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

    downloadPromotionList: async(req,res) => {

    },

    getPromotionDetails: async(req,res) =>{
        try{
        const promotionDetails  = await Promotion.findOne({
            _id : ObjectId(req.params.id),
            isDeleted: false,
            status : true
        });

        if(!promotionDetails){
            return SendResponse(
                res,
                { isBoom : true },
                "No promotion found",
                422
            ); 
        }

        return SendResponse(
            res,
            { promotionDetails : promotionDetails },
            "Promotion Details",
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

  getFacilityList: async(req,res) => {
      try{

        const facilityList = await FacilityBranches.find({ isDeleted : false, status : true });
        return SendResponse(
            res,
            {
                facilityList: facilityList,
            },
            "Facility list",
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