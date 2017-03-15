var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static("public"));

console.log("Socket server is now running!");

var socket = require("socket.io");

var io = socket(server);

var players = [];
// player each have own fireballs
io.sockets.on("connection", newConnection);

function newConnection(socket) {
	console.log("new connection " + socket.id);
	p = new Player(socket.id);
	io.to(socket.id).emit("you", p);
	io.to(socket.id).emit("enemies", players);
	players.push(p);
	socket.broadcat.emit("user connected", p);

	socket.on("disconnect", removePlayer);
	function removePlayer(){
		for (var i = players.length-1; i >= 0; i--){
			if (players[i].id == socket.id){
				players.splice(i,1);
			}
		}
		socket.broadcast.emit("user disconnected", socket.id);
	}
	socket.on("move", moveMessage);

	function moveMessage(data){
		data.id = socket.id;
		for (var i = players.length-1; i >= 0; i--){
			if (players[i].id == socket.id){
				players[i].x = data.x;
				players[i].y = data.y;
			}
		}
		socket.broadcast.emit("move",data);
		//console.log(data);
	}

	socket.on("fireball", sendFireball);
	function sendFireball(data){
		data.id = socket.id; // so that players know whose fireball it is 
		socket.broadcast.emit("fireball", data);
		console.log(data);
	}
}
function Player(id){
	this.x = MATH.random()*500;
	this.y = MATH.random()*500;
	this.id = id;
}
