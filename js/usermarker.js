/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var inputMarker = new Array();
//var inputPopup;
var userInputControl;
var ahpControl;
var id = 1;

//TO DO: gather inputs from map, pass inputs into AHP method

function addUserMarkerControl() {

    userInputControl = L.control({position: 'bottomright'});
    userInputControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.userInputOn();
        return this._div;
    };
    userInputControl.userInputOn = function() {
        this._div.innerHTML = '<div id="toggle" onclick="addUserMarker()">Add Marker</div>';
    };

    map.addControl(userInputControl);

    ahpControl = L.control({position: 'topright'});
    ahpControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.closeForm();
        return this._div;
    };
    ahpControl.initialiseForm = function() {
        this._div.innerHTML = getAHPForm();
    };
    ahpControl.closeForm = function() {
        this._div.innerHTML = '<div onclick=ahpControl.initialiseForm();> Activate AHP </div>';
    };

    map.addControl(ahpControl);

}

function getAHPForm() {
    //AHP input metric comes here...
    var formHTML = "";

    $.ajax({
        url: "ahp.html"
    }).done(function(form) {
        formHTML = form;
    });

    formHTML += "<br/> <div onclick=ahpControl.closeForm();> Close Form </div>";

    return formHTML;
}

function addUserMarker() {

    if (inputMarker.length >= 3) {
        //insert some code to stop user from adding more markers
        alert("There are already 3 markers on map!");
        return;
    }

    //var latlngStr = '(' + map.getCenter().lat.toFixed(3) + ', ' + map.getCenter().lng.toFixed(3) + ')';
    //inputPopup = new L.popup();

    var defaultName = "Property " + id;
    var marker = new L.marker(map.getCenter(), {
        draggable: true,
        name: defaultName,
        price: 0,
        area: 0,
        id: id
    }).addTo(map);


    //marker.on('click',markerClick);
    marker.on('contextmenu', markerRemove);
    marker.bindPopup(getPopUpForm(id, defaultName, 0, 0));

    marker.openPopup();
    inputMarker.push(marker);
    id = id + 1;

}

function getPopUpForm(id, name, price, area) {
    return "<div><form> \n\
Name: <input type='text' id ='name" + id + "' name='name' value='" + name + "' oninput=markerChangeDetails(" + id + "); /> <br/> \n\
Transaction Price: <input type='text' id ='price" + id + "' name='price' value='" + price + "' oninput=markerChangeDetails(" + id + "); /><br/> \n\
Floor Area: <input type='text' id ='area" + id + "' name='area' value='" + area + "' oninput=markerChangeDetails(" + id + "); /> \n\
</form></div>";
}

function markerChangeDetails(id) {
	//on marker change details, need to get values from form
	//change the input marker property '.options'
	//re-bind the popup again with the new input.
    var newName = document.getElementById("name" + id).value;
    var newPrice = document.getElementById("price" + id).value;
    var newArea = document.getElementById("area" + id).value;

    for (var i = 0; i < inputMarker.length; i++) {
        if (id === inputMarker[i].options.id) {
            inputMarker[i].options.name = newName;
            inputMarker[i].options.price = newPrice;
            inputMarker[i].options.area = newArea;

            inputMarker[i].bindPopup(getPopUpForm(id, newName, newPrice, newArea));
        }
    }
}

/*
 function markerClick(e) {
 //Form for pop up input
 this.bindPopup("<div onclick=testmethod() > asd </div>");
 }
 */

function markerRemove(e) {

    for (var i = 0; i < inputMarker.length; i++) {
        if (e.target.options.id === inputMarker[i].options.id) {
            map.removeLayer(inputMarker[i]);
            inputMarker.splice(i, 1);
        }
    }
}

function getMarkerDetails() {
    //get lat lng
    //calculate nearest distance from school and mrt
    //stadium
    //clinic
    //mrt station
    //school
    //get userinput details
    var locationArray = new Array();

    var priceArray = {
        smallerBetter: true,
        value: new Array()
    };

    var areaArray = {
        smallerBetter: false,
        value: new Array()
    };

    var mrtArray = {
        smallerBetter: true,
        value: new Array()
    };

    var schoolArray = {
        smallerBetter: true,
        value: new Array()
    };


    for (var i = 0; i < inputMarker.length; i++) {
        var latlng = inputMarker[i].getLatLng();

        var id = inputMarker[i].options.id;
        var price = inputMarker[i].options.price;
        var area = inputMarker[i].options.area;

        locationArray.push(id);
        priceArray.value.push(price);
        areaArray.value.push(area);

        //bottom 2 to be coded...
        mrtArray.value.push(getNearestFacility(latlng, mrtList));
        schoolArray.value.push(getNearestFacility(latlng, schoolList));

    }


    var dataMarkerArray = {
        locationArray: locationArray,
        criteriaValueArray: [
            priceArray,
            areaArray,
            mrtArray,
            schoolArray
        ]
    };

    return dataMarkerArray;

}

function getNearestFacility(latlng, facilityList) {
    //iterate list to find min distance from latlng
    //

    return 0;
}


//credit: http://www.movable-type.co.uk/scripts/latlong.html  using the Haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}


function testmethod() {

    alert("hello world");

}

/*
 function toggleOffUserInput(){
 map.off('click',onMapClick);
 userInputControl.userInputOn();
 }
 
 
 function onMapClick(e) {
 var latlngStr = '(' + e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ')';
 
 L.marker([e.latlng.lat, e.latlng.lng],{
 draggable:true
 });
 
 
 inputPopup.setLatLng(e.latlng);
 inputPopup.setContent("You clicked the map at " + latlngStr);
 
 map.openPopup(inputPopup);
 }
 */

//remove marker on button itself
//Create control on side to remove marker - details of marker to be on side too