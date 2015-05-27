'use strict'
/**
 * qmimoBorderFill Directive
 *
 * Takes an element like <div class="pie" qmimo-border-fill="su"></div>
 * and adds the rest of HTML and ng-style hooks, to be like
 * http://codepen.io/chousmith/pen/pvEyMJ
 */
angular
  .module('qmimo')
  .directive('qmimoBorderFill', qmimoBorderFill);
  
function qmimoBorderFill( $compile ) {
  return {
    link: function (scope, element, attrs) {
      var mo = attrs['qmimoBorderFill'];// === 'su' ? 'su' : 'mu';
      
      var ow = element[0].offsetWidth;
      
      if ( ow > 0 ) {
        // clipping for auto circles requires dividing in 2
        var hw = Math.round( ow / 2 );
        // and setting ring border-width = width / 13 seems to work nice
        var bw = 38; /*Math.round( ow / 5.5 );*/
        // add our id so we can subsequently inject the rest of the HTML
        element.attr( 'id', 'pie-'+ mo );
        // add our sub element HTML
        angular.element(document.getElementById('pie-'+mo)).append($compile('<div class="h h0" style="clip: rect(0px '+ ow +'px '+ ow +'px '+ hw +'px);"><div class="border"  style="clip: rect(0px '+ hw +'px '+ ow +'px 0px); border-width: '+ bw + 'px;" ng-style="'+mo+'_b1s"></div></div>')(scope));
      }
    }
  }
}