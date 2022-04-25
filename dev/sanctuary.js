import sanctuary from 'sanctuary'
import $         from 'sanctuary-def'
import * as F    from 'fluture'
import {
  env as flutureEnv
}                from 'fluture-sanctuary-types'

const toString = Object.prototype.toString

const $Response = $.Response = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/response')
  ([])
  (x => toString.call (x) === '[object Response]')

const $Headers = $.Headers = $.NullaryType
  ('Headers')
  ('https://devdocs.io/dom/headers')
  ([])
  (x => toString.call (x) === '[object Headers]')


const checkTypes = true

const env = sanctuary.env.concat (flutureEnv).concat ([
  $Response,
  $Headers
])

const S = sanctuary.create ({ checkTypes, env })

const def = $.create ({ checkTypes, env })

export { S, $, def, F }
