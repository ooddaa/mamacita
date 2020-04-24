/* @flow */
const range = require('lodash/range')
const util = require('util')
const log = (...items/* : any */) =>
    items.forEach(item =>
        console.log(util.inspect(item, { depth: null, colors: true }))
    );











