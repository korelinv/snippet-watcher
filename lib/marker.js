'use strict';

class Marker {

    constructor(text, FULL_LOCATOR, NOVERSION_LOCATOR) {

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

    major() {
        return this.version.major;
    };

    minor() {
        return this.version.minor;
    };

    patch() {
        return this.version.patch;
    };

    getVersion() {
        if (this.noVersion) return undefined;
        else return 'v' + this.version.major + '.' + this.version.minor + '.' + this.version.patch;
    };

};

module.exports = Marker;
