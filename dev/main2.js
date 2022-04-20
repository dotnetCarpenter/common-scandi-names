// @ts-check

import util         from 'util'
import { S, F, $ }  from './sanctuary.js'
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
  colors: true
})), x)

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

/**   get :: String -> Future String String */
const get = S.pipe ([baseUrl, options, request, responseToText])

/**   parse :: String -> Maybe (Array String) */
const parse = S.pipe ([
  parser,
  S.get (S.is ($.Array ($.String))) ('maleLast'),
  S.map (S.sort),
])

/**   lastNames :: Array String -> Future String (Array Maybe String) */
const lastNames = S.pipe ([
  S.map (get),
  S.map (S.map (parse)),
  F.parallel (3)
])

/**   render :: Array (Array String) -> Array String */
const render = S.pipe ([
  sameLength,
  as => zip3 (as[0]) (as[1]) (as[2]),
])

Object.defineProperty (parse, 'name', { value: 'parse' })
Object.defineProperty (lastNames, 'name', { value: 'lastNames' })
Object.defineProperty (render, 'name', { value: 'render' })


const files = ['Danish', 'Swedish', 'Norwegian']
const cancel = (
  F.forkCatch (e => console.error (`Fatal Error: ${e.message}\n${e.stack}`))
              (console.error)
              (S.pipe ([
                S.sequence (S.Maybe),// Array (Maybe (Array String))
                S.map (render),      // Maybe (Array (Array String))
                S.map (trace ('after render')),
              ]))
              (lastNames (files))
)
