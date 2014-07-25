var map;

var weather = function(lat, lon) {

    var DEG = 'c'; // c for celsius, f for fahrenheit

    var weatherDiv = $('#weather'),
        scroller = $('#scroller'),
        location = $('p.location');

    // Get user's location, and use OpenWeatherMap
    // to get the location name and weather forecast

    function locationSuccess() {

        try{
        var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast?lat='+ lat +
                                '&lon='+ lon +'&callback=?'
            $.getJSON(weatherAPI, function(response){
                var d = new Date();
                // Get the offset from UTC (turn the offset minutes into ms)
                var offset = d.getTimezoneOffset()*60*1000;
                var city = response.city.name;
                var country = response.city.country;
                $.each(response.list, function(){
                    // "this" holds a forecast object
                    // Get the local time of this forecast (the api returns it in utc)
                    var localTime = new Date(this.dt*1000 - offset);
                    addWeather(
                        this.weather[0].icon,
                        moment(localTime).calendar(),   // We are using the moment.js library to format the date
                        this.weather[0].main + ' <b>' + convertTemperature(this.main.temp_min) + '°' + DEG +
                                                ' / ' + convertTemperature(this.main.temp_max) + '°' + DEG+'</b>'
                    );
                console.log(convertTemperature(this.main.temp_min));
                // console.log(convertTemperature(this.main.temp_max));
                });
                // Add the location to the page
                location.html(city +', <b>'+country+'</b>');
                weatherDiv.addClass('loaded').hide();
                weatherDiv.addClass('loaded').show('slow');
                // Set the slider to the first slide
                showSlide(0);
            });
        }
        catch(e){
            showError("We can't find information about your city!");
            window.console && console.error(e);
        }
    }
    //call the locationSuccess function to load weather with lat and lon
    locationSuccess();
    function addWeather(icon, day, condition){
        var markup = '<li>'+
            '<img src="img/icons/'+ icon +'.png" />'+
            ' <p class="day">'+ day +'</p> <p class="cond">'+ condition +
            '</p></li>';
        scroller.append(markup);
    }
    /* Handling the previous / next arrows */
    var currentSlide = 0;
    weatherDiv.find('a.previous').click(function(e){
        e.preventDefault();
        showSlide(currentSlide-1);
    });
    weatherDiv.find('a.next').click(function(e){
        e.preventDefault();
        showSlide(currentSlide+1);
    });
    // listen for arrow keys
    $(document).keydown(function(e){
        switch(e.keyCode){
            case 37: 
                weatherDiv.find('a.previous').click();
            break;
            case 39:
                weatherDiv.find('a.next').click();
            break;
        }
    });
    function showSlide(i){
        var items = scroller.find('li');

        if (i >= items.length || i < 0 || scroller.is(':animated')){
            return false;
        }
        weatherDiv.removeClass('first last');
        if(i == 0){
            weatherDiv.addClass('first');
        }
        else if (i == items.length-1){
            weatherDiv.addClass('last');
        }
        scroller.animate({left:(-i*100)+'%'}, function(){
            currentSlide = i;
        });
    }
    /* Error handling functions */
    function locationError(error){
        switch(error.code) {
            case error.TIMEOUT:
                showError("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                showError('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                showError('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                showError('An unknown error occured!');
                break;
        }
    }
    function convertTemperature(kelvin){
        // Convert the temperature to either Celsius or Fahrenheit:
        return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
    }
    function showError(msg){
        weatherDiv.addClass('error').html(msg);
    }
};
$(function(){
    var map = new GMaps({
      div: '#map',
      lat:  6.430556,
      lng:  3.3958333,
      zoom: 11,
      panControl : false,
        click: function(e){
            weather(e.latLng.lat(), e.latLng.lng());
            map.removeMarkers();
            map.addMarker({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
            });
        }
    });
    map.addMarker({
      lat: 6.430556,
      lng: 3.3958333
    });
    $("#address").keyup(function(event){
         if(event.keyCode == 13){
             $("#search").click();
         }
    });
    var search = $('#search').click(function(e) {
        e.preventDefault();
        GMaps.geocode({
          address: $('#address').val(),
          callback: function(results, status) {
            if (status == 'OK') {
              var latlng = results[0].geometry.location;
              map.setCenter(latlng.lat(), latlng.lng());
              weather(latlng.lat(), latlng.lng());
              map.removeMarkers();
              map.addMarker({ lat: latlng.lat(), lng: latlng.lng() });
            }
          }
        });
        // $('#describe').html('<p> You are currently viewing the forecast for ' + $('#address').val() + '</p>');
        $('#address').focus().val('');
    });
    GMaps.geolocate({
    success: function(position){
      weather(position.coords.latitude, position.coords.longitude);
      map.removeMarkers();
      map.addMarker({
        lat: position.coords.latitude,
        lng: position.coords.longitude
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