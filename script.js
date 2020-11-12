// Size of each graph and map.
const SIZE = 500,
      ORIGINAL_SIZE = 500,
      padding = 38;

// Variables holding map info.
let map = null,
    streets   = [],
    mapLabels = [],
    pumps     = [];
const mapWidth  = SIZE,
      mapHeight = SIZE,
      mapX = d3.scale.linear(),
      mapY = d3.scale.linear();

// Variables holding charts info.
const graph = d3.select('svg#graph'),
      graphWidth   = SIZE,
      graphHeight  = SIZE - 100,
      // Total Line chart variables.
      totalGraphX  = d3.scale.linear().range([padding, graphWidth - padding]),
      totalGraphY  = d3.scale.linear().range([graphHeight - 202 - padding, padding + 10]),
      totalXAxis   = d3.svg.axis().scale(totalGraphX).orient('bottom'),
      totalYAxis   = d3.svg.axis().scale(totalGraphY).orient('left'),
      // Gender Bar chart variables.
      genderGraphX = d3.scale.linear().range([padding, graphWidth - padding]),
      genderGraphY = d3.scale.linear().range([graphHeight - 202 - padding, padding + 10]),
      genderXAxis  = d3.svg.axis().scale(genderGraphX).orient('bottom'),
      genderYAxis  = d3.svg.axis().scale(genderGraphY).orient('left'),
      barWidth     = 3.5
      // Age pie chart variables.
      radius = 70,
      pie = d3.layout.pie().value(d => d.value),
      arcGenerator = d3.svg.arc().innerRadius(0).outerRadius(radius),
      // Line Charts Date filter variables.
      frDateElem = document.getElementById('from-date'),
      toDateElem = document.getElementById('to-date');
let   fromDate = {},
      toDate   = {};


// General data variables.
const ageRanges = [
    {
        label: '0-10',
        opacity: 1,
        color: '#003049'
    },
    {
        label: '11-20',
        opacity: 1,
        color: '#D62828'
    },
    {
        label: '21-40',
        opacity: 1,
        color: '#F77F00'
    },
    {
        label: '41-60',
        opacity: 1,
        color: '#FCBF49'
    },
    {
        label: '61-80',
        opacity: 1,
        color: '#D8D78F'
    },
    {
        label: '> 80',
        opacity: 1,
        color: '#002F00'
    }
];
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
let deathDays = [],
    deaths    = [],
    maxDeaths = 0;







// Forms date string for date inputs.
function dateStr(date) {
    const month = months[date.m];
    return `${date.d}-${month}`;
}

// Function adds days to existing date object.
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

// Gets all dates from a starting to an ending date
function getDates(startDate, stopDate) {
   var dateArray = new Array();
   var currentDate = startDate;
   while (currentDate <= stopDate) {
     dateArray.push(currentDate)
     currentDate = currentDate.addDays(1);
   }
   return dateArray;
 }

// Fills date inputs with appropriate values.
function fillFilterDates() {
          
    var dateArray = getDates(new Date('08-19-1846'), new Date('09-29-1846'));

    for (i = 0; i < dateArray.length; i ++ ) {
        const d = dateArray[i].getDate();
        const m = dateArray[i].getMonth();
        const obj = JSON.stringify({ d, m, i });
        frDateElem.innerHTML += `<option value='${obj}'>${d}-${months[dateArray[i].getMonth()]}</option>`;
        toDateElem.innerHTML += `<option value='${obj}'>${d}-${months[dateArray[i].getMonth()]}</option>`;
    }

    d3.select('#from-date').on('change', function() {
        if (!frDateElem.value) return;
        fromDate = JSON.parse(frDateElem.value);
        if (fromDate.i > toDate.i || fromDate.i === toDate.i-1) {
            frDateElem.value = '0';
            return alert('From Date must have more than 1 day margin from To Date!');
        }
        const fromInd = deathDays.map(e => e.deathdate).indexOf(dateStr(fromDate));
        if (fromInd === -1) return;
        let  days = [];
        if (!toDate.i) {
            days = deathDays.slice(fromInd);
        } else {
            const toInd = deathDays.map(e => e.deathdate).indexOf(dateStr(toDate));
            if (toInd === -1) {
                days = deathDays.slice(fromInd);
            }
            days = deathDays.slice(fromInd, toInd);
        }
        drawTotal(days, false);
        drawGender(200, 150, days, false);
    });
    d3.select('#to-date').on('change', function(event) {
        if (!toDateElem.value) return;
        toDate = JSON.parse(toDateElem.value);
        if (toDate.i < fromDate.i || fromDate.i === toDate.i-1) {
            toDateElem.value = 0;
            return alert('From Date must have more than 1 day margin from To Date!');
        }
        const toInd = deathDays.map(e => e.deathdate).indexOf(dateStr(toDate));
        if (toInd === -1) return;
        let  days = [];
        if (!fromDate.i) {
            days = deathDays.slice(0, toInd);
        } else {
            const fromInd = deathDays.map(e => e.deathdate).indexOf(dateStr(fromDate));
            if (fromInd === -1) {
                days = deathDays.slice(0, toInd);
            }
            days = deathDays.slice(fromInd, toInd);
        }
        drawTotal(days, false);
        drawGender(200, 150, days, false);
    });

}





