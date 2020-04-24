/**
 * @responsibility 
 * Represents Google rows & colums. 
 * 
 * Will cooperate with SpreadsheetApp & Spreadsheet methods
 *  .getValues
 *  .setValues
 * https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app
 * https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet
 * 
 * SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1").getRange("A1:C3").getValues()
 * [[A1, B1, C1], [A2, B2, C2], [A3, B3, C3]]
 * 
 */
class Matrix {
    constructor(rows/* : number */, columns/* : number */, filler/* : any */ = null) {
        this.rows = rows
        this.columns = columns
        this.matrix = this.createMatrix(rows, columns, filler)
    }

    createMatrix(rows/* : number */, columns/* : number */, filler/* : any */) {
        const matrix = []
        for (let i = 0; i < rows; i++) {
            matrix.push(Array(columns).fill(filler))
        }
        return matrix
    }
    display(sheet/* : Sheet */, range/* : string A1notation */) {
        // https://developers.google.com/apps-script/reference/spreadsheet/range#
        // https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
        // run check that range is same dimentions as our matrix
        if (!range.includes(":")) {
            throw new Error(`Matrix.display: range must be in A1notation.\nrange: ${range}`)
        }
        function extractLetters(str/* : string */)/* : string */ {
            return String(str.match(/[A-z]/g).join(''))
        }
        function extractNumbers(str/* : string */)/* : number */ {
            return Number(str.match(/[0-9]/g).join(''))
        }
        const [topLeft, bottomRight] = range.toUpperCase().split(":")
        const [leftCol, rightCol] = [extractLetters(topLeft), extractLetters(bottomRight)]
        const rowsSupplied = extractNumbers(bottomRight)

        // need to check if Z is the last column, ie now we can only work with 26 columns
        // later I will add AA columns
        if (rightCol.charCodeAt(0) > 122) {
            throw new Error(`Matrix.display: cannot work with columns after Z. WIP.\nrange: ${range}`)
        }
        const columnsSupplied/* : number */ = rightCol.charCodeAt(0) - leftCol.charCodeAt(0) + 1
        if (rowsSupplied !== this.rows && columnsSupplied !== this.columns) {
            throw new Error(`Matrix.display: supplied range does not match matrix dimensions.
            \nrange:\t\t\t${range}\nrange dimensions:\t(${rowsSupplied},${columnsSupplied})\nmatrix dimensions:\t(${this.rows},${this.columns})\n`)
        }
        console.log('all ok ')
    }
}

const test = new Matrix(3, 3, 'lol')
test.display(null, 'a1:c3')
// console.log(test.matrix)

// console.log(
//     'A'.charCodeAt(0), // 65
//     'Z'.charCodeAt(0), // 90
//     'z'.charCodeAt(0), // 122
//     // String.fromCharCode(64)
// )
// console.log(
//     // 'A1'.match(/[A-z]/g).join('') == 'A',
//     // 'AB1'.match(/[A-z]/g).join('') == 'AB',
//     // 'aBC'.match(/[A-z]/g).join('') == 'aBC',
//     Number('A12'.match(/[0-9]/g).join(''))
// )