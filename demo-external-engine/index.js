'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'demo-external-engine',
  lazyLoading: {
    enabled: false
  }
});
