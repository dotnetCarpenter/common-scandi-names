// @ts-check

import util         from 'util'
import { F, S, $ }  from './sanctuary.js'
import parser       from './parser.js'
import {
  request,
  preflight,
  responseToStream,
  responseToText,
  responseToHeaders
}                   from './request.js'

const trace = msg => x => (console.debug (msg, util.inspect (x, {
  maxArrayLength: 1034,
  maxStringLength: 20000,
  colors: false
})), x)
const timeStart = tag => x => (console.time (tag), x)
const timeEnd   = tag => x => (console.timeEnd (tag), x)

// https://github.com/faker-js/faker/blob/main/src/locales/nb_NO/name/last_name.ts
// https://github.com/faker-js/faker/blob/main/src/locales/sv/name/last_name.ts

//    baseUrl :: String -> String
const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`

//    options :: String -> Object
const options = url => ({
  redirect: 'follow',
  url: url,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-256'
  // }
})

//    max :: Array (Array a) -> Integer
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

//    padArray :: a -> Integer -> Array (Array a) -> Array (Array a)
const padArray = pad => n =>
  S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (pad)))

//    sameLength :: Array (Array String) -> Array (Array String)
const sameLength = S.ap (S.flip (padArray ('&nbsp;'))) (max)

//    zip3 :: Array a -> Array a -> Array a -> Array (Array a)
const zip3 = a1 => a2 => a3 => (
  S.zipWith
    (a => b => [a, ...b])
    (a1)
    (S.zipWith (a => b => [a, b])
               (a2)
               (a3))
)

/**   fetch :: Future e a -> String -> Future e a */
const fetch = transformer => S.pipe ([baseUrl, options, request, transformer])

/**   parse :: String -> Maybe (Array String) */
const parse = S.pipe ([
  timeStart ('parser'),
  parser,
  timeEnd ('parser'),
  S.get (S.is ($.Array ($.String))) ('maleLast'),
  S.map (S.sort),
])

/**   lastNames :: Array String -> Future String (Array Maybe String) */
const lastNames = S.pipe ([
  S.map (fetch (responseToText)),
  S.map (S.map (parse)),
  F.parallel (3)
])

/**   column3 :: Array (Array String) -> Array String */
const column3 = S.pipe ([
  timeStart ('column3'),
  sameLength,
  as => zip3 (as[0]) (as[1]) (as[2]),
  timeEnd ('column3'),
])

/**   iteratorToArray :: Iterator a a -> Array a */
const iteratorToArray = it => S.join ([...it])
/**   iteratorToTuples :: Iterator a a -> Array (Array a) */
const iteratorToTuples = Array.from //it => [...it]
/**   tuplesToPairs :: Array (Array a) -> Array (Pair a a) */
const tuplesToPairs = S.map (([fst, snd]) => S.Pair (fst) (snd))
/**   iteratorToPairs :: Iterator a a -> Array (Pair a a) */
const iteratorToPairs = S.compose (tuplesToPairs)
                                  (iteratorToTuples)


const headers = S.pipe ([
  S.map (fetch (responseToHeaders)),
  F.parallel (3),
])

const formatHeaders = S.pipe ([
  // unpack
  S.map (iteratorToTuples),
  S.join,
  // remove duplicates
  S.sort,
  S.groupBy (S.equals),
  S.map (S.compose (S.map (S.prepend ('&nbsp;')))
                   (S.head)),
])

const files = ['Danish', 'Swedish', 'Norwegian']
const cancel = (
  F.forkCatch (e => console.error (`Fatal Error: ${e.message}\n${e.stack}`))
              (console.error)
              (S.pipe ([
                // before print for headers (files)
                // formatHeaders,

                // always needed
                S.sequence (S.Maybe), // Array (Maybe (Array String))

                // before print for lastNames (files)
                S.map (column3),

                trace ('render:\n'),
              ]))
              // (headers (files))
              (lastNames (files))
)
// setTimeout (cancel, 210)
