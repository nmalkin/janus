"use strict";

var cm = require('context-menu');
var prefs = require('simple-prefs').prefs;
var Request = require('request').Request;
var self = require('self');
var tabs = require('tabs');

function openWebsite() {
    tabs.open(prefs.server);
}

function fillInEmail(email) {
    var worker = tabs.activeTab.attach({
        contentScriptFile: self.data.url('fill.js')
    });
    
    worker.postMessage(email);
}

function processRequest() {
    (new Request({
        url: prefs.server + '/alias',
        onComplete: function(response) {
            if(response.status === 200) {
                var email = response.text;
                fillInEmail(email);
            } else if(response.status === 401) { // unauthenticated
                openWebsite();
            } else {
                console.log('response', response.status, response.statusText, response.text);
            }
        }
    })).post();
}

var item = new cm.Item({
    context: cm.SelectorContext('input[type=text], input[type=email]'),
    contentScriptFile: self.data.url('menu_action.js'),
    label: 'New Janus Email',
    onMessage: function(message) {
        if(message !== 'request') {
            console.log('Received unrecognized message', message);
        }

        processRequest();
    }
});
