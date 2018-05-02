import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.mount('demo-external-engine');
  this.mount('demo-external-engine-two');
  this.mount('demo-in-repo-engine');
  this.mount('demo-in-repo-engine-two');
  this.mount('demo-in-repo-lazy-engine');
});

export default Router;
