self.on('message', function(email) {
    var field = document.querySelector('.janus_requested');
    field.value = email;
    field.className = field.className.replace('janus_requested', '');
});
