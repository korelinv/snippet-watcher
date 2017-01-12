'use strict';
const Marker = require('./marker')

module.exports = function (string, options) {

    let found = string.match(options.GENERAL_LOCATOR);

    if (found !== null) {
        found.forEach((result) => {

            let marker = new Marker(result,options.FULL_LOCATOR, options.NOVERSION_LOCATOR);

            if (!!marker.getVersion() === false) {
                options.log.warning('@@' + marker.getName() + ' tag without version found in ' + options.sourcePath);
            };

            let detect = true;
            if (!!options.markers) {
                detect = (options.markers.indexOf(marker.getName()) === -1) ? false : true;
            };

            let versionMatch = (!!options.version) ? (options.version === marker.getVersion()) : true;
            if (!versionMatch && !!marker.getVersion()) {

                let parsedVerison = options.version.match(/v(\d+)\.(\d+)\.(\d+)/);
                if (marker.major() !== parsedVerison[1]) {
                    options.log.error('@@' + marker.getName() + ' mistmatch major version ' + marker.major() + ' instead of ' + parsedVerison[1] + ' in file ' + options.sourcePath);
                } else if (marker.minor() !== parsedVerison[2]) {
                    options.log.error('@@' + marker.getName() + ' mistmatch minor version ' + marker.minor() + ' instead of ' + parsedVerison[2] + ' in file ' + options.sourcePath);
                } else {
                    options.log.warning('@@' + marker.getName() + ' mistmatch patch version ' + marker.patch() + ' instead of ' + parsedVerison[3] + ' in file ' + options.sourcePath);
                };

            };

            if (detect) {
                options.map.put(marker.getName(),options.sourcePath);
            };


        });
        return found;
    }
    else return string;
};
