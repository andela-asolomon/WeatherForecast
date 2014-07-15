/**
 * Geolocation
 */
 var map;
  $(document).ready(function(){
    var map = new GMaps({
      div: '#map',
      lat: -12.043333,
    lng: -77.028333,
    });
    GMaps.geolocate({
      success: function(position){
        map.setCenter(position.coords.latitude, position.coords.longitude);
        map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          title: 'You are here.',
          infoWindow: {
            content: 'You are here!'
          }
        });
      },
      error: function(error){
        alert('Geolocation failed: '+error.message);
      },
      not_supported: function(){
        alert("Your browser does not support geolocation");
      }
    });
});