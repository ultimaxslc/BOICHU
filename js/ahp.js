/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var numcriteria = 4;
var consistencyTable = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
var consistencyRatio = 0;

function processAHP(dataMarkerArray, numOfPlayer) {
    var locationArray = dataMarkerArray.locationArray;
    var criteriaValueArray = dataMarkerArray.criteriaValueArray;

    var combineArray;

    if (numOfPlayer === 2) {
        combineArray = getUserCriteria2();
    } else {
        combineArray = getUserCriteria();
    }

    var piorityArray = calculatePiorityMatrix(combineArray[1]);

    //Step 1B: calculate Consistency Ratio
    consistencyRatio = calculateConsistencyRatio(combineArray[0], piorityArray);
    console.log("Consistency Ratio: " + consistencyRatio);

    $('.mode-toggle').hide();
    $('#two-player-mode').hide();
    $('#single-player-mode').hide();
    $('#ahp-output').show();

    var bannerContent = '<h1 style="font-variant:small-caps;font-size:2.25em;color:#fff;text-align:center">Recommendation</h2>';
    var banner = $('<div/>', {
        id: 'bannerId',
        class: 'bruceBanner',
        html: bannerContent
    });
    $('#ahp-output').append(banner);

    if (consistencyRatio > 0.1) {
        //alert("Calculated consistency ratio is less than 0.1, results might not be accurate.");
        var alertContent = '<h4 style="font-style:italic; color:#b83d80">Calculated consistency ratio is more than 0.1, results might not be accurate.</h4>';
        var consistencyAlert = $('<div/>', {
            id: 'consistencyAlert',
            class: 'consistencyAlert',
            html:alertContent
        });
        $('#ahp-output').append(consistencyAlert);
    }

    //Step 2: Compare each alternative based on different criterion
    var avgCriteriaArray = new Array();
    //for each criteria
    for (var i = 0; i < criteriaValueArray.length; i++) {

        var unnormalisedMatrix = generateUnnormalisedMatrix(criteriaValueArray[i].value, criteriaValueArray[i].smallerBetter);
        var normalisedMatrix = generateNormalisedArray(unnormalisedMatrix);
        var avgCriteria = calculatePiorityMatrix(normalisedMatrix);

        avgCriteriaArray.push(avgCriteria);
    }


    var rankedArray = generateRankedArray(avgCriteriaArray, piorityArray);
    var chosenLocation = locationArray[rankedArray.indexOf(Math.max.apply(Math, rankedArray))];

    console.log(chosenLocation);
    console.log(rankedArray);

    for(var i = 0; i<inputMarker.length; i++){
        inputMarker[i].options.ahpOutput = rankedArray[i];
    }


    var output = "";

    for (var i = 0; i < rankedArray.length; i++) {
        output += "" + rankedArray[i] + "<br/>";
    }

    // output += "Chosen Location: " + chosenLocation + "<br/>";

    // $('#output').html(output);
    var theResultantDetails;

    for (var i = 0; i < inputMarker.length; i++) {
        if (inputMarker[i].options.id === chosenLocation) {
            theResultantDetails = inputMarker[i].options;
        }
    }
    
    var resultContent = '<p style="color:#3f3f3f; font-size:3em; font-weight:bold; margin:0px;">'+ theResultantDetails.name +'</h1><br/>'+
        '<p class="resultText" style="color:#3f3f3f; font-size:1.5em; margin:0px;">' +
            'with a rank score of ' + numeral(theResultantDetails.ahpOutput).format('0.000') +
            ', transaction price of ' + numeral(theResultantDetails.price).format('$0,0') +
            ' and a floor area of ' +
            numeral(theResultantDetails.area).format('0,0') + 
            'm<sup>2</sup>.'+
        '</p> ' +
        '<hr noshade/>';
    var resultLoad = $('<div/>', {
            id: 'ahp-result',
            class: 'ahp-results',
            html:resultContent
        });
    $('#ahp-output').append(resultLoad);

    //get all the non-recommendations
    var nonRecs = [];
    _.each(inputMarker, function(currentMarker){
        if (currentMarker.options.id != chosenLocation){
            nonRecs.push(currentMarker);
        }
    })
    //loop and add to ul li
    var listContent = '<p style="color:#3f3f3f; font-size:1.2em; margin:0px;">Other alternatives in order of recommendation</p><ol>';
    _.each(nonRecs, function(currentNonRec){
        listContent += '<li>';
        listContent += currentNonRec.options.name;
        listContent += '<ul><li>Rank Score ';
        listContent += numeral(currentNonRec.options.ahpOutput).format('0.000');
        listContent += '</li></ul>';
        listContent += '</li>';
    });
    listContent += '</ol>';

    var listObject = "<div>" + listContent + "</div>";


    //append the whole list as jquery object
    // $('#ahp-output').append(listContent);
    $('#ahp-output').append(listObject);

    return chosenLocation;
}

