import { ColorRGB, convertRGBToRGBA } from "./rgb";
import { colorRGBA, ColorRGBA } from "./rgba";

/**
 * A palette used by libpng to lookup colors in.
 */
export type Palette = Map<number, ColorRGB>;

/**
 * Represents a color of color type `ColorType.PALETTE`.
 *
 * @see ColorType
 */
export type ColorPalette = [number] & { index: number };

/**
 * Create a new color of type `ColorPalette`.
 *
 * @param index The value for the index on the palette.
 *
 * @return The color in palette representation.
 */
export function colorPalette(index: number): ColorPalette {
    const color = [index];
    Object.defineProperty(color, "index", { get() { return this[0]; } });
    return color as ColorPalette;
}

/**
 * Checks if the given parameter is a color of type `ColorPalette`.
 *
 * @param color The input to check.
 *
 * @return `true` if `color` was of type `ColorPalette` and `false` otherwise.
 */
export function isColorPalette(color: any): color is ColorPalette {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 1) { return false; }
    if (typeof (color as any).index !== "number") { return false; }
    return true;
}

/**
 * Converts a color of type `ColorPalette` to `ColorRGBA`.
 *
 * @param color The color to convert.
 * @param palette The palette of the image the color originated from. Used to lookup the color.
 *
 * @return The converted color in rgba format.
 */
export function convertPaletteToRGBA(color: ColorPalette, palette: Palette): ColorRGBA {
    if (!palette.has(color.index)) { return; }
    return convertRGBToRGBA(palette.get(color.index));
}
