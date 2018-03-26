export type ColorRGB = [number, number, number] & { r: number, g: number, b: number };

export function colorRGB(r: number, g: number, b: number): ColorRGB {
    const color = [r, g, b];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    return color as ColorRGB;
}

export function isColorRGB(color: any): color is ColorRGB {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 3) { return false; }
    if (typeof (color as any).r !== "number") { return false; }
    if (typeof (color as any).g !== "number") { return false; }
    if (typeof (color as any).b !== "number") { return false; }
    return true;
}
