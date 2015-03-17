function initchart(selector,data){
    var d3container = d3.select( selector ),
        width       = 700,
        height      = 500,
        margin      = { top : 70, right : 0, bottom : 20, left : 0 },
        duration = 1000;

    var x = d3.time.scale()
        .range([0, width])
        .domain([new Date(data[0].date), d3.time.day.offset(new Date(data[data.length - 5].date), 1)]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) { return d.value; })]);
    var zoom = d3.behavior.zoom()
        .scaleExtent([1,1])
        .on("zoom", draw);

    var svg = d3container.append( 'svg' )
        .attr( 'height', height )
        .attr( 'width', width);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height, 0)
        .tickPadding(6)
        .ticks(d3.time.days, 1);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .tickSize(-width)
        .tickPadding(6);
    var xAxisGroup = svg.append( 'g' )
        .attr( 'class', 'x axis' )
        .attr( 'transform', 'translate( 0,' + ( height-70) + ')');

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(y(0))
        .y1(function(d) { return y(d.value); });

        zoom.x(x);
    
    drawchart(svg,data.filter(function( datum ) { return datum.type === 'INTEL'; }),'#F3D364','#F2C52C')
    drawchart(svg,data.filter(function( datum ) { return datum.type === 'DELL'; }),'#4DBBF3','#0CA4EF')
    drawchart(svg,data.filter(function( datum ) { return datum.type === 'ASUS'; }),'#A17CE1','#C063ED')
    drawXaxes(svg);

    svg.append("rect")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    function drawchart(svg,data,color,valueline){
        var Graph = svg.append( 'g');
        Graph.append( 'path' )
            .datum( data )
            .attr('d', area )
            .attr('fill' ,color)
            .attr('opacity',.6)
            .attr("class", "area")
            .attr('stroke',valueline)
            .attr("stroke-width","2");
    }

    function draw() {
        svg.selectAll(".x.axis").call(xAxis);
        svg.selectAll("path.area").attr("d", area);
    }

    function drawXaxes(svg){
        var x_p = svg.select(".x.axis");
        x_p.transition()
            .call(xAxis)
            .selectAll("text")
            .transition()
                .style("text-anchor", "middle");
    }
}

function init() {
    d3.json("json/v2-data.json",function(data){
        parseDate = d3.time.format("%Y-%m-%e").parse,
            formatDate = d3.time.format("%b %d")
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.value = +d.value;
        });
        initchart('#chart',data);
    });
}

init();