var AudioContext = require('web-audio-api').AudioContext;
var Speaker = require('speaker');
var fs = require('fs');
var readline = require('readline-sync');

var tracks = [
    './sounds/393024__axiologus__heavy-stream-with-birds.mp3',
    'sounds/399744__inspectorj__ambience-florida-frogs-gathering-a.mp3',
    './sounds/9369__833-45__sweep01.wav'
];

var context      = new AudioContext();

console.log("Create context");
context.outStream = new Speaker({
  channels:   context.format.numberOfChannels,
  bitDepth:   context.format.bitDepth,
  sampleRate: context.format.sampleRate
});

var audioBuffer = Array.apply(null, Array(tracks.length)).map(function () {});
var audioData = Array.apply(null, Array(tracks.length)).map(function () {});

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
                playAll();
            }
        });
    })(i);
}

function play(audioBuffer) {
  if (!audioBuffer) { return; }
  var bufferSource = context.createBufferSource();
  bufferSource.connect(context.destination);
  bufferSource.buffer = audioBuffer;
  bufferSource.loop   = false;
  bufferSource.start(0);
}

function playloop(audioBuffer) {
  if (!audioBuffer) { return; }
  var bufferSource = context.createBufferSource();
  bufferSource.connect(context.destination);
  bufferSource.buffer = audioBuffer;
  bufferSource.loop   = true;
  bufferSource.start(0);
}

function pause(audioBuffer) {
  if (!audioBuffer) { return; }
  var bufferSource = context.createBufferSource();
  bufferSource.connect(context.destination);
  bufferSource.buffer = audioBuffer;
  bufferSource.stop(0);
}

function playAll() {
    var playing = next = 0;
    while (true) {
        playloop(audioBuffer[next]);
        playing = next;
        next = parseInt(readline.question("Next file (0-"+(tracks.length-2)+")? "));
        if (next == -1) {
            console.log("break");
            break;
        }
        console.log("["+next+"] "+tracks[next]);
        play(audioBuffer[tracks.length-1]);
        //pause(audioBuffer[playing]);
    }
    process.exit();

//    console.log('playing track 1...');
//    play(audioBuffer[0]);
//
//    setTimeout(function () {
//        console.log('playing track 3...');
//        play(audioBuffer[2]);
//    }, 5000);
//
//    setTimeout(function () {
//        console.log('playing track 2...');
//        play(audioBuffer[1]);
//    }, 6000);

}
