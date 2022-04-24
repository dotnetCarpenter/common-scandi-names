import { S, F, $ }  from './sanctuary.js'

/**   iteratorToTuples :: Iterator a a -> Array (Array a) */
const iteratorToTuples = Array.from //it => [...it]

/**   uniqueHeaders :: Array Headers -> Array String */
const uniqueHeaders = S.pipe ([
  S.map (iteratorToTuples),
  S.join,
  S.sort,
  S.groupBy (S.equals),
  S.map (S.head),
  S.map (S.map (S.joinWith (': '))),
  S.sequence (S.Maybe),
  S.maybe ([]) (S.I)
])

const headers1 = new Headers ()
headers1.append ('Content-Type', 'image/jpeg')
headers1.append ('Cache-Control', 'max-age=300')

const headers2 = new Headers ()
headers2.append ('Content-Type', 'image/jpeg')
headers2.append ('content-length', '28982898')

console.log (
  uniqueHeaders ([headers1,headers2,headers1])
  // ["cache-control: max-age=300", "content-length: 28982898", "content-type: image/jpeg"]
)
