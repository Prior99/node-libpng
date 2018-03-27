import { ColorRGBA, colorRGBA } from "./rgba";

/**
 * Represents a color of color type `ColorType.GRAY_SCALE_A`.
 *
 * @see ColorType
 */
export type ColorGrayScaleAlpha = [number, number] & { gray: number, a: number };

/**
 * Create a new color of type `gray scale` with alpha channel.
 *
 * @param gray The value for the `gray` part of the color.
 * @param a The value for the alpha channel part of the color.
 *
 * @return The color in gray scale with alpha channel representation.
 */
export function colorGrayScaleAlpha(gray: number, a: number): ColorGrayScaleAlpha {
    const color = [gray, a];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    Object.defineProperty(color, "a", { get() { return this[1]; } });
    return color as ColorGrayScaleAlpha;
}

/**
 * Checks if the given parameter is a color of type `ColorGrayScaleA`.
 *
 * @param color The input to check.
 *
 * @return `true` if `color` was of type `ColorGrayScaleA` and `false` otherwise.
 */
export function isColorGrayScaleAlpha(color: any): color is ColorGrayScaleAlpha {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 2) { return false; }
    if (typeof (color as any).gray !== "number") { return false; }
    if (typeof (color as any).a !== "number") { return false; }
    return true;
}

/**
 * Converts a color of type `ColorGrayScaleAlpha` to `ColorRGBA`.
 *
 * @param color The color to convert.
 *
 * @return The converted color in rgba format.
 */
export function convertGrayScaleAlphaToRGBA(grayScaleAlpha: ColorGrayScaleAlpha): ColorRGBA {
    return colorRGBA(grayScaleAlpha.gray, grayScaleAlpha.gray, grayScaleAlpha.gray, grayScaleAlpha.a);
}
