import sanctuary from 'sanctuary'
import tokens from './norwegian-tokens.js'
// import tokens from './swedish-tokens.js'

const S = sanctuary.create ({ checkTypes: false, env: sanctuary.env })

const time = new class Time {
  htmlConsole = document.querySelector ('#console')

  #tags = []
  #equals = tag => t => t[0] === tag

  #findTag (tag) {
    return this.#tags.find (this.#equals (tag))
  }

  #removeTag (tag) {
    return this.#tags.splice (this.#tags.findIndex (this.#equals (tag)), 1)
  }

  start (tag) {
    console.time (tag)
    this.#tags.push ([tag, Date.now ()])
  }

  end (tag) {
    const tagPair = this.#findTag (tag)

    if (tagPair) {
      console.timeEnd (tag)
      this.#removeTag (tag)
      this.htmlConsole.textContent += `${tag}: ${Date.now () - tagPair[1]}ms\n`
    }
  }
}

const timeStart = tag => x => (time.start (tag), x)
const timeEnd   = tag => x => (time.end (tag), x)

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
  parser (tokens)
  parser2 (tokens)
}

setTimeout (main, 2000)
