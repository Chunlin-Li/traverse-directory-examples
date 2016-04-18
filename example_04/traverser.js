#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

// function traverse(rootPath)
function traverse(list, fileList) {
    return new Promise(
        function (resolve) {
            // a params overload trick
            if (typeof list === 'string') {
                list = [ list ];
            }
            fileList = fileList || [];
            // dequeue a item
            var current = list.shift();
            if (current) {
                resolve(task(current, list, fileList));
            } else {
                // no more path in target list, resolve final result
                resolve(fileList);
            }
        }
    )
}

// convert promise style api to callback style
function traverse_callback(filePath, returnCallback) {
    traverse([ filePath ]).then(returnCallback.bind(null, null), returnCallback);
}

function task (current, list, fileList) {
    return check(current)
        .then(function (type){
            if ('dir' === type){
                // if current path is subdir, list this subdir
                return list_subdir(current)
                    .then(function(paths){
                        list = list.concat(paths);
                        return traverse(list, fileList);
                    });
            } else {
                // add file path to result list.
                fileList.push(current);
                return traverse(list, fileList);
            }
        });
}


// wrap a constructed promise
function check(filePath) {
    return new Promise(
        function(resolve, reject) {
            fs.lstat(filePath, function (err, stats) {
                if (err) reject(err);
                // return file type
                else resolve(stats.isDirectory() ? 'dir' : 'file');
            });
        }
    )
}

// wrap a thenable
function list_subdir(dirPath) {
    return Promise.resolve({
        then(resolve, reject){
            fs.readdir(dirPath, function (err, files){
                if (err) {
                    reject(err);
                } else {
                    // list and resolve all file path in sub dir.
                    var paths = files.map(function (item) {
                        return path.resolve(dirPath, item);
                    });
                    // return
                    resolve(paths);
                }
            });
        }
    });
}


/*  call traverse */
/* promise api */
traverse(process.argv[2])
    .then(function(res) {
        console.log(res.length + '\n' + JSON.stringify(res));
    })
    .catch(function(err) {
        console.error('Catch Error:', err);
    });

/* callback api */
// traverse_callback(process.argv[2], function(err, res){
//     console.log(res.length + '\n' + JSON.stringify(res));
// });
