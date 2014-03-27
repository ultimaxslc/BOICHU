var map;

var jsonArray = [];
var boundaryArray = [];

var googleLayerSatellite;
var googleLayerStreet;
var openStreeMapLayer;

var markersCluster;

var transactedPriceHeatMap;

var PointSymbolMap;
var PointSymbolMapLegend;

var mrtMapLines = [];
var mrtMapLayerReference;

var schoolsLayer;
var stadiumsLayer;

var polygonBoundary;
var polygonBoundaryLegend;

var proportionalSymbolMap;
var proportionalInfo;
var proportionalFocus;

var info;
var choroplethInfo;
var choroplethMaxValue;
var choroplethMinValue;
var numberOfChoroplethClasses = 9;
var choroplethFocus;
var choroplethControl;

var layerControl;

function loadScript() {

    $.ajaxSetup({
        async: false
    });

    map = new L.Map('map', {
        center: new L.LatLng(1.355312, 103.827068),
        zoom: 12
    });
    openStreeMapLayer = L.tileLayer.grayscale('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });
    // googleLayerSatellite = new L.Google('SATELLITE');
    // googleLayerStreet = new L.Google('ROADMAP');
    var baseMaps = {
        // 'Google (Satellite)': googleLayerSatellite,
        // 'Google(Street)': googleLayerStreet,
        'Open Street Maps': openStreeMapLayer
    };
    markersCluster = L.markerClusterGroup();
    transactedPriceHeatMap = new L.TileLayer.HeatCanvas({}, {
        'step': 0.3,
        'degree': HeatCanvas.QUAD,
        'opacity': 0.5
    });
    //initializing the layer groups
    PointSymbolMap = L.layerGroup();
    proportionalSymbolMap = L.layerGroup();
    schoolsLayer = L.layerGroup();

    //loading of property transaction data
    $.getJSON('data/realis.geojson', function(data) {
        jsonArray = data;

        //treat the data according to marker cluster
        addMarkerCluster(jsonArray);
        //treat the data according to heatmap
        addHeatMapLayer(jsonArray, 'Transacted');
        //treat the data according to point symbols
        addPointSymbolMap(jsonArray, 'Property T');

        $.getJSON('data/Polygon.geojson', function(polygonData) {
            boundaryArray = polygonData;
            setChoroplethLayer(boundaryArray, jsonArray, 'Average Price Area');
            //addProportionateSymbolMap(boundaryArray);
        });


        $.getJSON('data/PolygonCentroid.geojson', function(polygonCentroidData) {
            addProportionateSymbolMap(polygonCentroidData, boundaryArray, 'Number Of Transactions');
        });

    });


    $.getJSON('data/sgmrtstations.geojson', function(stationData) {
        // $.getJSON('data/sgrailnetwork.geojson', function(railData) {
        //     addMRTStationMap(stationData, railData);
        // });
        railData = [];
        $.getJSON('data/NSLine.geojson', function(NSLineData) {
            railData.push(NSLineData)
        });
        $.getJSON('data/EWLine.geojson', function(EWLineData) {
            railData.push(EWLineData)
        });
        $.getJSON('data/NELine.geojson', function(NELineData) {
            railData.push(NELineData)
        });
        $.getJSON('data/DowntownLine.geojson', function(DowntownLineData) {
            railData.push(DowntownLineData)
        });
        $.getJSON('data/CircleLine.geojson', function(CircleLineData) {
            railData.push(CircleLineData)
        });
        addMRTStationMap(stationData, railData);
    });

    $.getJSON('data/Stadiums.geojson', function(stadiumData) {
        addStadiumMap(stadiumData);
    });
    $.getJSON('data/Schools.geojson', function(schoolData) {
        addSchoolsMap(schoolData);
    });


    /*
     $.getJSON('data/sgroadsnetwork.geojson', function(data) {
     var myLayer = L.geoJson().addTo(map);
     myLayer.addData(data);
     });
     */

    var overlayMaps = {
        'Cluster Marker': markersCluster,
        'Point Symbol': PointSymbolMap,
        'Transacted Price Heat Map': transactedPriceHeatMap,
        'MRT Map': mrtMapLayerReference,
        'Singapore Sub Zones': polygonBoundary,
        'Proportional Symbol': proportionalSymbolMap,
        'Schools': schoolsLayer,
        'Stadiums': stadiumsLayer
    };

    map.addLayer(openStreeMapLayer);
    addHoverInfoControl();
    layerControl = L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
    renderChoroplethVariableControl()
    addLayerChangeEventHandler();
    addPanLayerControl();
    addUserMarkerControl();

    $.ajaxSetup({
        async: false
    });
    $(".loading").remove();

}

function addPanLayerControl() {
    panLayerControl = L.control.pan({
        position: "topleft"
    }).addTo(map)
}

function addLayerChangeEventHandler() {
    map.on('overlayadd', function(eventLayer) {

        if (eventLayer.name === 'Point Symbol') {
            this.addControl(PointSymbolMapLegend);
            this.addControl(info);
        }

        if (eventLayer.name === 'Singapore Sub Zones') {
            this.addControl(polygonBoundaryLegend);
            this.addControl(choroplethInfo);
            this.addControl(choroplethControl);
        }

        if (eventLayer.name === 'Proportional Symbol') {
            this.addControl(proportionalInfo);
        }

    });
    map.on('overlayremove', function(eventLayer) {
        if (eventLayer.name === 'Point Symbol') {
            this.removeControl(PointSymbolMapLegend);
            this.removeControl(info);
        }

        if (eventLayer.name === 'Singapore Sub Zones') {
            this.removeControl(polygonBoundaryLegend);
            this.removeControl(choroplethInfo);
            this.removeControl(choroplethControl);
        }

        if (eventLayer.name === 'Proportional Symbol') {
            this.removeControl(proportionalInfo);
        }
    });
}

function addMRTStationMap(stationData, railData) {

    var mrtIcon = L.icon({
        iconUrl: 'img/mrt.png',
        iconSize: [15, 15]
    });

    var geoJsonLayer = new L.geoJson(railData, {
        style: function(feature, latlng) {
            switch (feature.properties.name) {
                case 'MRT North-South Line (NSL-NB)':
                    return {
                        color: '#de2d26'
                    };
                case 'MRT East-West Line (EWL-EB)':
                    return {
                        color: '#109531'
                    };
                case 'MRT North East Line (NEL)':
                    return {
                        color: '#9016b2'
                    };
                case 'MRT Downtown Line (DTL)':
                    return {
                        color: '#0a3f95'
                    };
                case 'MRT Circle Line (CCL)':
                    return {
                        color: '#fb8708'
                    };
            }
        },
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: mrtIcon
            });
        }
    });

    mrtMapLayerReference = geoJsonLayer;
    mrtMapLayerReference.addData(stationData);
}

