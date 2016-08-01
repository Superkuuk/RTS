var config = require('../config.json'); //config file contains all tokens and other private info

module.exports = function(app, passport, games){

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
		res.render('main', {'error': error, 'errorMsg': errorMsg});
	});

	//This handler will listen for requests on /client/*, any file from the client directory of our server.
	app.get( '/client/*' , function( req, res, next ) {
		//This is the current file they have requested
		var file = req.params[0];
		if(config.show_requested_files_in_log) console.log('[Routes client files] ' + file + " requested.");
		res.sendFile(file, { root: __dirname + '/../client' });
	});

	//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/lobby',
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

	// sends user to the lobby view.
	app.get('/lobby', isLoggedIn, function(req, res){
		res.render('lobby', {'username': req.user.username});
	});

	// sends user back to the lobby view, from the gamelobby. 
	app.post('/lobby', isLoggedIn, function(req, res){
		games.removePlayer(req.body.gid, req.user.username);
		res.render('lobby', {'username': req.user.username});
	});

	// sends user to the game lobby view.
	app.post('/gamelobby', isLoggedIn, function(req, res){
		var password = null;
		if(req.body.check) password = req.body.pass;
		var return_value = games.add(req.user.username, req.body.description, req.body.nrOfPlayers, password);
		if(return_value == 'error'){
			res.render('lobby', {'username': req.user.username});
		}else{
			res.render('gamelobby', {'description': req.body.description, 'gid': games.getIdByName(req.user.username)});
		}
	});
	
	// sends user to the lobby view.
	app.post('/join', isLoggedIn, function(req, res){
		if(games.getPlayerGame(req.user.username) == -1){ // user is not in a game
			var gid = req.body.selectedGameRoom;
			var game = games.getById(gid);
			games.addPlayer(gid, req.user.username);
			res.render('gamelobby', {'description': game.description, 'gid': gid});
		}else{ // user is already in a game
			res.render('lobby', {'username': req.user.username});
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