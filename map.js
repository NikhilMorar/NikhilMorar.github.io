var w = 900;
var h = 600;

var projection = d3.geo.albersUsa()
    .translate([w / 2, h / 2])
    .scale([1000]);

var path = d3.geo.path()
    .projection(projection);

var globalFilterSelect = "casesCheckBox";
var casesCheckBox = document.getElementById("casesCheckBox");
casesCheckBox.checked = true;
var recoveredCheckBox = document.getElementById("recoveredCheckBox");
var testedCheckBox = document.getElementById("testedCheckBox");
var countyColor = d3.scale.threshold().domain([100, 1000, 10000, 50000, 200000]).range(["rgb(235, 245, 240)", "rgb(220, 175, 175)", "rgb(220, 125, 125)", "rgb(220, 75, 75)", "rgb(255, 0, 0)"])

var Gdiv = d3.select("body").append("div")
    .attr("class", "gtooltip")

var states;
var counties;
var stateZoom = document.getElementById("stateZoom");
var stateZoom2 = document.getElementById("stateZoom2");
var stateZoom3 = document.getElementById("stateZoom3");
var countyZoom = document.getElementById("countyZoom");
var stateDeaths = {};
var stateTests = {};
var stateCases = {};
var stateRecovered = {};
var stateCodes = {};
var countyCases = {};
var countyDeaths = {};

var Mdiv = d3.select("body").append("div")
    .attr("class", "mtooltip")
    .style("opacity", 0);
var Pdiv = d3.select("#tooltip")

d3.select("#countyMap").style("visibility", 'hidden')
d3.select("#stateButton").transition()
    .attr("class", "activeMap")
d3.select("#CmapLegend").style("visibility", 'hidden')
countyZoom.style.visibility = "hidden";
stateZoom2.style.visibility = "hidden";
stateZoom3.style.visibility = "hidden";
d3.select("#stateMap3").style("visibility", 'hidden')
d3.select("#SmapLegend3").style("visibility", 'hidden')
d3.select("#stateMap2").style("visibility", 'hidden')
d3.select("#SmapLegend2").style("visibility", 'hidden')
d3.select("#sortRadio").style("visibility", 'visible')

