export type XY = [number, number] & { x: number, y: number };

/**
 * Creates a new set of 2D coordinates.
 *
 * @param x The x part of the coordinates.
 * @param y The y part of the coordinates.
 *
 * @return The new coordinates as an array which provides getters for `x` and `y`.
 */
export function xy(x: number, y: number): XY {
    const coordinates = [x, y];
    Object.defineProperty(coordinates, "x", { get() { return this[0]; } });
    Object.defineProperty(coordinates, "y", { get() { return this[1]; } });
    return coordinates as XY;
}

/**
 * Checks if the given parameter is a set of 2D coordinates.
 *
 * @param coordinates Parameter to check.
 *
 * @return `true` if the given parameter was a set of coordinates and `false` otherwise.
 */
export function isXY(coordinates: any): coordinates is XY {
    if (typeof coordinates !== "object" || !Array.isArray(coordinates)) { return false; }
    if (coordinates.length !== 2) { return false; }
    if (typeof (coordinates as any).x !== "number") { return false; }
    if (typeof (coordinates as any).y !== "number") { return false; }
    return true;
}
