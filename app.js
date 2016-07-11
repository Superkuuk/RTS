console.log('Starting game server...');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

	//This handler will listen for requests on /*, any file from the root of our server.
	//See expressjs documentation for more info on routing.

app.get( '/*' , function( req, res, next ) {

	//This is the current file they have requested
	var file = req.params[0];
	console.log(file + " requested.");
	res.sendFile( __dirname + '/' + file );

});
    
// Various functions:
io.on('connection', function (socket) {
	console.log('A user connected');
	
	socket.on('disconnect', function(){
		console.log('User disconnected');
	});

  socket.on('draggable move', function(position){
    socket.broadcast.emit('draggable move', position);
  });

});

server.listen(8080, function(){
	console.log('Real-Time Strategy Game server running on *:8080');
	console.log('A game by Rutger Frieswijk');
});