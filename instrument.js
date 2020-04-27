/**
 * @responsibility Base class for all instruments (Stocks, Options, Bonds etc)
 */
class Instrument {
    constructor(name/* : string */, historicalData/*? : any[] */) {
        this.name = name            // contractSymbol for options, ticker for Stocks etc
        this.historicalData = []    // may contain background data upon which decisions were made
    }
    getName() {
        return this.name
    }
}

/**
 * @responsibility Describes a Stock at the moment of the trade. 
 */
class Stock extends Instrument {
    constructor(ticker/* : string */, price/* : number */) {
        super(String(ticker))
        this.price = price          // price at the moment of trade
        this.currentMktPrc = null
    }
    setCurrentMktPrc(price/* : number */) {
        this.currentMktPrc = price
    }
}

/**
 * @responsibility Describes an Option. 
 */
class Option extends Instrument {
    constructor(type/* : 'P' | 'C' */, und/* : Instrument */, strike/* : number */, exp/* : Timestamp */) {
        const contractSymbol = `${und.getName()}${exp.toString('option_cs')}${type}${strikeToCS(strike)}`
        super(contractSymbol)
        this.type = type
        this.und = und
        this.strike = strike
        this.expiration = exp
    }
}

/**
 * @responsibility Represents a Put option.
 */
class Put extends Option {
    constructor(und/* : Instrument */, strike/* : number */, exp/* : Timestamp */) {
        super('P', und, strike, exp)
    }
}

/**
 * @responsibility Represents a Call option.
 */
class Call extends Option {
    constructor(und/* : Instrument */, strike/* : number */, exp/* : Date */) {
        super('C', und, strike, exp)
    }
}

/**
         * https://query2.finance.yahoo.com/v7/finance/options/nvda
         * need to construct Option name ie contractSymbol
         * NVDA200424C00105000
         * ticker + day + month + year + type + 8 digits
         * 1 10,000
         * 2 1,000  thousand dollars
         * 3 100    hundred dollars
         * 4 10     deci-dollars
         * 5 1      dollars
         * 6 0.1    deci-cents
         * 7 0.01   cents
         * 8 0.001
         */
function strikeToCS(strike) {
    const result = [0, 0,/* 2 $100 */0, /* 3 $10 */ 0,/* 4 $1 */0, /* 5 $.1 */ 0, 0, 0]
    // const strikeArr = String(strike).split('')
    if (strike < 1) /* goes to result[5] */ {
        const strikeArr = String(strike).replace(/\./, '').split('')
        result[5] = strikeArr[0]
        result[6] = strikeArr[1] || 0
    } else if (strike < 10) /* goes to result[4] */ {
        const strikeArr = String(strike).replace(/\./, '').split('')
        result[4] = strikeArr[0]
        result[5] = strikeArr[1] || 0
        result[6] = strikeArr[2] || 0
    } else if (strike < 100) /* goes to result[3] */ {
        const strikeArr = String(strike).replace(/\./, '').split('')
        result[3] = strikeArr[0]
        result[4] = strikeArr[1] || 0
        result[5] = strikeArr[2] || 0
        result[6] = strikeArr[3] || 0
    }
    return result.join('')
}

module.exports = { Stock, Option, Put, Call }