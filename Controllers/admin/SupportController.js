const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Support = require("../../models/helpQuerie");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const mail = require("../../services/mailServices");
const {dump} = require("../../services/dump");
module.exports = {
  getQueriesList: async (req,res) => {
    try{
        let { search, filter, limit = 10, order = "desc", sort = "createdAt" } = req.query;
        sort = {
        [sort]: order == "desc" ? -1 : 1,
        };
        limit = parseInt(limit);
        page = req.query.page ? parseInt(req.query.page) : 1;
        var skipIndex = (page - 1) * limit;
        let params = {};
        if( search && search != null && search !="" ){
            params = Object.assign(params, {
                title: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              });
        }

        if( filter && filter != null && filter !="" ){
            params = Object.assign(params, {
                status: Number(filter),
              });
        }
        const [{ queryList, total }] = await Support.aggregate([
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
                queryList: [
                    {
                    $project: {
                        _id: 1,
                        userType: 1,
                        senderId: 1,
                        name: 1,
                        mobile: 1,
                        email: 1,
                        phoneCode: 1,
                        title: 1,
                        message: 1,
                        suggestion: 1,
                        status: 1,
                        adminReply: 1
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

        let supportData = {
            supportList: queryList,
            total: total || 0,
        };
        return SendResponse(
            res,
            {
                supportData: supportData,
            },
            "Support list",
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

  replyQuery: async (req,res) => {
    try{
        const v = new Validator(req.body, {
            supportId : "required",
            adminReply : "required"
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, { isBoom  : true }, err, 422);
        }

        const SupportDetails = await Support.findById(req.body.supportId);
        if( !SupportDetails ){
        return SendResponse(
            res,
            { isBoom  : true },
            "Data not found",
            422
        );
        }

        delete req.body.supportId;
        req.body.status = 2;
        await Support.findByIdAndUpdate(SupportDetails._id,req.body);
        mail.send( {
            email: SupportDetails.email,
            subject: "Query response",
            html: `Hi, ${SupportDetails.name} <br>  <br>
            Your query title : ${SupportDetails.title} <br><br>
            Your query message : ${SupportDetails.message} <br><br>
            Reply : ${req.body.adminReply}
            <br><br>
            Thanks & Regards,
            <br>
            Sports Nerve Team`,
        });

        return SendResponse(
            res,
            {},
            "Reply sent successfully",
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

  deleteSupport: async (req,res) => {
    try {
        let supportDetails = await Support.findById(req.params.id);
        if (!supportDetails) {
          return SendResponse(res, { isBoom : true }, "No data found", 422);
        }
  
        await supportDetails.delete();
        return SendResponse(res, {}, "Deleted successfully", 200);
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