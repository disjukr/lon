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

### class instance
```javascript
var assert = require('assert');
var LON = require('lon');

function A(a, b) {
    this.a = a;
    this.b = b;
    this.c = this;
}

var a = new A(1, 2);

var str = LON.stringify(a, {A: A}); // 'A{1:2,3:4,5:0},"a",1,"b",2,"c"'
var obj = LON.parse(str, {A: A});

assert(obj instanceof A); // ok
assert.equal(obj.a, 1); // ok
assert.equal(obj.b, 2); // ok
assert.deepStrictEqual(a, obj); // ok
```


## license

distributed under the zlib license
