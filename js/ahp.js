/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var numcriteria = 4;
var consistencyTable = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

function processAHP(dataMarkerArray) {
    var locationArray = dataMarkerArray.locationArray;
    var criteriaValueArray = dataMarkerArray.criteriaValueArray;


    //Step 0: get user input
    var crit = new Array();
    var intensity = new Array();


    $('input[name^=crit]:checked').each(function() {
        crit.push(parseFloat(this.value));
    });

    $('input[name^=intensity]:checked').each(function() {
        intensity.push(parseFloat(this.value));
    });


    //Step 1: get Piority Matrix (Calculation to follow BPMSG, the squared matrix method) <- TO CHANGE THE BELOW)
    var unnormalisedArray = generateUnnormalisedArray(crit, intensity);
    //var squaredMatrix = multiplyMatrix(unnormalisedArray, unnormalisedArray);
    var normalisedArray = generateNormalisedArray(unnormalisedArray);
    var piorityArray = calculatePiorityMatrix(normalisedArray);

    //Step 1B: calculate Consistency Ratio
    var consistencyRatio = calculateConsistencyRatio(unnormalisedArray, piorityArray);
    console.log("Consistency Ratio: " + consistencyRatio);

    if (consistencyRatio > 0.1) {
        //alert("Calculated consistency ratio is less than 0.1, results might not be accurate.");
    }

    //Step 2: Compare each alternative based on different criterion
    var avgCriteriaArray = new Array();
    //for each criteria
    for (var i = 0; i < criteriaValueArray.length; i++) {
        //something seems off about the unnormalised and normalised matrices...
        var unnormalisedMatrix = generateUnnormalisedMatrix(criteriaValueArray[i].value, criteriaValueArray[i].smallerBetter);
        var normalisedMatrix = generateNormalisedArray(unnormalisedMatrix);
        var avgCriteria = calculatePiorityMatrix(normalisedMatrix);

        avgCriteriaArray.push(avgCriteria);
    }


    var rankedArray = generateRankedArray(avgCriteriaArray, piorityArray);
    var chosenLocation = locationArray[rankedArray.indexOf(Math.max.apply(Math, rankedArray))];
    console.log(chosenLocation);

    var output = "";


    for (var i = 0; i < rankedArray.length; i++) {
        output += "" + rankedArray[i] + "<br/>";
    }

    output += "Chosen Location: " + chosenLocation + "<br/>";

    $('#output').html(output);

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

function testmethod() {

}


