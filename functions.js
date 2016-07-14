var bcrypt = require('bcryptjs');
var config = require('./config.json'); //config file contains all tokens and other private info
var sqlite3 = require("sqlite3").verbose();
console.log('functions loaded');

// Register
exports.localReg = function (username, password) {
	console.log('register called');
	var hash = bcrypt.hashSync(password, 8);
	var user = {
		"username": username,
		"password": hash
	}
	
	// check if user already exists
	var db = new sqlite3.Database(config.database_file);
	db.serialize(function() {
		db.each("SELECT nickname FROM accounts", function(err, row) {
			if(row.nickname == username){
				// error Username already exists
				console.log('Username already in use ('+username+')');
				db.close();	
				return false;
			}else{
				// username is free, insert player
				var stmt = db.run("INSERT INTO accounts VALUES (?,?)", [username, hash], function(err){
					// callback when finished with SQL query
					if(err == null){
						console.log(username + ' added to the database! New player, yay!');
					}else{
						console.log("INPUT FAIL:" + err.body);
					}
				});
				stmt.finalize();
			}
		});
	});	
	db.close();
	
	return user;
}

// Login
exports.localAuth = function (username, password) {
	console.log('login called');
	var	user = {
		"id": 0,
		"username": "dummie"
	}		
	// check if user matches existing user
	var db = new sqlite3.Database(config.database_file);
	db.serialize(function() {
		db.each("SELECT id, nickname, password FROM accounts", function(err, row) {
			if(bcrypt.compareSync(password, row.password)){
				console.log(row.nickname + ' logged in.');
				user = {
					"id": row.id,
					"username": row.nickname
				}				
				
			}else{
				console.log('Passwords mismatch. '+row.nickname+' failed to login.');
				db.close();	
				return false;
			}
		});
	});	
	db.close();	
	
	return user;
}