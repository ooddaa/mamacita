// https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/
//////////////////// FUN ////////////////////
function compose2(fn2, fn1) {
    return function composedFn(arg) {
        return fn2(fn1(arg))
    }
}
function composer(...fns) {
    return function composed(result) {
        const list = [...fns]
        while (list.length > 0) {
            result = list.pop()(result)
        }
        return result
    }
}
function firstElement(arr/* : array */) {
    if (!Array.isArray(arr)) {
        throw new Error(`firstElement: arr must be an array.\narr: ${JSON.stringify(arr)}`)
    }
    return arr[0]
}
function isNumber(val/* : any */)/* : boolean */ {
    return typeof val === 'number' && !isNaN(val) && val !== ''
}

const composedIsNumber = composer(isNumber, firstElement)

//////////////////// END ////////////////////

/**
 * @responsibility 
 * Represents Google rows & colums. Displays and reads matrices from gs.
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
    constructor(matrix/* : Array[] */, rows/* : number */, columns/* : number */, filler/* : any */ = null) {
        this.rows = rows
        this.columns = columns
        this.matrix = matrix
    }

    createEmptyMatrix(rows/* : number */, columns/* : number */, filler/* : any */)/* : void */ {
        const matrix = []
        for (let i = 0; i < rows; i++) {
            matrix.push(Array(columns).fill(filler))
        }
        this.matrix = matrix
    }
    /**
     * Displays the matrix.
     * 
     * @param {Sheet} sheet 
     * @param {number[]} range - do not use A1Notation here
     */
    display(sheet/* : Sheet */, range/* : number[] */) {
        // https://developers.google.com/apps-script/reference/spreadsheet/range#
        // https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
        // run check that range is same dimentions as our matrix
        // sheet.getRange(row, column, numRows, numColumns) https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangerow-column-numrows-numcolumns
        // sheet.getRange(1,2, 3, 4).getA1Notation() === B1:E3 // col,row
        // let _range = sheet.getRange(...range).getA1Notation()
        // if (!range.includes(":")) {
        //     throw new Error(`Matrix.display: range must be in A1notation.\nrange: ${range}`)
        // }

        // const [topLeft, bottomRight] = range.toUpperCase().split(":")
        // const [leftCol, rightCol] = [extractLetters(topLeft), extractLetters(bottomRight)]
        // const rowsSupplied = extractNumbers(bottomRight)

        // need to check if Z is the last column, ie now we can only work with 26 columns
        // later I will add AA columns
        // if (rightCol.charCodeAt(0) > 122) {
        //     throw new Error(`Matrix.display: cannot work with columns after Z. WIP.\nrange: ${range}`)
        // }
        // const columnsSupplied/* : number */ = rightCol.charCodeAt(0) - leftCol.charCodeAt(0) + 1
        // const [rows, cols] = this.dim()
        // if (rowsSupplied !== rows && columnsSupplied !== columns) {
        //     throw new Error(`Matrix.display: supplied range does not match matrix dimensions.
        //     \nrange:\t\t\t${range}\nrange dimensions:\t(${rowsSupplied},${columnsSupplied})\nmatrix dimensions:\t(${this.rows},${this.columns})\nmatrix: ${JSON.stringify(this.matrix)}\n`)
        // }
        // console.log('all ok ')

        // set values
        sheet.getRange(...range).setValues(this.matrix)

        //////////////////// FUN ////////////////////
        function extractLetters(str/* : string */)/* : string */ {
            return String(str.match(/[A-z]/g).join(''))
        }
        function extractNumbers(str/* : string */)/* : number */ {
            return Number(str.match(/[0-9]/g).join(''))
        }
        //////////////////// END ////////////////////
    }
    /**
     * Loads the matrix from gs.
     * 
     * @param {Sheet} sheet 
     * @param {string} range - use only A1notation here
     */
    load(sheet/* : Sheet */, range/* : string A1notation */) {
        // const matrix = sheet.getRange(range).getValues()
        // console.log(matrix)
    }
    /**
     * Checks if matrix is a complete matrix.
     * @param {*} matrix 
     */
    isMatrix(matrix/* : any */)/* : boolean */ {
        if (!Array.isArray(matrix)) {
            throw new Error(`Matrix.isMatrix: matrix must be an Array.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        if (matrix.length === 0) {
            throw new Error(`Matrix.isMatrix: matrix must not be empty.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        if (!Array.isArray(matrix)) {
            throw new Error(`Matrix.isMatrix: matrix must have a row that is an Array.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        if (matrix[0].length === 0) {
            throw new Error(`Matrix.isMatrix: matrix must have at least one row and one column.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        return true
    }
    dim(_matrix/*? : Array[] */) {
        let matrix = _matrix || this.matrix
        if (!this.isMatrix(matrix)) return [0, 0] // never gonna happen though
        const rows = matrix.length
        const columns = matrix.map(getLength).filter(onlyUnique)
        if (columns.length !== 1) {
            throw new Error(`Matrix.dim: matrix must be complete, some values are missing.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        return [rows, columns[0]]

        //////////////////// FUN ////////////////////
        function getLength(arr) { return arr.length }
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        //////////////////// END ////////////////////
    }
    /**
     * Uploads a matrix supplied by user.
     * @param {*} matrix 
     */
    addMatrix(matrix) {
        this.matrix = matrix
    }
}

/**
 * @responsibility 
 * PortfolioTable (PT) is a special kind of Matrix.
 * This class represents Kat's 'rolling bands' table (Sheet11). 
 * Its structure is:
 * 
 *      col1        colX            colLast
 * row1 DESCRIPTION positionX       PL
 * row2 STRIKE      posX_strike
 * row3 PREMIUM     posX_prem_at_exp
 * rowX undPrice    earned_premium
 * 
 * It compiles the matrix, does all the calculations, ranges etc 
 * and uses Matrix to display. 
 * 
 * Workflow. Read existing PT -> add to it/edit it -> run all calculations ->
 * display.
 * 
 */
class PortfolioTable /* extends Matrix */ {
    constructor(table/* : Array[] */, sheet/* : Sheet */, firstRow = 1/* : number */, fisrtCol = 1/* : number */) {
        this.table = table
        this.sheet = sheet
        this.firstRow = firstRow
        this.fisrtCol = fisrtCol
    }
    /**
     * Returns first three rows
     * @param {*} table 
     */
    getHeader(table = this.table) {
        return table.slice(0, 3)
    }
    getStrikes(table = this.table) {
        return table.slice(3, table.length).map(firstElement)
    }
    addColumn() { }
    removeColumn() { }
    display(sheet = this.sheet) {
        const matrix = new Matrix(this.table)
        const [numRows, numCols] = matrix.dim()
        // getRange(row, column, numRows, numColumns)
        // [row, col, numRows, numColumns]
        // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangerow-column-numrows-numcolumns
        const range = [this.fisrtCol, this.firstRow, numRows, numCols]
        // console.log(range)
        matrix.display(sheet, range)
    }
    loadStrikes(range = [4, 1, 30, 1], sheet = this.sheet)/* : number[] */ {
        const strikes/* : [number[]] */ = sheet.getRange(...range).getValues().filter(composedIsNumber)
        const flatStrikes/* : number[] */ = strikes.map(firstElement)
        console.log('loadStrikes flatStrikes: ', flatStrikes)
        return flatStrikes
    }
    /**
     * Loads existing table
     */
    loadTable(firstRow = 1, firstCol = 1, sheet = this.sheet) {
        // find lastRow and rightmostRow
        // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastrow
        const lastRow = sheet.getLastRow()

        // https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastcolumn
        const lastColumn = sheet.getLastColumn()
        const lastCell = sheet.getRange(lastRow, lastColumn)
        const [numRows, numCols] = [lastRow - firstRow + 1, lastColumn - firstCol + 1]
        const range = sheet.getRange(firstRow, firstCol, numRows, numCols)
        console.log('loadTable range: ', JSON.stringify(range.getA1Notation()))
        const table = range.getValues()
        console.log('loadTable table: ', JSON.stringify(table))
        this.table = table
    }
}

/**
 * @responsibility
 * Represents a cell.
 * @todo I need to treat each cell as { row: number, column: number, value: any, info: string }
 */
class Cell {
    constructor(row/* : number */, column/* : number */, value/* : any */, info/* : string */) {
        this.row = row
        this.column = column
        this.value = value
        this.info = info
    }

    getRange()/* : [row, column] */ {
        return [this.row, this.column]
    }
    getValue()/* : any */ {
        return this.value
    }
}
const table = [
    ['DESCRIPTION', 'PL', 'positionX'],
    ['STRIKE', '', 'posX_strike'],
    ['PREMIUM', '', 'posX_prem_at_exp'],
    ['undPrice', '', 'earned_premium'],
]
// const test = new PortfolioTable(table, 1, 1)
// test.display()
/*
function testMatrix() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet9')
  const m = new Matrix(3,3, 'lol')
  m.display(sheet, 'A1:C3')
}
*/


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