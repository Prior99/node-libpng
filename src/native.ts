import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import { qualifiedName } from "../scripts/file-name";

// istanbul ignore if
if (!fs.existsSync(qualifiedName)) {
    throw new Error(`Unable to find native addon file "${qualifiedName}".`);
}

export const {
    __native_PngImage,
    __native_encode,
    __native_isPng,
    __native_resize,
    __native_copy,
    __native_fill,
} = require(qualifiedName); // tslint:disable-line
