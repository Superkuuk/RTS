var gameList = [];
var uniqueGameID = 0;

exports.add = function(hostname) {
	// add a new game to the gameList
	gameList.push( {id: uniqueGameID, host: hostname, description: 'placeholder for description', players: [hostname], status: 'open'} );
	uniqueGameID += 1;
}

exports.getList = function(){
	return gameList;
}

exports.getById = function(id){
	// filter all games that have the same id as specified. 1 game should be left over. Pass that game.
	var game = gameList.filter(function (el) {
                      return el.id == id;
                 });
	return game[0];
}

exports.getIdByName = function(hostname){
	// filter all games that have the same id as specified. 1 game should be left over. Pass that game's id.
	var game = gameList.filter(function (el) {
                      return el.host == hostname;
                 });
	return game[0].id;
}

exports.remove = function(id){
	// remove a game by it's id. Filter the list and keep everything except the one with the same ID.
	gameList = gameList.filter(function (el) {
                      return el.id !== id;
                 });
}