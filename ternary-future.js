import { S, F } from './sanctuary.js'

// const trace = msg => x => (console.warn (msg, x), x)

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

//    fetchException :: String -> Throws e
const fetchException = url => { throw new Error (url) }
//    fetchReject    :: String -> Promise Response a
const fetchReject    = url => Promise.reject (failureResponse (url))
//    fetchFail      :: String -> Promise a Response
const fetchFail      = url => Promise.resolve (failureResponse (url))
//    fetchSuccess   :: String -> Promise a Response
const fetchSuccess   = url => Promise.resolve (successResponse (url))

//    responseHandler :: Future Response Response -> Future String String
const responseHandler = S.pipe ([
  S.map (S.tagBy (S.prop ('ok'))),

  F.map (
    S.either (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => (response.text ())))
  ),

  S.join,
])

//    executeAndLog :: Future e a -> Void
const executeAndLog = (
  F.forkCatch (e => console.error (`Fatal Error: ${e.message}\n${e.stack}`))
              (console.error.bind (console, 'Error:'))
              (console.log.bind (console, 'Success:'))
)

executeAndLog (responseHandler (F.encaseP (fetchFail) ('this is my URL')))
// NOTE: fetchReject should not happen in the real world and it will bypass `responseHandler` entirely
executeAndLog (responseHandler (F.encaseP (fetchReject) ('this is my URL')))
executeAndLog (responseHandler (F.encaseP (fetchSuccess) ('this is my URL')))
executeAndLog (responseHandler (F.encaseP (fetchException) ('this is my URL')))

// console.debug (
//   request ('this is my URL')
// )
