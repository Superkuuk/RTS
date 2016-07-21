var bcrypt = require('bcryptjs');
var config = require('./config.json'); //config file contains all tokens and other private info
var sqlite3 = require("sqlite3").verbose();
var dbFile = config.database_path +'/'+ config.database_file;
if(config.debug) console.log('functions loaded');

// Register
exports.localReg = function (username, password, callback) {
	if(config.debug) console.log('register called');
	var hash = bcrypt.hashSync(password, 8);
	var user = false;
	var err = null;
	// check if user already exists
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() {
		var existing = false;
		db.each("SELECT nickname FROM accounts WHERE nickname = (?)", username, function(err, row) {
			if (err) throw err;
			if(config.debug) console.log("Username, "+username+", already exists.");
			existing = true;
		}, (function(err, numberOfRows){
			// callback after .each
			if(config.debug) console.log("Callback after .each started. Number of rows: " + numberOfRows);

			if(!existing){
				// username is free, insert player.
				db.run("INSERT INTO accounts (nickname, password) VALUES (?,?)", [username, hash], function(err){
					// callback after insert.
					if (err) throw err;
					if(config.debug) console.log(username + ' added to the database! New player, yay!');
				});
				db.each("SELECT id, nickname FROM accounts WHERE nickname = (?)", username, function(err, row) {
					if (err) throw err;
					user = {
						"id": row.id,
						"username": row.nickname
					}	
				}, function(err, numberOfRows){
					db.close();
					callback({"err": err, "user": user});
				});
			}else{
				db.close();
				callback({"err": err, "user": user});			
			}
		}));
	});
}


// Login
exports.localAuth = function (username, password, callback) {
	if(config.debug) console.log('login called');
	var	user = false;
	var err = null;
	// check if user matches existing user
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() {
		db.each("SELECT id, nickname, password FROM accounts WHERE nickname = (?)", username, function(err, row) {
			if (err) throw err;
			if(bcrypt.compareSync(password, row.password)){
				// there is a mach!
				if(config.debug) console.log(username + ' has good credentials!');
				user = {
					"id": row.id,
					"username": row.nickname
				}					
			}else{
				if(config.debug) console.log(username + ' tried to log in, but failed. Bad credentials.');
			}
		}, function(err, numberOfRows){	// completion of db.each function. Thus the end of the localAuth functions.
			db.close();
			callback({"err": err, "user": user});		
		});
	});
}