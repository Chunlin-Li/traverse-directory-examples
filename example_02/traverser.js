#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

/**
 * @param filePath the start path of traverse
 * @param callback (err, res). res is the absolute path of file.
 */
function traverse(filePath, callback) {
    // initial state
    var list = [ path.resolve(filePath) ];
    // start traverse
    next();

    function next() {
        var current = list.shift();
        if (current) {
            // get file state info
            fs.lstat(current, check.bind(null, current));
        }
    }

    function check(current, err, stats) {
        if (err) {
            callback(err);
        } else {
            // check whether a file or dir
            if (stats.isDirectory()) {
                // get all files and dirs in directory
                fs.readdir(current, add_subdir.bind(null, current))
            } else {
                // return filePath
                callback(null, current);
                next();
            }
        }
    }

    function add_subdir(current, err, files) {
        if (err) {
            callback(err);
        } else {
            // list and resolve all file path in sub dir.
            var paths = files.map(function (item) {
                return path.resolve(current, item);
            });
            // add to list
            list = list.concat(paths);
            next();
        }
    }
}





/*  call traverse */
traverse(process.argv[2], function(err, res) {
    if (err) {
        console.error(err);
    } else {
        console.log(res);
    }
});
