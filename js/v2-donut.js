if (navigator.userAgent.indexOf('AppleWebKit')>0){
    add_fix_width_for_name_text=0;
    add_fix_width_for_percent=0;
    add_fix_margin_block=0;

}else{
    add_fix_width_for_name_text=0;
    add_fix_width_for_percent=0;
    add_fix_margin_block=0;
}

//end fix
var setting = [];

function addSvg(selector){
    var svg = d3.select('#'+selector)
        .append('svg')
        .attr('width', setting.width)
        .attr('height', setting.height);
    return svg;
}

function initData(svg,dataset){
    svg.html('');
    var width = setting.width;
    var height = setting.height;
    var radius = Math.min(width, height) / 2;
    var rotate = 10;
    var duration = setting.duration;
    var donutWidth = setting.donutWidth;
    var innerRadius = (Math.min(width, height) / 2) - donutWidth;

    var color = setting.colorSector;
    var colorPointSmallCircle = setting.colorPointSmallCircle;
    var radiusPointSmallCircle = setting.radiusPointSmallCircle;
    var paddingCenterCircleForInfoData = setting.paddingCenterCircleForInfoData;



    var pie = d3.layout.pie()
        .value(function(d) { return d.value; })
        .sort(null);

    initShadow();
    drawDonut(dataset,svg);


    function initShadow(){
        var defs = svg.append( 'defs' );

        var ellipseShadow = defs.append( 'filter' )
            .attr( 'id', 'shadowDonut' );
        ellipseShadow.append( 'feGaussianBlur' )
            .attr( 'stdDeviation', 11 )
            .append( 'feOffset' )
            .attr( 'in', 'blur' )
            .attr( 'dx', 0 )
            .attr( 'dy', 0 );

        var feMerge = ellipseShadow.append( 'feMerge' )
            .append( 'feMergeNode' )
            .attr( 'in", "offsetBlur' );

        var grads = defs.append("radialGradient")
            .attr("id", "circle_center")

            .attr("r", "100%");
        grads.append("stop").attr("offset", "48%").style("stop-color", "#F5F6F5");
        grads.append("stop").attr("offset", "100%").style("stop-color", "black");
    }


    function drawDonut(dataset,svg){

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                return innerRadius + d.data.size;
            });

        var ellipse = svg.append('g')
            .attr('class','bottom_shadow');


        ellipse.append('ellipse')
            .attr('cx',width / 2)
            .attr('cy',height-80)
            .attr('rx',180)
            .attr('ry',40)
            .attr('opacity',.12)
            .attr( 'filter', 'url(#shadowDonut)' );

        var path = svg.append('g')
            .attr('class','donut');

        path.selectAll('path').data(pie(dataset))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
            .attr("fill","#fff")
            .attr("opacity",.0)
            .transition()
            .attr("opacity",1)
            .attr("fill", function(d, i) { return color[i]; })
            .delay(function(d, i) { return i * 100; })
            .duration(duration/2-duration/5)
            .attrTween('d', function(d) {
                var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            });

        setTimeout(function(){
            path.append('circle')
                .attr({
                    cx: width/2,
                    cy: height/2,
                    r: innerRadius,
                    opacity: 0})
                .transition().duration(duration)
                .attr("opacity",1)
                .attr('fill','url(#circle_center)');
        },200);

        setTimeout(function(){
            var circles = svg.append("g")
                .attr("class", "lines")
                .selectAll("circle")
                .data(pie(dataset));

            circles.enter()
                .append("circle")
                .attr({
                    transform: 'translate(' + (width / 2) + ',' + (height / 2) + ')',
                    r: function(){return radiusPointSmallCircle[0]; },
                    fill: function(){return colorPointSmallCircle[0]; }})
                .transition().duration(duration)
                .attrTween("cx", function(d){ return findCenterForCircles(d,0);})
                .attrTween("cy", function(d){ return findCenterForCircles(d,1);});

            circles.enter()
                .append("circle")
                .attr({
                    transform: 'translate(' + (width / 2) + ',' + (height / 2) + ')',
                    r: function(){return radiusPointSmallCircle[1]; },
                    fill: function(){return colorPointSmallCircle[1]; }})
                .transition().duration(duration)
                .attrTween("cx", function(d){ return findCenterForCircles(d,0);})
                .attrTween("cy", function(d){ return findCenterForCircles(d,1);});


            svg.append("g")
                .attr("class", "lines")
                .selectAll("polyline")
                .data(pie(dataset))
                .enter()
                .append("polyline")
                .attr('transform', 'translate(' + (width / 2) +
                    ',' + (height / 2) + ')')
                .transition().duration(duration)
                .attrTween("points", function(d){
                    var interpolate = d3.interpolate(d, d);
                    return function(t) {
                        var d2 = interpolate(t);
                        var start = arc.centroid(d2);
                        var pos = arc.centroid(d2);
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), pos];
                    };
                });

            var text =  svg.append("g")
                .selectAll("text")
                .data(pie(dataset));

            text.enter()
                .append("text")
                .attr("class", "text_name")
                .text(function(d) { return d.data.name;})
                .transition().duration(duration)
                .attrTween("transform", function(d){ return transformName(d)})
                .styleTween("text-anchor", function(d){ return textAnchor(d)})
                .each(function(d) {
                    d.text_name_box = this.getBBox();
                });

            text.enter()
                .append("text")
                .attr("fill", function(d, i) {
                    return color[i]=="#ffffff" ? "grey" : color[i]; })
                .attr("class", "text_value")
                .text(function(d) { return d.data.value;})
                .transition().duration(duration)
                .attrTween("transform", function(d){ return transformValue(d)})
                .styleTween("text-anchor", function(d){ return textAnchor(d)})
                .each(function(d) {
                    d.text_val_box = this.getBBox();
                });



            text.enter()
                .append("text")
                .attr("fill", function(d, i) {
                    return color[i]=="#ffffff" ? "grey" : color[i]; })
                .attr("class", "percent")
                .text("%")
                .transition().duration(duration)
                .attrTween("transform", function(d){return transformPercent(d)})
                .styleTween("text-anchor", function(d){ return textAnchor(d)})
                .each(function(d) {
                    d.percent_box = this.getBBox();
                });



            function findCenterForCircles(d,n){
                var interpolate = d3.interpolate(d, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    return start[n];
                };
            }

            function textAnchor(d){
                var interpolate = d3.interpolate(d, d);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "end":"start";
                };
            }

            function transformPercent(d){
//                console.log(d.text_val_box);
                var interpolate = d3.interpolate(d, d);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    var pos = arc.centroid(interpolate(t));
                    if (midAngle(d2) < Math.PI){
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData + (width / 2);
                    }else{
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData * -1 + (width / 2)+ d.text_val_box.width-add_fix_width_for_percent;
                    }
                    pos[1] += height / 2;
                    midAngle(d2) > (Math.PI/2) && midAngle(d2) < (3 * Math.PI/2) ? pos[1] +=d.text_name_box.height/2 + d.text_val_box.height/2 : pos[1] -=d.text_val_box.height/2 - d.percent_box.height/4;
                    return "translate("+ pos +")";
                };
            }

            function transformValue(d){
                var interpolate = d3.interpolate(d, d);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    var pos = arc.centroid(interpolate(t));
                    if (midAngle(d2) < Math.PI){
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData + (width / 2)- d.percent_box.width;
                    }else{
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData * -1 + (width / 2) ;
                    }
                    pos[1] += height / 2;
                    midAngle(d2) > (Math.PI/2) && midAngle(d2) < (3 * Math.PI/2) ? pos[1] +=d.text_val_box.height - d.text_name_box.height/2+3+add_fix_margin_block  : pos[1] -=d.text_name_box.height/2-3;
                    return "translate("+ pos +")";
                };
            }

            function transformName(d){
                var interpolate = d3.interpolate(d, d);
                return function(t) {
                    var d2 = interpolate(t);
                    var start = arc.centroid(d2);
                    var pos = arc.centroid(interpolate(t));
                    if (midAngle(d2) < Math.PI){
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData + (width / 2) - d.text_val_box.width - d.percent_box.width + d.text_name_box.width + add_fix_width_for_name_text;
                    }else{
                        pos[0] = start[0]+donutWidth * paddingCenterCircleForInfoData * -1 + (width / 2) ;
                    }
                    pos[1] += height / 2;
                    midAngle(d2) > (Math.PI/2) && midAngle(d2) < (3 * Math.PI/2) ? pos[1] +=d.text_name_box.height : pos[1] -= d.text_val_box.height - d.text_name_box.height+add_fix_margin_block;
                    return "translate("+ pos +")";
                };
            }

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }
        },1000);

    }
}
function initRoundChart(setting){
    svg = addSvg('chart');
    d3.json("json/data_for_donut_json.json",function(data){
        i=0;
        ar = data[i];
        initData(svg,ar.data);
        setInterval(function(){
            (i!=data.length-1) ? i++ : i=0;
            ar = data[i];
            initData(svg,ar.data);
        },3000);

    });
}
initRoundChart(setting = {
        "duration":2000,
        "width":960,
        "height":600,
        "donutWidth":175,
        "colorSector":['#f2c426','#c366ea','#07a2f2','#ffffff','#0071c5'],
        "colorPointSmallCircle":["white", "grey"],
        "radiusPointSmallCircle":[5,2],
        "paddingCenterCircleForInfoData":1.15
});