'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fslstat = Promise.promisify(fs.lstat);
var fsreaddir = Promise.promisify(fs.readdir);

// function traverse(rootPath)
function traverse(list, fileList) {
    return new Promise(function (resolve) {
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
    })
}

function task (current, list, fileList) {
    return fslstat(current)
        .then(function (stats) {
            if (stats.isDirectory()){
                // if current path is subdir, list this subdir
                return fsreaddir(current)
                    .then(function(files) {
                        var paths = files.map(function (item) {
                            return path.resolve(current, item);
                        });
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


/*  call traverse */
/* promise api */
traverse(process.argv[2])
    .then(function(res) {
        console.log(res.length + '\n' + JSON.stringify(res));
    })
    .catch(function(err) {
        console.error('Catch Error:', err);
    });

