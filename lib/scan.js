'use strict';

const fs = require('fs');
const Log = require('./lib/log');
const Marker = require('./lib/marker');
const Map = require('./lib/map');
const readdirs = require('read-dirs');

module.exports = function(options) {

    const GENERAL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)(\[.*?[^\]]\]|)/g;
    const NOVERSION_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)/;
    const FULL_LOCATOR = /@@([A-Za-z]+[A-Za-z\.0-9]*)\[v(\d+)\.(\d+)\.(\d+)\]/;

    const log = new Log({console: options.console});
    const map = new Map();

    let markers = options.markers;
    let version = options.version;

    readdirs({
        path: options.path,
        ext: options.extension,
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
        fs.appendFileSync('./log.txt', log.toString());
    });

};
