import util  from 'util'
import { S } from './sanctuary.js'
import names from './allLastNames.js'

const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

//    C :: (b -> c) -> Pair a b -> Pair a c
// TODO: find a function that does this
const C = f => pair => {
  const b = S.snd (pair)
  return S.Pair (f (b)) (b)
}

//    sameLength :: Pair Integer (Array (Array String)) -> Array (Array String)
const sameLength = S.pipe ([
  C (max),

  // Pad all arrays with empty string, so that all have have same length as
  // the max length `n`.
  S.pair (n => S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (''))
  )),
])

// pretty print
const print = S.pipe ([
  a => ({ ...a }),
  x => util.inspect (x, {
    maxArrayLength: 1034,
    maxStringLength: 20000,
    colors: true
  }),
  console.log
])

print (sameLength (S.Pair (0) (names)))
