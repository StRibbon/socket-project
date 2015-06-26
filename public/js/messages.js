$(document).ready(function(){

//   function loadMessages() {
//     $.getJSON("/home").done(function(data) {
//       console.log("TEST");
//         var messages = data.location.messages;
//         messages.forEach(function(message){
//               $('#messages').append($('<li>').text(message.user.username + message));
//         })
//     });
//   }
//   loadMessages();
// });
  
var socket = io();

  
  $('form').submit(function(){
    socket.emit('message', $('#message').val());
    $('#message').val('');
    socket.emit('user', $('#user').val()); 
    return false;
  });

  socket.on('user', function(user){
    console.log("*User: " + user);
    $('#messages').append($('<li>').text(user));
  });

  socket.on('message', function(msg){
    console.log("*Message: " + msg)
    $('#messages').append($('<li>').text(msg));
  });



});



