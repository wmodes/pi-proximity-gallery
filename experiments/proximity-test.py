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
        distEst = calculateDistance(bleacon.measuredPower, bleacon.rssi);
        // add missing data to bleacon objects
        if (!('distData' in bleacons[id])) {
            bleacons[id].distData = [];
        } 
        //if (!('distSmooth' in bleacons[id])) {
        //    bleacons[id].distSmooth = distEst;
        //} 
        // keep a rolling log of distance estimates
        bleacons[id].distData.push(distEst);
        while (bleacons[id].distData.length > data.distLogLength) {
            bleacons[id].distData.shift();
        }
        //// calc smoothed distance
        //var alpha = data.distAlpha;
        //bleacons[id].distSmooth = (alpha * distEst) + ((1 - alpha) * bleacons[id].distSmooth);
        //// average distance
        //bleacons[id].distAvg = dataMean(bleacons[id].distData);

        // Use Kalman filter on dist data
        bleacons[id].kalmanData = bleacons[id].distData.map(function(v) {
            return kalmanFilter.filter(v);
        });
        bleacons[id].kalmanAvg = dataMean(bleacons[id].kalmanData);

        //console.log(bleacons[id]);
        //console.log("name:", bleacons[id].name, 
            //" power:", bleacon.measuredPower, 
            //"rssi:", bleacon.rssi, "accu:", bleacon.accuracy.toFixed(2), 
            //"smooth dist:", bleacons[id].distSmooth.toFixed(2), 
            //"dist mean:", bleacons[id].distAvg.toFixed(2), 
            //"kalman mean:", bleacons[id].kalmanAvg.toFixed(2), 
            //"prox:", bleacon.proximity);

        displayData(bleacons[id].index, bleacons[id].name, bleacon.measuredPower, 
            bleacon.rssi, bleacons[id].kalmanAvg, bleacon.proximity);
    }
});

//
// display
//

function displayData(index, name, power, rssi, kalman, prox) {
    var width = process.stdout.columns;
    var height = process.stdout.rows;
    var numBeacons = Object.keys(bleacons).length;
    //var row = Math.round(index * (height/numBeacons));
    var row = Math.round((index + 1) * 3);
    var header = "Name    Power   RSSI    Kalman    "
    var data = sprintf("%-7s  %4d   %4d     %5.1f   ", name, power, rssi, kalman, prox);
    var pos = header.length + 8;
    var size = width - pos;
    var scale = "";
    var scaleCount = 0;
    while (scaleCount < size) {
        scale += sprintf("%-10d", scaleCount);
        scaleCount = scaleCount + 10;
    }
    //console.log("size:",size,"scaleCount",scaleCount);
    var scaled = Math.round(kalman);
    var indicator = sprintf("[%"+scaled+"s%"+(size-scaled)+"s","@","]");

    //console.log("num:",numBeacons,"index:",index,"row:",row);
    console.log(ansi.cursorTo(0, row) + header + scale);
    console.log(data + indicator);
    console.log("size:",size,"scaled:",scaled);
    
    
}

function main() {
    bleacons = makeIndexedObject(data.beacons);
    console.log(ansi.eraseScreen,ansi.cursorHide);
    startScanning();
}

main();
