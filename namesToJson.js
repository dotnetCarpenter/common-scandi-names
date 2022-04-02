import { S, F } from './sanctuary.js'
import fetch    from 'node-fetch'

const baseUrl = language => `https://github.com/OpenXcom/OpenXcom/raw/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')

//    tagByF :: (a -> Boolean) -> a -> Future e a
const tagByF = f => x => f (x)
  ? F.resolve (x)
  : F.reject  (x)

//    request :: String -> Future e a
const request = S.pipe ([
  F.encaseP (fetch),
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => response.text ())),
  S.join,
])

//    read :: Future e Response -> StrMap
// const read = S.pipe ([
//   // S.map ()
// ])

const cancel = F.fork (console.error)
                      (console.log)
                      (request (swedishUrl))
