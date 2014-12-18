/**
 * tputFactory
 *
 * provides methods for loading tput datas
 */
(function() {
	angular
		.module('qmimo')
		.factory('tputFactory', tputFactory);
	
	tputFactory.$inject = ['$http', '$q']; // $resource?
	
	function tputFactory( $http, $q ) {
    var mode = QMIMO_INITIAL_MODE,
        numberOfDevices = QMIMO_NUMBER_OF_DEVICES, // # of connected devices aka files to loop
        tputLocation = QMIMO_TPUT_DATA_DIR, // relative path
        fileName = QMIMO_TPUT_FILE_NAME_FORMAT, // # replaced by actual #s
        tputs = [],
        o = {};
		/**
		 * initial Promises for data to populate Devices tput data?
		 */
		o.initDeviceThroughputs = function() {
      var tputPromises = [];
      for ( i = 0; i < numberOfDevices; i = i + 1 ) {
        tputPromises[i] = o.initTput( i + 1 );
			}
			return $q.all( tputPromises ).then(function(results) {
        // don't know if we need pre processing?
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
		o.initTput = function( n ) {
      // init our cached tput data
      tputs[n] = [
        n,
        0,
        0
      ];
      // set up the $q.defer Promise
			var defer = $q.defer();
			// alert("right now this doesnt do anything to the DOM.\nbut you can check your console.logs");
			//console.log('getSampleFeed for [ '+ socialnetwork +' ][ '+ type +' ][ '+ sample +' ] ?');
			o.getTputData( n ).then(function(result) {
				var tput = '123';
        var data = result.data;
        
				console.log('throughput #'+ n +' loaded : ');
				console.log(data);
        
        // data like 'eth0: 123 0'
        tput = data.substr(6);
        var spaceat = tput.indexOf(' ');
        tput = tput.substr( 0, spaceat );
        
        var i = ( mode === 'mu' ? 1 : 2 );
        tputs[n][i] = tput;
        
				// pass the data back upstream
				defer.resolve( tputs[n] );
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