'use strict';

var redis = require('redis');

var client = redis.createClient();

client.on('error', function(err) {
    console.log('Redis error:', err);
});

var logError = function(err) {
    if(err) console.log('Redis error:', err);
};

exports.getAlias = function(alias, callback) {
    client.get('alias:' + alias, callback);
};

exports.getAliases = function(email, callback) {
    client.lrange('aliases:' + email, 0, -1, callback);
};

exports.setAlias = function(realEmail, alias) {
    client.set('alias:' + alias, realEmail, logError);
    client.lpush('aliases:' + realEmail, alias, logError);
};

exports.deleteAlias = function(realEmail, alias) {
    client.del('alias:' + alias, logError);
    client.lrem('aliases:' + realEmail, 1, alias, logError);
};
