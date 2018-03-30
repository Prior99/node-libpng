import { rect, isRect } from "../rect";
import { xy } from "../xy";

describe("Rectangle utilities", () => {
    describe("rect", () => {
        it("creates a rect from 4 numbers", () => {
            const result = rect(5, 5, 10, 10);
            expect(result).toEqual([5, 5, 10, 10]);
            expect(result.x).toBe(5);
            expect(result.y).toBe(5);
            expect(result.width).toBe(10);
            expect(result.height).toBe(10);
            expect(result.offset).toEqual([5, 5]);
            expect(result.dimensions).toEqual([10, 10]);
        });

        it("creates a rect from two sets of coordinates", () => {
            const result = rect(xy(5, 5), xy(10, 10));
            expect(result).toEqual([5, 5, 10, 10]);
            expect(result.x).toBe(5);
            expect(result.y).toBe(5);
            expect(result.width).toBe(10);
            expect(result.height).toBe(10);
            expect(result.offset).toEqual([5, 5]);
            expect(result.dimensions).toEqual([10, 10]);
        });
    });

    describe("isRect", () => {
        [
            undefined,
            null,
            10,
            "string",
            false,
            true,
            [],
            {},
            [1, 2, 3, 4],
            Object.assign([1, 2, 3, 4], { x: 1 }),
            Object.assign([1, 2, 3, 4], { x: 1, y: 2 }),
            Object.assign([1, 2, 3, 4], { x: 1, y: 2, width: 3 }),
            Object.assign([1, 2, 3, 4], { x: 1, y: 2, width: 3, height: 4 }),
            Object.assign([1, 2, 3, 4], { x: 1, y: 2, width: 3, height: 4, offset: xy(1, 2) }),
        ].forEach(input => {
            it(`detects "${JSON.stringify(input)}" as false`, () => {
                expect(isRect(input)).toBe(false);
            });
        });

        it("detects a rect as true", () => {
            expect(isRect(rect(1, 2, 3, 4))).toBe(true);
        });
    });
});
