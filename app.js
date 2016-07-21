console.log('[Startup] Starting game server...');

var app = require('express')();
var server = require('http').Server(app);
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var fs = require("fs");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');
var hbs = require('express-hbs');
var SQLiteStore = require('connect-sqlite3')(session);

var config = require('./config.json'); // all configurable options for easy tweaking :)   
var games = require('./games.js');

var sessionMiddleware = session({
    name: "LegioI",
    secret: "dinkytoywithDuckfacehorse",
    store: new SQLiteStore({dir: config.database_path}),
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
});

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());

var io = require("socket.io")(server).use(function(socket, next){
        // Wrap the express middleware
        sessionMiddleware(socket.request, {}, next);
    });

// routes
require('./app/routes')(app, passport, games);
// passport setup
require('./app/passport')(passport);
// sockets
require('./app/sockets')(io, games);


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
						if(config.debug) console.log('[Startup] Database seems legit! Continuing...');
					}
				}else{
					// make file in existing directory
					if(config.debug) console.log('[Startup] Database file is missing, making one...');
					makeDatabaseFile();
				}
			});
		}
	}else{
		if(config.debug) console.log('[Startup] Database directory and database file are missing, making directory and file...');
		// make directory
		fs.mkdir(config.database_path);
		// make file
		makeDatabaseFile();
	}
});

function makeDatabaseFile() {
	var databaseFile = config.database_path + '/' + config.database_file;
	fs.writeFile(databaseFile, '', (err) => {
		if(config.debug) console.log('[Startup] File made, filling database!');
		if (err) throw err;
		var db = new sqlite3.Database(databaseFile); // automatically opens the database			
		db.serialize(function() {
			db.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY ASC, nickname TEXT, password TEXT)", function(err){
				if (err) throw err;
				if(config.debug) console.log('[Startup] Table created');
			});
			db.run("INSERT INTO accounts (nickname, password) VALUES (?,?)", ["Dinky", bcrypt.hashSync("Toy", 8)], function(err){
				if (err) throw err;
				if(config.debug) console.log('[Startup] Dinky created'); // test account
			});
		});
		db.close();
	});
}


// =========================== Handlebars ===========================
// This section adds more conditions for use in handlebars.
// Use these conditions as: {{#ifCond var1 '==' var2}}
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
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


// =========================== Listen ===========================
server.listen(8080, function(){
	console.log('[Startup] Server running on *:8080');
	console.log('[Startup] A game by Rutger Frieswijk');
});