function drawStatesByCases() {
    var stateColor = d3.scale.threshold().domain([25000, 75000, 150000, 400000, 805000]).range(["rgb(220, 225, 225)", "rgb(220, 175, 175)", "rgb(220, 125, 125)", "rgb(220, 75, 75)", "rgb(255, 0, 0)"]);
    var title = "Confirmed Cases by State";
    var labels = ["<25,000", "25,000-75,000", "75,000-150,000", "150,000-400,000", "400,000-805,000"];
    console.log("draw states");
    var svg = d3.select("#SmapLegend");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(150,20)")
        .style("font-size", "12px");
    var stateLegend = d3.legend.color()
        .scale(stateColor)
        .shapeWidth(125)
        .orient('horizontal')
        .title(title)
        .labels(labels)
        .on("cellclick", function (d) {
            console.log(d);
        });


    svg.select(".legendQuant")
        .call(stateLegend);
    console.log("states being drawn");

    var svg = d3.select("#stateMap")
        .attr("width", w)
        .attr("height", h)
    d3.json("assets/knowledge/map/gz_2010_us_040_00_20m.json", function (statesData) {
        d3.csv("assets/knowledge/covid-data/us_states_covid19_daily.csv", function (statesCovid) {
            for (i = 0; i < statesData.features.length; i++) {
                stateCodes[statesData.features[i].properties.STATE] = statesData.features[i].properties.NAME;
            }
            for (i = 0; i < 56; i++) {
                stateDeaths[statesCovid[i].full] = Number(statesCovid[i].death).toLocaleString();
                stateTests[statesCovid[i].full] = Number(statesCovid[i].total).toLocaleString();
                stateCases[statesCovid[i].full] = Number(statesCovid[i].positive).toLocaleString();
                //console.log(statesCovid[i].death);
            }
            //console.log(stateDeaths);
            //console.log(stateTests);
            //console.log(statesCovid);
            //console.log(stateCodes);
            states = statesData;
            //console.log(i); 
            svg.selectAll("path")
                .data(statesData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (state) {
                    //console.log("made it");
                    try {
                        //console.log(parseFloat(stateTests[state.properties.NAME].replace(/,/g, '')))
                        return stateColor(parseFloat(stateCases[state.properties.NAME].replace(/,/g, '')));
                    }
                    catch (error) {
                        console.error();
                        return 0;
                    }
                })
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .on("mouseover", function (state) {
                    //console.log(state.properties.NAME);
                    //console.log(state.properties);
                    drawLineChartForState(getAbbrForName(state.properties.NAME));
                    //no transition
                    Gdiv.style("opacity", .9);
                    Gdiv.html(state.properties.NAME + "<br/>" + stateTests[state.properties.NAME] + " test(s) <br/>" + stateCases[state.properties.NAME] + " case(s)" + "<br/>" + stateDeaths[state.properties.NAME] + " death(s)")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 100) + "px");
                    d3.select(this)
                        .style("fill-opacity", '.75')
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr><tr><td>" + state.properties.NAME + "</td><td>" + stateTests[state.properties.NAME] + "</td><td>" + stateCases[state.properties.NAME] + "</td><td>" + stateDeaths[state.properties.NAME] + "</td></tr></table>")
                })
                .on("mouseout", function (state) {
                    Gdiv = d3.selectAll(".gtooltip")
                    //no transition
                    Gdiv.style("opacity", 0);
                    d3.select(this)
                        .style("fill-opacity", '1')
                    //optional to make table empty
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
                })
            console.log(statesData.features.length);
        });
    });
}
function drawStatesByRecovered() {
    var stateColor = d3.scale.threshold().domain([5000, 25000, 100000, 375000, 750000]).range(["rgb(225, 220, 225)", "rgb(175, 220, 175)", "rgb(125, 220, 125)", "rgb(75, 220, 75)", "rgb(0, 255, 0)"]);
    var title = "Recovered Patients by State";
    var labels = ["<5,000", "5,000-25,000", "25,000-100,000", "100,000-375,000", "375,000-750,000"];
    console.log("draw states");
    var svg = d3.select("#SmapLegend2");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(150,20)")
        .style("font-size", "12px");
    var stateLegend = d3.legend.color()
        .scale(stateColor)
        .shapeWidth(125)
        .orient('horizontal')
        .title(title)
        .labels(labels)
        .on("cellclick", function (d) {
            console.log(d);
        });


    svg.select(".legendQuant")
        .call(stateLegend);
    console.log("states being drawn");

    var svg = d3.select("#stateMap2")
        .attr("width", w)
        .attr("height", h)
    d3.json("assets/knowledge/map/gz_2010_us_040_00_20m.json", function (statesData) {
        d3.csv("assets/knowledge/covid-data/us_states_covid19_daily.csv", function (statesCovid) {
            for (i = 0; i < statesData.features.length; i++) {
                stateCodes[statesData.features[i].properties.STATE] = statesData.features[i].properties.NAME;
            }
            for (i = 0; i < 56; i++) {
                stateDeaths[statesCovid[i].full] = Number(statesCovid[i].death).toLocaleString();
                stateTests[statesCovid[i].full] = Number(statesCovid[i].total).toLocaleString();
                stateCases[statesCovid[i].full] = Number(statesCovid[i].positive).toLocaleString();
                stateRecovered[statesCovid[i].full] = Number(statesCovid[i].recovered).toLocaleString();
                //console.log(statesCovid[i].death);
            }
            //console.log(stateDeaths);
            //console.log(stateTests);
            //console.log(statesCovid);
            //console.log(stateCodes);
            states = statesData;
            //console.log(i); 
            svg.selectAll("path")
                .data(statesData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (state) {
                    //console.log("made it");
                    try {
                        //console.log(parseFloat(stateRecovered[state.properties.NAME].replace(/,/g, '')));
                        return stateColor(parseFloat(stateRecovered[state.properties.NAME].replace(/,/g, '')));
                    }
                    catch (error) {
                        console.error();
                        return 0;
                    }
                })
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .on("mouseover", function (state) {
                    //console.log(state.properties.NAME);
                    //console.log(state.properties);
                    drawLineChartForState(getAbbrForName(state.properties.NAME));
                    //no transition
                    Gdiv.style("opacity", .9);
                    Gdiv.html(state.properties.NAME + "<br/>" + stateTests[state.properties.NAME] + " test(s) <br/>" + stateCases[state.properties.NAME] + " case(s)" + "<br/>" + stateDeaths[state.properties.NAME] + " death(s)")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 100) + "px");
                    d3.select(this)
                        .style("fill-opacity", '.75')
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr><tr><td>" + state.properties.NAME + "</td><td>" + stateTests[state.properties.NAME] + "</td><td>" + stateCases[state.properties.NAME] + "</td><td>" + stateDeaths[state.properties.NAME] + "</td></tr></table>")
                })
                .on("mouseout", function (state) {
                    Gdiv = d3.selectAll(".gtooltip")
                    //no transition
                    Gdiv.style("opacity", 0);
                    d3.select(this)
                        .style("fill-opacity", '1')
                    //optional to make table empty
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
                })
            console.log(statesData.features.length);
        });
    });
}
function drawStatesByTests() {
    var stateColor = d3.scale.threshold().domain([100000, 250000, 1000000, 5000000, 15000000]).range(["rgb(225, 225, 220)", "rgb(175, 175, 220)", "rgb(125, 125, 220)", "rgb(75,75, 220)", "rgb(0, 0, 255)"]);
    var title = "Tests Conducted by State";
    var labels = ["<100,000", "100,000-250,000", "250,000-1,000,000", "1,000,000-5,000,000", "5,000,000-15,000,000"];
    console.log("draw states");
    var svg = d3.select("#SmapLegend3");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(150,20)")
        .style("font-size", "12px");
    var stateLegend = d3.legend.color()
        .scale(stateColor)
        .shapeWidth(125)
        .orient('horizontal')
        .title(title)
        .labels(labels)
        .on("cellclick", function (d) {
            console.log(d);
        });


    svg.select(".legendQuant")
        .call(stateLegend);
    console.log("states being drawn");

    var svg = d3.select("#stateMap3")
        .attr("width", w)
        .attr("height", h)
    d3.json("assets/knowledge/map/gz_2010_us_040_00_20m.json", function (statesData) {
        d3.csv("assets/knowledge/covid-data/us_states_covid19_daily.csv", function (statesCovid) {
            for (i = 0; i < statesData.features.length; i++) {
                stateCodes[statesData.features[i].properties.STATE] = statesData.features[i].properties.NAME;
            }
            for (i = 0; i < 56; i++) {
                stateDeaths[statesCovid[i].full] = Number(statesCovid[i].death).toLocaleString();
                stateTests[statesCovid[i].full] = Number(statesCovid[i].total).toLocaleString();
                stateCases[statesCovid[i].full] = Number(statesCovid[i].positive).toLocaleString();
                //console.log(statesCovid[i].death);
            }
            //console.log(stateDeaths);
            //console.log(stateTests);
            //console.log(statesCovid);
            //console.log(stateCodes);
            states = statesData;
            //console.log(i); 
            svg.selectAll("path")
                .data(statesData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function (state) {
                    //console.log("made it");
                    try {
                        //console.log(parseFloat(stateTests[state.properties.NAME].replace(/,/g, '')));
                        return stateColor(parseFloat(stateTests[state.properties.NAME].replace(/,/g, '')));
                    }
                    catch (error) {
                        console.error();
                        return 0;
                    }
                })
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .on("mouseover", function (state) {
                    //console.log(state.properties.NAME);
                    //console.log(state.properties);
                    drawLineChartForState(getAbbrForName(state.properties.NAME));
                    //no transition
                    Gdiv.style("opacity", .9);
                    Gdiv.html(state.properties.NAME + "<br/>" + stateTests[state.properties.NAME] + " test(s) <br/>" + stateCases[state.properties.NAME] + " case(s)" + "<br/>" + stateDeaths[state.properties.NAME] + " death(s)")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 100) + "px");
                    d3.select(this)
                        .style("fill-opacity", '.75')
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr><tr><td>" + state.properties.NAME + "</td><td>" + stateTests[state.properties.NAME] + "</td><td>" + stateCases[state.properties.NAME] + "</td><td>" + stateDeaths[state.properties.NAME] + "</td></tr></table>")
                })
                .on("mouseout", function (state) {
                    Gdiv = d3.selectAll(".gtooltip")
                    //no transition
                    Gdiv.style("opacity", 0);
                    d3.select(this)
                        .style("fill-opacity", '1')
                    //optional to make table empty
                    Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
                })
            console.log(statesData.features.length);
        });
    });
}
function drawCounties() {
    var svg = d3.select("#CmapLegend");
    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(150,20)")
        .style("font-size", "12px");
    var legend = d3.legend.color()
        .shapeWidth(125)
        .orient('horizontal')
        .scale(countyColor)
        .title("Confirmed Cases by County")
        .labels(["<100", "100-1,000", "1,000-10,000", "10,000-50,000", "50,000-200,000"])
        .on("cellclick", function (d) {
            //console.log(d);
        });
    svg.select(".legendQuant")
        .call(legend);

    var svg = d3.select("#countyMap")
        .attr("width", w)
        .attr("height", h)
    d3.json("assets/knowledge/map/gz_2010_us_040_00_20m.json", function (statesData) {
        d3.json("assets/knowledge/map/gz_2010_us_050_00_20m.json", function (countiesData) {
            d3.csv("assets/knowledge/covid-data/us_counties_covid19_daily.csv", function (countiesCovid) {
                for (i = 568098; i < 573338; i++) {
                    countyDeaths[countiesCovid[i].county + countiesCovid[i].full] = Number(countiesCovid[i].deaths).toLocaleString();
                    countyCases[countiesCovid[i].county + countiesCovid[i].full] = Number(countiesCovid[i].cases).toLocaleString();
                    //console.log(countiesCovid[i]);
                }
                counties = countiesData;
                //console.log(countiesCovid);
                //console.log(statesData);
                //console.log(countiesData);
                svg.selectAll("path")
                    .data(countiesData.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", function (county) {
                        try {
                            //console.log(parseFloat(countyCases[county.properties.NAME + stateCodes[county.properties.STATE]].replace(/,/g, '')));
                            return countyColor(parseFloat(countyCases[county.properties.NAME + stateCodes[county.properties.STATE]].replace(/,/g, '')));
                        }
                        catch (error) {
                            console.error();
                            return "rgb(235, 245, 240)";
                        }
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", ".25px")
                    .on("mouseover", function (county) {
                        //console.log(county.properties.NAME);
                        //console.log(county.properties);
                        //no transition
                        Gdiv.style("opacity", .9);
                        Gdiv.html(county.properties.NAME + "<br/>" + stateCodes[county.properties.STATE] + "<br/>" + countyCases[county.properties.NAME + stateCodes[county.properties.STATE]] + " case(s)" + "<br/>" + countyDeaths[county.properties.NAME + stateCodes[county.properties.STATE]] + " death(s)")
                            .style("left", (d3.event.pageX + 15) + "px")
                            .style("top", (d3.event.pageY - 100) + "px");
                        d3.select(this)
                            .style("fill-opacity", '.75')
                        Pdiv.html("<table><tr><th>County</th><th>State</th><th>Cases</th><th>Deaths</th></tr><tr><td>" + county.properties.NAME + "</td><td>" + stateCodes[county.properties.STATE] + "</td><td>" + countyCases[county.properties.NAME + stateCodes[county.properties.STATE]] + "</td><td>" + countyDeaths[county.properties.NAME + stateCodes[county.properties.STATE]] + "</td></tr></table>")
                    })
                    .on("mouseout", function (county) {
                        Gdiv = d3.selectAll(".gtooltip")
                        //no transition
                        Gdiv.style("opacity", 0);
                        d3.select(this)
                            .style("fill-opacity", '1')
                        //optional to make table empty
                        Pdiv.html("<table><tr><th>County</th><th>State</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
                    })


                console.log(countiesData.features.length);
            });
        });
    });
}
function show(value) {
    if (value == "states") {
        d3.select("#sortRadio").style("visibility", 'visible')
        d3.select("#stateButton").transition()
            .attr("class", "activeMap")
        d3.select("#countyButton").transition()
            .attr("class", "sort")

        d3.select("#CmapLegend").style("visibility", 'hidden')
        stateZoom.style.visibility = "visible";
        stateZoom2.style.visibility = "hidden";
        stateZoom3.style.visibility = "hidden";
        countyZoom.style.visibility = "hidden";
        d3.select("#countyMap").style("visibility", 'hidden')
        d3.select("#stateMap").style("visibility", 'visible')
        d3.select("#SmapLegend").style("visibility", 'visible')
        d3.select("#CmapLegend").style("visibility", 'hidden')
        changeLegend(globalFilterSelect);
        Pdiv.html("<table><tr><th>State</th><th>Tests</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
    }
    else if (value == "counties") {
        d3.select("#sortRadio").style("visibility", 'hidden')
        d3.select("#stateButton").transition()
            .attr("class", "sort")
        d3.select("#countyButton").transition()
            .attr("class", "activeMap")
        stateZoom.style.visibility = "hidden";
        stateZoom2.style.visibility = "hidden";
        stateZoom3.style.visibility = "hidden";
        countyZoom.style.visibility = "visible";
        d3.select("#stateMap").style("visibility", 'hidden')
        d3.select("#stateMap2").style("visibility", 'hidden')
        d3.select("#stateMap3").style("visibility", 'hidden')
        d3.select("#countyMap").style("visibility", 'visible')
        d3.select("#SmapLegend").style("visibility", 'hidden')
        d3.select("#SmapLegend2").style("visibility", 'hidden')
        d3.select("#SmapLegend3").style("visibility", 'hidden')
        d3.select("#CmapLegend").style("visibility", 'visible')
        Pdiv.html("<table><tr><th>County</th><th>State</th><th>Cases</th><th>Deaths</th></tr ><tr><td></td><td></td><td></td><td></td></tr></table>")
    }
}
function changeLegend(selection) {
    casesCheckBox.checked = false;
    recoveredCheckBox.checked = false;
    testedCheckBox.checked = false;
    theChecked = document.getElementById(selection);
    theChecked.checked = true;
    //console.log(selection);
    globalFilterSelect = selection;
    if (selection == "casesCheckBox") {
        d3.select("#stateMap").style("visibility", 'visible')
        d3.select("#SmapLegend").style("visibility", 'visible')
        d3.select("#stateMap3").style("visibility", 'hidden')
        d3.select("#SmapLegend3").style("visibility", 'hidden')
        d3.select("#stateMap2").style("visibility", 'hidden')
        d3.select("#SmapLegend2").style("visibility", 'hidden')
        stateZoom.style.visibility = "visible";
        stateZoom2.style.visibility = "hidden";
        stateZoom3.style.visibility = "hidden";
    }
    else if (selection == "recoveredCheckBox") {
        d3.select("#stateMap2").style("visibility", 'visible')
        d3.select("#SmapLegend2").style("visibility", 'visible')
        d3.select("#stateMap3").style("visibility", 'hidden')
        d3.select("#SmapLegend3").style("visibility", 'hidden')
        d3.select("#stateMap").style("visibility", 'hidden')
        d3.select("#SmapLegend").style("visibility", 'hidden')
        stateZoom.style.visibility = "hidden";
        stateZoom2.style.visibility = "visible";
        stateZoom3.style.visibility = "hidden";
    }
    else if (selection == "testedCheckBox") {
        d3.select("#stateMap3").style("visibility", 'visible')
        d3.select("#SmapLegend3").style("visibility", 'visible')
        d3.select("#stateMap").style("visibility", 'hidden')
        d3.select("#SmapLegend").style("visibility", 'hidden')
        d3.select("#stateMap2").style("visibility", 'hidden')
        d3.select("#SmapLegend2").style("visibility", 'hidden')
        stateZoom.style.visibility = "hidden";
        stateZoom2.style.visibility = "hidden";
        stateZoom3.style.visibility = "visible";
    }
}
