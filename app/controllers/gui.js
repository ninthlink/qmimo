'use strict'
/**
 * guiCtrl Controller
 *
 * for states (in app.js config) :
 * / with /partials/gui.html
 */
angular
  .module('qmimo')
  // app states for this Controller
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('gui', {
          url: '/',
          templateUrl: './partials/gui.html',
          controller: 'guiCtrl',
          resolve: {
            initialData: function( tputFactory ) {
              return tputFactory.initDeviceThroughputs();
            }
          }
        });
    }
  ])
  .controller('guiCtrl', guiCtrl);

// inject dependencies
guiCtrl.$inject = [ '$scope', '$rootScope', '$state', '$stateParams', '$window', 'tputFactory', 'initialData' ];

function guiCtrl( $scope, $rootScope, $state, $stateParams, $window, tputFactory, initialData ) {
  // some initial GUI setup
  $scope.switchleft = true;
  $scope.switching = false;
  $scope.switchdelay = QMIMO_SWITCH_DELAY_MS;
  // populate initialData from our tputFactory
  console.log(': initialData :');
  console.log(initialData);
  $scope.mode = initialData.mode;
  $scope.devices = initialData.tputs;
  $scope.devicenum = $scope.devices.length;
  
  $scope.retotal = function() {
    var new_mu = 0,
        new_su = 0;
    angular.forEach( $scope.devices, function( d, k ) {
      new_mu += d[1];
      new_su += d[2];
    });
    $scope.mu_total = new_mu;
    $scope.su_total = new_su;
    // round gain to 2 dec?
    $scope.mu_gain = new_su > 0 ? ( Math.round( new_mu * 100 / new_su ) / 100 ) : 0;
  };
  $scope.retotal();
  
  $scope.switchmode = function() {
    if ( $scope.switching === false ) {
      $scope.switchleft = !$scope.switchleft;
      var prevmode = $scope.mode;
      console.log( 'switching modes : from ' + prevmode );
      console.log( 'with a switch delay of '+ $scope.switchdelay +'ms' );
      $scope.switching = true;
      $scope.mode = '';
      setTimeout(function() {
        $scope.$apply( function() {
          $scope.mode = ( prevmode === 'mu' ? 'su' : 'mu' );
          $scope.switching = false;
          console.log( 'switched from '+ prevmode +' to '+ $scope.mode );
        });
      }, $scope.switchdelay );
    } else {
      console.log( 'switch already in progress, please wait..' );
    }
  };
  
  $scope.switchmodeto = function( m ) {
    if ( $scope.switching === false ) {
      if ( $scope.mode !== m ) {
        // init switch
        $scope.switchmode();
      }
    }
  };
}