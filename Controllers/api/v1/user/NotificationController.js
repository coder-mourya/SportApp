const User = require("../../../../models/facility");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {
    Validator
} = require("node-input-validator");
const i18n = require('i18n');
const {dump}=require('../../../../services/dump');
const SendResponse = require("../../../../apiHandler");
const Notification = require("../../../../models/notification");
const moment = require('moment');
module.exports = {
    getNotificationsList: async (req,res) => {
        try {
            let {
                limit = 10, order = "desc", sort = "createdAt"
            } = req.query;
            sort = {
                [sort]: order == "desc" ? -1 : 1,
            };
            limit = parseInt(limit);
            page = req.query.page ? parseInt(req.query.page) : 1;
            var skipIndex = (page - 1) * limit;

            let params = {
                receiverId : ObjectId(req.user.id)
            };

            if (req.query.search) {
                params = Object.assign(params, {
                    title: {
                        $regex: new RegExp(req.query.search, "i")
                    }
                })
            }

            const [{ notificationList, total }] = await Notification.aggregate([
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
                    notificationList: [
                      {
                        $project: {
                          _id: 1,
                          title: 1,
                          message: 1,
                          trainingId: 1,
                          teamId: 1,
                          eventId: 1,
                          memberId: 1,
                          trainingBookingId: 1,
                          sportId: 1,
                          attendanceRange: 1,
                          senderId: 1,
                          receiverId: 1,
                          receiverEmail: 1,
                          type: 1,
                          senderType: 1,
                          isSeen: 1,
                          status: 1,
                          createdAt: 1
                        },
                      },
                      {
                        $sort: {
                          createdAt: -1,
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

            let notifications = {
            notificationList: notificationList,
            total: total || 0,
            };

            return SendResponse(
            res,
            {
                notifications: notifications,
            },
            "Notifications list",
            200
            );
        }catch (error) {
            dump('error', error)
            return SendResponse(
                res, {
                    isBoom: true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    },

    markReadNotification: async (req,res) => {
      try{
        const v = new Validator(req.body, {
          notificationId: "required",
        });
        const CheckValidation = await v.check();
        if (!CheckValidation) {
            let first_key = Object.keys(v.errors)[0];
            let err = v.errors[first_key]["message"];
            return SendResponse(res, {
                isBoom: true
            }, err, 422);
        }
        
        const NotificationDetails = await Notification.findById(req.body.notificationId);
        if (!NotificationDetails) {
            return SendResponse(
            res,
            { isBoom: true },
            "No data found",
            422
            );
        }
        await Notification.findByIdAndUpdate( 
          req.body.notificationId,
          {
              $set: {
                  isSeen : true
              }
          }
        );
      }catch (error) {
            dump('error', error)
            return SendResponse(
                res, {
                    isBoom: true
                },
                i18n.__('Something_went_wrong_please_try_again'),
                500
            );
        }
    }
}