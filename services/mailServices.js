const nodemailer = require("nodemailer");
require("dotenv").config();
let ejs = require("ejs");
var USER = process.env.mail_user;
var PASSWORD = process.env.mail_pass;
var HOST = process.env.host;
var PORT = process.env.port;
var FROM_NAME = process.env.from_name;
const transporter = nodemailer.createTransport({
  service: "gmail",
  // host: HOST,
  // port: PORT,
  // secure: false,
  auth: {
    user: USER,
    pass: PASSWORD,
  },
});


module.exports = {

  send: async (data, id) => {
    console.log("entered send mail-------------------");
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: FROM_NAME + " <" + USER + ">",
        to: data.email,
        subject: data.subject,
        // id: data.id,
        html: data.html,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("error is " + error);
         resolve(false)
        } else {
          console.log("Email sent: " + info.response);
          resolve(true)
        }
      });
    })
  },

  sendTemplate: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const html = await ejs.renderFile(`views/${data.locale}/${data.template}`, data);
                
                const mailOptions = {
                    from: `${FROM_NAME} <${USER}>`,
                    to: data.email,
                    subject: data.subject,
                    html: html,
                };
                
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("Error: " + error);
                        resolve(false);
                    } else {
                        console.log("Email sent: " + info.response);
                        resolve(true);
                    }
                });
            } catch (error) {
                console.log("Error rendering EJS template: " + error);
                resolve(false);
            }
          });
        },
};
