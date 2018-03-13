var Bleacon = require('bleacon'); 

var beacons = [
    { 
        'name' : 'Ice1',
        'estUuid' : '00a5275267e184bd0a79d94b92ff682a',
        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
        'major' : 17562,
        'minor' : 18040
    }, 
    {
        'name' : 'Mint1',
        'estUuid' : '3b4aae006eda026f9be7144fc6477116',
        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
        'major' : 40777,
        'minor' : 19120
    }, 
    {
        'name' : 'Plum1',
        'estUuid' : '6d400bc62c5880918b5ceeaf26ce9314',
        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
        'major' : 52804,
        'minor' : 726
    },
]

// make indexed object
var blobj = {};
for (i=0; i<beacons.length; i++) {
    id = beacons[i].uuid + "+" + beacons[i].major + "+" + beacons[i].minor;
    blobj[id] = beacons[i];
}

var oneBeacon = beacons[0];
var uuid = oneBeacon.uuid;
var major = oneBeacon.major;
var minor = oneBeacon.minor;

//Bleacon.startScanning([uuid], [major], [minor]);
//Bleacon.startScanning(oneBeacon.uuid);
Bleacon.startScanning();

Bleacon.on('discover', function(bleacon) {
    //console.log("bleacon:", bleacon);
    id = bleacon.uuid + "+" + bleacon.major + "+" + bleacon.minor;
    //console.log("id:",id);
    if (id in blobj) {
        thisObj = blobj[id];
        //console.log(thisObj);
        console.log("found bleacon: name:", thisObj.name, " power:", bleacon.measuredPower, 
            "rssi:", bleacon.rssi, "accu:", bleacon.accuracy, "prox:", bleacon.proximity);
    }
});
