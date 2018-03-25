const benchmarkRead = require("./read");
const benchmarkAccess = require("./access");
const benchmarkEncode = require("./encode");

benchmarkRead()
    .then(() => benchmarkEncode())
    .then(() => benchmarkAccess())
    .then(() => console.log("Done."));
