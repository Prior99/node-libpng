export type ColorGrayScaleA = [number, number] & { gray: number, a: number };

export function colorGrayScaleA(gray: number, a: number): ColorGrayScaleA {
    const color = [gray, a];
    Object.defineProperty(color, "gray", { get() { return this[0]; } });
    Object.defineProperty(color, "a", { get() { return this[1]; } });
    return color as ColorGrayScaleA;
}

export function isColorGrayScaleA(color: any): color is ColorGrayScaleA {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 2) { return false; }
    if (typeof (color as any).gray !== "number") { return false; }
    if (typeof (color as any).a !== "number") { return false; }
    return true;
}
