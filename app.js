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

app.get('/signup', function(req,res){
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
//load Locations
app.get('/locations', function(req,res){
  db.Location.find({}, function(err,locations){
    res.format({
          'application/json': function(){
            res.send({ locations: locations });
          },
          'default': function() {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable');
          }
    });
  })
});
//create Locations
app.post('/locations', function(req,res){
  var location = new db.Location(req.body.location);
    location.save(function(err,location){
      if(err){
        console.log(err);
      }
      res.format({
        'application/json': function(){
          res.send(location);
        },
        'default': function() {
          // log the request and respond with 406
          res.status(406).send('Not Acceptable');
        }
      });
    });  
});
//delete Locations
app.delete('/locations/:id', function(req,res){
  db.Location.findByIdAndRemove(req.params.id, function(err, location){
  });
});

//load MESSAGES by LOCATION
app.get('/locations/:id/messages', function(req,res){
  db.Location.findById(req.params.id).populate('messages').exec(function(err, location){
    res.format({
          'application/json': function(){
            res.send({ messages: location.messages });
          },
          'default': function() {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable');
          }
    });
  })
});

// //load MESSAGES
// app.get('/messages', function(req,res){
//   db.Message.find({}, function(err,messages){
//     res.format({
//           'application/json': function(){
//             res.send({ messages: messages });
//           },
//           'default': function() {
//             // log the request and respond with 406
//             res.status(406).send('Not Acceptable');
//           }
//     });
//   })
// });
//delete MESSAGES
app.delete('/messages', function(req,res){
  db.Message.findAndRemove( function(err, location){
  });
});

//JWT TOKENS
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
    io.emit("chatname", socket.handshake.session.name); //add to array
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
    console.log("This is logged in person: " + socket.handshake.session.name);
  });

  socket.on("logout", function(result){
    if(socket.handshake.session.result){
      delete socket.handshake.session.name;
      delete socket.handshake.session.uid;
      socket.handshake.session.save();
    }
  })

  // socket.on('message', function(message){
  //   io.emit("data", message, socket.handshake.session.name);
  // });
  socket.on('message', function(data){
    // io.emit("data", message, socket.handshake.session.name);
    db.Message.create({body:data.messageText,user:socket.handshake.session.name}, function(err, message){
      if(err) {
      console.log(err);
      } else {
        db.Location.findById(data.currentLocation, function (err,location){
          location.messages.push(message);
          location.save(function(err){
            io.emit("data", data.messageText, socket.handshake.session.name);
          });
          
        });
      }
    });
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

http.listen(process.env.PORT || 3000, function(){
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