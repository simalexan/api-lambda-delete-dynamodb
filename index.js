const AWS = require('aws-sdk'),
    dynamoDb = new AWS.DynamoDB.DocumentClient(),
    processResponse = require('./process-response'),
    TABLE_NAME = process.env.TABLE_NAME,
    IS_CORS = process.env.IS_CORS,
    PRIMARY_KEY = process.env.PRIMARY_KEY;

exports.handler = (event) => {
    if (event.httpMethod === 'OPTIONS') {
		return Promise.resolve(processResponse(IS_CORS));
	}
    const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) {
        return Promise.resolve(processResponse(IS_CORS, `Error: You missing the id parameter`, 400));
    }

    let key = {};
    key[PRIMARY_KEY] = requestedItemId;
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