const Benchmark = require("benchmark");
const fs = require("fs");
const ChartjsNode = require('chartjs-node');

const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");

const path = `${__dirname}/sample.png`;

const suite = new Benchmark.Suite();

suite
    .add("node-libpng", {
        defer: true,
        fn(deferred) {
            const file = fs.readFileSync(path);
            new nodeLibpng.PngImage(file);
            deferred.resolve();
        }
    })
    .add("pngjs", {
        defer: true,
        fn(deferred) {
            const png = new PngJS.PNG();
            const src = fs.createReadStream(path);
            png.on("parsed", () => deferred.resolve())
            src.pipe(png);
        }
    })
    .on("cycle", event => {
        console.log(String(event.target));
    })
    .on("complete", () => {
        const colors = ["rgb(255, 128, 0)", "rgb(80, 80, 255)"];
        const data = {
            labels: ["Decode (OP/s)"],
            datasets: suite.map((benchmark, index) => {
                return {
                    label: benchmark.name,
                    backgroundColor: colors[index],
                    data: [benchmark.hz]
                };
            })
        };
        const type = "horizontalBar";
        const options = {};
        const chartNode = new ChartjsNode(1000, 200);
        chartNode.drawChart({ data, type, options })
            .then(() => chartNode.getImageBuffer('image/png'))
            .then(buffer => chartNode.getImageStream('image/png'))
            .then(streamResult => chartNode.writeImageToFile('image/png', './benchmark.png'))
            .catch(err => {
                console.error("Error drawing chart", err);
            })
    })
    .run({
        "async": true
    });
