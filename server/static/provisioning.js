"use strict";

// See https://github.com/mozilla/browserid/issues/2339
var failureMessage = 'user is not authenticated as target user';

navigator.id.beginProvisioning(function(email, cert_duration) {
    $.ajax({
        type: 'POST',
        url: '/owner',
        data: { alias: email },
        success: function(response) {
            if(response !== 'yes') {
                navigator.id.raiseProvisioningFailure(failureMessage);
                return;
            }

            navigator.id.genKeyPair(function(publicKey) {
                $.post('/certificate', {
                    key: publicKey,
                    duration: cert_duration,
                    alias: email
                }, function(certificate) {
                    //alert(certificate);
                    navigator.id.registerCertificate(certificate);
                });

            });
        },
        error: function() {
                //alert(email);
                //var message = 'Not logged in as ' + email;
                //alert(message);
            return navigator.id.raiseProvisioningFailure(failureMessage);
        }
    });
});
