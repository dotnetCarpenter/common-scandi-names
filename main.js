import util     from 'util'
import { S, F } from './sanctuary.js'
import parser   from './parser.js'
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}               from './request.js'


const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`

const doPreflight = S.compose (responseToHeaders) (preflight)
const getText     = S.compose (responseToText)    (request)
const getHeaders  = S.compose (responseToHeaders) (request)

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

const cancel = (
  F.forkCatch (e => console.error (`Fatal Error: ${e.message}\n${e.stack}`))
              (console.error)
              (S.pipe ([
// TODO: S.prop ('maleLast') is not safe use S.get :: Maybe String instead
                S.map (S.pipe ([parser, S.prop ('maleLast'), S.sort])),
                sameLength,
                as => zip3 (as[0]) (as[1]) (as[2]),

                x => (console.log (util.inspect (x, {
                  maxArrayLength: 1034,
                  maxStringLength: 20000,
                  colors: true
                })), x),
                // JSON.stringify,
                // console.log,
              ]))
              (F.parallel (3)
                          ([
                            fetchDanishNames,
                            fetchSwedishNames,
                            fetchNorwegianNames
                          ]))
)

// cancel ()
