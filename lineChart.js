var stateData = null;
var dropdown = null;
var defaultOption = null;
let attribute = {
    TOTAL_CASES: "totalCases",
    POSITIVE: "positive",
    NEGATIVE: "negative",
    RECOVERED: "recovered",
    POSITIVE_INC: "positiveIncrease",
    DEATHS: "death",
    DEATH_DAILY: "deathConfirmed"
};

// Set the dimensions of the canvas / graph
var	margin = {top: 30, right: 70, bottom: 30, left: 0},
	width = 550 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;
 
// Parse the date / time
var	parseDate = d3.time.format("%Y%m%d").parse;
 
// Adds the svg canvas
var	divTotalCases = d3.select("#totalCases");

var divPositive = d3.select("#positive");

var divRecovered = d3.select("#recovered");

window.addEventListener('load', function() {
    console.log('All assets are loaded')
    dropdown = document.getElementById('state-dropdown');
    dropdown.length = 0;

    dropdown.selectedIndex = 0;

    d3.json("assets/knowledge/state-titlecase.json", function(error, data) {
        let option;
        for (let i = 0; i < data.length; i++) {
          option = document.createElement('option');
          option.text = data[i]["name"];
          option.value = data[i]["abbreviation"];
          dropdown.add(option);
        }
    });
})


d3.json("assets/knowledge/covid-data/states_data.json", function(error, data) {
    stateData = data;
    drawLineChartForState("IN");    
    
    drawGoingDownLineCharts();
    drawTopTenLineCharts();
});

/**
 * 
 * @param {String Abbrivation in Caps} state 
 */
function getCumulitiveDataForState(state) {
    if(stateData) {
        return stateData[state]["cumulitive_data"];
    } else {
        d3.json("assets/knowledge/covid-data/states_data.json", function(error, data) {
            stateData = data;
            return stateData;
        });
    }
}

/**
 * 
 * @param {String Abbrivation in Caps} state 
 * @param {String YYYY-mm-dd format} date 
 */
function getStateDataForDate(state, date) {
    console.log(state,date);
    return stateData[state]["date_data"][date];
}


function selectStateFromDropDown() {
    drawLineChartForState(dropdown.value);
}

/**
 * 
 * @param {String Abrrivation in Caps} state 
 */
