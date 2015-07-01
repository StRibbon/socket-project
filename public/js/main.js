$(function(){
  var map;
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'),{
      zoom: 14,
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
    //AJAX call from map listener - adds marker and DB location model
    google.maps.event.addListener(map, 'click', function(event){
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
    
  }//END initialize()

  //Pop-UP info window on Map
    var infowindow = new google.maps.InfoWindow({

      content: '<div id="markerBox" style="color: black;">'
                
                +'<div class="glyphicon glyphicon-ok-circle">Join</div><br>'
                +'<div class="glyphicon glyphicon-remove-circle">Delete</div>'
                +'</div>'
    });

  //ADD Location from MAP to DB
  function addLocation(data){
    var location = data;
    var ll = new google.maps.LatLng(location.lat, location.long);
    addMarker(ll, map, location._id);               
  }
  //ADD Markers from DB
  function addMarker(ll, map, id) {
    currentLocation = id;
    var marker = new google.maps.Marker({
      position: ll,
      map: map,
      mongoId: id,
    });
  //DELETE Marker on double-click
  google.maps.event.addListener(marker, 'dblclick',function(){
    
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

  //LOAD Messages and Join Chat
  google.maps.event.addListener(marker, 'click',function(){
    infowindow.open(map,marker);
    console.log(marker.mongoId);
    currentLocation = marker.mongoId;
    $('#messages').html("");
    loadMessages();
  });

  }//END add marker function

  var currentLocation;

  function loadMessages(){
    $.getJSON('/locations/'+currentLocation+'/messages').done(function(data){
      console.log(data);
      var messages = data.messages;
      messages.forEach(function(message){
        $('#messages').append($('<li>').html('<strong>'+message.user + ":" + message.date + '</strong>' + ": " + message.body));
      })
    });
  }
  
  var token, $errMessage;

  socket = io.connect({'forceNew':true});

  socket.on('connect', function(){
    if(socket.emit('isLoggedIn')) socket.emit('loggedIn'); 
  });

  socket.on('chatname', function(name){
    $('.section').append($('<li>').html('<strong>'+name+'</strong>'));
  });

  socket.on('data', function(msg,info){
    $('#messages').append($('<li>').html('<strong>'+info+'</strong>' + ": " + msg));
  });

  socket.on('alreadyLoggedIn', function(){
    initialize();
    $('.section').show();
    $('#map-canvas').show();
    $('#message').show();
    $('#messages').show();
    $('#clear').show();
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
    socket.emit("message", {messageText: messageText, currentLocation: currentLocation});
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
        $('.section').show();
        $('#alert').show();
        $('#message').show();
        $('#messages').show();
        $('#clear').show();
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


