// Copyright 2014 Orchestrate, Inc.
/**
 * @fileoverview Test search methods
 */

// Module Dependencies.
var assert = require('assert');
var token = require('./creds').token;
var db = require('../lib-cov/client')(token);
var users = require('./testdata');
var Q = require('kew');
var util = require('util');


suite('Search', function () {
  suiteSetup(function (done) {
    users.reset(function(res) {
      if (!res) {
        users.insertAll(function() {
          // Give search a chance to index all changes
          setTimeout(done, 1500);
        });
      } else {
        done(res);
      }
    });
  });

    // Basic search
  test('Basic search', function (done) {
    db.newSearchBuilder()
      .collection('users')
      .query('location: New*')
      .then(function (res) {
        assert.equal(200, res.statusCode);
        assert.equal(2, res.body.count);
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  // Search with offset
  test('Search with offset', function (done) {
    db.newSearchBuilder()
      .collection('users')
      .offset(2)
      .query('*')
      .then(function (res) {
        assert.equal(200, res.statusCode);
        // Order doesn't matter, but there should be only 1 out of the three in
        // the result
        assert.equal(1, res.body.count);
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  // Search with offset and limit
  test('Search with offset & limit', function (done) {
    db.newSearchBuilder()
      .collection('users')
      .offset(1)
      .limit(1)
      .query('*')
      .then(function (res) {
        assert.equal(200, res.statusCode);
        // XXX: API inconsistency?
        //        assert.equal(2, res.body.total_count);
        assert.equal(1, res.body.count);
        assert.equal(res.body.next, '/v0/users?limit=1&query=*&offset=2');
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  // Search and sort
  test('Search and sort', function (done) {
    db.newSearchBuilder()
      .collection('users')
      .sort('name', 'desc')     // Reverse-alpha
      .query('New York')
      .then(function (res) {
        assert.equal(200, res.statusCode);
        assert.equal(2, res.body.results.length);
        assert.equal(users.steve.email, res.body.results[0].path.key);
        assert.equal(users.david.email, res.body.results[1].path.key);
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  // Geo-search
});
