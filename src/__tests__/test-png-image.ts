import { readFileSync } from "fs";
import { PngImage } from "..";
import { expectRedBlueGradient } from "./utils";

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

    it("decodes a normal png file", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`);
        const { data } = new PngImage(inputBuffer);
        expectRedBlueGradient(data);
    });

    it("decodes a PNG file with ADAM7 interlacing", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px-interlaced.png`);
        const { data } = new PngImage(inputBuffer);
        expectRedBlueGradient(data);
    });

    describe("export methods", () => {
        const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/orange-rectangle.png`));

        describe("encode", () => {
            it("encodes a PNG file with the colortype being RGB", () => {
                expect(somePngImage.encode().toString("hex")).toMatchSnapshot();
            });
        });

        describe("write", () => {
            it("writes a PNG file with the colortype being RGB", async () => {
                const path = `${__dirname}/../../tmp-png-image-write.png`;
                await somePngImage.write(path);
                const fromDisk = readFileSync(path);
                expect(fromDisk.toString("hex")).toMatchSnapshot();
            });
        });

        describe("writeSync", () => {
            it("writes a PNG file with the colortype being RGB", () => {
                const path = `${__dirname}/../../tmp-png-image-write-sync.png`;
                somePngImage.writeSync(path);
                const fromDisk = readFileSync(path);
                expect(fromDisk.toString("hex")).toMatchSnapshot();
            });
        });
    });
});
