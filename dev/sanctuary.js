import sanctuary from 'sanctuary'
import $         from 'sanctuary-def'
import * as F    from 'fluture'
import {
  env as flutureEnv
}                from 'fluture-sanctuary-types'

const toString = Object.prototype.toString

const $Response = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/response')
  ([])
  (x => toString.call (x) === '[object Response]')

const $Headers = $.NullaryType
  ('Headers')
  ('https://devdocs.io/dom/headers')
  ([])
  (x => toString.call (x) === '[object Headers]')


const checkTypes = false

const env = sanctuary.env.concat (flutureEnv).concat ([
  $Response,
  $Headers
])

const S = sanctuary.create ({ checkTypes, env })

const def = $.create ({ checkTypes, env })

const $_ = Object.assign ({ Response: $Response, Headers: $Headers }, $)

const debug = msg => x => (console.debug (msg, x), x)

export {
  S, def, F,
  $_ as $,
  debug
}