function drawLineChartForState(state) {
	d3.csv("assets/knowledge/covid-data/states/"+state+".csv", function(error, data) {
        dropdown.value = state;
        //Code for line chart
        data.forEach(function(d) {
            console.log(parseDate(d.date));
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
    
        drawTotalCases(data);
        drawPostive(data);
        drawRecovered(data);
	});
}

var totalTestChart;
function drawTotalCases(data){
    var element = document.getElementById("tested-count");
    element.innerHTML = getCumulitiveDataForState(dropdown.value)["totalTestResults"];
    divTotalCases.select("svg").remove();

    var	svgTotalCases = divTotalCases
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // totalTestChart = new LineChart(data, width, height, svgTotalCases, attribute.TOTAL_CASES, mouseMoveOver);
    // totalTestChart.drawLineChart();
    drawLineChartV1(data, width, height, svgTotalCases, attribute.TOTAL_CASES);

}

function drawPostive(data){
    var element = document.getElementById("confirmed-count");
    element.innerHTML = getCumulitiveDataForState(dropdown.value)["positive"];

    divPositive.select("svg").remove();

    var svgPositive = divPositive
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // var positiveChart = new LineChart(data, width, height, svgPositive, attribute.POSITIVE);
    // positiveChart.drawLineChart();
    drawLineChartV1(data, width, height, svgPositive, attribute.POSITIVE);
}

function drawRecovered(data){
    var element = document.getElementById("recovered-count");
    element.innerHTML = getCumulitiveDataForState(dropdown.value)["recovered"];

    divRecovered.select("svg").remove();

    var svgRecovered = divRecovered
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

    
    drawLineChartV1(data, width, height, svgRecovered, attribute.RECOVERED);
}

function showDataForDate(date, data) {
    var confirmedCount = document.getElementById("confirmed-count");
    confirmedCount.innerHTML = data["positive"];
    var recoveredCount = document.getElementById("recovered-count");
    recoveredCount.innerHTML = data["recovered"];
    var testedCount = document.getElementById("tested-count");
    testedCount.innerHTML = data["totalTestResults"];

    var dateElements = document.getElementsByClassName("chart-date");
    console.log(dateElements)
    for(let element of dateElements) {
        element.innerHTML = date;
    }
}

let USstates = [ "AK",
                      "AL",
                      "AR",
                      "AS",
                      "AZ",
                      "CA",
                      "CO",
                      "CT",
                      "DC",
                      "DE",
                      "FL",
                      "GA",
                      "GU",
                      "HI",
                      "IA",
                      "ID",
                      "IL",
                      "IN",
                      "KS",
                      "KY",
                      "LA",
                      "MA",
                      "MD",
                      "ME",
                      "MI",
                      "MN",
                      "MO",
                      "MS",
                      "MT",
                      "NC",
                      "ND",
                      "NE",
                      "NH",
                      "NJ",
                      "NM",
                      "NV",
                      "NY",
                      "OH",
                      "OK",
                      "OR",
                      "PA",
                      "PR",
                      "RI",
                      "SC",
                      "SD",
                      "TN",
                      "TX",
                      "UT",
                      "VA",
                      "VI",
                      "VT",
                      "WA",
                      "WI",
                      "WV",
                      "WY"]

function drawTopTenLineCharts() {
    var divPositive = d3.select("#question-3");
    var divTests = d3.select("#question-2");
    var divRecovered = d3.select("#question-4");
    var divDeaths = d3.select("#question-5");

    let topTenPositiveStates = ["CA", "TX", "FL", "NY", "GA", "IL", "AZ", "NC", "NJ", "TN"];
    let topTenTestsStates = ["CA", "NY", "TX", "IL", "FL", "MA", "MI", "NJ", "OH", "NC"];
    let topTenRecoveredStates = ["TX", "NC", "TN", "LA", "OH", "PA", "MA", "MI", "MN", "NY"];
    let topTenDeathStates = ["NY", "NJ", "CA", "TX", "FL", "MA", "IL", "PA", "MI", "GA"];
    
    d3.csv("assets/knowledge/covid-data/states/CA.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        topTenPositiveStates.forEach(state => {
            drawLineChartsInRow(state, divPositive, data, attribute.POSITIVE);
        });
        topTenTestsStates.forEach(state => {
            drawLineChartsInRow(state, divTests, data, attribute.TOTAL_CASES);
        });
    });
    d3.csv("assets/knowledge/covid-data/states/TX.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        topTenRecoveredStates.forEach(state => {
            drawLineChartsInRow(state, divRecovered, data, attribute.RECOVERED);
        });
    });
    d3.csv("assets/knowledge/covid-data/states/NY.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        topTenDeathStates.forEach(state => {
            drawLineChartsInRow(state, divDeaths, data, attribute.DEATHS);
        });
    });
}

function drawGoingDownLineCharts() {
    var goingDownDiv = d3.select("#question-1");
    var goingUpDiv = d3.select("#question-6");
    // let rowOneStates = ["CA","TX", "FL", "NY", "NJ", "IL", "GA", "AZ", "PA", "NC", "LA", "MI", "TN", "VA", "OH", "AL", "SC"];
    let goingDownStates = ["TX","FL","CA","GA","AZ"];
    let goingUpStates = ["WI", "UT", "CO", "ND", "SD"];
    d3.csv("assets/knowledge/covid-data/states/TX.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        data = data.slice(0,60)
        goingDownStates.forEach(state => {
            drawLineChartsInRow(state, goingDownDiv, data, attribute.POSITIVE_INC, 60);
        });
        
    });
    d3.csv("assets/knowledge/covid-data/states/WI.csv", function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        data = data.slice(0,60)
        goingUpStates.forEach(state => {
            drawLineChartsInRow(state, goingUpDiv, data, attribute.POSITIVE_INC, 60);
        });
    });
}

function drawLineChartsInRow(state, container, mainData, attribute, slice) {
    // Set the dimensions of the canvas / graph
    var	margin = {top: 20, right: 33, bottom: 20, left: 0},
    width = 200 - margin.left - margin.right,
    height = 110 - margin.top - margin.bottom;
    var svg = container
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");   
    d3.csv("assets/knowledge/covid-data/states/"+state+".csv", function(error, data) {
        //Code for line chart
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.positive = +d.positive;
            d.negative = +d.negative;
            d.totalTestResults = +d.totalTestResults;
        });
        if(slice) {
            data = data.slice(0,60)
        }
        drawLineChartV2(data, width, height, svg, attribute, state, mainData);
    });
}