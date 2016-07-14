console.log('Starting game server...');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var fs = require("fs");
var bodyParser = require('body-parser');

app.use(session({secret: 'dinky toy with Duckface horse', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var config = require('./config.json'); // all configurable options for easy tweaking :)
var funct = require('./functions.js'); //funct file contains our helper functions for our Passport and database work

// =========================== Database Setup ===========================
var database_exists = false;
var sqlite3 = require("sqlite3").verbose();

fs.stat(config.database_file, function(error, stats) {
	if(error == null){
		if(stats.isFile()){
			console.log('database found!');
			database_exists = true;
		}
	}else{
		console.log('No database file found! Creating one...');
		fs.writeFile(config.database_file, '', (err) => {
		  if (err) throw err;
		  console.log('It\'s made!');
		});
		
		// create table for the new database:
		var db = new sqlite3.Database(config.database_file);
		db.serialize(function() {
			db.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY ASC, nickname TEXT, password TEXT)");
		});
		db.close();
	}
});


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

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/signin', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/'
}));

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/'
}));


//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGIN OUT " + name)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});


// =========================== Authentication ===========================
// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// [NEEDS REWRITE!] Use the LocalStrategy within Passport to login/”signin” users.
passport.use('local-login', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        console.log('You are successfully logged in ' + user.username + '!');
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        console.log('Could not log user in. Please try again.');
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));


// [NEEDS REWRITE!] Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));


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
	
	socket.on('request config', function(){
		socket.emit('request config return', config);
	});
});


// =========================== Listen ===========================
server.listen(8080, function(){
	console.log('Real-Time Strategy Game server running on *:8080');
	console.log('A game by Rutger Frieswijk');
});