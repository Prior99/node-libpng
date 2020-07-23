import { readPngFileSync, PngImage } from "..";

describe("regressions", () => {
    test("issue #23", () => {
        let result: PngImage;
        expect(() => result = readPngFileSync(`${__dirname}/fixtures/regression-issue-23.png`))
            .not.toThrow();
        expect(result.width).toBe(58);
        expect(result.height).toBe(29);
    });
});
