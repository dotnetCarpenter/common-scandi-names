import { S, F } from './sanctuary.js'
import Do       from 'lazy-do'

const futureResult = Do (function* () {
  return F.race (F.rejectAfter (20) ('Task timed out')) (F.after (10) ('Task resolved'))
}, F.Future)

F.fork (console.error)
       (console.log)
       (futureResult) // -> Task resolved
