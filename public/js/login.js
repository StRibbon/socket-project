$(document).ready(function(){

var token, socket, $errMessage;

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
                token = result.token;
                connect();
                $('#message').show();
                $('#login').hide();
                $('.signup').hide();
                $('#text').focus()
            }).fail(function(err){
              if ($errMessage) $errMessage.remove()
              $errMessage = $("<h1>").text(err.responseText)
              $errMessage.css("color","red");
              $("body").append($errMessage);
              $('#login')[0].reset();
            });
        });

});