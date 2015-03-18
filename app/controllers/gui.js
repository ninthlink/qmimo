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
    '$urlRouterProvider',
    function( $stateProvider, $urlRouterProvider ) {
      // define our main GUI state
      $stateProvider.state('gui', {
        url: '/',
        templateUrl: './partials/gui.html',
        controller: 'guiCtrl',
        resolve: {
          // "resolve" polls initial tput data before the UI loads
          tputs: function( tputFactory ) {
            //console.log('setting up initial guiCtrl resolve tputs');
            return tputFactory.getDevicesTput( true );
          },
          simulate: function() {
            return QMIMO_FAKE_DEMO;
          },
          hideLB: function() {
            return QMIMO_DEFAULT_HIDE_LB;
          }
        }
      }).state('live', {
        url: '/live',
        templateUrl: './partials/gui.html',
        controller: 'guiCtrl',
        resolve: {
          // "resolve" polls initial tput data before the UI loads
          tputs: function( tputFactory ) {
            //console.log('setting up initial guiCtrl resolve tputs');
            return tputFactory.getDevicesTput( true );
          },
          simulate: function() {
            // same but just set simulate = false
            return false;
          },
          hideLB: function() {
            return QMIMO_DEFAULT_HIDE_LB;
          }
        }
      });
      // and set that as the default (only?) URL too
      $urlRouterProvider.otherwise('/');
    }
  ])
  .controller('guiCtrl', guiCtrl);
// inject any Angular dependencies in to our Controller, like our Factories
guiCtrl.$inject = [ '$scope', '$rootScope', '$timeout', 'tputFactory', 'mimoGen', 'mimoScripts', 'tputs', 'simulate', 'hideLB' ];
/**
 * We are in the GUI Controller's control from here out
 */
