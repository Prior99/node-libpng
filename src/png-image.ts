import { encode, writePngFile, writePngFileSync, WritePngFileCallback } from "./encode";
import {
    colorRGB,
    ColorRGB,
    colorRGBA,
    ColorRGBA,
    colorGrayScale,
    ColorGrayScale,
    colorGrayScaleAlpha,
    ColorGrayScaleAlpha,
    colorPalette,
    ColorPalette,
    Palette,
    convertToRGBA,
} from "./colors";
import { xy, XY } from "./xy";
import { __native_PngImage } from "./native";

/**
 * The color type from libpng represented as a string.
 * This describes how the actual image pixels are defined.
 */
export enum ColorType {
    /**
     * Libpng color type `PNG_COLOR_TYPE_GRAY` (0).
     */
    GRAY_SCALE = "gray-scale",
    /**
     * Libpng color type `PNG_COLOR_TYPE_RGB` (2).
     */
    RGB = "rgb",
    /**
     * Libpng color type `PNG_COLOR_TYPE_PALETTE` (3).
     */
    PALETTE = "palette",
    /**
     * Libpng color type `PNG_COLOR_TYPE_GRAY_ALPHA` (4).
     */
    GRAY_SCALE_ALPHA = "gray-scale-alpha",
    /**
     * Libpng color type `PNG_COLOR_TYPE_RGB_ALPHA ` (6).
     */
    RGBA = "rgba",
    /**
     * Color type parsing failed.
     */
    UNKNOWN = "unknown",
}

/**
 * The interlace type from libpng.
 */
export enum InterlaceType {
    /**
     * Libpng interlace type `PNG_INTERLACE_NONE` (0).
     */
    NONE = "none",
    /**
     * Libpng interlace type `PNG_INTERLACE_ADAM7` (1).
     */
    ADAM7 = "adam7",
    /**
     * Interlace type parsing failed.
     */
    UNKNOWN = "unknown",
}

export class PngImage {
    private nativePng: any;

