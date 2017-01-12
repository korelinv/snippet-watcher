'use strict';
const Marker = require('./marker')

module.exports = function (string, options) {

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
