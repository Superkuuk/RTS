var socket = io();
var gameToJoin = false;


$(document).ready(function(){
	var w = (document.getElementById('tbl').offsetWidth - document.getElementById('tbl').clientWidth);
	$('table').css({
		'padding-right': w + 'px',
		'width': $('#hostList').width() + w
	});
});

$('#hostList tr').click(function(){
	$('#hostList tr').not(this).removeClass('active');
	$(this).toggleClass('active');
	gameToJoin = $('#hostList tr').index($('.active')); // 0 based index for the game selected
	if(gameToJoin != -1){
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form:eq(1)').append('<input type="hidden" value="'+gameToJoin+'" readonly>');
		$('#mainMenu form input:eq(1)').prop('disabled', false);
	}else{
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form input:eq(1)').prop('disabled', true);
	}
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