function addStadiumMap(stadiumData) {
    var geoJsonLayer = new L.geoJson(stadiumData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(renderFeatureTableFor(feature));
            // layer.on('mouseover', onCircleMouseOver);
            // layer.on('mouseout', onCircleMouseOut);
        }
    });
    stadiumsLayer = geoJsonLayer;
}


function addSchoolsMap(schoolData) {
    var geoJsonLayer = new L.geoJson(schoolData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(renderFeatureTableFor(feature));
            // layer.on('mouseover', onCircleMouseOver);
            // layer.on('mouseout', onCircleMouseOut);
        }
    });
    schoolsLayer = geoJsonLayer;
}


function addProportionateSymbolMap(polygonCentroidData, boundaryArray, categoryType) {
    //to modifyvar categoryTypeArray = [];

    var valueArr = [];
    proportionalFocus = categoryType;

    for (var i in polygonCentroidData["features"]) {
        for (var j in boundaryArray["features"]) {
            if (polygonCentroidData["features"][i]["properties"]["DGPSZ_CODE"] === boundaryArray["features"][j]["properties"]["DGPSZ_CODE"]) {
                polygonCentroidData["features"][i]["properties"][proportionalFocus] = boundaryArray['features'][j]['properties'][proportionalFocus];
                valueArr.push(polygonCentroidData["features"][i]["properties"][categoryType]);
            }
        }
    }

    //to be modified
    var maxValue = Math.max.apply(Math, valueArr);


    var geoJsonLayer = new L.geoJson(polygonCentroidData, {
        onEachFeature: function(feature, layer) {
            layer.on('mouseover', onProportionMouseOver);
            layer.on('mouseout', onProportionMouseOut);
        },
        pointToLayer: function(feature, latlng) {


            return L.circleMarker(latlng, {
                radius: feature.properties[proportionalFocus] / maxValue * 25,
                color: 'black',
                weight: 1,
                fillColor: 'red',
                fillOpacity: 0.5,
                opacity: 1
            });
            /*
             return L.circleMarker(latlng, {
             radius: feature.properties[proportionalFocus] / minValue * 5,
             color: 'black',
             weight: 1,
             fillColor: 'red',
             fillOpacity: 0.3,
             opacity: 1
             });
             */
        }
    });

    proportionalSymbolMap = geoJsonLayer;
    addProportionalHoverInfoControl();

}

