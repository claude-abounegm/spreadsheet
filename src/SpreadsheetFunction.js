'use strict';

const _ = require('lodash');

class SpreadsheetFunction {
    /**
     *
     * @typedef {import('./Spreadsheet')} Spreadsheet
     * @param {Spreadsheet} ss
     */
    constructor(fnData, ss) {
        const { str, name, args } = fnData;

        if (!this[name]) {
            throw new Error('Invalid function name: ', name);
        }

        this._str = str;
        this._name = name;
        this._args = args;
        this._ss = ss;
    }

    get name() {
        return this._name;
    }

    get args() {
        return this._args;
    }

    get spreadSheet() {
        return this._ss;
    }

    exec() {
        try {
            let { name } = this;
            // if (name === '@') {
            //     name = 'cell';
            // }

            return this[name](...this.args);
        } catch (e) {
            e.message = `${e.message} in function: ${this.toString()}`;
            throw e;
        }
    }

    sum(...args) {
        return args.reduce((previousValue, currentValue) => {
            if (!_.isNumber(currentValue)) {
                throw new Error(
                    `Expected number argument, got: ${currentValue}`
                );
            }

            return previousValue + currentValue;
        }, 0);
    }

    cell(row, column) {
        if (!_.isNumber(row)) {
            throw new Error(`Expected number argument, got: ${row}`);
        }

        if (!_.isNumber(column)) {
            throw new Error(`Expected number argument, got: ${column}`);
        }

        return this.spreadSheet.getCell(row, column);
    }

    toString() {
        return this._str;
    }

    get [Symbol.toStringTag]() {
        return this._str;
    }

    /**
     * @param {string} str
     */
    static parse(str, ss) {
        // https://regexr.com/4ohq8
        const res = /^(\w[\w\d]*)\s*\((.*)\)$/.exec(str);

        if (!res) {
            return;
        }

        res.shift();

        let [name, argsStr] = res;

        const regex = /((?:\w[\w\d]*\s*\(.*?\))|\d+|".*?"|'.*?'|.+)\s*,?\s*/g;
        let current,
            args = [];

        while ((current = regex.exec(argsStr))) {
            args.push(current[1]);
        }

        args = args
            .map(str => {
                str = str.trim();

                // valid number
                if (!isNaN(str)) {
                    return +str;
                }

                const fn = this.parse(str, ss);
                if (fn) {
                    return fn.exec();
                }

                return this._maybeParseString(str);
            })
            .filter(str => !_.isUndefined(str));

        return new this(
            {
                str,
                name,
                /** @type {(number | string)[]} */ args
            },
            ss
        );
    }

    static _maybeParseString(str) {
        const res = /'(.+)'|"(.+)"/.exec(str);
        if (res) {
            return res[1] || res[2];
        }

        return str;
    }
}

module.exports = SpreadsheetFunction;
