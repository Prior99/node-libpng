const fs = require("fs");
const path = require("path");
const suffix = require("./suffix");

const source = path.resolve(__dirname, "..", "build", "Release", "node-libpng.node");
const destination = path.resolve(__dirname, "..", "node-libpng-" + suffix + ".node");

console.log("Build artifact: " + destination);

fs.renameSync(source, destination);
