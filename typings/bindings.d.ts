interface Bindings {
    readonly __native_isPng: (buffer: Buffer) => boolean;
    readonly __native_PngImage: any;
}

declare function bindings(bindingName: string): Bindings;

export = bindings;
