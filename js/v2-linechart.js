function initchart(selector,data){
    var d3container = d3.select( selector ),
        width       = data.system.width,
        height      = data.system.height,
        margin      = { top : 70, right : 0, bottom : 50, left : 0 },
        duration = data.system.duration,
        i= 0,
        start_date_bettwen = data.system.start_date_bettwen;


    var color = data.system.colors;

    var max_value = d3.max(data, function(d) { return d.value; }),
        max_date = d3.max(data, function(d) { return d.date; }),
        min_date = d3.max(data, function(d) { return d.date; });

    var x = d3.time.scale()
        .range([0, width])
        .domain([new Date(data[start_date_bettwen[0]].date), new Date(data[start_date_bettwen[1]].date)]);

    var y = d3.scale.linear()
        .range([height, margin.top])
        .domain([0.5, max_value]);

    var customTimeFormat = timeFormat([
        [d3.time.format("%b %d"), function(d) { return d.getDate(); }]
    ]);

    var svg = d3container.append( 'svg' )
        .attr( 'height', height + margin.top)
        .attr( 'width', width);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(customTimeFormat)
        .ticks(d3.time.days, 1);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .ticks(10)
        .tickPadding(6);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(y(0))
        .y1(function(d) { return y(d.value); });

//------------------------------ init gradient -------------------------- ------------------------------------------
    var defs = svg.append( 'defs' );
    var gradient = defs.append( 'linearGradient' )
        .attr( 'id', 'grad1' )
        .attr('x1','0%')
        .attr('y1','50%')
        .attr('x2','0%')
        .attr('y2','100%')

    gradient.append( 'stop' )
        .attr( 'offset', '50%' )
        .attr( 'style', 'stop-color:'+color[i][0]+';stop-opacity:1' );
    gradient.append( 'stop' )
        .attr( 'offset', '100%' )
        .attr( 'style', 'stop-color:'+color[i][1]+';stop-opacity:1' );

// - setting zoom
    var zoom = d3.behavior.zoom()
        .x(x)
        .scaleExtent([1,1]);

    zoom.on('zoom', function() {
        var t = zoom.translate(),
        tx = t[0];
        tx = Math.min(tx,x.range()[0]);
        tx = Math.max(tx,t[0]- x(max_date) + x.range()[1]);
        zoom.translate([tx, t[1]]);
        redraw();
    });

    data.id.forEach(function(id){
        drawchart(svg,
            data.filter(function( datum ) { return datum.id === id; }),
            color[i][0],
            color[i][1]);
        i++;
    });
    createGrid(data);
    drawXaxes(svg);
    drawYaxes(svg);
    rescale(start_date_bettwen[0],start_date_bettwen[1]);

/*
    Draw path
    param {obj} svg = svg;
    param {obj} data = data.json;
    param {color scheme} color = color graph, or id gradient
    param {color scheme} valueline = color stroke;
 */
    function drawchart(svg,data,color,valueline){
        var Graph = svg.append( 'g')
            .append( 'path' )
            .datum( data )
            .attr('d', area )
            .attr('fill','url(#grad1)')
            .attr('opacity',.9)
            .attr("class", "area")
            .attr('stroke',valueline)
            .attr("stroke-width","4")

    }

/*
Redraw all lines after zoom
 */

    function redraw() {
        var x_p = svg.select(".x.axis")
            .call(xAxis);
        svg.selectAll("path.area")
            .attr("d", area);
        var line_x = x_p.selectAll('.tick')
            .attr("id", function(d, i) { return ("idlabel_" + i)});

        redrawVerticalLines(line_x)

    }

/*
 Draw X axes
 */

    function drawXaxes(svg){
        var xAxisGroup = svg.append( 'g' )
            .attr( 'class', 'x axis' )
            .attr( 'transform', 'translate( 0,' + ( height - margin.bottom) + ')');
        var x_p = svg.select(".x.axis")
            .call(xAxis);
        var line_x = x_p.selectAll('.tick')
            .attr("id", function(d, i) { return ("idlabel_" + i)});

        redrawVerticalLines(line_x)

    }

/*
 Rescale after moving domain data
 */

    function rescale(x1,x2){
        x.domain([data[x1].date, data[x2].date]);
        var line_x = svg.selectAll('.x .tick')
            .attr("id", function(d, i) { return ("idlabel_" + i)});

        svg.selectAll('.area').transition().duration(duration/6).ease('linear')
            .attr("d", area)
            .each("end", function() {
                if (data[x2].date>=max_date){
                    svg.append("rect")
                        .attr("class", "pane")
                        .attr("width", width)
                        .attr("height", height)
                        .call(zoom);
                }else {rescale(x1+1,x2+1);}
            });

        svg.selectAll('.x.axis').transition().duration(duration/6).ease('linear')
            .call(xAxis)
            .each("end", function() {
                if (get_day(x2)==true ){
                    var smile = svg.select("#idlabel_"+x2);
                    redrawSmiles(smile,x2)
                }
            });

        redrawVerticalLines(line_x);

        function get_day(day){
            return ((day % 7)==0) ? true : false ;
        }
    }
/*
 Redraw vertical lines and circles
 param {obj} line_x = svg selectAll('.tick')
 */
    function redrawVerticalLines(line_x){
        line_x.append("circle")
            .attr("r",5)
            .attr("fill",'lightgray')
            .attr("stroke-width", 3)
            .attr('class','circle_dot')
            .attr("stroke", "white")
            .attr("opacity",.5);

        line_x.append('line')
            .attr('y1', 0 - height+(height/4))
            .attr('y2', 1.5)
            .attr("stroke-width", 2)
            .attr("stroke", "lightgray")
            .attr("opacity",.5);
    }

/*
 Redraw smiles
 param {obj} smile = svg.select(); id line_x
 param {int} x2 = max display date
 */

    function redrawSmiles(smile,x2){
        smile.append('rect')
            .attr('x',0)
            .attr('y',0 - height+(height/4)-height/30)
            .attr('width',0)
            .attr('height',1)
            .transition().duration(duration/20)
                .attr('y',0 - height+(height/4)-height/20)
                .attr('x',-width/10)
                .attr('width',width/10)
                .attr('height',height/22)
                .attr('fill','white')
                .attr('stroke','grey')
                .attr('stroke-width',1);
        smile.append("circle")
            .attr('fill','white')
            .attr("r",5)
            .attr("opacity",1)
            .transition().duration(duration/20)
                .attr("r",height/35)
                .attr('cy', 0 - height+(height/4)-height/35)
                .attr("fill",'white')
                .attr("stroke-width", 1)
                .attr('class','circle_dot')
                .attr("stroke", "grey")
                .attr("opacity",1)
        smile.append("text")
            .attr('class','days')
            .attr('font-size',height/58)
            .attr('y',0-height+(height/4)-height/45)
            .attr('x',-width/10+5)
            .transition().delay(duration/20)
                .text(function(d){return customTimeFormat(data[x2-7].date)+' - '+customTimeFormat(data[x2].date)});
    }
/*
Draw Y axes
 */
    function drawYaxes(svg){
        var yAxisGroup = svg.append( 'g' )
            .attr( 'class', 'y axis' )
            .attr( 'transform', 'translate(' + ( 50 ) + ')', 0 );

        var y_p = svg.select(".y.axis")
            .call(yAxis);

        y_p.transition()
            .selectAll("text")
            .style("text-anchor", "middle");

        y_p.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .attr("dx", ".2em")
            .text("POST COUNT");

        y_p.selectAll('.tick')
            .append("circle")
            .attr("r",10)
            .attr("fill",'grey')
            .attr("opacity",.3);


    }

/*
Create horizontal grid
*/

    function createGrid(data) {
        var grid = svg.selectAll("line.horizontalGrid").data(y.ticks(50));
        grid.enter()
            .append("line")
            .attr("class","horizontalGrid");
        grid.exit().remove();
        grid.attr({
            "x1":0,
            "x2": width,
            "y1": function (d) { return y(d); },
            "y2": function (d) { return y(d); }
        });

    }

/*
Fix data view
 */
    function timeFormat(formats) {
        return function(date) {
            var i = formats.length - 1, f = formats[i];
            while (!f[1](date)) f = formats[--i];
            return f[0](date).toUpperCase();
        };
    }
}

/*
 Get and transform data from json
 */
function init() {
    d3.json("json/data_for_line_chart.json",function(data){
        var dataset=[],
            id = [];
        parseDate = d3.time.format("%Y-%m-%e").parse;
        data.data.forEach(function(type){
            type.data.forEach(function(d){
                datas = [];
                datas.date = parseDate(d.date);
                datas.value = +d.value;
                datas.id = type.id;
                datas.display = type.display;
                dataset.push(datas);

            });
            id.push(type.id);
        });


        dataset.id = id;
        dataset.system = data.system;
        dataset.system ={
            "duration" : 10000,
            "height" : 680,
            "width" : 1360,
            "start_date_bettwen" : [0,7],
            "colors":[['#1369b2','#3ba5d4'],[,]]};
        console.log(dataset);
        initchart('#chart',dataset);
    });
}


init();