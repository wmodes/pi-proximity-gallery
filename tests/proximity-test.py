var data = require('./data.js')
var Bleacon = require('bleacon'); 

//
// setup data
//

// make indexed object
var bleacons = {};
for (var i=0; i<data.beacons.length; i++) {
    id = data.beacons[i].uuid + "+" + data.beacons[i].major + "+" + data.beacons[i].minor;
    bleacons[id] = data.beacons[i];
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

//
// initiate scanning
//

Bleacon.startScanning();

Bleacon.on('discover', function(bleacon) {
    //console.log("bleacon:", bleacon);
    id = bleacon.uuid + "+" + bleacon.major + "+" + bleacon.minor;
    //console.log("id:",id);
    if (id in bleacons) {
        distEst = calculateDistance(bleacon.measuredPower, bleacon.rssi);
        // add missing data to bleacon objects
        if (!('distArray' in bleacons[id])) {
            bleacons[id].distArray = [];
        } 
        if (!('distSmooth' in bleacons[id])) {
            bleacons[id].distSmooth = distEst;
        } 
        // keep a rolling log of distance estimates
        bleacons[id].distArray.push(distEst);
        while (bleacons[id].distArray.length > data.distLogLength) {
            bleacons[id].distArray.shift();
        }
        // calc smoothed distance
        var alpha = data.distAlpha;
        bleacons[id].distSmooth = (alpha * distEst) + ((1 - alpha) * bleacons[id].distSmooth);
        // average distance
        var sum = 0;
        for (var i=bleacons[id].distArray.length-1; i>=0; i--) {
            sum += bleacons[id].distArray[i];
        }
        bleacons[id].distAvg = sum / bleacons[id].distArray.length;

        //console.log(bleacons[id]);
        console.log("found bleacon: name:", bleacons[id].name, " power:", bleacon.measuredPower, 
            "rssi:", bleacon.rssi, "accu:", bleacon.accuracy.toFixed(2), 
            "smooth dist:", bleacons[id].distSmooth.toFixed(2), 
            "avg dist:", bleacons[id].distAvg.toFixed(2), 
            "prox:", bleacon.proximity);
    }
});
