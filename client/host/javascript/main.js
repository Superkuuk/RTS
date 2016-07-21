var socket = io();

$(document).ready(function(){
});

$('#chatBox').keypress(function(e){
	if(e.which == 13 && $('#chatBox').val().length != 0){
		socket.emit('chat message', $('#chatBox').val());
		$('#chatBox').val('');
	}
});

// display a new chat message in the chat list
socket.on('chat message return', function(msg){
	$('<p>'+msg+'</p>').appendTo('#chatList').delay(15000).fadeOut(1000, function(){
		// After 20 seconds fade out. After 1 second of fading out, remove the element (at 0 opacity)
		$(this).remove();
	});
});