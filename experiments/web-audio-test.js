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
