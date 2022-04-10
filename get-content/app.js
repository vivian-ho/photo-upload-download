'use strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

// lambda function to get content of each image
exports.handler = async (event, context) => {
  const { key, bucket } = event.queryStringParameters || {};
  const params = { Bucket: bucket, Key: key };

  try {
    const data = await s3.getObject(params).promise();

    /*let image = new Buffer(data.Body).toString('base64');
    image = "data:"+data.ContentType+";base64,"+image;*/

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": data.ContentType
      },
      //body: image,
      metaData: data.Metadata
      //isBase64Encoded: true
    };

    console.log(data);

    return data;
  } catch (error) {
    console.log('error', error);
  }
};
