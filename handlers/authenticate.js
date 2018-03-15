'use strict';
var jwt = require('jsonwebtoken');
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
    const userName = requestBody.userName || '';
    const userPassword = requestBody.userPassword || '';

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
            if (!data.Item) return done({ code: 404, message: "user not found" });

            if (!bcrypt.compareSync(userPassword, data.Item.password)) {
                return done({ code: 401, message: "incorrect password" });
            } else {
                const payload = {
                    username: data.Item.userId,
                    level: data.Item.userLevel
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
                return done(null, {
                    message: "success",
                    token: token
                });
            }
        })
        .catch(err => {
            return done({ code: 500, message: `unable to read item. error: ${JSON.stringify(err, null, 2)}` });
        });
};
