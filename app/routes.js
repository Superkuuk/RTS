var config = require('../config.json'); //config file contains all tokens and other private info

module.exports = function(app, passport, games, io){

	app.get('/', function (req, res) {
		var error = false,
			errorMsg = 'error message',
			username = false;
		if(req.session.error){
			errorMsg = req.session.error;
			error = true;
			req.session.error = '';
		}
		if(req.user){
			username = req.user.username;
		}
		res.render('main', {'username': username, 'error': error, 'errorMsg': errorMsg});
	});

	//This handler will listen for requests on /client/*, any file from the client directory of our server.
	app.get( '/client/*' , function( req, res, next ) {
		//This is the current file they have requested
		var file = req.params[0];
		if(config.show_requested_files_in_log) console.log('[Routes client files] ' + file + " requested.");
		res.sendFile(file, { root: __dirname + '/../client' });
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
	app.get('/logout', isLoggedIn, function(req, res){
		var name = req.user.username;
		req.logout();
		res.redirect('/');
		if(config.debug) console.log("[Passport] LOGGIN OUT " + name)
		req.session.notice = "You have successfully been logged out " + name + "!";
	});
	
	// sends user to register view.
	app.get('/register', function(req, res){
		res.render('register');
	});

	// sends user to the lobby view.
	app.get('/lobby', isLoggedIn, function(req, res){
		res.render('lobby', {'screen': 'normal'});
	});

	// sends user to the lobby view, with the host screen enabled
	app.get('/host', isLoggedIn, function(req, res){
		if(req.user.host){
			// there is already a game with this user as a host. And you can't host two games...
			res.render('lobby', {'screen': 'already hosting'});
		}else{
			res.render('lobby', {'screen': 'host'});
		}
	});
	
	app.get('/removegame', isLoggedIn, function(req, res){
		if(req.user.host){
			// there is already a game with this user as a host. And you can't host two games...
			games.remove(req.user.currentGame);
			req.user.host = false;
			req.user.currentGame = null;
		}
		res.render('lobby', {'screen': 'host'});
	});

	// sends user to the lobby view, with the host screen enabled
	app.post('/gamelobby', isLoggedIn, function(req, res){
		if(req.user.host){
			// there is already a game with this user as a host. And you can't host two games...
			res.render('lobby', {'screen': 'already hosting'});
		}else{
			// So there isn't a game you're hosting? OK. Let's go play!
			req.user.host = true;
		
			var password = null;
			if(req.body.check) password = req.body.pass;
			req.user.currentGame = games.add(req.user.username, req.body.description, req.body.nrOfPlayers, password);
									
			res.render('gamelobby', {'description': req.body.description});
		}
	});


// 		var db = req.sessionStore.db;
// 		db.serialize(function() {
// 			db.each("SELECT sess FROM sessions", function(err, row) {
// 					if (err) throw err;
// 					if ('passport' in JSON.parse(row.sess)) {
// 						console.log( JSON.parse(row.sess).passport );
// 					}
// 				});
// 		});


	app.get('/quitgamelobby', isLoggedIn, function(req, res){	
		var game = games.getById(req.user.currentGame);
		if(req.user.host){
			// there is already a game with this user as a host. And you can't host two games...
			if(game.players.length > 1){
				// there are more players in the room.
				// tell everyone that there is a new host:
				io.to(req.user.currentGame).emit('change host', game.players[1]);

				var db = req.sessionStore.db;
				var JSON_new = null;
				var sid = null;
				db.serialize(function() {
					db.each("SELECT sess FROM sessions", function(err, row) {
						if (err) throw err;
						if ('passport' in JSON.parse(row.sess)) {
							if(JSON.parse(row.sess).passport.user.username == game.players[1]){
								sid = row.sid;
								var newHost = JSON.parse(row.sess);
								newHost.passport.user.host = true;
								JSON_new = JSON.stringify(newHost);
								db.run("UPDATE sessions SET sess = ? WHERE sid = ?", JSON_new, sid);
								games.update(game.id, {host: game.players[1]});
								games.removePlayer(req.user.currentGame, req.user.username);
								req.user.host = false;
								req.user.currentGame = null;
							}
						}
					});
				});	
				
			}else{
				games.remove(game.id);
				req.user.host = false;
				req.user.currentGame = null;
			}
		}else{
			games.removePlayer(req.user.currentGame, req.user.username);
			req.user.host = false;
			req.user.currentGame = null;
		}
		res.render('lobby', {'screen': 'normal'});
	});
	
	app.get('/joinashost', isLoggedIn, function(req, res){
		if(req.user.host){
			var game = games.getById(req.user.currentGame);
			res.render('gamelobby', {'description': game.description});
		}else{
			res.render('lobby', {'screen': 'normal'});
		}
	});

	app.post('/join', isLoggedIn, function(req, res){
		if(req.user.host){
			res.render('lobby', {'screen': 'already hosting'});
		}else{
			var game = games.getById(req.body.selectedGameRoom);
			games.addPlayer(game.id, req.user.username);
			req.user.currentGame = game.id;
			res.render('gamelobby', {'description': game.description});
		}
	});
	
    //other routes..
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
} 