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

const $Response = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/response')
  ([])
  (x => toString.call (x) === '[object Response]')


const S = sanctuary.create ({
	checkTypes: true,
  env: sanctuary.env.concat (flutureEnv).concat ([$Event, $Response])
})

export { S, $, F }
