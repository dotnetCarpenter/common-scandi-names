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

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')

const program = S.compose (responseHandler)
                          (request)

const cancel = F.fork (console.error)
                      (console.log)
                      (program ({redirect: 'follow', url: swedishUrl}))

// cancel ()
