var socket = io();

// set config variable with defaults. Just in case that someone is really, really fast! (or the server a bit slow ;) )
var config = {user_restrictions: {password_length: 5, username_length: 3}};
socket.emit('request config');
socket.on('request config return', function(config_recieved){
	config = config_recieved;
});

$(document).ready(function(){
});

function toggleNewPlayer() {
	$('#loginForm p').html('New Player');
	$("#loginForm input[type=submit]").remove();
	$("<input id='retypePassword' type='password' placeholder='retype password' name='password2'>").insertAfter('#loginForm form input[type=password]');
	$("<input type='submit' value='add player' onclick='addPlayer()'>").insertAfter("#loginForm form");
	$("<span style='color:red;'></span>").insertAfter("#loginForm form");
	
	$("#loginForm form").prop('action', '/signup');
}

function addPlayer() {
	var error_message = false;
	
	// add Player
	if($("#loginForm input[type=password]:first").val().length < config.user_restrictions.password_length ){
		error_message = "Password is too short!<br>";
	}
	if($("#loginForm input[type=text]").val().length < config.user_restrictions.username_length ){
		error_message += "Name is too short!<br>";
	}
	if( $("#loginForm input[type=password]:first").val() != $("#loginForm input[type=password]:last").val()){
		error_message += "Passwords don't match!<br>";
	}
	
	// TODO check if username already exists:
	if(false){
		error_message += "Username already taken.<br>";
	}
	if(error_message){
		$("#loginForm span").html(error_message);
	}else{
//		$("#retypePassword").attr("disabled", true);
		$("#loginForm form").submit();
//		$("#retypePassword").attr("disabled", false);
	}
}

$("#loginForm form").submit(function(event){
	event.preventDefault();
	addPlayer();
});