// Hides deaths from map and hides lines from chart.
function resetElements() {
    map.selectAll('.death')
        .attr('fill', 'none')
        .attr('fill-opacity', 1);

    graph.selectAll('.graphline')
        .attr('stroke', 'none')
        .attr('stroke-opacity', 1);

    graph.selectAll('.graphbar')
        .attr('fill', 'none')
        .attr('fill-opacity', 1);

    for (let i = 0; i < ageRanges.length; i++) {
        ageRanges[i].opacity = 1;
    }
}

// Draw chart axis for total and gender chart.
function drawGraphAxes(graphHeight, difference, yLabel, yLabelHeight, xAxisClass, yAxisClass) {
    graph.append('g')
        .attr('class', 'axis ' + xAxisClass)
        .attr('transform', `translate(0,${(graphHeight + difference) - padding})`)
        // .call(xAxis);

    graph.append('g')
        .attr('class', 'axis ' + yAxisClass)
        .attr('transform', `translate(${padding},${difference})`)
        // .call(yAxis);

    drawGraphTitle(yLabel, yLabelHeight);

}

// Draw graph title on top of each graph.
function drawGraphTitle(yLabel, yLabelHeight) {
    graph.append('text')
        .attr('y', yLabelHeight)
        .attr('x', graphWidth - 100)
        .attr('dy', '1.2em')
        .attr('fill', 'gray')
        .style('font', '12px times')
        .style('text-anchor', 'middle')
        .style('font-family', 'Alice')
        .text(yLabel);
}

// Create hover bars for line charts.
function drawGraphHoverBar(graphHeight, difference, graphX, days=deathDays, cb, textFunc) {
    let hoverbarWidth = graphWidth / (days.length - 1);

    graph.selectAll('rect.deathhoverbar' + difference)
        .data(days)
        .enter()
        .append('rect')
        .attr('x', (d, i) => graphX(i) - hoverbarWidth / 2)
        .attr('y', difference + padding)
        .attr('width', hoverbarWidth)
        .attr('height', (graphHeight) - padding * 2)
        .attr('fill', 'black')
        .attr('fill-opacity', '0')
        .attr('stroke', 'none')
        .attr('stroke-width', '0')
        .attr('id', (d) => d.deathdate)
        .attr('class', 'deathhoverbar')
        .on('mouseover', (d) => {
            /** The hovering functionality of the line chart, 
                which shows only the selected death points. */
            cb(d);
            d3.selectAll('.death')
              .filter((d2) => d2.deathday > d.day)
              .attr('visibility', 'hidden');
        })
        .on('mouseout', (d) => {
            map.selectAll('.death').attr('visibility', 'visible');
        })
        .append('title')
        .text(d => textFunc(d));
}

