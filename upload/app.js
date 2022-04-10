'use strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const URL_EXPIRY = 12000;

// Main Lambda entry point
exports.handler = async (event, context) => {
  return await getUploadURL(event, context)
}

const getUploadURL = async function(event, context) {
  const { title, desc, fileName } = event.queryStringParameters || {};
  let contentType = fileName.split('.').pop() || "jpg";

  contentType = `image/${contentType}`;
  // get signed URL from S3
  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key: fileName,
    Expires: URL_EXPIRY,
    ContentType: contentType,
    ACL: 'public-read',
    Metadata: {
      title,
      desc
    }
  }

  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);

  return JSON.stringify({
    uploadURL: uploadURL,
    Key: fileName
  })
};
