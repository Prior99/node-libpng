export type ColorGrayScale = [number] & { gray: number };

export function colorGrayScale(gray: number): ColorGrayScale {
    const color = [gray];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    return color as ColorGrayScale;
}

export function isColorGrayScale(color: any): color is ColorGrayScale {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 1) { return false; }
    if (typeof (color as any).gray !== "number") { return false; }
    return true;
}
