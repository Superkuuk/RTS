var gameList = [];
var uniqueGameID = 0;
var config = require('./config.json');

exports.add = function(hostname, description, max_players, password) {
	// add a new game to the gameList
	gameList.push( {id: uniqueGameID, host: hostname, description: description, max_players: max_players, password: password, players: [hostname], status: 'open'} );
	uniqueGameID += 1;
	if(config.debug) console.log('==== Game added ====');
	if(config.debug) console.log(gameList);
	return (uniqueGameID - 1);
}

exports.getList = function(){
	return gameList;
}

exports.getById = function(id){
	// filter all games that have the same id as specified. 1 game should be left over. Pass that game.
	var game = gameList.filter(function (el) {
					  return el.id == id;
				 });
	if(game){
		return game[0];
	}else{
		return null;
	}
}

exports.getIdByName = function(hostname){
	// filter all games that have the same id as specified. 1 game should be left over. Pass that game's id.
	var game = gameList.filter(function (el) {
					  return el.host == hostname;
				 });
	if(game[0]){
		return game[0].id;
	}else{
		return null;
	}
}

exports.remove = function(gid){
	// remove a game by it's id. Filter the list and keep everything except the one with the same ID.
	for(var i = 0; i < gameList.length; i++) {
		if(gameList[i].id == gid){
			gameList.splice(i, 1);
		}
	}
	if(config.debug) console.log('==== Game removed ====');
    if(config.debug) console.log(gameList);
}