// Draw total line chart.
function drawTotal(days, isFirstTime) {
    
    if (isFirstTime) drawGraphAxes(200, 0, 'Total Deaths', 50, 'totalXAxis', 'totalYAxis');
    
    totalXAxis.tickFormat((d) => days[d] ? days[d].deathdate : null);
    
    totalGraphX.domain([0, days.length - 1]);
    graph.selectAll('.totalXAxis').transition()
        .duration(1000)
        .call(totalXAxis);

    totalGraphY.domain([ 0, d3.max(days, (d) => d.total) ]);
    graph.selectAll('.totalYAxis').transition()
        .duration(1000)
        .call(totalYAxis);

    let graphTotalPathGenerator = d3.svg.line()
        .x((d, i) => totalGraphX(i))
        .y((d) => totalGraphY(d.total));

    // Remove the existing line
    graph.selectAll('.graphline').remove();

    // Draw the new line
    graph
        .append('path')
        .attr('class', 'graphline')
        .attr('d', graphTotalPathGenerator(days))
        .attr('id', 'graphlinetotal')
        .attr('stroke', '#f79036');
    
    // Prepare hover text
    const hoverText = (d) => d.deathdate + ': ' + d.total + (d.total == 1 ? ' death' : ' deaths');
    drawGraphHoverBar(200, 0, totalGraphX, days, onTotalHover, hoverText);
}

// What happens on hover of total line chart.
function onTotalHover(d) {
    map.selectAll('.death').attr('fill', '#f79036');
    if (!d || d.total === 0) {
        return;
    }
    // On each total Line chart hover,
    // a different pie chart is shown.
    drawAgePieChart(d);
}

// Draw gender line chart.
function drawGender(graphHeight, difference, days=deathDays, isFirstTime) {

    if (isFirstTime) drawGraphAxes(graphHeight, difference, 'Deaths by Gender', 200, 'genderXAxis', 'genderYAxis');
    
    genderXAxis.tickFormat((d) => days[d] ? days[d].deathdate : null);

    genderGraphX.domain([0, days.length - 1]);
    graph.selectAll('.genderXAxis').transition()
        .duration(1000)
        .call(genderXAxis);

    genderGraphY.domain([ 0, d3.max(days, (d) => d.total) ]);
    graph.selectAll('.genderYAxis').transition()
        .duration(1000)
        .call(genderYAxis);

    drawGenderChartLegend();

    // Remove the existing line
    graph.selectAll('.graphbar').remove();

    // Draw male bar chart
    graph.selectAll('bar')
        .data(days)
        .enter().append('rect')
        .attr('class', 'graphbar male graphbargendermale')
        .attr('fill', 'royalblue')
        .attr('x', (d, i) => genderGraphX(i))
        .attr('width', barWidth)
        .attr('y', (d) => difference + genderGraphY(d.male))
        .attr('height', (d) => graphHeight - genderGraphY(d.male) - 39)
        .attr('transform', (d) => `translate(-3, 0)`);

    // Draw female bar chart
    graph.selectAll('bar')
        .data(days)
        .enter().append('rect')
        .attr('class', 'graphbar female graphbargenderfemale')
        .attr('fill', '#c91897')
        .attr('x', (d, i) => genderGraphX(i) + barWidth)
        .attr('width', barWidth)
        .attr('y', (d) => difference + genderGraphY(d.female))
        .attr('height', (d) => graphHeight - genderGraphY(d.female) - 39)
        .attr('transform', (d) => `translate(-3, 0)`);

    // Prepare hover text
    const hoverText = (d) => d.deathdate + ': ' + 'Male: ' + d.male + ' | ' + 'Female: ' + d.female;
    drawGraphHoverBar(graphHeight, difference, genderGraphX, days, onGenderHover, hoverText);
}

// Display gender line chart.
function onGenderHover() {
    map.selectAll('.male').attr('fill', 'royalblue');
    map.selectAll('.female').attr('fill', '#c91897');
}

// Draw gender chart legend.
function drawGenderChartLegend() {
    let x = 380;
    let y = 250;
    graph.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).style('fill', 'royalblue').style('opacity', 0.7);
    graph.append('text').attr('x', x + 10).attr('y', y).text('Male').style('font-size', '8px').attr('fill', 'gray').attr('alignment-baseline', 'middle');
    graph.append('circle').attr('cx', x).attr('cy', y + 12).attr('r', 4).style('fill', '#c91897').style('opacity', 0.7);
    graph.append('text').attr('x', x + 10).attr('y', y + 12).text('Female').style('font-size', '8px').attr('fill', 'gray').attr('alignment-baseline', 'middle');
}

