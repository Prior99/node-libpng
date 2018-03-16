import bindings = require("bindings"); // tslint:disable-line

export const {
    __native_PngImage,
    __native_isPng,
} = bindings("node-libpng");
