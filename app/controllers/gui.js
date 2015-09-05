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
            //console.log('setting up initial guiCtrl resolve tputs');
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
  $rootScope.collapseNumbers = QMIMO_COLLAPSE_DEVICE_NUMBERS;
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
    if ( $scope.mode == 'su' ) {
      $scope.tb_gain = ( $scope.su_total > 0 ) ? $scope.tb_total / $scope.su_total : 0;
    } else {
      $scope.tb_gain = ( $scope.mu_total > 0 ) ? $scope.tb_total / $scope.mu_total : 0;
    }
  }
  $scope.calcTBgain();
  $scope.mu_b1s = { 'transform': 'rotate(0deg)' };
  $scope.su_b1s = { 'transform': 'rotate(0deg)' };
  $scope.tb_b1s = { 'transform': 'rotate(0deg)' };
  var total_ac_multiplier = 24 / $scope.num_11ac;
  
  // function to recalculate the % borders around the MU & SU dials 
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
    var deg = Math.round( tot * total_ac_multiplier / 18 );
    // make sure # between 0 & 180
    deg = ( deg < 0 ) ? 0 : ( ( deg > 180 ) ? 180 : deg );
    //$scope.maybeLog( 'tot = ' + tot + ' : deg = ' + deg );
      
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
  var tbputTimer;
  $scope.reprocessResults = function( results ) {
    //$scope.maybeLog(' mode = '+ $rootScope.mode);
    //$scope.maybeLog(results);
    $rootScope.loading = false;
    $rootScope.mode = results.mode;
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
    $timeout.cancel( tputTimer );
    tputTimer = $timeout( function() {
      $scope.reloadTputNow();
    }, QMIMO_REFRESH_11AC_TPUT_MS );
  };
  $scope.reloadTBTput = function() {
    // also for 11AC "Tri-Band" which is separate now
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
    //$scope.maybeLog('switchMode');
    // make sure we are not already in the process of switching modes..
    if ( $rootScope.loading === false ) {
      // and then
      var qprev = $rootScope.mode;
      var qwait = QMIMO_SWITCH_DELAY_MS;
      if ( $rootScope.nextmode === '' ) {
        var newmode = ( qprev === 'mu' ? 'su' : 'mu' );
      } else {
        var newmode = $rootScope.nextmode;
      }
      $rootScope.nextmode = '';
      //$scope.maybeLog( 'mode '+ qprev +' to '+ newmode +' in '+ qwait +'ms'  );
      // $scope.switchleft boolean controls actual position of UI switch
      //$scope.switchleft = !$scope.switchleft;
      
      // while loading, turn OFF all switches
      $scope.switchsuon = false;
      $scope.switchmuon = false;
      // but TB (11AD) is now indepent of SU/MU (11AC)
      // $scope.switchtbon = false;
  
      // show "loading" mode rather than 'mu' or 'su'
      $rootScope.loading = true;
      $rootScope.mode = '';
      if ( $rootScope.demo === 'mg' ) {
        // activate the "MG" (main) demo : first, pause tput # getting..
        $timeout.cancel( tputTimer );
        if ( simulate === true ) {
          $timeout.cancel( tputGenTimer );
        }
        // after "qwait" delay, re-poll tputs & reactivate GUI
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
          
          $scope.switchsuon = newmode === 'su';
          $scope.switchmuon = newmode === 'mu';
          //$scope.switchtbon = newmode === 'tb';
        }, qwait );
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
      
      // and call our mode-change scripts?
      mimoScripts.modeChange( newmode ).then(function(results) {
        $scope.maybeLog('pl script triggered?');
      }, function() {
        $scope.maybeLog('switch script call failed?');
      });
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
      if ( $rootScope.mode === m ) {
        $rootScope.nextmode = 'su';
      } else {
        $rootScope.nextmode = m;
      }
      // init switch
      $scope.switchMode();
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
  // action(s) to take to switch between demos
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
  
  // #todo : wrap these in the event we want to start in LB instead of MG?
  //$scope.maybeLog('calling initial scope reloadTput');
  $scope.reloadTput();
  $scope.reloadTBTput();
  // if we actually want to actually fake the numbers?
  if ( simulate === true ) {
    //$scope.maybeLog('FAKE_DEMO = true, calling initial kickGenerator too');
    $scope.kickGenerator();
  }
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
  /*
  // toggle between blinking / alternating lines (old MG demo GUI)
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
  */
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
    // be polite : cancel $timeout(s)?
    $timeout.cancel( tputTimer );
    $timeout.cancel( tbputTimer );
    $timeout.cancel( homebtntimer );
    if ( simulate === true ) {
      $timeout.cancel( tputGenTimer );
    }
  });
}