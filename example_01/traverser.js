#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

/**
 * @param filePath the start path of traverse
 * @param callback (err, res). res is the absolute path of file.
 */
function traverse(filePath, callback) {

    filePath = path.resolve(filePath);
    // get file stats
    fs.lstat(filePath, function(err, stats) {
        if (err) {
            callback(err);
        } else {
            // check whether a file or dir
            if (stats.isDirectory()) {
                // get all files and dirs in directory
                fs.readdir(filePath, function (err, files) {
                    if (err) {
                        callback(err);
                    } else {
                        files.forEach(function(item) {
                            // call traverse recursively
                            traverse(path.resolve(filePath, item), callback);
                        });
                    }
                });
            } else {
                // return the file path.
                callback(null, filePath);
            }
        }
    });
}

/*  call traverse */
traverse(process.argv[2], function(err, res) {
    if (err) {
        console.error(err);
    } else {
        console.log(res);
    }
});
