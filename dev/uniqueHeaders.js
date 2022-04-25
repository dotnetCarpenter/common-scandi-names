import { S, def, $ }  from './sanctuary.js'

const log = console.log

const trace = msg => x => (log (msg, x), x)

/**   iteratorToTuples :: Iterator a a -> Array (Array a) */
const iteratorToTuples = Array.from //it => [...it]

/**   uniqueHeaders :: Array Headers -> Array String */
const uniqueHeaders_ = S.pipe ([
  S.map (iteratorToTuples),
  S.join,
  S.sort,
  S.groupBy (S.equals),
  S.map (S.compose (S.map (S.joinWith (': ')))
                   (S.head)),
  S.sequence (S.Maybe),
  S.maybe ([]) (S.I)
])

/**   uniqueHeaders :: Array Headers -> Array String */
const uniqueHeaders = def ('uniqueHeaders')
                          ({})
                          ([$.Array ($.Headers), $.Array ($.String)])
                          (uniqueHeaders_)

const headers1 = new Headers ()
headers1.append ('Content-Type', 'image/jpeg')
headers1.append ('Cache-Control', 'max-age=300')

const headers2 = new Headers ()
headers2.append ('content-type', 'image/jpeg')
headers2.append ('content-length', '28982898')


log (
  uniqueHeaders ([headers1, headers2, headers1])
  // ["cache-control: max-age=300", "content-length: 28982898", "content-type: image/jpeg
)

// log (
//   uniqueHeaders ([1]),
//   // S.join ([1]),
//   // S.groupBy (S.equals) ([1]),
//   // S.sequence (S.Maybe) ([1])
// )
