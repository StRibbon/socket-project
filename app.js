var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
    // bodyParser = require('body-parser'),
    // db = require("./models"),
    // methodOverride = require("method-override"),
    // session = require("cookie-session"),
    // morgan = require("morgan"),
    // loginMiddleware = require("./middleware/loginHelper"),
    // routeMiddleware = require("./middleware/routeHelper");


app.set('view engine', 'ejs');
// app.use(methodOverride('_method'));
// app.use(morgan('tiny'));
// app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.urlencoded({extended:true}));

// app.use(session({
//   maxAge: 3600000,
//   secret: 'illnevertell',
//   name: "chocolate chip"
// }));

// app.use(loginMiddleware);

app.get('/', function(req,res){
  res.render('index');
});

io.on('connection', function(socket){
    console.log('a user connected');
  	socket.on('disconnect', function(){
      console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

// io.sockets.on('connection', function(socket){
//   //send data to client
//   setInterval(function(){
//     socket.emit('date', {'date': new Date()});
//   }, 1000);

  //recieve client data
//   socket.on('client_data', function(data){
//     process.stdout.write(data.letter);
//   });
// });

http.listen(3000, function(){
  console.log('LISTENING ON: 3000');
});