#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Emitter = require('events').EventEmitter;

// event:
//  file:   param: {string} file Path
//  dir:    param: {string} directory Path
//  end
function Traverser (filePath) {
    // prevent non-constructor call
    if (!(this instanceof Traverser))
        return new Traverser(filePath);

    // extends EventEmitter instance
    Emitter.call(this);

    this._root = filePath;
    this._list = [ path.resolve(this._root) ];
    this._current = null;

    this.addListener('_next', onNext);
    this.addListener('_check', onCheck);
    this.addListener('_more', onMore);
    this.addListener('file', onNext);
}
// extends EventEmitter prototype
util.inherits(Traverser, Emitter);

Traverser.prototype.start = function () {
    this.emit('_next');
};

function onNext() {
    this._current = this._list.shift();
    if (this._current) {
        // get file state info
        fs.lstat(this._current, bindEvt(this, '_check'));
    } else {
        this.emit('end');
    }
}

function onCheck(err, stats) {
    if (err) {
        this.emit('error', err);
    } else {
        // check whether a file or dir
        if (stats.isDirectory()) {
            // get all files and dirs in directory
            this.emit('dir', this._current);
            fs.readdir(this._current, bindEvt(this, '_more'));
        } else {
            // return filePath
            this.emit('file', this._current);
        }
    }
}

function onMore(err, files) {
    if (err) {
        this.emit('error', err);
    } else {
        // list and resolve all file in sub dir.
        var paths = files.map(function (item) {
            return path.resolve(this._current, item);
        }.bind(this));
        // add to list
        this._list = this._list.concat(paths);
        this.emit('_next');
    }
}

function bindEvt(target, event) {
    return function () {
        target.emit.apply(target, [event].concat(Array.prototype.slice.call(arguments)));
    }
}


/*  call traverse */

var trav = new Traverser(process.argv[2]);

trav.on('file', function (res) {
    console.log(res);
}).on('error', function (err) {
    console.error(err);
}).start();
