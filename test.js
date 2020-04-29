const { Stock, Call, Put } = require('./instrument')
const { Position } = require('./position')
const { Premium, Commission, STO, BTO, STC, BTC } = require('./trade')
const { Timestamp } = require('./timestamp')

const header = [
    // 1 row
    {
        "row": [
            { "row": 7, "column": 1, "value": "INCLUDE IN PL", "info": null },
            { "row": 7, "column": 2, "value": "", "info": null },
            { "row": 7, "column": 3, "value": true, "info": null },
            { "row": 7, "column": 4, "value": true, "info": null },
            { "row": 7, "column": 5, "value": true, "info": null }
        ], "rowNum": 7, "firstCol": 1, "lastCol": 6, "range": null
    },
    // 2
    {
        "row": [
            { "row": 8, "column": 1, "value": "DESCRIPTION", "info": null },
            /* Cell */ { "row": 8, "column": 2, "value": "PL", "info": null },
            { "row": 8, "column": 3, "value": "-27c", "info": null },
            { "row": 8, "column": 4, "value": "-27p", "info": null },
            { "row": 8, "column": 5, "value": "-27.5p", "info": null }
        ], "rowNum": 8, "firstCol": 1, "lastCol": 6, "range": null
    },
    // 3
    { "row": [{ "row": 9, "column": 1, "value": "STRIKE", "info": null }, { "row": 9, "column": 2, "value": "", "info": null }, { "row": 9, "column": 3, "value": 27, "info": null }, { "row": 9, "column": 4, "value": 27, "info": null }, { "row": 9, "column": 5, "value": 27.5, "info": null }], "rowNum": 9, "firstCol": 1, "lastCol": 6, "range": null },
    // 4
    { "row": [{ "row": 10, "column": 1, "value": "PREMIUM", "info": null }, { "row": 10, "column": 2, "value": "", "info": null }, { "row": 10, "column": 3, "value": 42, "info": null }, { "row": 10, "column": 4, "value": 74, "info": null }, { "row": 10, "column": 5, "value": 101, "info": null }], "rowNum": 10, "firstCol": 1, "lastCol": 6, "range": null },
    { "row": [{ "row": 11, "column": 1, "value": 25, "info": null }, { "row": 11, "column": 2, "value": "", "info": null }, { "row": 11, "column": 3, "value": '', "info": null }, { "row": 11, "column": 4, "value": '', "info": null }, { "row": 11, "column": 5, "value": '', "info": null }], "rowNum": 10, "firstCol": 1, "lastCol": 6, "range": null }
]

