"use strict";

var config = require('../lib/config');
var fs = require('fs');
var http = require('http');
var httpProxy = require('http-proxy');

// The key and certificate for HTTPS
var httpsOptions = {
    key: fs.readFileSync(__dirname + '/../var/cert/server.key'),
    cert: fs.readFileSync(__dirname + '/../var/cert/server.crt')
};

// Proxy HTTPS from config.httpsPort to the HTTP server at config.port
httpProxy.createServer(config.port, 'localhost', {
    https: httpsOptions
}).listen(config.httpsPort);

// Redirect HTTP requests to config.httpPort to the server at config.audience
// (may be HTTPS).
http.createServer(function(req, res) {
    var location = config.audience + req.url;
    res.writeHead(307, { 'Location': location });
    res.end();
}).listen(config.httpPort);
