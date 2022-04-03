import '../style.css'

import { F, S } from './sanctuary.js'
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}            from './request.js'

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

const program = S.compose (responseToText)
                          (request)

const appHtml = document.querySelector ('#app')
const fetchButton = appHtml.querySelector ('#fetch')
const cancelButton = appHtml.querySelector ('#cancel-fetch')
const resultPre   = appHtml.querySelector ('#result')

fetchButton.addEventListener ('click', () => {
  const cancel = (
    F.fork (error => {
              resultPre.textContent = `Error: ${error}`
           })
           (data => {
             resultPre.textContent = data
           })
           (program ({
             redirect: 'follow',
             url: danishUrl,
             method: 'GET',
             headers: { range: 'bytes=0-128' }
           }))
  )

  cancelButton.onclick = cancel
  // cancel () // You will have to be extremely fast to cancel the request by clicking the button
})
