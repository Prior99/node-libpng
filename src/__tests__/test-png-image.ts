import { PngImage } from "..";
import { readFileSync } from "fs";

describe("PngImage", () => {
    it("reads the info of a normal png file", () => {
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
        expect(image.pixelsPerMeterX).toBe(0);
        expect(image.pixelsPerMeterY).toBe(0);
    });

    it("reads decodes a normal png file", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`);
        const { data } = new PngImage(inputBuffer);
        for (let i = 0; i < data.length; i += 3) {
            // The image is of 256 pixel width.
            const x = (i / 3) % 256;
            const r = data[i + 0];
            const g = data[i + 1];
            const b = data[i + 2];
            // The image is a gradient from red (255, 0, 0) to blue (0, 0, 255).
            expect(r).toBe(255 - x);
            expect(g).toBe(0);
            expect(b).toBe(x);
        }
    });
});
