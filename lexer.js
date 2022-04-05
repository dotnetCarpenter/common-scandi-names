import util     from 'util'
import { S, F } from './sanctuary.js'
import {
  request,
  preflight,
  responseToText,
  responseToHeaders
}               from './request.js'

const TOKEN = Object.freeze ({
  UNKNOWN: 0,
  TERMINAL: 1,

  // Non terminals (e.i. they will be substituted in the parser)
  SEPERATOR: 2,
  SPACE: 4,
  PARENT: 8,
  CHILD: 16,
  NUMBER: 32,
})

//    createToken :: a -> TokenEnum -> Token
const createToken = x => type => ({
  value: x,
  type: type
})

//    matcher :: RegEx -> String -> Boolean|String
const matcher = regex => string => regex.test(string) && string

const parentMatcher = matcher (/\w+:\n$/)

const numberMatcher = matcher (/^\d+\n$/)

const dashMatcher = matcher (/\s{2}-\s\w+/)

const nameMatcher = matcher (/^\p{L}+\n$/u)

//    tokenize :: String -> Array Token
const tokenize = string => (tail, tokens = []) => {
  if (!string) return tokens

  let token

  switch (string) {
    case dashMatcher (string):
      return tokenize (string.slice (4)) (tail, tokens)

    case nameMatcher (string):
      token = createToken (string.slice (0, -1)) (TOKEN.CHILD)
      break

    case numberMatcher (string):
        token = createToken (Number (string.slice (0, -1))) (TOKEN.CHILD)
        break

    case parentMatcher (string):
      token = createToken (string.slice (0, -2)) (TOKEN.PARENT)
      break

    default:
      token = createToken (string) (TOKEN.UNKNOWN)
  }

  return tokenize (tail[0])
                  (tail.slice (1), S.append (token) (tokens))
}

const lines = s => s === ''
  ? []
  : (s.replace (/\r\n?/g, '\n')).match (/^(?=[\s\S]).*\n?/gm)

//    lexer :: String -> Array Token
const lexer = S.pipe ([
  lines,
  // x => (console.debug (x), x),
  S.array ([createToken ('') (TOKEN.UNKNOWN)]) (tokenize),
])

const parse = pair => token => {
  let ast = S.fst (pair), parent = S.snd (pair)

  switch (token.type) {
    case TOKEN.PARENT:
      parent = ast[token.value] = []
      break
    case TOKEN.CHILD:
      parent.push (token.value)
      break
    default:
      // throw new Error (`${token.value} is not recognized`)
  }

  return S.Pair (ast) (parent)
}

//    parser :: Array Token -> Ast
const parser = S.pipe ([
  S.reduce (parse) (S.Pair ({}) ([])),
  S.fst
])

const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`
const swedishUrl = baseUrl ('Swedish')
const danishUrl  = baseUrl ('Danish')

const doPreflight = S.compose (responseToHeaders) (preflight)
const getText     = S.compose (responseToText)    (request)
const getHeaders  = S.compose (responseToHeaders) (request)

const options = {
  redirect: 'follow',
  url: swedishUrl,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-94'
  // }
}

const cancel = F.fork (console.error)
                      (S.pipe ([
                        lexer,
                        // x => (console.error (util.inspect (x)), x),
                        parser,
                        JSON.stringify,
                        // x => (console.log (util.inspect (x, {
                        //   maxArrayLength:
                        //   1034,
                        //   maxStringLength: 20000,
                        //   colors: true
                        // })), x),
                        console.log,
                      ]))
                      (getText (options))

// cancel ()
