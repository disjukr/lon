var Parser = require('another-jison!lon.jison').Parser;
var yy = {
    u: {},
    n: {},
    N: {},
    i: {},
    I: {},
    v: {}
};
var lonParser = new Parser();
lonParser.yy = yy;

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function map(mem, arr) {
    for (var i = 0; i < arr.length; ++i) {
        if (typeof arr[i] === 'number') {
            arr[i] = mem[arr[i]];
        }
    }
}

function kwd(arr) {
    for (var i = 0; i < arr.length; ++i) {
        switch (arr[i]) {
        case yy.u: arr[i] = undefined; continue;
        case yy.n: arr[i] = null; continue;
        case yy.N: arr[i] = NaN; continue;
        case yy.i: arr[i] = Infinity; continue;
        case yy.I: arr[i] = -Infinity; continue;
        case yy.v: delete arr[i]; continue;
        }
    }
}

exports.parse = function parse(text, classMap) {
    yy.bindClass = function (instance, className) {
        var cls = classMap[className];
        if (cls) {
            var newInstance = Object.create(cls.prototype);
            newInstance.ks = instance.ks;
            newInstance.vs = instance.vs;
            return newInstance;
        } else {
            return instance;
        }
    };
    var mem = lonParser.parse(String(text));
    kwd(mem);
    for (var i = 0; i < mem.length; ++i) {
        var curr = mem[i];
        if (curr && typeof curr === 'object') {
            if (isArray(curr)) {
                map(mem, curr);
                kwd(curr);
            } else {
                var ks = curr.ks;
                var vs = curr.vs;
                delete curr.ks;
                delete curr.vs;
                map(mem, ks);
                map(mem, vs);
                kwd(vs);
                for (var j = 0; j < ks.length; ++j) {
                    curr[ks[j]] = vs[j];
                }
            }
        }
    }
    return mem[0];
};

function isKwd(value) {
    if (value) {
        switch (value) {
        case true:
        case Infinity:
        case -Infinity:
            return true;
        default:
            return false;
        }
    }
    if (value === 0 || value === '') {
        return false;
    }
    return true;
}

function toKwd(value) {
    if (value !== value) {
        return 'N';
    }
    switch (value) {
    case undefined: return 'u';
    case null: return 'n';
    case Infinity: return 'i';
    case -Infinity: return 'I';
    case true: return 't';
    case false: return 'f';
    }
}

function is(a, b) {
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    }
    return a !== a && b !== b;
}

function visit(histogram, value) {
    if (isKwd(value)) {
        return;
    }
    for (var i = 0; i < histogram.length; ++i) {
        if (is(histogram[i].v, value)) {
            ++histogram[i].c;
            return;
        }
    }
    histogram.push({v: value, c: 1});
    if (typeof value === 'object') {
        if (isArray(value)) {
            for (var i in value) {
                visit(histogram, value[i]);
            }
        } else {
            for (var key in value) {
                visit(histogram, key);
                visit(histogram, value[key]);
            }
        }
    }
}

function idx(histogram, value) {
    if (isKwd(value)) {
        return toKwd(value);
    }
    for (var i = 0; i < histogram.length; ++i) {
        if (is(histogram[i].v, value)) {
            return i.toString(36);
        }
    }
    return '-1';
}

function toStr(histogram, value, findClassName) {
    if (isKwd(value)) {
        return toKwd(value);
    }
    switch (typeof value) {
    case 'object':
        if (isArray(value)) {
            var result = '[';
            for (var i = 0; i < value.length; ++i) {
                if (i in value) {
                    result += idx(histogram, value[i]) + ',';
                } else {
                    result += ',';
                }
            }
            return result + ']';
        } else {
            var kvs = [];
            for (var key in value) {
                kvs.push(idx(histogram, key) + ':' + idx(histogram, value[key]));
            }
            if (value.constructor !== Object) {
                var className = findClassName(value.constructor);
                if (className) {
                    return className + '{' + kvs.join(',') + '}';
                }
            }
            return '{' + kvs.join(',') + '}';
        }
    case 'number':
        if (value === 0) {
            return is(value, 0) ? '0' : '-0';
        }
        return String(value);
    case 'string':
        return JSON.stringify(value);
    default:
        return 'u';
    }
}

exports.stringify = function stringify(value, classMap) {
    var denormMap = {
        names: [],
        classes: []
    };
    function findClassName(cls) {
        var i = denormMap.classes.indexOf(cls);
        if (i === -1) return null;
        return denormMap.names[i];
    }
    if (classMap) {
        for (var className in classMap) {
            denormMap.names.push(className);
            denormMap.classes.push(classMap[className]);
        }
    }
    if (value && typeof value === 'object') {
        var histogram = [];
        visit(histogram, value);
        histogram.sort(function (a, b) {
            if (is(value, a.v)) {
                return -1;
            }
            if (is(value, b.v)) {
                return 1;
            }
            return b.c - a.c;
        });
        return histogram.map(function (item) {
            return toStr(histogram, item.v, findClassName);
        }).join(',');
    } else {
        return toStr(null, value, findClassName);
    }
};
