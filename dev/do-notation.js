import { S }    from './sanctuary.js'
import Do       from 'lazy-do'
import Identity from 'sanctuary-identity'

const test = Do (function* () {
  let word1 = yield S.of (Identity) ('hello')
  let word2 = yield S.of (Identity) (`${word1} `)
  let word3 = yield S.of (Identity) (`${word2}world`)

  return S.of (Identity) (`${word3}!`)
}, Identity)

const result = S.extract (test)
console.log (test) // -> Identity ("hello world!")
console.log (result) // -> hello world!
