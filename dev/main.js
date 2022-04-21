import util     from 'util'
import Identity from 'sanctuary-identity'
import { S, F } from './sanctuary.js'
import parser   from './parser.js'
import {
  request,
  preflight,
  responseToStream,
  responseToText,
  responseToHeaders
}               from './request.js'

/**
 * @template L,R
 * @typedef { import("fluture").FutureInstance<L,R> } Future
 */

//    max :: Array (Array a) -> Integer
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

//    padArray :: a -> Integer -> Array (Array a) -> Array (Array a)
const padArray = pad => n =>
  S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (pad)))

//    sameLength :: Array (Array String) -> Array (Array String)
const sameLength = S.ap (S.flip (padArray (''))) (max)

//    zip3 :: Array a -> Array a -> Array a -> Array (Array a)
const zip3 = a1 => a2 => a3 => (
  S.zipWith
    (a => b => [a, ...b])
    (a1)
    (S.zipWith (a => b => [a, b])
               (a2)
               (a3))
)

const trace = msg => x => (console.debug (msg, x), x)

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`

const doPreflight = S.compose (responseToHeaders) (preflight)
const getText     = S.compose (responseToText)    (request)
const getHeaders  = S.compose (responseToHeaders) (request)
const getStream   = S.compose (responseToStream)  (request)


const options = url => ({
  redirect: 'follow',
  url: url,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-256'
  // }
})

const fetchDanishNames = getText (options (baseUrl ('Danish')))
const fetchSwedishNames = getText (options (baseUrl ('Swedish')))
const fetchNorwegianNames = getText (options (baseUrl ('Norwegian')))

const print = x => (console.log (util.inspect (x, {
  maxArrayLength: 1034,
  maxStringLength: 20000,
  colors: true
})), x)

const timeStart = tag => x => (console.time (tag), x)
const timeEnd   = tag => x => (console.timeEnd (tag), x)

const cancel = (
  F.forkCatch (e => console.error (`Fatal Error: ${e.message}\n${e.stack}`))
              (console.error)
              (S.pipe ([
                S.map (S.pipe ([
                  timeStart ('parser'),
                  parser,
                  timeEnd ('parser'),
                  S.prop ('maleLast'), // TODO: not safe use S.get :: Maybe String instead
                  S.sort
                ])),
                sameLength,
                as => zip3 (as[0]) (as[1]) (as[2]),
                print,
              ]))
              (F.parallel (3)
                          ([
                            fetchDanishNames,
                            fetchSwedishNames,
                            fetchNorwegianNames
                          ]))
)

// setTimeout (cancel, 210)
