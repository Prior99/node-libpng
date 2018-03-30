import {
    colorTypeToColorChecker,
    isColorRGB,
    isColorRGBA,
    isColorPalette,
    isColorGrayScale,
    isColorGrayScaleAlpha,
    defaultBackgroundColor,
} from "..";
import { ColorType } from "../../color-type";

describe("General color utils", () => {
    describe("colorTypeToColorChecker", () => {
        it("returns the correct checker for `ColorType.GRAY_SCALE`", () => {
            expect(colorTypeToColorChecker(ColorType.GRAY_SCALE)).toBe(isColorGrayScale);
        });

        it("returns the correct checker for `ColorType.GRAY_SCALE_ALPHA`", () => {
            expect(colorTypeToColorChecker(ColorType.GRAY_SCALE_ALPHA)).toBe(isColorGrayScaleAlpha);
        });

        it("returns the correct checker for `ColorType.RGB`", () => {
            expect(colorTypeToColorChecker(ColorType.RGB)).toBe(isColorRGB);
        });

        it("returns the correct checker for `ColorType.RGBA`", () => {
            expect(colorTypeToColorChecker(ColorType.RGBA)).toBe(isColorRGBA);
        });

        it("returns the correct checker for `ColorType.PALETTE`", () => {
            expect(colorTypeToColorChecker(ColorType.PALETTE)).toBe(isColorPalette);
        });

        it("returns `undefined` for invalid input", () => {
            expect(colorTypeToColorChecker(ColorType.UNKNOWN)).toBeUndefined();
        });
    });

    describe("defaultBackgroundColor", () => {
        it("returns the correct background color for `ColorType.GRAY_SCALE`", () => {
            expect(defaultBackgroundColor(ColorType.GRAY_SCALE)).toEqual([255]);
        });

        it("returns the correct background color for `ColorType.GRAY_SCALE_ALPHA`", () => {
            expect(defaultBackgroundColor(ColorType.GRAY_SCALE_ALPHA)).toEqual([0, 0]);
        });

        it("returns the correct background color for `ColorType.RGB`", () => {
            expect(defaultBackgroundColor(ColorType.RGB)).toEqual([255, 255, 255]);
        });

        it("returns the correct background color for `ColorType.RGBA`", () => {
            expect(defaultBackgroundColor(ColorType.RGBA)).toEqual([0, 0, 0, 0]);
        });

        it("returns the correct background color for `ColorType.PALETTE`", () => {
            expect(defaultBackgroundColor(ColorType.PALETTE)).toEqual([0]);
        });

        it("returns `undefined` for invalid input", () => {
            expect(defaultBackgroundColor(ColorType.UNKNOWN)).toBeUndefined();
        });
    });
});
