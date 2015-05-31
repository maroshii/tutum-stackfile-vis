/* global jsyaml, d3 */

'use strict';

var d3Area = d3.select('#stackfile-content');
var d3AreaWrapper = d3.select('.stack-input');

d3Area.node().addEventListener('input',function() {
  var stackfileJSON;

  try{
    stackfileJSON = jsyaml.load(d3Area.node().value);
    d3AreaWrapper.classed('has-error',false);
  } catch(e){
    d3AreaWrapper.classed('has-error',true);
    return;
  }

});
