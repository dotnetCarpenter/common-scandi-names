import 'normalize.css'
import '../style.css'

import { F, S }      from './sanctuary.js'
import {
  request,
  responseToText,
  responseToHeaders
}                    from './request.js'
import parser        from './parser.js'
import doT           from 'dot'


const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl   = baseUrl ('Swedish')
const danishUrl    = baseUrl ('Danish')
const norwegianUrl = baseUrl ('Norwegian')

//    fetchData :: StrMap -> Future String String
const fetchData = S.compose (responseToText)
                            (request)

const options = {
  redirect: 'follow',
  method: 'GET',
  // headers: { range: 'bytes=0-127' }
}

//    fetchDanishNames :: Future String String
const fetchDanishNames = fetchData (Object.assign ({url: danishUrl}, options))

//    fetchSwedishNames :: Future String String
const fetchSwedishNames = fetchData (Object.assign ({url: swedishUrl}, options))

//    fetchNorwegianNames :: Future String String
const fetchNorwegianNames = fetchData (Object.assign ({url: norwegianUrl}, options))

//    fetchHeaders :: Future String String
const fetchHeaders = (
  S.compose (responseToHeaders)
            (request)
            ({
              redirect: 'follow',
              url: danishUrl,
              method: 'HEAD'
            })
)

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

//-------------- DOM code --------------

const appHtml       = document.getElementById ('app')
const fetchButton   = appHtml.querySelector   ('#fetch')
const headersButton = appHtml.querySelector   ('#head')
const cancelButton  = appHtml.querySelector   ('#cancel-fetch')
const resultPre     = appHtml.querySelector   ('#result')
const rows          = appHtml.querySelector   ("#rows")

//    renderRows :: Array -> Html
const renderRows = doT.template (document.getElementById ("rowTmpl").textContent)

//    displayNames :: Array String -> Void
const displayNames = S.pipe ([
  // TODO: S.prop ('maleLast') is not safe use S.get :: Maybe String instead
  S.map (S.pipe ([parser, S.prop ('maleLast'), S.sort])),

  sameLength,

  as => zip3 (as[0]) (as[1]) (as[2]),

  names => {
    rows.innerHTML = renderRows (names)
  }
])

//    displayHeaders :: String -> Void
const displayHeaders = data => {
  resultPre.textContent = data
}

//    consume :: (a -> Any) -> Future e a
const consume = (
  F.forkCatch (e => resultPre.textContent = `Fatal Error: ${e.message}\n${e.stack}`)
              (error => { resultPre.textContent = `Error: ${error}` })
)

//  activateCancelButton :: Array (Future String String) -> Void
const activateCancelButton = f => futures => (
  cancelButton.onclick = (
    consume (f)
            (F.parallel (3) (futures))
  )
)

fetchButton.addEventListener ('click', () => {
  activateCancelButton (displayNames) ([
    fetchDanishNames,
    fetchSwedishNames,
    fetchNorwegianNames
  ])
})

headersButton.addEventListener ('click', () => {
  activateCancelButton (displayHeaders) ([fetchHeaders])
})
