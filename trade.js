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
}

/**
 * Same reason as for Premium class. 
 */
class Commission {
    constructor(commission/* : number */) {
        this.commission = commission
    }
}

/**
 * @responsibility Represents a trade. 
 */
class Trade {
    constructor(tradeType/* : 'STO'|'STC'|'BTO'|'BTC' */, instrument/* : Instrument */, date/* : Date */, contracts/* : number */, premium/* : Premium */, commission/* : Commission */, notes/* : string */) {
        this.instrument = instrument
        this.date = date
        this.contracts = contracts
        this.premium = premium
        this.commission = commission
        this.tradeType = tradeType
    }
    getPremium() {
        return this.premium
    }
    getCommission() {
        return this.commission
    }
}

/* aka short */
class STO extends Trade {
    constructor(...args) {
        super('STO', ...args)
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