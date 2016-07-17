var socket = io();

var chatOpened = false;
$(document).ready(function(){
	$( "body" ).keypress(function(key) {
		if(key.which == 13 && chatOpened == false){
			// Enter pressed. Open chatbox
			chatOpened = true;
			$('<div class="chatBox"><input type="text" name="chatboxInput"><input type="submit" value="Send"></div>').appendTo('body');
			$( ".chatBox input[type=text]" ).focus();
		}else if(key.which == 13 && chatOpened == true){
			// Enter pressed and chat is already open, so submit and close (see action @ click function)
			$( ".chatBox input[type=submit]" ).click();
		}
	});


	$( "body" ).on( "click", 'input[type=submit]',function() {		
		var text = $('.chatBox input[type=text]').val();
		if(text != ''){
			socket.emit('chat message', text);
		}
		$('.chatBox').remove();
		chatOpened = false;
	});
});

// display a new chat message in the chat list
socket.on('chat message return', function(msg){
	var h = $('#chatList').height();
	$('<p>'+msg+'</p>').appendTo('#chatList').delay(20000).fadeOut(1000, function(){
		// After 20 seconds fade out. After 1 second of fading out, remove the element (at 0 opacity)
		$(this).remove();
	});
});