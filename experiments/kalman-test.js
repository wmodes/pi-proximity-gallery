var KalmanFilter = require('kalmanjs').default;

var dataConstant = [4,4,4,4,4,4,4,4,4,4,4];

console.log("Orig data:", dataConstant);

var noisyDataConstant = dataConstant.map(function(v) {
    return v+Math.random()*4;
});

console.log("Noisy data:", noisyDataConstant);

var kalmanFilter = new KalmanFilter({R: 0.01, Q: 3});

var dataConstantKalman = noisyDataConstant.map(function(v) {
    return kalmanFilter.filter(v);
});

console.log("Kalman filtered data:", dataConstantKalman);

