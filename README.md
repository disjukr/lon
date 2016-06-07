# lon

lon is another json that supports:

 * array holes
 * circular references
 * `NaN`, `Infinity`, `-Infinity`
 * distinguish `undefined` from `null`
 * distinguish `-0` from `0`


## install

```sh
npm install lon
```


## usage
```javascript
var LON = require('lon');
var a = [{foo: 'bar'}, undefined, null, 0, -0, ,];
a.push(a);

console.log(LON.stringify(a)); // '[1,u,n,4,5,,0,],{2:3},"foo","bar",0,-0'

require('assert').deepStrictEqual(a, LON.parse(LON.stringify(a))); // ok
```


## license

distributed under the zlib license
