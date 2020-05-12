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
function getRowValues(row/* : Row */) { return row.getValues() }
function getFirstColValueFromRow(row/* : Row */) { return firstElement(getRowValues(row)) }

const composedIsNumber = composer(isNumber, firstElement)

function addTrades(header, stock, expiration)/* [header, trades] */ {
    // always 4 rows
    const [include, descrRow, strikeRow, premiumRow] = header
    console.log('header: ', JSON.stringify(header))
    // how many trades are there
    const tradesNum = descrRow.row.length - 2
    const trades = []
    // console.log(tradesNum)
    for (let i = 2; i < 2 + tradesNum; i++) {
        // console.log(i)
        // console.log(descrRow)
        let descr/* : string */ = descrRow.row[i].value
        let premium/* : number */ = Number(premiumRow.row[i].value)
        let strike /* : number */ = Number(strikeRow.row[i].value)
        let firstLetter = descr[0]
        // console.log(firstLetter)
        let lastLetter = descr[descr.length - 1]
        // console.log(lastLetter)
        let type = ''
        if (['C', 'c', 'Call', 'call'].includes(lastLetter)) {
            type = 'Call'
        } else if (['P', 'p', 'Put', 'put'].includes(lastLetter)) {
            type = 'Put'
        } else {
            throw new Error(`headerToTrades: cannot get instrument type. Must be 'c' or 'p'.\ndescr: ${JSON.stringify(descr)}`)
        }
        // console.log(type)
        // is it STO or BTO ?
        if (firstLetter === '-') {
            if (type === 'Call') {
                let trade = new STO(new Call(stock, strike, expiration), null, 1, new Premium(premium))
                trades.push(trade)
                descrRow.row[i].info = trade
            } else {
                let trade = new STO(new Put(stock, strike, expiration), null, 1, new Premium(premium))
                trades.push(trade)
                descrRow.row[i].info = trade
            }
        } else {
            if (type === 'Call') {
                let trade = new BTO(new Call(stock, strike, expiration), null, 1, new Premium(premium))
                trades.push(trade)
                descrRow.row[i].info = trade
            } else {
                let trade = new BTO(new Put(stock, strike, expiration), null, 1, new Premium(premium))
                trades.push(trade)
                descrRow.row[i].info = trade
            }
        }
    }
    return [header, trades]
}

function updateTableWithPL(tbl) {
    // get body portion (below header)
    const [include, descr, ...rest] = tbl.slice(0, 5)
    const blacklistedCols = include.row.reduce((acc, cell) => {
        if (cell.value === false) {
            acc.push(cell.column)
        }
        return acc
    }, [])
    const body = tbl.slice(6)
    // console.log('body: ', body)

    const [tag, pl, ...trades] = descr.row
    //console.log('trades: ', trades)
    trades.forEach(cell => {
        const trade = cell.info
        const column = cell.column

        body.forEach(priceRow => {

            // console.log('priceRow: ', priceRow)
            const price = getFirstColValueFromRow(priceRow)
            const [curPrice, pl] = trade.getCurrentPL(price)
            if (price !== curPrice) {
                throw new Error(`updateTableWithPL: price != curPrice.\npriceRow: ${JSON.stringify(priceRow)}\ncell: ${JSON.stringify(cell)}`)
            }
            // find corresponding column 
            const correctCell = priceRow.row.filter(cell => {
                //console.log('cell.column: ', cell.column, 'column: ', column, 'cell: ', cell)
                return cell.column === column
            })
            // and set pl value there
            correctCell[0].value = pl

            /*
            priceRow:  { class: 'Row',
row: 
[ { class: 'Cell', row: 11, column: 1, value: 25, info: null },
 { class: 'Cell', row: 11, column: 2, value: 0, info: null },
 { class: 'Cell', row: 11, column: 3, value: 42, info: null },
 { class: 'Cell', row: 11, column: 4, value: -126, info: null },
 { class: 'Cell', row: 11, column: 5, value: -149, info: null },
 { class: 'Cell', row: 11, column: 6, value: 100, info: null },
 { class: 'Cell', row: 11, column: 7, value: 90, info: null },
 { class: 'Cell', row: 11, column: 8, value: 75, info: null } ],
rowNum: 11,
firstCol: 1,
lastCol: 9,
range: null }
*/


        })
        // update PL sum 
        body.forEach(({ row }) => {
            const [price, PL, ...premiums] = row

            PL.value = premiums.reduce((acc, { column, value }) => {
                if (!blacklistedCols.includes(column)) {
                    acc += value
                }
                return acc
            }, 0)
        })
    })
    // console.log('updateTableWithPL body: ', JSON.stringify(body))
    //console.log('updateTableWithPL tbl: ', JSON.stringify(tbl))

    return tbl
}
function getStockTicker(sheet, range = 'B1') {
    const ticker = sheet.getRange(range).getValue()
    console.log('getStockTicker ticker: ', ticker)
    if (!ticker || !ticker.length) {
        throw new Error(`getStockTicker: no valid ticker.\nrange: ${range}\nticker: ${ticker}`)
    }
    return ticker
}
function getStockMktPrice(sheet, range = 'B2') {
    const price = sheet.getRange(range).getValue()
    console.log('getStockMktPrice price: ', price)
    if (!price) {
        throw new Error(`getStockMktPrice: no valid price.\nrange: ${range}\nprice: ${price}`)
    }
    return price
}
function getExpiration(sheet, range = 'B3') {
    const exp = sheet.getRange(range).getValue()
    console.log('getExpiration exp: ', exp)
    if (!exp || !exp.length) {
        throw new Error(`getExpiration: no valid expiration.\nrange: ${range}\nexp: ${exp}`)
    }
    return exp
}
//////////////////// END ////////////////////