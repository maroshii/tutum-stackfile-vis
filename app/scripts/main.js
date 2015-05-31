/* global jsyaml, d3 */

'use strict';


var App = window.App = {};

// Expose it for testing purposes
App.createHierarchy = function(stackfile) {
  var root = stackfile.lb;

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
  return iterator(root);
};

App.renderTree = function(stackfile) {
  var data = App.createHierarchy(stackfile);
  console.log(data);

};

App.init = function() {
  var d3Area, d3AreaWrapper;

  var fileData = function() {
    try { return jsyaml.load(d3Area.node().value); }
    catch(e){ return null; }
  };

  d3Area = d3.select('#stackfile-content');
  d3AreaWrapper = d3.select('.stack-input');

  d3Area.node().addEventListener('input',function() {
    var stackfileData = fileData();

    d3AreaWrapper.classed('has-error',!!!stackfileData); // evaluate to boolean and negate
  });

  console.log(fileData());

  App.renderTree(fileData());

};

App.init();






