var express = require("express");
var app = express();
var server = app.listen($PORT || 3000);

app.use(express.static("public"));

console.log("Socket server is now running!");

var socket = require("socket.io");

var io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
	console.log("new connection " + socket.id);

	socket.on("move", moveMessage);

	function moveMessage(data){
		socket.broadcast.emit("move",data);
		console.log(data);
	}

	socket.on("fireball", sendFireball);

	function sendFireball(data){
		socket.broadcast.emit("fireball", data);
		console.log(data);
	}
}
