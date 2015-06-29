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
    session = require("cookie-session")({
      secret: process.env.SESSION_SECRET,
      name: "chocolate chipz",
    }),
    morgan = require("morgan"),
    ioMiddleware = require('./middleware/ioHelper'),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper");

var jwt_secret = process.env.JWT_SECRET;

app.use(session);

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(loginMiddleware);

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  console.log("Hello user #" + req.session.id);
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

io.use(require("express-socket.io-session")(session));

// set authorization for socket.io
io.on('connection', function (socket) {
  console.log(socket.decoded_token.username, 'connected');
  console.log(socket.handshake.session);
    socket.on('message', function(message){
      io.emit("data", message, socket.decoded_token.username);
    });
});

http.listen(3000, function(){
  console.log('LISTENING ON: 3000');
});

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