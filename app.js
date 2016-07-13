console.log('Starting game server...');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// =========================== Authentication Setup ===========================



// =========================== Routing ===========================
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/main/index.html');
});

app.get('/game', function (req, res) {
  console.log(__dirname + '/game/index.html');
  res.sendFile(__dirname + '/game/index.html');
});

app.get('/lobby', function (req, res) {
  console.log(__dirname + '/lobby/index.html');
  res.sendFile(__dirname + '/lobby/index.html');
});

	//This handler will listen for requests on /*, any file from the root of our server.
	//See expressjs documentation for more info on routing.

app.get( '/*' , function( req, res, next ) {

	// TODO add file security. Limit sending files to only the files that are needed.

	//This is the current file they have requested
	var file = req.params[0];
	console.log(file + " requested.");
	res.sendFile( __dirname + '/' + file );

});


// =========================== Authentication ===========================

  

// =========================== Functions ===========================
io.on('connection', function (socket) {
	console.log('A user connected');
	
	socket.on('disconnect', function(){
		console.log('User disconnected');
	});

  socket.on('draggable move', function(position){
    socket.broadcast.emit('draggable move return', position);
  });

	// TODO add [player] before message.
  socket.on('chat message', function(msg){
    io.emit('chat message return', msg);
  });

});


// =========================== Listen ===========================
server.listen(8080, function(){
	console.log('Real-Time Strategy Game server running on *:8080');
	console.log('A game by Rutger Frieswijk');
});