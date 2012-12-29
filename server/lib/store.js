'use strict';

var config = require('../lib/config');
var sqlite = require('sqlite3');
var db = new sqlite.Database(config.database);

/* NOTE:
 * In all cases where a callback is present,
 * the first argument is err (null if there is no error),
 * and the second argument is the actual value.
 */

/* Calls callback with email masked by given alias. */
exports.getAlias = function(alias, callback) {
    db.get('SELECT email, status FROM aliases WHERE alias=?', alias, function(err, row) {
        if(err) callback(err);
        else {
            if(row === undefined) {
                callback(null, null);
            } else {
                callback(null, row);
            }
        }
    });
};

/* Calls callback with list of active aliases for given email address. */
exports.getAliases = function(email, callback) {
    db.all('SELECT alias FROM aliases WHERE email=? AND status=1 ORDER BY rowid DESC', email, function(err, rows) {
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

/* Sets the status of the given alias to 0 (inactive) */
exports.deactivateAlias = function(alias) {
    db.run('UPDATE aliases SET status=0 WHERE alias=?', alias);
};