function guiCtrl( $scope, $rootScope, $timeout, tputFactory, mimoGen, mimoScripts, tputs, simulate, hideLB ) {
  console.log( 'we are in guiCtrl : simulate = '+ ( simulate ? 'TRUE' : 'FALSE' ) );
  // initial GUI setup & map initial data from our tputFactory
  $rootScope.demo = QMIMO_INITIAL_DEMO;
  $rootScope.loading = false;
  $rootScope.shownumbers = true;
  $rootScope.hideLB = hideLB;
  $rootScope.showQlabels = QMIMO_Q_LABELS;
  $scope.simulate = simulate;
  //$rootScope.mode = tputs.mode;
  $scope.switchleft = ( $rootScope.mode === 'mu' );
  $scope.demoleft = ( $rootScope.demo === 'mg' );
  //console.log('initial values::');
  //console.log(tputs);
  $scope.devices = tputs.tputs;
  $scope.devicenum = $scope.devices.length;
  $scope.dheight = { 'height': ( 100 / $scope.devicenum ) + '%' };
  $scope.roundtotals = QMIMO_TPUT_TOTALS_DECIMAL_PLACES;
  $scope.roundgain = QMIMO_MU_GAIN_DECIMAL_PLACES;
  // "LB" mode variable(s) too
  $scope.legacy = [];
  $scope.legacy_diff = 0;
  var legacycount = QMIMO_NUMBER_OF_LEGACY_DEVICES;
  $scope.totalnum = $scope.devicenum + legacycount;
  for ( i = 0; i < legacycount; i += 1 ) {
    $scope.legacy[ i ] = [
      // the device ID
      i + 1 + $scope.devicenum,
      // time to xfer in MU mode
      0,
      // time to xfer in SU mode
      0
    ];
  }
  //console.log($scope.legacy);
  // recalculate our top MU & SU numbers based on initial tputs
  $scope.mu_total = tputs.totals.mu;
  $scope.su_total = tputs.totals.su;
  $scope.mu_gain = tputs.totals.gain;
  $scope.mu_b1s = { 'transform': 'rotate(0deg)' };
  $scope.su_b1s = { 'transform': 'rotate(0deg)' };
  var total_multiplier = 24 / $scope.devicenum;
  
  // function to recalculate the % borders around the MU & SU dials 
  $scope.retotal = function() {
    // calculate border line too
    var tot = ( $rootScope.mode === 'mu' ) ? $scope.mu_total : $scope.su_total;
    var deg = Math.round( tot * total_multiplier / 18 );
    // make sure # between 0 & 180
    deg = ( deg < 0 ) ? 0 : ( ( deg > 180 ) ? 180 : deg );
    
    if ( $rootScope.mode === 'mu' ) {
      $scope.mu_b1s = { 'transform': 'rotate('+ deg +'deg)' };
    } else {
      $scope.su_b1s = { 'transform': 'rotate('+ deg +'deg)' };
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
  // similar idea for LB Demo polling
  $scope.pollLBNow = function() {
    tputFactory.getLegacyData().then(function(results) {
      //console.log('LEGACY DATAS');
      //console.log(results);
      $rootScope.loading = false;
      var m = $rootScope.mode === 'mu' ? 1 : 2;
      var o = $rootScope.mode === 'mu' ? 2 : 1;
      var tot = 0;
      var allback = true;
      angular.forEach( results, function( d, k ) {
        $scope.legacy[k][m] = d;
        if ( d === 0 ) {
          allback = false;
        } else {
          // if we also have the other mode value already, then
          if ( $scope.legacy[k][o] !== 0 ) {
            tot += $scope.legacy[k][2] - $scope.legacy[k][1];
          }
        }
      });
      if ( !allback ) {
        // trigger this again
        $scope.pollLB();
      } else {
        //console.log('all Legacy have returned some # != 0');
        $scope.legacy_diff = tot;
      }
    });
  };
  $scope.pollLB = function() {
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      $scope.pollLBNow();
    }, QMIMO_REFRESH_TPUT_MS );
  };
  // similar idea to fake generating numbers via mimoGen
  var tputGenTimer;
  $scope.kickGenerator = function( wait ) {
    //console.log( 'gui.js : kickGenerator( '+ wait +' )' );
    $timeout.cancel( tputGenTimer );
    var waitms = QMIMO_FAKE_DEMO_LOOP_MS;
    if ( wait ) {
      waitms = wait * 1000;
    }
    tputGenTimer = $timeout( function() {
      if ( $rootScope.demo === 'mg' ) {
        mimoGen.genDeviceTput( $rootScope.mode ).then(function(results) {
          $scope.kickGenerator();
        });
      } else {
        // LB mode, so
        mimoGen.fakeLegacyTime( wait ).then(function(result) {
          // all set, just hang out
        });
      }
    }, waitms );
  };
  
  // action(s) to take when a button is pressed to switch between MU/SU mode
  $scope.switchMode = function() {
    //console.log('switchMode');
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
      if ( $rootScope.demo === 'mg' ) {
        // pause tput # getting..
        $timeout.cancel( tputTimer );
        if ( simulate === true ) {
          $timeout.cancel( tputGenTimer );
        }
        // after QMIMO_SWITCH_DELAY_MS delay, poll new tput data & reactivate GUI
        $timeout(function() {
          if ( simulate === true ) {
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
        // LB Demo : for now, just switch first
        $rootScope.mode = newmode;
        // right away no delay
        $scope.wipeLegacyData();
        
        $timeout(function() {
          $rootScope.loading = false;
          //console.log('LB mode switched to '+ newmode);
        }, qwait );
      }
      
      // and call our mode-change scripts?
      mimoScripts.modeChange( newmode ).then(function(results) {
        console.log('pl script triggered?');
      }, function() {
        console.log('switch script call failed?');
      });
    } else {
      console.log( 'Switch already in progress, please wait..' );
    }
  };
  // helper UI function to switch between modes to specified mode
  $scope.switchModeTo = function( m ) {
    //console.log('switchModeTo : '+ m);
    if ( $rootScope.loading === false ) {
      if ( $rootScope.mode !== m ) {
        // init switch
        $scope.switchMode();
      }
    }
  };
  
  // action(s) to take when a switch is pressed to switch between demos
  $scope.switchDemo = function() {
    //console.log('switchDemo');
    // make sure we are not already in the process of switching
    if ( $rootScope.loading === false ) {
      // and then
      var qprev = $rootScope.demo;
      var qwait = QMIMO_SWITCH_DELAY_MS;
      var newmode = ( qprev === 'mg' ? 'lb' : 'mg' );
      $rootScope.demo = newmode; // here?
      //console.log( 'mode '+ qprev +' to '+ newmode +' in '+ qwait +'ms'  );
      // $scope.demoleft boolean controls actual position of UI switch
      $scope.demoleft = !$scope.demoleft;
      // loading?
      $rootScope.loading = true;
      // pause tput # getting..
      $timeout.cancel( tputTimer );
      if ( simulate === true ) {
        $timeout.cancel( tputGenTimer );
      }
      // call our scripts?
      mimoScripts.demoChange( newmode ).then(function(results) {
        console.log('demo mode switch pl script triggered?');
      }, function() {
        console.log('switch script call failed?');
      });
      // after QMIMO_SWITCH_DELAY_MS delay, poll new tput data & reactivate GUI
      $timeout(function() {
        if ( newmode === 'mg' ) {
          if ( simulate === true ) {
            /**
             * If we are using our throughput data faking Factory too,
             * reset that first, and Then start GUI back up
             */
            mimoGen.genDeviceTput( $rootScope.mode ).then(function() {
              // NOW we should be able to reloadTputNow with fresh new mode #s
              $scope.reloadTputNow( $rootScope.mode );
              // and continue faking
              $scope.kickGenerator();
            });
          } else {
            // after delay, start Throughput loading data again
            $scope.reloadTputNow( $rootScope.mode );
          }
        }
      }, qwait );
      
      if ( newmode === 'lb' ) {
        // right away no delay
        $scope.wipeLegacyData();
      }
    } else {
      console.log( 'Switch already in progress, please wait..' );
    }
  };
  // helper UI function to switch between Demos to specified demo
  $scope.switchDemoTo = function( m ) {
    //console.log('switchDemoTo : '+ m);
    if ( $rootScope.loading === false ) {
      if ( $rootScope.demo !== m ) {
        // init switch
        $scope.switchDemo();
      }
    }
  };
  
  // #todo : wrap these in case we want to start in LB instead of MG?
  //console.log('calling initial scope reloadTput');
  $scope.reloadTput();
  // if we actually want to actually fake the numbers?
  if ( simulate === true ) {
    //console.log('FAKE_DEMO = true, calling initial kickGenerator too');
    $scope.kickGenerator();
  }
  
  $scope.wipeLegacyData = function() {
    //console.log('and then? wiping initial/previous Legacy tputs');
    // (re)wipe initial stored value(s)
    $scope.legacy_diff = 0;
    var wait = $rootScope.mode === 'mu' ? QMIMO_FAKE_LB_MU_TIME : QMIMO_FAKE_LB_SU_TIME;
    
    mimoGen.clearLegacyTputs().then(function(result) {
      //console.log( 'wiped for i='+ QMIMO_NUMBER_OF_MU_DEVICES +'&m='+ QMIMO_NUMBER_OF_LEGACY_DEVICES );
      //console.log( result );
      if ( simulate === true ) {
        $scope.kickGenerator( wait );
      }
      // and start polling
      $scope.pollLB();
    },
    function(err) {
      console.log('wipe failed');
      if ( simulate === true ) {
        $scope.kickGenerator( wait );
      }
    });
  };
  
  $scope.lineClasses = function( devicenum ) {
    var classes = 'su-line-'+ devicenum;
    switch ( $scope.mode ) {
      case 'mu':
        classes += ' blink';
        break;
      case 'su':
        classes += ' alt';
        break;
    }
    return classes;
  };
  
  $scope.toggleNumbers = function() {
    $rootScope.shownumbers = !$rootScope.shownumbers;
  };
  
  $scope.toggleLB = function() {
    $rootScope.hideLB = !$rootScope.hideLB;
  };
  
  $scope.$on( '$destroy', function( event ) {
    // be polite : cancel $timeout(s)?
    $timeout.cancel( tputTimer );
    if ( simulate === true ) {
      $timeout.cancel( tputGenTimer );
    }
  });
}