'use strict';

var config = require('./config');
var https = require('https');

function handleResponse(cb) {
    return function(vres) {
        var responseBody = '';
        vres.on('data', function(chunk) {
            responseBody += chunk;
        });
        vres.on('end', function() {
            cb(responseBody);
        });
    };
}

// Makes request with given headers and header, calls cb with response body
function makeRequest(headers, body, cb) {
    var vreq = https.request(headers, handleResponse(cb));
    vreq.write(body);
}

// Validates assertion using Persona verifier
// Callback should take two arguments: err, email (err is null on success)
exports.authenticate = function(assertion, callback) {
    var requestBody = JSON.stringify({
        assertion: assertion,
        audience: process.env.PUBLIC_URL || config.audience
    });

    makeRequest({
        host: 'verifier.login.persona.org',
        path: '/verify',
        method: 'POST',
        headers: {
            'Content-Length': requestBody.length,
            'Content-Type': 'application/json'
        }
    }, requestBody, function(responseBody) {
        var response = JSON.parse(responseBody);
        if (response.status === 'okay') {
            return callback(null, response.email);
        } else {
            return callback(response, null);
        }
    });
};

