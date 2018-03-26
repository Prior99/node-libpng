export type ColorRGBA = [number, number, number, number] & { r: number, g: number, b: number, a: number };

export function colorRGBA(r: number, g: number, b: number, a: number): ColorRGBA {
    const color = [r, g, b, a];
    Object.defineProperty(color, "r", { get() { return this[0]; } });
    Object.defineProperty(color, "g", { get() { return this[1]; } });
    Object.defineProperty(color, "b", { get() { return this[2]; } });
    Object.defineProperty(color, "a", { get() { return this[3]; } });
    return color as ColorRGBA;
}

export function isColorRGBA(color: any): color is ColorRGBA {
    if (typeof color !== "object" || !Array.isArray(color)) { return false; }
    if (color.length !== 4) { return false; }
    if (typeof (color as any).r !== "number") { return false; }
    if (typeof (color as any).g !== "number") { return false; }
    if (typeof (color as any).b !== "number") { return false; }
    if (typeof (color as any).a !== "number") { return false; }
    return true;
}
