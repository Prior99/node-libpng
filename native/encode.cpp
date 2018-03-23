#include <png.h>
#include <zlib.h>
#include <node_buffer.h>
#include <iostream>

#include "is-png.hpp"

using namespace node;
using namespace v8;
using namespace std;

NAN_METHOD(encode) {
    // 1st Parameter: The input buffer to encode.
    Local<Object> inputBuffer = Local<Object>::Cast(info[0]);
    uint8_t *input = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer));
    // 2nd Parameter: The width of the image to encode.
    const auto width = static_cast<uint32_t>(info[1]->NumberValue());
    // 3rd Parameter: The height of the image to encode.
    const auto height = static_cast<uint32_t>(info[2]->NumberValue());
    // 4th Parameter: Whether to use alpha channel or not.
    const auto alpha = static_cast<bool>(info[3]->BooleanValue());
    // calculate derived parameters.
    const auto colorType = alpha ? PNG_COLOR_TYPE_RGBA : PNG_COLOR_TYPE_RGB;
    const auto rowBytes = (alpha ? 4 : 3) * width;
    const auto encodedSize = rowBytes * height;
    // Create libpng write struct. Fail if unable to create.
    png_structp pngPtr = png_create_write_struct(PNG_LIBPNG_VER_STRING, nullptr, nullptr, nullptr);
    if (!pngPtr) {
        Nan::ThrowError("Unable to initialize libpng for writing.");
        return;
    }
    // Create libpng info struct. Fail if unable to create.
    png_infop infoPtr = png_create_info_struct(pngPtr);
    if (!infoPtr) {
        Nan::ThrowError("Unable to initialize libpng info struct.");
        return;
    }
    // libpng will jump to this if an error occured while reading.
    if (setjmp(png_jmpbuf(pngPtr))) {
        Nan::ThrowTypeError("Error decoding PNG buffer.");
        return;
    }
    vector<uint8_t> encoded;
    // This callback will be called each time libpng wants to write an encoded chunk.
    png_set_write_fn(pngPtr, &encoded, [] (png_structp pngPtr, png_bytep data, png_size_t length) {
        cout << "encoding " << length << endl;
        auto encoded = reinterpret_cast<vector<uint8_t>*>(png_get_io_ptr(pngPtr));
        encoded->insert(encoded->end(), data, data + length);
    }, nullptr);
    // Use best compression.
    png_set_compression_level(pngPtr, Z_BEST_COMPRESSION);
    // Initialize write call with available options such as `width`, `height`, etc.
    png_set_IHDR(pngPtr, infoPtr, width, height, 8, colorType, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);
    // A vector is used to address each row of the image inside the 1-dimensional `input` array.
    // Resize the vector to the amount of rows used, assigning each row to `nullptr`.
    vector<png_bytep> rows;
    rows.resize(height, nullptr);
    // Iterate over every row, and assign the pointer inside the `input` array to the element in the vector.
    // This way each element in the vector points to the beginning of the 2-dimensional row inside the 1-dimensional array.
    for(size_t row = 0; row < height; ++row) {
        rows[row] = input + row * rowBytes;
    }
    // Encode the PNG.
    png_write_info(pngPtr, infoPtr);
    png_write_rows(pngPtr, &rows[0], height);
    png_write_end(pngPtr, infoPtr);
    png_destroy_write_struct(&pngPtr, &infoPtr);
    // Return created encoded image as a buffer.
    info.GetReturnValue().Set(Nan::NewBuffer(reinterpret_cast<char*>(&encoded[0]), encodedSize).ToLocalChecked());
}

NAN_MODULE_INIT(InitEncode) {
    target->Set(Nan::New("__native_encode").ToLocalChecked(), Nan::New<FunctionTemplate>(encode)->GetFunction());
}
