'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const q = require('q');
const colors = require('colors/safe');


const Log = require('./lib/log');
const Marker = require('./lib/marker');
const Map = require('./lib/map');


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
    const on = (false === !!options.on) ? {} : options.on;

    const scanResults = q.defer();


    const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    let line = 0;
    let scope = {
        $file: {
            lines: [],
            path: filePath
        }
    };
    lineReader.on('line',(content) => {
        line++;
        scope.$line = {
            text: content,
            index: line
        };
        if (true === !!on.line) {
            on.line(scope);
        };
        scope.$file.lines.push(content);
    })
    .on('close',() => {
        if (true === !!on.eof) {
            on.eof(scope);
        };
        scanResults.resolve();
    })
    //???
    .on('error', (error) => {
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
    const ext = options.ext;
    const root = (false === !!options.path) ? './' : options.path;
    const on = (false === !!options.on) ? {} : options.on;

    fs.readdir(root, (error, files) => {

        if (error) {
            result.reject(error);
        };

        files.forEach((leaf) => {

            let scope = {
                $path: path.join(root, leaf),
                $file: leaf,
                $dir: root
            };

            if (true === !!on.path) {
                on.path(scope);
            };

            stat({path: scope.$path})
            .then((stats) => {
                let digested = [];
                if (stats.isFile()) {
                    if (hasAppropriateExtension({path: scope.$path, ext: ext})) {
                        digested.push(digestFile({path: scope.$path, on: on}));
                    };
                } else {
                    digested.push(readdir({path: scope.$path, ext: ext, on: on}));
                };

                q.all(digested).then((res) => {
                    result.resolve(res);
                });

            });
        });
    });

    return result.promise;
};

function readdirs(options) {

    if (false === !!options.ext) {
        throw 'ext is not defined!';
    };

    if (false === !!options.path) {
        throw 'path is not defined';
    };

    const result = q.defer();
    const ext = options.ext;
    const roots = (Array.isArray(options.path)) ? options.path : [options.path];
    const on = (false === !!options.on) ? {} : options.on;

    let query = [];
    roots.forEach((root) => {
        query.push(readdir({
            path: root,
            ext: ext,
            on: on
        }));
    });

    q.all(query)
    .then((res) => result.resolve(res))
    .catch((err) => result.reject(err));

    return result.promise

};




const GENERAL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)(\[.*?[^\]]\]|)/g;
const NOVERSION_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)/;
const FULL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)\[v(\d+)\.(\d+)\.(\d+)\]/;

const log = new Log({console: true});
const map = new Map();

let markers = ['test1'];
let version = 'v1.0.0';

readdirs({
    path: './features',
    ext: '.feature',
    on: {
        line: function(scope) {

            let text = scope.$line.text;
            let index = scope.$line.index;
            let path = scope.$file.path;

            let found = text.match(GENERAL_LOCATOR);

            if (found !== null) {
                found.forEach((result) => {

                    let marker = new Marker(result,FULL_LOCATOR, NOVERSION_LOCATOR);

                    if (!!marker.getVersion() === false) {
                        log.warning('@@' + marker.getName() + ' tag without version found in ' + path);
                    };

                    let detect = true;
                    if (!!markers) {
                        detect = (markers.indexOf(marker.getName()) === -1) ? false : true;
                    };

                    let versionMatch = (!!version) ? (version === marker.getVersion()) : true;
                    if (!versionMatch && !!marker.getVersion()) {

                        let parsedVerison = version.match(/v(\d+)\.(\d+)\.(\d+)/);
                        if (marker.major() !== parsedVerison[1]) {
                            log.error('@@' + marker.getName() + ' mistmatch major version ' + marker.major() + ' instead of ' + parsedVerison[1] + ' in file ' + path);
                        } else if (marker.minor() !== parsedVerison[2]) {
                            log.error('@@' + marker.getName() + ' mistmatch minor version ' + marker.minor() + ' instead of ' + parsedVerison[2] + ' in file ' + path);
                        } else {
                            log.warning('@@' + marker.getName() + ' mistmatch patch version ' + marker.patch() + ' instead of ' + parsedVerison[3] + ' in file ' + path);
                        };

                    };

                    if (detect) {
                        map.put(marker.getName(),path);
                    };


                });
            };
        }
    }
})
.then(() => {
    log.emptyLine();
    log.result(map.toText());
    file.appendFileSync('./log.txt', log.toString());
})



/*
readdirs({
    path: ['./lib', './features'],
    ext: ['.js','.feature'],

    on: {
        path: function(scope) {
            logger.print({text: scope.$path});
            //logger.print({text: scope.$file});
            //logger.print({text: scope.$dir});
        },
        line: function(scope) {
            //logger.print({text: scope.$line.text});
            //logger.print({text: scope.$line.index});
        },
        eof: function(scope) {
            //logger.print({text: scope.$file});
        }
    }
});
*/
