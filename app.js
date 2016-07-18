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
var SQLiteStore = require('connect-sqlite3')(session);

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(session({
	store: new SQLiteStore({dir: 'auth/'}),
	secret: 'your secret',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));
// app.use(session({secret: 'dinky toy with Duckface horse', cookie: { maxAge: 60*60*1000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());

      
var config = require('./config.json'); // all configurable options for easy tweaking :)
var funct = require('./functions.js'); //funct file contains our helper functions for our Passport and database work

// =========================== Database Setup ===========================
var sqlite3 = require("sqlite3").verbose();

fs.stat(config.database_path, function(err, stats) {
	if (err == null) {
		if(stats.isDirectory()){
			// Directory is already there. No need to make a new one.
			var databaseFile = config.database_path + '/' + config.database_file;
			fs.stat(databaseFile, function(err, stats) {
				if (err == null) {
					if(stats.isFile()){
						// File is already there. No need to make a new file.
						if(config.debug) console.log('Database seems legit! Continuing...');
					}
				}else{
					// make file in existing directory
					if(config.debug) console.log('Database file is missing, making one...');
					makeDatabaseFile();
				}
			});
		}
	}else{
		if(config.debug) console.log('Database directory and database file are missing, making directory and file...');
		// make directory
		fs.mkdir(config.database_path);
		// make file
		makeDatabaseFile();
	}
});

function makeDatabaseFile() {
	var databaseFile = config.database_path + '/' + config.database_file;
	fs.writeFile(databaseFile, '', (err) => {
		if(config.debug) console.log('File made, filling database!');
		if (err) throw err;
		var db = new sqlite3.Database(databaseFile); // automatically opens the database			
		db.serialize(function() {
			db.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY ASC, nickname TEXT, password TEXT)", function(err){
				if (err) throw err;
				if(config.debug) console.log('Table created');
			});
			db.run("INSERT INTO accounts (nickname, password) VALUES (?,?)", ["Dinky", bcrypt.hashSync("Toy", 8)], function(err){
				if (err) throw err;
				if(config.debug) console.log('Dinky created'); // test account
			});
		});
		db.close();
	});
}


// =========================== Routing ===========================
app.get('/', function (req, res) {
  var playerIsLoggedIn = false;
  if(req.user){
	if(config.debug) console.log('User ' + req.user.username + ' is logged in!');
	playerIsLoggedIn = true;
  }else{
	if(config.debug) console.log('There is no user logged in.');
  }
  res.render('main', {'loggedIn': playerIsLoggedIn, 'user': req.user, 'login': true, 'errorMsg': req.session.error});
  req.session.error = '';
});

app.get('/game', isLoggedIn, function (req, res) {
  res.render('game');
});

app.get('/lobby', isLoggedIn, function (req, res) {
  res.render('lobby');
});

app.get('/host', isLoggedIn, function (req, res) {
  res.render('lobby', {'screen': 'host'});
});

//This handler will listen for requests on /client/*, any file from the client directory of our server.
app.get( '/client/*' , function( req, res, next ) {
	//This is the current file they have requested
	var file = req.params[0];
	if(config.debug) console.log(file + " requested.");
	res.sendFile( __dirname + '/client/' + file );
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/register'
}));

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/'
}));

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.username;
  if(config.debug) console.log("LOGGIN OUT " + name)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});

app.get('/register', function(req, res){
  res.render('main', {'loggedIn': false, 'user': req.user, 'login': false, 'errorMsg': req.session.error});
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
		if(config.debug) console.log('Login strategy called.');
		funct.localAuth(username, password, (function(obj){
			if(obj.err == null){
				if(obj.user){
					if(config.debug) console.log(obj.user.username + ' logged in.');
					req.session.success = 'You are successfully logged in, ' + obj.user.username + '!';
					done(null, obj.user);
				}else{
					if(config.debug) console.log('Could not log user in. Please try again.');
					req.session.error = 'Could not log in. Please try again.'; //inform user could not log them in
					done(null, obj.user, { message: 'Incorrect password.' });			
				}
			}else{
				if(config.debug) console.log('ERROR... : ' + obj.err.body);
			}	
		}));	
	}
));


passport.use('local-signup', new LocalStrategy( {passReqToCallback: true},
	function(req, username, password, done){
		funct.localReg(username, password, (function(obj){
			if(obj.err == null){
				if(obj.user){
					if(config.debug) console.log(obj.user.username + ' registered!');
					req.session.success = 'You are successfully registerd and logged in, ' + obj.user.username + '!';
					done(null, obj.user);
				}else{
					if(config.debug) console.log('Username already in use, try a different one.');
					req.session.error = 'Username already in use, try a different one.'; //inform user could not log them in
					done(null, obj.user, { message: 'Username already in use, try a different one.' });			
				}
			}else{
				if(config.debug) console.log('ERROR... : ' + obj.err.body);
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


// =========================== Handlebars ===========================
// use these conditions as: {{#ifCond var1 '==' var2}}
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


// =========================== Functions ===========================
io.on('connection', function (socket) {
	if(config.debug) console.log('A user connected');
	
	socket.on('disconnect', function(){
		if(config.debug) console.log('User disconnected');
	});

	socket.on('chat message', function(msg){
		msg = '[' + 'player placeholder' + '] ' + msg;
		io.emit('chat message return', msg);
	});
	
	socket.on('request config', function(){
		socket.emit('request config return', config);
	});
});


// =========================== Listen ===========================
server.listen(8080, function(){
	console.log('Server running on *:8080');
	console.log('A game by Rutger Frieswijk');
});