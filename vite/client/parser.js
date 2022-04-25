import { S, debug } from './sanctuary.js'

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

//    lines :: String -> Array String
const lines = s => s === ''
  ? []
  : (s.replace (/\r\n?/g, '\n')).match (/^(?=[\s\S]).*\n?/gm)

//    lexer :: String -> Array Token
const lexer = S.pipe ([
  // debug ('lexer'),
  lines,
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
