/**
 * tputFactory
 *
 * provides methods for loading tput datas
 * both for "mg" demo mode for 11AC SU/MU + 11AD Tri-Band
 * and for the "lb" Legacy Benefit demo mode as well
 */
angular
  .module('qmimo')
  .factory('tputFactory', tputFactory);

tputFactory.$inject = [ '$rootScope', '$http', '$q', '$timeout' ];

function tputFactory( $rootScope, $http, $q, $timeout ) {
  var mode = QMIMO_INITIAL_11AC,
      //numberOfDevices = QMIMO_NUMBER_OF_MU_DEVICES, // # of connected devices aka files to loop
      numberOfDevices = 0, // # of connected devices aka files to loop
      n_11ac = 0,
      n_11ad = 0,
      legacyDevices = QMIMO_NUMBER_OF_LEGACY_DEVICES,
      tputLocation = QMIMO_TPUT_DATA_DIR, // relative path?
      fileName = QMIMO_TPUT_FILE_NAME_FORMAT, // # replaced by actual #s
      tput_files_11ac = QMIMO_11AC_TPUT_FILES,
      tput_files_11ad = QMIMO_11AD_TPUT_FILES,
      //defaultTBnumber = QMIMO_TB_GAIN_MAGIC_NUMBER / numberOfDevices,
      tputs = [], // array for caching (previous) tput results,
      legacy_totals = { mu: 0, su: 0, tb: 0, diff: 0 },
      stored_totals = { mu: 0, su: 0, tb: 0, gain: 0 },
      o = {}; // and finally our actual instance object that we will return
  /**
   * initial Promises for data to populate Devices' 11AC (SU/MU) tput data
   */
  o.iniTputs = function() {
    if ( $rootScope.hasOwnProperty('mode') ) {
      //console.log( 'getDevicesTput : rootScope.mode = '+ $rootScope.mode );
      mode = $rootScope.mode;
    } else {
      //console.log( 'get11acTput : SETTING rootScope.mode to '+ mode );
      $rootScope.mode = mode;
    }
    n_11ac = tput_files_11ac.length;
    n_11ad = tput_files_11ad.length;
    numberOfDevices = n_11ad > n_11ac ? n_11ad : n_11ac; // max of both
    
    var tputPromises = [];
    var tputModeNum = ( mode === 'su' ? 2 : ( mode === 'tb' ? 3 : 1 ) );
    for ( i = 0; i < numberOfDevices; i = i + 1 ) {
      // init our tput data
      tputs[i] = [
        
        i+1, // the device ID
        0, // latest MU tput data
        0, // latest SU tput data
        0 // latest TB tput data?
      ];
      // set up "Promises" array for 11AC "SU/MU" so we can use $q.all
      if ( i < n_11ac ) {
        var fname = tput_files_11ac[i];
        tputPromises[i] = o.loadTput( i, tputModeNum, fname );
      }
      // and again for 11AD "Tri-Band"
      if ( i < n_11ad ) {
        var fname = tput_files_11ad[i];
        var n = i + n_11ac;
        tputPromises[ n ] = o.loadTput( n, 3, fname );
      }
    }
    //console.log('tputPromises set for '+ tputPromises.length +' 11AC ?');
    return $q.all( tputPromises ).then(function(results) {
      //console.log('xx returning total tputs INIT results xx');
      //console.log(results);
      // recalculate totals for the new numbers here
      var i = ( mode === 'su' ? 2 : 1 );
      stored_totals[ mode ] = 0;
      stored_totals[ 'tb' ] = 0;
      angular.forEach( tputs, function( d, k ) {
        if ( n_11ac > 0 ) {
          stored_totals[ mode ] += d[i];
        }
        if ( n_11ad > 0 ) {
          stored_totals[ 'tb' ] += d[3];
        }
      });
      // recalculate MU Gain too?
      if ( ( stored_totals.mu === 0 ) || ( stored_totals.su === 0 ) ) {
        // in this case, don't divide by 0, just say 0
        stored_totals.gain = 0;
      } else {
        // Rounding is handled by the ng "number" filter
        stored_totals.gain = stored_totals.mu / stored_totals.su;
      }
      // return our conglomerated data
      return {
        mode: mode,
        n_11ac: n_11ac,
        n_11ad: n_11ad,
        tputs: tputs,
        totals: stored_totals
      };
    });
  };
  /**
   * initial Promises for data to populate Devices' 11AC (SU/MU) tput data
   */
  o.get11acTput = function( newmode ) {
    //console.log('ggag get11acTput gagg');
    if ( newmode ) {
      mode = newmode;
    } else {
      if ( $rootScope.hasOwnProperty('mode') ) {
        //console.log( 'getDevicesTput : rootScope.mode = '+ $rootScope.mode );
        mode = $rootScope.mode;
      } else {
        //console.log( 'get11acTput : SETTING rootScope.mode to '+ mode );
        $rootScope.mode = mode;
      }
    }
    n_11ac = tput_files_11ac.length;
    n_11ad = tput_files_11ad.length;
    numberOfDevices = n_11ad > n_11ac ? n_11ad : n_11ac; // max of both
    
    var tputPromises = [];
    var tputModeNum = ( mode === 'su' ? 2 : ( mode === 'tb' ? 3 : 1 ) );
    for ( i = 0; i < numberOfDevices; i = i + 1 ) {
      // set up "Promises" array for 11AC "SU/MU" so we can use $q.all
      if ( i < n_11ac ) {
        var fname = tput_files_11ac[i];
        tputPromises[i] = o.loadTput( i, tputModeNum, fname );
      }
    }
    return $q.all( tputPromises ).then(function(results) {
      // recalculate totals for the new numbers here
      var i = ( mode === 'su' ? 2 : ( mode === 'mu' ? 1 : 3 ) );
      stored_totals[ mode ] = 0;
      angular.forEach( results, function( d, k ) {
        stored_totals[ mode ] += d[i];
      });
      // recalculate MU Gain too?
      if ( ( stored_totals.mu === 0 ) || ( stored_totals.su === 0 ) ) {
        // in this case, don't divide by 0, just say 0
        stored_totals.gain = 0;
      } else {
        // Rounding is handled by the ng "number" filter
        stored_totals.gain = stored_totals.mu / stored_totals.su;
      }
      // return our conglomerated data
      return {
        mode: mode,
        n_11ac: n_11ac,
        n_11ad: n_11ad,
        tputs: tputs,
        totals: stored_totals
      };
    });
  };
  /**
   * initial Promises for data to populate Devices' 11AD (TB) tput data
   */
  o.get11adTput = function() {
    console.log('ggg get11adTput ggg');
    n_11ac = tput_files_11ac.length;
    n_11ad = tput_files_11ad.length;
    numberOfDevices = n_11ad > n_11ac ? n_11ad : n_11ac; // max of both
    
    var tputPromises = [];
    var tputModeNum = 3; //hardcoded 3 = "tb"
    for ( i = 0; i < numberOfDevices; i = i + 1 ) {
      // no initialize since we assume that the 11AC handles that piece
      // set up "Promises" array for 11AD "TB" so we can use $q.all
      if ( i < n_11ad ) {
        var fname = tput_files_11ad[i];
        tputPromises[i] = o.loadTput( i, tputModeNum, fname );
      }
    }
    console.log('ggg');
    return $q.all( tputPromises ).then(function(results) {
      // recalculate totals for the new numbers here
      stored_totals[ 'tb' ] = 0;
      angular.forEach( results, function( d, k ) {
        console.log('gg :');
        console.log(d);
        stored_totals[ 'tb' ] += d[ tputModeNum ];
      });
      // return our conglomerated data
      return {
        mode: mode,
        n_11ac: n_11ac,
        n_11ad: n_11ad,
        tputs: tputs,
        totals: stored_totals
      };
    });
  };
  /**
   * obscures $http.get requests?
   */
  o.getTputData = function( n, fname, defer ) {
    if ( fname == '' ) {
        fname = fileName.replace( '#', n );
    }
    //console.log( 'getTputData : mode = '+ mode +' , n = '+ n +', fname = '+ fname );
    return $http.get( tputLocation +'/'+ fname, { timeout: defer.promise });
  };
  /**
   * gets response from getTputData and does some parsing to conglomerate feeds together?
   */
  o.loadTput = function( n, i, fname ) {
    var j = n < n_11ac ? n : n - n_11ac;
    console.log( 'loadTput for n ' + n + ' i '+ i + ' fname '+ fname +' : j = '+ j );
    // set up the $q.defer Promise
    var defer = $q.defer();
    // call our getTputData & process result after it returns
    o.getTputData( n, fname, defer ).then(function(result) {
      //console.log( 'throughput #'+ n +' loaded for mode '+ i +' from '+ fname +' : j = '+ j + ' : ' );
      //console.log( result.data );
      // extract number from data like 'eth0: 123 0'
      //var i = ( mode === 'su' ? 2 : ( mode === 'tb' ? 3 : 1 ) );
      var newtput = o.parseTputData( result.data );
      if ( newtput > 0 ) {
        tputs[j][i] = newtput;
      }
      //}
      // pass the data back upstream
      //console.log('returning tput '+ n);
      defer.resolve( tputs[j] );
    },
    function(err) {
      //defer.reject(err);
      tputs[j][i] = 0;
      // instead of rejecting, send anyways
      defer.resolve( tputs[j] );
    });
    
    $timeout( function() {
      defer.resolve( tputs[j] );
    }, QMIMO_TPUT_TIMEOUT_MS );
    
    return defer.promise;
  };
  /**
   * similar to loadTput, gets response from getTputData and does some parsing
   */
  o.loadLegacyData = function( n ) {
    // set up the $q.defer Promise
    var defer = $q.defer();
    // call our getTputData & process result after it returns
    var fname = ''; // automatic looking for now?
    o.getTputData( n, fname, defer ).then(function(result) {
      //console.log( 'throughput #'+ n +' loaded : ' );
      //console.log( result.data );
      // extract number from data like 'eth0: 123 0'
      defer.resolve( o.parseTputData( result.data ) );
    },
    function(err) {
      defer.resolve( 0 );
    });
    
    $timeout( function() {
      defer.resolve( 0 );
    }, QMIMO_TPUT_TIMEOUT_MS );
    
    return defer.promise;
  };
  /**
   * extracts tput # from data like "eth0: 123 0"
   */
  o.parseTputData = function( data ) {
    var tput = 0;
    data = data.split(" ");
    if ( data.length > 1 ) {
      tput = parseFloat( data[1] );
    }
    return tput;
  };
  /**
   * similar to get11acTput Promises for data for LB demo
   */
  o.getLegacyData = function() {
    if ( $rootScope.hasOwnProperty('mode') ) {
      //console.log( 'getLegacyData : rootScope.mode = '+ $rootScope.mode );
      mode = $rootScope.mode;
    } else {
      //console.log( 'getLegacyData : SETTING rootScope.mode to '+ mode );
      $rootScope.mode = mode;
    }
    var legPromises = [];
    for ( i = 0; i < legacyDevices; i = i + 1 ) {
      // set up our Promises array so we can use $q.all
      legPromises[i] = o.loadLegacyData( i + numberOfDevices + 1 );
    }
    return $q.all( legPromises ).then(function(results) {
      //console.log('returning total legPromises');
      //console.log(results);
      // return our data
      return results;
    });
  };
  
  // and return our factory
  return o;
}
