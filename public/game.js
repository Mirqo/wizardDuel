var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create , update: update});

function preload() {

	//  You can fill the preloader with as many assets as your game requires
	//  Here we are loading an image. The first parameter is the unique
	//  string by which we'll identify the image later in our code.
	//  The second parameter is the URL of the image (relative)

	game.load.spritesheet('red_mage', "Assets/red_mage.png",32, 48,16);
	game.load.spritesheet('blue_mage', "Assets/blue_mage.png",32, 48,16);
	game.load.image('fireball', "Assets/fireball.png");
	game.load.image('iceball', "Assets/iceball.png");

}
var socket;
var testing;
var player;

var enemies;
var keys;
var enemyFireballs;
var myFireballs;
var FIREBALL;
var bmpText;

function create() {

	socket = io();

	game.physics.startSystem(Phaser.Physics.ARCADE);

	player = game.add.sprite(100,100,"red_mage");
	//game.add.sprite(200,200,"fireball");
	//player.animations.add('ani',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 1, true);
	//sprite.play("ani");
	player.frame = 14;
	game.physics.arcade.enable(player);
	console.log("aaa");
	//game.physics.enable(sprite, Phaser.Physics.ARCADE);
	player.body.collideWorldBounds = true;
	player.anchor.setTo(0.5, 0.5);
	keys = {
up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
	};
	enemy = game.add.sprite(400,200,"blue_mage");
	enemy.frame = 0;
	enemy.enableBody = 0;
	game.physics.arcade.enable(enemy);
	enemy.anchor.setTo(0.5, 0.5);
	player.hp = 20;
	enemy.hp = 20;
/*
	enemyFireballs = game.add.group();
	enemyFireballs.enableBody = true;
	enemyFireballs.physicsBodyType = Phaser.Physics.ARCADE;
	enemyFireballs.checkWorldBounds = true;
	enemyFireballs.createMultiple(80, "iceball", 0, false);
	enemyFireballs.setAll('anchor.x', 0.5);
	enemyFireballs.setAll('anchor.y', 0.5);
	enemyFireballs.setAll('outOfBoundsKill', true);
	enemyFireballs.setAll('checkWorldBounds', true);
*/
	myFireballs = game.add.group();
	myFireballs.enableBody = true;
	myFireballs.physicsBodyType = Phaser.Physics.ARCADE;
	myFireballs.checkWorldBounds = true;
	myFireballs.createMultiple(80, "fireball", 0, false);
	myFireballs.setAll('anchor.x', 0.5);
	myFireballs.setAll('anchor.y', 0.5);
	myFireballs.setAll('outOfBoundsKill', true);
	myFireballs.setAll('checkWorldBounds', true);

	FIREBALL = new Fireball();


	var style = { font: "bold 14px Arial", fill: "#fff" };

	//  The Text is positioned at 0, 100
	text = game.add.text(0, 0, "phaser 2.4 text bounds", style);
	socket.on("move", enemyMove);
	//socket.on("fireball", recieveFireball);
}

function update() {

	text.text = 'HP: ' + player.hp;


	//for (var i = myFireballs.children.length-1; i >= 0; i--){
	game.physics.arcade.overlap(myFireballs.children, enemy, enemyHit, null, this);
	//game.physics.arcade.overlap(enemyFireballs.children, player, playerHit, null, this);
	//}

	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if ( game.input.mousePointer.isDown ){
		//f = new Fireball (player.body.x, player.body.y,game.input.x, game.input.y);
		//f.sprite.events.onOutOfBounds.add(resetFireball(),this.sprite);
		//myFireballs.add(f);
		fire();
	}

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
	socket.emit("move", {x: player.x, y: player.y});
	console.log("sending posistion: " + player.x + "," + player.y);

}
//}

function fire(){
	if (FIREBALL.nextFire <= game.time.now && myFireballs.countDead() > 0){
		FIREBALL.nextFire = game.time.now + FIREBALL.cooldown;
		var fireball = myFireballs.getFirstExists(false);
		fireball.reset(player.x, player.y); //set fireball that is about to be fired to players pos
		game.physics.arcade.moveToPointer(fireball, FIREBALL.speed);
		socket.emit("fireball", {x: game.input.x, y: game.input.y});
	}
}

function enemyHit (fireball, enemy){
	fireball.kill();
	enemy.hp -=1;
}
function playerHit (fireball, player){
	fireball.kill();
	player.hp -=1;
}
function enemyMove(data){
	enemy.x = data.x;
	enemy.y = data.y;
	console.log("recieved: " + data.x + "," + data.y);
	testing = data;
}
function recieveFireball(data){
	var fireball = enemyFireballs.getFirstExists(false);
	fireball.reset(enemy.x, enemy.y);
	game.physics.arcade.moveToXY(fireball,data.x, data.y, FIREBALL.speed);
}
