// Copyright 2014 Orchestrate, Inc.
/**
 * @fileoverview Test graph methods
 */

// Module Dependencies.
var assert = require('assert');
var token = require('./creds').token;
var db = require('../lib-cov/client')(token);
var users = require('./testdata');
var Q = require('kew');
var util = require('util');

var r = function(collection, from, to, kind) {
  return db.newGraphBuilder()
    .create()
    .from(collection, from)
    .related(kind)
    .to(collection, to);
};


suite('Graph', function () {
  suiteSetup(function (done) {
    users.reset(function(res) {
      if (!res) {
        users.insertAll(done);
      } else {
        done(res);
      }
    });
  });

  test('Create graph relationships', function(done) {
     var relations = [r('users', users.steve.email, users.kelsey.email, "friend"),
                      r('users', users.kelsey.email, users.david.email, "friend")];

    Q.all(relations)
      .then(function (res) {
        assert.equal(2, res.length);
        for (var i in res) {
          assert.equal(204, res[i].statusCode);
        }
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  test('Traverse graph relationship', function(done) {
    db.newGraphReader()
      .get()
      .from('users', users.steve.email)
      .related('friend', 'friend')
      .then(function (res) {
        assert.equal(200, res.statusCode);
        assert.deepEqual(users.david, res.body.results[0].value);
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

  test('Delete graph relationship', function(done) {
    db.newGraphBuilder()
      .remove()
      .from('users', users.kelsey.email)
      .related('friend')
      .to('users', users.david.email)
      .then(function (res) {
        assert.equal(res.statusCode, 204);
        return db.newGraphReader()
          .get()
          .from('users', users.steve.email)
          .related('friend', 'friend');
      })
      .then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.count, 0);
        done();
      })
      .fail(function (res) {
        done(res);
      });
  });

});
