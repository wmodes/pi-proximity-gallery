module.exports.beacons = [
    { 
        'name' : 'Ice1',
        'estUuid' : '00a5275267e184bd0a79d94b92ff682a',
        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
        'major' : 17562,
        'minor' : 18040
    }, 
//    {
//        'name' : 'Mint1',
//        'estUuid' : '3b4aae006eda026f9be7144fc6477116',
//        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
//        'major' : 40777,
//        'minor' : 19120
//    }, 
//    {
//        'name' : 'Plum1',
//        'estUuid' : '6d400bc62c5880918b5ceeaf26ce9314',
//        'uuid' : 'b9407f30f5f8466eaff925556b57fe6d',
//        'major' : 52804,
//        'minor' : 726
//    },
]

module.exports.distLogLength = 5;

module.exports.distAlpha = 0.75;

module.exports.kalman = {
    'R' : 0.01,
    'Q' : 3
}