function generateRankedArray(avgCriteriaArray, piorityArray) {

    var calculatedValue = 0;
    var rankedArray = new Array();

    for (var i = 0; i < avgCriteriaArray[0].length; i++) {
        for (var j = 0; j < avgCriteriaArray.length; j++) {
            calculatedValue += avgCriteriaArray[j][i] * piorityArray[j];
        }
        rankedArray.push(calculatedValue);
        calculatedValue = 0;
    }

    return rankedArray;
}

function generateUnnormalisedMatrix(valueArray, smallerBetter) {
    var unnormalisedMatrix = new Array();

    for (var i = 0; i < valueArray.length; i++) {
        unnormalisedMatrix[i] = new Array();
        for (var j = 0; j < valueArray.length; j++) {
            if (smallerBetter) {
                unnormalisedMatrix[i].push(valueArray[j] / valueArray[i]);
            } else {
                unnormalisedMatrix[i].push(valueArray[i] / valueArray[j]);
            }
        }
    }
    return unnormalisedMatrix;
}


function calculateConsistencyRatio(unnormalisedArray, piorityArray) {
    //unnormalisedArray * piorityArray

    var productArr = new Array;

    for (var i = 0; i < numcriteria; i++) {
        productArr[i] = 0;

        for (var j = 0; j < numcriteria; j++) {
            productArr[i] += parseFloat(unnormalisedArray[i][j] * piorityArray[j]);
        }
    }

    //var eigenVector = new Array();
    var eigenValue = 0;
    //var lamda = 0;

    for (var i = 0; i < numcriteria; i++) {

        var value = productArr[i] / piorityArray[i];

        //eigenVector.push(value);
        eigenValue += value;
        //lamda = (value > lamda) ? value : lamda;
    }

    var averageEigenValue = eigenValue / numcriteria;

    var ci = (averageEigenValue - numcriteria) / (numcriteria - 1);
    var cr = ci / consistencyTable[numcriteria - 1];

    return cr;

}

function calculatePiorityMatrix(normalisedArray) {
    //var rowTotalArray = new Array();
    //var normalizedRows = new Array();
    var piorityArray = new Array();
    var rowTotal = 0;
    //var overallTotal = 0;

    for (var i = 0; i < normalisedArray.length; i++) {
        for (var j = 0; j < normalisedArray[i].length; j++) {
            rowTotal += normalisedArray[i][j];
        }
        piorityArray.push(rowTotal / normalisedArray[i].length);
        //rowTotalArray.push(rowTotal);
        //overallTotal += rowTotal;
        rowTotal = 0;
    }

    /*
     for (var i = 0; i<numcriteria; i++){
     normalizedRows[i] = rowTotalArray[i]/overallTotal;
     }
     */
    return piorityArray;
    //return normalizedRows;
}

function generateNormalisedArray(unnormalisedArray) {
    var columnTotal = new Array();
    var normalisedArray = new Array();
    var total = 0;

    for (var j = 0; j < unnormalisedArray[0].length; j++) {
        for (var i = 0; i < unnormalisedArray.length; i++) {
            total += unnormalisedArray[i][j];
        }
        columnTotal.push(total);
        total = 0;
    }

    for (var i = 0; i < unnormalisedArray.length; i++) {
        normalisedArray[i] = new Array();
        for (var j = 0; j < unnormalisedArray[i].length; j++) {
            normalisedArray[i][j] = unnormalisedArray[i][j] / columnTotal[j];
        }
    }

    return normalisedArray;

}

