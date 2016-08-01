var socket = io();

var games = [];

$(document).ready(function(){
	if($('#tbl').length == 1){
		var w = (document.getElementById('tbl').offsetWidth - document.getElementById('tbl').clientWidth);
		$('table').css({
			'padding-right': w + 'px',
			'width': $('#hostList').width() + w
		});
		
		// request every 5000ms = 5 sec the gamelist.
		setInterval(function(){ 
			socket.emit('request games');
		}, 2000);
	}
});

function newHost(){
	$.ajax({
	  url: "client/lobby/newgame.html"
	})
	  .done(function( html ) {
		$( "#hostList" ).html( html );
	  });
}

function hostListClick(obj, id){
	$('#tbl tr').not(obj).removeClass('active');
	$(obj).toggleClass('active');
	if($(obj).hasClass('active')){
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form:eq(0)').append('<input name="selectedGameRoom" type="hidden" value="'+id+'" readonly>');
		$('#mainMenu form input:eq(0)').prop('disabled', false);
	}else{
		$('#mainMenu form input[type=hidden]').remove();
		$('#mainMenu form input:eq(0)').prop('disabled', true);
	}
}

socket.on('request games return', function(gameList){
	var gids = [];
	$.each(gameList, function(index){
		gids.push(gameList[index].id);
	});
	// result: [2, 3, 4, 6, 8, ...]
	
	$('#tbl tr').each(function(index){ // update the existing ones.
		var gid = parseInt($(this).attr('gameid'));
		var exists = jQuery.inArray( gid, gids ); 	// check if shown game still exists
													// returns -1 if not, returns index in 'gids' if exists
		if(exists == -1){		// ==> game doesn't exist anymore
			$(this).remove();	// so remove it
		}else{					// ==> game does exist
			$(this).find('td:eq(2)').html(gameList[exists].players.length); // update nr of players
		}
		
		gids.splice(exists, 1); 	// remove all the existing (shown) games from 'gids'.
								// anything remaining in 'gids' needs to be added to the list.
		gameList.splice(exists, 1);		// do the same with the gameList. These aren't needed anymore.
										// If we delete them. The code above can still be run (use exists)
	});
	
	$.each(gameList, function(index){
		// anything remaining in 'gameList' are new games.
		// Add those games to the table
		$('<tr gameid='+gameList[index].id+' onclick="hostListClick(this, '+gameList[index].id+')"><td>'+gameList[index].host+'</td><td>'+gameList[index].description+'</td><td>'+gameList[index].players.length+'</td></tr>').appendTo('#tbl');
	});
});