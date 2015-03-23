function initchart(selector,data){
    var d3container = d3.select( selector ),
        width       = 1360,
        height      = 700,
        margin      = { top : 70, right : 0, bottom : 50, left : 0 },
        duration = 10000;

    var max_value = d3.max(data, function(d) { return d.value; }),
        max_date = d3.max(data, function(d) { return d.date; }),
        min_date = d3.max(data, function(d) { return d.date; });

    var x = d3.time.scale()
        .range([0, width])
        .domain([new Date(data[0].date), d3.time.day.offset(new Date(data[data.length - 27].date), 1)]);

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

//------------------------------ Налаштування зуму -------------------------- ------------------------------------------
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

    drawchart(svg,data,'#F3D364','#F2C52C');
//    drawchart(svg,data.filter(function( datum ) { return datum.type === 'INTEL'; }),'#F3D364','#F2C52C');
//    drawchart(svg,data.filter(function( datum ) { return datum.type === 'DELL'; }),'#4DBBF3','#0CA4EF');
//    drawchart(svg,data.filter(function( datum ) { return datum.type === 'ASUS'; }),'#A17CE1','#C063ED');
    drawXaxes(svg);
    drawYaxes(svg);

//------------------------------ Невидимий квадрат для можливості зумити по вісі Х -------------------------- ------------------------------------------
    svg.append("rect")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

//------------------------------ Малює графік -------------------------- ------------------------------------------
    function drawchart(svg,data,color,valueline){
        var Graph = svg.append( 'g');
        Graph.append( 'path' )
            .datum( data )
            .attr('d', area )
            .attr('fill' ,color)
            .attr('opacity',.6)
            .attr("class", "area")
            .attr('stroke',valueline)
            .attr("stroke-width","2")
        //------------------------------ для анімації -------------------------- ------------------------------------------
//                .transition().duration(duration)
//                .attr("transform", "translate(-"+ (x(max_date)- width) +",0)");
        //------------------------------ --------------------------------------- ------------------------------------------
    }
//------------------------------ Перемальовує графік при зумі -------------------------- ------------------------------------------
    function redraw() {
        svg.selectAll(".x.axis").call(xAxis)
            .selectAll('text')
                .attr("fill","#ffffff");
        svg.selectAll("path.area").attr("d", area);
    }
//------------------------------ Вісь Х -------------------------- ------------------------------------------
    function drawXaxes(svg){

        var xAxisGroup = svg.append( 'g' )
            .attr( 'class', 'x axis' )
            .attr( 'transform', 'translate( 0,' + ( height - margin.bottom) + ')');
        var x_p = svg.select(".x.axis")
            .call(xAxis)
            .selectAll('text')
                .attr("fill","#ffffff");

        x_p.transition().selectAll(".tick text:first-child").attr('fill','none');
        //------------------------------ для анімації є баг дата криво крутиться ------------------------------------------
//        x_p.transition().duration(duration)
//                .attr("transform", "translate(-"+ (x(max_date)- width) +","+ ( height - margin.bottom) + ")");
        //------------------------------ --------------------------------------- ------------------------------------------
    }
//------------------------------ Вісь Y -------------------------- ------------------------------------------
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
//------------------------------ Хз чому стандартна з багом, Так виводить без бага -------------------------- ------------------------------------------
    function timeFormat(formats) {
        return function(date) {
            var i = formats.length - 1, f = formats[i];
            while (!f[1](date)) f = formats[--i];
            return f[0](date);
        };
    }
}
//------------------------------ Ініціалізація і підготовка даних -------------------------- ------------------------------------------
//function init() {
//    d3.json("json/v2-data.json",function(data){
//        parseDate = d3.time.format("%Y-%m-%e").parse;
//        data.forEach(function(d) {
//            d.date = parseDate(d.date);
//            d.value = +d.value;
//        });
//        initchart('#chart',data);
//    });
//}

function init() {
    d3.json("json/data_for_line_chart.json",function(data){
        data = data.data[0].data;
        parseDate = d3.time.format("%Y-%m-%e").parse;
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.value = +d.value;
        });
        initchart('#chart',data);
    });
}


init();