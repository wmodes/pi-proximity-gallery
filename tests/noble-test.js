var noble = require('noble'); 

noble.startScanning();

noble.on("discover", function(peripheral) { 

    //console.log("peripheral:", peripheral);
    var macAddress = peripheral.uuid;
    var rss = peripheral.rssi;
    var localName = peripheral.advertisement.localName; 
    var manufacId = peripheral.advertisement.manufacturerData;
    console.log("found device: mac:", macAddress, " name:", localName, " rss:", rss, " Id:", manufacId);   
});
