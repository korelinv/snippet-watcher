'use strict';

const gulp = require('gulp');
const file = require('fs');

const simple = require('gulp-text-simple');
const minimist = require('minimist');
const Log = require('./lib/log');
const Map = require('./lib/map');

const argv = minimist(process.argv);


gulp.task('snippet:scan', function() {

    let markersLocator = require('./lib/markerLocator');

    let src = (!!argv.src) ? argv.src : '*.feature';
    let map = new Map();
    let markers;
    let version;
    let log = new Log({console: true});
    if (!!argv.markers) markers = argv.markers.split(',');
    if (!!argv.version) version = argv.version;
    let scanner = simple(markersLocator,{
        map: map,
        markers: markers,
        version: version,
        log: log,

        GENERAL_LOCATOR: /@@([A-Za-z]+[A-Za-z\.0-9]*)(\[.*?[^\]]\]|)/g,
        NOVERSION_LOCATOR: /@@([A-Za-z]+[A-Za-z\.0-9]*)/,
        FULL_LOCATOR: /@@([A-Za-z]+[A-Za-z\.0-9]*)\[v(\d+)\.(\d+)\.(\d+)\]/
    });
    return gulp.src(src)
        .pipe(scanner())
        .on('end',() => {
            log.emptyLine();
            log.result(map.toText());
            file.appendFileSync('./log.txt', log.toString());
        });
});
