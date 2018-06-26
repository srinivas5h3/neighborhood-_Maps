// declaring global variables
var place,edges,marker;
var popupWindow;

var  favouriteloc = [
    /*
    the variable avouriteloc is taking the place names
    and locations latitude and longitudes of the 
    the each locaton is stored
    */
    {
      place_name: 'Vijayawada Railway Station',
      location: 
      {
        lat: 16.5178302,
        lng: 80.6179062
      }
    },  
    {
      place_name: 'kachiguda Railway Station',
      location: 
      {
        lat: 17.3844564,
        lng: 78.5024288
      }
    },
     {
      place_name: 'Royapuram Railway Station',
      location: 
      {
        lat: 13.1041034,
        lng: 80.2914512
      }
    }, 
    {
      place_name: 'Howrah Railway Station',
      location: 
      {
        lat: 22.5817479,
        lng: 88.333449
      }
    }, 
    {
      place_name: 'Chennai Railway Station',
      location: 
      {
        lat: 13.0822782,
        lng: 80.273377    
      }
    }, 
    {
      place_name: 'Bengaluru Railway Station',
      location: 
      {
        lat: 12.9786533,
        lng: 77.5673844
      }
    },
    {
        place_name: 'Pune Railway Station',
        location: 
        {
          lat: 18.528381,
          lng: 73.8721073
        }
    },
    {
        place_name: 'Nashik Railway Station',
        location: 
        {
          lat: 19.9485279,
          lng: 73.8407324
        }
    }

  ];

function map() {
    /*
    the map function is using for displays' the map
    when we opened web page and 
    takes the map center location latitude and longitude
    and also take the zoom of the map
    and call's functions popupwindow and edeges
    */
    place = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 16.5671036, lng: 81.5195029 },
        mapTypeControl: false
    });
    popupWindow = new google.maps.InfoWindow();
    edges = new google.maps.LatLngBounds();   
    ko.applyBindings(new Desgin());
}

var showlocation = function(content) {
    /*
    the showlocation function is very large and important
    in this function use the foursquare API's
    the foursquare has the clientId and and clientSecret these two feald are given
    the foursquare is search the each location details
    the details are 1.street 2.city 3.phone number 4.country
    and the link variable is useful for search the location details and 
    it takes the clientId and and clientSecret and 
    location latitude and longitude
    if any problem in foursquare api's then it will shows
    the message Oops! some wrong with foursquare api
    */
    var link;
    var clientID,clientSecret;
    var self = this;
    this.place_name = content.place_name;
    this.position = content.location;
    this.street = '',
    this.city = '',
    this.phone = '',
    this.country = '';
    this.visible = ko.observable(true);
    /* my foursquare clientId*/
    clientID = 'CTHZCEZIKD54MH1NYGBZYFBP4GJFPZXXKKK0FR1K4MCYLN31';
    /* my foursquare clientsecret*/
    clientSecret = 'NGWTJR2KNNSD1YV0LNHZXEECL1T1KZVOJUYB1WK4OE35VLOD';
    /* the link variable is useful for search the location details
    and it takes the clientId and and clientSecret and 
    location latitude and longitude*/
    link = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.place_name;
    $.getJSON(link).done(function(content) {
        /*
        it is used for not getting the information for each location
        it is show the some message
        */
		var output = content.response.venues[0];
        self.street = output.location.formattedAddress[0] ? output.location.formattedAddress[0]: 'The street not found';
        self.city = output.location.formattedAddress[1] ? output.location.formattedAddress[1]: 'The City not found';
        self.phone = output.contact.formattedPhone ? output.contact.formattedPhone : 'The phone.no not found';
        self.country = output.location.formattedAddress[2] ? output.location.formattedAddress[2]: 'the country name is not found ';

    }).fail(function() {
        /*
        this function is used for any problem with foursquare api's
        it will show the alert 
        */
        alert('Oops! some wrong with foursquare API');
    });
    this.marker = new google.maps.Marker({
        /*
        it is used for marked the locoation
        animates the marker
        the marker is bounced
        */
        position: this.position,
        place_name: this.place_name,
        animation: google.maps.Animation.BOUNCE,
        icon: marker
    });    
    self.remove = ko.computed(function () {
        if(self.visible() === true) {
            self.marker.setMap(place);
            edges.extend(self.marker.position);
            place.fitBounds(edges);
        } else {
            self.marker.setMap(null);
        }
    });    
    this.marker.addListener('click', function() {
        infowindow(this, self.street, self.city, self.phone, self.country, popupWindow);
        setBounce(this);
        place.panTo(this.getPosition());
    });
    /*
    show place selected from location list
    */
    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };
    /*
    show bounce effect when list is selected
    */
    this.fall = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};
function infowindow(marker, street, city, phone, country, openwindow) {
    /*
    the infowindow function is used for display's the popupwindow in web screen
    this function display's the street view of the location
    and it takes details of the location
    */
    if (openwindow.marker != marker) {
        openwindow.setContent('');
        openwindow.marker = marker;
        openwindow.addListener('closeclick', function() {
            openwindow.marker = null;
        });
        var streetview = new google.maps.StreetViewService();
        var radius = 50;
        var windowdata = '<h5>' + marker.place_name + '</h5>' + 
            '<p>' + street +
            '</br>' + city +
            '</br>' + phone +
            '<br>' + country +
            '</p>';
        var getview = function (content, site) {
            /*
            this function is mainly use for googlemap street view
            if the location has street view it will display
            if the location doesn't contain street view then
            it will shows the message "No Street View Found"
            */
            if (site == google.maps.StreetViewStatus.OK) {
                var viewlocation = content.location.latLng;
                openwindow.setContent(windowdata);
            }
            else {
                openwindow.setContent(windowdata + '<div class="street-view">No Street View Found</div>');
            }
        };
        streetview.getPanoramaByLocation(marker.position, radius, getview);
        openwindow.open(place, marker);
    }
}
var Desgin = function() {
    /*
    the design function is search in the location list
    and it is help for search lower and higher case latters
    locate the places when you searching 
    */
    var self = this;
    this.findplace = ko.observable('');
    this.some = ko.observableArray([]);
    favouriteloc.forEach(function(location) {
        self.some.push( new showlocation(location) );
    });
    /*
    favouriteloc identified on map
    */
    this.placelist = ko.computed(function() {
        var findfilter = self.findplace().toLowerCase();
        if (findfilter) {
            return ko.utils.arrayFilter(self.some(), function(location) {
                var str = location.place_name.toLowerCase();
                var sink = str.includes(findfilter);
                location.visible(sink);
				return sink;
			});
        }
        self.some().forEach(function(location) {
            location.visible(true);
        });
        return self.some();
    }, self);
};
function Errorgooglemap() {
    /*
    if any errors in google api then it will shows the alert
    */
    alert('Oops!An error.');
}