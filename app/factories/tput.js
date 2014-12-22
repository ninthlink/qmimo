/**
 * tputFactory
 *
 * provides methods for loading tput datas
 */
(function() {
	angular
		.module('qmimo')
		.factory('tputFactory', tputFactory);
	
	tputFactory.$inject = [ '$rootScope', '$http', '$q' ]; // $resource?
	
	function tputFactory( $rootScope, $http, $q ) {
    var mode = QMIMO_INITIAL_MODE,
        numberOfDevices = QMIMO_NUMBER_OF_DEVICES, // # of connected devices aka files to loop
        tputLocation = QMIMO_TPUT_DATA_DIR, // relative path
        fileName = QMIMO_TPUT_FILE_NAME_FORMAT, // # replaced by actual #s
        tputs = [], // array for caching previous results
        //fake_su_numbers = [ 33, 68, 22, 51, 24, 18 ], // fake numbers for now
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
            0
            //fake_su_numbers[i]
          ];
        }
        // and set up our Promises array so we can use $q.all
        tputPromises[i] = o.loadTput( i + 1 );
			}
			return $q.all( tputPromises ).then(function(results) {
        // return our data to the Controller
				return {
          mode: mode,
          tputs: results
        };
			});
		};
		/**
		 * obscures $http.get requests?
		 */
		o.getTputData = function( n ) {
      var fname = fileName.replace( '#', n );
			return $http.get( tputLocation +'/'+ fname );
		};
		/**
		 * gets response from getSampleFeed and does some parsing to conglomerate feeds together?
		 */
		o.loadTput = function( n ) {
      // set up the $q.defer Promise
			var defer = $q.defer();
      // call our getTputData & process result after it returns
			o.getTputData( n ).then(function(result) {
        //console.log( 'throughput #'+ n +' loaded : ' );
        //console.log( result.data );
        // extract number from data like 'eth0: 123 0'
        var i = ( mode === 'mu' ? 1 : 2 );
        tputs[n][i] = o.parseTputData( result.data );
        
				// pass the data back upstream
				defer.resolve( tputs[n] );
			},
			function(err) {
				//defer.reject(err);
        tputs[n][i] = 0;
        defer.resolve( tputs[n] );
			});
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
		// return our factory
		return o;
	}
})();