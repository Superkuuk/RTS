var socket = io();

socket.emit('join room');

socket.on('change host', function(newHost){
	alert('Host left, ' + newHost + ' is now the host.');
});