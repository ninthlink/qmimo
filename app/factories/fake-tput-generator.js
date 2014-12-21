/**
 * fakeTputGeneratorFactory
 *
 * provides methods for triggering regenerating our fake tput data
 * with the /fake-demo-contents/qgen.php
 */
(function() {
	angular
		.module('qmimo')
		.factory('fakeTputGeneratorFactory', fakeTputGeneratorFactory);
	
	fakeTputGeneratorFactory.$inject = [ '$rootScope', '$http', '$q' ]; // $resource?
	
	function fakeTputGeneratorFactory( $rootScope, $http, $q ) {
    var mode = QMIMO_INITIAL_MODE,
        numberOfDevices = QMIMO_NUMBER_OF_DEVICES, // # of calls we need per
        fakeLocation = QMIMO_TPUT_DATA_DIR, // relative path?
        fakeGenerator = 'qgen.php', // PHP script inside QMIMO_TPUT_DATA_DIR
        o = {}; // & our actual instance object that we will return
		/**
		 * initial Promises for data to populate Devices tput data?
		 */
		o.genDeviceTput = function() {
      if ( $rootScope.hasOwnProperty('mode') ) {
        //console.log( 'getDevicesTput : rootScope.mode = '+ $rootScope.mode );
        mode = $rootScope.mode;
      } else {
        //console.log( 'getDevicesTput : SETTING rootScope.mode to '+ mode );
        $rootScope.mode = mode;
      }
      // set up array of Promises so we can use $q.all([...]).then(...
      var genPromises = [];
      var m = ( mode === 'mu' ? '1' : '0' );
      //console.log('regenerating #s for m='+ m);
      for ( i = 0; i < numberOfDevices; i = i + 1 ) {
        // set up each Promise in the array
        genPromises[i] = o.genTput( i + 1, m );
			}
			return $q.all( genPromises ).then(function(results) {
        // return our data to the Controller?!
				return {
          mode: mode,
          generated: results
        };
			});
		};
		/**
		 * obscures $http.get requests?
		 */
		o.triggerTputGen = function( n, m ) {
			return $http.get( fakeLocation +'/'+ fakeGenerator +'?i='+ n +'&m='+ m +'&q=1' );
		};
		/**
		 * gets response from getSampleFeed and does some parsing to conglomerate feeds together?
		 */
		o.genTput = function( n, m ) {
      // set up the $q.defer Promise
			var defer = $q.defer();
      // call our getTputData & process result after it returns
			o.triggerTputGen( n, m ).then(function(result) {
        //console.log( 'generated for i='+ n +'&m='+ m );
        //console.log( result );
				// pass result.status (hopefully 200) back upstream
				defer.resolve( result.status );
			},
			function(err) {
				defer.reject(err);
			});
			return defer.promise;
		};
		// return our factory
		return o;
	}
})();