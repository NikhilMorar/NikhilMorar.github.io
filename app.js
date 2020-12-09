var STATE_HASHMAP = new Map();
drawCountiesByCases();
drawCountiesByDeaths();
drawStatesByCases();
drawStatesByRecovered();
drawStatesByTests();
drawStatesByDeaths();

document.onload = function () {
}
setTimeout(() => {
    console.log(getCumulitiveDataForState("IN"));

    //TODO call drawLineChartForState here
}, 2000);
