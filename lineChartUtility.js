var chartData;
var x,y;
var totalX, totalY;
var positiveFocus, totalFocus, recoverdFocus, deathFocus;

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

function drawLineChartV1(data, width, height, svg, attr) {
    chartData = data;
    x = d3.time.scale().range([0, width]);
    y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("right").ticks(5);

    var valueline = d3.svg.line()
        .x(function(d) { 
            return x(d.date);
         })
        .y(function(d) {
            switch (attr) {
                case attribute.TOTAL_CASES:
                    return y(d.totalTestResults);
                case attribute.POSITIVE:
                    return y(d.positive);
                case attribute.NEGATIVE:
                    return y(d.negative);
                case attribute.RECOVERED:
                    return y(d.recovered);
                case attribute.DEATHS:
                    return y(d.death);
            }
        });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) {
        switch (attr) {
            case attribute.TOTAL_CASES:
                return d.totalTestResults+(0.1*d.totalTestResults);
            case attribute.POSITIVE:
                return d.positive+(0.1*d.positive);
            case attribute.NEGATIVE:
                return d.negative;
            case attribute.RECOVERED:
                return d.positive+(0.1*d.positive);
            case attribute.DEATHS:
                return d.positive+(0.1*d.positive);
        }
    })]);

    // Add the valueline path.
    var path = svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
    switch (attr) {
        case attribute.TOTAL_CASES:
            path.attr("class", "total-tests");
            totalFocus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            totalFocus.append("circle")
                .attr("r", 5);
            break;
        case attribute.POSITIVE:
            path.attr("class", "confirmed");
            positiveFocus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            positiveFocus.append("circle")
                .attr("r", 5);
            break;
        case attribute.NEGATIVE:
            path.attr("class", "recovered");
            break;
        case attribute.RECOVERED:
            recoverdFocus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            recoverdFocus.append("circle")
                .attr("r", 5);

            path.attr("class", "recovered");
            break;
        case attribute.DEATHS:
            deathFocus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            deathFocus.append("circle")
                .attr("r", 5);

            path.attr("class", "deaths");
            break;
    }

    if(attr === attribute.TOTAL_CASES) {
        totalX = x;
        totalY = y;
    }
    
    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + " ,0)")	
        .call(yAxis);


    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { 
            positiveFocus.style("display", null);
            totalFocus.style("display", null);
            recoverdFocus.style("display", null);
            deathFocus.style("display", null);
         })
        .on("mouseout", function() { 
            mouseOut();
            positiveFocus.style("display", "none");
            totalFocus.style("display", "none");
            recoverdFocus.style("display", "none");
            deathFocus.style("display", "none");
         })
        .on("mousemove", mousemove);
        mouseOut();
}

function mousemove() {
    console.log(x(d3.mouse(this)[0]));
    var x0 = x.invert(d3.mouse(this)[0]);
    console.log(x0.toDateString());
    data = getStateDataForDate(dropdown.value, x0.yyyymmdd());
    recoverdFocus.attr("transform", "translate(" + x(x0) + "," + y(data["recovered"]) + ")");
    positiveFocus.attr("transform", "translate(" + x(x0) + "," + y(data["positive"]) + ")");
    totalFocus.attr("transform", "translate(" + totalX(x0) + "," + totalY(data["totalTestResults"]) + ")");
    deathFocus.attr("transform", "translate(" + x(x0) + "," + y(data["death"]) + ")");
    // console.log(d)
    console.log(x0.toDateString())
    showDataForDate(x0.toDateString(), data);
}

function mouseOut() {
    var latestDate = chartData[0].date;
    data = getStateDataForDate(dropdown.value, latestDate.yyyymmdd());
    showDataForDate(latestDate.toDateString(), data);
}

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
  };

function drawLineChartV2(data, width, height, svg, attr, abbr, mainData) {
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "small-graph-text")
        .text(getNameForAbbr(abbr));

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);

    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(0);

    var yAxis = d3.svg.axis().scale(y)
        .orient("right").ticks(0);

    var valueline = d3.svg.line()
        .x(function(d) { 
            return x(d.date);
         })
        .y(function(d) {

            switch (attr) {
                case attribute.TOTAL_CASES:
                    return y(d.totalTestResults);
                case attribute.POSITIVE:
                    return y(d.positive);
                case attribute.NEGATIVE:
                    return y(d.negative);
                case attribute.RECOVERED:
                    return y(d.recovered);
                case attribute.POSITIVE_INC:
                    return y(d.positiveIncrease);
                case attribute.DEATHS:
                    return y(d.death);
                case attribute.DEATH_INCREASE:
                    return y(d.deathProbable);
            }
        });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(mainData, function(d) {
        // return 5000;

        switch (attr) {
            case attribute.TOTAL_CASES:
                return d.totalTestResults+(0.1*d.totalTestResults);
            case attribute.POSITIVE:
                return d.positive+(0.1*d.positive);
            case attribute.NEGATIVE:
                return d.negative;
            case attribute.RECOVERED:
                return d.positive+(0.1*d.positive);
            case attribute.POSITIVE_INC:
                return parseInt(d.positiveIncrease)+0.1*parseInt(d.positiveIncrease);
            case attribute.DEATHS:
                return parseInt(d.death)+0.1*parseInt(d.death);
            case attribute.DEATH_INCREASE:
                return parseInt(d.deathIncrease)+0.1*parseInt(d.deathIncrease);
        }
    })]);

    // Add the valueline path.
    var path = svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
    switch (attr) {
        case attribute.TOTAL_CASES:
            path.attr("class", "total-tests-light");
            break;
        case attribute.POSITIVE:
            path.attr("class", "confirmed-light");
            break;
        case attribute.NEGATIVE:
            path.attr("class", "recovered-light");
            break;
        case attribute.RECOVERED:
            path.attr("class", "recovered-light");
            break;
        case attribute.POSITIVE_INC:
            path.attr("class", "confirmed-light");
            break;
    }

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + " ,0)")	
        .call(yAxis);
}