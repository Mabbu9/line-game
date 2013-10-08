var express = require('express');
var app = express();
if(process.argv[2]!=null)
	var serverPort = parseInt(process.argv[2]);
else
	var serverPort = 8000;
var host = '0.0.0.0';
var crypto = require('crypto');
function check(x,y,board)
{
	x = eval(x);
	y = eval(y);
	var point = {};
	if(y%2==0)
	{
		point.count = 0;
		point.hor = false;
		if( y>0 && board[y-1][x] && board[y-2][x] && board[y-1][x+1] )
		{
			point.y = y/2-1;
			point.x = x;
			point.count = point.count + 1;
			//score = score+1;	
		}
		if(y<18 && board[y+1][x] && board[y+2][x] && board[y+1][x+1])
		{
			point.y = y/2;
			point.x = x;
			point.count = point.count + 1;
			//score = score+1;
			
		}
	}
	else
	{
		point.count = 0;
		point.hor = true;
		if(x>0 && board[y][x-1] && board[y-1][x-1] && board[y+1][x-1] )
		{
			point.y = Math.floor(y/2);
			point.x = x-1;
			point.count = point.count + 1;
			//score = score+1;
			
		}
		if(x<10 && board[y][x+1] && board[y-1][x] && board[y+1][x])
		{
			point.y = Math.floor(y/2);
			point.x = x;
			point.count = point.count + 1;
			//score = score+1;
		}
	}
	return point;
}

app.configure(function(){
	app.use('/',express.static(__dirname+'/public'));
	
});
var server = require('http').createServer(app);
var io = require('socket.io').listen(server,{log:false});
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
			games[id].board=[];
			for(i=0;i<20;i++)
			{
				games[id].board.push([false,false,false,false,false,false,false,false,false,false]);
			}
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
			var point = check(data.x,data.y,game.board);
			if(point.x == undefined)
			{	
				data.chance = true;
				game.chance = false;
			}
			else
			{
				data.chance = false;
				game.chance = true;
			}
			data.point = point;
			Sockets[game.opp].emit('action',data);
			data.chance = !data.chance;
			socket.emit('action',data);
			console.log('send:'+game.opp);
			game.board[data.y][data.x]=true;
		}
		else if(game.opp == data.me && !game.chance)
		{

			var point = check(data.x,data.y,game.board);
			if(point.x == undefined)
			{	
				data.chance = true;
				game.chance = true;
			}
			else
			{
				data.chance = false;
				game.chance = false;
			}
			data.point = point;
			Sockets[game.me].emit('action',data);
			data.chance = !data.chance;
			console.log('send:'+game.me);
			socket.emit('action',data);
			game.board[data.y][data.x]=true;
		
		}
	});
	
	socket.on('disconnect',function(){
		console.log('disconnected');
		
		for(var id in games)
		{
			
			if(Sockets[games[id].me] == socket)
			{
				Sockets[games[id].opp].emit("error","connection lost with "+games[id].me);
				delete Sockets[games[id].me];
				delete games[id];
			}
			else if(Sockets[games[id].opp] == socket)
			{
				Sockets[games[id].me].emit("error","connection lost with "+games[id].opp);
				delete Sockets[games[id].opp];
				delete games[id];
			}
		}
		for(var cli in Sockets)
		{
			if(Sockets[cli] == socket)
			{
				delete Sockets[cli];
				List.pop(cli);
				
			}
		}
	});
});