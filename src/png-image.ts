import { encode, writePngFile, writePngFileSync, WritePngFileCallback } from "./encode";
import {
    colorRGB,
    ColorRGB,
    colorRGBA,
    ColorRGBA,
    colorGrayScale,
    ColorGrayScale,
    colorGrayScaleA,
    ColorGrayScaleA,
    colorPalette,
    ColorPalette,
} from "./colors";
import { __native_PngImage } from "./native";

/**
 * The color type from libpng represented as a string.
 * This describes how the actual image pixels are defined.
 */
export enum ColorType {
    /**
     * Libpng color type `PNG_COLOR_TYPE_GRAY` (0).
     */
    GRAY = "gray",
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
    GRAY_ALPHA = "gray-alpha",
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
            case ColorType.GRAY_ALPHA:
                return true;
            default:
                return false;
        }
    }

    public get bytesPerPixel(): number {
        switch (this.colorType) {
            case ColorType.GRAY_ALPHA:
                return 2;
            case ColorType.RGBA:
                return 4;
            case ColorType.GRAY:
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
        const { year, month, day, hour, minute, second } = this.nativePng.time;
        return new Date(year, month, day, hour, minute, second);
    }

    public get backgroundColor(): ColorRGB | ColorGrayScale | ColorPalette {
        const color = this.nativePng.backgroundColor;
        switch (this.colorType) {
            case ColorType.GRAY:
            case ColorType.GRAY_ALPHA:
                return colorGrayScale(color.gray);
            case ColorType.PALETTE:
                return colorPalette(color.index);
            case ColorType.RGB:
            case ColorType.RGBA:
                return colorRGB(color.r, color.g, color.b);
            default:
                return undefined;
        }
    }

    public toIndex(x: number, y: number) {
        return (x + y * this.rowBytes);
    }

    public toXY(index: number) {
        const colorIndex = index / this.bytesPerPixel;
        const x = Math.floor(colorIndex % this.width);
        const y = Math.floor(colorIndex / this.width);
        return [x, y];
    }

    public at(x: number, y: number): ColorRGB | ColorRGBA | ColorGrayScale | ColorGrayScaleA | ColorPalette  {
        const index = this.toIndex(x, y);
        const { data } = this;
        switch (this.colorType) {
            case ColorType.GRAY:
                return colorGrayScale(data[index]);
            case ColorType.GRAY_ALPHA:
                return colorGrayScaleA(data[index], data[index + 1]);
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
