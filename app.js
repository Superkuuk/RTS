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
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');
var hbs = require('express-hbs');

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


app.use(session({secret: 'dinky toy with Duckface horse', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());

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
			console.log('File made, started making database...');
			
			var db = new sqlite3.Database(config.database_file); // automatically opens the database			
			db.serialize(function() {
				db.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY ASC, nickname TEXT, password TEXT)", function(err){
					if (err) throw err;
					console.log('Table created');
				});
				db.run("INSERT INTO accounts (nickname, password) VALUES (?,?)", ["Dinky", bcrypt.hashSync("Toy", 8)], function(err){
					if (err) throw err;
					console.log('Dinky created');
				});
			});
			db.close();
		});
	}
});


// =========================== Routing ===========================

app.get('/test', isLoggedIn, function(req, res) {
	// isLoggedIn will check if there is a user logged in. If not, redirect to '/', else, continue with this code:
	console.log(req.user);
});

app.get('/', function (req, res) {
  var playerIsLoggedIn = false;
  if(req.user){
  	console.log('User ' + req.user.username + ' is logged in!');
  	playerIsLoggedIn = true;
  }else{
  	console.log('There is no user logged in.');
  }
  console.log(__dirname + '/main/index.html');
  // res.sendFile(__dirname + '/main/index.html');
  res.render('main', {'loggedIn': playerIsLoggedIn, 'user': req.user});
});

app.get('/game', isLoggedIn, function (req, res) {
  console.log(__dirname + '/game/index.html');
  res.sendFile(__dirname + '/game/index.html');
});

app.get('/lobby', isLoggedIn, function (req, res) {
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
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/'
}));


//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/'
}));


//logs user out of site, deleting them from the session, and returns to homepage
app.post('/logout', function(req, res){
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

passport.use('local-login', new LocalStrategy( {passReqToCallback: true},
	function(req, username, password, done){
		funct.localAuth(username, password, (function(obj){
			if(obj.err == null){
				if(obj.user){
					console.log(obj.user.username + ' logged in.');
					req.session.success = 'You are successfully logged in, ' + obj.user.username + '!';
					done(null, obj.user);
				}else{
					console.log('Could not log user in. Please try again.');
					req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
					done(null, obj.user, { message: 'Incorrect password.' });			
				}
			}else{
				console.log('ERROR... : ' + obj.err.body);
			}	
		}));	
	}
));


passport.use('local-signup', new LocalStrategy( {passReqToCallback: true},
	function(req, username, password, done){
		funct.localReg(username, password, (function(obj){
			if(obj.err == null){
				if(obj.user){
					console.log(obj.user.username + ' registered!');
					req.session.success = 'You are successfully registerd and logged in, ' + obj.user.username + '!';
					done(null, obj.user);
				}else{
					console.log('Username already in use, try a different one.');
					req.session.error = 'Username already in use, try a different one.'; //inform user could not log them in
					done(null, obj.user, { message: 'Username already in use, try a different one.' });			
				}
			}else{
				console.log('ERROR... : ' + obj.err.body);
			}
		}));
	}
));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
} 

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