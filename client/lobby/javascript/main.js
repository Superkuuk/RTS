var socket = io();

$(document).ready(function(){
	var w = (document.getElementById('tbl').offsetWidth - document.getElementById('tbl').clientWidth);
	$('table').css({
		'padding-right': w + 'px',
		'width': $('#hostList').width() + w
	});
});

function hostListClick(obj, id){
	$('#tbl tr').not(obj).removeClass('active');
	$(obj).toggleClass('active');
	if($(obj).hasClass('active')){
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form:eq(1)').append('<input type="hidden" value="'+id+'" readonly>');
		$('#mainMenu form input:eq(1)').prop('disabled', false);
	}else{
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form input:eq(1)').prop('disabled', true);
	}
}

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

$('#mainMenu form:eq(0)').submit(function(event){
	socket.emit('host game');
});

socket.on('host game return', function(game){
	$('<tr onclick="hostListClick(this, '+game.id+')"><td>'+game.host+'</td><td>'+game.description+'</td><td>'+game.players.length+'</td></tr>').appendTo('#tbl');
});