var bcrypt = require('bcryptjs');
var config = require('./config.json'); //config file contains all tokens and other private info
var sqlite3 = require("sqlite3").verbose();
var dbFile = config.database_path +'/'+ config.database_file;
console.log('functions loaded');

// Register
exports.localReg = function (username, password, callback) {
	console.log('register called');
	var hash = bcrypt.hashSync(password, 8);
	var user = false;
	var error = null;
	// check if user already exists
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() {
		db.each("SELECT nickname FROM accounts WHERE nickname = (?)", username, function(err, row) {
			if (err) throw err;
			console.log("Username, "+username+", already exists.");
		}, (function(err, numberOfRows){
			// callback after .each
			if(numberOfRows == 0){
				// username is free, insert player.
				db.run("INSERT INTO accounts (nickname, password) VALUES (?,?)", [username, hash], function(err){
					// callback after insert.
					if (err) throw err;
					console.log(username + ' added to the database! New player, yay!');
					user = {
						"username": username,
						"password": hash
					}
					db.close();
					callback({"err": err, "user": user});
				});
			}
		}));
	});
}


// Login
exports.localAuth = function (username, password, callback) {
	console.log('login called');
	var	user = false;
	var error = null;
	// check if user matches existing user
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() {
		db.each("SELECT id, nickname, password FROM accounts WHERE nickname = (?)", username, function(err, row) {
			if (err) throw err;
			if(bcrypt.compareSync(password, row.password)){
				// there is a mach!
				console.log(username + ' has good credentials!');
				user = {
					"id": row.id,
					"username": row.nickname
				}					
			}else{
				console.log('Error occurred when selecting from database: '+ err.body);
				error = err;
			}
		}, function(err, numberOfRows){	// completion of db.each function. Thus the end of the localAuth functions.
			db.close();
			callback({"err": error, "user": user});		
		});
	});
}