function onProportionMouseOver(e) {
    var layer = e.target;
    layer.setStyle({
        fillOpacity: 0.8
    });

    proportionalInfo.update(layer['feature']['properties']);
    //layer.setRadius(100);
}

function onProportionMouseOut(e) {
    var layer = e.target;
    layer.setStyle({
        fillOpacity: 0.3
    });
    proportionalInfo.update();
    //layer.setRadius(20);
}

function addProportionalHoverInfoControl() {
    proportionalInfo = L.control({
        position: 'bottomleft'
    });
    proportionalInfo.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    proportionalInfo.update = function(subzone) {
        this._div.innerHTML = '<h4>Sub Zone</h4>' + (subzone ? getSubZoneProportionalInfo(subzone) : 'Hover over a Sub Zone');
    };
}

function renderChoroplethVariableControl() {
    choroplethControl = L.control({
        position: 'bottomright'
    });

    choroplethControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'varControl');
        this._div.innerHTML = '<select onchange="getSelectedVariableInChoroplethControl()">' +
                '<option value="Number Of Transactions"' + (choroplethFocus === "Number Of Transactions" ? " selected" : "") + '>Number of Transactions</option>' +
                '<option value="Total Area Sold"' + (choroplethFocus === "Total Area Sold" ? " selected" : "") + '>Total Area Sold</option>' +
                '<option value="Total Transaction Amount"' + (choroplethFocus === "Total Transaction Amount" ? " selected" : "") + '>Total Transaction Amount</option>' +
                '<option value="Average Transaction Amount"' + (choroplethFocus === "Average Transaction Amount" ? " selected" : "") + '>Average Transaction Amount</option>' +
                '<option value="Average Price Area"' + (choroplethFocus === "Average Price Area" ? " selected" : "") + '>Average Price per Area</option>' +
                '</select>';
        // this.update();
        return this._div;
    };

    // choroplethControl.update = function(subzone) {
    //     this._div.innerHTML = '<h4>Sub Zone</h4>' + (subzone ? getSubZoneProportionalInfo(subzone) : 'Hover over a Sub Zone');
    // };
}

function getSelectedVariableInChoroplethControl() {

    var chosenOption = $(".varControl option:selected").val();
    var polygonJson = polygonBoundary.toGeoJSON();

    map.removeControl(polygonBoundaryLegend);
    map.removeControl(choroplethInfo);
    map.removeControl(choroplethControl);

    setChoroplethFocus(polygonJson, chosenOption);
    polygonBoundary.setStyle(styleChoropleth);
    setChoroplethLegend();
    
    map.addControl(polygonBoundaryLegend);
    map.addControl(choroplethInfo);
    map.addControl(choroplethControl);

}

function getSubZoneProportionalInfo(subzone) {

    var interestedValue = subzone[proportionalFocus];

    return '<b>Area Name: ' + subzone.DGPZ_NAME + '</b><br />' +
            'Sub Area Name: ' + subzone.DGPSZ_NAME + '<br>' +
            proportionalFocus + ': ' + Math.round(interestedValue) + '<br>';
}

