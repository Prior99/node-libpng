#include <png.h>
#include <node_buffer.h>
#include <cstring>
#include <iostream>

#include "is-png.hpp"

using namespace node;
using namespace v8;

NAN_METHOD(copy) {
    // 1st Parameter: The source buffer.
    Local<Object> sourceBuffer = Local<Object>::Cast(info[0]);
    auto sourceLength = Buffer::Length(sourceBuffer);
    auto *sourceData = reinterpret_cast<uint8_t*>(Buffer::Data(sourceBuffer));
    // 2nd Parameter: The target buffer.
    Local<Object> targetBuffer = Local<Object>::Cast(info[1]);
    auto *targetData = reinterpret_cast<uint8_t*>(Buffer::Data(targetBuffer));
    // 3rd Parameter: The source image width.
    const auto sourceWidth = static_cast<uint32_t>(info[2]->NumberValue());
    // 4th Parameter: The source image height.
    const auto sourceHeight = static_cast<uint32_t>(info[3]->NumberValue());
    // 5th Parameter: The target image width.
    const auto targetWidth = static_cast<uint32_t>(info[4]->NumberValue());
    // 6th Parameter: The target image height.
    // const auto targetHeight = static_cast<uint32_t>(info[5]->NumberValue());
    // 7th Parameter: The x offset for reading from the source buffer.
    const auto sourceOffsetLeft = static_cast<uint32_t>(info[6]->NumberValue());
    // 8th Parameter: The y offset for reading from the source buffer.
    const auto sourceOffsetTop = static_cast<uint32_t>(info[7]->NumberValue());
    // 9th Parameter: The width for reading from the source buffer.
    const auto sourceClipWidth = static_cast<uint32_t>(info[8]->NumberValue());
    // 10th Parameter: The height for reading from the source buffer.
    const auto sourceClipHeight = static_cast<uint32_t>(info[9]->NumberValue());
    // 11th Parameter: The x offset for writing to the target buffer.
    const auto targetOffsetLeft = static_cast<uint32_t>(info[10]->NumberValue());
    // 12th Parameter: The y offset for writing to the target buffer.
    const auto targetOffsetTop = static_cast<uint32_t>(info[11]->NumberValue());

    // Computed values.
    const auto bytesPerPixel = sourceLength / (sourceWidth * sourceHeight);
    const auto bytes = bytesPerPixel * sourceClipWidth;

    // Iterate over every row in the source image.
    for (auto ySource = sourceOffsetTop; ySource < sourceOffsetTop + sourceClipHeight; ++ySource) {
        const auto indexSource = (ySource * sourceClipWidth + sourceOffsetLeft) * bytesPerPixel;
        const auto indexTarget = (((targetOffsetTop + ySource - sourceOffsetTop) * targetWidth) + targetOffsetLeft) * bytesPerPixel;
        std::memcpy(targetData + indexTarget, sourceData + indexSource, bytes);
    }
}

NAN_MODULE_INIT(InitCopy) {
    target->Set(Nan::New("__native_copy").ToLocalChecked(), Nan::New<FunctionTemplate>(copy)->GetFunction());
}
