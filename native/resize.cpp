#include <png.h>
#include <node_buffer.h>
#include <cmath>
#include <cstring>
#include <algorithm>
#include <vector>
#include <iostream>

#include "is-png.hpp"

using namespace node;
using namespace v8;

NAN_METHOD(resize) {
    // 1st Parameter: The input buffer.
    Local<Object> inputBuffer = Local<Object>::Cast(info[0]);
    auto lengthIn = Buffer::Length(inputBuffer);
    auto *dataIn = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer)); //Buffer for inputdata, as short array
    // 2nd Parameter: The old width.
    const auto oldWidth = static_cast<uint32_t>(info[1]->NumberValue());
    // 3rd Parameter: The old height.
    const auto oldHeight = static_cast<uint32_t>(info[2]->NumberValue());
    // 4th Parameter: The new width.
    const auto newWidth = static_cast<uint32_t>(info[3]->NumberValue());
    // 5th Parameter: The new height.
    const auto newHeight = static_cast<uint32_t>(info[4]->NumberValue());
    // 6th Parameter: The padding left.
    const auto outerPaddingLeft = static_cast<uint32_t>(info[5]->NumberValue());
    // 7th Parameter: The padding top.
    const auto outerPaddingTop = static_cast<uint32_t>(info[6]->NumberValue());
    // 8th Parameter: The padding left.
    const auto innerPaddingLeft = static_cast<uint32_t>(info[7]->NumberValue());
    // 9th Parameter: The padding top.
    const auto innerPaddingTop = static_cast<uint32_t>(info[8]->NumberValue());
    // 10th Parameter: The padding left.
    const auto innerWidth = static_cast<uint32_t>(info[9]->NumberValue());
    // 11th Parameter: The padding top.
    const auto innerHeight = static_cast<uint32_t>(info[10]->NumberValue());
    // 12th Parameter: The fill color as an array.
    Local<Array> fillColor = Local<Array>::Cast(info[11]);
    // 13th Parameter: The bit depth.
    const auto bitDepth = static_cast<uint32_t>(info[12]->NumberValue());

    // Computed values.
    const auto bytesPerColor = std::ceil(static_cast<double>(bitDepth) / 8.0);
    const auto bytesPerPixel = lengthIn / (oldWidth * oldHeight);
    const auto lengthOut = bytesPerPixel * newWidth * newHeight;

    // Sanity checks.
    if (bytesPerPixel / bytesPerColor != fillColor->Length()) {
        Nan::ThrowError("Fill color doesn't match expected color type.");
    }
    if (lengthIn % (oldWidth * oldHeight) != 0) {
        Nan::ThrowError("Width and height do not match buffer size.");
    }

    const auto dataOut = new uint8_t[lengthOut];

    std::vector<uint32_t> colorValues;
    for (uint32_t colorIndex = 0; colorIndex < fillColor->Length(); ++colorIndex) {
        colorValues.push_back(static_cast<uint32_t>(fillColor->Get(colorIndex)->NumberValue()));
    }
    for (uint32_t index = 0; index < lengthOut; index += bytesPerPixel) {
        for (uint32_t colorIndex = 0; colorIndex < bytesPerPixel; ++colorIndex) {
            dataOut[index + colorIndex] = colorValues[colorIndex];
        }
    }

    // If the specified inner width of the image to copy plus the outer padding was bigger than the
    // width of the new image, clamp to the edges.
    const auto bytes = std::min(innerWidth, newWidth - outerPaddingLeft) * bytesPerPixel;
    // Iterate over every row on the old image
    for (auto yOld = innerPaddingTop; yOld < innerHeight + innerPaddingTop; ++yOld) {
        const auto indexOld = (yOld * oldWidth + innerPaddingLeft) * bytesPerPixel;
        const auto indexNew = ((outerPaddingTop + yOld - innerPaddingTop) * newWidth + outerPaddingLeft) * bytesPerPixel;
        std::memcpy(dataOut + indexNew, dataIn + indexOld, bytes);
    }

    info.GetReturnValue().Set(Nan::NewBuffer(reinterpret_cast<char*>(dataOut), lengthOut).ToLocalChecked());
}

NAN_MODULE_INIT(InitResize) {
    target->Set(Nan::New("__native_resize").ToLocalChecked(), Nan::New<FunctionTemplate>(resize)->GetFunction());
}
