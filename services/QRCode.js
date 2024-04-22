const QRCode = require('qrcode');
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
module.exports = {
    generateQr: async (data,qrcode_name) => {

        let qrcode = await QRCode.toDataURL(data, { 
            color: {
            dark:"#283593",
            light:"#ffffff00"
          }
        });
        var base64Data = qrcode.replace('data:image/png;base64,', "");
        const buffer = Buffer.from(base64Data, "base64");

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: process.env.AWS_BUCKET_REGION || "ap-south-1",
        });
        let imgPath = "sports_nerve/QRCodes/" + qrcode_name + ".png";
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imgPath,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: 'image/png'
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log("error", err);
                    return Promise.reject(err);
                }

                return resolve(data.Key);
            });
        });

    }
}