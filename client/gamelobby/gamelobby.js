var socket = io('/lobby');

socket.on('game close', function(){
	alert('Sorry! The host left the game, so the lobby is being closed. You can join another game, or host your own!');
	$( "#leave_game_lobby" ).submit();
});

socket.on('recieve message', function(msg){
	$('<p>'+msg+'</p>').appendTo('#chatList').delay(15000).fadeOut(1000, function(){
		// After 15 seconds fade out. After 1 second of fading out, remove the element (at 0 opacity)
		$(this).remove();
	});
});

socket.on('player joined', function(player){
	$('<tr><td>'+player+'</td><td>??????????</td><td>x</td></tr>').appendTo('#playerBox')
	$('<p>'+player+' joined the room!</p>').appendTo('#chatList').delay(15000).fadeOut(1000, function(){
		// After 15 seconds fade out. After 1 second of fading out, remove the element (at 0 opacity)
		$(this).remove();
	});
});

$('#chatBox').keyup(function(e){
	if(e.which == 13) {	// == enter
		var text = $('#chatBox').val();
		if(text == '/z0r'){
			var m = Math.floor((Math.random() * 7631) + 1);
			window.open('http://z0r.de/'+m, '_blank').focus();
		}else if(text != ''){
			socket.emit('send message', text);
		}
		$('#chatBox').val('');
	}
});

$( "#leave_game_lobby" ).submit(function( event ) {
	socket.emit('leave game lobby');
});