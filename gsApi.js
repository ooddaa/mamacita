// https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/
//////////////////// FUN ////////////////////
function getLength(arr) { return arr.length }
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
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
function iterRows(row) { }
function getCellValue(cell/* : Cell */) { return cell.getValue() }

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
    dim(matrix = this.matrix/*? : Array[] */)/* : [rowNum, colNum] */ {
        // if (!this.isMatrix(matrix)) return [0, 0] // never gonna happen though
        const rows = matrix.length
        const columns = matrix.map(getLength).filter(onlyUnique)
        if (columns.length !== 1) {
            throw new Error(`Matrix.dim: matrix must be complete, some values are missing.\nmatrix: ${JSON.stringify(matrix)}`)
        }
        console.log(`Matrix.dim: (${rows},${columns[0]})`)
        return [rows, columns[0]]
    }
    dim1(matrix = this.matrix) {
        // count rows & cols
        // make sure it's full?
        const rows = matrix.length
        const cols = matrix.map(getLength)
        console.log(`Matrix.dim: (${rows},${cols})`)
        return [rows, cols]
    }
    /**
     * Uploads a matrix supplied by user.
     * @param {*} matrix 
     */
    addMatrix(matrix) {
        this.matrix = matrix
    }
    getMatrix() {
        return this.matrix
    }
    getValues() {
        return this.matrix.map(row => row.getValues())
    }
}

/**
 * @responsibility 
 * PriceScenarioTable (PT) is a special kind of Matrix.
 * PT must be a Matrix + its position { range: {firstRow, firstCol, lastRow, lastCol, numRows, numCols} }
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
class PriceScenarioTable /* extends Matrix */ {
    constructor(table/* : Array[] */, sheet/* : Sheet */, firstRow = 1/* : number */, firstCol = 1/* : number */) {
        this.table = this.wrapTableInRows(table)
        this.tableWithCells = undefined
        this.sheet = sheet
        this.firstRow = firstRow
        this.firstCol = firstCol
        this.tableRange = this.getDisplayedTableRange()
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
    getDisplayedTableRange(sheet = this.sheet) {
        const [lastRow, lastCol] = [sheet.getLastRow(), sheet.getLastColumn()]
        const [numRows, numCols] = [lastRow - this.firstRow + 1, lastCol - this.firstCol + 1]
        return {
            firstRow: this.firstRow,
            firstCol: this.firstCol,
            lastRow,
            lastCol,
            numRows,
            numCols
        }
    }
    display(sheet = this.sheet, firstRow = this.firstRow, firstCol = this.firstCol) {
        const matrix = new Matrix(this.table)
        const [numRows, numCols] = matrix.dim()
        const matrixToDisplay = matrix.getMatrix().map(getCellValue)
        const range = [firstRow, firstCol, numRows, numCols]
        console.log('PriceScenarioTable.display range: ', range)
        sheet.getRange(...range).setValues(matrix.getValues())
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
    loadWholeTable(sheet = this.sheet) {
        const { firstRow, firstCol, numRows, numCols } = this.getDisplayedTableRange(sheet)
        console.log('loadWholeTable firstRow, firstCol, numRows, numCols: ', firstRow, firstCol, numRows, numCols)
        const range = sheet.getRange(firstRow, firstCol, numRows, numCols)
        console.log('loadWholeTable range: ', JSON.stringify(range.getA1Notation()))
        const table = range.getValues()
        console.log('loadWholeTable table: ', JSON.stringify(table))
        this.table = this.wrapTableInRows(table)
    }
    wrapTableInCell(table = this.table, firstRow = 1, firstCol = 1) {
        const tableAsCells = table.map((row, i) => {
            return row.map((cell, j) => {
                return new Cell(firstRow + i, firstCol + j, cell, null)
            })
        })
        console.log('wrapTableInCell tableAsCells: ', JSON.stringify(tableAsCells))
        return tableAsCells
    }
    wrapTableInRows(table = this.table, firstRow = 1, firstCol = 1) {
        const tableAsRows = table.map((row, i) => {
            const currentRow = firstRow + i
            const newRow = row.map((cell, j) => {
                return new Cell(currentRow, firstCol + j, cell, null)
            })
            return new Row(newRow, currentRow, firstCol, firstCol + row.length)
        })
        console.log('wrapTableInRows tableAsRows: ', JSON.stringify(tableAsRows))
        return tableAsRows
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

/**
 * @responsibility
 * Represents rows of cells in gs.
 */
class Row {
    constructor(row/* : Cell[] */, rowNum/* :number */, firstCol/* :number */, lastCol/* :number */, ) {
        this.row = row
        this.rowNum = rowNum
        this.firstCol = firstCol
        this.lastCol = lastCol
        this.range = null
    }

    getRange()/* : Object */ {
        return {
            firstRow: this.rowNum,
            firstCol: this.firstCol,
            lastRow: this.rowNum,
            lastCol: this.lastCol,
            numRows: 1,
            // numCols: this.lastCol - this.firstCol + 1
            numCols: this.row.length
        }
    }
    getValue()/*: Cell[] */ {
        return this.row
    }
    getValues()/*: any[] */ {
        return this.row.map(getCellValue)
    }
    getLength()/*: number */ {
        return this.row.length
    }
    get length() {
        return this.row.length
    }
}
const table = [
    ['DESCRIPTION', 'PL', 'positionX'],
    ['STRIKE', '', 'posX_strike'],
    ['PREMIUM', '', 'posX_prem_at_exp'],
    ['undPrice', '', 'earned_premium'],
]
// const test = new PriceScenarioTable(table, 1, 1)
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