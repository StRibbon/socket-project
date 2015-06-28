require("dotenv").load();
var express = require('express'),
    app = express(),
	  http = require('http').Server(app),
    socketIo = require('socket.io'),
    socketio_jwt = require('socketio-jwt'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'),
    db = require("./models"),
	  io = require('socket.io')(http),      
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    morgan = require("morgan"),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper");

var jwt_secret = process.env.JWT_SECRET;

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "chocolate chipz"
}));

app.use(loginMiddleware);

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render('layout');
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
      res.redirect("/");
    } else {
      console.log(err);
      res.render("users/signup");
    }
  });
});

app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  res.render("layout");
});

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (err) {
      res.status(400).send(err);
      } else if (!err && user !== null){
      req.login(user);
      console.log("USER: " + user);
      var token = jwt.sign(user, jwt_secret, {expiresInMinutes: 60*5});
      res.json({token: token});
    } else {
      res.status(500).send("Something went wrong...");
    }
  });
});

//LOG-OUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

io.use(socketio_jwt.authorize({
  secret: jwt_secret,
  handshake: true
}));

//POPULATE MESSAGES
// app.get('/home', function(req,res) {
//   db.Message.find({}).populate('user','username').exec(function(err, messages) {
//     if (err) {
//       console.log(err);
//     } else {
//       if(req.session.id == null){
//         res.render('layout', {messages: messages, currentuser: "*FALSE USER*"});
//       } else {
//         db.User.findById(req.session.id, function(err,user){
//           console.log(user)
//           res.render('layout', {messages: messages, currentuser: username.username}); // prev user.username
//         })
//       }
//     }
//   });
// });

// set authorization for socket.io
io.on('connection', function (socket) {
    console.log(socket.decoded_token.username, 'connected');
    socket.on('message', function(message){
      io.emit("data", message, socket.decoded_token.username);
    });
  });


// //USER MESSAGE
// io.on('connection', function(socket){

//   //USER ID
//   io.on('connection', function(socket){
//     socket.on('user', function(user){
//       io.emit('user', user);
//     });
//   });

//   //USER MESSAGE
//   io.on('connection', function(socket){
//     socket.on('message', function(message){
//       io.emit('message', message);
//     });
//   });

//   //USER CONNECT & DISCONNECT
//   io.on('connection', function(socket){
//     console.log('a user connected');
//     socket.on('disconnect', function(){
//       console.log('user disconnected');
//     });
//   });
// });


http.listen(3000, function(){
  console.log('LISTENING ON: 3000');
});