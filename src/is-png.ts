import { __native_isPng } from "./native";

/**
 * Will check if the provided buffer contains a PNG image.
 * Under the hood this will call `png_sig_cmp` and check for the
 * header of the buffer.
 *
 * @param buffer The buffer to check.
 *
 * @return `true` if the file was a PNG image file and `false` otherwise.
 */
export function isPng(buffer: Buffer): boolean {
    return __native_isPng(buffer);
}
