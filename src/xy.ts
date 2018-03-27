export type XY = [number, number] & { x: number, y: number };

export function xy(x: number, y: number): XY {
    const coordinates = [x, y];
    Object.defineProperty(coordinates, "x", { get() { return this[0]; } });
    Object.defineProperty(coordinates, "y", { get() { return this[1]; } });
    return coordinates as XY;
}

export function isXY(coordinates: any): coordinates is XY {
    if (typeof coordinates !== "object" || !Array.isArray(coordinates)) { return false; }
    if (coordinates.length !== 2) { return false; }
    if (typeof (coordinates as any).x !== "number") { return false; }
    if (typeof (coordinates as any).y !== "number") { return false; }
    return true;
}
