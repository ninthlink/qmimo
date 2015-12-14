/**
 * mimoScripts Factory
 *
 * provides methods for triggering perl scripts
 * via a php helper file in /perl-scripts/run.php
 */
angular
  .module('qmimo')
  .factory('mimoScripts', mimoScripts);

mimoScripts.$inject = [ '$http' ];

function mimoScripts( $http ) {
  return {
    /**
     * trigger our QMIMO_MU_SWITCH_SCRIPT / QMIMO_SU_SWITCH_SCRIPT via a GET
     */
    modeChange: function( newmode ) {
      var fname = QMIMO_SU_SWITCH_SCRIPT;
      if ( newmode === 'mu' ) {
        fname = QMIMO_MU_SWITCH_SCRIPT;
      } else if ( newmode === 'tb' ) {
        fname = QMIMO_TB_SWITCH_SCRIPT;
      }
      //console.log('calling '+ QMIMO_PERL_SCRIPT_DIR +'/'+ fname +'.pl' );
      return $http.get( QMIMO_PERL_SCRIPT_DIR +'/run.php?s='+ fname );
    },
    /**
     * trigger our QMIMO_MG_SWITCH_SCRIPT / QMIMO_LB_SWITCH_SCRIPT via a GET
     */
    demoChange: function( newmode ) {
      var fname = newmode === 'mg' ? QMIMO_MG_SWITCH_SCRIPT : QMIMO_LB_SWITCH_SCRIPT;
      //console.log('calling '+ QMIMO_PERL_SCRIPT_DIR +'/'+ fname +'.pl' );
      return $http.get( QMIMO_PERL_SCRIPT_DIR +'/run.php?s='+ fname );
    }
  };
}
