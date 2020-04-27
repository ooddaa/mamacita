/**
 * Responsibility of this class is to harmonise representations of premium between IB and humans.
 * TWS displays negative premium when it is actually CASH ASSET for the trader! That's how Kat is
 * expressing it in gs. We need to have a way to talk of the same idea, but represent it correctly
 * in different situations.
 */
class Premium {
    constructor(premium/* : number */) {
        this.premium = premium
    }
    toString() {
        return Number(this.premium)
    }
}

/**
 * Same reason as for Premium class. 
 */
class Commission {
    constructor(commission/* : number */) {
        this.commission = commission
    }
    toString() {
        return Number(this.commission)
    }
}

/**
 * @responsibility Represents a trade. 
 */
class Trade {
    constructor(tradeType/* : 'STO'|'STC'|'BTO'|'BTC' */, instrument/* : Instrument */, date/* : Date */, contracts/* : number */, premium/* : Premium */, commission/* : Commission */, notes/* : string */) {
        this.tradeType = tradeType
        this.instrument = instrument
        this.date = date
        this.contracts = contracts || 1
        this.premium = premium || new Premium(0)
        this.commission = commission || new Commission(0)
    }
    getPremium() {
        return this.premium
    }
    getCommission() {
        return this.commission
    }
    getName() {
        return this.instrument.getName()
    }
}

/* aka short */
/**
 * @todo must check if instrument is an Option?
 */
class STO extends Trade {
    constructor(...args) {
        super('STO', ...args)
    }
    // =if(curMktPrc <= strike, premium, (strike-curMktPrc)*100+premium)
    /* 
        STO Call.
        if (currMktPrc <= Call.strike) {
            return Trade.getPremium() - Trade.getCommission()
        } else {
            Call.strike - currMktPrc * 100 + Trade.getPremium() - Trade.getCommission()
        }
    */
    getCurrentPL(curMktPrc, style = 'perContract' /* or 'totalCash' */) {
        if (!curMktPrc || isNaN(curMktPrc)) {
            throw new Error(`STO.getCurrentPL: first agrument (current market price of the underlying) must be number.\ncurMktPrc: ${JSON.stringify(curMktPrc)}`)
        }
        if (!this.instrument || isNaN(this.instrument.strike)) {
            throw new Error(`STO.getCurrentPL: cannot obtain this.instrument.strike.\nthis: ${JSON.stringify(this)}`)
        }
        if (curMktPrc <= this.instrument.strike) {
            const result = this.getPremium() - this.getCommission()
            return result
        } else {
            // this is how Kat thinks - if call is exercised, she is assigned 
            // stocks at strike * 100 - this is how much cash she needs to spend (aka exposure)
            // she's losing (strike - curMktPrc) * 100
            const result = (this.instrument.strike - curMktPrc) * 100 + this.getPremium() - this.getCommission()
            return result
        }
    }
}
/* aka unshort */
class STC extends Trade {
    constructor(...args) {
        super('STC', ...args)
    }
}
/* aka long */
class BTO extends Trade {
    constructor(...args) {
        super('BTO', ...args)
    }
}
/* aka unlong */
class BTC extends Trade {
    constructor(...args) {
        super('BTC', ...args)
    }
}

module.exports = {
    Premium,
    Commission,
    Trade,
    STO,
    STC,
    BTO,
    BTC
}