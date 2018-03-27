import { colorPalette, isColorPalette } from "../palette";
import { colorGrayScale } from "../gray-scale";

describe("The utilities for palette colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorPalette(4);
        expect(color.index).toBe(4);
        expect(color).toEqual([4]);
    });

    describe("checking if a given input is an indexed color", () => {
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
});
