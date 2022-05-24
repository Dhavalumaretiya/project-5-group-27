const userModel = require("../models/userModel");
const aws = require("aws-sdk");
const multer = require("multer");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket", //HERE
      Key: "abc/" + file.originalname, //HERE
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      console.log(data);
      console.log("file uploaded succesfully");
      return resolve(data.Location);
    });
  });
};

const createUser = async function (req, res) {
  try {
    let data = req.Body;
    //Aws
    let files = req.files;
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;

     
    } else {
      res.status(400).send({ msg: "No file found" });
    }

    let user = await userModel.create(data);
    
    res.status(201).send({ status: true, message: "success", data: user });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.createUser = createUser;
