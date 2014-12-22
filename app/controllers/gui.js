'use strict'
/**
 * gui.js
 * 
 * Defines main guiCtrl Controller + which route & HTML partial template to use
 */
angular
  .module('qmimo')
  // app state setup for this Controller
  .config([
    '$stateProvider',
    function( $stateProvider ) {
      $stateProvider.state('gui', {
        url: '/',
        templateUrl: './partials/gui.html',
        controller: 'guiCtrl',
        resolve: {
          // "resolve" polls initial tput data before the UI loads
          initialData: function( tputFactory ) {
            return tputFactory.getDevicesTput( true );
          }
        }
      });
    }
  ])
  .controller('guiCtrl', guiCtrl);
// inject any Angular dependencies in to our Controller, like our Factories
guiCtrl.$inject = [ '$scope', '$rootScope', '$timeout', 'tputFactory', 'fakeTputGeneratorFactory', 'initialData' ];
/**
 * We are in the GUI Controller's control from here out
 */
function guiCtrl( $scope, $rootScope, $timeout, tputFactory, fakeTputGeneratorFactory, initialData ) {
  // initial GUI setup & map initialData from our tputFactory
  $rootScope.loading = false;
  $rootScope.mode = initialData.mode;
  $scope.switchleft = ( $rootScope.mode === 'mu' );
  $scope.devices = initialData.tputs;
  $scope.devicenum = $scope.devices.length;
  $scope.roundtotals = QMIMO_TPUT_TOTALS_DECIMAL_PLACES;
  $scope.roundgain = QMIMO_MU_GAIN_DECIMAL_PLACES;
  // recalculate our top MU & SU numbers based on all devices' tputs
  $scope.retotal = function() {
    var mu_total = 0,
        su_total = 0;
    angular.forEach( $scope.devices, function( d, k ) {
      mu_total += d[1];
      su_total += d[2];
    });
    $scope.mu_total = mu_total;
    $scope.su_total = su_total;
    // Divide gain, but no divide by 0. Rounding handled by ng "number" filter
    $scope.mu_gain = ( su_total > 0 ) ? mu_total / su_total : 0;
  };
  $scope.retotal();
  // Set timeout to (re) poll tput datas
  var tputTimer;
  $scope.reloadTputNow = function( newmode ) {
    tputFactory.getDevicesTput( false, newmode ).then(function(results) {
      //console.log(' mode = '+ $rootScope.mode);
      //console.log(results);
      $rootScope.loading = false;
      $rootScope.mode = results.mode;
      $scope.devices = results.tputs;
      $scope.retotal();
    });
    // and no matter how long that takes, trigger this again
    $scope.reloadTput();
  };
  $scope.reloadTput = function() {
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      $scope.reloadTputNow();
    }, QMIMO_REFRESH_TPUT_MS );
  };
  $scope.reloadTput();
  // similar idea to fake generating numbers via fakeTputGeneratorFactory
  var tputGenTimer;
  $scope.kickGenerator = function() {
    $timeout.cancel( tputGenTimer );
    tputGenTimer = $timeout( function() {
      var mode = $rootScope.mode;
      fakeTputGeneratorFactory.genDeviceTput( mode ).then(function(results) {
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
      var qprev = $rootScope.mode;
      var qwait = QMIMO_SWITCH_DELAY_MS;
      var newmode = ( qprev === 'mu' ? 'su' : 'mu' );
      //console.log( 'mode '+ qprev +' to '+ newmode +' in '+ qwait +'ms'  );
      // $scope.switchleft boolean controls actual position of UI switch
      $scope.switchleft = !$scope.switchleft;
      // show "loading" mode rather than 'mu' or 'su'
      $rootScope.loading = true;
      $rootScope.mode = '';
      // pause tput # getting..
      $timeout.cancel( tputTimer );
      if ( QMIMO_FAKE_DEMO === true ) {
        $timeout.cancel( tputGenTimer );
      }
      // after QMIMO_SWITCH_DELAY_MS delay, poll new tput data & reactivate GUI
      $timeout(function() {
        if ( QMIMO_FAKE_DEMO === true ) {
          /**
           * If we are using our throughput data faking Factory too,
           * reset that first, and Then start GUI back up
           */
          fakeTputGeneratorFactory.genDeviceTput(newmode).then(function() {
            // NOW we should be able to reloadTputNow with fresh new mode #s
            $scope.reloadTputNow( newmode );
            // and continue faking
            $scope.kickGenerator();
          });
        } else {
          // after delay, start getting the data again in new mode
          $scope.reloadTputNow( newmode );
        }
      }, qwait );
    } else {
      console.log( 'Switch already in progress, please wait..' );
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
    // be polite : cancel $timeout(s)?
    $timeout.cancel( tputTimer );
    if ( QMIMO_FAKE_DEMO === true ) {
      $timeout.cancel( tputGenTimer );
    }
  });
}