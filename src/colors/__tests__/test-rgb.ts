import { colorRGB, isColorRGB, convertRGBToRGBA } from "../rgb";
import { colorGrayScale } from "../gray-scale";

describe("The utilities for palette colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorRGB(50, 100, 150);
        expect(color.r).toBe(50);
        expect(color.g).toBe(100);
        expect(color.b).toBe(150);
        expect(color).toEqual([50, 100, 150]);
    });

    describe("checking if a given input is a rgb color", () => {
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
            [1, 2, 3],
            Object.assign([1, 2, 3], { r: 1 }),
            Object.assign([1, 2, 3], { r: 1, g: 2 }),
            colorGrayScale(50),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isColorRGB(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isColorRGB(colorRGB(40, 100, 120))).toBe(true);
        });
    });

    it("convert to RGBA", () => {
        expect(convertRGBToRGBA(colorRGB(100, 90, 80))).toEqual([100, 90, 80, 255]);
    });
});
