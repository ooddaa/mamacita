// https://javascript.info/mixins
/**
 * Lots of stuff going on here. 
 * Basically I'm trying to create Class that would feature various methods from
 * other Classes (via 'extends' - works for one class only) and plain objects 
 * (via Object.assing(to, from)).
 * 
 * One of the plain objects - mixLol 'inherits' from mix_lol2.
 * Some other interesting luls going on 
 */
const mix = {
    lol() {
        console.log(`damn ${this.keke}`)
    },
}
const mix_lol2 = {
    lol2: function () {
        console.log(`damn ${this.keke}`)
    }
}
const mixLol = {
    __proto__: mix_lol2,
    'keke': 123,
    lol2() {
        super.lol2()
    }
}
Object.assign(mixLol, mix) // no problem

class MixinClass {
    constructor() {
        this.mixinClassMethod = function () {
            console.log('hi from mixinClassMethod')
        }
    }
}

Object.assign(mixLol, new MixinClass()) // no problem

class BaseClass {
    baseClassMethod() {
        console.log('hi from baseClassMethod')
    }
}
class Test extends BaseClass {
    constructor() {
        super()
        this.keke = 999
        this.lol = function () { console.log('Test.lol via constructor is persistent') }
    }
    lol2() {
        console.log('this gets overwritten')
    }
}
// will overwrite Test.lol with t.lol, but not props specified in constructor
Object.assign(Test.prototype, mixLol)
// new Test().baseClassMethod() // hi from baseClassMethod
// new Test().lol() // Test.lol via constructor is persistent
// new Test().lol2() // damn 999 
// new Test().mixinClassMethod() // 'hi from mixinClassMethod'
