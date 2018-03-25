const Benchmark = require("benchmark");
const fs = require("fs");
const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");
const drawChart = require("./chart");

module.exports = () => new Promise(resolve => {
    console.log("Benchmarking access")
    const file = fs.readFileSync(`${__dirname}/../sample.png`);
    const nodeLibpngInstance = new nodeLibpng.PngImage(file);
    const pngjsInstance = PngJS.PNG.sync.read(file);
    const suite = new Benchmark.Suite();
    suite
        .add("node-libpng", () => {
            let r = 0, g = 0, b = 0;
            const { width, height } = nodeLibpngInstance;
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < height; ++y) {
                    const index = (x + y * width) * 3;
                    r += nodeLibpngInstance.data[index + 0];
                    g += nodeLibpngInstance.data[index + 1];
                    b += nodeLibpngInstance.data[index + 2];
                }
            }
        })
        .add("pngjs", () => {
            let r = 0, g = 0, b = 0;
            const { width, height } = pngjsInstance;
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < height; ++y) {
                    const index = (x + y * width) * 4;
                    r += pngjsInstance.data[index + 0];
                    g += pngjsInstance.data[index + 1];
                    b += pngjsInstance.data[index + 2];
                }
            }
        })
        .on("cycle", event => console.log(String(event.target)))
        .on("complete", () => drawChart(suite, `${__dirname}/../benchmark-access.png`, resolve))
        .run();
});
