I'm beginning to see some flaws in my `fetch` ecapsulation and hoping for input from you on how to fix them.
First I'll post my current code and then discuss my issue with handling rejections.

```js
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

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (F.encaseP (response => response.text ())),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (response => F.reject (`HTTP error! status: ${response.status}`))
             (S.compose (F.resolve)
                        (S.prop ('headers'))),
  S.join,
])
```

I got two different `Response` handlers, that I can use to either get the text from a `Response` or the headers.

The issue with them is that they can only handle rejected `Response`. E.i. `Future Response Response`. If there is a network error, then signature is `Future Error a`. `S.chain` is shorthand for `map -> of -> join` so that code path is not called on rejection, `F.coalesce` is called and will fail if its argument is not `Future Response Response`. I can not wrap it in `S.chain` because then `F.coalesce` will not get a `Response` when the status code is not in the 200–299 range. E.g. `Future Error Response`.

I could handle it inside `F.coalesce` but I was thinking that there might be Fluture idiomatic way to handle this kind of situation.

```js
//    rejectionToString :: Response|Error|Any -> Future String a
const rejectionToString = e => {
  let rejection

  switch (e.constructor) {
    case Response:
      rejection = `HTTP error! status: ${e.status}`
      break
    case Error:
    case TypeError:
      rejection = `HTTP error! message: ${e.message}`
      break
    default:
      rejection = `Unknown rejection: ${String (e)}`
  }

  return F.reject (rejection)
}

//    responseToText :: Future e Response -> Future String String
const responseToText = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (rejectionToString)
             (F.encaseP (response => response.text ())),
  S.join,
])

//    responseToHeaders :: Future e Response -> Future String String
const responseToHeaders = S.pipe ([
  S.chain (tagByF (S.prop ('ok'))),
  F.coalesce (rejectionToString)
             (S.compose (F.resolve)
                        (S.prop ('headers'))),
  S.join,
])
```

There is a live example at https://dotnetcarpenter.github.io/common-scandi-names/. Because I use the range header, it unfortunately does not work in Firefox because of [Bug 1733981](https://bugzilla.mozilla.org/show_bug.cgi?id=1733981) since it is a new feature added just [6 months ago](https://github.com/whatwg/fetch/pull/1312).
It looks like [it doesn't work in Safari either](https://wpt.fyi/results/cors/cors-safelisted-request-header.any.html?label=experimental&label=master&aligned).

---------------------------------------------------------------------------

I got two different `Response` handlers, that I can use to either get the text from a `Response` or the headers.

```js
const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

const options = {
  redirect: 'follow',
  url: danishUrl,
  method: 'GET',
  headers: {
    range: 'bytes=0-127'
  }
}

const program = S.compose (responseToText)
                          (request)

const cancel = F.fork (console.error)
                      (console.log)
                      (program (options))
```

_Will output:_

```
lookWeights:
  - 49
  - 49
  - 2
  - 0
maleFirst:
  - Absalon
  - Adam
  - Adolf
  - Albert
  - Alex
  - Alexander
  - Al
```

If I want the headers, I can use `responseToHeaders` instead of `responseToText`.

```js
const program = S.compose (responseToHeaders)
                          (request)

const cancel = F.fork (console.error)
                      (console.log)
                      (program (options))
```

_Will output:_

```
{
  'accept-ranges': 'bytes',
  'access-control-allow-origin': '*',
  'cache-control': 'max-age=300',
  connection: 'close',
  'content-encoding': 'gzip',
  'content-length': '128',
  'content-range': 'bytes 0-127/2898',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  'content-type': 'text/plain; charset=utf-8',
  date: 'Sun, 03 Apr 2022 21:10:25 GMT',
  etag: 'W/"eb3621834330b47a8107e596c9c62beb9673654e610901ed4063136fff2f1c25"',
  expires: 'Sun, 03 Apr 2022 21:15:25 GMT',
  'source-age': '0',
  'strict-transport-security': 'max-age=31536000',
  vary: 'Authorization,Accept-Encoding,Origin',
  via: '1.1 varnish',
  'x-cache': 'MISS',
  'x-cache-hits': '0',
  'x-content-type-options': 'nosniff',
  'x-fastly-request-id': '049a920c03774d532df3aaa706cba3617e931c0a',
  'x-frame-options': 'deny',
  'x-github-request-id': '5F84:D70A:FEB6A8:10B1C1B:624A09DC',
  'x-served-by': 'cache-osl6520-OSL',
  'x-timer': 'S1649020226.605816,VS0,VE155',
  'x-xss-protection': '1; mode=block'
}
```
