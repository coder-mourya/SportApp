var firebase = require("firebase-admin");
var serviceAccount = require("./sports-nerve-395410-firebase-adminsdk-9z06k-e89cbdb055.json");
const sendResponse = require("../apiHandler");
const boom = require("boom");
const {dump} = require("../services/dump");
// const notificationModel = require("../models/notification");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = {
  sendNotification: async (token, data) => {
    try {
      dump("entered send Notification function ================");
      token = token.toString();
      const payload = {
        notification: {
          title: data.title,
          message: data.message,
          sound: "default",
          body: data.message,
        },
        data: data
      };
      firebase
        .messaging()
        .sendToDevice(token, payload)
        .then(async (response) => {
            dump("Notification sent successfully", response);
        //   payload.notification.userId = userId;
        //   payload.notification.description = message;
        //   let dt = await notificationModel(payload.notification).save();
        })
        .catch((error) => {
          dump("Failed to send push notification", error);
        });
    } catch (error) {
      dump(error);
    }
  },
  sendMultiNotification: async (tokenArr, message, receiverArr) => {
    try {
      sendNotify = {
        body: message,
      };
      const payload = {
        notification: sendNotify,
        tokens: tokenArr,
        sound: "default",
      };
      firebase
        .messaging()
        .sendMulticast(payload)
        .then((response) => {
            dump("response on send multi notification-------------", response);
          //   dump("Success Push notification sent by Admin", response);
        })
        .catch((err) => {
          dump("something went wrong", err);
        });
    } catch (error) {
      dump("error response", error);
    }
  },
};
