import { colorRGBA, isColorRGBA, convertToRGBA } from "../rgba";
import { colorRGB, ColorRGB } from "../rgb";
import { colorGrayScale } from "../gray-scale";
import { colorGrayScaleAlpha } from "../gray-scale-alpha";
import { colorPalette } from "../palette";

describe("The utilities for palette colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorRGBA(50, 100, 150, 120);
        expect(color.r).toBe(50);
        expect(color.g).toBe(100);
        expect(color.b).toBe(150);
        expect(color.a).toBe(120);
        expect(color).toEqual([50, 100, 150, 120]);
    });

    describe("checking if a given input is a rgba color", () => {
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
            [1, 2, 3, 128],
            Object.assign([1, 2, 3, 128], { r: 1 }),
            Object.assign([1, 2, 3, 128], { r: 1, g: 2 }),
            Object.assign([1, 2, 3, 128], { r: 1, g: 2, b: 3 }),
            colorRGB(100, 120, 150),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isColorRGBA(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isColorRGBA(colorRGBA(40, 100, 120, 100))).toBe(true);
        });
    });

    describe("converting to RGBA", () => {
        it("converts a rgb color to rgba", () => {
            expect(convertToRGBA(colorRGB(1, 2, 3))).toEqual([1, 2, 3, 255]);
        });

        it("converts a gray scale color to rgba", () => {
            expect(convertToRGBA(colorGrayScale(1))).toEqual([1, 1, 1, 255]);
        });

        it("converts a gray scale alpha color to rgba", () => {
            expect(convertToRGBA(colorGrayScaleAlpha(1, 128))).toEqual([1, 1, 1, 128]);
        });

        it("converts a palette color to rgba", () => {
            const palette = new Map<number, ColorRGB>();
            palette.set(2, colorRGB(100, 90, 80));
            expect(convertToRGBA(colorPalette(2), palette)).toEqual([100, 90, 80, 255]);
        });

        it("converts a rgba color to rgba", () => {
            expect(convertToRGBA(colorRGBA(1, 2, 3, 255))).toEqual([1, 2, 3, 255]);
        });

        it("returns `undefined` for invalid input", () => {
            expect(convertToRGBA(null)).toBeUndefined();
        });
    });
});
