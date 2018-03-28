import { ColorRGBA, colorRGBA } from "./rgba";

/**
 * Represents a color of color type `ColorType.GRAY_SCALE`.
 *
 * @see ColorType
 */
export type ColorGrayScale = [number] & { gray: number };

/**
 * Create a new color of type `ColorGrayScale`.
 *
 * @param gray The value for the `gray` part of the color.
 *
 * @return The color in gray scale representation.
 */
export function colorGrayScale(gray: number): ColorGrayScale {
    const color = [gray];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    return color as ColorGrayScale;
}

/**
 * Checks if the given parameter is a color of type `ColorGrayScale`.
 *
 * @param color The input to check.
 *
 * @return `true` if `color` was of type `ColorGrayScale` and `false` otherwise.
 */
export function isColorGrayScale(color: any): color is ColorGrayScale {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 1) { return false; }
    if (typeof (color as any).gray !== "number") { return false; }
    return true;
}

/**
 * Converts a color of type `ColorGrayScale` to `ColorRGBA`.
 *
 * @param color The color to convert.
 *
 * @return The converted color in rgba format.
 */
export function convertGrayScaleToRGBA(grayScaleAlpha: ColorGrayScale): ColorRGBA {
    return colorRGBA(grayScaleAlpha.gray, grayScaleAlpha.gray, grayScaleAlpha.gray, 255);
}
