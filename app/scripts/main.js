/* jshint unused: false, camelcase: false */
/* global jsyaml, d3 */

'use strict';

(function() {

var App = window.App = {};

// Closure containing the d3 bootrapping and rendering
function renderFactory() {
  var dimensions = {
    margin: 40,
    itemWidth: 150,
    itemHeight: 50,
    borderRadius: 5,
    counterRadius: 12
  };

  var d3VisWrapper = d3.select('.stack-vis');

  var width = d3VisWrapper.node().clientWidth - dimensions.margin * 2;
  var height = d3VisWrapper.node().clientHeight - dimensions.margin * 2;

  var tree = d3.layout.tree().size([width,height]);
  
  var diagonal = d3.svg.diagonal()
    .source(function(d) { return { y: d.source.y + (dimensions.itemHeight / 2), x: d.source.x }; })
    .target(function(d) { return { y: d.target.y - (dimensions.itemHeight / 2), x: d.target.x }; })
    .projection(function(d) { return [d.x, d.y]; });
  
  var svgContainer = d3VisWrapper
    .append('svg')
    .attr('width', width + dimensions.margin*2)
    .attr('height', height + dimensions.margin*2);

  svgContainer.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('refX', 5)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
        .attr('d', 'M 0,0 V 4 L6,2 Z');

  var svg = svgContainer.append('g');

  return function update(data) {
    svg.remove();

    if(!data){
      return;
    }

    var nodes = tree.nodes(data);
  
    svg = svgContainer
      .append('g')
      .attr('transform', 'translate(' + dimensions.margin + ',' + dimensions.margin + ')');

    var node = svg.selectAll('path.link').data(nodes, function(d) { return d.name; });
    var link = svg.selectAll('g.node').data(tree.links(nodes), function(d) { return d.source.name + '-' + d.target.name; });

    link
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrowhead)')
      .attr('d', diagonal);

    var nodeContent = node
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

    nodeContent.append('rect')
      .attr('rx',dimensions.borderRadius)
      .attr('ry',dimensions.borderRadius)
      .attr('width', dimensions.itemWidth)
      .attr('height', dimensions.itemHeight)
      .attr('transform', function(d) { return 'translate(-' + (dimensions.itemWidth / 2) + ',-' + (dimensions.itemHeight / 2) + ')'; });
    
    nodeContent.append('text')
      .text(function(d) { return d.name; })
      .classed('title',true)
      .attr('dy', '.35em')
      .attr('transform', 'translate(0,-8)')
      .attr('text-anchor','middle');

    nodeContent.append('text')
      .text(function(d) { return d.embedded.image; })
      .classed('image',true)
      .attr('dy', '.35em')
      .attr('transform', 'translate(0,8)')
      .attr('text-anchor','middle');

    var nodeCount = nodeContent
      .append('g')
      .classed('count',true)
      .attr('transform', 'translate(' + (dimensions.itemWidth / 2) + ',-' + (dimensions.itemHeight / 2) + ')');

    nodeCount
      .append('circle')
      .attr('r',dimensions.counterRadius);

    nodeCount.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor','middle')
      .text(function(d) { return d.embedded.target_num_containers || 1; });
  };
}

// Initialize App
App.init = function() {
  var d3Area, d3AreaWrapper;

  var fileData = function(txt) {
    try { return jsyaml.load(txt); }
    catch(e){ return null; }
  };

  var clearError = function() {
    d3AreaWrapper.classed('has-error', false);
  }, showError = function(){
    d3AreaWrapper.classed('has-error', true);
  };

  d3Area = d3.select('#stackfile-content');
  d3AreaWrapper = d3.select('.stack-input');

  d3Area.node().addEventListener('input',function() {
    var text, stackfileData, treeData;

    text = d3Area.node().value;

    if(!text.length){
      clearError();
      return App.render();
    }

    stackfileData = fileData(text);

    if(stackfileData){
      clearError();
      treeData = App.createHierarchy(stackfileData);
      if(treeData){
        App.render(treeData);
      }
      return;
    }
    showError();
  });
};

// Tree rendering function
// Should be called each time there's new data
// or called with no data to clear the tree
App.render = renderFactory();

// Given a stackfile in JSON formats creates
// a d3 tree hierarchy data structure
// See test/spec/test.js
// Exposed for testing purposes
App.createHierarchy = function(stackfile) {
  var keys, rootKey, root;

  if(!stackfile || typeof stackfile === 'string' || !((keys = Object.keys(stackfile)).length)){
    return null;
  }

  rootKey = stackfile.lb ? 'lb' : keys[0];
  root = stackfile[rootKey];

  if(!root){
    return null;
  }

  function iterator(raw,name){

    var tree = {}, children;

    tree.name = name;
    tree.embedded = raw;

    if(!raw.links){
      return tree;
    }
    
    children = raw.links.reduce(function(memo,name) {
      if(stackfile[name]){
        var child = iterator(stackfile[name],name);
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
  return iterator(root,rootKey);
};

// Populates the textarea from imported files
App.populate = function(files) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var ev = new Event('input');
    var el = document.querySelector('#stackfile-content');
    el.innerHTML = e.target.result;
    el.dispatchEvent(ev);
  };

  reader.readAsText(files[0]);
};

App.init();

}());