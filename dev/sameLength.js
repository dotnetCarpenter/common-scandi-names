import util  from 'util'
import { S } from './sanctuary.js'
import names from './allLastNames.js'


//    max :: Array (Array a) -> Integer
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

//    C :: (b -> c) -> Pair a b -> Pair c b
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

// [[1,1,1,1],[2,2,2,2],[3,3,3,3]] -> [[1,2,3],[1,2,3],[1,2,3],[1,2,3]]
//    partition :: Array (Array a) -> Array (Array a)
const partition = (arrays, accu = []) => {
  if (arrays[0].length === 0) return accu

  const part = []
  for (var i = 0; i < arrays.length; ++i) {
    part.push (arrays[i].splice (0, 1)[0])
  }

  accu.push (part)

  return partition (arrays, accu)
}

// array :: b -> (a -> Array a -> b) -> Array a -> b

// const part = S.array (head => tail => S.concat (head) (part (tail))) ([])
// console.log (part ([1,1,1,1]))

// [[1,1,1,1],[2,2,2,2],[3,3,3,3]] -> [[1,2,3],[1,2,3],[1,2,3],[1,2,3]]
// zipWith :: (a -> b -> c) -> Array a -> Array b -> Array c

//    zip3 :: Array a -> Array a -> Array a -> Array (Array a)
const zip3 = a1 => a2 => a3 => (
  S.zipWith
    (a => b => [a, ...b])
    (a1)
    (S.zipWith (a => b => [a, b])
               (a2)
               (a3))
)

//    zip3_ :: Array a -> Array a -> Array a -> Array (Array a)
const zip3_ = ([a, ...as]) => ([b, ...bs]) => ([c, ...cs]) => {
  if (([a,b,c]).some (x => x == null) ) return []

  return S.concat ([[a, b, c]]) (zip3_ (as) (bs) (cs))
}

//    zip3__ :: Array a -> Array a -> Array a -> Array (Array a)
const zip3__ = as => bs => cs => {
  const a = as[0], b = bs[0], c = [cs[0]]
  if (([a,b,c]).some (x => x == null) ) return []

  return S.concat ([[a, b, c]]) (zip3_ (as.slice (1)) (bs.slice (1)) (cs.slice (1)))
}

// const zipA = S.zipWith (a => b => [a, ...b])
// //    zipAll :: Array (Array a) -> Array (Array a)
// const zipAll = arrays => {
//   S.reduce (f => a =>
//               f (a))
//            (S.zipWith (a =>
//               b =>
//                 [a, b]))
//            (arrays)
// }

//    padArray :: a -> Integer -> Array (Array a) -> Array (Array a)
const padArray = pad => n =>
  S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (pad)))

//    sameLength_ :: Array (Array String) -> Array (Array String)
const sameLength_ = S.ap (S.flip (padArray (''))) (max)


const printAll = {
  // maxArrayLength: 1034,
  // maxStringLength: 20000,
  colors: true
}

// pretty print
const print = S.pipe ([
  // a => ({ ...a }),
  // x => util.inspect (x, printAll),
  console.log
])

console.time ('sameLength')
const result1 = sameLength (S.Pair (0) (names))
console.timeEnd ('sameLength')
// print (result1)

// console.log (partition ([[1,1,1],[2,2,2],[3,3,3]]))

console.time ('sameLength_')
const result2 = sameLength_ (names)
console.timeEnd ('sameLength_')
// const print1 (result21)

const result3 = sameLength_ (names)
console.time ('partition')
const result31 = partition (result3)
console.timeEnd ('partition')
// print (result31)

const result4 = sameLength_ (names)
console.time ('zip3')
const result41 = zip3 (result4[0]) (result4[1]) (result4[2])
console.timeEnd ('zip3')
print (result41)

const result5 = sameLength_ (names)
console.time ('zip3_')
// const result51     = zip3_ ([1,1,1,1]) ([2,2,2,2]) ([3,3,3,3]) // -> [[1,2,3],[1,2,3],[1,2,3],[1,2,3]]
// result5     = zip3_ (names[0]) (names[1]) (names[2]) // will give 31 because of amount of swedish last names
const result51 = zip3_ (result5[0]) (result5[1]) (result5[2])
console.timeEnd ('zip3_')
// print (result51)

const result6 = sameLength_ (names)
console.time ('zip3__')
const result61 = zip3__ (result6[0]) (result6[1]) (result6[2])
console.timeEnd ('zip3__')
// print (result61)
