import { ColorRGBA, colorRGBA } from "./rgba";

/**
 * Represents a color of color type `ColorType.RGB`.
 *
 * @see ColorType
 */
export type ColorRGB = [number, number, number] & { r: number, g: number, b: number };

/**
 * Create a new color of type `number`.
 *
 * @param r The value for the `red` part of the color.
 * @param g The value for the `green` part of the color.
 * @param b The value for the `blue` part of the color.
 *
 * @return The color in rgb representation.
 */
export function colorRGB(r: number, g: number, b: number): ColorRGB {
    const color = [r, g, b];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    return color as ColorRGB;
}

/**
 * Checks if the given parameter is a color of type `ColorRGB`.
 *
 * @param color The input to check.
 *
 * @return `true` if `color` was of type `ColorRGB` and `false` otherwise.
 */
export function isColorRGB(color: any): color is ColorRGB {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 3) { return false; }
    if (typeof (color as any).r !== "number") { return false; }
    if (typeof (color as any).g !== "number") { return false; }
    if (typeof (color as any).b !== "number") { return false; }
    return true;
}

/**
 * Converts a color of type `ColorRGB` to `ColorRGBA`.
 *
 * @param color The color to convert.
 *
 * @return The converted color in rgba format.
 */
export function convertRGBToRGBA(rgb: ColorRGB): ColorRGBA {
    return colorRGBA(rgb.r, rgb.g, rgb.b, 255);
}
