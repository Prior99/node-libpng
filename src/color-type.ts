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
