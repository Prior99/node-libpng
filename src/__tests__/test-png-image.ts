import { PngImage } from "..";
import { readFileSync } from "fs";

describe("PngImage", () => {
    it("reads a normal png file", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`);
        const image = new PngImage(buffer);
        expect(image.width).toBe(256);
        expect(image.height).toBe(256);
    });
});
