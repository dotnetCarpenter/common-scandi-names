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
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')
const norwegianUrl  = baseUrl ('Norwegian')

const doPreflight = S.compose (responseToHeaders) (preflight)
const getText     = S.compose (responseToText)    (request)
const getHeaders  = S.compose (responseToHeaders) (request)

const options = {
  redirect: 'follow',
  url: norwegianUrl,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-256'
  // }
}

const cancel = F.fork (console.error)
                      (S.pipe ([
                        // x => (console.error (util.inspect (x)), x),
                        parser,
                        // x => (console.log (util.inspect (x, {
                        //   maxArrayLength:
                        //   1034,
                        //   maxStringLength: 20000,
                        //   colors: true
                        // })), x),
                        JSON.stringify,
                        console.log,
                      ]))
                      (getText (options))

// cancel ()
