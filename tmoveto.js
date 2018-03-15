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
// ${h} ${w} ${x} ${y} ${z}
const commands = [
    HOME(),
    TMOVETO(14000,-8900,-0,-3300,-1400),
    CAPTURE(),
    TMOVETO(13050,-8900,-566,-3141,-1400),
    CAPTURE(),
    TMOVETO(12200,-8900,-1103,-2953,-1400),
    CAPTURE(),
    TMOVETO(11300,-8900,-1650,-2775,-1400),
    CAPTURE(),
    TMOVETO(10400,-8900,-2136,-2536,-1400),
    CAPTURE(),
    TMOVETO(9650,-8900,-2650,-2300,-1400),
    CAPTURE(),
    TMOVETO(9000,-8900,-3100,-2050,-1400),
    CAPTURE(),
    HOME(),
    downloadImage(1),
    downloadImage(2),
    downloadImage(3),
    downloadImage(4),
    downloadImage(5),
    downloadImage(6),
    downloadImage(7)
    //TMOVETO(9000,-8900,-4700,-1200,-1200),
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
