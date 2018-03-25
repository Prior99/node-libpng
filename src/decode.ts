import { readFile, readFileSync } from "fs";
import { PngImage } from "./png-image";

/**
 * Decode a buffer of encoded PNG data into a `PngImage` offering access to the raw image data.
 *
 * @param buffer The buffer to convert.
 *
 * @return the decoded PNG as a `PngImage` instance.
 */
export function decode(buffer: Buffer): PngImage {
    return new PngImage(buffer);
}

export type ReadPngFileCallback = (error: Error, pngImage?: PngImage) => void;

export function readPngFile(path: string, callback: ReadPngFileCallback): void;
export function readPngFile(path: string): Promise<PngImage>;
/**
 * Invoke `readPngFile` to asynchroneously read a png file into a decoded image.
 * For convenience, both Node.js callbacks and Promises are supported.
 * If no callback is provided as a second argument, a Promise is returned which will resolve
 * with the decoded image.
 *
 * @param path The path to the file to decode.
 * @param callback An optional callback to use instead of a returned Promise. Will be called with
 *                 an error as the first argument or `null` if everything went well, and the decoded
 *                 image as a second argument if no error occured.
 * @return A Promise if no callback was provided and `undefined` otherwise.
 */
export function readPngFile(path: string, callback?: ReadPngFileCallback) {
    // Check if the user provided a `callback`.
    if (typeof callback === "function") {
        readFile(path, (readError: Error, data: Buffer) => {
            // Call the callback with an error if an error occured.
            if (readError) {
                callback(readError);
                return;
            }
            // Try to decode the PNG image. Catch any errors that might occur.
            let pngImage: PngImage;
            try {
                pngImage = new PngImage(data);
            } catch (decodeError) {
                callback(decodeError);
                return;
            }
            // If no error occured, call the callback with the decoded image.
            callback(null, pngImage);
        });
        return;
    }
    // If the user didn't provide a callback, return a Promise which will resolve with the decoded image.
    return new Promise<PngImage>((resolve, reject) => {
        return readFile(path, (readError: Error, data: Buffer) => {
            // Reject if an error occured during read.
            if (readError) {
                reject(readError);
                return;
            }
            // Try to decode the PNG image. Catch any errors that might occur.
            let pngImage: PngImage;
            try {
                pngImage = new PngImage(data);
            } catch (decodeError) {
                reject(decodeError);
                return;
            }
            // If no error occured, resolve the Promise with the decoded image.
            resolve(pngImage);
        });
    });
}

/**
 * Decode a PNG file synchroneously.
 *
 * @param path The path to the file to decode.
 *
 * @return The decoded image.
 */
export function readPngFileSync(path: string): PngImage {
    return new PngImage(readFileSync(path));
}
