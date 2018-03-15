'use strict';
var bcrypt = require('bcrypt-nodejs');
const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));
AWS.config.update({ region: process.env.REGION });
var dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const done = (error, data) => callback(null, {
        statusCode: error ? error.code : 200,
        headers: {
            'x-custom-header': 'custom header value',
            "Access-Control-Allow-Origin": "*" // Required for CORS support to work
        },
        body: error ? error.message : JSON.stringify(data)
    });

    // Request Body
    let requestBody = JSON.parse(event.body);
    const userName = requestBody.userName || undefined;
    const userPassword = requestBody.userPassword || undefined;
    const confirmPassword = requestBody.confirmPassword || undefined;
    const userLevel = requestBody.userLevel || 10;
    if (!userName || !userPassword || !confirmPassword) return done({ code: 400, message: "missing args" });
    if (userPassword !== confirmPassword) return done({ code: 400, message: "passwords don't match" });

    // HTTP Method (e.g., POST, GET, HEAD)
    let httpMethod = event.httpMethod || '';
    if (httpMethod !== 'POST') return done({ code: 400, message: "invalid method" });

    // Dynamo DB Parameters
    var params = {
        TableName: process.env.TABLE,
        Key: {
            "userId": userName
        }
    };

    dynamoDb.get(params).promise()
        .then(data => {
            if (data.Item) return done({ code: 400, message: "user already exists" });

            let putParams = {
                TableName: process.env.TABLE,
                Item: {
                    "userId": userName,
                    "password": bcrypt.hashSync(userPassword),
                    "userLevel": userLevel
                }
            };
            dynamoDb.put(putParams).promise()
                .then(function () {
                    return done(null, { message: "user created" });
                })
                .catch(err => {
                    return done({ code: 500, message: `unable to put item. error: ${JSON.stringify(err, null, 2)}` });
                });
        })
        .catch(err => {
            return done({ code: 500, message: `unable to read item. error: ${JSON.stringify(err, null, 2)}` });
        });
};
