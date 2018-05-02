'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'demo-external-engine-two',
  lazyLoading: {
    enabled: false
  }
});
