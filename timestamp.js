/**
 * @responsibility 
 * Takes care of dates: 
 * Apr24'20         mmmdd_yy_style
 * '24/04/2020'     ddmmyyyy_style
 * '200424'         yymmdd_style  
 * 
 * and time '12:16:44'
 */
class Timestamp {
    constructor(date/* : string */, time/* : string */) {
        this.date/* : Date */ = this.parseDate(date)
        this.time = time
    }
    parseDate(date) {

        // Apr24'20
        function mmmdd_yy_style(date) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            // does it contain a short string name of the month?
            if (!months.reduce(hasMonth, false)) { return { success: false, data: null } }

            // length == 8 ? wrong format
            if (date.length !== 8) {
                throw new Error(`Timestamp.parseDate.mmmdd_yy_style: date is in wrong format. Must be Mmmdd'yy.\ndate: ${date}`)
            }

            // does not have \' ? wrong format
            if (!date.includes("'")) {
                throw new Error(`Timestamp.parseDate.mmmdd_yy_style: date is in wrong format. Must be Mmmdd'yy.\ndate: ${date}`)
            }

            let [month, day, year] = [
                months.findIndex(month => month === date.slice(0, 3)), // this will be for new Date()
                Number(date.slice(3, 5)),
                Number(date.slice(6, 8))
            ]

            /* adjustments to pass validations */
            month += 1,
                year += 2000
            // console.log(month, day, year)
            if (!withinMonthRange(month)) {
                throw new Error(`Timestamp.parseDate.mmmdd_yy_style: month is not within range.\nmonth: ${month}\ndate: ${date}`)
            }
            if (!withinYearRange(year)) {
                throw new Error(`Timestamp.parseDate.mmmdd_yy_style: year is not within range.\nyear: ${year}\ndate: ${date}`)
            }
            if (!withinDayRange(day, month, year)) {
                throw new Error(`Timestamp.parseDate.mmmdd_yy_style: day is not within range.\nday: ${day}\ndate: ${date}`)
            }
            // console.log('mmmdd_yy_style: ', result)
            return { success: true, data: new Date(year, month - 1, day + 1) }

            //////////////////// FUN ////////////////////
            function hasMonth(acc, month) {
                if (acc) return acc // exit if we matched a month
                return date.includes(month)
            }
            //////////////////// FUN ////////////////////
        }

        // '24/04/2020'
        function ddmmyyyy_style(date) {
            let result = false
            // must contain 2 slashes
            if (!hasTwoSlashes(date)) { return { success: false, data: null } }

            let [day, month, year] = date.split("/").map(Number)
            if (!withinMonthRange(month)) {
                throw new Error(`Timestamp.parseDate.ddmmyyyy_style: month is not within range.\nmonth: ${month}\ndate: ${date}`)
            }
            if (!withinYearRange(year)) {
                throw new Error(`Timestamp.parseDate.ddmmyyyy_style: year is not within range.\nyear: ${year}\ndate: ${date}`)
            }
            if (!withinDayRange(day, month, year)) {
                throw new Error(`Timestamp.parseDate.ddmmyyyy_style: day is not within range.\nday: ${day}\ndate: ${date}`)
            }
            // console.log('ddmmyyyy_style: ', result)
            return { success: true, data: new Date(year, month - 1, day + 1) }
        }

        // '200424'
        function yymmdd_style(date) {
            let result = false
            // no '/'?/only numbers?
            if (!containsOnlyNumbers(date)) { return { success: false, data: null } }

            // length == 6?
            if (date.length !== 6) { return { success: false, data: null } }

            // check ranges 
            let [year, month, day] = [date.slice(0, 2), date.slice(2, 4), date.slice(4)]
            year = Number(year) + 2000,
                month = Number(month),
                day = Number(day)

            // lets start with month
            if (!withinMonthRange(month)) {
                throw new Error(`Timestamp.parseDate.yymmdd_style: month is not within range.\nmonth: ${month}\ndate: ${date}`)
            }

            // validate year
            if (!withinYearRange(year)) {
                throw new Error(`Timestamp.parseDate.yymmdd_style: year is not within range.\nyear: ${year}\ndate: ${date}`)
            }

            // validate date
            if (!withinDayRange(day, month, year)) {
                throw new Error(`Timestamp.parseDate.yymmdd_style: day is not within range.\nday: ${day}\ndate: ${date}`)
            }

            return { success: true, data: new Date(year, month - 1, day + 1) }
            //////////////////// FUN ////////////////////
            function containsOnlyNumbers(str) { return /^\d+$/.test(str) }
            //////////////////// END ////////////////////
        }


        const result = [mmmdd_yy_style, ddmmyyyy_style, yymmdd_style].map(fn => fn(date))
        // console.log(result)
        // maximum one must be true
        const recognized = result.filter(findSuccessfulMatches)
        if (recognized.length > 1) {
            throw new Error(`Timestamp.parseDate.: more than one type of date is recognized.\nresult: ${result}\ndate: ${date}`)
        } else if (recognized.length === 0) {
            throw new Error(`Timestamp.parseDate.: date is not recognized.\nresult: ${result}\ndate: ${date}`)
        }
        return recognized[0]

        //////////////////// FUN ////////////////////
        function hasSlash(symbol) { return symbol === '/' }
        function hasTwoSlashes(date) {
            return date.split('').filter(hasSlash).length == 2
        }
        function withinMonthRange(month/* : number */, from/* : number */ = 0, to = 12/* : number */)/* : boolean */ {
            return month > from && month <= to
        }
        function withinYearRange(year/* : number */, from = 1900/* : number */, to = 2100/* : number */)/* : boolean */ {
            return year > from && year <= to
        }
        function withinDayRange(day/* : number */, month/* : number */, year/* : number */)/* : boolean */ {
            return day > 0 && day <= daysInMonth({ year, month })

            function isLeapYear(year) {
                return range(1980, 2080, 4).includes(year);
            }
            function daysInMonth({ year, month })/* : Number */ {
                const mapping = {
                    1: () => 31, // January
                    2: year => isLeapYear(year) ? 29 : 28,
                    3: () => 31,
                    4: () => 30,
                    5: () => 31,
                    6: () => 30,
                    7: () => 31,
                    8: () => 31,
                    9: () => 30,
                    10: () => 31,
                    11: () => 30,
                    12: () => 31
                };
                return mapping[month](year);
            }
        }
        function findSuccessfulMatches({ success }/* : { success: boolean } */)/* : boolean */ {
            return success === true
        }
        //////////////////// END ////////////////////
    }
    toString(style) {
        // console.log('Timestamp.toString()')
        if (style === 'option_cs') {
            // console.log('Timestamp.toString() style === option_cs')
            // console.log(this.date.data) // 2020-04-24T23:00:00.000Z
            let year = this.date.data.getFullYear() - 2000
            let month = this.date.data.getMonth() + 1
            let day = this.date.data.getDate() - 1
            const [yyyy, mm, dd] = [
                year,
                month < 10 ? `0${month}` : month,
                day < 10 ? `0${day}` : day
            ].map(String)

            const result = [yyyy, mm, dd].join('')
            return result
        }
    }
}

const timestp1 = new Timestamp("Apr24'20" /* '24/04/2020' */ /* '200424' */)
const timestp2 = new Timestamp(/* "Apr24'20" */ '24/04/2020' /* '200424' */)
const timestp3 = new Timestamp(/* "Apr24'20" */ /* '24/04/2020' */ '200424')

// console.log(timestp1.date.data.valueOf() === timestp2.date.data.valueOf() && timestp2.date.data.valueOf() === timestp3.date.data.valueOf())

module.exports = { Timestamp }