var gameList = [];
var uniqueGameID = 0;
var config = require('../config.json');

exports.update = function(gid, changes) {
	for(var i = 0; i < gameList.length; i++) {
		if(gameList[i].id == gid){
			// found the game which we want to change.
			// changes is an object with all the things we want to change. (ex. {host: 'Superkuuk'})
			for (var key in changes) {
				gameList[i][key] = changes[key];
			}
		}
	}
}

exports.add = function(hostname, description, max_players, password) {
	// add a new game to the gameList
	var d = new Date();
	var t = d.getTime();
	gameList.push( {id: uniqueGameID, host: hostname, description: description, max_players: max_players, password: password, players: [hostname], status: 'open', gameOpened: t, settings: {}} );
	uniqueGameID += 1;
	if(config.debug) console.log('==== Game added ====');
	if(config.debug) console.log(gameList);
	return (uniqueGameID - 1);
}

exports.addPlayer = function(gid, playerName) {
	for(var i = 0; i < gameList.length; i++) {
		if(gameList[i].id == gid){
			gameList[i].players.push(playerName);
		}
	}
	console.log('==== Player joined ====');
	console.log(gameList);
}

exports.removePlayer = function(gid, playerName) {
	for(var i = 0; i < gameList.length; i++) {
		if(gameList[i].id == gid){
			var index = gameList[i].players.indexOf(playerName);
			if (index > -1) gameList[i].players.splice(index, 1);
		}
	}
	console.log('==== Player removed ====');
	console.log(gameList);
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