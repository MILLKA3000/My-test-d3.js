function initchart(selector,data){
    var d3container = d3.select( selector ),
        width       = 1360,
        height      = 700,
        margin      = { top : 70, right : 0, bottom : 50, left : 0 },
        duration = 1000,
        i= 0,
        start_date_bettwen = [0,6];


    var color = [['#1369b2','#3ba5d4']];

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


//------------------------------ setting zoom -------------------------- ------------------------------------------


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

//------------------------------  -------------------------- ------------------------------------------

    data.id.forEach(function(id){
        drawchart(svg,
            data.filter(function( datum ) { return datum.id === id; }),
            color[i][0],
            color[i][1]);
        i++;
    });

    drawXaxes(svg);
    drawYaxes(svg);
    rescale(start_date_bettwen[0],start_date_bettwen[1]);

//------------------------------ Rect for zoom -------------------------- ------------------------------------------
//    svg.append("rect")
//        .attr("class", "pane")
//        .attr("width", width)
//        .attr("height", height)
//        .call(zoom);



//------------------------------ Draw path -------------------------- ------------------------------------------
    function drawchart(svg,data,color,valueline){
        var Graph = svg.append( 'g')
            .append( 'path' )
            .datum( data )
            .attr('d', area )
//            .attr('fill' ,color)
            .attr('fill','url(#grad1)')
            .attr('opacity',.9)
            .attr("class", "area")
            .attr('stroke',valueline)
            .attr("stroke-width","4")

    }
//------------------------------ redraw zoom -------------------------- ------------------------------------------
    function redraw() {
        var x_p = svg.select(".x.axis")
            .call(xAxis);
        svg.selectAll("path.area")
            .attr("d", area);
        var line_x = x_p.selectAll('.tick');

        line_x.append("circle")
            .attr("r",5)
            .attr("fill",'grey')
            .attr("stroke-width", 3)
            .attr('class','circle_dot')
            .attr("stroke", "white")
            .attr("opacity",.5);

        line_x.append('line')
            .attr('y1', 0 - height+65)
            .attr('y2', 1.5)
            .attr("stroke-width", 2)
            .attr("stroke", "grey")
            .attr("opacity",.5);
    }
//------------------------------ X -------------------------- ------------------------------------------
    function drawXaxes(svg){
        var xAxisGroup = svg.append( 'g' )
            .attr( 'class', 'x axis' )
            .attr( 'transform', 'translate( 0,' + ( height - margin.bottom) + ')');
        var x_p = svg.select(".x.axis")
            .call(xAxis);
        var line_x = x_p.selectAll('.tick');

        line_x.append("circle")
            .attr("r",5)
            .attr("fill",'grey')
            .attr("stroke-width", 3)
            .attr('class','circle_dot')
            .attr("stroke", "white")
            .attr("opacity",.5);

        line_x.append('line')
            .attr('y1', 0 - height+65)
            .attr('y2', 1.5)
            .attr("stroke-width", 2)
            .attr("stroke", "grey")
            .attr("opacity",.5);


    }

//------------------------------ Rescale -------------------------- ------------------------------------------
    function rescale(x1,x2){
        x.domain([data[x1].date, data[x2].date]);
        svg.selectAll('.area').transition().duration(duration/6).ease('linear')
            .attr("d", area)
            .each("end", function() {
                if (data[x2].date>=max_date){
                    svg.append("rect")
                        .attr("class", "pane")
                        .attr("width", width)
                        .attr("height", height)
                        .call(zoom);
                    zoom.translate();
                }else {rescale(x1+1,x2+1);}
            });
        svg.selectAll('.x.axis').transition().duration(duration/6).ease('linear')
            .call(xAxis);
        var line_x = svg.selectAll('.x .tick');

        line_x.append("circle")
            .attr("r",5)
            .attr("fill",'grey')
            .attr("stroke-width", 3)
            .attr('class','circle_dot')
            .attr("stroke", "white")
            .attr("opacity",.5);

        line_x.append('line')
            .attr('y1', 0 - height+65)
            .attr('y2', 1.5)
            .attr("stroke-width", 2)
            .attr("stroke", "grey")
            .attr("opacity",.5);
    }

//------------------------------ Y -------------------------- ------------------------------------------
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
    createsGrid(data);
    function createsGrid(data) {
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

//        var grid = svg.selectAll("line.verticalGrid").data(x.ticks());
//        grid.enter()
//            .append("line")
//            .attr("class","verticalGrid");
//        grid.exit().remove();
//        grid.attr({
//            "x1":function (d) { return x(d); },
//            "x2":function (d) { return x(d); },
//            "y1": 50,
//            "y2": height
//        });

    }

//------------------------------ Fix data view -------------------------- ------------------------------------------
    function timeFormat(formats) {
        return function(date) {
            var i = formats.length - 1, f = formats[i];
            while (!f[1](date)) f = formats[--i];
            return f[0](date);
        };
    }
}

//-------------------------------------- Get and transform data from json -----------------------------------------
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
        console.log(dataset);
        initchart('#chart',dataset);
    });
}


init();