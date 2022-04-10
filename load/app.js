'use strict'
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

// lambda function to get all items in bucket
exports.handler = async (event, context) => {
  // 1 bucket for now, but can expand in the future 
  const { bucket } = event.queryStringParameters || {};
  const arrayOfParams = [{ Bucket: bucket }];

  const allKeys = [];
  await Promise.all(arrayOfParams.map(params => getAllKeys(params, allKeys)));
  return allKeys;
};

async function getAllKeys(params,  allKeys = []) {
  const response = await s3.listObjectsV2(params).promise();
  response.Contents.forEach(obj => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys);
  }

  return allKeys;
};
