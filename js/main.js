width = 1200
height = 600

let svg = d3.select("#chart")
    .attr("class", "chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
    let selectedData = populationList.filter(t => t.Subzone.toUpperCase() == d.properties.Name)
    if (selectedData.length == 1 && selectedData[0].Population > 0) {
        return d.properties.Name + "<br>" + new Intl.NumberFormat().format(Math.round(selectedData[0].Population)) + " people"
    }
    return d.properties.Name + "<br>" + "(No population data)"
});

let populationList = {}
let direction = 1;
let playpause = 1;

let mapg = svg
    .append("g")
    .call(tip)

let drawmap =
    mapg.append("g")

let legendValues = [0, 0.25, 0.5, 0.75, 1].sort()

let legend = mapg.append("g")
    .attr("transform", "translate(" + (width - 10) + "," + (height - 195) + ")");

let legendTexts = []

legendValues.forEach((legendValue, i) => {
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 20) + ")");

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("stroke-width", 1)
        .attr("stroke", "#000000")
        .attr("fill", d3.interpolateBlues(legendValue))

    let legendText = legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(legendValue)

    legendTexts.push(legendText)
});

function renderChart(populationList, mapJson) {
    let maxPop = Math.max(...populationList.map(o => Number(o.Population)))
    legendValues.forEach((legendValue, i) => {
        legendTexts[i].text(new Intl.NumberFormat().format(Math.round(legendValue * maxPop)) + " people")
    })

    var projection = d3.geoMercator()
        .fitSize([width, height], mapJson)
    var path = d3.geoPath().projection(projection);


    drawmap
        .selectAll("path")
        .data(mapJson.features)
        .join("path")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .duration(200)
        .attr("d", path)
        .attr("fill", d => {
            let selectedData = populationList.filter(t => t.Subzone.toUpperCase() == d.properties.Name)
            if (selectedData.length != 1) {
                return d3.interpolateBlues(0)
            }
            return d3.interpolateBlues(selectedData[0].Population / maxPop)
        })
        .attr("stroke", "#000000")
}

function prepData(populationJson) {
    populationJson.forEach((p) => {
        if (isNaN(p.Population)) {
            p.Population = 0
        }
        else {
            p.Population = Number(p.Population)
        }
    })
    populationList = populationJson;
}




Promise.all([
    d3.json("data/population2021.json"),
    d3.json("data/sgmap.json"),
]).then(function (data) {
    let populationJson = data[0]
    let mapJson = data[1]

    prepData(populationJson)
    renderChart(populationList, mapJson)
}).catch(function (err) {
    console.error(err)
})
