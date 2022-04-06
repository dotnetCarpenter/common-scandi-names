import '../style.css'

import { F, S }         from './sanctuary.js'
import * as cheetahGrid from "cheetah-grid"
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}                       from './request.js'
import parser           from './parser.js'

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

const appHtml       = document.querySelector ('#app')
const fetchButton   = appHtml.querySelector ('#fetch')
const headersButton = appHtml.querySelector ('#head')
const cancelButton  = appHtml.querySelector ('#cancel-fetch')
const resultPre     = appHtml.querySelector ('#result')
const table         = appHtml.querySelector("#sample")

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
  ({ maleLast: records }) => {
    // https://future-architect.github.io/cheetah-grid/documents/api/
    new cheetahGrid.ListGrid({
      // Parent element on which to place the grid
      parentElement: table,

      // Header definition
      header: [
        { field: "name", caption: "Last Name", width: table.clientWidth - 34 },
      ],
      // Array data to be displayed on the grid
      records: records.map (name => ({name})),
    })
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
