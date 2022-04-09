const path = require("path");

const suffix = `${process.platform}-${process.env.ARCH || process.arch}-${process.versions.modules}`;
const baseName = `node-libpng-${suffix}.node`;
const qualifiedName = path.resolve(__dirname, "..", baseName);

module.exports = { suffix, baseName, qualifiedName };
