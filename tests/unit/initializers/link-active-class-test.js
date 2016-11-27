import Ember from 'ember';
import LinkActiveClassInitializer from 'tactic-front/initializers/link-active-class';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | link active class', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LinkActiveClassInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
