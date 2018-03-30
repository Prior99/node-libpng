import { colorPalette, isColorPalette, convertPaletteToRGBA } from "../palette";
import { colorGrayScale } from "../gray-scale";
import { colorRGB, ColorRGB } from "../rgb";

describe("The utilities for palette colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorPalette(4);
        expect(color.index).toBe(4);
        expect(color).toEqual([4]);
    });

    describe("checking if a given input is a palette color", () => {
        [
            undefined,
            null,
            10,
            "string",
            false,
            true,
            [],
            {},
            [1, 2],
            colorGrayScale(5),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isColorPalette(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isColorPalette(colorPalette(4))).toBe(true);
        });
    });

    it("convert to RGBA", () => {
        const palette = new Map<number, ColorRGB>();
        palette.set(2, colorRGB(100, 90, 80));
        expect(convertPaletteToRGBA(colorPalette(2), palette)).toEqual([100, 90, 80, 255]);
    });

    it("convert to RGBA with invalid color in palette", () => {
        const palette = new Map<number, ColorRGB>();
        expect(convertPaletteToRGBA(colorPalette(3), palette)).toBeUndefined();
    });
});
