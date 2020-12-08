class LineChart {
    
    constructor(data, width, height, svg, attr, mousemove) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.svg = svg;
        this.attr = attr;
        this.x = d3.time.scale().range([0, width]);
        this.y = d3.scale.linear().range([height, 0]);
        this.mousemove = mousemove;
    }

    drawLineChart() {
        var translateX, translateY;
        var xAxis = d3.svg.axis().scale(this.x)
            .orient("bottom").ticks(5);
    
        var yAxis = d3.svg.axis().scale(this.y)
            .orient("right").ticks(5);
    
        var valueline = d3.svg.line()
            .x(d => { 
                translateX = this.x(d.date);
                return translateX;
             })
            .y(d => {
                switch (this.attr) {
                    case attribute.TOTAL_CASES:
                        translateY = this.y(d.totalTestResults);
                        return translateY;
                    case attribute.POSITIVE:
                        translateY = this.y(d.positive);
                        return translateY;
                    case attribute.NEGATIVE:
                        translateY = this.y(d.negative);
                        return translateY;
                    case attribute.RECOVERED:
                        translateY = this.y(d.recovered);
                        return translateY;
                }
            });
    
        // Scale the range of the data
        this.x.domain(d3.extent(this.data, function(d) { return d.date; }));
        this.y.domain([0, d3.max(this.data, function(d) {
            switch (this.attr) {
                case attribute.TOTAL_CASES:
                    return d.totalTestResults+(0.1*d.totalTestResults);
                case attribute.POSITIVE:
                    return d.positive+(0.1*d.positive);
                case attribute.NEGATIVE:
                    return d.negative;
                case attribute.RECOVERED:
                    return d.positive+(0.1*d.positive);
            }
        })]);
    
        // Add the valueline path.
        var path = this.svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(this.data));
        switch (this.attr) {
            case attribute.TOTAL_CASES:
                path.attr("class", "total-tests");
                break;
            case attribute.POSITIVE:
                path.attr("class", "confirmed");
                break;
            case attribute.NEGATIVE:
                path.attr("class", "recovered");
                break;
            case attribute.RECOVERED:
                path.attr("class", "recovered");
                break;
        }
        
        // Add the X Axis
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);
    
        // Add the Y Axis
        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.width + " ,0)")	
            .call(yAxis);
    
        var focus = this.svg.append("g")
            .attr("class", "focus")
            .style("display", "none");
    
        focus.append("circle")
            .attr("r", 5);
    
    
        this.svg.append("rect")
            .attr("class", "overlay")
            .attr("width", this.width)
            .attr("height", this.height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", this.mousemove(focus, translateX, translateY, this.x));
    }

    mousemove(focus, translateX, translateY) {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(this.data, x0, 1),
            d0 = chartData[i - 1],
            d1 = chartData[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            
        focus.attr("transform", "translate(" + translateX + "," + translateY + ")");
        console.log(d)
        // focus.select(".tooltip-date").text(dateFormatter(d.date));
        // focus.select(".tooltip-likes").text(formatValue(d.likes));
    }
}