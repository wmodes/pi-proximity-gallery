var AudioContext = require('web-audio-api').AudioContext;
var Speaker      = require('speaker');
var fs           = require('fs');

var track1       = './sounds/393024__axiologus__heavy-stream-with-birds.wav';
var track2       = './sounds/9369__833-45__sweep01.flac';

var context      = new AudioContext();

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

var audioData1 = fs.readFileSync(track1);
var audioData2 = fs.readFileSync(track2);

var audioBuffer1, audioBuffer2;

context.decodeAudioData(audioData1, function(audioBuffer) {
  audioBuffer1 = audioBuffer;
  if (audioBuffer1 && audioBuffer2) { playBoth(); }
});

context.decodeAudioData(audioData2, function(audioBuffer) {
  audioBuffer2 = audioBuffer;
  if (audioBuffer1 && audioBuffer2) { playBoth(); }
});

function playBoth() {
  console.log('playing...');

  play(audioBuffer1);
  play(audioBuffer2);
}
