const { Stock, Call, Put } = require('./instrument')
const { Position } = require('./position')
const { Premium, Commission, STO, BTO, STC, BTC } = require('./trade')
const { Timestamp } = require('./timestamp')

/**
 *
 * Description:
 * Kat needs a tool that helps her do quick calculation and visual representation
 * of P/L on her current put/call portfolio. Once she has noticed that market is
 * moving out of her preferred corridor, she wants to do a quick what-if analysis.
 * Analysis consists of her adding a provisional trade (short*long * put*call)
 * 
 * One of the main goals of this toolbox is to allow the trader easy access to his
 * trade decision history. Trader can go back in time and iteratively adjust her
 * knowledge of the strategy she's developing.
 * 
 * Therefore it is practical to keep historicalData for an Instrument (some data 
 * that Trader was using when making the trade). This data are personal to Trader,
 * it is not all available market data, but only those that were used by this 
 * particular Trader this particular time to make that particular decision * by
 * Trader's opinion on how important it is to keep that data stored for future 
 * learning.
 * 
 * Position(from_trade: Trade) // is open if STO/BTO, closed if STC/BTC
 * 
 * Instrument(void)
    * Option(und: Underlying, strike: number, exp: Expiration)
        * Put
        * Call
        * Spread

 * Position is created by Trade
 * 
 * Sell(premium_in: number)
 * Buy(premium_out: number)
 *
 * ToOpen(void)
 * ToClose(closed_position: Position)
 * 
 * Trade(instrument: Instrument, premium: number, commission: number)
 *  STO - mixin Sell && ToOpen
 *  STC - mixin Sell && ToClose
 *  BTO - mixin Buy && ToOpen
 *  BTC - mixin Buy && ToClose
 *
 *
 * 
 * short put == sell to open STO 
 * long put == buy to open BTO 
 * 
 * short call == STO
 * long call == BTO
 * 
 * ??? does it mean that I need to specify which instrument I am closing (STC/BTC) ?
 * 
 * BTC	Buy To Close
 * BTO	Buy To Open
 * STO	Sell To Open
 * STC	Sell To Close
 * 
 * BCC	Bought Call to Close
 * BCO	Bought Call to Open
 * ITM	in-the-money
 * OTM	out-the-money
 * ATM	at-the-money
 * CP	Close Price
 * Complex 	Complex position (spreads ect)
 * 
 * @example x Short(Put, STO)
 * @example x ToOpen(Put, 'sell')
 * @example x ToOpen(Short(Put))
 * @example STO(Put|Call)
 * @example STC(Put|Call, Put_to_close|Call_to_close) ???
 * @example BTO(Put|Call)
 * @example BTC(Put|Call, Put_to_close|Call_to_close) ???
 */

// Underlying	Underlying price	Date for the entry	Time for the entry	Type of the Entry	Strategy	Call/Put	                Premium	Commission
// WORK	        26.93	            22/04/2020	        12:16:44	        STO	                Call	    -1 WORK Apr24'20 26.5C ITM	-1.05	0.25

// const work_call = new Call(new Stock('WORK', 26.93), 26.5, '200424')
// const work_sto = new STO(work_call, new Date(2020, 3, 22, 13, 16, 44 /* '22/04/2020', '12:16:44' */), 1, new Premium(-1.05), new Commission(0.25))
// const work = new Position(work_sto)
// // console.log(work)
// const work_pl = work.calculateCurrentPL()
// console.log(work_pl)

// // AMD	55.34	15/04/2020	20:04:11	STO	Put	-1  AMD Apr24'20 54P     OTM	        -1.64	1.58
// // AMD	57.08	17/04/2020	15:41:56	BTC	        AMD Apr24'20 54P     ITM	66.33	0.95	1.09

// const amd_put = new Put(new Stock('AMD', 55.34), 54, new Timestamp("Apr24'20"))
// const amd_sto = new STO(amd_put, new Timestamp("15/04/2020", "20:04:11"), 1, -1.64, 1.58, "AMD	55.34	15/04/2020	20:04:11	STO	Put	-1  AMD Apr24'20 54P     OTM	        -1.64	1.58")
// const amd_btc = new BTC(amd_put, new Timestamp("17/04/2020", "15:41:56"), 1, 0.95, 1.09, "AMD	57.08	17/04/2020	15:41:56	BTC	        AMD Apr24'20 54P     ITM	66.33	0.95	1.09")
// const amd = new Position(amd_sto, amd_btc)
// const amd_pl1 = amd.calculateFinalPL()
// const amd_pl2 = amd.calculateCurrentPL()
// console.log(amd_pl1 == 'this position is still open, use calculateCurrentPL')
// console.log(amd_pl2)
// console.log(amd_pl2 == 66.33)
// // console.log(amd)

const work = new Stock('WORK', 25)
const apr24 = new Timestamp("Apr24'20")
const work_27c = new Call(work, 27, apr24),
    work_27p = new Put(work, 27, apr24),
    work_27_5p = new Put(work, 27.5, apr24)
// console.log(work_27c, work_27p, work_27_5p)
const work_27c_sto = new STO(work_27c, null, 1, new Premium(42)/* , new Commission() */)
const w = new Position(work_27c_sto)
// console.log(w)
// console.log(w.calculateCurrentPL(28, 'totalCash'))
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

prices.forEach(price => console.log(`price: ${price}\tPL: ${w.calculateCurrentPL(price).toFixed(0)}`))