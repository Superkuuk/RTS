var config = require('../config.json'); //config file contains all tokens and other private info

module.exports = function(app, passport){

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
		if(config.debug) console.log('[Routes client files] ' + file + " requested.");
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
	app.get('/logout', function(req, res){
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
	app.get('/lobby', function(req, res){
		res.render('lobby', {'screen': 'normal'});
	});

	// sends user to the lobby view, with the host screen enabled
	app.get('/host', function(req, res){
		res.render('lobby', {'screen': 'host'});
	});
	
    //other routes..
}