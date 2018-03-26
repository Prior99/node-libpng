import { readFileSync } from "fs";
import { decode, readPngFile, readPngFileSync } from "..";
import { expectEveryPixel } from "./utils";

describe("decode", () => {
    // This fixtures is a 32w, 16h rectangle with RGB = (255, 128, 64) and no alpha channel.
    const someOrangeRectangle = readFileSync(`${__dirname}/fixtures/orange-rectangle.png`);
    // This fixtures is a 32w, 16h rectangle with RGBA = (255, 128, 64, 128).
    const someOpaqueRectangle = readFileSync(`${__dirname}/fixtures/opaque-rectangle.png`);

    it("decodes a png", () => {
        const decoded = decode(someOrangeRectangle).data;
        // 32w * 16h * 3 bytes per pixel.
        const expectedLength = 32 * 16 * 3;
        expect(decoded.length).toBe(expectedLength);
        expectEveryPixel(decoded, [255, 128, 64]);
    });

    it("decodes a png with an alpha channel", () => {
        const decoded = decode(someOpaqueRectangle).data;
        // 32w * 16h * 4 bytes per pixel.
        const expectedLength = 32 * 16 * 4;
        expect(decoded.length).toBe(expectedLength);
        expectEveryPixel(decoded, [255, 128, 64, 127]);
    });

    it("throws an error when trying to decode something which isn't a buffer", () => {
        expect(() => decode("something" as any)).toThrowErrorMatchingSnapshot();
    });
});

describe("readPngFileSync", () => {
    it("decodes a PNG file", () => {
        expectEveryPixel(readPngFileSync(`${__dirname}/fixtures/orange-rectangle.png`).data, [255, 128, 64]);
    });
});

describe("readPngFile", () => {
    describe("using the Promise API", () => {
        it("decodes a PNG file", async () => {
            const decoded = (await readPngFile(`${__dirname}/fixtures/orange-rectangle.png`)).data;
            expectEveryPixel(decoded, [255, 128, 64]);
        });

        it("rejects with an error when decoding failed", async () => {
            return expect(readPngFile(`${__dirname}/fixtures/red-blue-gradient-256px.jpg`)).rejects.toMatchSnapshot();
        });

        it("rejects with an error when reading failed", async () => {
            return expect(readPngFile(`this-file/does/not/exist.png`)).rejects.toBeTruthy();
        });
    });

    describe("using the callback API", () => {
        it("decodes a PNG file", done => {
            readPngFile(`${__dirname}/fixtures/orange-rectangle.png`, (error, pngImg) => {
                expect(error).toBeNull();
                expectEveryPixel(pngImg.data, [255, 128, 64]);
                done();
            });
        });

        it("calls the callback with an error when decoding failed", done => {
            readPngFile(`${__dirname}/fixtures/red-blue-gradient-256px.jpg`, (error, pngImg) => {
                expect(error).toMatchSnapshot();
                done();
            });
        });

        it("calls the callback with an error when reading failed", done => {
            readPngFile(`this-file/does/not/exist.png`, (error, pngImg) => {
                expect(error).toBeTruthy();
                done();
            });
        });
    });
});
