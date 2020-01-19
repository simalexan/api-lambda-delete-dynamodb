const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const processResponse = require('./process-response');
const TABLE_NAME = process.env.TABLE_NAME;
const IS_CORS = process.env.IS_CORS;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') {
    return processResponse(IS_CORS);
  }
  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return processResponse(IS_CORS, `Error: You're missing the id parameter`, 400);
  }

  const key = {};
  key[PRIMARY_KEY] = requestedItemId;
  const params = {
    TableName: TABLE_NAME,
    Key: key
  }
  try {
    await dynamoDb.delete(params).promise();
    return processResponse(IS_CORS);
  } catch (dbError) {
    let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
    if (dbError.code === 'ValidationException') {
      if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
    }
    console.log(dbError);
    return processResponse(IS_CORS, errorResponse, 500);
  }
};
