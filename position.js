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
    calculateFinalPL() {
        if (this.open) {
            return 'this position is still open, use calculateCurrentPL'
        }
        return this.calculateCurrentPL()
    }

    /**
     * @todo put PL calculations into Trade.getPL(currMktPrice, style) { }
     * @param {*} currMktPrc 
     * @param {*} style 
     */
    calculateCurrentPL(curMktPrc, style = 'totalCash') {
        const openingContracts = this.openingTrade ? this.openingTrade.contracts : 1 // 1 is min anyways
        const closingContracts = this.closingTrade ? this.closingTrade.contracts : 1
        const openingPremium = this.openingTrade && this.openingTrade.getPremium()
        const openingCommission = this.openingTrade && this.openingTrade.getCommission()
        const closingPremium = this.closingTrade && this.closingTrade.getPremium()
        const closingCommission = this.closingTrade && this.closingTrade.getCommission()

        // give out total cash or PL per contract? Per contract is default
        const ocfactor = style === 'totalCash' ? openingContracts * 100 : openingContracts
        const ccfactor = style === 'totalCash' ? closingContracts * 100 : closingContracts
        // console.log(`name: ${this.openingTrade.getName()}\nopeningPremium: ${openingPremium}\nopeningCommission: ${openingCommission}\nopeningContracts: ${openingContracts}\nclosingPremium: ${closingPremium}\nclosingCommission: ${closingCommission}\nclosingContracts: ${closingContracts}`)
        if (isNaN(openingPremium) || isNaN(openingCommission)) {
            throw new Error(`Position.calculateCurrentPL: isNaN(openingPremium) || isNaN(openingCommission).\nname: ${this.openingTrade.getName()}\nopeningPremium: ${openingPremium}\nopeningCommission: ${openingCommission}`)
        }


        if (isNaN(closingPremium) || isNaN(closingCommission)) {
            // const currentResult = - openingPremium * ocfactor - openingCommission
            // return currentResult
            const openingTradePL = this.openingTrade.getCurrentPL(curMktPrc, style)
            // console.log('Position.calculateCurrentPL openingTradePL: ', openingTradePL)
            return openingTradePL
        }
        const finalResult = - (openingPremium + closingPremium) * ocfactor - (openingCommission + closingCommission) * ccfactor
        return finalResult
    }
}

module.exports = { Position }