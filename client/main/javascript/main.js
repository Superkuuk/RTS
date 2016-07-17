var socket = io();

// set config variable with defaults. Just in case that someone is really, really fast! (or the server a bit slow ;) )
var config = {user_restrictions: {password_length: 5, username_length: 3}};
socket.emit('request config');
socket.on('request config return', function(config_recieved){
	config = config_recieved;
});

$(document).ready(function(){
	if($( window ).height() < 400) alert("You're playing in a too small window! Minimal height is 400px");
	if($( window ).width() < 620) alert("You're playing in a too small window! Minimal width is 620px");
});

$( window ).resize(function() {
	if($( window ).height() < 400) alert("You're playing in a too small window! Minimal height is 400px");
	if($( window ).width() < 620) alert("You're playing in a too small window! Minimal width is 620px");
});