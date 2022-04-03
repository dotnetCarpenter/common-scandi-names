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

//    responseHandler :: String -> Future e a
const responseHandler = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => response.text ())),
  S.join,
])

export default S.compose (responseHandler)
                         (request)
