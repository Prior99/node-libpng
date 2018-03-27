import { colorRGBA, isColorRGBA } from "../rgba";
import { colorRGB } from "../rgb";

describe("The utilities for palette colors", () => {
    it("creates a gray scale alpha color", () => {
        const color = colorRGBA(50, 100, 150, 120);
        expect(color.r).toBe(50);
        expect(color.g).toBe(100);
        expect(color.b).toBe(150);
        expect(color.a).toBe(120);
        expect(color).toEqual([50, 100, 150, 120]);
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
});
