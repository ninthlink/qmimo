'use strict'
/**
 * app.js
 *
 * defines AngularJS "qmimo" module & initial config
 */
var qmimo = angular.module('qmimo', ['ui.router', 'ngSanitize']);
// state handling done in individual Controllers, so just set default here
qmimo.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }
]);
qmimo.directive('qmimoKeyListen', [function() {
  return {
    link: function (scope, element, attrs, controller) {
      element.on('keypress', function(e){
        console.log('keypress '+ e.keyCode);
      });
    }
  }
}]);