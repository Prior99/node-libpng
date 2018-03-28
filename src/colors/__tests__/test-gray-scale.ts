import { colorGrayScale, isColorGrayScale, convertGrayScaleToRGBA } from "../gray-scale";
import { colorPalette } from "../palette";

describe("The utilities for gray scale colors", () => {
    it("creates a gray scale color", () => {
        const color = colorGrayScale(128);
        expect(color.gray).toBe(128);
        expect(color).toEqual([128]);
    });

    describe("checking if a given input is a gray scale color", () => {
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
            colorPalette(128),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isColorGrayScale(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isColorGrayScale(colorGrayScale(128))).toBe(true);
        });
    });

    it("convert to RGBA", () => {
        expect(convertGrayScaleToRGBA(colorGrayScale(100))).toEqual([100, 100, 100, 255]);
    });
});
