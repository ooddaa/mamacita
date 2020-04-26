//////////////////// FUN ////////////////////
function compose2(fn2, fn1) {
    return function composedFn(arg) {
        return fn2(fn1(arg))
    }
}
function composer(...fns) {
    return function composed(result) {
        const list = [...fns]
        while (list.length > 0) {
            result = list.pop()(result)
        }
        return result
    }
}
function firstElement(arr/* : array */) {
    if (!Array.isArray(arr)) {
        throw new Error(`firstElement: arr must be an array.\narr: ${JSON.stringify(arr)}`)
    }
    return arr[0]
}
function isNumber(val/* : any */)/* : boolean */ {
    return typeof val === 'number' && !isNaN(val) && val !== ''
}

const composedIsNumber = compose2(isNumber, firstElement)
const IsNumberComposer = composer(isNumber, firstElement)

// const hm = IsNumberComposer([1])
// console.log(hm)

//////////////////// END ////////////////////
const t = [[1],
[2],
[3],
[4],
[5],
[6],
[7],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
[''],
['']]
    // .filter(isNumber)
    // .filter(composedIsNumber)
    .filter(IsNumberComposer)
// console.log(t)
const sl = t.slice(3, t.length)
console.log(sl)
console.log(t)
