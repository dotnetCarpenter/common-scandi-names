import util     from 'util'
import { S, F } from './sanctuary.js'
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}               from './request.js'

const tokenEnum = Object.freeze ({
  TOKEN_UNKNOWN: 0,
  TOKEN_TERMINAL: 1,

  // Non terminals (e.i. they will be substituted in the parser)
  TOKEN_SEPERATOR: 2,
  TOKEN_SPACE: 4,
  TOKEN_PARENT: 8,
  TOKEN_CHILD: 16,
})

const createToken = char => type => ({
  value: char,
  type: type
})

const tokenize = char => (tail, tokens = []) => {
  if (!char) return tokens

  const setType = createToken (char)
  let token

  switch (char) {
    case '\n': token = setType (tokenEnum.TOKEN_SEPERATOR); break
    case ' ':  token = setType (tokenEnum.TOKEN_SPACE); break
    case ':':  token = setType (tokenEnum.TOKEN_PARENT); break
    case '-':  token = setType (tokenEnum.TOKEN_CHILD); break
    default:
      token = setType (tokenEnum.TOKEN_TERMINAL)
  }

  return tokenize (tail[0]) (tail.slice(1), S.append (token) (tokens))
}
const lexer = text => (
  S.compose (S.array ([createToken (text) (tokenEnum.TOKEN_UNKNOWN)]) (tokenize))
            (S.splitOn (''))
            (text)
)
const parser = tokens => {
  // switch
}

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

const doPreflight = S.compose (responseToHeaders) (preflight)
const getText     = S.compose (responseToText) (request)
const getHeaders  = S.compose (responseToHeaders) (request)

const options = {
  redirect: 'follow',
  url: swedishUrl,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-99'
  // }
}

const cancel = F.fork (console.error)
                      (S.pipe ([
                        x => (process.stderr.write (x), x),
                        lexer,
                        x => console.log (util.inspect (x, {maxArrayLength: 1034, maxStringLength: 20000, colors: false}))
                      ]))
                      (getText (options))

// cancel ()
