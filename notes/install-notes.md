# Install Notes

**Reference:** https://blog.truthlabs.com/beacon-tracking-with-node-js-and-raspberry-pi-794afa880318

## Setup a new raspian install

Download raspian to my Mac. This is "Raspbian Stretch" which already has a lot of stuff installed that the above article ref  suggests you install. Will it work with diff versions and such? Who knows. 

Write raspian image to sd card from MacOS

    $ diskutil list
    $ diskutil unmount /dev/disk1s1
    $ unzip -p 2017-11-29-raspbian-stretch.zip | sudo dd of=/dev/disk1 bs=1m
    
Boot to brand new raspian

Authorize to local wifi

Enable ssh

Rename host to prox1. This gives us the ability to ssh to prox1.local. (avahi does this, and it's on by default on Raspbian)

Change passwd

## Fine Tune Install

Upload ssh key:

    $ ssh-copy-id -i ~/.ssh/id_rsa.pub wmodes@prox1.local
    Warning: the RSA host key for 'prox1.local' differs from the key for the IP address '192.168.0.37'
    Offending key for IP in /Users/wmodes/.ssh/known_hosts:9
    Matching host key in /Users/wmodes/.ssh/known_hosts:12
    Are you sure you want to continue connecting (yes/no)? yes
    wmodes@prox1.local's password: 

Install vim:

    $ sudo apt-get install vimo

Edit vimrc:

    $ vi ~/.vimrc
    
    filetype plugin indent on
    syntax on " enabled syntax highlighting
    :set number " line numbers
    :set ai " autoindent
    :set tabstop=4 " sets tabs to 4 characters
    :set shiftwidth=4
    :set expandtab
    :set softtabstop=4 " makes the spaces feel like real tabs

## Install Bluez

**Reference:** https://learn.adafruit.com/install-bluez-on-the-raspberry-pi/installation

Is it already installed? Afterall, unlike the Pi 2 & 3, the Pi 3 ships with Bluetooth and WiFi

    $ dpkg-query -l | grep bluez
    ii  bluez                                 5.43-2+rpt2+deb9u2                   armhf        Bluetooth tools and daemons
    ii  bluez-firmware                        1.2-3+rpt1                           all          Firmware for Bluetooth devices

Gosh, that makes things easy.

Sure, but is it active?

    $ systemctl status bluetooth
    ● bluetooth.service - Bluetooth service
       Loaded: loaded (/lib/systemd/system/bluetooth.service; enabled; vendor preset: enabled)
       Active: active (running) since Sat 2018-03-03 05:13:30 UTC; 16min ago
         Docs: man:bluetoothd(8)
     Main PID: 574 (bluetoothd)
       Status: "Running"
       CGroup: /system.slice/bluetooth.service
               └─574 /usr/lib/bluetooth/bluetoothd
    
    Mar 03 05:13:30 prox1 systemd[1]: Starting Bluetooth service...
    Mar 03 05:13:30 prox1 bluetoothd[574]: Bluetooth daemon 5.43
    Mar 03 05:13:30 prox1 systemd[1]: Started Bluetooth service.
    Mar 03 05:13:30 prox1 bluetoothd[574]: Starting SDP server
    Mar 03 05:13:30 prox1 bluetoothd[574]: Bluetooth management interface 1.14 initialized
    Mar 03 05:13:30 prox1 bluetoothd[574]: Failed to obtain handles for "Service Changed" characteristic
    Mar 03 05:13:30 prox1 bluetoothd[574]: Sap driver initialization failed.
    Mar 03 05:13:30 prox1 bluetoothd[574]: sap-server: Operation not permitted (1)
    Mar 03 05:13:30 prox1 bluetoothd[574]: Endpoint registered: sender=:1.10 path=/A2DP/SBC/Source/1
    Mar 03 05:13:30 prox1 bluetoothd[574]: Endpoint registered: sender=:1.10 path=/A2DP/SBC/Sink/1

So yes. Good.

## Install Node.js an npm

    $ node -v
    v4.8.2

Already installed. Great. Is it the right version to work with the library we'll try to use? Who knows.

My first attempt to install npm failed, so I had to:

    $ sudo apt-get update
    
Then install npm:

    $ sudo apt-get install npm

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

## A Quick Test

    $ vi noble-test.js
    
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

Run it

    $ sudo node noble-test.js
    found device: mac: d3c58252c5b7  name: undefined  rss: -79  Id: undefined
    found device: mac: d8a53c4d500a  name: undefined  rss: -76  Id: undefined
    found device: mac: eccdb04c3704  name: undefined  rss: -73  Id: <Buffer 4c 00 02 15 e1 f5 4e 02 1e 23 44 e0 9c 3d 51 2e b5     6a de c9 00 64 00 64 b9>

Woot.


