/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Stolen, with miniscule modifications, from: https://github.com/ozten/hostedpersona
 */

/* Module is a function which sends requests for certificates to the certifier. */

const
config = require('./config'),
http = require('http'),
https = require('https');

var host = config.certifierHost,
port = config.certifierPort,
lib = port === 443 ? https : http;

module.exports = function (pubkey, email, duration_s, cb) {
  var body = JSON.stringify({
        duration: duration_s,
        pubkey: pubkey,
        email: email
      }),
      req,
      start = new Date();
  req = lib.request({
    host: host,
    port: port,
    path: '/cert_key',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  }, function (res) {
    var res_body = "";
    if (res.statusCode >= 400) {
      return cb('Error talking to certifier... code=' + res.statusCode + ' ');
    } else {
      res.on('data', function (chunk) {
        res_body += chunk.toString('utf8');
      });
      res.on('end', function () {
        cb(null, res_body);
      });
    }
    return;
  });
  req.on('error', function (err) {
    console.error("Ouch, certifier is down: ", err);
    cb("certifier is down");
  });
  req.write(body);
  req.end();
};

