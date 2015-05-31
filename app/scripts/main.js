/* jshint unused: false */
/* global jsyaml, d3 */

'use strict';


var App = window.App = {};

// Expose it for testing purposes
App.createHierarchy = function(stackfile) {
  var root = stackfile.lb;

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
  return iterator(root,'lb');
};

App.renderFactory = function() {
  var dimensions = {
    margin: 30,
    itemWidth: 150,
    itemHeight: 40,
    borderRadius: 5
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

  var svg = svgContainer.append('g');

  return function update(stackfile) {
    var data = App.createHierarchy(stackfile);
    var nodes = tree.nodes(data);
  
    svg.remove();

    svg = svgContainer
      .append('g')
      .attr('transform', 'translate(' + dimensions.margin + ',' + dimensions.margin + ')');

    var node = svg.selectAll('path.link').data(nodes, function(d) { return d.name; });
    var link = svg.selectAll('g.node').data(tree.links(nodes), function(d) { return d.source.name + '-' + d.target.name; });

    link
      .enter()
      .append('path')
      .attr('class', 'link')
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
        .attr('transform', 'translate(0,-5)')
        .attr('text-anchor','middle');

      nodeContent.append('text')
        .text(function(d) { return d.embedded.image; })
        .attr('dy', '.35em')
        .attr('transform', 'translate(0,5)')
        .attr('text-anchor','middle');
  };

};

App.init = function() {
  var d3Area, d3AreaWrapper;
  
  var render = App.renderFactory();

  var fileData = function() {
    try { return jsyaml.load(d3Area.node().value); }
    catch(e){ return null; }
  };

  d3Area = d3.select('#stackfile-content');
  d3AreaWrapper = d3.select('.stack-input');

  d3Area.node().addEventListener('input',function() {
    var stackfileData = fileData();

    if(!stackfileData){
      d3AreaWrapper.classed('has-error', true);
      return;
    }

    d3AreaWrapper.classed('has-error',false);
    render(stackfileData);
  });

  render(fileData());
};

App.init();
