const request = require('request');
const async = require('async');
const url = require('url');
const fs = require('fs');

const config = require('./config.json')

const PASSWORD = config.password;
const robotUrl = new url.URL(config.host);
robotUrl.pathname = 'robot.php';
robotUrl.searchParams.append('o', '369');
robotUrl.searchParams.append('m', 'Y');
robotUrl.searchParams.append('p', PASSWORD);
// console.log(robotUrl.toString());

const imageUrl = new url.URL(config.host);
imageUrl.searchParams.append('p', PASSWORD);

let pictureCount = 1;
// {hand_angle} ${wrist_angle} ${elbow_angle} ${shoulder_angle} ${waist_angle}
const commands = [
    HOME(),
    AJMA(1200, -3500, -7400, -7075, 800), // Start
    CAPTURE(),
    AJMA(530, -3180, -8120, -6820, 1570),
    CAPTURE(),
    AJMA(-140, -3000, -8500, -6700, 2340),
    CAPTURE(),
    AJMA(-810, -2600, -9000, -6500, 3110),
    CAPTURE(),
    AJMA(-1480, -2400, -9200, -6500, 3880),
    CAPTURE(),
    AJMA(-2150, -2000, -9500, -6400, 4650),
    CAPTURE(),
    AJMA(-2820, -2400, -9200, -6500, 5420),
    CAPTURE(),
    AJMA(-3490, -2600, -9000, -6600, 6190),
    CAPTURE(),
    AJMA(-4160, -2700, -8800, -6600, 6960),
    CAPTURE(),
    AJMA(-4830, -3180, -8300, -6700, 7730),
    CAPTURE(),
    AJMA(-5500, -3500, -7800, -6800, 8500), // End
    CAPTURE(),
    HOME(),
    downloadImage(1),
    downloadImage(2),
    downloadImage(3),
    downloadImage(4),
    downloadImage(5),
    downloadImage(6),
    downloadImage(7),
    downloadImage(8),
    downloadImage(9),
    downloadImage(10),
    downloadImage(11)
];

async.series(commands);

function HOME() {
    return (callback) => {
        const command = 'HOME'
        return sendCommand(command, callback)
    }
}

function TMOVETO(h, w, x, y, z) {
    return (callback) => {
        const command = `${h} ${w} ${x} ${y} ${z} TMOVETO`;
        return sendCommand(command, callback);
    };
}


function AJMA(hand_angle, wrist_angle, elbow_angle, shoulder_angle, waist_angle) {
    return (callback) => {
        const command = `${hand_angle} ${wrist_angle} ${elbow_angle} ${shoulder_angle} ${waist_angle} AJMA`;
        return sendCommand(command, callback)
    };
}

function CAPTURE() {
    return (callback) => {
        const command = `${pictureCount} CAPTURE`;
        pictureCount++;
        return sendCommand(command, callback)
    };
}

function deletePictures() {
    return (callback) => {
        const command = `-1 CAPTURE`;
        return sendCommand(command, callback)
    };
}

function downloadImage(index) {
    return callback => {
        imageUrl.pathname = `robot/${index}.bmp`
        // console.log(imageUrl.toString());
        download(imageUrl.toString(), `images/${index}.bmp`, function () {
            console.log(`Downloaded image: ${index}.bmp`);
            callback();
        });
    }
}

function sendCommand(command, callback) {
    return new Promise((resolve, reject) => {
        console.log(`Command: ${command}`);
        const commandUrl = new url.URL(robotUrl);
        commandUrl.searchParams.append('c', command);
        request(commandUrl.toString(), (error, response, body) => {
            if (error) return reject(error);
            // console.log('statusCode:', response && response.statusCode);
            // console.log('body:', body); 
            console.log('Command: Complete');
            callback();
        });
    });
};


function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
