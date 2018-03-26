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

export function expectRedBlueGradient(data: Buffer) {
    for (let i = 0; i < data.length; i += 3) {
        // The image is of 256 pixel width.
        const x = (i / 3) % 256;
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        // The image is a gradient from red (255, 0, 0) to blue (0, 0, 255).
        expect(r).toBe(255 - x);
        expect(g).toBe(0);
        expect(b).toBe(x);
    }
}
