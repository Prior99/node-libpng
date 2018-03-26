export type ColorPalette = [number] & { index: number };

export function colorPalette(index: number): ColorPalette {
    const color = [index];
    Object.defineProperty(color, "index", { get() { return this[0]; } });
    return color as ColorPalette;
}

export function isColorPalette(color: any): color is ColorPalette {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 1) { return false; }
    if (typeof (color as any).index !== "number") { return false; }
    return true;
}
