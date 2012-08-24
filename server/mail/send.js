var simplesmtp = require('./simplesmtp')

var config = require('../config').send;


exports.message = function(message, callback) {
    var client = simplesmtp.connect(config.port, config.host, config.options);
    console.log('client', client);

    client.once('idle', function() {
        if(! (message.to instanceof Array)) {
            message.to = [ message.to ];
        }

        console.log('Sending', message);

        client.useEnvelope({
            from: message.from,
            to: message.to
        });
    });

    client.on('message', function() {
        client.write(message.body);
        client.end();
    });

    client.on('ready', function(success, response) {
        if(success) {
            callback(null, response);
        } else {
            callback(response);
        }
    });

    client.on('error', function(err) {
        callback(err);
    });

    client.on('rcptFailed', function(addresses) {
        if(addresses) {
            callback("The following addresses were rejected: " + addresses.join(', '));
        } else {
            console.log('Received rcptFailed when sending, but no addresses listed.');
        }
    });

    client.on('end', function() {
        client.quit();
    });
};
