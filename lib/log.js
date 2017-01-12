'use strict';

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

module.exports = Log;
