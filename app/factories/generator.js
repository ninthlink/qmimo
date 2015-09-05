/**
 * mimoGen
 *
 * provides methods for triggering regenerating our fake tput data
 * with the /fake-demo-contents/qgen.php
 */
(function() {
	angular
    .module('qmimo')
    .factory('mimoGen', mimoGen);
	
	mimoGen.$inject = [ '$http', '$q' ]; // $resource?
	
	function mimoGen( $http, $q ) {
    var numberOfDevices = QMIMO_NUMBER_OF_MU_DEVICES, // # of calls we need per
        tput_files_11ac = QMIMO_11AC_TPUT_FILES,
        tput_files_11ad = QMIMO_11AD_TPUT_FILES,
        legacyDevices = QMIMO_NUMBER_OF_LEGACY_DEVICES,
        txtsLocation = QMIMO_TPUT_DATA_DIR, // relative path?
        generatorScript = 'qgen.php', // PHP script inside QMIMO_TPUT_DATA_DIR
        o = {}; // actual instance obj that instantiates?
		/**
		 * initial Promises for data to populate Devices tput data?
		 */
		o.genDeviceTput = function( mode ) {
      // set up array of Promises so we can use $q.all([...]).then(...
      var genPromises = [];
      var m = ( mode === 'tb' ? '2' : ( mode === 'mu' ? '1' : '0' ) );
      //console.log('regenerating #s for m='+ m);
      var n_11ac = tput_files_11ac.length;
      var n_11ad = tput_files_11ad.length;
      for ( i = 0; i < n_11ac; i = i + 1 ) {
        var fname = tput_files_11ac[i];
        // set up each Promise in the array
        genPromises[i] = o.genTput( n_11ac, i + 1, m, fname );
			}
      for ( i = 0; i < n_11ad; i = i + 1 ) {
        var fname = tput_files_11ad[i];
        // set up each Promise in the array
        genPromises[i + n_11ac] = o.genTput( n_11ad, i + 1, 2, fname );
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
		 * obscures $http.get requests to the generatorScript
     *
     * if "wipe" arg is false or not supplied, then
     * t = total number of connected devices for the current Mode
     * n = index # for a tput#.txt
     * m = the Mode we are in, where '1' = MU, '0' = SU, and '2' = 'TB'
     * f = file name we should write to generate?
     *
     * if "wipe" = true, then
     * n = total # of MU-capable clients, to NOT change data for
     * m = # of "Legacy" clients, to wipe / change data for
     *
     * and in any case, q = 1 = be quiet about it
		 */
		o.triggerTputGen = function( t, n, m, f, wipe ) {
      var querystr = 't='+ t +'&i='+ n +'&m='+ m +'&f='+ f;
      if ( wipe ) {
        querystr += '&w=1';
      }
      // and tell php script to be quiet & not print things
      querystr += '&q=1';
      // and then return our Promise / $http.get
			return $http.get( txtsLocation +'/'+ generatorScript +'?'+ querystr );
		};
		/**
		 * gets response from triggerTputGen and then resolves our Promise?
		 */
		o.genTput = function( total, num, m, fname ) {
      // set up the $q.defer Promise
			var defer = $q.defer();
      // call our getTputData & process result after it returns
			o.triggerTputGen( total, num, m, fname, false ).then(function(result) {
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
    /**
     * "wipes" tput data via triggerTputGen
     */
    o.clearLegacyTputs = function() {
      //console.log('generators.js : clearLegacyTputs');
      return o.triggerTputGen(
        '',
        QMIMO_NUMBER_OF_MU_DEVICES,
        QMIMO_NUMBER_OF_LEGACY_DEVICES,
        '',
        true
      );
    };
    /**
     * by copying clearLegacyTputs but adding an extra query arg
     * we can fake updating the tput#.txt with that value
     */
    o.fakeLegacyTime = function( time ) {
      //console.log('generators.js : fakeLegacyTime');
      return o.triggerTputGen(
        '',
        QMIMO_NUMBER_OF_MU_DEVICES +'&r='+ time,
        QMIMO_NUMBER_OF_LEGACY_DEVICES,
        '',
        true
      );
    };
		// return our factory
		return o;
	}
})();