function addTrades(header, stock, expiration)/* [header, trades] */ {
    // always 4 rows
    const [ignore, descrRow, strikeRow, premiumRow] = header
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
            throw new Error(`headerToTrades: cannot get instrument type. Must be c or p.\ndescr: ${JSON.stringify(descr)}`)
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
const work = new Stock('WORK', 25)
const apr24 = new Timestamp("Apr24'20")

// I need to turn this into these:
const work_27c = new STO(new Call(work, 27, new Timestamp("Apr24'20")), null, 1, new Premium(42)/* , new Commission() */)
const work_27p = new STO(new Put(work, 27, new Timestamp("Apr24'20")), null, 1, new Premium(74)/* , new Commission() */)
const work_27_5p = new STO(new Put(work, 27.5, new Timestamp("Apr24'20")), null, 1, new Premium(101)/* , new Commission() */)

// addTrades(table, stock, exercise)
const trades = addTrades(header, work, apr24)
const prices = [25, 26, 26.5, 26.7, 26.75,
    26.77,
    26.8,
    27,
    27.2,
    27.3,
    27.5,
    28,
    29,
    30,
    31,
    31.1,
    31.19,
    31.2,
    31.5,
    32,
    33,
    34]

// console.log(JSON.stringify(trades[0]))
// prices.forEach(price => console.log(`price: ${trades[2].getCurrentPL(price)[0].toFixed(2)}\tPL: ${trades[2].getCurrentPL(price)[1].toFixed(2)}`))

const tbl = [
    ['INCLUDE IN PL', '', true, true, true],
    /* Row.row */['DESCRIPTION', 'PL', /* Cell.value */'-27c', '-27p', '-27.5p'],
    ['STRIKE', '', 27, 27, 27.5],
    ['PREMIUM', '', 42, 74, 101],
    [25, '', '', '', ''],
    [26, '', '', '', ''],
    [26.5, '', '', '', ''],
    [26.7, '', '', '', ''],
]

function updateTableWithPL1(tbl) {
    // get body portion (below header)
    const [incl, descr, ...rest] = tbl.slice(0, 4)
    const body = tbl.slice(4)
    // console.log(descr)
    // console.log(body)
    const [tag, pl, ...trades] = descr.row
    for (let cell in trades) {
        const trade = cell.info
        const column = cell.column
        for (row in body) {
            const price = row[0].value
            const [curPrice, pl] = trade.getCurrentPL(price)
            if (price !== curPrice) {
                throw new Error(`updateTableWithPL: price != curPrice.\nrow: ${JSON.stringify(row)}\ncell: ${JSON.stringify(cell)}`)
            }
            // place pl into correct cell
            const correctCell = row.row.filter(cell => cell.column === column)
            correctCell.value = pl
        }
    }
    return tbl
}

function updateTableWithPL(tbl) {
    // get body portion (below header)
    const [incl, descr, ...rest] = tbl.slice(0, 4)
    const body = tbl.slice(4)
    //console.log(descr)

    const [tag, pl, ...trades] = descr.row
    //console.log('trades: ', trades)
    trades.forEach(cell => {
        const trade = cell.info
        const column = cell.column

        body.forEach(priceRow => {
            let PLsum = priceRow.row[1].value
            console.log('PLsum: ', PLsum)
            const price = getFirstColValueFromRow(priceRow)
            const [curPrice, pl] = trade.getCurrentPL(price)
            if (price !== curPrice) {
                throw new Error(`updateTableWithPL: price != curPrice.\npriceRow: ${JSON.stringify(priceRow)}\ncell: ${JSON.stringify(cell)}`)
            }
            const correctCell = priceRow.row.filter(cell => {
                //console.log('cell.column: ', cell.column, 'column: ', column, 'cell: ', cell)
                return cell.column === column
            })
            correctCell[0].value = pl
            // sum up
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
            if (PLsum && !isNaN(PLsum)) {
                PLsum += pl
            } else {
                PLsum = pl
            }

        })
    })
    //console.log('updateTableWithPL body: ', JSON.stringify(body))
    //console.log('updateTableWithPL tbl: ', JSON.stringify(tbl))

    return tbl
}
// updateTableWithPL(header)


// function updateTableWithPL(tbl) {
//     // get body portion (below header)
//     const [incl, descr, ...rest] = tbl.slice(0, 4)
//     const body = tbl.slice(4)
//     //console.log(descr)

//     const [tag, pl, ...trades] = descr.row
//     //console.log('trades: ', trades)
//     for (let cell of trades) {
//       //console.log('cell: ', cell)
//         const trade = cell.info
//         const column = cell.column
//         for (let row of body) {
//           //console.log('updateTableWithPL row: ', row)
//           //console.log(JSON.stringify(body))

//           /*
//           { class: 'Row',
//   row: 
//    [ { class: 'Cell', row: 11, column: 1, value: 25, info: null },
//      { class: 'Cell', row: 11, column: 2, value: '', info: null },
//      { class: 'Cell', row: 11, column: 3, value: '', info: null },
//      { class: 'Cell', row: 11, column: 4, value: '', info: null },
//      { class: 'Cell', row: 11, column: 5, value: '', info: null } ],
//   rowNum: 11,
//   firstCol: 1,
//   lastCol: 6,
//   range: null }
//           */
//             const price = getFirstColValueFromRow(row)
//             //console.log('updateTableWithPL price: ', price)
//             //console.log('updateTableWithPL trade: ', trade)
//             const [curPrice, pl] = trade.getCurrentPL(price)
//             //console.log('updateTableWithPL pl: ', pl)
//             if (price !== curPrice) {
//                 throw new Error(`updateTableWithPL: price != curPrice.\nrow: ${JSON.stringify(row)}\ncell: ${JSON.stringify(cell)}`)
//             }
//             // place pl into correct cell
//       const correctCell = row.row.filter(cell => {

//       console.log('cell.column: ', cell.column, 'column: ', column, 'cell: ', cell)
//                                          cell.column === column
//       })
//             correctCell.value = pl

//         }
//     } 
//     console.log('updateTableWithPL body: ', JSON.stringify(body))
// //console.log('updateTableWithPL tbl: ', JSON.stringify(tbl))
//     return tbl
// }