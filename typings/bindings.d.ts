declare class PngImage {
    public bitDepth: number;
    public channels: number;
    public colorType: number;
    public height: number;
    public width: number;
    public interlaceType: number;
    public rowBytes: number;
    public lastModification: number;
    public offsetX: number;
    public offsetY: number;
    public pixelsPerMeterX: number;
    public pixelsPerMeterY: number;
}

interface Bindings {
    readonly isPng: (buffer: Buffer) => boolean;
    readonly PngImage: PngImage;
}

declare function bindings(bindingName: string): Bindings;

export = bindings;
