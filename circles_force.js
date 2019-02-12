// https://bl.ocks.org/mbostock/3231298#index.html
// Modified version based on Mike Bostock's 'collision detection' script https://bl.ocks.org/mbostock/3231307
// February 11th 2019
// work is released under Released under the GNU General Public License, version 3

// canvas size
var width = window.innerWidth;
var height = window.innerHeight;

// simulation settings
var num_of_nodes = 500;
var charge_strength = -1000;
var attraction_strength = 0;

// node dims
var min_r = 1;
var max_r = 5;
var r_offset = -1;

var nodes = d3.range(num_of_nodes).map(function() { return {radius: Math.random() * (max_r - min_r) + min_r}; }),
    root = nodes[0],
    color = '#AA3939'

root.radius = 1;
root.fixed = true;
root.px = 800;
root.py = 800;
var force = d3.layout.force()
    .gravity(attraction_strength)
    .charge(function(d, i) { return i ? 0 : charge_strength; })
    .nodes(nodes)
    .size([width, height]);

force.start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("circle")
    .data(nodes.slice(1))
  .enter().append("circle")
    .attr("r", function(d) { return d.radius + r_offset; })
    .style("fill", function(d, i) { return color; });

force.on("tick", function(e) {
  var q = d3.geom.quadtree(nodes),
      i = 5,
      n = nodes.length;

  while (++i < n) q.visit(collide(nodes[i]));

  svg.selectAll("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});

d3.select('body').on("mousemove", function() {
  var p1 = d3.mouse(this);
  root.px = p1[0];
  root.py = p1[1];
  force.resume();
});

function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}