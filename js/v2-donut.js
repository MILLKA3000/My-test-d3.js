var dataset = [
    { value: 20, size: 100 },
    { value: 10, size: 100 },
    { value: 5, size: 100 },
    { value: 25, size: 100 },
    { value: 30, size: 120 }
];

function initData(selector,dataset){
    var width = 800;
    var height = 600;


    var donutWidth = 175;
    var innerRadius = (Math.min(width, height) / 2) - donutWidth;
    var color = ['#f2c426','#c366ea','#07a2f2','#ffffff','#0071c5'];

    var svg = d3.select('#'+selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

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

//        var inCircleShadow = defs.append( 'filter' )
//            .attr( 'id', 'inCircleShadow' );
//
//        inCircleShadow.append( 'feGaussianBlur' )
//            .attr( 'stdDeviation', 4 )
//            .attr('result','blur1')
//        inCircleShadow.append( 'feSpecularLighting' )
//                .attr( 'in', 'blur1' )
//                .attr('result','specOut')
//                .attr('specularExponent',50)
//                .attr('lighting-color','red')
//                    .append('fePointLight')
//                        .attr( 'x', width / 2 )
//                        .attr( 'y', height / 2 )
//                        .attr( 'z', 200 )
//        inCircleShadow.append( 'feComposite' )
//            .attr( 'in', 'SourceGraphic' )
//            .attr( 'in2', 'blur' )
//            .attr('operator','arithmetic')
//            .attr('k1',0)
//            .attr('k2',1)
//            .attr('k3',1)
//            .attr('k4',0)
//               ;
//
//        var feMerge = inCircleShadow.append( 'feMerge' )
//            .append( 'feMergeNode' )
//            .attr( 'in", "offsetBlur' );

    }


    function drawDonut(dataset,svg){

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                return innerRadius + d.data.size;
            });

        var pie = d3.layout.pie()
            .value(function(d) { return d.value; })
            .sort(null);

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
                .attr('transform', 'translate(' + (width / 2) +
                    ',' + (height / 2) + '),rotate(-10)')
                .attr("fill","#fff")
            .transition()
                .attr("fill", function(d,i) { return color[i]; })
                .delay(function(d, i) { return i * 175; }).duration(400)
                    .attrTween('d', function(d) {
                     var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                        return function(t) {
                          d.endAngle = i(t);
                          return arc(d);
                    }
                    });

        svg.select('.donut')
            .transition();




    }
}
initData('chart',dataset);