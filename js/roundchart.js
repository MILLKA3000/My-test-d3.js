var data=[
    {label:"ASUS",value:20},
    {label:"ACER",value:30},
    {label:"DELL",value:20},
    {label:"INTEL",value:5},
    {label:"OTHER",value:25},
];
var svg = d3.select("#chart")
    .append("svg")
    .append("g")

svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "labels");
svg.append("g")
    .attr("class", "lines");

var width = 960,
    height = 450,
    inc_color = 0,
    radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        return d.value;
    });

var outerRadius = height / 2-100,
    innerRadius = outerRadius / 2,
    cornerRadius = 10;

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var outerArc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function(d){ return d.data.label; };

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);
var color_circle = ["white", "grey"];

change(data);

function setHover(d, doSet){
    d3.select(this).classed("hover", doSet)
}

function change(data) {
    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice");

    slice.transition().duration(2000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })

    slice.on("mouseover", function(d,i){

        d3.select(this).transition()
            .attr("transform", "scale(1.1,1.1)");
        d3.select(this).selectAll("polyline").transition()
            .attr("transform", "scale(1.1,1.1)");
        return setHover.call(this, i, true);
    });

    slice.on("mouseout", function(d,i){
        d3.select(this).transition()
            .attr("transform", "scale(1,1)");
        return setHover.call(this, i, false);
    });




    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
        .data(pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.label;
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit()
        .remove();

    /* ------- CIRCLES for polilines -------*/
    var circles = svg.select(".lines").selectAll("circle")
        .data(pie(data));

    for(var i=4;i>=2;i-=2){

        circles.enter()
            .append("circle")
            .attr('r',i)
            .attr('fill', color_circle[inc_color]);

        circles.transition().duration(1000)
            .attrTween("cx", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    return start[0];
                };
            })
            .attrTween("cy", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    return start[1];
                };
            });
        inc_color++;
    }
    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var start = arc.centroid(d2);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [start, outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
