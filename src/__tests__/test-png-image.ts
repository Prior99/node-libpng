import { PngImage } from "..";
import { readFileSync } from "fs";

describe("PngImage", () => {
    it("reads a normal png file", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`);
        const image = new PngImage(buffer);

        expect(image.bitDepth).toBe(8);
        expect(image.channels).toBe(3);
        expect(image.colorType).toBe("rgb");
        expect(image.width).toBe(256);
        expect(image.height).toBe(256);
        expect(image.interlaceType).toBe("none");
        expect(image.rowBytes).toBe(256 * 3);
        expect(image.offsetX).toBe(0);
        expect(image.offsetY).toBe(0);
        expect(image.pixelsPerMeterX).toBe(2835);
        expect(image.pixelsPerMeterY).toBe(2835);
    });
});
