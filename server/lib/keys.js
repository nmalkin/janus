'use strict';

var uuid = require('node-uuid');

exports.Key = function() {
    this.key = uuid.v4();
};

exports.Key.prototype.toString = function() {
    return this.key;
};
