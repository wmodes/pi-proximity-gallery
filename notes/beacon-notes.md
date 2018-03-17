# Working with BLE

## Install Noble Library

Ref: https://github.com/noble/noble

As suggested:

    $ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
    
Make sure node is in our path:

    $ which node
    /usr/bin/node
    
Install with npm:

    $ npm install noble
    
which fellback to building the binaries, but worked.

## A Quick Noble Test

    $ vi noble-test.js
    
    var noble = require('noble');
    noble.startScanning();
    noble.on("discover", function(peripheral) {
        console.log("peripheral:", peripheral);
        var macAddress = peripheral.uuid;
        var rss = peripheral.rssi;
        var localName = peripheral.advertisement.localName;
        var manufacId = peripheral.advertisement.manufacturerData;
        console.log("found device: mac:", macAddress, " name:", localName, " rss:", rss, " Id:", manufacId);
    });

Run it

    $ sudo node noble-test.js
    found device: mac: d3c58252c5b7  name: undefined  rss: -79  Id: undefined
    found device: mac: d8a53c4d500a  name: undefined  rss: -76  Id: undefined
    found device: mac: eccdb04c3704  name: undefined  rss: -73  Id: <Buffer 4c 00 02 15 e1 f5 4e 02 1e 23 44 e0 9c 3d 51 2e b5     6a de c9 00 64 00 64 b9>

Woot.

## Install bleacon

**Ref:** https://github.com/sandeepmistry/node-bleacon

Install:

    $ npm install bleacono

It fellback to building from source, but worked.

## A bleacon Test

	$ cat bleacon-test.js 
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

It took a minute to notice that the iBeacon uuid was the same for all of my estimote beacons, though they had different minor and major numbers.

Results:

	$ sudo node bleacon-test.js 
	found bleacon: name: Plum1  power: -59 rssi: -74 accu: 2.5795988229654703 prox: near
	found bleacon: name: Ice1  power: -59 rssi: -88 accu: 6.246942792946871 prox: far
	found bleacon: name: Mint1  power: -59 rssi: -92 accu: 8.042938987548231 prox: far
	found bleacon: name: Plum1  power: -59 rssi: -78 accu: 3.3212335430520668 prox: near
	found bleacon: name: Mint1  power: -59 rssi: -81 accu: 4.0143002224320945 prox: far
	found bleacon: name: Ice1  power: -59 rssi: -98 accu: 11.749939819796365 prox: far
	found bleacon: name: Plum1  power: -59 rssi: -86 accu: 5.505463734242719 prox: far
	found bleacon: name: Mint1  power: -59 rssi: -77 accu: 3.1179030304806012 prox: near
	found bleacon: name: Ice1  power: -59 rssi: -84 accu: 4.851994316849445 prox: far

Woot. It works too, and gives me power, rssi, and accuracy. Thus I can calculate distance.

## Calculating Distance

**Ref:** https://www.rn.inf.tu-dresden.de/dargie/papers/icwcuca.pdf
**Ref:** https://forums.estimote.com/t/determine-accurate-distance-of-signal/2858

> One of the simplest formulas for calculating distance (found it in this paper1.2k) is:
> 
> RSSI = -20 * logd + TxPower (where d = distance)
> 
> Which gives you this:
> 
> d = 10 ^ ((TxPower - RSSI) / 20)
> 
> This will give you very “jumping” results, coming from the nature of RSSI. RSSI readings are not very stable and highly depend on environment. I’m pretty sure Estimotes uses much mores sophisticated formula that also enables some kind of “smoothing” of data, so the readings are more stable. But this will be a good start to get at least some approximation.

A simple function to calculate distance:

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

# Smoothing Noise

## Using Averages

A simple way to smooth the noise is a rolling average:

> 𝑅𝑆𝑆𝐼𝑠𝑚𝑜𝑜𝑡h = 𝛼 ∗ 𝑅𝑆𝑆𝐼𝑛 + (1 − 𝛼) ∗ 𝑅𝑆𝑆𝐼𝑛−1
> 
> 𝑅𝑆𝑆𝐼𝑛 is the recent 𝑅𝑆𝑆𝐼 value and 𝑅𝑆𝑆𝐼𝑛−1 is the mean 𝑅𝑆𝑆𝐼 value till previous 𝑅𝑆𝑆𝐼.
> 
> 𝛼 varies from 0 to 1 [consider 𝛼=0.75]

Implemented in our tests (smoothing distance rather than RSSI):

    // calc smoothed distance
    var alpha = data.distAlpha;
    bleacons[id].distSmooth = (alpha * distEst) + ((1 - alpha) * bleacons[id].distSmooth);

However, if the alpha value is too low, it is hard for a changing value to move the result. If the value is high (say, 0.75), then the noisy values can still make the result jump around.

Another way is to record an array of the last /n/ values and then periodically average these values.

    for (var i=bleacons[id].distArray.length-1; i>=0; i--) {
        sum += bleacons[id].distArray[i];
    }
    bleacons[id].distAvg = sum / bleacons[id].distArray.length;

Smoother, but computationally expensive.

## Kalman Filters

**Ref:** https://www.wouterbulten.nl/blog/tech/kalman-filters-explained-removing-noise-from-rssi-signals/
**Ref:** https://www.wouterbulten.nl/blog/tech/lightweight-javascript-library-for-noise-filtering/

A smoothing function used by many beacon developers is Kalman Filters.

Looking at the first article, we see

> For our RSSI filtering application we assume that a device doesn’t move. Moreover, we assume that in the time frame of our measurement our own position is also static. In other words: over time we expect a constant RSSI signal, everything else is noise.

Not true, for us, so we will have to keep our eyes open for opportunities to both smooth the noise and 
allow our target to move.

As far as I can tell, with Wouter's Kalman libary, you apply the Kalman filter to a dataset and it will smooth the data.

So I'll install his library:

    $ npm install kalmanjs

This turned out to be installing some other simiarly named package:

    $ npm remove kalmanjs

To get Wouter's library:

    $ cd
    $ git clone https://github.com/wouterbulten/kalmanjs.git
    $ cd kalmanjs
    $ npm install

var KalmanFilter = require('kalmanjs').default;