// Draw age pie chart legend.
function drawPieChartLegend() {
    let x = 380;
    let y = 410;
    for (const el of ageRanges) {
        graph.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).style('fill', el.color).style('opacity', 0.7);
        graph.append('text').attr('x', x + 10).attr('y', y).text(el.label).style('font-size', '8px').attr('fill', 'gray').attr('alignment-baseline', 'middle');
        y += 12;
    }
}


function drawPieChartHeaders() {
    drawPieChartLegend();
    drawGraphTitle('Deaths by Age Group', 360);
}

// Draw age pie chart for each day.
function drawAgePieChart(day) {

    const data = {};
    let i = 0;
    for (const el of ageRanges) {
        data[el.label] = day.age[i];
        i++;
    }

    const data_ready = pie(d3.entries(data));

    graph.selectAll('.pie-slice').remove();
    graph.selectAll('.pie-slice-text').remove();    

    const arcs = graph
        .selectAll('pie-slice')
        .data(data_ready);

    arcs 
        .transition()
        .duration(1500)
        .attrTween("d", arcTween);

    arcs
        .enter()
        .append('path')
        .attr('class', 'pie-slice pie-slice-' + day.deathdate)
        .attr('transform', (d) => `translate(180, 420)`)
        .attr('d', arcGenerator)
        .each(function(d) { this._current = d; })
        .attr('fill', (d) => ageRanges.filter((e) => e.label === d.data.key)[0].color)
        .attr('stroke', 'gray')
        .attr('fill-opacity', '1')
        .style('stroke-width', '1px')
        .style('stroke', 'transparent')
        .style('cursor', 'pointer')
        .style('opacity', 0.7)
        .append('title')
        .text((d) => 'Date: ' + day.deathdate + '\r\n' + 'Deaths: ' + d.value + '\r\n' + 'Age: ' + d.data.key);

    // Now add the annotation. Using the centroid method to get the best coordinates
    graph
        .selectAll('pie-slice-' + day.deathdate)
        .data(data_ready)
        .enter()
        .append('text')
        .attr('class', 'pie-slice-text pie-slice-text-' + day.deathdate)
        .text((d) => d.data.value)
        .attr('transform', (d) => {
            const a = arcGenerator.centroid(d);
            return `translate(${180 + a[0]},${420 + a[1]})`;
        })
        .style('display', 'block')
        .style('fill', 'white')
        .style('stroke-width', '0.5px')
        .style('text-anchor', 'middle')
        .style('font-size', 8);

}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
    return arc(i(t));
    };
}

// Load the death data and add it to the map and the graph.
function loadDeaths() {

    // Load the coordinates and demographics for each death. These are
    // assumed to be provided in the order in which the victim died, for
    // purposes of correlating to deathdays.csv.
    d3.csv('data/deaths_age_sex.csv', (data) => {
        for (let i = 0; i < data.length; i++) {
            deaths.push(
                {
                    x: data[i].x,
                    y: data[i].y,
                    age: +data[i].age,
                    gender: +data[i].gender == 1 ? 'female' : 'male'
                }
            );
        }

        // Load the number of deaths for each date, and update
        // each death record with the day and date on which it occurred.
        d3.csv('data/deathdays.csv', (data) => {
            let deathId = 0;
            for (let day = 0; day < data.length; day++) {

                let totalCount = +data[day].deaths;
                let maleCount = 0;
                let femaleCount = 0;
                let ageCount = [0, 0, 0, 0, 0, 0];

                // Find the highest number of deaths on any day,
                // to set the vertical scale.
                if (maxDeaths < totalCount) {
                    maxDeaths = totalCount;
                }

                for (let i = 0; i < totalCount; i++) {
                    // Update the individual death records with the day
                    // and date of death.
                    deaths[deathId].deathday = day;
                    deaths[deathId].deathdate = data[day].date;

                    // Count the deaths on each deathDay by demographic.
                    if (deaths[deathId].gender == 'male') {
                        maleCount++;
                    } else {
                        femaleCount++;
                    }
                    ageCount[deaths[deathId].age]++;

                    // Increment to the next individual death record.
                    deathId++;
                }

                deathDays.push({
                    day: day,
                    deathdate: data[day].date,
                    total: totalCount,
                    male: maleCount,
                    female: femaleCount,
                    age: ageCount
                });

            }

            drawDeathsMap();
            drawTotal(deathDays, true);
            onTotalHover();
            drawGender(200, 150, deathDays, true);
            drawPieChartHeaders();
        });

    });
}






