import { S, F } from './sanctuary.js'
import fetch    from 'node-fetch'

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
    controller.abort (/* new AbortError ('cancelled') */)
  }
})

const preflight = options => request ({
  url: options.url,
  headers: {
    origin: 'https://dotnetcarpenter.github.io',
    'Access-Control-Request-Method': options.method || 'GET',
    'Access-Control-Request-Headers': Object.keys (options.headers).join ()
  }
})

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => response.text ())),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (S.compose (F.resolve)
                        (S.prop ('headers'))),
  S.join,
])


const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

const program = S.compose (responseToHeaders)
                          (request)

const options = {
  redirect: 'follow',
  url: danishUrl,
  method: 'GET',
  headers: {
    range: 'bytes=0-127'
  }
}
const cancel = F.fork (console.error)
                      (console.log)
                      (program (options))

// cancel ()
