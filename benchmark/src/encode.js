const Benchmark = require("benchmark");
const fs = require("fs");
const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");
const drawChart = require("./chart");

module.exports = () => new Promise(resolve => {
    console.log("Benchmarking encode")
    const file = fs.readFileSync(`${__dirname}/../sample.png`);
    const nodeLibpngInstance = new nodeLibpng.PngImage(file);
    const pngjsInstance = PngJS.PNG.sync.read(file);
    const suite = new Benchmark.Suite()
    suite
        .add("node-libpng", () => nodeLibpngInstance.encode())
        .add("pngjs", () => PngJS.PNG.sync.write(pngjsInstance))
        .on("cycle", event => console.log(String(event.target)))
        .on("complete", () => drawChart(suite, `${__dirname}/../benchmark-encode.png`, resolve))
        .run();
});
