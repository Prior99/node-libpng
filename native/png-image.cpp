#include "png-image.hpp"

#include <node_buffer.h>
#include <string>
#include <vector>
#include <iostream>

using namespace node;
using namespace v8;
using namespace std;

Nan::Persistent<Function> constructor;

PngImage::PngImage(png_structp &pngPtr, png_infop &infoPtr, uint32_t inputSize, uint8_t *dataIn) :
    pngPtr(pngPtr),
    infoPtr(infoPtr),
    inputSize(inputSize),
    dataIn(dataIn) {}

PngImage::~PngImage() {}

NAN_MODULE_INIT(PngImage::Init) {
    Nan::HandleScope scope;

    auto ctor = Nan::New<FunctionTemplate>(PngImage::New);
    auto ctorInstance = ctor->InstanceTemplate();
    ctor->SetClassName(Nan::New("PngImage").ToLocalChecked());
    ctorInstance->SetInternalFieldCount(2);

    Nan::SetAccessor(ctorInstance, Nan::New("bitDepth").ToLocalChecked(), PngImage::getBitDepth);
    Nan::SetAccessor(ctorInstance, Nan::New("channels").ToLocalChecked(), PngImage::getChannels);
    Nan::SetAccessor(ctorInstance, Nan::New("colorType").ToLocalChecked(), PngImage::getColorType);
    Nan::SetAccessor(ctorInstance, Nan::New("height").ToLocalChecked(), PngImage::getHeight);
    Nan::SetAccessor(ctorInstance, Nan::New("width").ToLocalChecked(), PngImage::getWidth);
    Nan::SetAccessor(ctorInstance, Nan::New("interlaceType").ToLocalChecked(), PngImage::getInterlaceType);
    Nan::SetAccessor(ctorInstance, Nan::New("rowBytes").ToLocalChecked(), PngImage::getRowBytes);
    // Nan::Accessor(ctorInstance, Nan::New("lastModification").ToLocalChecked(), PngImage::getLastModification);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetX").ToLocalChecked(), PngImage::getOffsetX);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetY").ToLocalChecked(), PngImage::getOffsetY);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterX").ToLocalChecked(), PngImage::getPixelsPerMeterX);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterY").ToLocalChecked(), PngImage::getPixelsPerMeterY);

    constructor.Reset(ctor->GetFunction());
    Nan::Set(target, Nan::New("PngImage").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(PngImage::New) {
    if (info.IsConstructCall()) {
        // 1st Parameter: The input buffer.
        Local<Object> inputBuffer = Local<Object>::Cast(info[0]);

        uint32_t inputSize = Buffer::Length(inputBuffer);
        uint8_t *dataIn = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer)); //Buffer for inputdata, as short array

        // Check if the buffer contains a PNG image at all.
        if (inputSize < 8 || png_sig_cmp(dataIn, 0, 8)) {
            Nan::ThrowTypeError("Invalid PNG buffer.");
        }

        auto pngPtr = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
        if (!pngPtr) {
            Nan::ThrowTypeError("Could not create PNG read struct.");
            return;
        }
        // Try to grab the info struct from the loaded PNG file.
        auto infoPtr = png_create_info_struct(pngPtr);
        if (!infoPtr) {
            Nan::ThrowTypeError("Could not create PNG info struct.");
            return;
        }
        // libpng will jump to this if an error occured while reading.
        if (setjmp(png_jmpbuf(pngPtr))) {
            Nan::ThrowTypeError("Error decoding PNG buffer.");
            return;
        }

        // png_init_io(pngPtr, dataIn);

        PngImage* instance = new PngImage(pngPtr, infoPtr, inputSize, dataIn);
        instance->Wrap(info.This());

        png_set_read_fn(pngPtr, reinterpret_cast<png_voidp>(instance), [] (png_structp passedStruct, png_bytep target, png_size_t length) {
            auto pngImage = reinterpret_cast<PngImage*>(passedStruct);
            cout << "reading " << length << " from " << pngImage->inputSize << endl;
            memcpy(reinterpret_cast<uint8_t*>(target), pngImage->dataIn + pngImage->consumed, length);
            pngImage->consumed += length;
            cout << "done." << pngImage->consumed << "/" << pngImage->inputSize << endl;
        });

        png_set_sig_bytes(pngPtr, 8);
        png_read_info(pngPtr, infoPtr);

        info.GetReturnValue().Set(info.This());
    } else {
        // Invoked as plain function `PngImage(...)`, turn into constructor call.
        vector<Local<Value>> args(info.Length());
        for (size_t i = 0; i < args.size(); ++i) {
            args[i] = info[i];
        }
        auto instance = Nan::NewInstance(info.Callee(), args.size(), args.data());
        if (!instance.IsEmpty()) {
            info.GetReturnValue().Set(instance.ToLocalChecked());
        }
    }
}

