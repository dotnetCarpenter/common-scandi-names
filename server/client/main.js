import '../style.css'

import { F }   from './sanctuary.js'
import request from './request.js'

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')

const cancel = F.fork (console.error)
                      (console.log)
                      (request ({url:swedishUrl, redirect: 'follow'}))
// cancel ()


document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a class="block" href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
  <a class="block" href="https://example.com/" target="_blank">example.com</a>
`
