export type ColorRGB = [number, number, number] & { r: number, g: number, b: number };

export function colorRGB(r: number, g: number, b: number): ColorRGB {
    const color = [r, g, b];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    return color as ColorRGB;
}

export type ColorRGBA = [number, number, number, number] & { r: number, g: number, b: number, a: number };

export function colorRGBA(r: number, g: number, b: number, a: number): ColorRGBA {
    const color = [r, g, b, a];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    Object.defineProperty(color, "a", { get() { return this[3]; } });
    return color as ColorRGBA;
}

export type ColorGrayScale = [number] & { gray: number };

export function colorGrayScale(gray: number): ColorGrayScale {
    const color = [gray];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    return color as ColorGrayScale;
}

export type ColorGrayScaleA = [number, number] & { gray: number, a: number };

export function colorGrayScaleA(gray: number, a: number): ColorGrayScaleA {
    const color = [gray, a];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    Object.defineProperty(color, "a", { get() { return this[1]; } });
    return color as ColorGrayScaleA;
}

export type ColorPalette = [number] & { index: number };

export function colorPalette(index: number): ColorPalette {
    const color = [index];
    Object.defineProperty(color, "index", { get() { return this[0]; } });
    return color as ColorPalette;
}