function setChoroplethLayer(polygonJson, transactionJson, chosenFocus) {
    for (var i in polygonJson['features']) {
        polygonJson['features'][i]['properties'].transactionList = [];
        for (var j in transactionJson['features']) {
            if (polygonJson['features'][i]['properties']['DGPSZ_CODE'] === transactionJson['features'][j]['properties']['DGPSZ_CODE']) {
                polygonJson['features'][i]['properties'].transactionList.push(transactionJson['features'][j]);
            }
        }
    }

    var transactionList = [];

    for (var i in polygonJson['features']) {
        transactionList = polygonJson['features'][i]['properties'].transactionList;
        polygonJson['features'][i]['properties']["Number Of Transactions"] = 0;
        polygonJson['features'][i]['properties']["Total Area Sold"] = 0;
        polygonJson['features'][i]['properties']["Total Transaction Amount"] = 0;
        polygonJson['features'][i]['properties']["Average Transaction Amount"] = 0;
        polygonJson['features'][i]['properties']["Average Price Area"] = 0;

        if (transactionList.length === 0) {
            continue;
        }

        var totalTransactedAmount = 0;
        var totalArea = 0;

        for (var j in transactionList) {

            totalTransactedAmount = totalTransactedAmount + transactionList[j]['properties']['Transacted'];
            totalArea = totalArea + transactionList[j]['properties']['Area (sqm)'];
        }

        polygonJson['features'][i]['properties']["Number Of Transactions"] = transactionList.length;
        polygonJson['features'][i]['properties']["Total Area Sold"] = totalArea;
        polygonJson['features'][i]['properties']["Total Transaction Amount"] = totalTransactedAmount;
        polygonJson['features'][i]['properties']["Average Transaction Amount"] = totalTransactedAmount / transactionList.length;
        polygonJson['features'][i]['properties']["Average Price Area"] = totalTransactedAmount / totalArea;

    }

    setChoroplethFocus(polygonJson, chosenFocus);

    polygonBoundary = new L.geoJson(polygonJson, {
        style: styleChoropleth,
        onEachFeature: onChoroplethEachFeature
    });

    setChoroplethLegend();
    addChoroplethHoverInfoControl();
}

function setChoroplethFocus(polygonJson, chosenFocus) {
    var chosenValue = [];

    for (var i in polygonJson['features']) {
        chosenValue.push(polygonJson['features'][i]['properties'][chosenFocus]);
        //console.log(polygonJson['features'][i]['properties'][chosenFocus]);
    }

    choroplethMinValue = Math.min.apply(Math, chosenValue);
    choroplethMaxValue = Math.max.apply(Math, chosenValue);

    /*
     choroplethMinValue = finder(Math.min, chosenValue, chosenFocus);
     choroplethMaxValue = finder(Math.max, chosenValue, chosenFocus);
     */

    choroplethFocus = chosenFocus;
}

function onChoroplethEachFeature(feature, layer) {
    layer.on({
        mouseover: mouseoverChoroplethLayer,
        mouseout: mouseoutChoroplethLayer,
        click: zoomToFeature
    });
}

function mouseoverChoroplethLayer(e) {
    var layer = e.target;
    layer.setStyle({
        color: 'black'
    });
    choroplethInfo.update(layer.feature);
}

function mouseoutChoroplethLayer(e) {
    var layer = e.target;
    layer.setStyle({
        color: 'white'
    });
    choroplethInfo.update();
}

function addChoroplethHoverInfoControl() {
    choroplethInfo = L.control({
        position: 'bottomleft'
    });
    choroplethInfo.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    choroplethInfo.update = function(subzone) {
        this._div.innerHTML = '<h4>Sub Zone</h4>' + (subzone ? getSubZoneInfo(subzone) : 'Hover over a Sub Zone');
    };
}

function getSubZoneInfo(subzone) {
    var zone = subzone.properties;
    var interestedValue = subzone.properties[choroplethFocus];

    return '<b>Area Name: ' + zone.DGPZ_NAME + '</b><br />' +
            'Sub Area Name: ' + zone.DGPSZ_NAME + '<br>' +
            choroplethFocus + ': ' + Math.round(interestedValue) + '<br>';
}

function setChoroplethLegend() {
    var colourArray = [];
    var interval = (choroplethMaxValue - choroplethMinValue) / numberOfChoroplethClasses;
    var lowerBound = choroplethMinValue;
    var upperBound = choroplethMinValue + interval;
    var key;

    while (upperBound < choroplethMaxValue) {
        key = Math.round(lowerBound) + "-" + Math.round(upperBound);
        colourArray[key] = getChoroplethColour(upperBound);
        lowerBound = upperBound;
        upperBound = upperBound + interval;
    }

    polygonBoundaryLegend = getLegend(colourArray, choroplethFocus);
}

