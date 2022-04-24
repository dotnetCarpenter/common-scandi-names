How do you people deal with [iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterables)?

I am always puzzled about how to work with them. My response is to convert them to an `Array` as quickly as possible before I work with the data in Sanctuary.
Probably not the most advantageous thing to do.

Say I want to remove duplicates from an `Array` of [`Headers`](https://devdocs.io/dom/headers), so that I end up with a list of all of the different `Headers` as `String`s.

```haskell
uniqueHeaders :: Array Headers -> Array String

iteratorToTuples :: Iterator a a -> Array (Array a)
```

```js
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

uniqueHeaders ([headers1,headers2,headers1])
// ["cache-control: max-age=300", "content-length: 28982898", "content-type: image/jpeg"]
```

I came up with a whole bunch of functions to transform iterators:


```js
/**   iteratorToArray :: Iterator a a -> Array a */
const iteratorToArray = it => S.join ([...it])

/**   iteratorToTuples :: Iterator a a -> Array (Array a) */
const iteratorToTuples = Array.from //it => [...it]

/**   tuplesToPairs :: Array (Array a) -> Array (Pair a a) */
const tuplesToPairs = S.map (([fst, snd]) => S.Pair (fst) (snd))

/**   iteratorToPairs :: Iterator a a -> Array (Pair a a) */
const iteratorToPairs = S.compose (tuplesToPairs)
                                  (iteratorToTuples)
```

But I feel there might be a missed opportunity when converting iterables to Array.

And I am wondering how you usually deal with iterators?
