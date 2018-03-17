var data = require('./data.js')
var Bleacon = require('bleacon'); 
var KalmanFilter = require('kalmanjs').default;

//
// setup data
//

// make indexed object
var bleacons = {};
for (var i=0; i<data.beacons.length; i++) {
    id = data.beacons[i].uuid + "+" + data.beacons[i].major + "+" + data.beacons[i].minor;
    bleacons[id] = data.beacons[i];
}

// setup kalman filter
var kalmanFilter = new KalmanFilter({R: data.kalman,R, Q: data.kalman.Q});

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

Bleacon.startScanning();

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
        if (!('distSmooth' in bleacons[id])) {
            bleacons[id].distSmooth = distEst;
        } 
        // keep a rolling log of distance estimates
        bleacons[id].distData.push(distEst);
        while (bleacons[id].distData.length > data.distLogLength) {
            bleacons[id].distData.shift();
        }
        // calc smoothed distance
        var alpha = data.distAlpha;
        bleacons[id].distSmooth = (alpha * distEst) + ((1 - alpha) * bleacons[id].distSmooth);
        // average distance
        var sum = 0;
        for (var i=bleacons[id].distData.length-1; i>=0; i--) {
            sum += bleacons[id].distData[i];
        }
        bleacons[id].distAvg = dataMean(bleacons[id].distData);

        // Use Kalman filter on dist data
        bleacons[id].kalmanData = distData.map(function(v) {
            return kalmanFilter.filter(v);
        });
        bleacons[id].kalmanAvg = dataMean(bleacons[id].kalmanData);

        console.log(bleacons[id]);
        console.log("found bleacon: name:", bleacons[id].name, " power:", bleacon.measuredPower, 
            "rssi:", bleacon.rssi, "accu:", bleacon.accuracy.toFixed(2), 
            "smooth dist:", bleacons[id].distSmooth.toFixed(2), 
            "dist mean:", bleacons[id].distAvg.toFixed(2), 
            "kalman mean:", bleacons[id].kalmanAvg.toFixed(2), 
            "prox:", bleacon.proximity);
    }
});
