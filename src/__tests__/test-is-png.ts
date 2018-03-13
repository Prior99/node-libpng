import { isPng } from "..";
import { readFileSync } from "fs";

describe("isPng", () => {
    it("detects a png file as png", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.png`);
        expect(isPng(buffer)).toBe(true);
    });

    it("detects a jpg file to not be a png file", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/red-blue-gradient-256px.jpg`);
        expect(isPng(buffer)).toBe(false);
    });

    it("detects a text file to not be a png file", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/text-file.txt`);
        expect(isPng(buffer)).toBe(false);
    });

    it("detects an empty file to not be a png file", () => {
        const buffer = readFileSync(`${__dirname}/fixtures/empty-file.txt`);
        expect(isPng(buffer)).toBe(false);
    });
});
