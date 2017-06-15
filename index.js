var express =require("express");
var app=express();
var cookieparser=require("cookie-parser");
var morgan=require("morgan");
var port = process.env.PORT || 3000;
var $=require('jquery');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session=require("express-session");
var bodyparser=require('body-parser');
var urlencodedParser = bodyparser.urlencoded({ extended: false });
var user;
var ct=0;
var onl=[];


app.use(bodyparser.json());
app.use(morgan("dev"));
app.use(express.static(__dirname ));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser());
app.set('views', __dirname + '/views');
app.set('view engine','ejs');



app.get('/',function(req,res){
	res.render("p1");
});

app.get('/room',function(req,res){
  //console.log(req.query.name);
  user=req.query.name;
	res.render("p2",{us:req.query.name});
})

io.on('connection', function(socket){

  socket.on("entered",function(x){
    onl[ct]=x;
    ct++;
    io.emit("broad",x);
    io.emit("online",onl);
  });
  socket.on("typing",function(who){
    io.emit("ty",who);
  });
  socket.on("usr",function(nm){
     user=nm;
  });
  socket.on('msgs',function(m){
    io.emit("typer",user);
    io.emit("msgs",m);
  }); 
  socket.on('disconnect', function(){
    var s=(socket.handshake.headers.referer).indexOf("=");
    var str=(socket.handshake.headers.referer).substr(s+1);
    var pos=onl.indexOf(str);
    onl.splice(pos,1);
    io.emit("nbroad",str);
    io.emit("online",onl);
    if (onl.length==0)
      ct=0;
  });
});


http.listen(port,function(){
  console.log("Started on "+port);
});