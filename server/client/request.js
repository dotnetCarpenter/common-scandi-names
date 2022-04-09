import { S, F } from './sanctuary.js'


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
    origin: 'https://dotnetcarpenter.github.io', // will be ignored in any browser
    'Access-Control-Request-Method': options.method || 'GET',
    'Access-Control-Request-Headers': Object.keys (options.headers).join ()
  }
})

//    tagByOk :: Future e Response -> Future e (Either Response Response)
const tagByOk = S.map (S.tagBy (S.prop ('ok')))

//    rejectionToString :: Response|Error|Any -> Future String a
const rejectionToString = e => {
  let rejection

  switch (e.constructor) {
    case Response:
      rejection = `HTTP error! status: ${e.status}`
      break
    default:
      rejection = `Unknown rejection: ${String (e)}`
  }

  return F.reject (rejection)
}

//    rejectToStringOr :: (b -> Future e String) -> Either a b -> Future String String
const rejectToStringOr = S.either (rejectionToString)

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  tagByOk,
  S.map (rejectToStringOr (F.encaseP (response => response.text ()))),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  tagByOk,
  S.map (rejectToStringOr (S.compose (F.resolve)
                                     (S.prop ('headers')))),
  S.join,
  S.map (Array.from),
  S.map (S.reduce (s => t => s + `${t[0]}: ${t[1]}\n`) (''))
])

export default S.compose (responseToText)
                         (request)

export {
  request,
  preflight,
  responseToText,
  responseToHeaders
}
