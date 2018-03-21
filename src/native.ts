const suffix = require("../scripts/suffix"); // tslint:disable-line
const bindings = require(`../node-libpng-${suffix}.node`); // tslint:disable-line

export const {
    __native_PngImage,
    __native_isPng,
} = bindings;
