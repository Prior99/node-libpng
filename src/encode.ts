import { __native_encode } from "./native";

export interface EncodeOptions {
    width?: number;
    height?: number;
    alpha: boolean;
}

/**
 * Encode a buffer of raw RGB or RGBA image data into PNG format.
 *
 * @param buffer The buffer to convert.
 *
 * @return the encoded PNG as a new buffer.
 */
export function encode(buffer: Buffer, options: EncodeOptions): Buffer {
    const { alpha } = options;
    const bytesPerPixel = alpha ? 4 : 3;
    let { width, height } = options;
    if (typeof width !== "number" && typeof height !== "number") {
        throw new Error("Error encoding PNG. Either width or height need to be specified.");
    }
    if (typeof alpha !== "boolean") {
        throw new Error("Error encoding PNG. Alpha channel needs to be explicitly specified.");
    }
    if (typeof height === "undefined") {
        height = buffer.length / (bytesPerPixel * width);
    }
    if (typeof width === "undefined") {
        width = buffer.length / (bytesPerPixel * height);
    }
    return __native_encode(buffer, width, height, alpha);
}
