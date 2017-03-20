var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create , update: update});

function preload() {

	//  You can fill the preloader with as many assets as your game requires
	//  Here we are loading an image. The first parameter is the unique
	//  string by which we'll identify the image later in our code.
	//  The second parameter is the URL of the image (relative)

	game.load.spritesheet('red_mage', "Assets/red_mage.png",32, 48,16);
	game.load.spritesheet('blue_mage', "Assets/blue_mage.png",32, 48,16);
	//game.load.image('fireball', "Assets/fireball.png");
	//game.load.image('iceball', "Assets/iceball.png");

}
var socket;
var testing;
var player;
var enemies;

var keys;
var bmpText;

function create() {
	game.stage.disableVisibilityChange = true;
	socket = io();

	game.physics.startSystem(Phaser.Physics.ARCADE);
	player = game.add.sprite(5,5,"red_mage");
	enemies = game.add.group();	
	game.physics.arcade.enable(player);
	keys = {
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
	};
	var style = { font: "bold 14px Arial", fill: "#fff" };

	//  The Text is positioned at 0, 100
	text = game.add.text(0, 0, "phaser 2.4 text bounds", style);
	socket.on("you", initMe);
	socket.on("enemies", initEnemies);
	socket.on("move", enemyMove);
	socket.on("user connected", newEnemy);
	socket.on("user disconnected", disconnect);

}
function initMe(me){
	player.kill();
	player = game.add.sprite(me.x,me.y,"red_mage");
	player.frame = 14;
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds = true;
	player.anchor.setTo(0.5, 0.5);
	player.id = me.id;
	//player.hp = 20;
}
function initEnemies(data){
	enemies.createMultiple(data.length, "blue_mage", 0, true);
	for (var i = 0; i < data.length; i++){
		enemies.children[i].x = data[i].x;
		enemies.children[i].y = data[i].y;
		enemies.children[i].id = data[i].id;
	}
	console.log("number of enemies: " + enemies.length);
}
function newEnemy(data){
	var enemy = game.add.sprite(data.x,data.y,"blue_mage");
	enemy.frame = 0;
	enemy.id = data.id;
	enemies.add(enemy);
}
function disconnect(id){
	console.log(id + " has disconnected");
	for (var i = enemies.length -1; i>=0; i--){
		console.log("still connected: " + enemies.children[i],id);
		if (enemies.children[i].id == id){
			enemies.removeChild(enemies.children[i]);
			console.log("removing " + id);
		}
	}
}
function update() {

	//text.text = 'HP: ' + player.hp;
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

//	if ( game.input.mousePointer.isDown ){
		//f = new Fireball (player.body.x, player.body.y,game.input.x, game.input.y);
		//f.sprite.events.onOutOfBounds.add(resetFireball(),this.sprite);
		//myFireballs.add(f);
		//fire();
	//}

	if (keys.left.isDown)
	{
		player.body.velocity.x = -300;
	}
	else if (keys.right.isDown)
	{
		player.body.velocity.x = 300;
	}

	if (keys.up.isDown)
	{
		player.body.velocity.y = -300;
	}
	else if (keys.down.isDown)
	{
		player.body.velocity.y = 300;
	}
	if (keys.space.isDown){
		//game.physics.arcade.moveToPointer(player,1000);
		player.body.velocity.x *= 3;
		player.body.velocity.y *= 3;
	}
	//if (player.body.velocity.y != 0 ||  player.body.velocity.x != 0){
	socket.emit("move", {x: player.x, y: player.y, id: player.id});
	//console.log("sending posistion: " + player.x + "," + player.y);
}
//}

function enemyMove(data){
	for (var i = 0; i < enemies.length; i++){
		if (enemies.children[i].id == data.id){
			enemies.children[i].x = data.x;
			enemies.children[i].y = data.y;
		}
	}
	console.log("recieved: " + data.x + "," + data.y + " from " + data.id);
}
