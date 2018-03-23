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

