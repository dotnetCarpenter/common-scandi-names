import { S, F } from './sanctuary.js'


const failureResponse = url => ({
  ok: false,
  status: 500,
  text () {
    throw 'No no no'
  }
})
const successResponse = url => ({
  ok: true,
  status: 200,
  text () {
    return Promise.resolve (`The body from ${url}`)
  }
})

const mockFetch = url => Promise.resolve (failureResponse (url))
// const mockFetch = url => Promise.resolve (successResponse (url))

//    tagByF :: (a -> Boolean) -> a -> Future e a
const tagByF = f => x => f (x)
  ? F.resolve (x)
  : F.reject  (x)

//    request :: String -> Future e a
const request = S.pipe ([
  F.encaseP (fetch),
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => response.text ())),
  S.join,
])

F.fork (console.error.bind (console, 'Error:'))
       (console.log.bind (console, 'Success:'))
       (request ('this is my URL'))


// console.debug (
//   request ('this is my URL')
// )
