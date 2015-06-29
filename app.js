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
    Session = require("express-session"),
    SessionStore = require('session-file-store')(Session),
    morgan = require("morgan"),
    ioMiddleware = require('./middleware/ioHelper'),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper");

var session = Session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true });
var ios = require('express-socket.io-session');

app.use(session);

io.use(ios(session));

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
      res.json(user);
      // var token = jwt.sign(user, jwt_secret, {expiresInMinutes: 60*5});
      // res.json({token: token});
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

// io.use(socketio_jwt.authorize({
//   secret: jwt_secret,
//   handshake: true
// }));

// io.use(require("express-socket.io-session")(session));

var logoutTimer;
// set authorization for socket.io
io.on('connection', function (socket) {
  // console.log(socket.decoded_token.username, 'connected');
  console.log(socket.handshake.session);

  socket.on('isLoggedIn', function(){
    return socket.handshake.session.uid;
  });

  socket.on('loggedIn', function(){
    if(socket.handshake.session.uid){
      clearTimeout(logoutTimer);
      socket.emit('alreadyLoggedIn');
      console.log("loggedIn Emitted!");
    }
  });

  socket.on("login", function(result){
    socket.handshake.session.name = result.username;
    socket.handshake.session.uid = result._id;
    socket.handshake.session.save();
    console.log("This is logged in person: " + socket.handshake.session);
  });

  socket.on("logout", function(result){
    if(socket.handshake.session.result){
      delete socket.handshake.session.name;
      delete socket.handshake.session.uid;
      socket.handshake.session.save();
    }
  })

  socket.on('message', function(message){
    io.emit("data", message, socket.handshake.session.name);
  });

  socket.on('disconnect', function(){
      // if there is an id
      if(socket.handshake.session.uid){
        // only delete after 4 seconds, in case they refresh
        logoutTimer = setTimeout(function(){
        delete socket.handshake.session.uid;
        delete socket.handshake.session.name;
        socket.handshake.session.save();
        console.log(socket.handshake.session);
      }, 4000);
     }
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