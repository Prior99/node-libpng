import { XY, xy, isXY } from "./xy";

export type Rect = [number, number, number, number] & {
    x: number,
    y: number,
    width: number,
    height: number,
    offset: XY,
    dimensions: XY,
};

/**
 * Creates a rectangle.
 *
 * @param offset The coordinates by which the rectangle is offset, top left corner.
 * @param dimenstions The dimensions of the rectangle.
 *
 * @return The created rectangle as an array with getters for the offset as coordinates or raw
 *         number as well as the dimensions.
 */
export function rect(x: number, y: number, width: number, height: number): Rect;
export function rect(offset: XY, dimensions: XY): Rect;
export function rect(arg1: XY | number, arg2: XY | number, arg3?: number, arg4?: number): Rect {
    let x, y, width, height;
    if (isXY(arg1) && isXY(arg2)) {
        x = arg1.x;
        y = arg1.y;
        width = arg2.x;
        height = arg2.y;
    } else {
        x = arg1;
        y = arg2;
        width = arg3;
        height = arg4;
    }
    const newRect = [x, y, width, height];
    Object.defineProperty(newRect, "x", { get() { return this[0]; } });
    Object.defineProperty(newRect, "y", { get() { return this[1]; } });
    Object.defineProperty(newRect, "width", { get() { return this[2]; } });
    Object.defineProperty(newRect, "height", { get() { return this[3]; } });
    Object.defineProperty(newRect, "offset", { get() { return xy(this[0], this[1]); } });
    Object.defineProperty(newRect, "dimensions", { get() { return xy(this[2], this[3]); } });
    return newRect as Rect;
}

/**
 * Checks if the given parameter is a rectangle.
 *
 * @param toCheck Parameter to check.
 *
 * @return `true` if the given parameter was a rectangle and `false` otherwise.
 */
export function isRect(toCheck: any): toCheck is Rect {
    if (typeof toCheck !== "object" || !Array.isArray(toCheck)) { return false; }
    if (toCheck.length !== 4) { return false; }
    if (typeof (toCheck as any).x !== "number") { return false; }
    if (typeof (toCheck as any).y !== "number") { return false; }
    if (typeof (toCheck as any).width !== "number") { return false; }
    if (typeof (toCheck as any).height !== "number") { return false; }
    if (!isXY((toCheck as any).offset)) { return false; }
    if (!isXY((toCheck as any).dimensions)) { return false; }
    return true;
}
