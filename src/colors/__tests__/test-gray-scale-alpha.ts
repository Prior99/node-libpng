import { colorGrayScaleAlpha, isColorGrayScaleAlpha, convertGrayScaleAlphaToRGBA } from "../gray-scale-alpha";
import { colorRGB } from "../rgb";

describe("The utilities for gray scale alpha colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorGrayScaleAlpha(128, 5);
        expect(color.gray).toBe(128);
        expect(color.a).toBe(5);
        expect(color).toEqual([128, 5]);
    });

    describe("checking if a given input is a gray scale alpha color", () => {
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
            colorRGB(128, 128, 128),
            Object.assign([1, 2], { gray: 1 }),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isColorGrayScaleAlpha(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isColorGrayScaleAlpha(colorGrayScaleAlpha(128, 128))).toBe(true);
        });
    });

    it("convert to RGBA", () => {
        expect(convertGrayScaleAlphaToRGBA(colorGrayScaleAlpha(100, 20))).toEqual([100, 100, 100, 20]);
    });
});
