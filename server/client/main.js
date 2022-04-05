import '../style.css'

import { F, S } from './sanctuary.js'
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}               from './request.js'

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

//    fetchData :: StrMap -> Future String String
const fetchData = S.compose (responseToText)
                            (request)

//    fetchNames :: Future String String
const fetchNames = fetchData ({
  redirect: 'follow',
  url: danishUrl,
  method: 'GET',
  headers: { range: 'bytes=0-127' }
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

const appHtml       = document.querySelector ('#app')
const fetchButton   = appHtml.querySelector ('#fetch')
const headersButton = appHtml.querySelector ('#head')
const cancelButton  = appHtml.querySelector ('#cancel-fetch')
const resultPre     = appHtml.querySelector ('#result')

//    consume :: Future String String -> Void
const consume = future => (
  cancelButton.onclick = (
    F.fork (error => {
              resultPre.textContent = `Error: ${error}`
           })
           (data => {
             resultPre.textContent = data
           })
           (future)
  )
)

fetchButton  .addEventListener ('click', S.compose (S.T (fetchNames)) (S.K (consume)))
headersButton.addEventListener ('click', S.compose (S.T (fetchHeaders)) (S.K (consume)))
