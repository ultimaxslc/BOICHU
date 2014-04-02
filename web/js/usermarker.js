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
        this._div.innerHTML = '<div id="default-popup"  onclick="addUserMarker()">Add Marker</div>';
    };
    
    // on the fourth click, i want the same button (Add Marker) to trigger the popup
    userInputControl.popupOn = function(){
        openDialog();
        var htmlOutput ="";
        htmlOutput += '<aside id="default-popup" class="avgrund-popup">';
        htmlOutput += '<h2>OOPS</h2>';
        htmlOutput += '<p>To help you make a better decision, you can only choose 3 locations! You can hit ESC or click outside to close the modal. Give it a go to see the reverse transition.</p>';
        
        htmlOutput +=  '<button onclick="javascript:closeDialog();">Close</button></aside>';
        //temp = document.getElementById("toggle");
        //temp.click().openDialog();
        this._div.innerHTML = htmlOutput;
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
        // this._div.innerHTML = '<div onclick=ahpControl.initialiseForm();> Activate AHP </div>';
        this._div.innerHTML = '<a href="#" class="big-link" data-reveal-id="myModal"><img class="icon" src="img/ahpicon.png"></a>';
    };

    map.addControl(ahpControl);

}

// Create avgrund popup
function openDialog() {
    Avgrund.show("#default-popup" );
}
function closeDialog() {
    Avgrund.hide();
    userInputControl.userInputOn ();
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
        userInputControl.popupOn();
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
//     return "<div><form> \n\
// Name: <input type='text' id ='name" + id + "' name='name' value='" + name + "' oninput=markerChangeDetails(" + id + "); /> <br/> \n\
// Transaction Price: <input type='text' id ='price" + id + "' name='price' value='" + price + "' oninput=markerChangeDetails(" + id + "); /><br/> \n\
// Floor Area: <input type='text' id ='area" + id + "' name='area' value='" + area + "' oninput=markerChangeDetails(" + id + "); /> \n\
// </form></div>";
return "<div> \n\
    <form class='input-choice'> \n\
        <table> \n\
            <tr> \n\
                <td colspan = '2'>\n\
                    <h4 style='text-align:center'>\n\
                        Choice " + id + " \n\
                    </h3>\n\
                </td> \n\
            </tr> \n\
            <tr> \n\
                <td class='titlecell'>Name:</td> \n\
                <td class='input-label-field'><input type='text' id='name" + id + "' name='name' value='" + name + "' oninput=markerChangeDetails(" + id + "); /> \n\
                </td> \n\
            </tr> \n\
            <tr> \n\
                <td class='titlecell'>Transaction Price:</td> \n\
                <td class='input-label-field'><input type='text' id ='price" + id + "' name='price' value='" + price + "' oninput=markerChangeDetails(" + id + "); /></td> \n\
            </tr> \n\
            <tr> \n\
                <td class='titlecell'>Floor Area:</td> \n\
                <td class='input-label-field'> \n\
                    <input type='text' id='area" + id + "' name='area' value='" + area + "' oninput=markerChangeDetails(" + id + "); /> \n\
                </td> \n\
            </tr> \n\
        </table> \n\
    </form> \n\
</div> \n\
" 
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
        mrtArray.value.push(getNearestFacility(latlng, mrtStationGeoJsonData));
        schoolArray.value.push(getNearestFacility(latlng, schoolGeoJsonData));

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
    //console.log(dataMarkerArray);
    return dataMarkerArray;

}

function getNearestFacility(latlng, facilityList) {
    //iterate list to find min distance from latlng (Distance returned in KM)
    // ANY REQUIREMENT TO HIGHLIGHT THE NEAREST FACILITY?

    var lng = latlng.lng;
    var lat = latlng.lat;
    var minDistance = Number.MAX_VALUE;

    for (var i = 0; i < facilityList.features.length; i++) {
        var coords = facilityList.features[i].geometry.coordinates;
        var facilityLng = coords[0];
        var facilityLat = coords[1];

        var dist = calculateDistance(lat, lng, facilityLat, facilityLng);

        if (dist <= minDistance) {
            minDistance = dist;
        }
    }

    //console.log(minDistance);

    return minDistance;
}

function calculateDistance(lat1, lon1, lat2, lon2) {

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
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