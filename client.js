var socket = io();

$(document).ready(function(){
	$('<div id="block" style="position: absolute; height: 100px; width: 100px; background-color: red">draggable</div>').draggable({
		drag: function( event, ui ) {
			socket.emit('draggable move', ui.position);
		}
	}).appendTo('body'); 
});

socket.on('draggable move', function(position){
	$('#block').offset({ top: position.top, left: position.left});
});