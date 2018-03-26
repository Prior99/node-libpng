export type ColorRGB = [number, number, number];
export type ColorRGBA = [number, number, number, number];

export function expectEveryPixel(buffer: Buffer, color: ColorRGB | ColorRGBA) {
    const alpha = color.length === 4;
    const bytesPerPixel = alpha ? 4 : 3;
    for (let index = 0; index < buffer.length; index += bytesPerPixel) {
        for (let colorIndex = 0; colorIndex < bytesPerPixel; ++colorIndex) {
            expect(buffer[index + colorIndex]).toBe(color[colorIndex]);
        }
    }
}
