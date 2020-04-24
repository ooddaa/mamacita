/**
 * @responsibility
 * Describes a lifecycle of a trading position.
 * 
 * @todo need to run checks:
 * isSTO(openingTrade) || isBTO(openingTrade)
 * isSTC(closingTrade) || isBTC(closingTrade)
 */
class Position {
    constructor(openingTrade/* : Trade */, closingTrade/* : Trade */) {
        this.openingTrade = openingTrade
        this.closingTrade = closingTrade
        /** 
         * @todo we need to know if this Position is an active/open or closed
         * 1. - if there's a closingTrade, then Position is closed
         * 2. - if openingTrade expired (it was an Option and current date > openingTrade.expiration)
         */
        this.open = !this.closingTrade ? true : false
    }
    /**
     * @todo PL can be calculated if Position is closed
     */
    calculateFinalProfitLoss() {
        if (!this.open) {
            return 'this position is still open, use calculateCurrentProfitLoss'
        }
        return this.calculateCurrentProfitLoss()
    }

    calculateCurrentProfitLoss() {
        const openingPremium = this.openingTrade && this.openingTrade.getPremium()
        const openingCommission = this.openingTrade && this.openingTrade.getCommission()
        const closingPremium = this.closingTrade && this.closingTrade.getPremium()
        const closingCommission = this.closingTrade && this.closingTrade.getCommission()
        if (isNaN(openingPremium) || isNaN(openingCommission) || isNaN(closingPremium) || isNaN(closingCommission)) {
            return 'WIP'
        }
        const result = - (openingPremium + closingPremium) * 100 - (openingCommission + closingCommission)
        return result
    }
}

module.exports = { Position }