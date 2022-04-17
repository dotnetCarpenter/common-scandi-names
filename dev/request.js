// @ts-check

import { S, F } from './sanctuary.js'
import fetch    from 'node-fetch'

//    request :: StrMap -> Future e a
const request = ({url, ...options}) => F.Future ((reject, resolve) => {
  const controller = new AbortController ()

  fetch (url, { signal: controller.signal, ...options })
    .then (resolve)
    .catch (reject)

  return () => {
    controller.abort (/* new AbortError ('cancelled') */)
  }
})

// like a preflight but a real preflight is an OPTIONS request
//    preflight :: StrMap -> Future e Response
const preflight = options => request ({
  url: options.url,
  method: 'HEAD',
  headers: {
    origin: 'https://raw.githubusercontent.com',
    'Access-Control-Request-Method': options.method || 'GET',
    'Access-Control-Request-Headers': Object.keys (options.headers).join ()
  }
})

//    rejectionToString :: Response|Error|Any -> Future String a
const rejectionToString = e => {
  let rejection

  switch (e.constructor) {
    case Response:
      rejection = `HTTP error! status: ${e.status}`
      break
    // case Error:
    // case TypeError:
    //   rejection = `HTTP error! message: ${e.message}`
    //   break
    default:
      rejection = `Unknown rejection: ${String (e)}`
  }

  return F.reject (rejection)
}

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  S.map (S.tagBy (S.prop ('ok'))),
  S.map (S.either (rejectionToString)
                  (F.encaseP (response => response.text ()))),
  S.join,
])

//    responseToStream :: Future e Response -> Future e ReadableStream
const responseToStream = S.pipe ([
  S.map (S.tagBy (S.prop ('ok'))),
  S.map (S.either (F.reject)
                  (S.compose (F.resolve) (S.prop ('body')))),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  S.map (S.tagBy (S.prop ('ok'))),
  S.map (S.either (rejectionToString)
                  (S.compose (F.resolve)
                             (S.prop ('headers')))),
  S.join,
])

export default S.compose (responseToText)
                         (request)

export {
  request,
  preflight,
  responseToStream,
  responseToText,
  responseToHeaders
}
