/**
 * @responsibility 
 * PriceScenarioTable (PT) is a special kind of Matrix.
 * PT must be a Matrix + its position { range: {firstRow, firstCol, lastRow, lastCol, numRows, numCols} }
 * This class represents Kat's PriceScenario tables.
 * It compiles the matrix, does all the calculations, ranges etc 
 * and uses Matrix to display. 
 * The structure fixed as:
 * 
 * 1
 * 2
 * 3
 * 4
 * 5
 * 6
 * 7    INCLUDE IN PL           TRUE/FALSE
 * 8    DESCRIPTION     PL      positionX
 * 9    STRIKE                  posX_strike
 * 10   PREMIUM                 posX_premium_at_exp
 * 11   undPrice                posX_earned_premium
 * 
 * HEADER = rows 7 - 10 
 * 
 * 
 * Workflow. Read existing PT -> add to it/edit it -> run all calculations ->
 * display.
 * 
 */



const HEADER = [0, 6] // as we are placing our PST on 7th row and start counting from there
const BODY = table => [6, table.length]

class PriceScenarioTable /* extends Matrix */ {
    constructor(table = [[]]/* : Array[] */, sheet/* : Sheet */, firstRow = 6/* : number */, firstCol = 1/* : number */) {
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
    getHeader(table = this.table)/* : part of table */ {
        return table.slice(...HEADER)
    }
    getBody(table = this.table)/* : part of table */ {
        return table.slice(...BODY(table))
    }
    updateHeader(newHeader) {
        this.table = newHeader.concat(this.getBody())
    }
    getPrices(table = this.table) {
        return this.getBody().map(getFirstColValueFromRow)
        /* 
        {"row":[
            {"row":12,"column":1,"value":12,"info":null},
            {"row":12,"column":2,"value":"","info":null},
            {"row":12,"column":3,"value":"","info":null}
        ],"rowNum":12,"firstCol":1,"lastCol":4,"range":null}
        */
    }
    getDisplayedTableRange(sheet = this.sheet) {
        const [firstRow, firstCol] = [this.firstRow, this.firstCol]
        const [lastRow, lastCol] = [sheet.getLastRow(), sheet.getLastColumn()]
        const [numRows, numCols] = [lastRow - this.firstRow + 1, lastCol - this.firstCol + 1]

        return {
            range: [firstRow, firstCol, numRows, numCols],
            firstRow,
            firstCol,
            lastRow,
            lastCol,
            numRows,
            numCols,
        }
    }
    display(sheet = this.sheet, firstRow = this.firstRow, firstCol = this.firstCol) {
        const matrix = new Matrix(this.table)
        const [numRows, numCols] = matrix.dim()
        //console.log('display matrix.getMatrix(): ', matrix.getMatrix())
        const matrixToDisplay = matrix.getMatrix().map(getRowValues)
        //console.log('display matrixToDisplay: ', matrixToDisplay)
        const range = [firstRow, firstCol, numRows, numCols]
        //console.log('PriceScenarioTable.display range: ', range)
        sheet.getRange(...range).setValues(matrixToDisplay)
    }

    /**
     * Loads existing PriceScenarioTable
     */
    load(sheet = this.sheet) {
        // find the PST
        const { firstRow, firstCol, numRows, numCols } = this.getDisplayedTableRange(sheet)
        //console.log('load firstRow, firstCol, numRows, numCols: ', firstRow, firstCol, numRows, numCols)
        const range = sheet.getRange(firstRow, firstCol, numRows, numCols)
        //console.log('load range: ', JSON.stringify(range.getA1Notation()))
        const table = range.getValues()
        //console.log('load table: ', JSON.stringify(table))
        this.table = this.wrapTableInRows(table)
    }
    wrapTableInRows(table = this.table, firstRow = this.firstRow, firstCol = this.firstCol) {
        const tableAsRows = table.map((row, i) => {
            const currentRow = firstRow + i
            const newRow = row.map((cell, j) => {
                return new Cell(currentRow, firstCol + j, cell, null)
            })
            return new Row(newRow, currentRow, firstCol, firstCol + row.length)
        })
        //console.log('wrapTableInRows tableAsRows: ', JSON.stringify(tableAsRows))
        return tableAsRows
    }
    calculatePL() {
        this.load()
        //console.log(JSON.stringify(this.table))
        const headers = this.getHeader()
        //console.log('PriceScenarioTable calculatePL headers: ', JSON.stringify(headers))
        const body/* : number[] */ = this.getBody()
        //console.log('PriceScenarioTable calculatePL body: ', JSON.stringify(body))

        // make list or trades
        const stock = new Stock(getStockTicker(this.sheet), getStockMktPrice(this.sheet))
        const exp = new Timestamp(getExpiration(this.sheet))
        const [newHeader, pls] = addTrades(headers, stock, exp) // [STO(blabla)...]
        //console.log('calculatePL trades: ', JSON.stringify(trades))
        this.updateHeader(newHeader)
        //console.log(JSON.stringify(this.table))
        this.table = updateTableWithPL(this.table)
    }
}

function calculatePL() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    const tbl1 = [
        ['INCLUDE IN PL', '', true, true, true],
        ['DESCRIPTION', 'PL', '-27c', '-27p', '-27.5p'],
        ['STRIKE', '', 27, 27, 27.5],
        ['PREMIUM', '', 42, 74, 101],
        [25, '', '', '', ''],
        [26, '', '', '', ''],
        [26.5, '', '', '', ''],
        [26.7, '', '', '', ''],
    ]
    const tbl = [
        ['INCLUDE IN PL',],
        ['DESCRIPTION', 'PL'],
        ['STRIKE', ''],
        ['PREMIUM', ''],
        [25, ''],
        [26, ''],
        [26.5, ''],
        [26.7, ''],
    ]
    const table = new PriceScenarioTable(tbl, sheet)

    table.calculatePL()
    table.display()

    //console.log(JSON.stringify(table.table))
}
