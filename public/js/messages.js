$(document).ready(function(){

//   var url = window.location.pathname + "comments";

//   function loadComments() {
//     $.getJSON(url).done(function(data) {
//       console.log("TEST");
//         var comments = data.post.comments;
//         comments.forEach(function(comment){
//           $("#comments").append("<h4 class='ui'><li>'"+ comment.body +"'</li>- "+ comment.user.username +"</h4>") 
//         })
//     });
//   }
//   loadComments();

// });

var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(msg,data){
    $('#messages').append($('<li>').text(msg));
  });

  // var socket = io.connect();
  // socket.on('date', function(data){
  //   $('#date').text(data.date);
  // });

  // $(document).ready(function(){
  //   $('#text').keypress(function(e){
  //     socket.emit('client_data', {'letter': String.fromCharCode(e.charCode)});
  //   });
  // });

});