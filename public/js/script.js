var name,opname,id,chance = false;
var score=0,opscore=0;
var socket = io.connect('http://49.204.184.11:80');
 var logged = false;
function closedisp(a,v,v1)
{
	if(!board[2*v][v1])//top
		$(a).children("#t")[0].style.display="none"
	if(!board[2*v+1][v1])//left
		$(a).children("#l")[0].style.display="none"
	if(!board[2*v+1][v1+1])//right
		$($(a).parent().children("#x"+(eval($(a).attr("id")[1])+1))[0]).children("#l")[0].style.display="none";
	if(!board[2*v+2][v1])//bottem
		$($($(a).parent().parent().children("#y"+(v+1))[0]).children("#x"+(v1))[0]).children("#t")[0].style.display="none";
}
function update()
{
	$($('#my').children()[1]).text(score);
	$($('#opp').children()[1]).text(opscore);
	var tosend = {};
	tosend.id = id;
	if(chance)
		tosend.name = opname;
	else
		tosend.name = name;
	chance = false;
	socket.emit('set',tosend);
}
function check(x,y,flag)
{
	var cflag = false;
	if(y%2==0)
	{
		
		if( y>0 && board[y-1][x] && board[y-2][x] && board[y-1][x+1] )
		{
			if(flag)
			{
				$($($('#y'+(y/2-1)).children('#x'+(x))[0]).children("#label")[0]).text(name[0]);
				score = score+1;
				cflag = true;
			}
			else
			{
				$($($('#y'+(y/2-1)).children('#x'+(x))[0]).children("#label")[0]).text(opname[0]);
				$($($('#y'+(y/2-1)).children('#x'+(x))[0]).children("#label")[0])[0].style.color='red';
				opscore = opscore+1;
				cflag = true;
			}
		}
		if(y<18 && board[y+1][x] && board[y+2][x] && board[y+1][x+1])
		{
			if(flag)
			{	
				$($($('#y'+(y/2)).children('#x'+(x))[0]).children("#label")[0]).text(name[0]);
				score = score+1;
				cflag = true;
			}
			else
			{
				$($($('#y'+(y/2)).children('#x'+(x))[0]).children("#label")[0]).text(opname[0]);
				$($($('#y'+(y/2)).children('#x'+(x))[0]).children("#label")[0])[0].style.color='red';
				opscore = opscore+1;
				cflag = true;
			}
		}
	}
	else
	{
		if(x>0 && board[y][x-1] && board[y-1][x-1] && board[y+1][x-1] )
		{
			if(flag)
			{
				$($($('#y'+Math.floor(y/2)).children('#x'+(x-1))[0]).children("#label")[0]).text(name[0]);
				score = score+1;
				cflag = true;
			}
			else
			{
				$($($('#y'+Math.floor(y/2)).children('#x'+(x-1))[0]).children("#label")[0]).text(opname[0]);
				$($($('#y'+Math.floor(y/2)).children('#x'+(x-1))[0]).children("#label")[0])[0].style.color='red';
				opscore = opscore+1;
				cflag = true;
			}
		}
		if(x<10 && board[y][x+1] && board[y-1][x] && board[y+1][x])
		{
			if(flag)
			{
				$($($('#y'+Math.floor(y/2)).children('#x'+(x))[0]).children("#label")[0]).text(name[0]);
				score = score+1;
				update();
			}
			else
			{
				$($($('#y'+Math.floor(y/2)).children('#x'+(x))[0]).children("#label")[0]).text(opname[0]);
				$($($('#y'+Math.floor(y/2)).children('#x'+(x))[0]).children("#label")[0])[0].style.color='red';
				opscore = opscore+1;
				cflag = true;
			}
		}
	}
	if(cflag)
		update();
}
function mouse(a)
{
	var tosend={};
	$(a).click(function(e){
		if(chance)
		{	
			$('#turn').text('');
			var v = eval($(this).parent().attr("id")[1]);
			var v1 = eval($(this).attr("id")[1]);
			var offset = $(a).offset();
			var x = e.pageX-offset.left;
			var y = e.pageY-offset.top
			var maxy = $(a).height();
			var q;
			
			tosend.id = id;
			tosend.me = name;
			if(x<y && y<maxy-x && !board[2*v+1][v1])
			{
				chance=false;
				q = "left";
				$(this).children("#l")[0].style.display="block";
				$(this).children("#l")[0].style.opacity="1";
				board[2*v+1][v1]=true;
				tosend.x = v1;
				tosend.y = 2*v+1;
				socket.emit('action',tosend);
			}
			else if(x<y && y>maxy-x && !board[2*v+2][v1])	
			{
				chance=false;
				q = "bottem";
				board[2*v+2][v1]=true;
				$($($(this).parent().parent().children("#y"+(v+1))[0]).children("#x"+(v1))[0]).children("#t")[0].style.display="block";
				$($($(this).parent().parent().children("#y"+(v+1))[0]).children("#x"+(v1))[0]).children("#t")[0].style.opacity="1";
				tosend.x = v1;
				tosend.y = 2*v+2;
				socket.emit('action',tosend);
			}
			else if(x>y && y>maxy-x && !board[2*v+1][v1+1])
			{
				chance=false;
				board[2*v+1][v1+1]=true;
				$($(this).parent().children("#x"+(eval($(this).attr("id")[1])+1))[0]).children("#l")[0].style.display="block";
				$($(this).parent().children("#x"+(eval($(this).attr("id")[1])+1))[0]).children("#l")[0].style.opacity="1";
				q = "right";
				tosend.x = v1+1;
				tosend.y = 2*v+1;
				socket.emit('action',tosend);
			}
			else if(x>y && y<maxy-x && !board[2*v][v1])
			{
				chance=false;
				q = "top";
				$(this).children("#t")[0].style.display="block";
				$(this).children("#t")[0].style.opacity="1";
				board[2*v][v1]=true;
				tosend.x = v1;
				tosend.y = 2*v;
				socket.emit('action',tosend);
			}
			
			check(tosend.x,tosend.y,!chance);
			
			$("#text").text("X:"+x+"Y:"+y+"  "+q);
			
		}
	});
		$(a).mousemove(function(e){
		var v = eval($(this).parent().attr("id")[1]);
		var v1 = eval($(this).attr("id")[1]);
		var offset = $(a).offset();
		var x = e.pageX-offset.left;
		var y = e.pageY-offset.top
		var maxy = $(a).height();
		var q;
		closedisp(this,v,v1);
		if(x<y && y<maxy-x && !board[2*v+1][v1])
		{
			q = "left";
			$(this).children("#l")[0].style.display="block";
			
		}
		else if(x<y && y>maxy-x && !board[2*v+2][v1])	
		{
			q = "bottem";
			$($($(this).parent().parent().children("#y"+(v+1))[0]).children("#x"+(v1))[0]).children("#t")[0].style.display="block";
		}
		else if(x>y && y>maxy-x && !board[2*v+1][v1+1])
		{
			$($(this).parent().children("#x"+(eval($(this).attr("id")[1])+1))[0]).children("#l")[0].style.display="block";
		
			
			q = "right";
			
		}
		else if(x>y && y<maxy-x && !board[2*v][v1])
		{
			q = "top";
			$(this).children("#t")[0].style.display="block";
			
		}
		$("#text").text("X:"+x+"Y:"+y+"  "+q);
	});
	
	$(a).mouseout(function(){
		$(a).removeClass();
		$(a).addClass("node");
		var v = eval($(this).parent().attr("id")[1]);
		var v1 = eval($(this).attr("id")[1]);
		closedisp(this,v,v1);
		
	});
}
$(document).ready(function(){
	board=[];
	for(i=0;i<20;i++)
	{
		board.push([false,false,false,false,false,false,false,false,false,false]);
	}
});

