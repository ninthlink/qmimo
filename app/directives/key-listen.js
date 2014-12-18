'use strict'
/**
 * qmimoKeyListen Directive
 *
 * provides some key capture functionality?
 */
angular
  .module('qmimo')
  .directive('qmimoKeyListen', qmimoKeyListen);
  
function qmimoKeyListen() {
  return {
    link: function (scope, element, attrs, controller) {
      element.on('keypress', function(e){
        console.log('keypress '+ e.keyCode);
      });
    }
  }
}