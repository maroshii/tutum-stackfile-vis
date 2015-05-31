/* global jsyaml, d3 */

'use strict';

var App = window.App = {};

App.createHierarchy = function(stackfile) {
  function iterator(raw){
    var tree = {}, children;

    tree.name = raw.image;
    tree.embedded = raw;

    if(!raw.links){
      return tree;
    }
    
    children = raw.links.reduce(function(memo,name) {
      if(stackfile[name]){
        var child = iterator(stackfile[name]);
        child.parent = tree.name;

        memo.push(child);
      }
      
      return memo;
    },[]);

    if(children.length){
      tree.children = children;
    }

    return tree;
  }
  return iterator(stackfile.lib);
};



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
