'use strict'
/**
 * app.js
 *
 * defines AngularJS "qmimo" module & initial config
 */
angular
  .module('qmimo', ['ui.router', 'ngSanitize'])
  // state handling done in individual Controllers, so just set default here
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
    }
  ]);