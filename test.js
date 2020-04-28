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
    { "row": [{ "row": 10, "column": 1, "value": "PREMIUM", "info": null }, { "row": 10, "column": 2, "value": "", "info": null }, { "row": 10, "column": 3, "value": 42, "info": null }, { "row": 10, "column": 4, "value": 74, "info": null }, { "row": 10, "column": 5, "value": 101, "info": null }], "rowNum": 10, "firstCol": 1, "lastCol": 6, "range": null }
]
// const [tag, pl, ...trades] = 
function headerToTrades(header, stock, expiration) {
    // always 4 rows
    const [ignore, descrRow, strikeRow, premiumRow] = header
    // how many trades are there
    // const tradesNum = descrRow.firstCol - descrRow.lastCol - 1
    const tradesNum = descrRow.row.length - 2
    // const tradesNum = header.map(row => (row.firstCol - row.lastCol - 1)) // row.length - 2
    // if (tradesNum.)
    const trades = []
    console.log(tradesNum)
    for (let i = 2; i < 2 + tradesNum; i++) {
        console.log(i)
        console.log(descrRow)
        let descr/* : string */ = descrRow.row[i].value
        let premium/* : number */ = Number(premiumRow.row[i].value)
        let strike /* : number */ = Number(strikeRow.row[i].value)
        let firstLetter = descr[0]
        console.log(firstLetter)
        let lastLetter = descr[descr.length - 1]
        console.log(lastLetter)
        let type = ''
        if (['C', 'c', 'Call', 'call'].includes(lastLetter)) {
            type = 'Call'
        } else if (['P', 'p', 'Put', 'put'].includes(lastLetter)) {
            type = 'Put'
        } else {
            throw new Error(`headerToTrades: cannot get instrument type. Must be c or p.\ndescr: ${JSON.stringify(descr)}`)
        }
        console.log(type)
        // is it STO or BTO ?
        if (firstLetter === '-') {
            if (type === 'Call') {
                trades.push(new STO(new Call(stock, strike, expiration), null, 1, new Premium(premium)))
            } else {
                trades.push(new STO(new Put(stock, strike, expiration), null, 1, new Premium(premium)))
            }
        } else {
            if (type === 'Call') {
                trades.push(new BTO(new Call(stock, strike, expiration), null, 1, new Premium(premium)))
            } else {
                trades.push(new BTO(new Put(stock, strike, expiration), null, 1, new Premium(premium)))
            }
        }
    }
    return trades
}
const work = new Stock('WORK', 25)
const apr24 = new Timestamp("Apr24'20")

// I need to turn this into these:
const work_27c = new STO(new Call(work, 27, new Timestamp("Apr24'20")), null, 1, new Premium(42)/* , new Commission() */)
const work_27p = new STO(new Put(work, 27, new Timestamp("Apr24'20")), null, 1, new Premium(74)/* , new Commission() */)
const work_27_5p = new STO(new Put(work, 27.5, new Timestamp("Apr24'20")), null, 1, new Premium(101)/* , new Commission() */)

const trades = headerToTrades(header, work, apr24)
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

// console.log(trades)
prices.forEach(price => console.log(`price: ${price}\tPL: ${trades[2].getCurrentPL(price).toFixed(0)}`))
