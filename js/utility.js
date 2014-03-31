function multiplyMatrix(m1, m2) {
    var result = [];
    for (var j = 0; j < m2.length; j++) {
        result[j] = [];
        for (var k = 0; k < m1[0].length; k++) {
            var sum = 0;
            for (var i = 0; i < m1.length; i++) {
                sum += m1[i][k] * m2[j][i];
            }
            result[j].push(sum);
        }
    }
    return result;
}


function getRandomColour() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function colorSet(index, maxIndex) {
    var center = 128;
    var width = 127;
    var frequency = 2.4; //Math.PI * 2 / maxIndex;
    var red = Math.sin(frequency * index + 2) * width + center;
    var green = Math.sin(frequency * index + 0) * width + center;
    var blue = Math.sin(frequency * index + 4) * width + center;
    return RGB2Color(red, green, blue);
}

function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
    //'#'+Math.floor(Math.random()*16777215).toString(16);
}

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function finder(cmp, arr, attr) {
    var val = arr[0][attr];
    for (var i = 1; i < arr.length; i++) {
        val = cmp(val, arr[i][attr]);
    }
    return val;
}

function renderFeatureTableFor(feature) {
    return '<b>' + feature.properties["Name"] + '</b>';
}

function renderTransactionDataTableFor(transaction) {
    return "<table class='infopanel'>" +
            "<tr>" +
            "<td colspan='2'>" +
            "<h3 class='projectName' style='text-align:center'>" +
            transaction['Project Na']
            + "</h3>" +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Address: </td>" +
            "<td class='valuecell'>" +
            transaction['Address']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Postal Code: </td>" +
            "<td class='valuecell'>" +
            transaction['Postal Cod']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Type of Area: </td>" +
            "<td class='valuecell'>" +
            transaction['Type of Ar']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Transacted Price: </td>" +
            "<td class='valuecell'>" +
            numeral(transaction['Transacted']).format('$0,0.00')
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Area (m<sup>2</sup>): </td>" +
            "<td class='valuecell'>" +
            numeral(transaction['Area (sqm)']).format('0,0.0')
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Unit Price (per m<sup>2</sup>): </td>" +
            "<td class='valuecell'>" +
            numeral(transaction['Unit Price']).format('$0,0.00')
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Property Type: </td>" +
            "<td class='valuecell'>" +
            transaction['Property T']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Type of Sale: </td>" +
            "<td class='valuecell'>" +
            transaction['Type of Sa']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Planning Region: </td>" +
            "<td class='valuecell'>" +
            transaction['Planning R']
            + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td class='titlecell'>Planning Area: </td>" +
            "<td class='valuecell'>" +
            transaction['Planning A']
            + "</td>" +
            "</tr>" +
            "</table>"
}

function pointInPolygon(ploygonArray, lat, lng) {

    var polySides = ploygonArray.length;

    var i, j = polySides - 1;
    var oddNodes = false;
    var polyLat;
    var polyLng;

    //0 is lng, 1 is lat
    for (i = 0; i < polySides; i++) {
        polyLat = ploygonArray[i][0];
        polyLng = ploygonArray[i][1];

        if ((ploygonArray[i][1] < lat && ploygonArray[j][1] >= lat
                || ploygonArray[j][1] < lat && ploygonArray[i][1] >= lat)
                && (ploygonArray[i][0] <= lng || ploygonArray[j][0] <= lng)) {
            if (ploygonArray[i][0] + (lat - ploygonArray[i][1]) / (ploygonArray[j][1] - ploygonArray[i][1]) * (ploygonArray[j][0] - ploygonArray[i][0]) < lng) {
                oddNodes = !oddNodes;
            }
        }
        j = i;
    }
    return oddNodes;
}