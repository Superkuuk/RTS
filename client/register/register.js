var socket = io();

// set config variable with defaults. Just in case that someone is really, really fast! (or the server a bit slow ;) )
var config = {user_restrictions: {password_min_length: 5, username_min_length: 3}};
socket.emit('request config');
socket.on('request config return', function(config_recieved){
	config = config_recieved;
});

$(document).ready(function(){
	if($('.errorField').html() == ''){
		$('.errorField').hide();
	}
	$('#loginForm input[type=submit]').prop('disabled', true);
	$( "#loginForm input" ).keyup(function() { // username textfield
		if($( "#loginForm input:eq(0)" ).val().length < (config.user_restrictions.username_min_length)){
			$('.errorField').css('top', $("#loginForm input:eq(0)").offset().top - 14);
			$('.errorField').html('Username too short. Use minimal 3 characters');
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else if($( "#loginForm input:eq(1)" ).val().length < (config.user_restrictions.password_min_length)){
			$('.errorField').css('top', $("#loginForm input:eq(1)").offset().top - 14);
			$('.errorField').html('Password too short. Use minimal 5 characters');
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else if($( "#loginForm input:eq(1)" ).val() != $( "#loginForm input:eq(2)" ).val()){
			$('.errorField').css('top', $("#loginForm input:eq(2)").offset().top - 14);
			$('.errorField').html("Passwords don't match!");
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else{
			$('.errorField').hide();
			$('#loginForm input[type=submit]').prop('disabled', false);
		}
	});
	$( "#loginForm input" ).focus(function() { // username textfield
		if($( "#loginForm input:eq(0)" ).val().length < (config.user_restrictions.username_min_length)){
			$('.errorField').css('top', $("#loginForm input:eq(0)").offset().top - 14);
			$('.errorField').html('Username too short. Use minimal 3 characters');
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else if($( "#loginForm input:eq(1)" ).val().length < (config.user_restrictions.password_min_length)){
			$('.errorField').css('top', $("#loginForm input:eq(1)").offset().top - 14);
			$('.errorField').html('Password too short. Use minimal 5 characters');
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else if($( "#loginForm input:eq(1)" ).val() != $( "#loginForm input:eq(2)" ).val()){
			$('.errorField').css('top', $("#loginForm input:eq(2)").offset().top - 14);
			$('.errorField').html("Passwords don't match!");
			$('.errorField').show();
			$('#loginForm input[type=submit]').prop('disabled', true);
		}else{
			$('.errorField').hide();
			$('#loginForm input[type=submit]').prop('disabled', false);
		}
	});
});