const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Commission = require("../../models/commission");
const FacilityBranch = require("../../models/facilityBranch");
const User = require("../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const Sports = require("../../models/sport");
const {dump} = require("../../services/dump");
const XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");

module.exports = {
  addCommission: async (req,res) => {
    const v = new Validator(req.body, {
      type: "required:in,platformFees,commission",
      commissionType: "required:in,percent,amount",
      applicableTo: "required:in,trainingSessions,coachBookings,equipmentRental",
      criteria: "required:in, sports,country,state,city,facility",
      dateFrom: "required",
      dateTo: "required"
    });
    const CheckValidation = await v.check();
    if (!CheckValidation) {
      let first_key = Object.keys(v.errors)[0];
      let err = v.errors[first_key]["message"];
      return SendResponse(res, { isBoom  : true }, err, 422);
    }

    if( req.body.criteria == "sports" && (!(req.body.sportId) || req.body.sportId == "" || req.body.sportId == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The sport field is required",
        422
      );
    }

    if( req.body.criteria == "country" && (!(req.body.country) || req.body.country == "" || req.body.country == null )){
      // if(!(req.body.sportId) || req.body.sportId == "" || req.body.sportId == null ){
      //   return SendResponse(
      //     res,
      //     { isBoom  : true },
      //     "The sport field is required",
      //     422
      //   );
      // }
      return SendResponse(
        res,
        { isBoom  : true },
        "The country field is required",
        422
      );
    }

    if( req.body.criteria == "state" && (!(req.body.state) || req.body.state == "" || req.body.state == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The state field is required",
        422
      );
    }

    if( req.body.criteria == "city" && (!(req.body.city) || req.body.city == "" || req.body.city == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The city field is required",
        422
      );
    }

    if( req.body.criteria == "facility" && (!(req.body.facilityId) || req.body.facilityId == "" || req.body.facilityId == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The facility field is required",
        422
      );
    }

    await Commission.create(req.body);

    return SendResponse(
      res,
      {},
      "Commission added successfully",
      200
    );

  },

  editCommission: async (req,res) => {
    const v = new Validator(req.body, {
      commissionId : "required"
    });
    const CheckValidation = await v.check();
    if (!CheckValidation) {
      let first_key = Object.keys(v.errors)[0];
      let err = v.errors[first_key]["message"];
      return SendResponse(res, { isBoom  : true }, err, 422);
    }

    if( req.body.criteria == "sports" && (!(req.body.sportId) || req.body.sportId == "" || req.body.sportId == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The sport field is required",
        422
      );
    }

    if( req.body.criteria == "country" && (!(req.body.country) || req.body.country == "" || req.body.country == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The country field is required",
        422
      );
    }

    if( req.body.criteria == "state" && (!(req.body.state) || req.body.state == "" || req.body.state == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The state field is required",
        422
      );
    }

    if( req.body.criteria == "city" && (!(req.body.city) || req.body.city == "" || req.body.city == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The city field is required",
        422
      );
    }

    if( req.body.criteria == "facility" && (!(req.body.facilityId) || req.body.facilityId == "" || req.body.facilityId == null )){
      return SendResponse(
        res,
        { isBoom  : true },
        "The facility field is required",
        422
      );
    }
    if(req.body.facilityId && req.body.facilityId != null && req.body.facilityId != ""){
      if( typeof req.body.facilityId == "string"){
        req.body.facilityId = (req.body.facilityId).split(',');
      }
    }
    const commissionDetails = await Commission.findById(req.body.commissionId);
    if( !commissionDetails ){
      return SendResponse(
        res,
        { isBoom  : true },
        "Commission not found",
        422
      );
    }

    delete req.body.commissionId;
    await Commission.findByIdAndUpdate(commissionDetails._id,req.body);

    return SendResponse(
      res,
      {},
      "Commission updated successfully",
      200
    );

  },

   //**********Delete commission******** */
   deleteCommission: async (req, res) => {
    try {
      let commissionDetails = await Commission.findById(req.params.id);
      if (!commissionDetails) {
        return SendResponse(res, { isBoom : true }, "No commission found", 422);
      }

      await commissionDetails.delete();
      return SendResponse(res, {}, "Commission deleted successfully", 200);
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


  CommissionList: async (req, res) => {
    try {
      let { search, limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {};
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          $or: [
            {
              country: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              state: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              city: { $regex: ".*" + search + ".*", $options: "i" },
            },
          ],
        });
      }

      const [{ commissionList, total }] = await Commission.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              localField: 'sportId',
              foreignField: '_id',
              as : 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays: true,
            },
        },
        {
          $lookup: {
            from: "facilitybranches",
            localField: 'facilityId',
            foreignField: '_id',
            as: "facilityBranchDetails",
          },
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
            commissionList: [
              {
                $project: {
                  _id: 1,
                  commissionId: 1,
                  type: 1,
                  commissionType: 1,
                  applicableTo: 1,
                  criteria: 1,
                  sportId: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  facilityId: 1,
                  amount: 1,
                  percent: 1,
                  dateFrom: 1,
                  dateTo: 1,
                  sportDetails: "$sportDetails",
                  facilityBranchDetails: "$facilityBranchDetails",
                  status: 1,
                  createdAt: 1
                },
              },
              {
                $sort: { createdAt: -1},
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
      let commissionData = {
        commissionList: commissionList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          commissionData: commissionData,
        },
        "Commission list",
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

  //download Commission list
  downloadCommissionList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = {};
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          $or: [
            {
              country: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            },
            {
              state: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            },
            {
              city: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            },
          ],
        });
      }

      const commissionList = await Commission.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              localField: 'sportId',
              foreignField: '_id',
              as : 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays: true,
            },
        },
        {
          $lookup: {
            from: "facilitybranches",
            localField: 'facilityId',
            foreignField: '_id',
            as: "facilityBranchDetails",
          },
        },
        {
          $project: {
            _id: 1,
            commissionId: 1,
            sportDetails: "$sportDetails",
            facilityBranchDetails: "$facilityBranchDetails",
            type: 1,
            commissionType: 1,
            applicableTo: 1,
            criteria: 1,
            sportId: 1,
            country: 1,
            state: 1,
            city: 1,
            facilityId: 1,
            amount: 1,
            percent: 1,
            dateFrom: 1,
            dateTo: 1,
            status: 1
          },
        },
        {
          $sort: { createdAt : -1 } ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Commission Id",
        "Commission Type",
        "Commission Rate",
        "Applicable",
        "Effective Date",
        "Expiry Date",
        "Status"
      ];

      // set xls file Name
      const workSheetName = "commission";

      // set xls file path
      const filePath = "public/files/" + "Commission.xlsx";

      //get wanted params by mapping
      const result = commissionList.map((val, index) => {
        val.facility = [];
        for( let j = 0; j < val.facilityBranchDetails.length; j++){
          val.facility.push(val.facilityBranchDetails[j].name);
        }
        return [
          index + 1,
          val.commissionId ? val.commissionId : "",
          val.commissionType ? val.commissionType : "",
          `${val.commissionType == 'percent' ? "%" : ''} ${val.percent ? val.percent : ( val.amount ? val.amount : "")}`,
          `${(val.criteria == 'facility' ? val.facility : (val.criteria == 'city' ? (val.city) : (val.criteria == 'state' ? (val.state) : (val.criteria == 'country' ? (val.country) : (val.criteria == 'sports' ? val.sportDetails.sports_name : ''))) ))}`,
          val.dateFrom,
          val.dateTo,
          val.status == true ? 'Active' : 'Inactive',
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  getCommisionDetails: async (req, res) => {
    try {
      let commissionDetails = await Commission.findById(req.params.id);
      if (!commissionDetails) {
        return SendResponse(
          res,
          { isBoom: true },
          "No commission found",
          422
        );
      }

      const [data] = await Commission.aggregate([
        {
          $match: { _id: ObjectId(req.params.id) },
        },
        {
          $lookup : {
              from: 'sports',
              localField: 'sportId',
              foreignField: '_id',
              as : 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays: true,
            },
        },
        {
          $lookup: {
            from: "facilitybranches",
            localField: 'facilityId',
            foreignField: '_id',
            as: "facilityBranchDetails",
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            commissionType: 1,
            applicableTo: 1,
            criteria: 1,
            sportId: 1,
            country: 1,
            state: 1,
            city: 1,
            facilityId: 1,
            amount: 1,
            percent: 1,
            dateFrom: 1,
            dateTo: 1,
            facilityBranchDetails: "$facilityBranchDetails",
            sportDetails: "$sportDetails",
            status: 1
          },
        },
      ]);

      return SendResponse(
        res,
        { commissionDetails: data },
        "Commission Details",
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

  getFacilityList: async(req,res) =>{
    try{
      let facilityList = await FacilityBranch.find({
        status : true,
        isDeleted : false
      });

      return SendResponse(
        res,
        { facilityList: facilityList },
        "Facility List",
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

  getSportsList: async(req,res) => {
     try{
          let sportsList = await Sports.find({ status : true });
          return SendResponse(
            res,
            { sportsList: sportsList },
            "Sports List",
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
  }
};
