"use strict";

var authenticate = require('../lib/auth').authenticate;
var certify = require('../lib/certify');
var config = require('../lib/config');
var express = require('express');
var fs = require('fs');
var generateAlias = require('../lib/alias').random;
var http = require('http');
var https = require('https');
var Key = require('../lib/keys').Key;
var store = require('../lib/store');

var app = express();
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.session({
    key: 'janus',
    secret: process.env.SECRET || 'shhh!',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 4
    }
}));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/../static'));

app.get('/authenticate', function(req, res) {
    var email = req.session.email || null;
    res.json(email);
});

app.post('/authenticate', function(req, res) {
    authenticate(req.body.assertion, function(err, email) {
        if(err) {
            res.send(401, 'Authentication failed');
            console.log('Authentication failed', err);
            return;
        }

        req.session.email = email;
        res.json(email);
    });
});

function requireAuth(req, res, next) {
    if(req.session.email === undefined || req.session.email === null) {
        res.send(401);
        return;
    } else {
        next();
    }
}

var wellKnown = fs.readFileSync(__dirname + '/../var/browserid');
app.get('/.well-known/browserid', function(req, res) {
    res.type('application/json');
    res.send(wellKnown);
});

app.all('*', requireAuth);

app.delete('/authenticate', function(req, res) {
    req.session.email = null;
    req.session.destroy();
    res.send(200);
});

app.post('/alias', function(req, res) {
    generateAlias(function(alias) {
        store.setAlias(req.session.email, alias);
        res.send(alias);
    });
});

app.delete('/alias', function(req, res) {
    if(req.body.alias === undefined) {
        res.send(400);
        return;
    }

    store.deactivateAlias(req.body.alias);
    res.send(200);
});

app.get('/aliases', function(req, res) {
    store.getAliases(req.session.email, function(err, aliases) {
        if(aliases) {
            res.json(aliases);
        } else {
            res.json([]);
        }
    });
});

function verifyOwner(email, alias, callback) {
    store.getAlias(alias, function(err, alias) {
        callback(alias && alias.email === email);
    });
}

app.post('/owner', function(req, res) {
    if(! req.body.alias) {
        res.send(400);
        return;
    }

    verifyOwner(req.session.email, req.body.alias, function(owner) {
        if(owner) {
            res.send('yes');
        } else {
            res.send('no');
        }
    });
});

app.post('/certificate', function(req, res) {
    if(!req.body.key || !req.body.duration || !req.body.alias) {
        res.send(400);
        return;
    }

    verifyOwner(req.session.email, req.body.alias, function(owner) {
        if(owner) {
            certify(req.body.key, req.body.alias, parseInt(req.body.duration, 10), function(err, response) {
                if (err) {
                    console.log('error', err);
                    res.send(500);
                } else {
                    var result = JSON.parse(response);
                    console.log(result);
                    res.send(result.certificate);
                }
            });
        } else {
            res.send(401);
        }
    });

});

app.listen(config.port);
