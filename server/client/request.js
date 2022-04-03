import { S, F } from './sanctuary.js'

//    tagByF :: (a -> Boolean) -> a -> Future a a
const tagByF = f => x => f (x)
  ? F.resolve (x)
  : F.reject  (x)

//    request :: StrMap -> Future e a
const request = ({url, ...options}) => F.Future ((reject, resolve) => {
  const controller = new AbortController ()

  fetch (url, { signal: controller.signal, ...options })
    .then (resolve)
    .catch (reject)

  return () => {
    controller.abort ()
  }
})

//    preflight :: StrMap -> Future e Response
const preflight = options => request ({
  url: options.url,
  headers: {
    origin: 'https://dotnetcarpenter.github.io', // will be ignored in any browser
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
    case Error:
    case TypeError:
      rejection = `HTTP error! message: ${e.message}`
      break
    default:
      rejection = `Unknown rejection: ${String (e)}`
  }

  return F.reject (rejection)
}

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (rejectionToString)
             (F.encaseP (response => response.text ())),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (rejectionToString)
             (S.compose (F.resolve)
                        (S.prop ('headers'))),
  S.join,
])

export default S.compose (responseToText)
                         (request)

export {
  request,
  preflight,
  responseToText,
  responseToHeaders
}
