import sanctuary from 'sanctuary'
import $         from 'sanctuary-def'
import * as F    from 'fluture'
import {
  env as flutureEnv
}                from 'fluture-sanctuary-types'

const toString = Object.prototype.toString

const $Event = $.NullaryType
  ('Event')
  ('https://devdocs.io/dom/event')
  ([])
  (x => toString.call (x) === '[object Event]')

const $Headers = $.NullaryType
  ('Headers')
  ('https://devdocs.io/dom/headers')
  ([])
  (x => toString.call (x) === '[object Headers]')

const $PointerEvent = $.NullaryType
  ('PointerEvent')
  ('https://devdocs.io/dom/pointerevent')
  ([])
  (x => toString.call (x) === '[object PointerEvent]')

const $Response = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/response')
  ([])
  (x => toString.call (x) === '[object Response]')

const checkTypes = false // import.meta.env.DEV,

const env = sanctuary.env.concat (flutureEnv).concat ([
  $Event,
  $Headers,
  $PointerEvent,
  $Response,
])

const S = sanctuary.create ({ checkTypes, env })

const def = $.create ({ checkTypes, env })

const $_ = Object.assign ({
  Event: $Event,
  Headers: $Headers,
  PointerEvent: $PointerEvent,
  Response: $Response,
}, $)

const debug = msg => x => (console.debug (msg, x), x)

export {
  S, def, F,
  $_ as $,
  debug
}
