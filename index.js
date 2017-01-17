'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const q = require('q');
const colors = require('colors/safe');


class Logger {
    constructor() {

    };

    print(options) {

        let color = colors.white;
        if (true === !!options.type) {
            switch (options.type) {
              case 'error':
                color = colors.red;
                break;
              case 'warning':
                color = colors.yellow;
                break;

              default:
                break;
            };
        };


        console.log(color(options.text));

    };
};


function hasAppropriateExtension(options) {
    let result = true;

    if (false === !!options.path) throw 'path not defined!';
    if ((false === !!options.ext) && (null !== options.ext)) throw 'ext not defined!';

    const filePath = options.path;
    const allowedExtension = (Array.isArray(options.ext)) ? options.ext : [options.ext];

    if (-1 === allowedExtension.indexOf(path.extname(filePath))) {
        result = false;
    };

    return result;
};

function digestFile(options) {

    if (false === !!options.path) {
        throw 'path not defined!';
    };

    const filePath = options.path;
    const logger = options.logger;

    const scanResults = q.defer();


    const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    let line = 0;
    lineReader.on('line',(content) => {
        // increment line
        line++;

        // scan line
        logger.print({type: 'warning' ,text: line+'//'+content})

        // log results
        //logger.print({type: 'error', text: 'error text'});

    })
    .on('close',() => {
        scanResults.resolve();
    })
    //???
    .on('error', (error) => {
        //logger.print({type: 'error', 'line reader error accured!'})
        scanResults.reject(error);
    });

    return scanResults.promise;

};

function stat(options) {

    const result = q.defer();
    const filePath = options.path;

    if (false === !!options.path) {
        results.reject('path not defined!');
    };

    fs.stat(filePath, (error, stats) => {
        if (error) {
            result.reject(error);
        } else {
            result.resolve(stats);
        };
    });

    return result.promise;

};

function readdir(options) {

    if (false === !!options.ext) {
        throw 'ext is not defined!';
    };

    const result = q.defer();
    const root = (false === !!options.path) ? './' : options.path;
    const ext = options.ext;
    const logger = options.logger;

    fs.readdir(root, (error, files) => {

        if (error) {
            result.reject(error);
        };

        files.forEach((leaf) => {
            let filePath = path.join(root, leaf);
            stat({path: filePath})
            .then((stats) => {
                let digested = [];
                if (stats.isFile()) {
                    if (hasAppropriateExtension({path: filePath, ext: ext})) {
                        digested.push(digestFile({path: filePath, logger: logger}));
                    };
                } else {
                    digested.push(readdir({path: filePath, ext: ext, logger: logger}));
                };

                q.all(digested).then((result) => {
                    result.resolve(result);
                });

            });
        });
    });

    return result.promise;
};

const logger = new Logger();

readdir({path: './lib', ext: '.js', logger: logger});
