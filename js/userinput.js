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

function addUserMarkerControl() {

    userInputControl = L.control({position: 'bottomright'});
    userInputControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'userInputControl');
        this.userInputOn();
        return this._div;
    };
    userInputControl.userInputOn = function() {
        this._div.innerHTML = '<div id="toggle" onclick="addUserMarker()">Add Marker</div>';
    };

    map.addControl(userInputControl);
    
    
    
}

function addUserMarker() {

    if (inputMarker.length >= 3) {
        //insert some code to stop user from adding more markers
        alert("There are already 3 markers on map!");
        return;
    }

    //var latlngStr = '(' + map.getCenter().lat.toFixed(3) + ', ' + map.getCenter().lng.toFixed(3) + ')';
    //inputPopup = new L.popup();

    var defaultName = "Property " + id
    var marker = new L.marker(map.getCenter(), {
        draggable: true,
        name: defaultName,
        id: id
    }).addTo(map);


    //marker.on('click',markerClick);
    marker.on('contextmenu', markerRemove);
    marker.bindPopup(
            "<div><form> \n\
Name: <input type='text' id ='name"+id+"' name='name' value='"+ defaultName +"' oninput=markerChangeName("+id+"); /> <br/> \n\
Transaction Price: <input type='text' id ='price"+id+"' name='price' /><br/> \n\
Floor Area: <input type='text' id ='area"+id+"' name='area'/> \n\
</form></div>"
            );
    
    marker.openPopup();
    inputMarker.push(marker);
    id = id + 1;

}

function markerChangeName(id) {
    
    var newName = document.getElementById("name"+id).value;
    
    for (var i = 0; i < inputMarker.length; i++) {
        if (id === inputMarker[i].options.id) {
            inputMarker[i].options.name = newName;
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
            inputMarker.splice(i,1);
        }
    }
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