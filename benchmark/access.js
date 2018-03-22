const Benchmark = require("benchmark");
const fs = require("fs");
const ChartjsNode = require('chartjs-node');

const PngJS = require("pngjs");
const nodeLibpng = require("node-libpng");

const path = `${__dirname}/sample.png`;

const suite = new Benchmark.Suite();

module.exports = () => new Promise(resolve => {
    console.log("Benchmarking access")
    const file = fs.readFileSync(path);
    // Setup node-libpng instance.
    const nodeLibpngInstance = new nodeLibpng.PngImage(file);
    // Setup pngjs instance.
    const pngjsInstance = PngJS.PNG.sync.read(file);

    suite
        .add("node-libpng", {
            defer: true,
            fn(deferred) {
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
                deferred.resolve();
            }
        })
        .add("pngjs", {
            defer: true,
            fn(deferred) {
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
                deferred.resolve();
            }
        })
        .on("cycle", event => {
            console.log(String(event.target));
        })
        .on("complete", () => {
            const colors = ["rgb(255, 128, 0)", "rgb(80, 80, 255)"];
            const data = {
                labels: ["Raw Access (Full Read/s)"],
                datasets: suite.map((benchmark, index) => {
                    return {
                        label: benchmark.name,
                        backgroundColor: colors[index],
                        data: [benchmark.hz]
                    };
                })
            };
            const type = "horizontalBar";
            const options = {
                scales: {
                    xAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ],
                    yAxes: [
                        {
                            display: false
                        }
                    ]
                }
            };
            const chartNode = new ChartjsNode(1000, 200);
            chartNode.drawChart({ data, type, options })
                .then(() => chartNode.getImageBuffer('image/png'))
                .then(buffer => chartNode.getImageStream('image/png'))
                .then(streamResult => chartNode.writeImageToFile('image/png', './benchmark-access.png'))
                .then(resolve)
                .catch(err => {
                    console.error("Error drawing chart", err);
                })
        })
        .run();
});
