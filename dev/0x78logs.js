import sanctuary from 'sanctuary';
import * as F    from 'fluture';
import {
  env as flutureEnv
}                from 'fluture-sanctuary-types';

const checkTypes = true;
const env = sanctuary.env.concat (flutureEnv);
const S = sanctuary.create ({ checkTypes, env });

const log = console.log;
const is_request_ready = true;
// const response = S.Nothing; // <- Can't call api!
const response = S.Just (F.resolve ('42')); // <- '42'

const result = S.when (S.K (is_request_ready))
                      (S.I)
                      (S.fromMaybe (F.reject("Can't call api!")) (response));

F.fork (log) (log) (result);
