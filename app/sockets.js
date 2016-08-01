var config = require('../config.json'); //config file contains all tokens and other private info
module.exports = function(games, io){
	
	io.on('connection', function (socket) {
		if(config.debug) console.log('[Sockets] A user connected');
	
		socket.on('disconnect', function(){
			if(config.debug) console.log('[Sockets] User disconnected');
		});
		
		socket.on('request config', function(){
			if(config.debug) console.log('[Sockets] Config requested');
			socket.emit('request config return', config);
		});

		socket.on('request games', function(){
			socket.emit('request games return', games.getList());
		});		
	});
	
	var lobbySocket = io.of('/lobby');
	lobbySocket.on('connection', function (socket) {
		if(config.debug) console.log('[Sockets] A user connected to namespace lobbySocket');
		if(socket.request.session.passport){
			var player_game_id = games.getPlayerGame(socket.request.session.passport.user.username);
			if(player_game_id != -1){
				socket.join('r'+player_game_id); 	// ex. r1 = game room 1	
													// this is needed, because all the integer rooms are taken by
													// the socket users. Each user joins automatically a room with it's
													// id. Therefore it's possible to send a message to a specific user (room)
				lobbySocket.to('r'+player_game_id).emit('player joined', socket.request.session.passport.user.username);
			}		
		}else{
			if(config.debug) console.log('[Sockets] A user who is not logged in, is trying to connect to lobbySocket.');
		}
		
		socket.on('send message', function(msg){
			var gid = games.getPlayerGame(socket.request.session.passport.user.username);
			lobbySocket.to('r'+gid).emit('recieve message', '['+socket.request.session.passport.user.username+'] '+msg);
		});
		
		socket.on('leave game lobby', function(){
			var gid = games.getPlayerGame(socket.request.session.passport.user.username);
			lobbySocket.to('r'+gid).emit('recieve message', socket.request.session.passport.user.username+' left the room.');
		});
		
		socket.on('disconnect', function(){
			if(config.debug) console.log('[Sockets] User disconnected from namespace lobbySocket');
			var gid = games.getIdByName(socket.request.session.passport.user.username); // gets the game if which the player is host.
			if(gid != null){
				games.remove(gid); // remove game, because the host is leaving.
				lobbySocket.to('r'+gid).emit('game close');
			}
		});		
	});

};