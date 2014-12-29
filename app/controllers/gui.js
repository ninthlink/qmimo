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
          tputs: function( tputFactory ) {
            return tputFactory.getDevicesTput( true );
          }
        }
      });
    }
  ])
  .controller('guiCtrl', guiCtrl);
// inject any Angular dependencies in to our Controller, like our Factories
guiCtrl.$inject = [ '$scope', '$rootScope', '$timeout', 'tputFactory', 'mimoGen', 'tputs' ];
/**
 * We are in the GUI Controller's control from here out
 */
function guiCtrl( $scope, $rootScope, $timeout, tputFactory, mimoGen, tputs ) {
  // initial GUI setup & map initial data from our tputFactory
  $rootScope.loading = false;
  //$rootScope.mode = tputs.mode;
  $scope.switchleft = ( $rootScope.mode === 'mu' );
  console.log('initial values::');
  console.log(tputs);
  $scope.devices = tputs.tputs;
  $scope.devicenum = $scope.devices.length;
  $scope.roundtotals = QMIMO_TPUT_TOTALS_DECIMAL_PLACES;
  $scope.roundgain = QMIMO_MU_GAIN_DECIMAL_PLACES;
  var total_multiplier = 24 / $scope.devicenum;
  // recalculate our top MU & SU numbers based on all devices' tputs
  $scope.mu_total = tputs.totals.mu;
  $scope.su_total = tputs.totals.su;
  $scope.mu_gain = tputs.totals.gain;
  $scope.mu_b1s = $scope.mu_b2s = { 'transform': 'rotate(0deg)' };
  $scope.su_b1s = $scope.su_b2s = { 'transform': 'rotate(0deg)' };
  $scope.retotal = function() {
    // calculate border line too
    var tot = ( $rootScope.mode === 'mu' ) ? $scope.mu_total : $scope.su_total;
    var deg = Math.round( tot * total_multiplier / 9 );
    // make sure # between 0 & 360
    deg = ( deg < 0 ) ? 0 : ( ( deg > 360 ) ? 360 : deg );
    
    var b1 = ( deg < 180 ) ? deg : 180;
    var b2 = ( deg > 180 ) ? deg - 180 : 0;
    if ( $rootScope.mode === 'mu' ) {
      $scope.mu_b1s = { 'transform': 'rotate('+ b1 +'deg)' };
      $scope.mu_b2s = { 'transform': 'rotate('+ b2 +'deg)' };
    } else {
      $scope.su_b1s = { 'transform': 'rotate('+ b1 +'deg)' };
      $scope.su_b2s = { 'transform': 'rotate('+ b2 +'deg)' };
    }
  };
  // (re)total for the initial data..
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
      $scope.mu_total = results.totals.mu;
      $scope.su_total = results.totals.su;
      $scope.mu_gain = results.totals.gain;
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
  // similar idea to fake generating numbers via mimoGen
  var tputGenTimer;
  $scope.kickGenerator = function() {
    $timeout.cancel( tputGenTimer );
    tputGenTimer = $timeout( function() {
      var mode = $rootScope.mode;
      mimoGen.genDeviceTput( mode ).then(function(results) {
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
    // make sure we are not already in the process of switching modes..
    if ( $rootScope.loading === false ) {
      // and then
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
      // call our scripts?
      tputFactory.switchTputScript( newmode ).then(function(results) {
        console.log('pl script triggered?');
      }, function() {
        console.log('switch script call failed?');
      });
      // after QMIMO_SWITCH_DELAY_MS delay, poll new tput data & reactivate GUI
      $timeout(function() {
        if ( QMIMO_FAKE_DEMO === true ) {
          /**
           * If we are using our throughput data faking Factory too,
           * reset that first, and Then start GUI back up
           */
          mimoGen.genDeviceTput(newmode).then(function() {
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