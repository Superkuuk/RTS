var socket = io();

socket.emit('join room');

socket.on('change host', function(newHost){
	alert('Host left, ' + newHost + ' is now the host.');
});

socket.on('join room return', function(game) {
	console.log('joined a game');
	for(var i = 0; i < game.players.length; i++) {
		$('<tr>  <td>'+game.players[i]+'</td><td>placeholder</td><td>xx</td>  </tr>').appendTo('#playerBox');
	}
});