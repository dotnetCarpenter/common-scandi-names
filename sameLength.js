import util  from 'util'
import { S } from './sanctuary.js'
import names from './allLastNames.js'

const timeStart = tag => x => (console.time (tag), x)
const timeEnd = tag => x => (console.timeEnd (tag), x)

//    max :: Array (Array a) -> Integer
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

//    C :: (b -> c) -> Pair a b -> Pair c b
// TODO: find a function that does this
const C = f => pair => {
  const b = S.snd (pair)
  return S.Pair (f (b)) (b)
}

//    sameLength :: Pair Integer (Array (Array String)) -> Array (Array String)
const sameLength = S.pipe ([
  timeStart ('sameLength'),
  C (max),

  // Pad all arrays with empty string, so that all have have same length as
  // the max length `n`.
  S.pair (n => S.map (/** @param {array} array */array =>
    array.concat (Array.from (new Array (n - array.length)).fill (''))
  )),
  timeEnd ('sameLength')
])

//    padArray :: a -> Integer -> Array a -> Array a
const padArray = pad => n => (
  S.map (array => array.concat (Array.from (new Array (n - array.length)).fill (pad)))
)

//    sameLength_ :: Array (Array String) -> Array (Array String)
const sameLength_ = S.pipe ([
  timeStart ('sameLength_'),

  S.ap (S.flip (padArray ('')))
       (max),

  timeEnd ('sameLength_')
])


const printAll = {
  // maxArrayLength: 1034,
  // maxStringLength: 20000,
  colors: true
}

// pretty print
const print = S.pipe ([
  a => ({ ...a }),
  x => util.inspect (x, printAll),
  console.log
])

const result2 = sameLength_ (names)
// print (result2)

const result1 = sameLength (S.Pair (0) (names))
// print (result1)
