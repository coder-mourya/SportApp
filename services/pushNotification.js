const firebase = require("firebase-admin");
var serviceAccount = require("../mednovate-5afa1-firebase-adminsdk-u6sj3-b0a7235b74.json");
firebase.initializeApp({  
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = {
  sendNotification: async (token, message = "", title = "") => {
    try {
      const deviceToken = [token];
      const payload = {
        notification: {
          sound: "default",
          title: title,
          message: message,
          body: message,
        },
      };
      firebase
        .messaging()
        .sendToDevice(deviceToken, payload)
        .then((res) => {
          console.log("successfully push notification on firebase", res);
        })
        .catch((err) => {
          console.log("error to push notification on firebase", err);
        });
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