function styleChoropleth(feature) {
    return {
        fillColor: getChoroplethColour(feature.properties[choroplethFocus]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function getChoroplethColour(value) {
    var interval = (choroplethMaxValue - choroplethMinValue) / numberOfChoroplethClasses;

    return value > choroplethMaxValue - 1 * interval ? '#08306b' :
            value > choroplethMaxValue - 2 * interval ? '#08519c' :
            value > choroplethMaxValue - 3 * interval ? '#2171b5' :
            value > choroplethMaxValue - 4 * interval ? '#4292c6' :
            value > choroplethMaxValue - 5 * interval ? '#6baed6' :
            value > choroplethMaxValue - 6 * interval ? '#9ecae1' :
            value > choroplethMaxValue - 7 * interval ? '#c6dbef' :
            value > choroplethMaxValue - 8 * interval ? '#deebf7' :
            '#f7fbff';
}

//Information Control for dynamic tooltipping

function getTransactionInfo(transaction) {
    return renderTransactionDataTableFor(transaction);
}

function addHoverInfoControl() {
    info = L.control({
        position: 'bottomleft'
    });
    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    info.update = function(transaction) {
        this._div.innerHTML = '<h4>Property Transaction</h4>' + (transaction ? getTransactionInfo(transaction) : 'Hover over a transaction');
    };
}

function addPointSymbolMap(json, categoryType) {

    var transactionArray = json['features'];

    var categoryTypeArray = [];
    $.each(transactionArray, function(index, transaction) {
        if ($.inArray(transaction['properties'][categoryType], categoryTypeArray) === -1) {
            categoryTypeArray.push(transaction['properties'][categoryType]);
        }
    });

    var colourArray = [];
    $.each(categoryTypeArray, function(index, categoryType) {
        colourArray[categoryType] = colorSet(index, categoryTypeArray.length);
        //colourArray[propertyType] = getRandomColour();
    });

    var geoJsonLayer = new L.geoJson(json, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(getTransactionInfo(feature.properties));
            layer.on('mouseover', onCircleMouseOver);
            layer.on('mouseout', onCircleMouseOut);
        },
        pointToLayer: function(feature, latlng) {

            return L.circleMarker(latlng, {
                radius: 5,
                color: 'black',
                weight: 1,
                fillColor: colourArray[feature['properties'][categoryType]],
                fillOpacity: 1,
                opacity: 1
            });
        }
    });

    PointSymbolMap = geoJsonLayer;

    PointSymbolMapLegend = getLegend(colourArray, 'Point Symbol Legend');
}

function addHeatMapLayer(json, propertySelection) {
    /*
     transactedPriceHeatMap.onRenderingStart(function() {
     console.log('rendering');
     });
     transactedPriceHeatMap.onRenderingEnd(function() {
     alert('rendered');
     });
     */

    var heatMapArray = [];

    $.each(json['features'], function(index, transaction) {
        var properties = [];
        properties['lat'] = transaction["properties"]["latitude"];
        properties['lng'] = transaction["properties"]["longitude"];
        properties[propertySelection] = transaction["properties"][propertySelection];
        heatMapArray.push(properties);
    });


    var minValue = finder(Math.min, heatMapArray, "Transacted");

    $.each(heatMapArray, function(index, transaction) {
        transactedPriceHeatMap.pushData(transaction.lat, transaction.lng, (transaction[propertySelection] / minValue));
    });
}

function addMarkerCluster(json) {
    var geoJsonLayer = new L.geoJson(json, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(getTransactionInfo(feature.properties));
        }
    });
    markersCluster.addLayer(geoJsonLayer);
}

function getLegend(colourArray, legendHeading) {
    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend');
        var legendInput = '<h4>' + legendHeading + '</h4>';
        for (var k in colourArray) {
            legendInput += '<i style="background:' + colourArray[k] + '"></i> ' + k + '<br>';
        }

        div.innerHTML = legendInput;
        return div;
    };
    return legend;
}

function onCircleMouseOver(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5
    });

    info.update(layer['feature']['properties']);
    //layer.setRadius(100);
}

function onCircleMouseOut(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 1
    });
    info.update();
    //layer.setRadius(20);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function runAHP() {
    //get locationArray and criteriaValueArray
    //locationArray can be array of names or ID, to identify the location
    //need error handling for user inputs

    var priceArray = {
        smallerBetter: true,
        value: [1000, 2000, 500]
    };

    var areaArray = {
        smallerBetter: false,
        value: [100, 50, 100]
    };

    var mrtArray = {
        smallerBetter: true,
        value: [50, 100, 20]
    };

    var schoolArray = {
        smallerBetter: true,
        value: [50, 100, 20]
    };


    var dataMarkerArray = {
        locationArray: ['sengkang', 'bedok', 'SMU'],
        criteriaValueArray: [
            priceArray,
            areaArray,
            mrtArray,
            schoolArray
        ]
    };
    /*
     * To be uncommented when all the parts fall in place...
     * 
     * var dataMarkerArray = getMarkerDetails();
     * 
     */


    processAHP(dataMarkerArray);
}


