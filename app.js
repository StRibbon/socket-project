var express = require('express'),
    app = express(),
	  http = require('http').Server(app),
    bodyParser = require('body-parser'),
    db = require("./models"),
	  io = require('socket.io')(http),      
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    morgan = require("morgan"),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper");


app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  maxAge: 3600000,
  secret: 'illnevertell',
  name: "chocolate chip"
}));

app.use(loginMiddleware);

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render('users/index');
});

app.get('/signup', routeMiddleware.preventLoginSignup ,function(req,res){
  res.render('users/signup');
});

app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  console.log(req.body.user);
  console.log(db.User);
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/home");
    } else {
      console.log(err);
      res.render("users/signup");
    }
  });
});

app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  res.render("users/login");
});

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/home");
    } else {
      res.render("users/login");
    }
  });
});

//LOG-OUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get('/home', function(req,res) {
  db.Message.find({}).populate('user','username').exec(function(err, messages) {
    if (err) {
      console.log(err);
    } else {
      if(req.session.id == null){
        res.render('layout', {messages: messages, currentuser: "*FALSE USER*"});
      } else {
        db.User.findById(req.session.id, function(err,user){
          console.log(user)
          res.render('layout', {messages: messages, currentuser: user.username});
        })
      }
    }
  });
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

//   //recieve client data
//   socket.on('client_data', function(data){
//     process.stdout.write(data.letter);
//   });
// });

http.listen(3000, function(){
  console.log('LISTENING ON: 3000');
});