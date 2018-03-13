var Noble = require('noble'); 

Noble.startScanning();

Noble.on("discover", function(peripheral) { 
    //console.log("peripheral:", peripheral);
    //var macAddress = peripheral.uuid;
    //var rss = peripheral.rssi;
    //var localName = peripheral.advertisement.localName; 
    //var manufacId = peripheral.advertisement.manufacturerData;
    //console.log("found device: mac:", macAddress, " name:", localName, " rss:", rss, " Id:", manufacId);   
    peripheral.connect(function(error) {
        console.log('connected to peripheral: ' + peripheral.uuid);
		peripheral.discoverServices(null, function(error, services) {
		    console.log('discovered the following services:');
		    for (var i in services) {
			    console.log('  ' + i + ' uuid: ' + services[i].uuid);
		    }
		});
    });
});
