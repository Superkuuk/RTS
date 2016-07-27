var LocalStrategy = require('passport-local').Strategy;
var config = require('../config.json'); //config file contains all tokens and other private info
var auth = require('./authentication.js'); //funct file contains our helper functions for our Passport and database work

module.exports = function(passport){

	// Passport session setup.
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	passport.use('local-login', new LocalStrategy( {passReqToCallback: true},
		function(req, username, password, done){
			if(config.debug) console.log('[Passport] Login strategy called.');
			auth.localAuth(username, password, (function(obj){
				if(obj.err == null){
					if(obj.user){
						if(config.debug) console.log('[Passport] ' +obj.user.username + ' logged in.');
						done(null, obj.user);
					}else{
						if(config.debug) console.log('[Passport] Could not log user in. Please try again.');
						req.session.error = 'Could not log in. Please try again.'; //inform user could not log them in
						done(null, obj.user, { message: 'Incorrect password.' });			
					}
				}else{
					if(config.debug) console.log('[Passport] ERROR... : ' + obj.err.body);
				}	
			}));	
		}
	));


	passport.use('local-signup', new LocalStrategy( {passReqToCallback: true},
		function(req, username, password, done){
			auth.localReg(username, password, (function(obj){
				if(obj.err == null){
					if(obj.user){
						if(config.debug) console.log('[Passport] ' + obj.user.username + ' registered!');
						req.session.success = 'You are successfully registerd and logged in, ' + obj.user.username + '!';
						done(null, obj.user);
					}else{
						if(config.debug) console.log('[Passport] Username already in use, try a different one.');
						req.session.error = 'Username already in use, try a different one.'; //inform user could not log them in
						done(null, obj.user, { message: 'Username already in use, try a different one.' });			
					}
				}else{
					if(config.debug) console.log('[Passport] ERROR... : ' + obj.err.body);
				}
			}));
		}
	));
}