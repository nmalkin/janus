'use strict';

var SUFFIX_MAX = 1000;

var config = require('./config');
var store = require('./store');

// From: http://stackoverflow.com/a/7668656
function haiku(){
  var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
  "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
  "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
  "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
  "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
  "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
  "wandering", "withered", "wild", "black", "young", "holy", "solitary",
  "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
  "polished", "ancient", "purple", "lively", "nameless"],

  nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
  "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
  "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
  "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
  "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
  "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
  "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
  "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
  "frog", "smoke", "star"];

  return adjs[Math.floor(Math.random()*(adjs.length-1))]+"_"+nouns[Math.floor(Math.random()*(nouns.length-1))];
}

function randomSuffix() {
    return '_' + Math.floor(Math.random() * SUFFIX_MAX).toString();
}

function makeAlias(root, suffix) {
    return root + suffix + '@' + config.domain;
}

function newRandomAlias() {
    var root = haiku();
    var suffix = randomSuffix();
    return makeAlias(root, suffix);
}

function aliasUnique(alias, callback) {
    store.getAlias(alias, function(err, email) {
        callback(email === null);
    });
}

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
