import { readFileSync } from "fs";
import { PngImage, ColorType } from "../png-image";
import { isColorRGB, isColorRGBA, isColorPalette, isColorGrayScale, isColorGrayScaleAlpha } from "../colors";
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
        expect(image.palette).toBeUndefined();
        expect(image.backgroundColor).toBeUndefined();
        expect(image.bytesPerPixel).toBe(3);
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

    it("reads the palette of a ColorType.PALETTE image", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/indexed-16px.png`);
        const { palette } = new PngImage(inputBuffer);
        expect(palette.size).toBe(5);
        expect(Array.from(palette.entries())).toEqual([
            [0, [0, 0, 0]],
            [1, [128, 255, 64]],
            [2, [64, 128, 255]],
            [3, [255, 64, 128]],
            [4, [255, 128, 64]],
        ]);
    });

    it("reads the background color of an image with the background color specified", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/background-color.png`);
        const { backgroundColor } = new PngImage(inputBuffer);
        expect(backgroundColor).toEqual([255, 128, 64]);
    });

    it("converts XY coordinates to Index", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle.png`);
        const image = new PngImage(inputBuffer);
        expect(image.width).toBe(32);
        expect(image.height).toBe(16);
        expect(image.bytesPerPixel).toBe(3);
        expect(image.toXY(5)).toEqual([1, 0]);
        expect(image.toXY(32 * 3 * 10 + 3 * 5)).toEqual([5, 10]);
        expect(image.toXY(image.data.length - 2)).toEqual([31, 15]);
    });

    it("converts Index to XY coordinates", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle.png`);
        const image = new PngImage(inputBuffer);
        expect(image.width).toBe(32);
        expect(image.height).toBe(16);
        expect(image.bytesPerPixel).toBe(3);
        expect(image.toIndex(1, 0)).toEqual(3);
        expect(image.toIndex(5, 10)).toEqual(32 * 3 * 10 + 3 * 5);
        expect(image.toIndex(31, 15)).toEqual(image.data.length - 3);
    });

    it("converts Index to XY coordinates", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle.png`);
        const image = new PngImage(inputBuffer);
        expect(image.width).toBe(32);
        expect(image.height).toBe(16);
        expect(image.bytesPerPixel).toBe(3);
        expect(image.toIndex(1, 0)).toEqual(3);
        expect(image.toIndex(5, 10)).toEqual(32 * 3 * 10 + 3 * 5);
        expect(image.toIndex(31, 15)).toEqual(image.data.length - 3);
    });

    [
        {
            colorType: ColorType.GRAY_SCALE,
            file: `${__dirname}/fixtures/grayscale-gradient-16px.png`,
            checker: isColorGrayScale,
        },
        {
            colorType: ColorType.GRAY_SCALE_ALPHA,
            file: `${__dirname}/fixtures/grayscale-alpha-gradient-16px.png`,
            checker: isColorGrayScaleAlpha,
        },
        {
            colorType: ColorType.RGB,
            file: `${__dirname}/fixtures/orange-rectangle.png`,
            checker: isColorRGB,
        },
        {
            colorType: ColorType.RGBA,
            file: `${__dirname}/fixtures/opaque-rectangle.png`,
            checker: isColorRGBA,
        },
        {
            colorType: ColorType.PALETTE,
            file: `${__dirname}/fixtures/indexed-16px.png`,
            checker: isColorPalette,
        },
    ].forEach(({ colorType, file, checker }) => {
        it(`detects the correct color with an image of color type ${colorType}`, () => {
            const inputBuffer = readFileSync(file);
            const image = new PngImage(inputBuffer);
            expect(image.colorType).toBe(colorType);
            const color = image.at(10, 10);
            expect(checker(color)).toBe(true);
            expect(color).toMatchSnapshot();
        });
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
