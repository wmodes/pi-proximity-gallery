var AudioContext = require('web-audio-api').AudioContext;
var Speaker = require('speaker');

var context;
var bufferLoader;

var tracks = [
    './sounds/9369__833-45__sweep01.wav',
    './sounds/272168__dethrok__cicadas.mp3',
    './sounds/399744__inspectorj__ambience-florida-frogs-gathering-a.mp3',
    './sounds/393024__axiologus__heavy-stream-with-birds.mp3',
];

function init() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    bufferLoader = new BufferLoader(
        context, 
		tracks,
        finishedLoading
        );

    bufferLoader.load();
}

function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    var source1 = context.createBufferSource();
    var source2 = context.createBufferSource();
    source1.buffer = bufferList[0];
    source2.buffer = bufferList[1];

    source1.connect(context.destination);
    source2.connect(context.destination);
    source1.start(0);
    source2.start(0);
}
