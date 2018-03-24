# Install Notes

**Reference:** https://blog.truthlabs.com/beacon-tracking-with-node-js-and-raspberry-pi-794afa880318

## Setup a new raspian install

Download raspian to my Mac. This is "Raspbian Stretch" which already has a lot of stuff installed that the above article ref  suggests you install. Will it work with diff versions and such? Who knows. 

Write raspian image to sd card from MacOS

    $ diskutil list
    $ diskutil unmount /dev/disk1s1
    $ unzip -p 2017-11-29-raspbian-stretch.zip | sudo dd of=/dev/disk1 bs=1m
    
Boot with monitor and keyboard to brand new raspian

Authorize to local wifi

Enable ssh

Rename host to prox1. This gives us the ability to ssh to prox1.local. (avahi does this, and it's on by default on Raspbian)

At this point you can go headless. 

Is it responding to pings?

    $ ping prox1.local
    64 bytes from 192.168.0.37: icmp_seq=0 ttl=64 time=9.641 ms

Good. Can we login?

    $ ssh pi@prox1.local

Default password is 'raspberry'

Change passwd

Create local wmodes user:

    $ sudo adduser wmodes

Add to approporiate groups:

    $ sudo usermod -a -G `grep pi /etc/group | awk -F":" '{print $1}' | paste -sd "," -` wmodes

Check that worked:

    $ egrep "pi|wmodes" /etc/group

## Login without password

Upload ssh key from back on your laptop:

    laptop:~ $ ssh-copy-id -i ~/.ssh/id_rsa.pub wmodes@prox1.local
    Warning: the RSA host key for 'prox1.local' differs from the key for the IP address '192.168.0.37'
    Offending key for IP in /Users/wmodes/.ssh/known_hosts:9
    Matching host key in /Users/wmodes/.ssh/known_hosts:12
    Are you sure you want to continue connecting (yes/no)? yes
    wmodes@prox1.local's password: 

Check that it worked:

    laptop:~ $ ssh wmodes@prox1.local

## Fine Tune Install

Install vim:

    $ sudo apt-get install vim

Edit vimrc:

    $ vi ~/.vimrc
    
    filetype plugin indent on
    syntax on " enabled syntax highlighting
    ":set number " line numbers
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

## Install Node.js and npm

    $ node -v
    v4.8.2

Already installed. Great. Is it the right version to work with the library we'll try to use? Who knows.

My first attempt to install npm failed, so I had to:

    $ sudo apt-get update
    
Then install npm:

    $ sudo apt-get install npm

## Authentication at github

Generate rsa key:

    $ ssh-keygen -t rsa -b 4096 -C "wmodes@gmail.com"
    Generating public/private rsa key pair.
    Enter file in which to save the key (/home/wmodes/.ssh/id_rsa): 
    Enter passphrase (empty for no passphrase): 
    Enter same passphrase again: 
    Your identification has been saved in /home/wmodes/.ssh/id_rsa.
    Your public key has been saved in /home/wmodes/.ssh/id_rsa.pub.

Get the public key:

    $ cat ~/.ssh/id_rsa.pub

Copy that and go to https://github.com/settings/ssh/new and paste the key in.

Identify yo'self to git locally:

    $ git config --global user.email "wmodes@gmail.com"
    $ git config --global user.name "Wes Modes"

## Setup local dev directories

Clone the pi-proximity-gallery repo:

    $ git clone git@github.com:wmodes/pi-proximity-gallery.git
    Cloning into 'pi-proximity-gallery'...
    remote: Counting objects: 122, done.
    remote: Compressing objects: 100% (89/89), done.
    remote: Total 122 (delta 56), reused 63 (delta 22), pack-reused 0
    Receiving objects: 100% (122/122), 26.67 KiB | 0 bytes/s, done.
    Resolving deltas: 100% (56/56), done.

## Backup installation

Now that we have our basic configuration, we can backup the SD card to save us trouble if we screw 
up our installation (something that happen to be 3 times at last count):

    $ cd <your backup dir>
    $ diskutil list
    $ diskutil unmount /dev/disk1s1
    $ sudo dd bs=4m if=/dev/disk1 | gzip > `date +%Y-%m-%d`-raspian-stretch-basic.gz

We can restore from this backup, similar to how we wrote our card originally. **Always** check that your SD card is the disk device you expect. It is possible to overwrite your computers HDD/SDD with dd.

    $ cd <your backup dir>
    $ diskutil list
    $ diskutil unmount /dev/disk1s1
    $ gunzip -c 2018-03-18-raspian-stretch-basic.gz | sudo dd of=/dev/disk1 bs=4m 

## Update repo

If you have just restored from an image backup, you may have to update what has happened since the last backup. Login and go into the repo:

    $ ssh prox1.local
    $ cd pi-proximity-gallery
    $ git pull

## Install needed bluetooth packages
  
    $ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev

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

## Enable bluetooth (and test)

    $ sudo bluetoothctl
    [NEW] Controller B8:27:EB:50:ED:AB prox1 [default]
    [bluetooth]# agent on
    Agent registered
    [bluetooth]# scan on
    Discovery started
    [CHG] Controller B8:27:EB:50:ED:AB Discovering: yes
    [NEW] Device D7:A4:3B:4C:4F:09 D7-A4-3B-4C-4F-09
    [NEW] Device D0:C2:7F:4F:C2:B4 D0-C2-7F-4F-C2-B4
    [NEW] Device F0:F4:10:B6:AA:FB F0-F4-10-B6-AA-FB
    [NEW] Device D2:C4:81:51:C4:B6 D2-C4-81-51-C4-B6

Without this, stuff doesn't seem to work.
## Upgrade to newer version of node

**Ref:** https://stackoverflow.com/questions/10075990/upgrading-node-js-to-latest-version

Some modules need newer version of node than the default node 4.x. However, this upgrade has cost me more grief than anything else. Yes, we can upgrade node, but what about the modules? 

There a lot of different methods: apt-get? nvm? The node n-module? Or the quick install instructions at nodejs.org?

I feel like I've had the best luck with the install instructions at nodejs.org. But I'm not completely sure,
since I've spun out in a cascading series of desperate module deletions, reinstalls, and corrections on almost
every method.

Also, I'm suspicous of any method that installs modules locally rather than globally. But now tha I'm paying
closer attention, perhaps they all do? Eventually, I discovered npm's -g (global) flag which installs them for everyone rather than locally.

### Install n module to manage node version (don't do this)

    $ node -v
    v4.8.2
    $ sudo npm install n -g
    /usr/local/bin/n -> /usr/local/lib/node_modules/n/bin/n
    n@2.1.8 /usr/local/lib/node_modules/n

### Update to latest stable node release (don't do this)

    $ sudo n stable

         install : node-v9.8.0
           mkdir : /usr/local/n/versions/node/9.8.0
           fetch : https://nodejs.org/dist/v9.8.0/node-v9.8.0-linux-armv7l.tar.gz
    ######################################################################## 100.0%
       installed : v9.8.0

New version running?

    $ node -v
    v4.8.2

Dude, fuck that.

### Use Node installer to upgrade (don't do this)

    $ curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
    $ sudo apt-get install -y nodejs
    $ node -v
    v9.8.0

Only problem is this isn't reversible

### Install node version manager

    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

And as instructed:

    $ export NVM_DIR="$HOME/.nvm"
    $ [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

### Upgrade to newer version of node

    $ node -v
    v4.8.2
    $ nvm install 4
    Downloading and installing node v4.8.7...
    Downloading https://nodejs.org/dist/v4.8.7/node-v4.8.7-linux-armv7l.tar.xz...
    ######################################################################## 100.0%
    Computing checksum with sha256sum
    Checksums matched!
    Now using node v4.8.7 (npm v2.15.11)
    Creating default alias: default -> 4 (-> v4.8.7)
    $ node -v
    v4.8.7

And at this version of node, all of our experiments below work.

But then (Big Reveal), I've been running all of my experiments as root via sudo because they needed 
permission to access bluetooth functionality. And after all that:

    $ sudo node -v
    v4.8.2

For root, node has been at 4.x all along. I definitely thought that the kalman filters
were not running with the default version of node. O-kay. So maybe you don't have to do
anything with the default version of node afterall.

## Create experiments

I created three experiments.

* A test of noble.js
* A test of bleacon.js
* A test of kalman.js

## Install needed packages

    $ npm install noble bleacon ansi-escapes sprintf-js kalmanjs

## Test experiments

Test noble.js:

    $ sudo node noble-test.js 
    connected to peripheral: d2c48151c4b6
    noble warning: unknown peripheral d2c48151c4b6
    connected to peripheral: d7a43b4c4f09
    noble warning: unknown peripheral d7a43b4c4f09
    connected to peripheral: f0f410b6aafb

If this seems to do nothing, I've found it helps to run ```sudo bluetoothctl``` above.

Test bleacon.js:

    $ sudo node bleacon-test.js 
    found bleacon: name: Ice1  power: -59 rssi: -46 accu: 0.4398670722282996 prox: immediate
    found bleacon: name: Mint1  power: -59 rssi: -47 accu: 0.46855250483641503 prox: immediate
    found bleacon: name: Ice1  power: -59 rssi: -46 accu: 0.4398670722282996 prox: immediate

Test kalman.js:

    $ sudo node kalman-test.js 
    Orig data: [ 4, 4, 4, 4, 4, 4 ]
    Noisy data: [ 5.217560821212828,
      4.201884876936674,
      7.56900835223496,
      4.63440574798733,
      6.7727666683495045,
      5.147538051940501 ]
    Kalman filtered data: [ 5.217560821212828,
      4.708877860768365,
      5.667534804528915,
      4.997955898381812,
      5.191878377523501,
      5.187391046589226 ]

Okay, so that's good.

## Don't run at root

But I am still running all of my experiments as root. For this reason:

    $  node bleacon-test.js 
    bleno warning: adapter state unauthorized, please run as root or with sudo
                   or see README for information on running without root/sudo:
                   https://github.com/sandeepmistry/bleno#running-on-linux
    noble warning: adapter state unauthorized, please run as root or with sudo
                   or see README for information on running without root/sudo:
                   https://github.com/sandeepmistry/noble#running-on-linux

But looking at the indicated github, we can:

    $ sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

And then:

    $ node bleacon-test.js 
    found bleacon: name: Ice1  power: -59 rssi: -46 accu: 0.4398670722282996 prox: immediate
    found bleacon: name: Mint1  power: -59 rssi: -47 accu: 0.46855250483641503 prox: immediate
    found bleacon: name: Ice1  power: -59 rssi: -46 accu: 0.4398670722282996 prox: immediate

Great.

## Try the bigger test

    $ node proximity-test.py

## Install sound

First, let's see if sound works. I've already downloaded a wav file.

    $ omxplayer sounds/393024__axiologus__heavy-stream-with-birds.wav

And it outputs to the headphone jack. Good.

Let's get alsa player and controls...

    $ sudo apt-get install alsa-base alsa-utils
    [sudo] password for wmodes: 
    Reading package lists... Done
    Building dependency tree       
    Reading state information... Done
    alsa-base is already the newest version (1.0.27+1).
    alsa-utils is already the newest version (1.1.3-1).
    0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.

Already installed on raspian stretch. Great.

Test it:

    $ aplay sounds/393024__axiologus__heavy-stream-with-birds.wav

Pump up the volume:

    $ amixer cset iface=MIXER,name='PCM Playback Volume' 100%
    $ aplay sounds/393024__axiologus__heavy-stream-with-birds.wav

Yes.

## A Sound Test with Node

**Ref:** https://github.com/pmelander/node-aplay

The hard thing here is that we want multiple sound sources to play simulateously.

> ALSA does not provide a mixer. If you need to play multiple audio streams at the same time, you need to mix them together on your own.

We'll try ALSA aplay first if we can get it to work.

    $ npm install node-aplay

And create ```aplay-test.js```

	$ cat aplay-test.js 
	var Sound = require('node-aplay');

	// fire and forget:
	//new Sound('./sounds/393024__axiologus__heavy-stream-with-birds.wav').play();

	// with ability to pause/resume:
	var music = new Sound('./sounds/393024__axiologus__heavy-stream-with-birds.wav');
	music.play();

	setTimeout(function () {
		music.pause(); // pause the music after five seconds
		console.log('Paused');
	}, 5000);

	setTimeout(function () {
		music.resume(); // and resume it two seconds after pausing
		console.log('Resumed');
	}, 8000);

	// you can also listen for various callbacks:
	music.on('complete', function () {
		console.log('Done with playback!');
	});

And run:

	$ node aplay-test.js 
	Paused
	Resumed
	Done with playback!

Okay. Good. But can we make it play more than one sound at a time?

## Simulaneous sounds

Lots of good ideas here: https://stackoverflow.com/questions/12543237/play-audio-with-node-js

One approach using ALSA:

**Ref:** https://stackoverflow.com/questions/14398573/alsa-api-how-to-play-two-wave-files-simultaneously

> You can configure ALSA's dmix plugin to allow multiple applications to share input/output devices.

The answer which also provides a possible ALSA configuration using the dmix plugin.

Unfortunately, I also discovered that ```aplay``` won't decode mp3 or flac. Hmm.

I can install flac and mpe3 bindings and use different library calls. But can I get them to all play through the amixer?

### the node-groove library

**Ref:** https://github.com/andrewrk/node-groove

	$ sudo apt-get install  libgroove-dev libgrooveplayer-dev libgrooveloudness-dev libgroovefingerprinter-dev
	$ npm install --save groove    

Create a first test:

	$ vi groove-test.js
	var groove = require('groove');

	groove.open("sounds/9369__833-45__sweep01.flac", function(err, file) {
	  if (err) throw err;
	  console.log(file.metadata());
	  console.log("duration:", file.duration());
	  file.close(function(err) {
		if (err) throw err;
	  });
	});

I was able to extract metadata, but wasn't able to start a player. 

	$ node groove-test.js sounds/9369__833-45__sweep01.flac 
	/home/wmodes/pi-proximity-gallery/experiments/groove-test.js:11
	groove.connectSoundBackend();
		   ^
	TypeError: groove.connectSoundBackend is not a function

So reinstall from the github repo. But then this happened:

	$ npm install https://github.com/andrewrk/node-groove/tarball/master
	\
	> groove@2.4.0 install /home/wmodes/pi-proximity-gallery/experiments/node_modules/groove
	> node-gyp rebuild

	make: Entering directory '/home/wmodes/pi-proximity-gallery/experiments/node_modules/groove/build'
	  CXX(target) Release/obj.target/groove/src/player.o
	In file included from ../src/player.cc:1:0:
	../src/player.h:6:27: fatal error: groove/player.h: No such file or directory
	 #include <groove/player.h>

Grrr. Put in an issue at github: https://github.com/andrewrk/node-groove/issues/37

Let's try another node module.

### Using web-audio-api

A totally different approach:

**Ref:** https://stackoverflow.com/questions/39487291/polyphonic-audio-playback-with-node-js-on-raspberry-pi
**Ref:** https://www.html5rocks.com/en/tutorials/webaudio/intro/

>  aplay/mpg123/some other program - allows me to only play single sound at once

and offers an example of using two node modules ```web-audio-api``` and ``node-speaker```

    $ sudo apt-get install libasound2-dev
    $ npm install speaker
    $ npm install web-audio-api

Creating a test file, we _can_ get the audio to play at the same time. Woot.

	$ cat web-audio-test.js 
	var AudioContext = require('web-audio-api').AudioContext;
	var Speaker      = require('speaker');
	var fs           = require('fs');

	var track1       = './sounds/393024__axiologus__heavy-stream-with-birds.mp3';
	var track2       = './sounds/9369__833-45__sweep01.wav';

	var context      = new AudioContext();

	console.log("Create context");
	context.outStream = new Speaker({
	  channels:   context.format.numberOfChannels,
	  bitDepth:   context.format.bitDepth,
	  sampleRate: context.format.sampleRate
	});

	function play(audioBuffer) {
	  if (!audioBuffer) { return; }

	  var bufferSource = context.createBufferSource();

	  bufferSource.connect(context.destination);
	  bufferSource.buffer = audioBuffer;
	  bufferSource.loop   = false;
	  bufferSource.start(0);
	}

	console.log("Reading files");
	var audioData1 = fs.readFileSync(track1);
	var audioData2 = fs.readFileSync(track2);

	var audioBuffer1, audioBuffer2;

	console.log("Decode track1");
	context.decodeAudioData(audioData1, function(audioBuffer) {
	  console.log("Decode track1 - done");
	  audioBuffer1 = audioBuffer;
	  if (audioBuffer1 && audioBuffer2) { playBoth(); }
	});

	console.log("Decode track2");
	context.decodeAudioData(audioData2, function(audioBuffer) {
	  console.log("Decode track2 - done");
	  audioBuffer2 = audioBuffer;
	  if (audioBuffer1 && audioBuffer2) { playBoth(); }
	});

	function playBoth() {
	  console.log('playing track 1...');
	  play(audioBuffer1);

	  console.log('5 second delay');
		setTimeout(function () {
			console.log('playing track 2...');
			play(audioBuffer2);
		}, 5000);
	}

Great. Except...

> This interface represents a memory-resident audio asset (for one-shot sounds and other short audio clips). Its format is non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1. It can contain one or more channels. Typically, it would be expected that the length of the PCM data would be fairly short (usually somewhat less than a minute). For longer sounds, such as music soundtracks, streaming should be used with the audio element and MediaElementAudioSourceNode.

**Source:** https://stackoverflow.com/questions/46327268/audiobuffer-not-cachable-decodeaudiodata-takes-to-long


