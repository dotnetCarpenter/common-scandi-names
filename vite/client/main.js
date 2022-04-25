import 'normalize.css'
import '../style.css'

import { F, S, $ }   from './sanctuary.js'
import {
  request,
  responseToText,
  responseToHeaders
}                    from './request.js'
import parser        from './parser.js'
import doT           from 'dot'

/**   max :: Array (Array a) -> Integer */
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

/**   padArray :: a -> Integer -> Array (Array a) -> Array (Array a) */
const padArray = pad => n =>
  S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (pad)))

/**   sameLength :: Array (Array String) -> Array (Array String) */
const sameLength = S.ap (S.flip (padArray ('&nbsp;'))) (max)

/**   zip3 :: Array a -> Array a -> Array a -> Array (Array3 a) */
const zip3 = a1 => a2 => a3 => (
  S.zipWith
    (a => b => [a, ...b])
    (a1)
    (S.zipWith (a => b => [a, b])
               (a2)
               (a3))
)

/**   column3 :: Array3 (Array String) -> Array (Array3 String) */
const column3 = S.pipe ([
  sameLength,
  as => zip3 (as[0]) (as[1]) (as[2]),
])

/**   iteratorToTuples :: Iterator a b -> Array (Array2 a b) */
const iteratorToTuples = Array.from

/**   formatHeaders :: Array Headers -> Maybe (Array (Array3 String) */
const formatHeaders = S.pipe ([
  // unpack
  S.map (iteratorToTuples),
  S.join,
  // remove duplicates
  S.sort,
  S.groupBy (S.equals),
  S.map (S.compose (S.map (S.append ('&nbsp;')))
                   (S.head)),
  S.sequence (S.Maybe), // Maybe (Array (Array String))
])

/**   baseUrl :: String -> String */
const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`

/**   options :: String -> StrMap */
const options = url => ({
  redirect: 'follow',
  url: url,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-256'
  // }
})

/**   fetch :: Future e a -> String -> Future e a */
const fetch = transformer => S.pipe ([baseUrl, options, request, transformer])

/**   parse :: String -> Maybe (Array String) */
const parse = S.pipe ([
  parser,
  S.get (S.is ($.Array ($.String))) ('maleLast'),
  S.map (S.sort),
])

/**   lastNames :: Array String -> Array (Future e (Maybe (Array String))) */
const lastNames = S.pipe ([
  S.map (fetch (responseToText)), // Array (Future e String)
  S.map (S.map (parse)), // Array (Future e (Maybe (Array String)))
])

/**   headers :: Array (String) -> Array (Future e Headers) */
const headers = S.map (fetch (responseToHeaders))


// Add names to anonymous functions so that they are easier to spot in a profile
// Object.defineProperty (headers, 'name', { value: 'headers'})
// Object.defineProperty (max, 'name', { value: 'max'})
// Object.defineProperty (padArray, 'name', { value: 'padArray'})
// Object.defineProperty (sameLength, 'name', { value: 'sameLength'})
// Object.defineProperty (zip3, 'name', { value: 'zip3'})
// Object.defineProperty (column3, 'name', { value: 'column3'})
// Object.defineProperty (iteratorToTuples, 'name', { value: 'iteratorToTuples'})
// Object.defineProperty (formatHeaders, 'name', { value: 'formatHeaders'})
// Object.defineProperty (baseUrl, 'name', { value: 'baseUrl'})
// Object.defineProperty (options, 'name', { value: 'options'})
// Object.defineProperty (fetch, 'name', { value: 'fetch'})
// Object.defineProperty (parse, 'name', { value: 'parse'})
// Object.defineProperty (lastNames, 'name', { value: 'lastNames'})

//-------------- DOM code --------------

const appHtml       = document.getElementById ('app')
const fetchButton   = appHtml.querySelector   ('#fetch')
const headersButton = appHtml.querySelector   ('#head')
const cancelButton  = appHtml.querySelector   ('#cancel-fetch')
const resultPre     = appHtml.querySelector   ('#result')
const rows          = appHtml.querySelector   ("#rows")
const files         = ['Danish', 'Swedish', 'Norwegian']

/**   renderRows :: Array -> Html */
const renderRows = doT.template (document.getElementById ("rowTmpl").textContent)

/**   displayNames :: Array (Maybe (Array String)) -> Void */
const displayNames = S.pipe ([
  S.sequence (S.Maybe), // Maybe (Array (Array String))
  S.maybe ([]) (column3), // Array (Array3 String)
  renderRows,
  htmlNames => {
    rows.innerHTML = htmlNames
  }
])

/**   displayHeaders :: Headers -> Void */
const displayHeaders = S.pipe ([
  formatHeaders, // Maybe (Array (Array3 String)
  S.maybe ([]) (renderRows),
  htmlHeaders => {
    rows.innerHTML = htmlHeaders
  }
])

//    consume :: (a -> Any) -> Future e a
const consume = (
  F.forkCatch (e => resultPre.textContent = `Fatal Error: ${e.message}\n${e.stack}`)
              (error => { resultPre.textContent = `Error: ${error}` })
)

/**   activateCancelButton :: Array (Future String String) -> Void */
const activateCancelButton = f => futures => (
  cancelButton.onclick = (
    consume (f)
            (F.parallel (3) (futures))
  )
)

fetchButton.addEventListener ('click', () => {
  activateCancelButton (displayNames) (lastNames (files))
})

headersButton.addEventListener ('click', () => {
  activateCancelButton (displayHeaders) (headers (files))
})
