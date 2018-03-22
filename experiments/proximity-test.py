var data = require('./data.js');
var Bleacon = require('bleacon'); 
const ansi = require('ansi-escapes');
var sprintf = require("sprintf-js").sprintf,
    vsprintf = require("sprintf-js").vsprintf;

// setup kalman filter
var KalmanFilter = require('kalmanjs').default;

//
// globals
//

var kalmanFilter = new KalmanFilter({R: data.kalman.R, Q: data.kalman.Q});
var bleacons = {};
var foundCount = 0;

//
// setup data
//

// make indexed object
function makeIndexedObject(beaconsArray) {
    var bleacons = {};
    for (var i=0; i<beaconsArray.length; i++) {
        id = beaconsArray[i].uuid + "+" + beaconsArray[i].major + "+" + beaconsArray[i].minor;
        bleacons[id] = beaconsArray[i];
    }
    return bleacons;
}

//
// maths
//

function calculateDistance(txPower, rssi) {
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
} 

function dataMean(array) {
    var sum = 0;
    for (var i=array.length-1; i>=0; i--) {
        sum += array[i];
    }
    return sum / array.length;
}

//
// initiate scanning
//

function startScanning() {
    Bleacon.startScanning();
}

Bleacon.on('discover', function(bleacon) {
    //console.log("bleacon:", bleacon);
    id = bleacon.uuid + "+" + bleacon.major + "+" + bleacon.minor;
    //console.log("id:",id);
    if (id in bleacons) {
        // add missing data to bleacon objects
        if (!('rssiData' in bleacons[id])) {
            bleacons[id].rssiData = [];
        } 
        // keep a rolling log of rssi data
        bleacons[id].rssiData.push(bleacon.rssi);
        while (bleacons[id].rssiData.length > data.rssiLogLength) {
            bleacons[id].rssiData.shift();
        }
        // Use Kalman filter on rssi data
        var kalmanData = bleacons[id].rssiData.map(function(v) {
            return kalmanFilter.filter(v);
        });
        var kalmanAvg = dataMean(kalmanData);
        var distEst = calculateDistance(bleacon.measuredPower, kalmanAvg);

        //console.log(bleacons[id]);
        //console.log("name:", bleacons[id].name, 
            //" power:", bleacon.measuredPower, 
            //"rssi:", bleacon.rssi, "accu:", bleacon.accuracy.toFixed(2), 
            //"smooth dist:", bleacons[id].distSmooth.toFixed(2), 
            //"dist mean:", bleacons[id].distAvg.toFixed(2), 
            //"kalman mean:", bleacons[id].kalmanAvg.toFixed(2), 
            //"prox:", bleacon.proximity);

        displayData(bleacons[id].index, bleacons[id].name, bleacon.measuredPower, kalmanAvg, distEst);
    }
});

//
// display
//

function displayData(index, name, power, rssi, dist, prox) {
    var width = process.stdout.columns;
    var height = process.stdout.rows;
    var numBeacons = Object.keys(bleacons).length;
    //var row = Math.round(index * (height/numBeacons));
    var title1 = "iBEACON SENSING WITH KALMAN FILTERING OVER A ROLLLING LOG";
    var title2 = sprintf("Log Length: %d, Kalman (R:%f, Q:%f)", 
                        data.rssiLogLength, data.kalman.R, data.kalman.Q);
    var row = Math.round((index + 1) * 4 + 2);
    var header = sprintf("%-7s %7s %7s %7s    ","Name","Power","RSSI","Dist");
    var dataLine =   sprintf("%-7s %7d %7d %7.1fm  ", name, power, rssi, dist, prox);
    var pos = header.length + 8;
    var size = width - pos;
    var scale = "";
    var scaleCount = 0;
    while (scaleCount < size/2) {
        scale += sprintf("%-10d", scaleCount);
        scaleCount = scaleCount + 5;
    }
    //console.log("size:",size,"scaleCount",scaleCount);
    var scaled = Math.round(dist*2);
    var indicator = sprintf("[%"+scaled+"s%"+(size-scaled)+"s","@","]");

    //console.log("num:",numBeacons,"index:",index,"row:",row);
    console.log(ansi.cursorTo(Math.round((width/2)-(title1.length/2)),0) + title1);
    console.log(ansi.cursorTo(Math.round((width/2)-(title2.length/2)),1) + title2);
    console.log(ansi.cursorTo(0, row) + header + scale);
    console.log(dataLine + indicator);
    //console.log("size:",size,"scaled:",scaled,"      ");

    foundCount++;
    if (foundCount % 100 == 0) {
        console.log(ansi.eraseScreen);
    }
}

function main() {
    bleacons = makeIndexedObject(data.beacons);
    console.log(ansi.eraseScreen,ansi.cursorHide);
    startScanning();
}

main();