    constructor(buffer: Buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error("Error decoding PNG. Input is not a buffer.");
        }
        this.nativePng = new __native_PngImage(buffer);
    }

    /**
     * The bit depth of the image.
     * Gathered from `png_get_bit_depth`.
     */
    public get bitDepth(): number { return this.nativePng.bitDepth; }

    /**
     * The amount of channels of the image.
     * Gathered from `png_get_channels`.
     */
    public get channels(): number { return this.nativePng.channels; }

    /**
     * The color type of the image as a string.
     * Gathered from `png_get_color_type`.
     */
    public get colorType(): ColorType { return this.nativePng.colorType; }

    /**
     * The width of the image.
     * Gathered from `png_get_image_height`.
     */
    public get height(): number { return this.nativePng.height; }

    /**
     * The width of the image.
     * Gathered from `png_get_image_width`.
     */
    public get width(): number { return this.nativePng.width; }

    /**
     * The interlace type of the image as a string, gathered from `png_get_interlace_type`.
     */
    public get interlaceType(): InterlaceType { return this.nativePng.interlaceType; }

    /**
     * The amount of bytes per row of the image.
     * Gathered from `png_get_rowbytes`.
     */
    public get rowBytes(): number { return this.nativePng.rowBytes; }

    /**
     * The horizontal offset of the image.
     * Gathered from `png_get_x_offset_pixels`.
     */
    public get offsetX(): number { return this.nativePng.offsetX; }

    /**
     * The vertical offset of the image.
     * Gathered from `png_get_y_offset_pixels`.
     */
    public get offsetY(): number { return this.nativePng.offsetY; }

    /**
     * The horizontal amount of pixels per meter of the image.
     * Gathered from `png_get_x_pixels_per_meter`.
     */
    public get pixelsPerMeterX(): number { return this.nativePng.pixelsPerMeterX; }

    /**
     * The vertical amount of pixels per meter of the image.
     * Gathered from `png_get_y_pixels_per_meter`.
     */
    public get pixelsPerMeterY(): number { return this.nativePng.pixelsPerMeterY; }

    /**
     * The buffer containing the data of the decoded image.
     */
    public get data(): Buffer { return this.nativePng.data; }

    /**
     * Will be `true` if the image's color type has an alpha channel and `false` otherwise.
     */
    public get alpha(): boolean {
        switch (this.colorType) {
            case ColorType.RGBA:
            case ColorType.GRAY_SCALE_ALPHA:
                return true;
            default:
                return false;
        }
    }

    /**
     * Returns the amount of bytes per pixel (depending on the color type) for the image.
     */
    public get bytesPerPixel(): number {
        switch (this.colorType) {
            case ColorType.GRAY_SCALE_ALPHA:
                return 2;
            case ColorType.RGBA:
                return 4;
            case ColorType.GRAY_SCALE:
            case ColorType.PALETTE:
                return 1;
            case ColorType.RGB:
                return 3;
            default:
                return undefined;
        }
    }

    /**
     * Returns the last modification time as returned by `png_get_tIME`.
     */
    public get time(): Date {
        const { time } = this.nativePng;
        if (!time) { return; }
        const { year, month, day, hour, minute, second } = time;
        return new Date(year, month, day, hour, minute, second);
    }

    /**
     * Returns the background color of the image if provided in the header.
     */
    public get backgroundColor(): ColorRGB | ColorGrayScale | ColorPalette {
        const { backgroundColor } = this.nativePng;
        if (!backgroundColor) { return; }
        switch (this.colorType) {
            case ColorType.GRAY_SCALE:
            case ColorType.GRAY_SCALE_ALPHA:
                return colorGrayScale(backgroundColor.gray);
            case ColorType.PALETTE:
                return colorPalette(backgroundColor.index);
            case ColorType.RGB:
            case ColorType.RGBA:
                return colorRGB(backgroundColor.red, backgroundColor.green, backgroundColor.blue);
            default:
                return undefined;
        }
    }

    /**
     * Convert a set of coordinates to index in the buffer.
     */
    public toIndex(x: number, y: number) {
        return (x + y * this.width) * this.bytesPerPixel;
    }

    /**
     * Convert an index in the buffer to a set of coordinates.
     */
    public toXY(index: number): XY {
        const colorIndex = index / this.bytesPerPixel;
        const x = Math.floor(colorIndex % this.width);
        const y = Math.floor(colorIndex / this.width);
        return xy(x, y);
    }

    /**
     * Retrieves the color in the image's color format at the specified position.
     *
     * @param x The x position of the pixel in the image of which to retrieve the color.
     * @param y The y position of the pixel in the image of which to retrieve the color.
     *
     * @return The color at the given pixel in the image's color format.
     */
    public at(x: number, y: number): ColorRGB | ColorRGBA | ColorGrayScale | ColorGrayScaleAlpha | ColorPalette  {
        const index = this.toIndex(x, y);
        const { data } = this;
        switch (this.colorType) {
            case ColorType.GRAY_SCALE:
                return colorGrayScale(data[index]);
            case ColorType.GRAY_SCALE_ALPHA:
                return colorGrayScaleAlpha(data[index], data[index + 1]);
            case ColorType.PALETTE:
                return colorPalette(data[index]);
            case ColorType.RGB:
                return colorRGB(data[index], data[index + 1], data[index + 2]);
            case ColorType.RGBA:
                return colorRGBA(data[index], data[index + 1], data[index + 2], data[index + 3]);
            default:
                return undefined;
        }
    }

    /**
     * Retrieves the color in rgba format, converting from the image's color format.
     * This will automatically convert from indexed or grayscale images to rgba. If
     * the image's color format doesn't provide an alpha channel, `0` is returned as alpha.
     *
     * @param x The x position of the pixel in the image of which to retrieve the color.
     * @param y The y position of the pixel in the image of which to retrieve the color.
     *
     * @return The color at the given pixel in rgba format.
     */
    public rgbaAt(x: number, y: number): ColorRGBA {
        return convertToRGBA(this.at(x, y), this.palette);
    }

    /**
     * Retrieve the palette of this image if the color type is `ColorType.PALETTE`.
     *
     * @see ColorType
     *
     * @return The palette or `undefined` if a different color type was used.
     */
    public get palette(): Palette {
        const palette = this.nativePng.palette;
        if (!palette) { return; }
        return palette.reduce((result: Palette, current: any, index: number) => {
            result.set(index, colorRGB(current.red, current.green, current.blue));
            return result;
        }, new Map<number, ColorRGB>());
    }

    /**
     * The gamma value of the image.
     * Gathered from `png_get_gAMA`.
     */
    public get gamma(): number { return this.nativePng.gamma; }

    /**
     * Will encode this image to a PNG buffer.
     */
    public encode(): Buffer {
        const { alpha, width, height } = this;
        if (this.colorType !== ColorType.RGB && this.colorType !== ColorType.RGBA) {
            throw new Error("Can only encode images with RGB or RGBA color type.");
        }
        return encode(this.data, { width, height, alpha });
    }

    /**
     * Will encode this image and write it to the file at the specified path.
     *
     * @param path Path to the file to which the encoded PNG should be written.
     * @param callback An optional callback to use instead of the Promise API.
     *
     * @see writePngFile
     *
     * @return A Promise which resolves once the file is written or `undefined` if a callback was specified.
     */
    public write(path: string, callback?: WritePngFileCallback): Promise<void> | void {
        const { alpha, width, height } = this;
        if (this.colorType !== ColorType.RGB && this.colorType !== ColorType.RGBA) {
            throw new Error("Can only encode images with RGB or RGBA color type.");
        }
        return writePngFile(path, this.data, { width, height, alpha }, callback);
    }

    /**
     * Will encode this image and write it to the file at the specified path synchroneously.
     *
     * @param path Path to the file to which the encoded PNG should be written.
     *
     * @see writePngFileSync
     */
    public writeSync(path: string): void {
        const { alpha, width, height } = this;
        if (this.colorType !== ColorType.RGB && this.colorType !== ColorType.RGBA) {
            throw new Error("Can only encode images with RGB or RGBA color type.");
        }
        return writePngFileSync(path, this.data, { width, height, alpha });
    }
}
