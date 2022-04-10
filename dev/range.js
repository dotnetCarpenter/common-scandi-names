'use strict'

const range = function* (start, end) {
  let i = start
  while (i < end) {
    yield i
    ++i
  }
}

const sequence = [...range (1, 100)]

console.log (sequence) // -> [1...99]
