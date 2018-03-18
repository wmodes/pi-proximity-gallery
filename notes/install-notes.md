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

Create local wmodes user:

    $ sudo adduser wmodes

Add to approporiate groups:

    $ sudo usermod -a -G `grep pi /etc/group | awk -F":" '{print $1}' | paste -sd "," -` wmodes

Check that worked:

    $ egrep "pi|wmodes" /etc/group

## Fine Tune Install

Upload ssh key:

    $ ssh-copy-id -i ~/.ssh/id_rsa.pub wmodes@prox1.local
    Warning: the RSA host key for 'prox1.local' differs from the key for the IP address '192.168.0.37'
    Offending key for IP in /Users/wmodes/.ssh/known_hosts:9
    Matching host key in /Users/wmodes/.ssh/known_hosts:12
    Are you sure you want to continue connecting (yes/no)? yes
    wmodes@prox1.local's password: 

Install vim:

    $ sudo apt-get install vim

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
    " reopening a file
    if has("autocmd")
      au BufReadPost * if line("'\"") > 0 && line("'\"") <= line("$")
        \| exe "normal! g'\"" | endif
    endif

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

## Install node version manager

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

## Upgrade to newer version of node

    $ nvm install v8.10.0
    Downloading and installing node v8.10.0...
    Downloading https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-armv7l.tar.xz...
    ######################################################################## 100.0%
    Computing checksum with sha256sum
    Checksums matched!
    Now using node v8.10.0 (npm v5.6.0)
    Creating default alias: default -> v8.10.0

    $ node -v
    v8.10.0

Unfortunately, we're getting errors as we run our experiments. It seems that the modules I'm installing are using the node 4.x install.

## Reinstall node

**Do I need to do this? Because this is breaking some of the existing functionality.**

    $ sudo apt-get remove npm node nodejs
    $ sudo rm `which node` `which npm`
    $ sudo apt remove gyp libjs-inherits libjs-node-uuid
    $ sudo apt-get update
    $ sudo apt-get dist-upgrade

This one was a long install and took a while.

    $ curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
    $ sudo apt-get install -y nodejs
    $ npm rebuild
    $ npm rebuild
    $ npm i -g npm

