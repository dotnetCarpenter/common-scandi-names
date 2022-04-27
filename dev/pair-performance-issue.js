process.env.NODE_ENV = 'production'

import S from 'sanctuary'
import tokens from './swedish-tokens.js'

const timeStart = tag => x => (console.time (tag), x)
const timeEnd   = tag => x => (console.timeEnd (tag), x)


const TOKEN = Object.freeze ({
  PARENT: 8,
  CHILD: 16,
})

// Token = { value: Any, type: Number }

//    parse :: Pair Ast (Array a) -> Token -> Pair Ast (Array a)
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
      // skip token
  }

  return S.Pair (ast) (parent)
}

//    parser :: Array Token -> Ast
const parser = S.pipe ([
  timeStart ('parse'),
  S.reduce (parse) (S.Pair ({}) ([])),
  timeEnd ('parse'),
  S.fst,
])

// *****************************************************************************

//    fst :: Array a -> a | undefined
const fst = a => a[0]

//    parse_ :: Array2 Ast (Array a) -> Token -> Array2 Ast (Array a)
const parse_ = pair => token => {
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

//    parser_ :: Array Token -> Ast
const parser_ = S.pipe ([
  timeStart ('parse_'),
  S.reduce (parse_) ([{},[]]),
  timeEnd ('parse_'),
  fst,
])


parser_ (tokens)
parser (tokens)
