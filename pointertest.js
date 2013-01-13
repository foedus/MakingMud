var player = {
	'name': 'stu',
	'age': '30'
}

console.log(player);

var otherPlayer = player;

player.name = 'andrew';

console.log(player);
console.log(otherPlayer);