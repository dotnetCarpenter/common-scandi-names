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

const $Headers = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/headers')
  ([])
  (x => toString.call (x) === '[object Headers]')

const $PointerEvent = $.NullaryType
  ('Response')
  ('https://devdocs.io/dom/pointerevent')
  ([])
  (x => toString.call (x) === '[object PointerEvent]')

const S = sanctuary.create ({
	checkTypes: true,
  env: sanctuary.env.concat (flutureEnv).concat ([
    $Event,
    $Response,
    $Headers,
    $PointerEvent
  ])
})

export { S, $, F }
