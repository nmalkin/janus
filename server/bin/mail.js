"use strict";

var receive = require('../lib/mail/receive');
var send = require('../lib/mail/send');
var store = require('../lib/store');

/**
 * Validates given message by checking if the recipient exists.
 * @param {Object} message The message, which should have a 'to' field that is
 *     the email of the recipient.
 * @param {Function} callback Will be called with 'true' if the email is valid
 *     and false otherwise.
 */
var validateMessage = function(message, callback) {
    console.log('validating');
    store.getAlias(message.to, function(err, email) {
        var valid = (email !== undefined) && (email !== null);
        callback(valid);
    });
};

/**
 * Handles an incoming message.
 * @param {Object} message The incoming message.
 */
var handleMessage = function(message) {
    store.getAlias(message.to, function(err, email) {
        var valid = (email !== undefined) && (email !== null);
        if(! valid) {
            console.log('Received invalid message', message);
            return;
        }

        message.to = email;

        send.message(message, function(err, res) {
            if(err) {
                console.log('err', err);
            } else {
                console.log('success!', res);
            }
        });
    });
};

// Handle incoming messages
receive.validate(validateMessage);
receive.message(handleMessage);