function generateUnnormalisedArray(criteriaArr, intensityArr) {
    var unnormalisedArray = new Array();
    var l = 0;

    for (var i = 0; i < numcriteria; i++) {
        unnormalisedArray[i] = new Array();
        for (var j = i; j < numcriteria; j++) {
            if (i === j) {
                unnormalisedArray[i][j] = 1;
            } else {
                if (criteriaArr[l] === 1) {
                    unnormalisedArray[i][j] = intensityArr[l];
                } else {
                    unnormalisedArray[i][j] = 1 / intensityArr[l];
                }
                l++;
            }
        }
    }

    l = 0;

    for (var j = 0; j < numcriteria; j++) {
        for (var i = j; i < numcriteria; i++) {
            if (i === j) {
                unnormalisedArray[i][j] = 1;
            } else {
                if (criteriaArr[l] === 2) {
                    unnormalisedArray[i][j] = intensityArr[l];
                } else {
                    unnormalisedArray[i][j] = 1 / intensityArr[l];
                }
                l++;
            }
        }
    }

    return unnormalisedArray;
}



function runTestAHP() {
    var dataMarkerArray = getTestData();
    var chosenLocation = processAHP(dataMarkerArray, 2);

    console.log(chosenLocation);
}

function getTestData() {
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

    return dataMarkerArray;
}

function getUserCriteria2() {
    var crit_1 = new Array();
    var intensity_1 = new Array();

    var crit_2 = new Array();
    var intensity_2 = new Array();


    $('input[name^=multi-crit-1player]:checked').each(function() {
        crit_1.push(parseFloat(this.value));
    });

    $('input[name^=multi-intensity-1player]:checked').each(function() {
        intensity_1.push(parseFloat(this.value));
    });

    $('input[name^=multi-crit-2player]:checked').each(function() {
        crit_2.push(parseFloat(this.value));
    });

    $('input[name^=multi-intensity-2player]:checked').each(function() {
        intensity_2.push(parseFloat(this.value));
    });


    var unnormalisedArray_1 = generateUnnormalisedArray(crit_1, intensity_1);
    var normalisedArray_1 = generateNormalisedArray(unnormalisedArray_1);
    

    var unnormalisedArray_2 = generateUnnormalisedArray(crit_2, intensity_2);
    var normalisedArray_2 = generateNormalisedArray(unnormalisedArray_2);

    var overallNoramlisedArray = averageOutArray(normalisedArray_2, normalisedArray_1);
    var overallUnnormalisedArray = reunnormaliseArray(overallNoramlisedArray);
     
    var returnArray = [overallUnnormalisedArray, overallNoramlisedArray];

    return returnArray;
}

function getUserCriteria() {
    //Step 0: get user input
    var crit = new Array();
    var intensity = new Array();


    $('input[name^=crit]:checked').each(function() {
        crit.push(parseFloat(this.value));
    });

    $('input[name^=intensity]:checked').each(function() {
        intensity.push(parseFloat(this.value));
    });


    //Step 1: get Piority Matrix 
    var unnormalisedArray = generateUnnormalisedArray(crit, intensity);
    var normalisedArray = generateNormalisedArray(unnormalisedArray);
    
    var returnArray = [unnormalisedArray, normalisedArray];

    return returnArray;
}

function averageOutArray(array1, array2) {

    var overallArray = new Array();

    for (var i = 0; i < array1.length; i++) {
        overallArray[i] = new Array();
        for (var j = 0; j < array1[i].length; j++) {
            overallArray[i][j] = (array1[i][j] + array2[i][j]) / 2;
        }
    }

    return overallArray;
}

function reunnormaliseArray(normalisedArray) {

    var factorArray = new Array();
    var unnormalisedArray = new Array();
    var total = 0;
    
    for (var i = 0; i < normalisedArray.length; i++) {
        factorArray.push(1 / normalisedArray[i][i]);
        unnormalisedArray[i] = new Array();
    }

    for (var j = 0; j < normalisedArray[0].length; j++) {
        for (var i = 0; i < normalisedArray.length; i++) {
            unnormalisedArray[i][j] = normalisedArray[i][j] * factorArray[j];
            total += normalisedArray[i][j];
        }

        total = 0;
    }

    return unnormalisedArray;
}