var STATE_HASHMAP = new Map();
drawStatesByCases();
drawStatesByRecovered();
drawStatesByTests();
drawStatesByDeaths();
drawCountiesByCases();
drawCountiesByDeaths();
document.onload = function () {
}
setTimeout(() => {
    console.log(getCumulitiveDataForState("IN"));

    //TODO call drawLineChartForState here
}, 2000);
