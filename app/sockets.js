var config = require('../config.json'); //config file contains all tokens and other private info
module.exports = function(io){

	io.on('connection', function (socket) {
		if(config.debug) console.log('[Sockets] A user connected');
	
		socket.on('disconnect', function(){
			if(config.debug) console.log('[Sockets] User disconnected');	
		});
		
		socket.on('request config', function(){
			if(config.debug) console.log('[Sockets] Config requested');
			socket.emit('request config return', config);
		});
	});

}