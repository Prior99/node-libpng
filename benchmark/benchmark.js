const benchmarkRead = require("./read");
const benchmarkAccess = require("./access");

benchmarkRead()
    .then(() => benchmarkAccess())
    .then(() => console.log("Done."));
