/**
 * tputFactory
 *
 * provides methods for loading tput datas
 */
angular
  .module('qmimo')
  .factory('tputFactory', tputFactory);

tputFactory.$inject = [ '$rootScope', '$http', '$q', '$timeout' ]; // $resource?

function tputFactory( $rootScope, $http, $q, $timeout ) {
  var mode = QMIMO_INITIAL_11AC_MODE,
      numberOfDevices = QMIMO_NUMBER_OF_MU_DEVICES, // # of connected devices aka files to loop
      legacyDevices = QMIMO_NUMBER_OF_LEGACY_DEVICES,
      tputLocation = QMIMO_TPUT_DATA_DIR, // relative path?
      fileName = QMIMO_TPUT_FILE_NAME_FORMAT, // # replaced by actual #s
      //defaultTBnumber = QMIMO_TB_GAIN_MAGIC_NUMBER / numberOfDevices,
      tputs = [], // array for caching (previous) tput results,
      legacy_totals = { mu: 0, su: 0, tb: 0, diff: 0 },
      stored_totals = { mu: 0, su: 0, tb: 0, gain: 0 },
      o = {}; // and finally our actual instance object that we will return
  /**
   * initial Promises for data to populate Devices tput data?
   */
  o.getDevicesTput = function( initialize, newmode ) {
    if ( newmode ) {
      mode = newmode;
    } else {
      if ( $rootScope.hasOwnProperty('mode') ) {
        //console.log( 'getDevicesTput : rootScope.mode = '+ $rootScope.mode );
        mode = $rootScope.mode;
      } else {
        //console.log( 'getDevicesTput : SETTING rootScope.mode to '+ mode );
        $rootScope.mode = mode;
      }
    }
    var tputPromises = [];
    for ( i = 0; i < numberOfDevices; i = i + 1 ) {
      if ( initialize === true ) {
        // init our tput data
        tputs[i+1] = [
          // the device ID
          i+1,
          // latest MU tput data
          0,
          // latest SU tput data
          0,
          // latest TB tput data
          0
        ];
      }
      // and set up our Promises array so we can use $q.all
      tputPromises[i] = o.loadTput( i + 1 );
    }
    return $q.all( tputPromises ).then(function(results) {
      //console.log('returning total tputs results');
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
        tputs: results,
        totals: stored_totals
      };
    });
  };
  /**
   * obscures $http.get requests?
   */
  o.getTputData = function( n, defer ) {
    var fname = fileName.replace( '#', n );
    return $http.get( tputLocation +'/'+ fname, { timeout: defer.promise });
  };
  /**
   * gets response from getTputData and does some parsing to conglomerate feeds together?
   */
  o.loadTput = function( n ) {
    // set up the $q.defer Promise
    var defer = $q.defer();
    // call our getTputData & process result after it returns
    o.getTputData( n, defer ).then(function(result) {
      //console.log( 'throughput #'+ n +' loaded : ' );
      //console.log( result.data );
      // extract number from data like 'eth0: 123 0'
      var i = ( mode === 'su' ? 2 : ( mode === 'tb' ? 3 : 1 ) );
      var newtput = o.parseTputData( result.data );
      if ( newtput > 0 ) {
        tputs[n][i] = newtput;
      }
      //}
      // pass the data back upstream
      //console.log('returning tput '+ n);
      defer.resolve( tputs[n] );
    },
    function(err) {
      //defer.reject(err);
      tputs[n][i] = 0;
      // instead of rejecting, send anyways
      defer.resolve( tputs[n] );
    });
    
    $timeout( function() {
      defer.resolve( tputs[n] );
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
    o.getTputData( n, defer ).then(function(result) {
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
   * similar to getDevicesTput Promises for data for LB demo
   */
  o.getLegacyData = function() {
    if ( $rootScope.hasOwnProperty('mode') ) {
      //console.log( 'getDevicesTput : rootScope.mode = '+ $rootScope.mode );
      mode = $rootScope.mode;
    } else {
      //console.log( 'getDevicesTput : SETTING rootScope.mode to '+ mode );
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