// Draws map svg group that will contain markers.
function drawMapContainer() {
    map = d3.select('svg#map')
        .append('svg')
        .attr('id', 'map')
        .attr('width', mapWidth)
        .attr('height', mapHeight)
        .attr('shape-rendering', 'geometricPrecision')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(d3.behavior.zoom()
            .scaleExtent([0.4, 2.5])
            .on('zoom', () => {
                map.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`);
            })
        )
        .append('g');

    /** Append a opaque frame to the map so that zooming
        and panning works on all the map's surface. */
    map.append('rect')
        .attr('x', 10)
        .attr('y', 40)
        .attr('width', mapWidth)
        .attr('height', mapHeight - 50)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.1);
}

// Draw the location of each death on the map.
function drawDeathsMap() {
    map.selectAll('.death')
        .data(deaths)
        .enter()
        .append('circle')
        .attr('id', (d, i) => 'death' + i)
        .attr('class', (d) => 'death ' + d.gender + ' ' + 'age' + d.age + ' ' + 'deathday' + d.deathday)
        .attr('cx', (d) => mapX(d.x))
        .attr('cy', (d) => mapY(d.y))
        .attr('fill', 'none')
        .append('title')
        .text((d) => d.gender + '\r\n' + 'age ' + ageRanges[d.age].label + '\r\n' + 'died ' + d.deathdate);
}

// Load and draw the water pumps.
function drawPumps() {
    const pumpSize = 14;

    d3.csv('data/pumps.csv', (data) => {
        for (let i = 0; i < data.length; i++) {
            pumps.push(
                { x: data[i].x, y: data[i].y }
            );
        }

        map.selectAll('.pump')
            .data(pumps)
            .enter()
            .append('g')
            .append('svg:image')
            .attr('xlink:href', 'images/faucet.png')
            .attr('class', 'pump')
            .attr('width', pumpSize)
            .attr('height', pumpSize)
            .attr('x', (d) => mapX(d.x) - pumpSize / 2)
            .attr('y', (d) => mapY(d.y) - pumpSize / 2)

    });
}

// Load and draw the street and building labels.
function drawMapLabels() {
    d3.csv('data/maplabels.csv', (data) => {
        for (let i = 0; i < data.length; i++) {
            mapLabels.push({
                x: data[i].x * SIZE / ORIGINAL_SIZE,
                y: data[i].y * SIZE / ORIGINAL_SIZE,
                text: data[i].text,
                fontsize: data[i].fontsize,
                angle: data[i].angle
            });
        }

        map.selectAll('.mapLabel')
            .data(mapLabels)
            .enter()
            .append('text')
            .attr('class', 'mapLabel')
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('font-size', (d) => d.fontsize)
            .text((d) => d.text)
            .attr('transform', (d) => `rotate(${d.angle},${d.x},${d.y})`);

    });
}

// Draw street lines on the map.
function drawStreets(streets) {
    // Provide a means of drawing the map lines at scale.
    let lineFunction = d3.svg.line()
        .x((d) => mapX(d.x))
        .y((d) => mapY(d.y))
        .interpolate('linear');

    mapX.domain([3, 20]).range([0, mapWidth]);
    mapY.domain([3, 20]).range([mapHeight, 0]);

    for (let i = 0; i < streets.length; i++) {
        map.append('path')
            .attr('d', lineFunction(streets[i]))
            .attr('class', 'street');
    }
}

// Draws complete map with streets, pumps, deaths.
function drawCompleteMap() {
    
    // Start the process by loading and drawing the map.
    d3.json('data/streets.json', (data) => {
        streets = data;
        drawMapContainer();
        drawStreets(streets);
        drawMapLabels();
        drawPumps();
        loadDeaths();
    });
       
}






fillFilterDates();
drawCompleteMap();