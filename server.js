var express = require('express');
var app = express();
if(process.argv[2]!=null)
	var serverPort = parseInt(process.argv[2]);
else
	var serverPort = 8000;
var host = '0.0.0.0';
var crypto = require('crypto');
app.configure(function(){
	app.use('/',express.static(__dirname+'/public'));
	
});
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(serverPort, host);
console.log('Server running at http://'+host+':'+serverPort);
var Sockets = {};
var List = [];
var games = {};
io.sockets.on('connection',function(socket){
	socket.on('login',function(data){
		Sockets[data] = socket;
		var presentFlag = false;
		for(var i in List)
		{
			if(List[i] == data)
			{
				presentFlag = true;
				break;
			}
			
		}
		if(!presentFlag) List.push(data);
		console.log(data+' connected with '+socket);
		socket.emit('login',data);
		});
	socket.on('list',function(data){
		socket.emit('list',List);
	});
	socket.on('play',function(data)
	{
		console.log('play:'+data.confirm);
		if(data.confirm == true)
		{
			var tosend = {};
			var id = crypto.randomBytes(20).toString('hex');
			List.pop(data.me);
			List.pop(data.opponent);
			tosend.id = id;
			games[id]={}
			games[id].me = data.me;
			games[id].opp = data.opponent;
			games[id].chance=true;
			games[id].set=1;
			console.log("game Created:"+data.me+' '+data.opponent);
			tosend.chance = true;
			Sockets[data.me].emit('startgame',tosend);
			tosend.chance = false;
			Sockets[data.opponent].emit('startgame',tosend);
			
		}
		else if(data.confirm == false);
		else
		{
			Sockets[data.opponent].emit('play',data);
		}
	});
	socket.on('action',function(data){
		
		var game = games[data.id];
		console.log('action:'+data.me+game.me+game.opp+game.chance);
		if(game.me == data.me && game.chance)
		{	
			Sockets[game.opp].emit('action',data);
			console.log('send:'+game.opp);
			game.chance = false;
		}
		else if(game.opp == data.me && !game.chance)
		{
			
			Sockets[game.me].emit('action',data);
			console.log('send:'+game.me);
			game.chance = true;
		}
	});
	socket.on('set',function(data){
		
		var game = games[data.id];
		if(game.set == 2)
		{	
			game.set = 1;
			if(game.me == data.name)
			{	
				game.chance = true;
				Sockets[game.me].emit('set',data);
			}
			else
			{
				game.chance = false;
				Sockets[game.opp].emit('set',data);
			}
		}
		else
			game.set = game.set+1;
		console.log('set:'+data.name+game.set);
	});
});