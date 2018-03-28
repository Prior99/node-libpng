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

/**
 * Converts the native time from the libpng bindings into a javascript `Date` object.
 *
 * @param nativeTime The time as returned by the bindings.
 *
 * @return The time converted to a javascript `Date` object or `undefined` if the time was
 *         not set in the PNG's header.
 */
function convertNativeTime(nativeTime: any): Date {
    if (!nativeTime) { return; }
    const { year, month, day, hour, minute, second } = nativeTime;
    return new Date(year, month, day, hour, minute, second);
}

/**
 * Converts the background color from the libpng bindings into a color.
 *
 * @param nativeBackgroundColor The background color as returned by the native bindings.
 * @param colorType The color type of the image of which the background color should be converted.
 *
 * @return The converted background color in `ColorRGB`, `ColorPalette` or `ColorGrayScale` format
 *         or undefined if the background color was not set in the PNG.
 */
function convertNativeBackgroundColor(
    nativeBackgroundColor: any,
    colorType: ColorType,
): ColorRGB | ColorGrayScale | ColorPalette {
    if (!nativeBackgroundColor) { return; }
    switch (colorType) {
        case ColorType.GRAY_SCALE:
        case ColorType.GRAY_SCALE_ALPHA:
            return colorGrayScale(nativeBackgroundColor.gray);
        case ColorType.PALETTE:
            return colorPalette(nativeBackgroundColor.index);
        case ColorType.RGB:
        case ColorType.RGBA:
            const { red, green, blue } = nativeBackgroundColor;
            return colorRGB(red, green, blue);
        default:
            return undefined;
    }
}

/**
 * Converts a native palette as returned by the bindings into a Map.
 *
 * @param nativePalette The native palette which should be converted.
 *
 * @return The palette as a `Palette` (Javascript Map with the key being the palette index and
 *         the value being a color.
 */
function convertNativePalette(nativePalette: any): Palette {
    if (!nativePalette) { return; }
    return nativePalette.reduce((result: Palette, current: any, index: number) => {
        result.set(index, colorRGB(current.red, current.green, current.blue));
        return result;
    }, new Map<number, ColorRGB>());
}

/**
 * Decodes and wraps a PNG image. Will call the native bindings under the hood and provides
 * a high-level access to read- and write operations on the image.
 */
export class PngImage {
    constructor(buffer: Buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error("Error decoding PNG. Input is not a buffer.");
        }
        const nativePng = new __native_PngImage(buffer);
        this.bitDepth = nativePng.bitDepth;
        this.channels = nativePng.channels;
        this.colorType = nativePng.colorType;
        this.height = nativePng.height;
        this.width = nativePng.width;
        this.interlaceType = nativePng.interlaceType;
        this.rowBytes = nativePng.rowBytes;
        this.offsetX = nativePng.offsetX;
        this.offsetY = nativePng.offsetY;
        this.pixelsPerMeterX = nativePng.pixelsPerMeterX;
        this.pixelsPerMeterY = nativePng.pixelsPerMeterY;
        this.data = nativePng.data;
        this.palette = convertNativePalette(nativePng.palette);
        this.gamma = nativePng.gamma;
        this.time = convertNativeTime(nativePng.time);
        this.backgroundColor = convertNativeBackgroundColor(nativePng.backgroundColor, this.colorType);
    }

    /**
     * The bit depth of the image.
     * Gathered from `png_get_bit_depth`.
     */
    public readonly bitDepth: number;

    /**
     * The amount of channels of the image.
     * Gathered from `png_get_channels`.
     */
    public readonly channels: number;

    /**
     * The color type of the image as a string.
     * Gathered from `png_get_color_type`.
     */
    public readonly colorType: ColorType;

    /**
     * The width of the image.
     * Gathered from `png_get_image_height`.
     */
    public readonly height: number;

    /**
     * The width of the image.
     * Gathered from `png_get_image_width`.
     */
    public readonly width: number;

    /**
     * The interlace type of the image as a string, gathered from `png_get_interlace_type`.
     */
    public readonly interlaceType: InterlaceType;

    /**
     * The amount of bytes per row of the image.
     * Gathered from `png_get_rowbytes`.
     */
    public readonly rowBytes: number;

    /**
     * The horizontal offset of the image.
     * Gathered from `png_get_x_offset_pixels`.
     */
    public readonly offsetX: number;

    /**
     * The vertical offset of the image.
     * Gathered from `png_get_y_offset_pixels`.
     */
    public readonly offsetY: number;

    /**
     * The horizontal amount of pixels per meter of the image.
     * Gathered from `png_get_x_pixels_per_meter`.
     */
    public readonly pixelsPerMeterX: number;

    /**
     * The vertical amount of pixels per meter of the image.
     * Gathered from `png_get_y_pixels_per_meter`.
     */
    public readonly pixelsPerMeterY: number;

    /**
     * The buffer containing the data of the decoded image.
     */
    public readonly data: Buffer;

    /**
     * Returns the last modification time as returned by `png_get_tIME`.
     */
    public readonly time: Date;

    /**
     * Returns the background color of the image if provided in the header.
     */
    public readonly backgroundColor: ColorRGB | ColorGrayScale | ColorPalette;

    /**
     * Retrieve the palette of this image if the color type is `ColorType.PALETTE`.
     *
     * @see ColorType
     */
    public readonly palette: Palette;

    /**
     * The gamma value of the image.
     * Gathered from `png_get_gAMA`.
     */
    public readonly gamma: number;

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
        const bytesPerColor = Math.ceil(this.bitDepth / 8);
        switch (this.colorType) {
            case ColorType.GRAY_SCALE_ALPHA:
                return 2 * bytesPerColor;
            case ColorType.RGBA:
                return 4 * bytesPerColor;
            case ColorType.GRAY_SCALE:
            case ColorType.PALETTE:
                return 1 * bytesPerColor;
            case ColorType.RGB:
                return 3 * bytesPerColor;
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
