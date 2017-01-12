'use strict';

const gulp = require('gulp');
const simple = require('gulp-text-simple');
const replace = require('gulp-replace');
const file = require('fs');
const minimist = require('minimist');
const colors = require('colors/safe');

const GENERAL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)(\[.*?[^\]]\]|)/g;
const NOVERSION_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)/;
const FULL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)\[v(\d+)\.(\d+)\.(\d+)\]/;

class Log {

    constructor(options) {
        this.warnings = 0;
        this.errors = 0;
        this.log = ['\n\n' + new Date() + ':'];
        this.consolePrint = false;
        if (!!options) {
            this.consolePrint = !!options.console ? options.console : false;
        };
    };

    error(text) {
        let message = 'Error: ' + text;
        this.errors += 1;
        this.log.push(message);
        if (this.consolePrint) console.log(colors.red(message));
    };

    warning(text) {
        let message = 'Warning: ' + text;
        this.log.push(message);
        this.warnings += 1;
        if (this.consolePrint) console.log(colors.yellow(message));
    };

    result(text) {
        this.log.push('Results: ' + 'errors ' + this.errors + ', warnings '+ this.warnings + '\n' + text);
        if (this.consolePrint) console.log('\nResults: ' + colors.red('errors ' + this.errors) + ', ' + colors.yellow('warnings '+ this.warnings) + '\n' + text);
    };

    emptyLine() {
        this.log.push('\n');
    };

    toString() {
        return this.log.join('\n');
    };

};

class Map {

    constructor() {
        this.map = {};
    };

    put(key, value) {

        let map = this.map;

        if (!!map[key]) {
            if (!!map[key][value] === false) map[key][value] = 1;
            else map[key][value] += 1;
        }
        else {
            map[key]= {};
            map[key][value] = 1;
        };

    };

    stringify() {
        return JSON.stringify(this.map, null, '\t');
    };

    toText() {
        let text = [];

        for (let key in this.map) {
            text.push('\t@@' + key +':');
            for (let value in this.map[key]) {
                text.push('\t- ' + value + '(' + this.map[key][value] + ')');
            };
        };

        return text.join('\n');
    };

}

class Marker {

    constructor(text) {

        if (!!text === false) throw 'invalid input parameter \'text\'';

        this.name = '';
        this.version = {
            major: 0,
            minor: 0,
            patch: 0
        };
        this.noVersion = false;

        let data = text.match(FULL_LOCATOR);
        if (data === null) {
            data = text.match(NOVERSION_LOCATOR);
            this.noVersion = true;
        };

        this.name = data[1];
        if (!this.noVersion) {
          this.version.major = data[2];
          this.version.minor = data[3];
          this.version.patch = data[4];
        };

    };

    getName() {
        return this.name;
    };

    getVersion() {
        if (this.noVersion) return undefined;
        else return 'v' + this.version.major + '.' + this.version.minor + '.' + this.version.patch;
    };

};

function markersLocator(string, options) {

    let found = string.match(GENERAL_LOCATOR);

    if (found !== null) {
        found.forEach((result) => {

            let marker = new Marker(result);

            if (!!marker.getVersion() === false) options.log.warning('@@' + marker.getName() + ' tag without version found in ' + options.sourcePath)

            let detect = true;
            if (!!options.markers) detect = (options.markers.indexOf(marker.getName()) === -1) ? false : true;

            let versionMatch = (!!options.version) ? (options.version === marker.getVersion()) : true;
            if (!versionMatch && !!marker.getVersion()) options.log.error('@@' + marker.getName() + ' have inapropriate version ' + marker.getVersion() + ' instead of ' + options.version + ' in file ' + options.sourcePath);

            if (detect) options.map.put(marker.getName(),options.sourcePath);


        });
        return found;
    }
    else return string;
};


const argv = minimist(process.argv);

gulp.task('scan', function() {
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

gulp.task('bump-version', function () {
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
