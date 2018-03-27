import { isColorGrayScaleAlpha, convertGrayScaleAlphaToRGBA, ColorGrayScaleAlpha } from "./gray-scale-alpha";
import { isColorGrayScale, convertGrayScaleToRGBA, ColorGrayScale } from "./gray-scale";
import { isColorRGB, convertRGBToRGBA, ColorRGB } from "./rgb";
import { isColorPalette, convertPaletteToRGBA, ColorPalette, Palette } from "./palette";

/**
 * Represents a color of color type `ColorType.RGBA`.
 *
 * @see ColorType
 */
export type ColorRGBA = [number, number, number, number] & { r: number, g: number, b: number, a: number };

/**
 * Create a new color of type `number`.
 *
 * @param r The value for the `red` part of the color.
 * @param g The value for the `green` part of the color.
 * @param b The value for the `blue` part of the color.
 * @param a The value for the alpha channel part of the color.
 *
 * @return The color in rgba representation.
 */
export function colorRGBA(r: number, g: number, b: number, a: number): ColorRGBA {
    const color = [r, g, b, a];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    Object.defineProperty(color, "a", { get() { return this[3]; } });
    return color as ColorRGBA;
}

/**
 * Checks if the given parameter is a color of type `ColorRGBA`.
 *
 * @param color The input to check.
 *
 * @return `true` if `color` was of type `ColorRGBA` and `false` otherwise.
 */
export function isColorRGBA(color: any): color is ColorRGBA {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 4) { return false; }
    if (typeof (color as any).r !== "number") { return false; }
    if (typeof (color as any).g !== "number") { return false; }
    if (typeof (color as any).b !== "number") { return false; }
    if (typeof (color as any).a !== "number") { return false; }
    return true;
}

/**
 * Convert a color in any format to rgba format.
 *
 * @param color The color to convert.
 * @param palette The palette to use if the color is in palette format. Will be ignored otherwise.
 *
 * @return The color converted to rgba format or `undefined` if the color couldn't be converted.
 */
export function convertToRGBA(
    color: ColorGrayScaleAlpha | ColorGrayScale | ColorRGB | ColorPalette | ColorRGBA,
    palette?: Palette,
): ColorRGBA {
    if (isColorRGBA(color)) { return color; }
    if (isColorRGB(color)) { return convertRGBToRGBA(color); }
    if (isColorGrayScale(color)) { return convertGrayScaleToRGBA(color); }
    if (isColorGrayScaleAlpha(color)) { return convertGrayScaleAlphaToRGBA(color); }
    if (isColorPalette(color)) { return convertPaletteToRGBA(color, palette); }
    return;
}
