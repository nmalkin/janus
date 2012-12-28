'use strict';

var config = require('../lib/config');
var sqlite = require('sqlite3');
var db = new sqlite.Database(config.database);

exports.getAlias = function(alias, callback) {
    db.get('SELECT email FROM aliases WHERE alias=?', alias, function(err, row) {
        if(err) callback(err);
        else {
            if(row === undefined) {
                callback(null, null);
            } else {
                callback(null, row.email);
            }
        }
    });
};

exports.getAliases = function(email, callback) {
    db.all('SELECT alias FROM aliases WHERE email=?', email, function(err, rows) {
        if(err) callback(err);
        else {
            callback(null, rows.map(function(row) {
                return row.alias;
            }));
        }
    });
};

exports.setAlias = function(realEmail, alias) {
    db.run('INSERT INTO aliases VALUES(?,?,1,"",0,"")', alias, realEmail);
};

exports.deleteAlias = function(realEmail, alias) {
    db.run('DELETE FROM aliases WHERE alias=?', alias);
};
