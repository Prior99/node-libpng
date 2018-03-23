const Benchmark = require("benchmark");
const fs = require("fs");
const drawChart = require("./chart");

const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");

const path = `${__dirname}/sample.png`;

const suite = new Benchmark.Suite();

module.exports = () => new Promise(resolve => {
    console.log("Benchmarking encode")
    const file = fs.readFileSync(path);
    // Setup node-libpng instance.
    const nodeLibpngInstance = new nodeLibpng.PngImage(file);
    // Setup pngjs instance.
    const pngjsInstance = PngJS.PNG.sync.read(file);
    suite
        .add("node-libpng", {
            fn() {
                nodeLibpngInstance.encode();
            }
        })
        .add("pngjs", {
            fn() {
                PngJS.PNG.sync.write(pngjsInstance);
            }
        })
        .on("cycle", event => {
            console.log(String(event.target));
        })
        .on("complete", () => {
            drawChart(suite, "./benchmark-encode.png", resolve);
        })
        .run();
});
