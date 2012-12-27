'use strict';

var config = require('./config');
var store = require('./store');

/* Returns a random alphanumeric length-6 string. */
function randomRoot() {
    return Math.random().toString(36).substr(2,6);
}

/* Returns a randomly-selected email address. */
function newRandomAlias() {
    return randomRoot() + '@' + config.domain;
}

/* Is given alias already in the store? Calls callback with boolean answer. */
function aliasUnique(alias, callback) {
    store.getAlias(alias, function(err, email) {
        callback(email === null);
    });
}

/* Calls callback with new alias, guaranteed to be unique. */
exports.random = function(callback) {
    var tryNewAlias = function() {
        var alias = newRandomAlias();
        aliasUnique(alias, function(unique) {
            if(unique) {
                callback(alias);
            } else {
                tryNewAlias();
            }
        });
    };

    tryNewAlias();
};
