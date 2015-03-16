function visualizeDownloadTimeline( selector, data ) {

    var d3container = d3.select( selector ),
        width       = 700,
        height      = 500,
        margin      = { top : 70, right : 0, bottom : 20, left : 0 },
        width       =  width + margin.left + margin.right,
        height      = height,
        interval    = 200,


        svg         = d3container.append( 'svg' )
            .attr( 'height', height )
            .attr( 'width', width)
            ,

        x           = d3.scale.ordinal()
            .rangeRoundBands( [ 0, width ] )
            .domain(
                data.map( function( d ) { return d.date; } )
            ),
        xAxis        = d3.svg.axis().scale( x ).orient( 'bottom' ),

        y           = d3.scale.linear()
            .range( [ height - margin.bottom * 1.5, margin.top ] )
            .domain(
                [ 0, d3.max( data, function( d ) { return d.value; } ) ]
            ),
        yAxis       = d3.svg.axis().scale( y ).orient( 'left' ).ticks(10),

        xAxisGroup,
        yAxisGroup,

        duration = 3000;

    xAxisGroup = svg.append( 'g' )
        .attr( 'class', 'x axis' )
        .attr( 'transform', 'translate( 0,' + ( height - margin.bottom ) + ')' );


    yAxisGroup = svg.append( 'g' )
        .attr( 'class', 'y axis' )
        .attr( 'transform', 'translate(' + ( 50 ) + ')', 0 );


    //------------------------------------------------------------begin filters
    var defs = svg.append( 'defs' );

    var filter = defs.append( 'filter' )
        .attr( 'id', 'dropshadowArea' )

    filter.append( 'feGaussianBlur' )
        .attr( 'in', 'SourceAlpha' )
        .attr( 'stdDeviation', 3 )
        .attr( 'result', 'blur' );
    filter.append( 'feOffset' )
        .attr( 'in', 'blur' )
        .attr( 'dx', 2 )
        .attr( 'dy', 2 )
        .attr( 'result', 'offsetBlur' );

    var gradient = defs.append( 'linearGradient' )
        .attr( 'id', 'grad1' )
        .attr('x1','0%')
        .attr('y1','50%')
        .attr('x2','0%')
        .attr('y2','100%')

    gradient.append( 'stop' )
        .attr( 'offset', '0%' )
        .attr( 'style', 'stop-color:rgb(105, 159, 240);stop-opacity:1' );
    gradient.append( 'stop' )
        .attr( 'offset', '100%' )
        .attr( 'style', 'stop-color: rgb(156, 189, 240);stop-opacity:.5' );


    var feMerge = filter.append( 'feMerge' );

//        feMerge.append( 'feMergeNode' )
//                .attr( 'in", "offsetBlur' )
    feMerge.append( 'feMergeNode' )
        .attr( 'in', 'SourceGraphic' );
    //------------------------------------------------------------end filters

    drawArea(svg,data.filter(function( datum ) { return datum.type === 'INTEL'; }),1);
    drawYaxes(svg);
    drawXaxes(svg);

    function drawYaxes(svg){
        svg.select(".y.axis")
            .transition()
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", "middle");
        svg.select(".y.axis")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .attr("dx", ".2em")
            .text("POST COUNT");
        var circle_y = svg.select(".y.axis").selectAll('.tick')
            .append("circle")
            .attr("r",10)
            .attr("fill",'grey')
            .attr("opacity",.2);

        circle_y.transition()
            .attr("transform", function(d) {
                return "translate(-8,0)";
            });
    }

    function drawXaxes(svg){
        var x_p = svg.select(".x.axis");

        x_p.transition()
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle");

        var tooltip = d3.select("div.tooltip");

        var line_x = x_p.selectAll('.tick')
            .append('g')
            .attr('class','focus')
            .on("mouseover", function (d) {
                add_text(d);
                d3.select(this).transition().duration(interval)
                    .attr("transform", function(d) {
                        return "scale(1.03)";
                    })
                return tooltip.style("visibility", "visible");

            })
            .on("mousemove", function () {
                return tooltip
                    .style("top", (d3.event.pageY + 16) + "px")
                    .style("left", (d3.event.pageX + 16) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).transition()
                    .attr("transform", function(d) {
                        return "scale(1)";
                    });
                return tooltip.style("visibility", "hidden");
            });

        line_x.append("circle")
            .attr("r",5)
            .attr( 'filter', 'url(#dropshadowArea)' )
            .attr("fill",'green')
            .attr("stroke-width", 3)
            .attr('class','circle_dot')
            .attr("stroke", "grey");

        line_x.append('line')
            .attr('y1', 0 - height+65)
            .attr('y2', 1.5)
            .attr("stroke-width", 2)
            .attr("stroke", "green")
            .attr("opacity",.2);

        line_x.append("circle")
            .attr('cy',0 - height+50)
            .attr("r",15)
            .attr("transform", function(d) {
                return "scale(1)";
            })
            .attr('class','smile')
            .attr( 'filter', 'url(#dropshadowArea)' )
            .attr( 'fill' ,'url(#grad1)')
            .attr("stroke-width", 3)
            .attr("stroke", "grey")
            .attr("opacity",.5);


        function add_text(d) {
            var text='';
            data.forEach( function( datum ) {
                if (datum.date == d) text = 'Date: '+d+'<br>Value: '+datum.value+'';
            } );
            tooltip
                .html(text);

        }


    }
    function drawArea( svg, data, index ) {
        var area = d3.svg.area()
            .x( function( d ) { return x( d.date ) + x.rangeBand() / 2 ; } )
            .y0( height - margin.bottom * 1.5 )
            .y1( function( d ) { return y( d.value ); } )
            .interpolate( 'monotone' ),
            startData = [];

        data.forEach( function( datum ) {
            startData.push( { date : datum.date, value : 0 } );
        } );

        var Graph = svg.append( 'g');
        Graph.append( 'path' )
            .datum( startData )
            .attr( 'stroke' ,'#a8aff1')
            .attr( 'stroke-width' ,'3')
            .attr( 'd', area )
            .attr( 'filter', 'url(#dropshadowArea)' )
            .attr( 'fill' ,'url(#grad1)')
            .transition()
            .duration( 3000 )
            .attrTween( 'd', tweenArea( data ) );

        function tweenArea( b ) {
            return function( a ) {
                var i = d3.interpolateArray( a, b );
                a.forEach( function( datum, index ) {
                    a[ index ] = b[ index ]
                } );

                return function( t ) {
                    return area( i ( t ) );
                };
            };
        }



    }
}
function init() {
    d3.json("json/data.json",function(data){
        visualizeDownloadTimeline('.ui__timeline',data);
    });
}

init();