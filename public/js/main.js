$(document).ready(function(){

  var map;
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 2,
      center: {lat: 36, lng: -43}
    });

  var mapDiv = document.getElementById('map-canvas');

  }
  
google.maps.event.addDomListener(window, 'load', initialize);

  
var token, socket, $errMessage;

        socket = io.connect({'forceNew':true});

        socket.on('connect', function(){
          if(socket.emit('isLoggedIn')) socket.emit('loggedIn');
        });

        socket.on('data', function(msg,info){
          $('#messages').append($('<li>').html('<strong>'+info+'</strong>' + ": " + msg));
        });

        socket.on('alreadyLoggedIn', function(){
          $('#map-canvas').show();
          $('#message').show();
          $('#messages').show();
          $('#logout').show();
          $('#login').hide();
          $('.signup').hide();
          $('#text').focus()
        });


        $('#message').submit(function(e){
          e.preventDefault();
          var messageText = $("#text").val()
          console.log(messageText)
          socket.emit("message", messageText)
          $("#text").val("")
          $('#text').focus()
        })

        $('#logout').click(function(e){
          socket.emit('logout');
        });

        $('#login').submit(function (e) {
            e.preventDefault();
            var username = $('#username').val();
            var password = $('#password').val();
            var data = {user: {username: username, password:password}}
            $.ajax({
                type: 'POST',
                data: data,
                url: '/login'
            }).done(function (result) {
                if ($errMessage) $errMessage.remove()
                $('#map-canvas').show();
                $('#message').show();
                $('#messages').show();
                $('#logout').show();
                $('#login').hide();
                $('.signup').hide();
                $('#text').focus();
                socket.emit("login", result);
            }).fail(function(err){
              if ($errMessage) $errMessage.remove()
              $errMessage = $("<h1>").text(err.responseText)
              $errMessage.css("color","red");
              $("body").append($errMessage);
              $('#login')[0].reset();
            });
        });

});


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

// $('form').submit(function(){
  //   socket.emit('message', $('#message').val());
  //   $('#message').val('');
  //   socket.emit('user', $('#user').val()); 
  //   return false;
  // });

  // socket.on('user', function(user){
  //   console.log("*User: " + user);
  //   $('#messages').append($('<li>').text(user));
  // });

  // socket.on('message', function(msg){
  //   console.log("*Message: " + msg)
  //   $('#messages').append($('<li>').text(msg));
  // });



