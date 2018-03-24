var data = require('./data.js');
var AudioContext = require('web-audio-api').AudioContext;
var Speaker = require('speaker');
var fs = require('fs');

var context;
var bufferLoader;

var tracks = [
    './sounds/9369__833-45__sweep01.wav',
    './sounds/272168__dethrok__cicadas.mp3',
    './sounds/399744__inspectorj__ambience-florida-frogs-gathering-a.mp3',
    './sounds/393024__axiologus__heavy-stream-with-birds.mp3',
];

//
// Globals
//

var context;
var sounds = data.sounds;;

//
// Setup
//

function audioSetup () {
    var context      = new AudioContext();

    console.log("Create context");
    context.outStream = new Speaker({
        channels:   context.format.numberOfChannels,
        bitDepth:   context.format.bitDepth,
        sampleRate: context.format.sampleRate
    });
}

function audioLoader() {

    // instead we add these to the sounds objects
    //var audioBuffer = Array.apply(null, Array(tracks.length)).map(function () {});
    //var audioData = Array.apply(null, Array(tracks.length)).map(function () {});

    console.log("Reading files");
    for (i=0; i<tracks.length; i++) {
        console.log("track", i, ":", tracks[i]);
        audioData[i] = fs.readFileSync(tracks[i]);
        console.log("Decode track", i);
        (function(index) {
            context.decodeAudioData(audioData[index], function(newBuffer) {
                console.log("Decode track", index, "- done");
                audioBuffer[index] = newBuffer;
                if (audioBuffer.every(x => x)) {
                    //playAll();
                    simpleTest();
                }
            });
        })(i);
    }

function play(audioBuffer) {
    if (!audioBuffer) { return; }
    console.log("Playing");
    var bufferSource = context.createBufferSource();
    bufferSource.connect(context.destination);
    bufferSource.buffer = audioBuffer;
    bufferSource.loop   = false;
    bufferSource.start(0);
}

function playloop(audioBuffer) {
    if (!audioBuffer) { return; }
    console.log("Playing");
    var bufferSource = context.createBufferSource();
    bufferSource.connect(context.destination);
    bufferSource.buffer = audioBuffer;
    bufferSource.loop   = true;
    bufferSource.start(0);
}

function pause(audioBuffer) {
    if (!audioBuffer) { return; }
    console.log("Pausing");
    var bufferSource = context.createBufferSource();
    bufferSource.connect(context.destination);
    bufferSource.buffer = audioBuffer;
    bufferSource.stop(0);
}

function wait(ms){
     var start = new Date().getTime();
     var end = start;
     while(end < start + ms) {
        end = new Date().getTime();
     }
}

function playAll() {
    var playing = next = 0;
    while (true) {
        play(audioBuffer[1]);
        playing = next;
        //next = parseInt(readline.question("Next file (1-"+(tracks.length-1)+")? "));
        //console.log("Input:", next);
        //if (next == -1) {
            //console.log("break");
            //break;
        //}
        wait(5000);
        next++;
        if (next >= tracks.length) {
            next = 1;
        }
        console.log("["+next+"] "+tracks[next]);
        play(audioBuffer[0]);
        //pause(audioBuffer[playing]);
    }
    process.exit();
}

function simpleTest() {
    console.log('playing track 1...');
    playloop(audioBuffer[1]);

    setTimeout(function () {
        console.log('playing track 0...');
        play(audioBuffer[0]);
    }, 5000);

    setTimeout(function () {
        console.log('pausing track 1...');
        pause(audioBuffer[1]);
        console.log('playing track 2...');
        playloop(audioBuffer[2]);
    }, 6000);

    setTimeout(function () {
        console.log('playing track 0...');
        play(audioBuffer[0]);
    }, 11000);

    setTimeout(function () {
        console.log('pausing track 2...');
        pause(audioBuffer[2]);
        console.log('playing track 3...');
        playloop(audioBuffer[3]);
    }, 12000);

}

function seqTest() {
    console.log('playing track 1...');
    playloop(audioBuffer[1]);
    
    wait(5000);

    //setTimeout(function () {
    console.log('playing track 0...');
    play(audioBuffer[0]);
    //}, 5000);
    console.log('pausing track 1...');
    pause(audioBuffer[1]);
    
    wait(1000);
    
    //setTimeout(function () {
    console.log('playing track 2...');
    playloop(audioBuffer[2]);
    //}, 6000);
    
    wait(5000);
    
    //setTimeout(function () {
    console.log('playing track 0...');
    play(audioBuffer[0]);
    //}, 5000);
    console.log('pausing track 2...');
    pause(audioBuffer[2]);
    
    wait(1000);
    
    //setTimeout(function () {
    console.log('playing track 3...');
    playloop(audioBuffer[3]);
    //}, 6000);
}  
