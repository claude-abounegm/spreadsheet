'use strict';

const Spreadsheet = require('./Spreadsheet');

async function main() {
    const sp = new Spreadsheet(4, 3);

    sp.updateCells([
        ['bob', 10, 'foo'],
        ['alice', 5, '= sum(cell(1, 2), cell(2, 2))']
    ]);

    // console.dir(sp._columnWidths);

    // sp.print();
    sp.printFormatted();
}

main();
