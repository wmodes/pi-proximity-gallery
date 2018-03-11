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

## Install Node.js

    $ node -v
    v4.8.2

Already installed. Great. Is it the right version to work with the library we'll try to use? Who knows.

## Install Noble Library

Ref: https://github.com/noble/noble

As suggested:

    $ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
    
Make sure node is in our path:

    $ which node
    /usr/bin/node
    
Get the library:

    $ git clone https://github.com/noble/noble.git
    Cloning into 'noble'...
    remote: Counting objects: 2605, done.
    remote: Total 2605 (delta 0), reused 0 (delta 0), pack-reused 2605
    Receiving objects: 100% (2605/2605), 679.12 KiB | 0 bytes/s, done.
    Resolving deltas: 100% (1605/1605), done.


