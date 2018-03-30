import { xy, isXY } from "../xy";

describe("The utilities for xy coordinates", () => {
    describe("the utility for creating a new set of coordinates", () => {
        it("creates a new set of coordinates", () => {
            const coordinates = xy(10, 20);
            expect(coordinates).toEqual([10, 20]);
            expect(coordinates.x).toBe(10);
            expect(coordinates.y).toBe(20);
        });
    });

    describe("the utility for hecking if an input is a set of xy coordinates", () => {
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
            { x: 10, y: 20, [0]: 10, [1]: 20 },
            Object.assign([1, 2], { x: 1 }),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isXY(input)).toBe(false);
            });
        });

        it("detects a correct input as true", () => {
            expect(isXY(xy(128, 128))).toBe(true);
        });
    });
});
