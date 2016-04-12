#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

// function traverse(rootPath)
function traverse(list, fileList) {
    // a params overload trick
    if (typeof list === 'string') {
        list = [ list ];
    }
    fileList = fileList || [];
    return new Promise(
        function (resolve, reject) {
            var current = list.shift();
            if (current) {
                check(current)
                    .then(function (type){
                        if ('dir' === type){
                            // if current path is subdir, list this subdir
                            return list_subdir(current);
                        } else {
                            // add file path to result list.
                            fileList.push(current);
                            // go on
                            resolve(traverse(list, fileList));
                        }
                    })
                    .then(function(paths){
                        if (!paths) return;
                        // add to target list
                        list = list.concat(paths);
                        // go on
                        resolve(traverse(list, fileList));
                    });
            } else {
                // no more path in target list
                resolve(fileList);
            }
        }
    )
}

// convert promise style api to callback style
function traverse_callback(filePath, returnCallback) {
    traverse([ filePath ]).then(returnCallback.bind(null, null), returnCallback);
}

function check(filePath) {
    return new Promise(
        function(resolve, reject) {
            fs.lstat(filePath, function (err, stats) {
                if (err) {
                    reject(err);
                } else {
                    // return file type
                    resolve(stats.isDirectory() ? 'dir' : 'file');
                }
            });
        }
    )
}

function list_subdir(dirPath) {
    return new Promise(
        function(resolve, reject) {
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
            })
        }
    );
}


/*  call traverse */
// promise api
traverse(process.argv[2])
// traverse('../')
    .then(function(res) {
        console.log(res.length + '\n' + JSON.stringify(res));
    })
    .catch(function(err) {
        console.error('Catch Error:', err);
    });

// callback api
// traverse_callback(process.argv[2], function(err, res){
//     console.log(res.length + '\n' + JSON.stringify(res));
// });
