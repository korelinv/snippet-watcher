'use strict';

const gulp = require('gulp');
const file = require('fs');

const simple = require('gulp-text-simple');
const replace = require('gulp-replace');
const minimist = require('minimist');
const colors = require('colors/safe');
const Log = require('./lib/log');
const Map = require('./lib/map');

const GENERAL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)(\[.*?[^\]]\]|)/g;
const NOVERSION_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)/;
const FULL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)\[v(\d+)\.(\d+)\.(\d+)\]/;

const argv = minimist(process.argv);


gulp.task('snipet:scan', function() {

    let markersLocator = require('./lib/markerLocator');

    let src = (!!argv.src) ? argv.src : '*.feature';
    let map = new Map();
    let markers;
    let version;
    let log = new Log({console: true});
    if (!!argv.markers) markers = argv.markers.split(',');
    if (!!argv.version) version = argv.version;
    let scanner = simple(markersLocator,{map: map, markers: markers, version: version, log: log});
    return gulp.src(src)
        .pipe(scanner())
        .on('end',() => {
            log.emptyLine();
            log.result(map.toText());
            file.appendFileSync('./log.txt', log.toString());
        });
});

gulp.task('snipet:bump-version', function () {
    let src = (!!argv.src) ? argv.src : '*.feature';
    let dest = (!!argv.dest) ? argv.dest : './';
    let tag;
    let version;
    if (!!argv.tag) {
        tag = argv.tag;
    } else {
        throw 'tag not specified';
    };
    if (!!argv.version) {
        version = argv.version;
    } else {
        throw 'version incriment required';
    };
    let log = new Log();
    return gulp.src(src)
        .pipe(replace(new RegExp('@@' + tag + '\\[v(\\d+)\\.(\\d+)\.(\\d+)\\]','g'), '@@' + tag + '[v' + version + ']'))
        .pipe(gulp.dest(dest))
        .on('end',() => {
            log.emptyLine();
            log.result('@@'+tag+' version bumped to ' + version);
            file.appendFileSync('./log.txt', log.toString());
        });
});
