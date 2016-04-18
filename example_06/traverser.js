#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');


var traverse = function*(filePath) {
    let list = [ path.resolve(filePath) ],
        fileList = [],
        tmp = null,
        curr = null,
        stat = null;

    while (list.length > 0) {
        curr = list.shift();
        stat = (yield $P(fs.lstat)(curr))[1]; // (yield xxx)[1] is stats. [0] is err.
        if (!stat) continue; // just ignore err here
        if (stat.isDirectory()) {
            tmp = (yield $P(fs.readdir)(curr))[1]; // (yield xxx)[1] is fileNames, [0] is err.
            if (!tmp) continue;  // just  ignore err here
            tmp = tmp.map(item => path.resolve(curr, item));
            list = list.concat(tmp);
        } else {
            fileList.push(curr);
        }
    }
    return fileList;
};


// a simple promisify function like bluebird.promisify
function $P(fn) {
    return function() {
        let THIS = this ? this : {};
        let args = [].slice.call(arguments);
        return new Promise(function(resolve) {
            args.push(function(){
                resolve([].slice.call(arguments));
            });
            fn.apply(this, args);
        }.bind(THIS));
    };
}
// a simple Executor like co.
function simpleExecutor(gen) {
    let args = [].splice.call(arguments, 1);
    gen = gen.apply(null, args);
    return (function looper (prom) {
        return prom.then(realValue => {
            let t =gen.next(realValue); // t = {value: promise, done:xxx}
            return t.done ? t.value : looper(Promise.resolve(t.value));
        });
    })(Promise.resolve());
}



/*  call traverse */
/* promise api */
simpleExecutor(traverse, process.argv[2])
    .then(res => console.log(res.length + '\n' + JSON.stringify(res)))
    .catch(err => console.error('Catch Error:', err));

