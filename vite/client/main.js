import 'normalize.css'
import '../style.css'

import { F, S, $ }   from './sanctuary.js'
import {
  request,
  responseToText,
  responseToHeaders
}                    from './request.js'
import parser        from './parser.js'
import doT           from 'dot'


/* ----------- Init ----------- */

/**   baseUrl :: String -> String */
const baseUrl = language => `https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/common/SoldierName/${language}.nam`

/**   options :: String -> StrMap */
const options = url => ({
  redirect: 'follow',
  url: url,
  method: 'GET',
  // headers: {
  //   range: 'bytes=0-256'
  // }
})

/**   fetch :: Future e a -> String -> Future e a */
const fetch = transformer => S.pipe ([baseUrl, options, request, transformer])

/**   parse :: String -> Maybe (Array String) */
const parse = S.pipe ([
  parser,
  S.get (S.is ($.Array ($.String))) ('maleLast'),
  S.map (S.sort),
])

/**   lastNames :: Array String -> Array (Future e (Maybe (Array String))) */
const lastNames = S.pipe ([
  S.map (fetch (responseToText)), // Array (Future e String)
  S.map (S.map (parse)), // Array (Future e (Maybe (Array String)))
])

/**   headers :: Array (String) -> Array (Future e Headers) */
const headers = S.map (fetch (responseToHeaders))


/**   max :: Array (Array a) -> Integer */
const max = S.compose (ns => Math.max (...ns)) (S.map (S.size))

/**   padArray :: a -> Integer -> Array (Array a) -> Array (Array a) */
const padArray = pad => n =>
  S.map (array =>
    array.concat (Array.from (new Array (n - array.length)).fill (pad)))

/**   sameLength :: Array (Array String) -> Array (Array String) */
const sameLength = S.ap (S.flip (padArray ('&nbsp;'))) (max)

/**   zip3 :: Array a -> Array a -> Array a -> Array (Array3 a) */
const zip3 = a1 => a2 => a3 => (
  S.zipWith
    (a => b => [a, ...b])
    (a1)
    (S.zipWith (a => b => [a, b])
               (a2)
               (a3))
)

/**   column3 :: Array3 (Array String) -> Array (Array3 String) */
const column3 = S.pipe ([
  sameLength,
  as => zip3 (as[0]) (as[1]) (as[2]),
])

/**   iteratorToTuples :: Iterator a b -> Array (Array2 a b) */
const iteratorToTuples = Array.from

/**   formatHeaders :: Array Headers -> Maybe (Array (Array3 String) */
const formatHeaders = S.pipe ([
  // unpack
  S.map (iteratorToTuples),
  S.join,
  // remove duplicates
  S.sort,
  S.groupBy (S.equals),
  S.map (S.compose (S.map (S.append ('&nbsp;')))
                   (S.head)),
  S.sequence (S.Maybe), // Maybe (Array (Array String))
])

/**   renderRows :: Array -> Html */
const renderRows = doT.template (document.getElementById ("rowTmpl").textContent)


/* ----------- ViewModel ----------- */

const sortOrderEnum = {
  'ascending': true,
  'descending': false
}

/**   ViewModel :: Array (Array3 String) -> String -> Number -> Model */
const ViewModel = (data, error, sortOrder) => {
  const resultPre = document.querySelector ('#result')
  const rows      = document.querySelector ("#rows")

  return {
    get rows () {
      return data
    },
    set rows (r) {
      rows.innerHTML = renderRows (r)
      data = r
    },
    get error () {
      return error
    },
    set error (e) {
      resultPre.textContent = e
      error = e
    },
    get sortOrder () {
      return sortOrder
    },
    set sortOrder (s) {
      sortOrder = s
    }
  }
}

const model = ViewModel ([], {}, sortOrderEnum.ascending)
const files = ['Danish', 'Swedish', 'Norwegian']
const cancelButton = document.querySelector ('#cancel-fetch')

/**   compute :: Model -> (b -> Any) -> Future a b -> Cancel */
const compute = model => (
  F.forkCatch (e => model.error = `Fatal Error: ${e.message}\n${e.stack}`)
              (e => model.error = `Error: ${e}`)
)

/**   update :: String -> Model -> Void */
const update = msg => model => {
  switch (msg) {
    case 'fetch':
      cancelButton.onclick = (
        compute (model)
                (S.pipe ([
                  S.sequence (S.Maybe), // Maybe (Array (Array String))
                  S.maybe ([]) (column3), // Array (Array3 String)
                  rows => model.rows = rows
                ]))
                (F.parallel (3) (lastNames (files)))
      )
      break

    case 'headers':
      cancelButton.onclick = (
        compute (model)
                (S.pipe ([
                  formatHeaders,
                  S.maybe ([]) (S.I),
                  rows => model.rows = rows
                ]))
                (F.parallel (3) (headers (files)))
      )
      break

    case 'sort':
      // trick because the underlaying data type is a Boolean
      model.sortOrder = !model.sortOrder

      const rs = structuredClone (model.rows)

      model.rows = rs.sort (([,,a], [,,b]) => {
        let comparator
        switch (model.sortOrder) {
          case sortOrderEnum.descending:
            comparator = S.gte
            break

          case sortOrderEnum.ascending:
            comparator = S.lte
            break
        }

        return comparator (a) (b)
          ? 1
          : -1
      });
      break

    default:
      throw new Error ('Not Implemented')
  }
}

/* ----------- View ----------- */

const fetchButton   = document.querySelector ('#fetch')
const headersButton = document.querySelector ('#head')
const tableHead     = document.querySelector ('.table-names thead')

/**   bind :: a -> (a -> b) -> (() -> b) */
const bind = v => f => f.bind (null, v)

fetchButton.addEventListener ('click', bind (model) (update ('fetch')))

headersButton.addEventListener ('click', bind (model) (update ('headers')))

tableHead.addEventListener ('click', bind (model) (update ('sort')))
