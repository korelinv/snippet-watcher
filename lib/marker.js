'use strict';

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

module.exports = Marker;
