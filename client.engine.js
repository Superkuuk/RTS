// Engine class for all the socket actions
var socket = io();

// Testfunction, make a draggable test object
$(document).ready(function(){
//	Append test object
// 	$('<div id="block" style="position: absolute; height: 100px; width: 100px; background-color: red">draggable</div>').draggable({
// 		drag: function( event, ui ) {
// 			socket.emit('draggable move', ui.position);
// 		}
// 	}).appendTo('body');
});


// socket action for the test object
socket.on('draggable move return', function(position){
	$('#block').offset({ top: position.top, left: position.left});
});