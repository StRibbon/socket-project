$(function() {
  var map;
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 2,
      center: {lat: 36, lng: -43}
    });

  var mapDiv = document.getElementById('map-canvas');

  }
  
google.maps.event.addDomListener(window, 'load', initialize);

});