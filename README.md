# node-libpng

[![npm](https://img.shields.io/npm/v/node-libpng.svg)](https://www.npmjs.com/package/node-libpng)
[![Build Status](https://travis-ci.org/Prior99/node-libpng.svg?branch=master)](https://travis-ci.org/Prior99/node-libpng)
[![Build status](https://ci.appveyor.com/api/projects/status/1dbpcj210jlyv0e1/branch/master?svg=true)](https://ci.appveyor.com/project/Prior99/node-libpng/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/Prior99/node-libpng/badge.svg?branch=master)](https://coveralls.io/github/Prior99/node-libpng?branch=master)

Unofficial bindings for node to libpng.

Please also refer to the **[Documentation](https://prior99.github.io/node-libpng/docs/index.html)**.

## Table of contents

 * [node-libpng](#node-libpng)
    * [Table of contents](#table-of-contents)
    * [Supported environments](#supported-environments)
    * [Usage](#usage)
       * [Reading (Decoding)](#reading-decoding)
           * [Reading PNG files using Promises](#reading-png-files-using-promises)
           * [Reading PNG files using a callback](#reading-png-files-using-a-callback)
           * [Reading PNG files synchroneously](#reading-png-files-synchroneously)
           * [Decoding a buffer](#decoding-a-buffer)
        * [Writing (Encoding)](#writing-encoding)
           * [Writing PNG files using Promises](#writing-png-files-using-promises)
           * [Writing PNG files using a callback](#writing-png-files-using-a-callback)
           * [Writing PNG files synchroneously](#writing-png-files-synchroneously)
           * [Encoding into a Buffer](#encoding-into-a-buffer)
    * [Benchmark](#benchmark)
       * [Read access (Decoding)](#read-access-decoding)
       * [Write access (Encoding)](#write-access-encoding)
       * [Pixel access](#pixel-access)
    * [Contributing](#contributing)
       * [Building](#building)
       * [Running the tests with coverage](#running-the-tests-with-coverage)
       * [Linting](#linting)
       * [Starting the example](#starting-the-example)
       * [Generating the libpng config](#generating-the-libpng-config)
    * [Contributors](#contributors)

## Supported environments

This is a native Addon to NodeJS which delivers prebuilt binaries. Only some environments are supported:

| Node Version      | Windows 64-Bit     | Windows 32-Bit     | Linux 64-Bit       | Linux 32-Bit | OSX                |
|-------------------|--------------------|--------------------|--------------------|--------------|--------------------|
| Earlier           | -                  | -                  | -                  | -            | -                  |
| Node 6 *(Abi 48)* | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | -            | :heavy_check_mark: |
| Node 7 *(Abi 51)* | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | -            | :heavy_check_mark: |
| Node 8 *(Abi 57)* | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | -            | :heavy_check_mark: |
| Node 9 *(Abi 59)* | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | -            | :heavy_check_mark: |

## Usage

### Reading (Decoding)

Multiple ways of reading and decoding PNG encoded images exist:

 * [readPngFile](https://prior99.github.io/node-libpng/docs/globals.html#readpngfile) Reads a PNG file and returns a [PngImage](file:///home/prior/repositories/prior99.github.io/node-libpng/docs/classes/pngimage.html) instance with the decoded data.
    * The function can take an optional argument for using a node-style callback API. [Example](#reading-png-files-using-a-callback)
    * The function will return a Promise when not providing a callback. [Example](#reading-png-files-using-promises)
 * [readPngFileSync](https://prior99.github.io/node-libpng/docs/globals.html#readpngfilesync) Will read a PNG file synchroneously and return a [PngImage](file:///home/prior/repositories/prior99.github.io/node-libpng/docs/classes/pngimage.html) instance with the decoded image. [Example](#reading-png-files-synchroneously)
 * [decode](https://prior99.github.io/node-libpng/docs/globals.html#decode) Will decode a Buffer of raw PNG file data and return a [PngImage](file:///home/prior/repositories/prior99.github.io/node-libpng/docs/classes/pngimage.html) instance. [Example](#decoding-a-buffer)

#### Reading PNG files using Promises

In order to use the Promise-based API, simply omit the third argument.

```typescript
import { readPngFile } from "node-libpng";

async function readMyFile() {
    const image = await readPngFile("path/to/image.png");
    console.log(`Reading was successful. The dimensions of the image are ${image.width}x${image.height}.`);
}
```

If an error occured while reading the file or decoding the buffer, the Promise which `writePngFile` returns will reject with the error.

#### Reading PNG files using a callback

In order to use the callback-based API, simply provide a callback as the third argument.

```typescript
import { readPngFile } from "node-libpng";

function readMyFile() {
    readPngFile("path/to/image.png", (error, image) => {
        if (error !== null) {
            // TODO: Check what `error` contains.
        }
        console.log(`Reading was successful. The dimensions of the image are ${image.width}x${image.height}.`);
    });
}
```

If an error occured while reading the file or decoding the buffer, it will be passed as the first argument to the callback.
Otherwise `null` will be passed. The [PngImage](file:///home/prior/repositories/prior99.github.io/node-libpng/docs/classes/pngimage.html) instance will be passed as the second argument. If an error occured,
it will be `undefined`.

#### Reading PNG files synchroneously

It is possible to read the image from the disk in a blocking way, using Node's `readFileSync`:

```typescript
import { readPngFileSync } from "node-libpng";

function readMyFile() {
    const image = readPngFileSync("path/to/image.png");
    console.log(`Reading was successful. The dimensions of the image are ${image.width}x${image.height}.`);
}
```

If an error occured while reading the file or decoding the buffer, it will be `throw`n.

#### Decoding a buffer

Buffers can be decoded directly into a [PngImage](file:///home/prior/repositories/prior99.github.io/node-libpng/docs/classes/pngimage.html) instance:

```typescript
import { decode } from "node-libpng";

function decodeMyBuffer() {
    const buffer = ...; // Some buffer containing the raw PNG file's data.
    const image = decode(buffer);
    console.log(`Decoding was successful. The dimensions of the image are ${image.width}x${image.height}.`);
}
```

If an error occured while decoding the buffer, it will be `throw`n.
The decoding happens synchroneously.

### Writing (Encoding)

Multiple ways for encoding and writing raw image data exist:

 * [writePngFile](https://prior99.github.io/node-libpng/docs/globals.html#writepngfile) Writes the raw data into a PNG file using Promises or a callback.
    * The function can take an optional argument for using a node-style callback API. [Example](#writing-png-files-using-a-callback)
    * The function will return a Promise when not providing a callback. [Example](#writing-png-files-using-promises)
 * [writePngFileSync](https://prior99.github.io/node-libpng/docs/globals.html#writepngfilesync) Writes the raw data into a PNG file synchroneously. [Example](#writing-png-files-synchroneously)
 * [encode](https://prior99.github.io/node-libpng/docs/globals.html#encode) Encodes the raw data into a Buffer containing the PNG file's data. [Example](#encoding-into-a-buffer)
 * [PngImage](https://prior99.github.io/node-libpng/docs/classes/pngimage.html) contains methods for encoding and writing modified image data:
    * [PngImage.encode](https://prior99.github.io/node-libpng/docs/classes/pngimage.html#encode) The same as calling the free function [encode]() with `PngImage.data`.
    * [PngImage.write](https://prior99.github.io/node-libpng/docs/classes/pngimage.html#write) The same as calling the free function [writePngFile]() with `PngImage.data`.
    * [PngImage.writeSync](https://prior99.github.io/node-libpng/docs/classes/pngimage.html#writesync) The same as calling the free function [writePngFileSync]() with `PngImage.data`.

#### Writing PNG files using Promises

In order to use the Promise-based API, simply omit the 4th argument.

```typescript
import { writePngFile } from "node-libpng";

async function writeMyFile() {
    // Let's write a 100x60 pixel PNG file with no alpha channel.
    const imageData = Buffer.alloc(100 * 60 * 3);
    // TODO: Manipulate the image data somehow.
    const options = {
        width: 100,
        height: 60,
        alpha: false
    };
    await writePngFile("path/to/image.png", imageData, options);
    console.log("File successfully written.");
}
```

In this example, a 100x60 pixel image with no alpha channel will be encoded and written to disk.

It is possible to omit either `width` or `height` from the options.

If an error occured while writing the file or encoding the buffer, the Promise which `writePngFile` returns will
reject with the error.

#### Writing PNG files using a callback

In order to use the callback-based API, provide a callback as the 4th argument.

```typescript
import { writePngFile } from "node-libpng";

function writeMyFile() {
    // Let's write a 100x60 pixel PNG file with no alpha channel.
    const imageData = Buffer.alloc(100 * 60 * 3);
    // TODO: Manipulate the image data somehow.
    const options = {
        width: 100,
        height: 60,
        alpha: false
    };
    await writePngFile("path/to/image.png", imageData, options, (error) => {
        if (error !== null) {
            // TODO: Check what `error` contains.
        }
        console.log("File successfully written.");
    });
}
```

In this example, a 100x60 pixel image with no alpha channel will be encoded and written to disk.

It is possible to omit either `width` or `height` from the options.

If an error occured while writing the file or encoding the buffer, it will be passed as the first and only argument
in the callback. Otherwise `null` will be passed.

#### Writing PNG files synchroneously

It is possible to write the image to disk in a blocking way, using Node's `writeFileSync`:

```typescript
import { writePngFileSync } from "node-libpng";

function writeMyFile() {
    // Let's write a 100x60 pixel PNG file with no alpha channel.
    const imageData = Buffer.alloc(100 * 60 * 3);
    // TODO: Manipulate the image data somehow.
    const options = {
        width: 100,
        height: 60,
        alpha: false
    };
    writePngFileSync("path/to/image.png", imageData, options);
    console.log("File successfully written.");
}
```

In this example, a 100x60 pixel image with no alpha channel will be encoded and written to disk.

It is possible to omit either `width` or `height` from the options.

If an error occured while writing the file or encoding the buffer, it will be `throw`n.

#### Encoding into a Buffer

Buffers can be encoded directly from a buffer containing the raw pixel data:

```typescript
import { encode } from "node-libpng";

function encodeMyBuffer() {
    const buffer = ...; // Some buffer containing the raw pixel data.
    const options = {
        width: 100,
        height: 100,
        alpha: false
    };
    const encodedPngData = encode(buffer);
    // The Buffer `encodedPngData` now contains the raw PNG-encoded data.
    console.log("File successfully encoded.");
}
```

If an error occured while encoding the buffer, it will be `throw`n.
The encoding happens synchroneously.

## Benchmark

As it is a native addon, **node-libpng** is much faster than libraries like [pngjs](https://www.npmjs.com/package/pngjs):

### Read access (Decoding)

The chart below shows the comparison of decoding an image between [pngjs](https://www.npmjs.com/package/pngjs) (sync api) and **node-libpng**.
The time to fully decode a 4096x4096 image is measured (Higher is better).

![read benchmark](images/benchmark-read.png)

*(The x-axis scale shows the amount of fully decoded images per second.)*

### Write access (Encoding)

The chart below shows the comparison of encoding an image between [pngjs](https://www.npmjs.com/package/pngjs) (sync api) and **node-libpng**.
The time to fully encode a 4096x4096 image is measured (Higher is better).

![access benchmark](images/benchmark-encode.png)

*(The x-axis scale shows the amount of fully encoded images per second.)*

### Pixel Access

The chart below shows the comparison of accessing all pixels in a decoded image between [pngjs](https://www.npmjs.com/package/pngjs) and **node-libpng**.
The time to fully access every pixel in the raw data is measured (Higher is better).

![access benchmark](images/benchmark-access.png)

*(The x-axis scale shows the amount of fully accessed images per second.)*

## Contributing

Yarn is used instead of npm, so make sure it is installed, probably: `npm install -g yarn`.

Install all dependencies using

```
yarn install
```

### Building

In order to build the code:

```
yarn build
```

### Running the tests with coverage

```
yarn test
```

### Linting

```
yarn lint
```

### Starting the example

Server:

```
cd exmaple
yarn run:server
```

Client:

```
cd exmaple
yarn run:client
```

### Generating the libpng config

Libpng requires an OS specific configuration headerfile `pnglibconf.h`.
This can be generated by executing:

```
git submodule update --init --recursive
cd deps/libpng
mkdir build
cd build
cmake ..
make
cp pnglibconf.h ../../config/linux/
```

## Contributors

 - Frederick Gnodtke
