"use strict";
navigator.id.beginAuthentication(function(email) {
    $.get('/authenticate', function(response) {
        var email = JSON.parse(response);

        var authenticating = false;

        navigator.id.watch({
            loggedInEmail: email,
            onlogin: function(assertion) {
                $.post('/authenticate', {assertion: assertion}, function(response) {
                    $.post('/owner', {alias: email}, function(response) {
                        if(response !== 'yes') {
                            navigator.id.completeAuthentication();
                        } else {
                            navigator.id.raiseAuthenticationFailure();
                        }
                    });
                });
            },
            onlogout: function() {
                $.ajax({type: 'DELETE', url: '/authenticate', success: function() { }});
            },
            onready: function() {
                $('#signin').click(function() {
                    navigator.id.request();
                });
            }
        });
    });

});
