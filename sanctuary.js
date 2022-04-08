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
  ('Response')
  ('https://devdocs.io/dom/headers')
  ([])
  (x => toString.call (x) === '[object Headers]')


const S = sanctuary.create ({
	checkTypes: true,
  env: sanctuary.env.concat (flutureEnv).concat ([
    $Response,
    $Headers
  ])
})

export { S, $, F }
