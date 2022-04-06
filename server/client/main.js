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

//    fetchNames :: Future String String
const fetchNames = fetchData ({
  redirect: 'follow',
  url: danishUrl,
  method: 'GET',
  // headers: { range: 'bytes=0-127' }
})

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

//-------------- DOM code --------------

const appHtml       = document.getElementById ('app')
const fetchButton   = appHtml.querySelector   ('#fetch')
const headersButton = appHtml.querySelector   ('#head')
const cancelButton  = appHtml.querySelector   ('#cancel-fetch')
const resultPre     = appHtml.querySelector   ('#result')
const rows          = appHtml.querySelector   ("#rows")

//    renderRows :: Array -> Html
const renderRows = doT.template (document.getElementById ("rowTmpl").textContent)

//    consume :: (a -> Any) -> Future e a
const consume = F.fork (error => { resultPre.textContent = `Error: ${error}` })

  //  activateCancelButton :: Future String String -> Void
const activateCancelButton = f => future => (
  cancelButton.onclick = (
    consume (f)
            (future)
  )
)

const displayNames = S.pipe ([
  parser,
  ({ maleLast }) => maleLast,
  names => {
    rows.innerHTML = renderRows (names)
  }
])

const displayHeaders = data => {
  resultPre.textContent = data
}

fetchButton.addEventListener ('click', () => {
  activateCancelButton (displayNames) (fetchNames)
})

headersButton.addEventListener ('click', () => {
  activateCancelButton (displayHeaders) (fetchHeaders)
})
