$(function(){
  var map;
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'),{
      zoom: 4,
      center: {lat: 37.7833186, lng: -122.4096054}
    });

  var mapDiv = document.getElementById('map-canvas');

    $.getJSON("/locations").done(function(data){
      data.locations.forEach(function(location){         
        var ll = new google.maps.LatLng(location.lat, location.long);
        addMarker(ll, map, location._id);
      });
        console.log(data);
    });

    google.maps.event.addListener(map, 'click', function(event){
      // addMarker(event.latLng, map, name);
      console.log(event);
      console.log(event.latLng.A);
      console.log(event.latLng.F);
      var lat = event.latLng.A;
      var long = event.latLng.F;
      var data = {location: {lat: lat, long: long}};
        $.ajax({
          type: 'POST',
          url: '/locations',
          data: data,
          dataType: 'json'
        })
        .done(function(data) {
          addLocation(data);
      });        
    });  
  }//end initialize()

  function addLocation(data){
    var location = data;
    var ll = new google.maps.LatLng(location.lat, location.long);
    addMarker(ll, map, location._id);
    //initialize();               
  }

  function addMarker(ll, map, id) {
    var marker = new google.maps.Marker({
      position: ll,
      map: map,
      mongoId: id,
    });
    //delete Marker
    google.maps.event.addListener(marker, 'click',function(){
      console.log(marker.mongoId);
      marker.setMap(null);
      $.ajax({
          type: 'DELETE',
          url: '/locations/'+marker.mongoId,
          dataType: 'json'
        })
        .done(function(data) {
          console.log(data+"DELETED");
      });        
    })
  }
  
  //google.maps.event.addDomListener(window, 'load', initialize);
  
  var token, $errMessage;

  socket = io.connect({'forceNew':true});

  socket.on('connect', function(){
    if(socket.emit('isLoggedIn')) socket.emit('loggedIn');
    
  });

  socket.on('data', function(msg,info){
    $('#messages').append($('<li>').html('<strong>'+info+'</strong>' + ": " + msg));
  });

  socket.on('alreadyLoggedIn', function(){
    initialize();
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
    console.log(messageText);
    //insert AJAX to get location ID
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
        if ($errMessage) $errMessage.remove();
        initialize();
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

});//end on loading


