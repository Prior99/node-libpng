import { writeFile, writeFileSync } from "fs";
import { __native_encode } from "./native";

export interface EncodeOptions {
    /**
     * The width of the image to be encoded in pixels.
     */
    width: number;
    /**
     * The height of the image to be encoded in pixels.
     */
    height?: number;
}

/**
 * Encode a buffer of raw RGB or RGBA image data into PNG format.
 * Only RGB and RGBA color formats are supported. This function will automatically calculate whether an
 * alpha channel is present by calculating the amount of bytes per pixel from the length of the buffer
 * and the provided `width` and `height`. Only 8bit colors are supported.
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
    let { width, height } = options;
    if (typeof width !== "number" || typeof height !== "number") {
        throw new Error("Error encoding PNG. Width and height need to be specified.");
    }
    if (!Number.isInteger(width)) {
        throw new Error("Error encoding PNG. Width needs to be an integer.");
    }
    if (!Number.isInteger(height)) {
        throw new Error("Error encoding PNG. Height needs to be an integer.");
    }
    const bytesPerPixel = buffer.length / (width * height);
    if (bytesPerPixel !== 3 && bytesPerPixel !== 4) {
        throw new Error("Error encoding PNG. Unsupported color type.");
    }
    const alpha = bytesPerPixel === 4;
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
