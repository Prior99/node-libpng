import { encode } from "..";
import { writeFileSync } from "fs";

describe("encode", () => {
    it("encodes a png", () => {
        const buffer = Buffer.alloc(256 * 256 * 3);
        for (let x = 0; x < 256; ++x) {
            for (let y = 0; y < 256; ++y) {
                const index = (y * 256 + x) * 3;
                buffer[index + 0] = x;
                buffer[index + 1] = y;
                buffer[index + 2] = 0;
            }
        }
        const encoded = encode(buffer, {
            width: 256,
            height: 256,
            alpha: false,
        });
        expect(buffer.toString("hex")).toMatchSnapshot();
    });
});
