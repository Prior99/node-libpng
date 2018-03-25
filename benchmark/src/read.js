const Benchmark = require("benchmark");
const fs = require("fs");
const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");
const drawChart = require("./chart");

module.exports = () => new Promise(resolve => {
    console.log("Benchmarking read")
    const file = fs.readFileSync(`${__dirname}/../sample.png`);
    const suite = new Benchmark.Suite();
    suite
        .add("node-libpng", () => new nodeLibpng.PngImage(file))
        .add("pngjs", () => PngJS.PNG.sync.read(file))
        .on("cycle", event => console.log(String(event.target)))
        .on("complete", () => drawChart(suite, `${__dirname}/../benchmark-read.png`, resolve))
        .run();
});
