import S from 'sanctuary'
import tokens from './norwegian-tokens.js'
// import tokens from './swedish-tokens.js'


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
  S.fst,
  timeEnd ('parse'),
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
  fst,
  timeEnd ('parse_'),
])

// *****************************************************************************

//    parse2 :: Pair Ast (Array a) -> Token -> Pair Ast (Array a)
const parse2 = pair => token => {
  let ast = S.unchecked.fst (pair), parent = S.unchecked.snd (pair)

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

  return S.unchecked.Pair (ast) (parent)
}

//    parser2 :: Array Token -> Ast
const parser2 = S.unchecked.pipe ([
  timeStart ('parse2'),
  S.unchecked.reduce (parse2) (S.unchecked.Pair ({}) ([])),
  S.unchecked.fst,
  timeEnd ('parse2'),
])


// *****************************************************************************


function main () {
  parser_ (tokens)
  parser2 (tokens)
  parser (tokens)
}

setTimeout (main, 2000)
console.log ('The test run will start in 2 seconds...')
