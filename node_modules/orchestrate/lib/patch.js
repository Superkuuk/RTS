// Copyright 2014 Orchestrate, Inc.

// Module Dependencies.
var assert = require('assert');
var Builder = require('./builder');

/**
 * @constructor
 */
function PatchBuilder (collection, key) {
  assert(collection && key, 'Collection and key are required.');
  this._collection = collection;
  this._key = key;
  this._ops = [];
}

require('util').inherits(PatchBuilder, Builder);

/**
 * Add a value at the given path in the JSON document
 * @param {string} path - JSON document path; delimited by periods or slashes
 * @param {Object} value - Value to store at the given path
 */
PatchBuilder.prototype.add = function (path, value) {
  assert(path, 'Add requires a path parameter.');
  this._ops.push({"op": "add", "path": path, "value": value});
  return this;
};

/**
 * Remove a value from the given path in the JSON document
 * @param {string} path - JSON document path; delimited by periods or slashes
 */
PatchBuilder.prototype.remove = function (path) {
  assert(path, 'Remove requires a path parameter.');
  this._ops.push({"op": "remove", "path": path});
  return this;
};

/**
 * Replace a value at the given path in the JSON document
 * @param {string} path - JSON document path; delimited by periods or slashes
 * @param {Object} value - Value to replace at the given {path}
 */
PatchBuilder.prototype.replace = function (path, value) {
  assert(path, 'Replace requires a path parameter.');
  this._ops.push({"op": "replace", "path": path, "value": value});
  return this;
};

/**
 * Move a value at from one path in the JSON document to another path
 * @param {string} from - Source from which to move the value
 * @param {string} path - Destination document path for the value
 */
PatchBuilder.prototype.move = function (from, path) {
  assert(from && path, 'Move requires from and path parameters.');
  this._ops.push({"op": "move", "from": from, "path": path});
  return this;
};

/**
 * Copy a value at from one path in the JSON document to another path
 * @param {string} from - Source path from which to copy the value
 * @param {string} path - Destination path for the value
 */
PatchBuilder.prototype.copy = function (from, path) {
  assert(from && path, 'Copy requires from and path parameters.');
  this._ops.push({"op": "copy", "from": from, "path": path});
  return this;
};

/**
 * Test equality of a value at the specified JSON document path
 * @param {string} path - JSON document path; delimtied by periods or slashes
 * @param {Object} value - Value to compare against
 */
PatchBuilder.prototype.test = function (path, value) {
  assert(path, 'Test requires a path parameter.');
  this._ops.push({"op": "test", "path": path, "value": value});
  return this;
};

/**
 * return {Promise}
 */
PatchBuilder.prototype.apply = function (match) {
  assert(this._ops.length > 0, 'At least one operation is required in a patch operation.');
  assert(this.getDelegate(), 'No client delegate assigned');
  var pathArgs = [this._collection, this._key];
  var url = this.getDelegate().generateApiUrl(pathArgs);
  var header = {'Content-Type': 'application/json-patch+json'};
  if (typeof match === 'string') header['If-Match'] = this.getDelegate()._quote(match);
  return this.getDelegate()._patch(url, this._ops, header);
};


// Module Exports.
module.exports = PatchBuilder;
