const path = require("path");
const AWS = require("aws-sdk");
const { dump } = require("./dump");
const fs = require('fs');
module.exports = {
  uploadDirectory: async (file) => {
    try {
      let fileName =
        "clc" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 100 + 1) +
        path.extname(file.name);
      let = file.mv("./uploads/" + fileName);
      //    let filePath = path.join(__dirname, '../uploads/' + fileName);
      return fileName;
    } catch (error) {
      return 0;
    }
  },


  aws: (file) => {
    console.log("file-============>>>>>>>>>",file);
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });
    var ext = path.extname(file.name);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "sports_nerve/" + Date.now() + ext, // File name you want to save as in S3
      Body: file.data,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log(err);
          return Promise.reject(err);
        }
        console.log("data=========>>>>>>>>>",data);
        return resolve(data);
      });
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  },

  awsOriginalName: (file) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });
    var ext = path.extname(file.name);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "sports_nerve/" + Date.now() + ext, // File name you want to save as in S3
      Body: file.data,
      Metadata: {
        originalName: file.name, // Add original name as metadata
      },
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log(err);
          return Promise.reject(err);
        }
        const getObjectParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key:  data.Key, // Replace with the actual file key
        };
        
        s3.headObject(getObjectParams, function (err, headData) {
          if (err) {
            console.log(err, err.stack);
            return Promise.reject(err);
          } else {
            // Access the original name from metadata
            const originalName = headData.Metadata.originalname;
            data.originalName = originalName;
            return resolve(data);
          }
        });
      });
     
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  },

  awsLocalFile: (localFilePath) => {
    console.log("file-============>>>>>>>>>",localFilePath);
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });
    var ext = path.extname(localFilePath);
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "sports_nerve/" + Date.now() + ext, // File name you want to save as in S3
      Body: fs.createReadStream(localFilePath) 
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log(err);
          return Promise.reject(err);
        }
        console.log("data=========>>>>>>>>>",data);
        return resolve(data);
      });
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  },

  aws1: (file) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });
    var ext = ".png";

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "quippy/thumb/" + Date.now() + ext, // File name you want to save as in S3
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          return Promise.reject(err);
        }
        return resolve(data);
      });
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  },

  /**
   * upload file to server
   * @param {Object} object - binary file with path
  */ 

  uploadFile: (object) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });
    var ext = path.extname(object.file.name);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: object.path + Date.now() + ext, // File name you want to save as in S3
      Body: object.file.data,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          return Promise.reject(err);
        }
        return resolve(data);
      });
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  },

  unlinkFile: (filePath) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_BUCKET_REGION || "ap-south-1",
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath   // File name you want to remove from S3
    };
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, function (err, data) {
        if (err) {
          dump("err----------",err);
          return Promise.reject(err);
        }
        return resolve(data);
      });
    }).catch((err) => {
      dump("in catch--------",err);
      return Promise.reject(err);
    });
  },



};