NAN_GETTER(PngImage::getWidth) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.This());
    double width = png_get_image_width(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    cout << width << ", " << pngImageInstance->pngPtr << ", " << pngImageInstance->infoPtr << ", " << png_get_image_width(pngImageInstance->pngPtr, pngImageInstance->infoPtr) << endl;
    if (width == 0) {
        Nan::ThrowError("Unable to read width from PNG.");
    }
    info.GetReturnValue().Set(Nan::New(width));
}

NAN_GETTER(PngImage::getHeight) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.This());
    double height = png_get_image_height(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    if (height == 0) {
        Nan::ThrowError("Unable to read width from PNG.");
    }
    info.GetReturnValue().Set(Nan::New(height));
}

NAN_GETTER(PngImage::getBitDepth) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double bitDepth = png_get_bit_depth(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(bitDepth));
}

static string convertChannels(const png_byte &channels) {
    switch (channels) {
        case PNG_COLOR_TYPE_PALETTE: return "palette";
        case PNG_COLOR_TYPE_GRAY: return "gray";
        case PNG_COLOR_TYPE_GRAY_ALPHA: return "gray-alpha";
        case PNG_COLOR_TYPE_RGB: return "rgb";
        case PNG_COLOR_TYPE_RGB_ALPHA: return "rgb-alpha";
        default: return "unknown";
    }
}

NAN_GETTER(PngImage::getChannels) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string channels = convertChannels(png_get_channels(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New(channels).ToLocalChecked());
}

NAN_GETTER(PngImage::getColorType) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double colorType = png_get_color_type(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(colorType));
}

static string convertInterlaceType(const png_byte &interlaceType) {
    switch (interlaceType) {
        case PNG_INTERLACE_NONE: return "none";
        case PNG_INTERLACE_ADAM7: return "adam7";
        default: return "unknown";
    }
}

NAN_GETTER(PngImage::getInterlaceType) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string interlaceType = convertInterlaceType(png_get_interlace_type(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New<String>(interlaceType).ToLocalChecked());
}

NAN_GETTER(PngImage::getRowBytes) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double rowBytes = png_get_rowbytes(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(rowBytes));
}

// NAN_GETTER(PngImage::getLastModification) {
//     auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
//     png_timep modificationTime;
//     png_get_tIME(pngPtr, infoPtr, &modificationTime);
//     auto lastModification = Nan::New(pngImageInstance->lastModification).ToLocalChecked();
//     info.GetReturnValue().Set(lastModification);
// }

NAN_GETTER(PngImage::getOffsetX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetX = png_get_x_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetX));
}

NAN_GETTER(PngImage::getOffsetY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetY = png_get_y_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetY));
}

NAN_GETTER(PngImage::getPixelsPerMeterX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterX = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterX));
}

NAN_GETTER(PngImage::getPixelsPerMeterY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterY = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterY));
}

void PngImage::readCallback(png_structp _, png_bytep target, png_size_t length) {
    memcpy(reinterpret_cast<uint8_t*>(target), this->dataIn + this->consumed, length);
    this->consumed += length;
}
