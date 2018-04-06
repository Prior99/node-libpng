import { encode, writePngFile, writePngFileSync } from "..";
import { readFileSync } from "fs";

const someGradient = Buffer.alloc(256 * 256 * 3);
for (let x = 0; x < 256; ++x) {
    for (let y = 0; y < 256; ++y) {
        const index = (y * 256 + x) * 3;
        someGradient[index + 0] = x;
        someGradient[index + 1] = y;
        someGradient[index + 2] = 0;
    }
}

const someOrangeRectangle = Buffer.alloc(16 * 8 * 3);
for (let index = 0; index < someOrangeRectangle.length; index += 3) {
    someOrangeRectangle[index + 0] = 255;
    someOrangeRectangle[index + 1] = 128;
    someOrangeRectangle[index + 2] = 64;
}

const someOpaqueSquare = Buffer.alloc(16 * 16 * 4);
for (let index = 0; index < someOpaqueSquare.length; index += 4) {
    someOpaqueSquare[index + 0] = 64;
    someOpaqueSquare[index + 1] = 128;
    someOpaqueSquare[index + 2] = 64;
    someOpaqueSquare[index + 3] = 128;
}

describe("encode", () => {
    it("encodes a png", () => {
        const encoded = encode(someGradient, {
            width: 256,
            height: 256,
        });
        expect(encoded.toString("hex")).toMatchSnapshot();
    });

    it("encodes a png with an alpha channel", () => {
        const encoded = encode(someOpaqueSquare, {
            width: 16,
            height: 16,
        });
        expect(encoded.toString("hex")).toMatchSnapshot();
    });

    it("throws an error when trying to encode something which isn't a buffer", () => {
        const options = {
            width: 16,
            height: 16,
        };
        expect(() => encode("something" as any, options)).toThrowErrorMatchingSnapshot();
    });

    [
        {
            width: 16,
            height: 8,
        },
    ].forEach(options => {
        it(`encodes a PNG with ${JSON.stringify(options)} as options`, () => {
            expect(encode(someOrangeRectangle, options).toString("hex")).toMatchSnapshot();
        });
    });

    [
        {
            width: 20,
        },
        {},
        null,
        undefined,
        "string",
        {
            width: "twenty",
            height: 10,
        },
        {
            width: 0,
            height: 0,
        },
        {
            width: 20,
            height: 1.5,
        },
        {
            width: 1.5,
            height: 20,
        },
        {
            width: 1000,
            height: 1000,
        },
    ].forEach(options => {
        it(`throws an error with bad options ${JSON.stringify(options)}`, () => {
            expect(() => encode(someOrangeRectangle, options as any)).toThrowErrorMatchingSnapshot();
        });
    });
});

describe("writePngFileSync", () => {
    it("encodes a PNG and writes it to disk", () => {
        const options = { width: 16, height: 8 };
        const encoded = encode(someOrangeRectangle, options);
        const path = `${__dirname}/../../tmp-write-sync.png`;
        writePngFileSync(path, someOrangeRectangle, options);
        const fromDisk = readFileSync(path);
        expect(Array.from(fromDisk)).toEqual(Array.from(encoded));
    });
});

describe("writePngFile", () => {
    describe("using the Promise API", () => {
        it("encodes a PNG and writes it to disk", async () => {
            const options = { width: 16, height: 8 };
            const encoded = encode(someOrangeRectangle, options);
            const path = `${__dirname}/../../tmp-write-promise.png`;
            await writePngFile(path, someOrangeRectangle, options);
            const fromDisk = readFileSync(path);
            expect(Array.from(fromDisk)).toEqual(Array.from(encoded));
        });

        it("rejects with an error when encoding failed", async () => {
            const options = { width: 16, height: 8 };
            const path = `${__dirname}/../../tmp-write-promise-error-encoding.png`;
            expect(writePngFile(path, Buffer.alloc(2), options)).rejects.toMatchSnapshot();
        });

        it("rejects with an error when writing failed", async () => {
            const options = { width: 16, height: 8 };
            const path = `this-file/does/not/exist.png`;
            expect(writePngFile(path, someOrangeRectangle, options)).rejects.toBeTruthy();
        });
    });

    describe("using the callback API", () => {
        it("encodes a PNG and writes it to disk", done => {
            const options = { width: 16, height: 8 };
            const encoded = encode(someOrangeRectangle, options);
            const path = `${__dirname}/../../tmp-write-callback.png`;
            writePngFile(path, someOrangeRectangle, options, error => {
                expect(error).toBeNull();
                const fromDisk = readFileSync(path);
                expect(Array.from(fromDisk)).toEqual(Array.from(encoded));
                done();
            });
        });

        it("calls the callback with an error when encoding failed", done => {
            const options = { width: 16, height: 8 };
            const path = `${__dirname}/../../tmp-write-callback-error-encoding.png`;
            writePngFile(path, Buffer.alloc(2), options, error => {
                expect(error).toMatchSnapshot();
                done();
            });
        });

        it("calls the callback with an error when writing failed", done => {
            const options = { width: 16, height: 8 };
            const path = `this-file/does/not/exist.png`;
            writePngFile(path, someOrangeRectangle, options, error => {
                expect(error).toBeTruthy();
                done();
            });
        });
    });
});
