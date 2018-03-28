import { ColorType } from "../color-type";

import { isColorGrayScaleAlpha, ColorGrayScaleAlpha } from "./gray-scale-alpha";
import { isColorGrayScale, ColorGrayScale } from "./gray-scale";
import { isColorPalette, ColorPalette } from "./palette";
import { isColorRGB, ColorRGB } from "./rgb";
import { isColorRGBA, ColorRGBA } from "./rgba";

export * from "./gray-scale-alpha";
export * from "./gray-scale";
export * from "./palette";
export * from "./rgb";
export * from "./rgba";

export type ColorAny = ColorRGB | ColorRGBA | ColorGrayScale | ColorGrayScaleAlpha | ColorPalette;
export type ColorNoAlpha = ColorRGB | ColorGrayScale | ColorPalette;

export function colorTypeToColorChecker(colorType: ColorType) {
    switch (colorType) {
        case ColorType.GRAY_SCALE:
            return isColorGrayScale;
        case ColorType.GRAY_SCALE_ALPHA:
            return isColorGrayScaleAlpha;
        case ColorType.PALETTE:
            return isColorPalette;
        case ColorType.RGB:
            return isColorRGB;
        case ColorType.RGBA:
            return isColorRGBA;
        default:
            return;
    }
}
