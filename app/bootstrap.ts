import {provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Authentication} from './services/Authentication';
import {AppCmp} from './components/app/app';
import {MessageBroker} from './services/MessageBroker';
import {DataService} from './services/DataService';

bootstrap(AppCmp, [
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  provide(LocationStrategy, {useClass: HashLocationStrategy}),
  Authentication,
  MessageBroker,
  DataService
]);
