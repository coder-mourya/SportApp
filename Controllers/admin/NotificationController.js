const Boom = require("boom");
const AdminNotification = require("../../models/adminnotification");
const User = require("../../models/user");
const Facility = require("../../models/facility");
const Notification = require("../../models/notification");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {
  Validator
} = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const {
  dump
} = require("../../services/dump");
const {
  sendNotification
} = require("../../firebase/index");
const {
  param
} = require("trim-request");
const {
  send
} = require('../../services/mailServices');
module.exports = {
  getNotificationList: async (req, res) => {
    try {
      let {
        search,
        limit = 10,
        order = "desc",
        sort = "createdAt"
      } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        status: true,
      };
      if(search && search != "" && search != null){
        params = Object.assign(params,{
           title : { $regex: ".*" + search + ".*", $options: "i" }
        });
      }

      const notificationList = await AdminNotification.find(params).limit(limit).skip(skipIndex).sort({createdAt : -1});

      let data = {
        list: notificationList,
        total: (await AdminNotification.find(params)).length || 0,
      };
      return SendResponse(
        res, {
          data: data,
        },
        "Notification list",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  sendNotification: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        type: "required|in:1,2", //1=>all,2=>individual
        userType: "required|in:1,2,3", //1=>user,2=>facility,3=>both,
        user: "requiredIf:type,2",
        location: "nullable",
        title: "required|maxLength:50",
        message: "required|maxLength:200",
        notificationType: "required|in:1,2", //1=>push,2=>email
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, {
          isBoom: true
        }, err, 422);
      }

      let requests = req.body;
      let created = await AdminNotification.create(req.body);
      let params = {
        isDeleted: false,
        status: true,
      };

      if (requests.type == 1) {
        if (requests.location && requests.location != "") {
          params = Object.assign(params, {
            country: requests.location,
          });
        }
        if (requests.userType == 1) {
          let users = await User.find(params).select(
            "_id deviceToken email fullName"
          );
          await sendNotificationAndMail(
            users,
            requests.title,
            requests.message,
            created._id,
            "user",
            requests.notificationType
          );
        } else if (requests.userType == 2) {
          let users = await Facility.find(params).select(
            "_id deviceToken email name"
          );
          await sendNotificationAndMail(
            users,
            requests.title,
            requests.message,
            created._id,
            "facility",
            requests.notificationType
          );
        } else {
          let users = await User.find(params).select(
            "_id deviceToken email fullName"
          );
          await sendNotificationAndMail(
            users,
            requests.title,
            requests.message,
            created._id,
            "user",
            requests.notificationType
          );
          let facility = await Facility.find(params).select(
            "_id deviceToken email name"
          );
          await sendNotificationAndMail(
            facility,
            requests.title,
            requests.message,
            created._id,
            "facility",
            requests.notificationType
          );
        }
      } else {
        requests.user = [requests.user];
        params = Object.assign(params, {
          _id: {
            $in: requests.user.map((id) => ObjectId(id))
          }
        });
        if (requests.userType == 1) {
          let users = await User.find(params).select(
            "_id deviceToken email fullName"
          );
          await sendNotificationAndMail(
            users,
            requests.title,
            requests.message,
            created._id,
            "user",
            requests.notificationType
          );
        } else {
          let facility = await Facility.find(params).select(
            "_id deviceToken email name"
          );
          await sendNotificationAndMail(
            facility,
            requests.title,
            requests.message,
            created._id,
            "facility",
            requests.notificationType
          );
        }
      }

      return SendResponse(res, {}, "Notification sent successfully", 200);
    } catch (err) {
      dump(err);
      SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  deleteNotification: async (req, res) => {
    try {

      await AdminNotification.deleteOne({
        _id: ObjectId(req.params.id)
      }, {

      });

      await Notification.deleteMany({
        adminNotificationId: ObjectId(req.params.id)
      });
      return SendResponse(res, {}, "Notifications deleted successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong, please try again",
        500
      );
    }
  },

  getAllUsers: async(req,res) => {
    try{
        const usersList = await User.find(
        {
          isDeleted : false,
          status : true
        }
        ); 
        return SendResponse(res, { usersList : usersList}, "Users list retreived successfully", 200);
    }catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong, please try again",
        500
      );
    }
  },

  getAllFacilityAdmins: async(req,res) => {
    try{
      const facilityAdminsList = await Facility.aggregate([
        {
          $match : {
            isDeleted : false,
            status : true
          }
        },
        {
          $project : {
            _id : 1,
            name : 1,
            email  : 1,
            fullName : "$name"
          }
        }
      ]); 
        return SendResponse(res, { facilityAdminsList : facilityAdminsList}, "Facility admins list retreived successfully", 200);
    }catch (err) {
      dump(err);
      return SendResponse(
        res, {
          isBoom: true
        },
        "Something went wrong, please try again",
        500
      );
    }
  },


};

async function sendNotificationAndMail(
  users,
  title,
  message,
  _id,
  receiverType,
  notificationType
) {
  try {
    for (let i = 0; i < users.length; i++) {
      if (notificationType == 1) {
        await Notification.create({
          title: title,
          message: message,
          receiverId: users[i]._id,
          senderType: "admin",
          receiverType: receiverType,
          adminNotificationId: _id,
          type: "admin",
        });
        if (
          users[i].deviceToken &&
          users[i].deviceToken != "" &&
          users[i].deviceToken != null
        ) {
          let data = {
            title: title,
            message: message,
          };
          await sendNotification(users[i].deviceToken, data);
        }
      } else {
        console.log(users[i]);
        let name = receiverType == "facility" ? users[i].name : users[i].fullName;
        let data = {
          email: users[i].email,
          subject: title,
          html: `Hi, ${name} <br><br> ${message}`
        }
        await send(data)
      }
    }
    return true
  } catch (error) {
    dump(error);
  }
}