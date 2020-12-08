var STATE_HASHMAP = new Map();
drawCounties();
drawStatesByCases();
drawStatesByRecovered();
drawStatesByTests();

document.onload = function () {
}
setTimeout(() => {
    console.log(getCumulitiveDataForState("IN"));

    //TODO call drawLineChartForState here
}, 2000);
