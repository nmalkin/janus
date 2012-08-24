self.on('click', function (node, data) {
    node.className += ' janus_requested';
    self.postMessage('request');
});
