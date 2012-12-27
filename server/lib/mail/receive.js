"use strict";

var config = require('../config');
var fs = require("fs");
var simplesmtp = require("./simplesmtp");

/**
 * Function called to validate a message.
 * It is called with:
 * @param {Object} message The message, which will have a 'to' field that is
 *     the email of the recipient.
 * @param {Function} callback Should be called with 'true' if the email is valid
 *     and false otherwise.
 */
var validationFunction = function(message, callback) { callback(true); };
exports.validate = function(fun) {
    validationFunction = fun;
};

/**
 * Handles an incoming message.
 * It is called with:
 * @param {Object} message The incoming message.
 */
var messageHandler = function(message) {};
exports.message = function(fun) {
    messageHandler = fun;
};

// Initialize server
var smtp = simplesmtp.createServer({
    validateRecipients: true
});
smtp.listen(config.smtpPort);

// Validate recipients
smtp.on('validateRecipient', function(envelope, email, callback) {
    validationFunction({to: email}, function(result) {
        callback(! result);
    });
});

smtp.on("startData", function(envelope){
    console.log("Message from:", envelope.from);
    console.log("Message to:", envelope.to);
    envelope.body = '';
});

smtp.on("data", function(envelope, chunk){
    //console.log('Received chunk:', chunk);
    envelope.body += chunk;
});

smtp.on("dataReady", function(envelope, callback){
    console.log('Data ready');
    messageHandler(envelope);
    callback(null);
});
