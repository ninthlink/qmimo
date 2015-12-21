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
          tputs: function( tputFactory, mimoGen ) {
            // init tput generating for demo mode
            mimoGen.genDeviceTput( QMIMO_INITIAL_11AC );
            // and return after reading those tputs
            return tputFactory.iniTputs();
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
            return tputFactory.iniTputs();
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
  /* maybe $scope.maybeLog maybe not */
  $scope.maybeLog = function( msg ) {
    if ( QMIMO_OUTPUT_LOGS ) {
      console.log( msg );
    }
  };
  $scope.maybeLog( 'we are in guiCtrl : simulate = '+ ( simulate ? 'TRUE' : 'FALSE' ) );
  // initial GUI setup & map initial data from our tputFactory
  $rootScope.demo = QMIMO_INITIAL_DEMO;
  $rootScope.loading = false;
  $rootScope.shownumbers = true;
  $rootScope.hideLB = hideLB;
  $rootScope.showQlabels = QMIMO_Q_LABELS;
  $rootScope.collapseNumbers = QMIMO_COLLAPSE_AC_DEVICE_NUMBERS;
  // allow hiding totals or not
  $scope.hidecollapsedtotals = QMIMO_COLLAPSE_TOTALS;
  // but always default true show, so just possibly hide when collapsing
  $scope.showtotals = true;
  $rootScope.showadtotals = QMIMO_COLLAPSE_AD_DEVICE_NUMBERS;
  
  $scope.$watch('collapseNumbers', function( newValue, oldValue, $scope ) {
    if ( newValue != oldValue ) {
      if ( newValue ) {
        if ( $scope.hidecollapsedtotals ) {
          $scope.showtotals = false;
        } else {
          $scope.showtotals = true;
        }
      } else {
        $scope.showtotals = true;
      }
    }
  });
  $scope.toggleTotals = function() {
    $scope.showtotals = !$scope.showtotals;
  };
  $scope.toggleADTotals = function() {
    $rootScope.showadtotals = !$rootScope.showadtotals;
  };
  
  $rootScope.openedhbtn = false;
  $scope.simulate = simulate;
  $rootScope.onscreen = 'home';
  $rootScope.prevscreen = '';
  //$rootScope.mode = tputs.mode;
  $scope.switchsuon = ( $rootScope.mode === 'su' );
  $scope.switchmuon = ( $rootScope.mode === 'mu' );
  $rootScope.tbmode = QMIMO_INITIAL_11AD; //( $rootScope.mode === 'tb' );
  $rootScope.nextmode = '';
  $scope.demoleft = ( $rootScope.demo === 'mg' );
  //$scope.maybeLog('initial values :: tputs = ');
  //$scope.maybeLog(tputs);
  $scope.devices = tputs.tputs;
  $scope.devicenum = $scope.devices.length;
  $scope.num_11ac = tputs.n_11ac;
  $scope.num_11ad = tputs.n_11ad;
  $scope.dheight = { 'height': ( 100 / $scope.devicenum ) + '%' };
  $scope.roundtotals = QMIMO_TPUT_TOTALS_DECIMAL_PLACES;
  $scope.roundgain = QMIMO_MU_GAIN_DECIMAL_PLACES;
  $scope.roundtbgain = QMIMO_TB_GAIN_DECIMAL_PLACES;
  $scope.mugainsuffix = QMIMO_MU_GAIN_SUFFIX;
  $scope.tbgainsuffix = QMIMO_TB_GAIN_SUFFIX;
  
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
  //$scope.maybeLog($scope.legacy);
  // recalculate our top Gain numbers based on initial tputs
  $scope.mu_total = tputs.totals.mu;
  $scope.su_total = tputs.totals.su;
  $scope.tb_total = tputs.totals.tb;
  $scope.mu_gain = tputs.totals.gain;
  
  // re calculate TB Gain
  $scope.calcTBgain = function() {
    switch ( $rootScope.mode ) {
      case 'su':
        $scope.tb_gain = ( $scope.su_total > 0 ) ? $scope.tb_total / $scope.su_total : 0;
        break;
    
      case 'mu':
        $scope.tb_gain = ( $scope.mu_total > 0 ) ? $scope.tb_total / $scope.mu_total : 0;
        break;
      
      default: // both off
        $scope.tb_gain = ( $scope.mu_total > 0 ) ? $scope.tb_total / $scope.mu_total : ( ( $scope.su_total > 0 ) ? $scope.tb_total / $scope.su_total : 0 );
        break;
    }
  }
  $scope.calcTBgain();
  // set up initial transforms
  $scope.mu_b1s = { 'transform': 'rotate(0deg)' };
  $scope.su_b1s = { 'transform': 'rotate(0deg)' };
  $scope.tb_b1s = { 'transform': 'rotate(0deg)' };
  // magic multiplier
  $scope.total_ac_multiplier = 24 / $scope.num_11ac;
  
  // function to recalculate totals & % borders around dials 
  $scope.retotal = function() {
    if ( $rootScope.tbmode ) {
      var tbtot = $scope.tb_total;
      // adjust to 2700 mbps = 180 deg..
      var tbdeg = Math.round( tbtot / 15 );
      // make sure # between 0 & 180
      tbdeg = ( tbdeg < 0 ) ? 0 : ( ( tbdeg > 180 ) ? 180 : tbdeg );
      
      $scope.tb_b1s = { 'transform': 'rotate('+ tbdeg +'deg)' };
    } else {
      $scope.tb_b1s = { 'transform': 'rotate(0deg)' };
    }
    var tot = $scope.su_total;
    if ( $rootScope.mode === 'mu' ) {
      tot = $scope.mu_total;
    }
    // adjust to up to 180 deg +/-
    var deg = Math.round( tot * $scope.total_ac_multiplier / 18 );
    // make sure # between 0 & 180
    deg = ( deg < 0 ) ? 0 : ( ( deg > 180 ) ? 180 : deg );
    //$scope.maybeLog( 'tot = ' + tot + ' : deg = ' + deg );
      
    if ( $rootScope.mode === 'mu' ) {
      $scope.mu_b1s = { 'transform': 'rotate('+ deg +'deg)' };
    } else {
      $scope.su_b1s = { 'transform': 'rotate('+ deg +'deg)' };
    }
    
    // then wipe out if we should?
    if ( $scope.showtotals == false ) {
      $scope.su_total = 0;
      $scope.mu_total = 0;
      //$scope.tb_total = 0;
    }
  };
  // (re)total for the initial data..
  $scope.retotal();
  
  // Set timeout to (re) poll tput datas
  var tputTimer;
  var tbputTimer;
  $scope.reprocessResults = function( results ) {
    $scope.maybeLog(results);
    //$rootScope.loading = false;
    //$rootScope.mode = results.mode;
    $scope.devices = results.tputs;
    $scope.devicenum = $scope.devices.length;
    $scope.num_11ac = tputs.n_11ac;
    $scope.num_11ad = tputs.n_11ad;
    $scope.dheight = { 'height': ( 100 / $scope.devicenum ) + '%' };
    $scope.mu_total = results.totals.mu;
    $scope.su_total = results.totals.su;
    $scope.tb_total = results.totals.tb;
    
    $scope.mu_gain = results.totals.gain;
    $scope.calcTBgain();
    
    $scope.retotal();
  };
  
  $scope.reloadTputNow = function( newmode ) {
    $scope.maybeLog('reloadTputNow : 11ac');
    tputFactory.get11acTput( newmode ).then( function( results ) {
        $scope.reprocessResults( results );
    });
    // and no matter how long that takes, trigger this again
    $scope.reloadTput();
  };
  $scope.reloadTBTputNow = function() {
    tputFactory.get11adTput().then( function( results ) {
        $scope.reprocessResults( results );
    });
    // and no matter how long that takes, trigger this again
    $scope.reloadTBTput();
  };
  $scope.reloadTput = function() {
    // use $timeout to reload our 11ac MU/SU data every interval
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      $scope.reloadTputNow();
    }, QMIMO_REFRESH_11AC_TPUT_MS );
  };
  $scope.reloadTBTput = function() {
    // $timeout reload 11ad TRI-BAND data every interval, separate from 11ac
    $timeout.cancel( tbputTimer );
    tbputTimer = $timeout( function() {
      $scope.reloadTBTputNow();
    }, QMIMO_REFRESH_11AD_TPUT_MS );
  };
  // similar idea for LB Demo polling
  $scope.pollLBNow = function() {
    tputFactory.getLegacyData().then(function(results) {
      //$scope.maybeLog('LEGACY DATAS');
      //$scope.maybeLog(results);
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
        //$scope.maybeLog('all Legacy have returned some # != 0');
        $scope.legacy_diff = tot;
      }
    });
  };
  $scope.pollLB = function() {
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      $scope.pollLBNow();
    }, QMIMO_REFRESH_11AC_TPUT_MS );
  };
  // similar idea to fake generating numbers via mimoGen
  var tputGenTimer;
  $scope.kickGenerator = function( wait ) {
    //$scope.maybeLog( 'gui.js : kickGenerator( '+ wait +' )' );
    $timeout.cancel( tputGenTimer );
    var waitms = QMIMO_FAKE_DEMO_LOOP_MS;
    if ( wait ) {
      waitms = wait * 1000;
    }
    tputGenTimer = $timeout( function() {
      // cancel again just for fun / just in case?
      $timeout.cancel( tputGenTimer );
      
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
    //$scope.maybeLog('SWITCHMODE');
    // make sure we are not already in the process of switching modes..
    if ( $rootScope.loading === false ) {
      // and then
      var qprev = $rootScope.mode;
      var qwait = QMIMO_SWITCH_DELAY_MS;
      var newmode = $rootScope.nextmode;
      if ( $rootScope.nextmode === '' ) {
        if ( QMIMO_AUTO_11AC_SWITCH ) {
          // in this case will we actually toggle automatically?
          newmode = ( qprev === 'mu' ? 'su' : 'mu' );
        }
      } else {
        //$scope.maybeLog('rootScope.nextmode was set to '+ newmode);
      }
      // and we set newmode, so reset "nextmode"
      $rootScope.nextmode = '';
      //$scope.maybeLog( 'mode '+ qprev +' to '+ newmode +' in '+ qwait +'ms'  );
      
      // while switching, turn OFF both 11ac SU & MU switches
      $scope.switchsuon = false;
      $scope.switchmuon = false;
  
      // show "loading" mode rather than 'mu' or 'su'
      $rootScope.loading = true;
      $rootScope.mode = '';
      if ( $rootScope.demo === 'mg' ) {
        // activate the "MG" (main) demo : first, pause tput # getting..
        $timeout.cancel( tputTimer );
        if ( newmode == '' ) {
          // in this case, we just turned it off, so
          $rootScope.loading = false;
        } else {
          // after "qwait" delay, re-poll tputs & reactivate GUI
          $timeout(function() {
            /*
            if ( simulate === true ) {
              // If we are using our throughput data faking Factory too,
              $timeout.cancel( tputGenTimer );
              // reset that first, and Then start GUI back up
              mimoGen.genDeviceTput(newmode).then(function() {
                // NOW we should be able to reloadTputNow with fresh new mode #s
                $scope.reloadTputNow( newmode );
                // and continue faking
                $scope.kickGenerator();
              });
            } else {
              // after delay, start getting the data again in new mode
            */
              $scope.reloadTputNow( newmode );
            //}
            $rootScope.loading = false;
            $rootScope.mode = newmode;
            $scope.switchsuon = newmode === 'su';
            $scope.switchmuon = newmode === 'mu';
          }, qwait );
        }
      } else {
        // LB Demo : for now, just switch first
        $rootScope.mode = newmode;
        // right away no delay
        $scope.wipeLegacyData();
        
        $timeout(function() {
          $rootScope.loading = false;
          //$scope.maybeLog('LB mode switched to '+ newmode);
        }, qwait );
      }
      
      if ( newmode != '' ) {
        // call our mode-change scripts?
        mimoScripts.modeChange( newmode ).then(function(results) {
          $scope.maybeLog('pl script triggered?');
        }, function() {
          $scope.maybeLog('switch script call failed?');
        });
      }
    } else {
      $scope.maybeLog( 'Switch already in progress, please wait..' );
    }
  };
  // switch between 11AC modes, to specified mode "m"
  $scope.switchModeTo = function( m ) {
    //$scope.maybeLog('switchModeTo : '+ m);
    if ( $rootScope.loading === false ) {
      if ( $rootScope.mode !== m ) {
        $rootScope.nextmode = m;
        // init switch
        $scope.switchMode();
      }
    }
  };
  // toggle switch between 11AC SU/MU modes
  $scope.switchModeToggle = function( m ) {
    //$scope.maybeLog('switchModeToggle : '+ m);
    if ( $rootScope.loading === false ) {
      var modeto;
      // means a switch was clicked to toggle 1 way or the other
      if ( $rootScope.mode == m ) {
        // if we are currently in this mode, then just switch off
        modeto = '';
      } else {
        // otherwise switch to the new mode
        modeto = m;
      }
      $scope.switchModeTo( modeto );
    }
  };
  $scope.switchTBMode = function ( m ) {
    $scope.maybeLog( 'switchTBMode to '+ ( m ? 'ON' : 'OFF' ));
    if ( $rootScope.tbmode != m ) {
      $rootScope.tbmode = m;
      if ( m ) {
        $scope.calcTBgain();
      }
    }
  }
  // toggle switch between 11AD "Tri-Band" On / Off
  $scope.toggleTB = function() {
    $rootScope.tbmode = !$rootScope.tbmode;
    if ( $rootScope.tbmode ) {
      $scope.calcTBgain();
    }
  }
  
  // switch between DEMO screens
  $scope.showDemo = function( m ) {
    $rootScope.prevscreen = $rootScope.onscreen;
    $rootScope.onscreen = m;
    //$scope.maybeLog('showDemo : onscreen = ' + m + ', prevscreen = ' + $rootScope.prevscreen);
    return false;
  };
  
  // action(s) to take to switch between MU/SU & LB demos
  $scope.switchDemo = function() {
    //$scope.maybeLog('switchDemo');
    // make sure we are not already in the process of switching
    if ( $rootScope.loading === false ) {
      // and then
      var qprev = $rootScope.demo;
      var qwait = QMIMO_SWITCH_DELAY_MS;
      var newmode = ( qprev === 'mg' ? 'lb' : 'mg' );
      $rootScope.demo = newmode; // here?
      //$scope.maybeLog( 'mode '+ qprev +' to '+ newmode +' in '+ qwait +'ms'  );
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
        $scope.maybeLog('demo mode switch pl script triggered?');
      }, function() {
        $scope.maybeLog('switch script call failed?');
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
      $scope.maybeLog( 'Switch already in progress, please wait..' );
    }
  };
  // switch between Demos, to a specified demo "m"
  $scope.switchDemoTo = function( m ) {
    //$scope.maybeLog('switchDemoTo : '+ m);
    if ( $rootScope.loading === false ) {
      if ( $rootScope.demo !== m ) {
        // init switch
        $scope.switchDemo();
      }
    }
  };
  
  // initial load ("reload") the datas..
  // if we actually want to actually fake the numbers?
  if ( simulate === true ) {
    //$scope.maybeLog('FAKE_DEMO = true, calling initial kickGenerator too');
    $scope.kickGenerator();
  }
  //$scope.maybeLog('calling initial scope reloadTput');
  $scope.reloadTput();
  $scope.reloadTBTput();
  
  // wipe "Legacy Data" that may have been previously loaded
  $scope.wipeLegacyData = function() {
    //$scope.maybeLog('and then? wiping initial/previous Legacy tputs');
    // (re)wipe initial stored value(s)
    $scope.legacy_diff = 0;
    var wait = $rootScope.mode === 'mu' ? QMIMO_FAKE_LB_MU_TIME : QMIMO_FAKE_LB_SU_TIME;
    
    mimoGen.clearLegacyTputs().then(function(result) {
      //$scope.maybeLog( 'wiped for i='+ QMIMO_NUMBER_OF_MU_DEVICES +'&m='+ QMIMO_NUMBER_OF_LEGACY_DEVICES );
      //$scope.maybeLog( result );
      if ( simulate === true ) {
        $scope.kickGenerator( wait );
      }
      // and start polling
      $scope.pollLB();
    },
    function(err) {
      $scope.maybeLog('wipe failed');
      if ( simulate === true ) {
        $scope.kickGenerator( wait );
      }
    });
  };
  
  $scope.toggleNumbers = function() {
    $rootScope.shownumbers = !$rootScope.shownumbers;
  };
  
  $scope.toggleLB = function() {
    $rootScope.hideLB = !$rootScope.hideLB;
  };
  
  $scope.toggleDeviceNumbers = function() {
    $rootScope.collapseNumbers = !$rootScope.collapseNumbers;
  };
  
  // set a timer var for resetting home buttons just in case?
  var homebtntimer;
  /* toggles which right button on the home screen is active */
  $scope.openHomeBtn = function( which ) {
    $timeout.cancel( homebtntimer );
    if ( QMIMO_CLOSE_HOME_BUTTONS_MS > 0 ) {
      // set $timeout to close a home btn if it was left open a while
      homebtntimer = $timeout( function() {
        $rootScope.openedhbtn = false;
      }, QMIMO_CLOSE_HOME_BUTTONS_MS );
    }
    if ( $rootScope.openedhbtn === which ) {
      $rootScope.openedhbtn = false;
    } else {
      $rootScope.openedhbtn = which;
    }
  };
  
  /* set $on( $destroy ) to wipe some timeouts */
  $scope.$on( '$destroy', function( event ) {
    // be polite : cancel $timeout(s)
    $timeout.cancel( tputTimer );
    $timeout.cancel( tbputTimer );
    $timeout.cancel( homebtntimer );
    $timeout.cancel( tputGenTimer );
  });
}