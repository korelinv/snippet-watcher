'use strict';

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

};

module.exports = Map;
