import { writeFile, writeFileSync } from "fs";
import { __native_encode } from "./native";

export interface EncodeOptions {
    /**
     * The width of the image to be encoded in pixels. Either `width` or `height` or both need
     * to be specified.
     */
    width?: number;
    /**
     * The height of the image to be encoded in pixels. Either `width` or `height` or both need
     * to be specified.
     */
    height?: number;
    /**
     * Whether the buffer to encode contains an alpha channel.
     */
    alpha: boolean;
}

/**
 * Encode a buffer of raw RGB or RGBA image data into PNG format.
 *
 * @param buffer The buffer of raw pixel data to encode.
 * @param options Options used to encode the image.
 *
 * @return the encoded PNG as a new buffer.
 */
export function encode(buffer: Buffer, options: EncodeOptions): Buffer {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("Input is not a buffer.");
    }
    if (typeof options !== "object" || options === null) {
        throw new Error("Options need to be an object.");
    }
    const { alpha } = options;
    const bytesPerPixel = alpha ? 4 : 3;
    let { width, height } = options;
    if (typeof width !== "number" && typeof height !== "number") {
        throw new Error("Error encoding PNG. Either width or height need to be specified.");
    }
    if (typeof width === "number" && !Number.isInteger(width)) {
        throw new Error("Error encoding PNG. Width needs to be an integer.");
    }
    if (typeof height === "number" && !Number.isInteger(height)) {
        throw new Error("Error encoding PNG. Height needs to be an integer.");
    }
    if (typeof alpha !== "boolean") {
        throw new Error("Error encoding PNG. Alpha channel needs to be explicitly specified.");
    }
    if (typeof height !== "number") {
        height = buffer.length / (bytesPerPixel * width);
    }
    if (typeof width !== "number") {
        width = buffer.length / (bytesPerPixel * height);
    }
    if (buffer.length !== height * width * bytesPerPixel) {
        throw new Error("Error encoding PNG.Invalid buffer length.");
    }
    return __native_encode(buffer, width, height, alpha);
}

export type WritePngFileCallback = (error: Error) => void;

export function writePngFile(
    path: string,
    buffer: Buffer,
    options: EncodeOptions,
    callback: WritePngFileCallback,
): void;
export function writePngFile(path: string, buffer: Buffer, options: EncodeOptions): Promise<void>;
/**
 * Invoke `writePngFile` to asynchroneously write a raw buffer of pixel data as an encoded PNG image.
 * For convenience, both Node.js callbacks and Promises are supported.
 * If no callback is provided as a second argument, a Promise is returned which will resolve
 * once the file is written.
 *
 * @param path The path the file should be written to.
 * @param buffer The buffer of raw pixel data which should be encoded and written to disk.
 * @param options Options used to encode the image.
 * @param callback An optional callback to use instead of a returned Promise. Will be called with
 *                 an error as the first argument or `null` if everything went well.
 * @return A Promise if no callback was provided and `undefined` otherwise.
 */
export function writePngFile(
    path: string,
    buffer: Buffer,
    options: EncodeOptions,
    callback?: WritePngFileCallback,
): Promise<void> {
    // Checlkif the user provided a `callback`.
    if (typeof callback === "function") {
        // Encode the buffer and call the `callback` with an error if an error occured.
        let encoded: Buffer;
        try {
            encoded = encode(buffer, options);
        } catch (encodeError) {
            callback(encodeError);
            return;
        }
        // Write the file and hand over the callback. This way it will be called with `null` or an error
        // if an error occured.
        writeFile(path, encoded, callback);
        return;
    }
    // If the user didn't provide a callback, return a Promise which will resolve once the file is written,
    // or reject with an error if an error occured.
    return new Promise<void>((resolve, reject) => {
        // Encode the buffer and reject the Promise if an error occured.
        let encoded: Buffer;
        try {
            encoded = encode(buffer, options);
        } catch (encodeError) {
            reject(encodeError);
            return;
        }
        // Write the file and make the Promise resolve or reject depending on whether an error occured when writing.
        writeFile(path, encoded, error => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
        return;
    });
}

/**
 * Encode and write a PNG file synchroneously.
 *
 * @param path The path the file should be written to.
 * @param buffer The buffer of raw pixel data which should be encoded and written to disk.
 * @param options Options used to encode the image.
 *
 * @return The decoded image.
 */
export function writePngFileSync(path: string, buffer: Buffer, options: EncodeOptions): void {
    writeFileSync(path, encode(buffer, options));
}