//sockets
 
 socket.on('connect',function(){
		console.log('Connected');
		$('#loading')[0].style.display = 'none';
		$('#login')[0].style.display = 'block';
		$('#game')[0].style.display = 'none';
		console.log('login div visible');
	});
function login()
{

	if(logged == false)
	{
			
		console.log('login function invoked with name = ' + name);
		name = $('#name')[0].value;
		if(name == '' || name == undefined) $('#statusMsg').innerHTML = 'Enter a Valid Name';
		else
		{
			
			socket.emit('login',name);
			logged=true;
			$('#statusMsg')[0].innerHTML = '';
			$('#loadingStatus')[0].innerHTML = 'Logging in ...';
			$('#loading')[0].style.display = 'block';
		}
	}
}
socket.on('login',function(){
	$('#statusMsg')[0].innerHTML = '';
	$('#loadingStatus')[0].innerHTML = 'Logging in ...';
	$('#loading')[0].style.display = 'none';
	$('#list')[0].style.display = 'block';
	$('#login')[0].style.display = 'none';
});
function getList()
{
	console.log('getList function invoked');
		socket.emit('list');
}
socket.on('list',function(data){
		console.log('list event triggered');
		var playerListHTML = '';
		for(var i in data)
		{
			if(data[i]!=name)
				playerListHTML += '<button onclick="play(this)">'+data[i]+'</button><div id="'+data[i]+'-status"></div><br />';
		}
		$('#playerList')[0].innerHTML = playerListHTML;
});
function play(tag)
{	
	console.log('play function invoked');
	var toSend = {};
	toSend.me = name;
	opname = tag.innerHTML;
	toSend.opponent = tag.innerHTML;
	socket.emit('play',toSend);
	$('#list')[0].style.display = 'none';
	$('#loadingStatus')[0].innerHTML = 'Waiting for response ...';
	$('#loading')[0].style.display = 'block';
}
socket.on('play',function(data)
{
	var r = confirm(data.me+" wants to play with you press ok to play");
	if(r)
	{
		opname=data.me;
		data.confirm = true;
		socket.emit('play',data);
		$('#list')[0].style.display = 'none';
		$('#loadingStatus')[0].innerHTML = 'Loading game ...';
		$('#loading')[0].style.display = 'block';
		
	}
	else
	{
		data.confirm = false;
		socket.emit('play',data);
	}
	
});
socket.on('startgame',function(data){
	$('#loading')[0].style.display = 'none';
	$('#game')[0].style.display = 'block';
	$($('#my').children()[0]).text(name);
	$($('#opp').children()[0]).text(opname);
	console.log(data);
	id = data.id;
	chance = data.chance;
	if(chance)
	{	
		$('#turn').text('Its your Turn');
	}
});
socket.on('action',function(data){
	console.log('action:'+data);
	board[data.y][data.x]=true;
	chance=true;
	//$('#turn').text('Its your Turn');
	if(data.y%2==0)
	{
		$($('#y'+(data.y/2)).children('#x'+data.x)[0]).children("#t")[0].style.display="block";
	}
	else
	{
		$($('#y'+(Math.floor(data.y/2))).children('#x'+data.x)[0]).children("#l")[0].style.display="block";
	}
	check(data.x,data.y,!chance);
	if(chance)
	$('#turn').text('Its your Turn');
	
});
socket.on('set',function(data){
	chance = true;
	$('#turn').text('Its your Turn');
});