#include <png.h>
#include <node_buffer.h>
#include <cstring>
#include <cmath>
#include <iostream>

#include "is-png.hpp"

using namespace node;
using namespace v8;

NAN_METHOD(fill) {
    // 1st Parameter: The source buffer.
    Local<Object> inputBuffer = Local<Object>::Cast(info[0]);
    auto length = Buffer::Length(inputBuffer);
    auto *data = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer));
    // 2rd Parameter: The source image width.
    const auto imageWidth = static_cast<uint32_t>(Nan::To<uint32_t>(info[1]).ToChecked());
    // 3th Parameter: The source image height.
    const auto imageHeight = static_cast<uint32_t>(Nan::To<uint32_t>(info[2]).ToChecked());
    // 4th Parameter: The x offset for reading from the source buffer.
    const auto offsetLeft = static_cast<uint32_t>(Nan::To<uint32_t>(info[3]).ToChecked());
    // 5th Parameter: The y offset for reading from the source buffer.
    const auto offsetTop = static_cast<uint32_t>(Nan::To<uint32_t>(info[4]).ToChecked());
    // 6th Parameter: The width for reading from the source buffer.
    const auto width = static_cast<uint32_t>(Nan::To<uint32_t>(info[5]).ToChecked());
    // 7th Parameter: The height for reading from the source buffer.
    const auto height = static_cast<uint32_t>(Nan::To<uint32_t>(info[6]).ToChecked());
    // 8th Parameter: The fill color as an array.
    Local<Array> fillColor = Local<Array>::Cast(info[7]);
    // 9th Parameter: The bit depth.
    const auto bitDepth = static_cast<uint32_t>(Nan::To<uint32_t>(info[8]).ToChecked());

    // Computed values.
    const auto bytesPerColor = std::ceil(static_cast<double>(bitDepth) / 8.0);
    const auto bytesPerPixel = length / (imageWidth * imageHeight);

    // Sanity checks.
    if (bytesPerPixel / bytesPerColor != fillColor->Length()) {
        Nan::ThrowError("Fill color doesn't match expected color type.");
    }
    if (length % (imageWidth * imageHeight) != 0) {
        Nan::ThrowError("Width and height do not match buffer size.");
    }

    // Copy the color into a vector for faster access.
    std::vector<uint32_t> colorValues;
    for (uint32_t colorIndex = 0; colorIndex < fillColor->Length(); ++colorIndex) {
        colorValues.push_back(static_cast<uint32_t>(Nan::To<uint32_t>(fillColor->Get(colorIndex)).ToChecked()));
    }
    // Now fill the rectangle
    for (uint32_t y = offsetTop; y < offsetTop + height; ++y) {
        for (uint32_t x = offsetLeft; x < offsetLeft + width; ++x) {
            const auto index = ((y * imageWidth) + x) * bytesPerPixel;
            for (uint32_t colorIndex = 0; colorIndex < colorValues.size(); ++colorIndex) {
                data[index + colorIndex] = colorValues[colorIndex];
            }
        }
    }
}

NAN_MODULE_INIT(InitFill) {
    target->Set(Nan::New("__native_fill").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(fill)).ToLocalChecked());
}
