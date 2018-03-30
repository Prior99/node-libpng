import { readFileSync } from "fs";
import { PngImage, convertNativeBackgroundColor, convertNativeTime } from "../png-image";
import { ColorType } from "../color-type";
import { xy } from "../xy";
import { rect } from "../rect";
import {
    isColorRGB,
    isColorRGBA,
    isColorPalette,
    isColorGrayScale,
    isColorGrayScaleAlpha,
    colorRGB,
    colorRGBA,
} from "../colors";
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
        expect(image.gamma).toBeUndefined();
        expect(image.time).toBeUndefined();
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

    describe("reading the background color", () => {
        it("with rgb/rgba color mode", () => {
            const inputBuffer = readFileSync(`${__dirname}/fixtures/background-color.png`);
            const { backgroundColor } = new PngImage(inputBuffer);
            expect(backgroundColor).toEqual([255, 128, 64]);
        });

        it("with gray scale color mode", () => {
            const inputBuffer = readFileSync(`${__dirname}/fixtures/grayscale-background.png`);
            const { backgroundColor } = new PngImage(inputBuffer);
            expect(backgroundColor).toEqual([0]);
        });

        it("with indexed color mode", () => {
            const inputBuffer = readFileSync(`${__dirname}/fixtures/indexed-background.png`);
            const { backgroundColor } = new PngImage(inputBuffer);
            expect(backgroundColor).toEqual([0]);
        });
    });

    it("reads the time of an image with the time specified in the header", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle-time.png`);
        const { time } = new PngImage(inputBuffer);
        expect(time).toEqual(new Date("2018-03-26T05:28:16.000Z"));
    });

    it("reads the gamma value of an image with the gamma value specified in the header", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle-gamma-background.png`);
        const { gamma } = new PngImage(inputBuffer);
        expect(gamma).toEqual(0.45455);
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

    describe("checking for alpha channel", () => {
        it("detects an alpha channel if present", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/opaque-rectangle.png`));
            expect(somePngImage.alpha).toBe(true);
        });

        it("detects no alpha channel if not present", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/orange-rectangle.png`));
            expect(somePngImage.alpha).toBe(false);
        });
    });

    [
        {
            colorType: ColorType.GRAY_SCALE,
            file: `${__dirname}/fixtures/grayscale-gradient-16px.png`,
            checker: isColorGrayScale,
            rgbaColor: [85, 85, 85, 255],
        },
        {
            colorType: ColorType.GRAY_SCALE_ALPHA,
            file: `${__dirname}/fixtures/grayscale-alpha-gradient-16px.png`,
            checker: isColorGrayScaleAlpha,
            rgbaColor: [85, 85, 85, 127],
        },
        {
            colorType: ColorType.RGB,
            file: `${__dirname}/fixtures/orange-rectangle.png`,
            checker: isColorRGB,
            rgbaColor: [255, 128, 64, 255],
        },
        {
            colorType: ColorType.RGBA,
            file: `${__dirname}/fixtures/opaque-rectangle.png`,
            checker: isColorRGBA,
            rgbaColor: [255, 128, 64, 127],
        },
        {
            colorType: ColorType.PALETTE,
            file: `${__dirname}/fixtures/indexed-16px.png`,
            checker: isColorPalette,
            rgbaColor: [255, 64, 128, 255],
        },
    ].forEach(({ colorType, file, checker, rgbaColor }) => {
        it(`detects the correct color with an image of color type ${colorType}`, () => {
            const inputBuffer = readFileSync(file);
            const image = new PngImage(inputBuffer);
            expect(image.colorType).toBe(colorType);
            const color = image.at(10, 10);
            expect(checker(color)).toBe(true);
            expect(color).toMatchSnapshot();
        });

        it(`reads the correct in rgba format with an image of color type ${colorType}`, () => {
            const inputBuffer = readFileSync(file);
            const image = new PngImage(inputBuffer);
            expect(image.colorType).toBe(colorType);
            const color = image.rgbaAt(10, 10);
            expect(color).toEqual(rgbaColor);
        });
    });

    it("throws an error when reading a pixel outside of the image's dimensions", () => {
        const inputBuffer = readFileSync(`${__dirname}/fixtures/orange-rectangle.png`);
        const image = new PngImage(inputBuffer);
        expect(() => image.at(100, 100)).toThrowErrorMatchingSnapshot();
        expect(() => image.at(-1, -1)).toThrowErrorMatchingSnapshot();
    });

    describe("export methods", () => {
        const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/orange-rectangle.png`));
        const someGrayScalePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/grayscale-gradient-16px.png`));

        describe("encode", () => {
            it("encodes a PNG file with the colortype being RGB", () => {
                expect(somePngImage.encode().toString("hex")).toMatchSnapshot();
            });

            it("throws an error when trying to encode a non-RGB/RGBA image", () => {
                expect(() => someGrayScalePngImage.encode()).toThrowErrorMatchingSnapshot();
            });
        });

        describe("write", () => {
            it("writes a PNG file with the colortype being RGB", async () => {
                const path = `${__dirname}/../../tmp-png-image-write.png`;
                await somePngImage.write(path);
                const fromDisk = readFileSync(path);
                expect(fromDisk.toString("hex")).toMatchSnapshot();
            });

            it("throws an error when trying to write a non-RGB/RGBA image synchroneously", () => {
                expect(() => someGrayScalePngImage.writeSync("some/path")).toThrowErrorMatchingSnapshot();
            });
        });

        describe("writeSync", () => {
            it("writes a PNG file with the colortype being RGB", () => {
                const path = `${__dirname}/../../tmp-png-image-write-sync.png`;
                somePngImage.writeSync(path);
                const fromDisk = readFileSync(path);
                expect(fromDisk.toString("hex")).toMatchSnapshot();
            });

            it("throws an error when trying to write a non-RGB/RGBA image", () => {
                expect(() => someGrayScalePngImage.write("some/path")).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe("resizing the canvas", () => {
        it("resizes the canvas of a simple RGB image", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/orange-rectangle.png`));
            somePngImage.resizeCanvas({
                dimensions: xy(18, 18),
                offset: xy(10, 10),
                clip: rect(0, 0, 6, 6),
                fillColor: colorRGB(0, 0, 128),
            });
            expect(somePngImage.width).toBe(18);
            expect(somePngImage.height).toBe(18);
            expect(somePngImage.at(9, 9)).toEqual([0, 0, 128]);
            expect(somePngImage.at(10, 10)).toEqual([255, 128, 64]);
        });

        it("resizes the canvas of a bigger RGB image", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`));
            somePngImage.resizeCanvas({
                dimensions: xy(300, 100),
                offset: xy(22, 10),
                clip: rect(0, 0, 256, 80),
                fillColor: colorRGB(255, 255, 200),
            });
            expect(somePngImage.width).toBe(300);
            expect(somePngImage.height).toBe(100);
            expect(somePngImage.at(21, 9)).toEqual([255, 255, 200]);
            expect(somePngImage.at(272, 90)).toEqual([255, 255, 200]);
            expect(somePngImage.at(22, 10)).toEqual([255, 0, 0]);
            expect(somePngImage.at(277, 89)).toEqual([0, 0, 255]);
        });

        it("resizes the canvas to a huge region", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/opaque-rectangle.png`));
            somePngImage.resizeCanvas({
                dimensions: xy(400, 400),
                offset: xy(368, 192),
                clip: rect(0, 0, 32, 16),
            });
            expect(somePngImage.width).toBe(400);
            expect(somePngImage.height).toBe(400);
            expect(somePngImage.at(367, 191)).toEqual([0, 0, 0, 0]);
            expect(somePngImage.at(368, 192)).toEqual([255, 128, 64, 127]);
            expect(somePngImage.at(399, 207)).toEqual([255, 128, 64, 127]);
            expect(somePngImage.at(400, 208)).toEqual([0, 0, 0, 0]);
        });

        describe("invalid configuration", () => {
            const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`));

            it("throws an error if the fill color is invalid", () => {
                expect(() => somePngImage.resizeCanvas({ fillColor: null })).toThrowErrorMatchingSnapshot();
            });

            it("throws an error when the clip rectangle is out of range", () => {
                expect(() => {
                    somePngImage.resizeCanvas({
                        dimensions: xy(2000, 2000),
                        clip: rect(0, 0, 1000, 1000),
                    });
                }).toThrowErrorMatchingSnapshot();
            });

            it("throws an error when the clip rectangle uses invalid coordinates", () => {
                expect(() => {
                    somePngImage.resizeCanvas({ clip: rect(-1, -1, 10, 10) });
                }).toThrowErrorMatchingSnapshot();
            });

            it("throws an error when the dimensions are invalid", () => {
                expect(() => {
                    somePngImage.resizeCanvas({ dimensions: xy(0, 0) });
                }).toThrowErrorMatchingSnapshot();
            });

            it("throws an error when the offset is invalid", () => {
                expect(() => {
                    somePngImage.resizeCanvas({ offset: xy(-1, -1) });
                }).toThrowErrorMatchingSnapshot();
            });

            it("throws an error when the clipped rectangle exceeds the new canvas size", () => {
                expect(() => {
                    somePngImage.resizeCanvas({
                        offset: xy(3, 3),
                        dimensions: xy(5, 5),
                        clip: rect(0, 0, 3, 3),
                    });
                }).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe("with an unknown color type", () => {
        const somePngImage = new PngImage(readFileSync(`${__dirname}/fixtures/orange-rectangle.png`));
        somePngImage.colorType = ColorType.UNKNOWN;

        it("returns `undefined` when reading a pixel", () => {
            expect(somePngImage.at(0, 0)).toBeUndefined();
        });

        it("returns `undefined` for `bytesPerPixel`", () => {
            expect(somePngImage.bytesPerPixel).toBeUndefined();
        });

        it("returns `undefined` for `backgroundColor`", () => {
            expect(somePngImage.backgroundColor).toBeUndefined();
        });
    });
});

describe("convertNativeBackgroundColor", () => {
    it("converts a gray scale background color", () => {
        expect(convertNativeBackgroundColor({ gray: 100 }, ColorType.GRAY_SCALE)).toEqual([100]);
    });

    it("converts a gray scale alpha background color", () => {
        expect(
            convertNativeBackgroundColor({ gray: 100, alpha: 100 }, ColorType.GRAY_SCALE_ALPHA),
        ).toEqual([100]);
    });

    it("converts a rgb background color", () => {
        expect(
            convertNativeBackgroundColor({ red: 128, green: 100, blue: 72 }, ColorType.RGB),
        ).toEqual([128, 100, 72]);
    });

    it("converts a rgba background color", () => {
        expect(
            convertNativeBackgroundColor({ red: 128, green: 100, blue: 72, alpha: 100 }, ColorType.RGBA),
        ).toEqual([128, 100, 72]);
    });

    it("converts a palette background color", () => {
        expect(convertNativeBackgroundColor({ index: 0 }, ColorType.PALETTE)).toEqual([0]);
    });

    it("returns `undefined` for an invalid color type", () => {
        expect(convertNativeBackgroundColor({}, ColorType.UNKNOWN)).toBeUndefined();
    });
});

describe("convertNativeTime", () => {
    it("with the native time being `undefined` returns `undefined`", () => {
        expect(convertNativeTime(undefined)).toBeUndefined();
    });

    it("converts a time", () => {
        expect(
            convertNativeTime({
                year: 2017,
                month: 11,
                day: 20,
                hour: 12,
                minute: 15,
                second: 18,
            }),
        ).toEqual(new Date("2017-11-20T12:15:18Z"));
    });
});
