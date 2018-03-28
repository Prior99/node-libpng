import { ColorType } from "../color-type";

import { colorGrayScaleAlpha, isColorGrayScaleAlpha, ColorGrayScaleAlpha } from "./gray-scale-alpha";
import { colorGrayScale, isColorGrayScale, ColorGrayScale } from "./gray-scale";
import { colorPalette, isColorPalette, ColorPalette } from "./palette";
import { colorRGB, isColorRGB, ColorRGB } from "./rgb";
import { colorRGBA, isColorRGBA, ColorRGBA } from "./rgba";

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

export function defaultBackgroundColor(colorType: ColorType) {
    switch (colorType) {
        case ColorType.GRAY_SCALE:
            return colorGrayScale(255);
        case ColorType.GRAY_SCALE_ALPHA:
            return colorGrayScaleAlpha(0, 0);
        case ColorType.PALETTE:
            return colorPalette(0);
        case ColorType.RGB:
            return colorRGB(255, 255, 255);
        case ColorType.RGBA:
            return colorRGBA(0, 0, 0, 0);
        default:
            return;
    }
}
