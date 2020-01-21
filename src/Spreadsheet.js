'use strict';

const _ = require('lodash');
const SpreadsheetFunction = require('./SpreadsheetFunction');

class Spreadsheet {
    constructor(rowsCount, columnsCount) {
        if (!_.isNumber(rowsCount) || !_.isNumber(columnsCount)) {
            throw new Error('rowsCount and columnsCount need to be a number');
        }

        this._rowsCount = rowsCount;
        this._columnsCount = columnsCount;

        const matrix = Array.from(Array(rowsCount), () =>
            Array(columnsCount).fill('')
        );

        this._matrix = matrix;

        /** @type {Array<number>} */
        this._columnWidths = Array(columnsCount);
    }

    get rowsCount() {
        return this._rowsCount;
    }

    get columnsCount() {
        return this._columnsCount;
    }

    updateCell(row, column, value) {
        this._matrix[row][column] = value;

        const colWidth = this._columnWidths[column] || 0;
        this._columnWidths[column] = Math.max(String(value).length, colWidth);
    }

    updateCells(rows) {
        rows.forEach((row, rowIndex) => {
            row.forEach((value, columnIndex) => {
                this.updateCell(rowIndex, columnIndex, value);
            });
        });
    }

    getCell(row, column) {
        return this._processCell(this._matrix[row - 1][column - 1]);
    }

    print() {
        console.log(this.toString(false));
    }

    printFormatted() {
        console.log(this.toString());
    }

    _processCell(value) {
        if (_.isString(value) && value.startsWith('=')) {
            // clean up extra white space
            value = value.substring(1, value.length).trim();

            value = SpreadsheetFunction.parse(value, this).exec();
        }

        return value;
    }

    toString(formatted = true) {
        return this._matrix
            .map((row, rowIndex) => {
                return row
                    .map((value, columnIndex) => {
                        try {
                            value = String(this._processCell(value));
                        } catch (e) {
                            console.error(
                                `Error (${rowIndex + 1},${columnIndex + 1})`,
                                e.message
                            );

                            value = '#ERROR';
                        }

                        if (formatted) {
                            const maxWidth = this._columnWidths[columnIndex];
                            return value.padEnd(maxWidth, ' ');
                        }

                        return value;
                    })
                    .join('|');
            })
            .join('\n');
    }

    get [Symbol.toStringTag]() {
        return this.toString(true);
    }
}

module.exports = Spreadsheet;
