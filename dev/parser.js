// @ts-check

import { S } from './sanctuary.js'

// https://www.tutorialspoint.com/compiler_design/compiler_design_phases_of_compiler.htm
// PureScript Parser example: https://github.com/Thimoteus/purescript-simple-parser/blob/master/src/Text/Parsing/Simple.purs

const trace = msg => x => (console.debug (msg, x), x)

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

//    matcher :: RegExp -> a -> a
const matcher = regex => a => regex.test(a) && a

const parentMatcher = matcher (/\w+:\n$/)

const numberMatcher = matcher (/^\d+\n$/)

const dashMatcher = matcher (/\s{2}-\s\w+/)

const nameMatcher = matcher (/^\p{L}+\n$/u)

//    tokenize :: String -> Array Token
const tokenize = string => (
  tail,
  /** @type {({value:any,type:number})[]} */
  tokens = []) => {
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

//    lines :: String -> Array String
const lines = s => s === ''
  ? []
  : (s.replace (/\r\n?/g, '\n')).match (/^(?=[\s\S]).*\n?/gm)

function* readline (chunk) {
  let index = 0
  let currentIndex = 0

  while (true) {
    if (chunk[currentIndex] === '\n') {
      yield [chunk.slice (index, currentIndex)]
      index = currentIndex
    }
    ++currentIndex
  }
}

//    lexer :: String -> Array Token
const lexer = S.pipe ([
  trace ('before lines'),
  lines,
  trace ('after lines'),
  S.array ([createToken ('') (TOKEN.UNKNOWN)]) (tokenize),
  // TODO: syntax validation? E.i. Parent must come before child
])

//    fst :: Array a -> a
const fst = a => a[0]

const parse = pair => token => {
  let ast = fst (pair), parent = pair[1]

  switch (token.type) {
    case TOKEN.PARENT:
      parent = ast[token.value] = []
      break
    case TOKEN.CHILD:
      parent.push (token.value)
      break
    default:
      // skip token
  }

  return [ast, parent]
}

//    parser :: Array Token -> Ast
const parser = S.pipe ([
  S.reduce (parse) ([{},[]]),
  fst
])

export default S.compose (parser) (lexer)
