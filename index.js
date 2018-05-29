const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const processResponse = require('./process-response');
const TABLE_NAME = process.env.TABLE_NAME;
const IS_CORS = true;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

exports.handler = (event) => {
    if (event.httpMethod === 'OPTIONS') {
		return Promise.resolve(processResponse(IS_CORS));
	}
    const requestedShopId = event.pathParameters[PRIMARY_KEY];
    if (!requestedShopId) {
        return Promise.resolve(processResponse(IS_CORS, 'invalid', 400));
    }

    let key = {};
    key[PRIMARY_KEY] = requestedShopId;
    let params = {
        TableName: TABLE_NAME,
        Key: key
    }
    return dynamoDb.delete(params)
    .promise()
    .then(() => (processResponse(IS_CORS)))
    .catch(err => {
        console.log(err);
        return processResponse(IS_CORS, 'dynamo-error', 500);
    });
};