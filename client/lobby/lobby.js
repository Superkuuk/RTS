var socket = io();

// set config variable with defaults. Just in case that someone is really, really fast! (or the server a bit slow ;) )
var config = {user_restrictions: {password_min_length: 5, username_min_length: 3}};
socket.emit('request config');
socket.on('request config return', function(config_recieved){
	config = config_recieved;
	$('#StartHostGameForm input[type=number]').prop('min', config.game_restrictions.min_players);
	$('#StartHostGameForm input[type=number]').prop('max', config.game_restrictions.max_players);
	$('#StartHostGameForm input[type=text]').prop('maxlength', config.game_restrictions.description_max_length);
});
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

socket.on('request games return', function(gameList){
	if(gameList.length > games.length){
		$.each(gameList, function(index){
			if(!games[index]) {
				// new games found. Add those games to the table
				$('<tr gameid='+gameList[index].id+' onclick="hostListClick(this, '+gameList[index].id+')"><td>'+gameList[index].host+'</td><td>'+gameList[index].description+'</td><td>'+gameList[index].players.length+'</td></tr>').appendTo('#tbl');
			}
		});
	}else{
		$.each(games, function(index){
			if(!gameList[index]) {
				$('#tbl tr[gameid='+games[index].id+']').remove();
			}
		});	
	}
	games = gameList;
});