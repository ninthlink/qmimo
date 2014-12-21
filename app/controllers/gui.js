'use strict'
/**
 * guiCtrl Controller
 *
 * for states (in app.js config) :
 * / with /partials/gui.html
 */
angular
  .module('qmimo')
  // app state setup for this Controller
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
              return tputFactory.getDevicesTput( true );
            }
          }
        });
    }
  ])
  .controller('guiCtrl', guiCtrl);
// inject Controller dependencies
guiCtrl.$inject = [ '$scope', '$rootScope', '$state', '$stateParams', '$window', 'tputFactory', 'fakeTputGeneratorFactory', 'initialData', '$timeout' ];
/**
 * our main Controller
 */
function guiCtrl( $scope, $rootScope, $state, $stateParams, $window, tputFactory, fakeTputGeneratorFactory, initialData, $timeout ) {
  // some initial GUI setup
  $scope.switchleft = true;
  $rootScope.loading = false;
  $scope.switchdelay = QMIMO_SWITCH_DELAY_MS;
  // populate initialData from our tputFactory
  console.log(': initialData :');
  console.log(initialData);
  $rootScope.mode = initialData.mode;
  $scope.devices = initialData.tputs;
  $scope.devicenum = $scope.devices.length;
  // recalculate our top MU & SU numbers based on all devices' tputs
  $scope.retotal = function() {
    var new_mu = 0,
        new_su = 0;
    angular.forEach( $scope.devices, function( d, k ) {
      new_mu += d[1];
      new_su += d[2];
    });
    $scope.mu_total = new_mu;
    $scope.su_total = new_su;
    // round gain to set # of decimals?
    var d = Math.pow( 10, QMIMO_MU_GAIN_DECIMAL_PLACES );
    // also make sure we don't accidentally try to device by 0
    if ( new_su > 0 ) {
      $scope.mu_gain = Math.round( new_mu * d / new_su ) / d;
    } else {
      $scope.mu_gain = 0;
    }
  };
  $scope.retotal();
  // set timeout to re pull tput datas?
  var tputTimer;
  $scope.reloadTput = function() {
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      //console.log( '*** re-get devices tputs ***' );
      tputFactory.getDevicesTput().then(function(results) {
        //console.log(' mode = '+ $rootScope.mode);
        //console.log(results);
        $scope.devices = results.tputs;
        $scope.retotal();
      });
      // and no matter how long that takes, trigger this loop again?
      $scope.reloadTput();
    }, QMIMO_REFRESH_TPUT_MS );
  };
  $scope.reloadTput();
  // similar call for fake generating numbers via our fakeTputGeneratorFactory
  var tputGenTimer;
  $scope.kickGenerator = function() {
    $timeout.cancel( tputGenTimer );
    tputGenTimer = $timeout( function() {
      fakeTputGeneratorFactory.genDeviceTput().then(function(results) {
        //console.log('finished re-generating demo numbers?');
        //console.log(results);
        $scope.kickGenerator();
      });
    }, QMIMO_FAKE_DEMO_LOOP_MS );
  };
  // if we actually want to actually fake the numbers?
  if ( QMIMO_FAKE_DEMO === true ) {
    $scope.kickGenerator();
  }
  // action(s) to take when a button is pressed to switch between MU/SU mode
  $scope.switchMode = function() {
    if ( $rootScope.loading === false ) {
      $scope.switchleft = !$scope.switchleft;
      var prevmode = $rootScope.mode;
      var newmode = ( prevmode === 'mu' ? 'su' : 'mu' );
      console.log( 'switching modes : from ' + prevmode );
      console.log( '( after delay of '+ $scope.switchdelay +'ms )' );
      $rootScope.loading = true;
      $rootScope.mode = '';
      // pause tput # getting..
      $timeout.cancel( tputTimer );
      // after our QMIMO_SWITCH_DELAY_MS, turn the GUI back on
      $timeout(function() {
        $scope.$apply( function() {
          $rootScope.mode = newmode;
          $rootScope.loading = false;
          // and after the delay, start getting the data again?
          $scope.reloadTput();
          console.log( 'switched from '+ prevmode +' to '+ $scope.mode );
        });
      }, $scope.switchdelay );
    } else {
      console.log( 'switch already in progress, please wait..' );
    }
  };
  // helper UI function to switch between modes to specified mode
  $scope.switchModeTo = function( m ) {
    if ( $rootScope.loading === false ) {
      if ( $rootScope.mode !== m ) {
        // init switch
        $scope.switchMode();
      }
    }
  };
  $scope.$on( '$destroy', function( event ) {
    // be polite : cancel timeout(s)
    $timeout.cancel( tputTimer );
    // and then?
    console.log( 'ok thank you' );
  });
}