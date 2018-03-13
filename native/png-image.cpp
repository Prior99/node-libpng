#include "png-image.hpp"

#include <node_buffer.h>
#include <string>
#include <vector>

using namespace node;
using namespace v8;
using namespace std;

Nan::Persistent<Function> constructor;

PngImage::PngImage(png_structp &pngPtr, png_infop &infoPtr) : pngPtr(pngPtr), infoPtr(infoPtr) {
}

PngImage::~PngImage() {
}

NAN_MODULE_INIT(PngImage::Init) {
    Nan::HandleScope scope;

    v8::Local<v8::FunctionTemplate> fnTemplate = Nan::New<v8::FunctionTemplate>(PngImage::New);
    fnTemplate->SetClassName(Nan::New("PngImage").ToLocalChecked());
    auto ctorInstance = fnTemplate->InstanceTemplate();
    ctorInstance->SetInternalFieldCount(2);

    Nan::SetAccessor(ctorInstance, Nan::New("bitDepth").ToLocalChecked(), PngImage::bitDepth);
    Nan::SetAccessor(ctorInstance, Nan::New("channels").ToLocalChecked(), PngImage::channels);
    Nan::SetAccessor(ctorInstance, Nan::New("colorType").ToLocalChecked(), PngImage::colorType);
    Nan::SetAccessor(ctorInstance, Nan::New("height").ToLocalChecked(), PngImage::height);
    Nan::SetAccessor(ctorInstance, Nan::New("width").ToLocalChecked(), PngImage::width);
    Nan::SetAccessor(ctorInstance, Nan::New("interlaceType").ToLocalChecked(), PngImage::interlaceType);
    Nan::SetAccessor(ctorInstance, Nan::New("rowBytes").ToLocalChecked(), PngImage::rowBytes);
    // Nan::Accessor(ctorInstance, Nan::New("lastModification").ToLocalChecked(), PngImage::lastModification);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetX").ToLocalChecked(), PngImage::offsetX);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetY").ToLocalChecked(), PngImage::offsetY);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterX").ToLocalChecked(), PngImage::pixelsPerMeterX);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterY").ToLocalChecked(), PngImage::pixelsPerMeterY);

    constructor.Reset(fnTemplate->GetFunction());
    target->Set(Nan::New("PngImage").ToLocalChecked(), fnTemplate->GetFunction());
}

NAN_METHOD(PngImage::New) {
    if (info.IsConstructCall()) {
        // 1st Parameter: The input buffer.
        Local<Object> inputBuffer = Local<Object>::Cast(info[0]);

        auto lengthIn = Buffer::Length(inputBuffer);
        auto *dataIn = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer)); //Buffer for inputdata, as short array

        // Check if the buffer contains a PNG image at all.
        if (lengthIn < 8 || png_sig_cmp(dataIn, 0, 8)) {
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
        PngImage* instance = new PngImage(pngPtr, infoPtr);
        instance->Wrap(info.This());
        info.GetReturnValue().Set(info.This());
    } else {
        // Invoked as plain function `PngImage(...)`, turn into constructor call.
        vector<v8::Local<v8::Value>> args(info.Length());
        for (std::size_t i = 0; i < args.size(); ++i) {
            args[i] = info[i];
        }
        auto instance = Nan::NewInstance(Nan::New<v8::FunctionTemplate>(PngImage::New)->GetFunction(), args.size(), args.data());
        info.GetReturnValue().Set(instance.ToLocalChecked());
    }
}

NAN_GETTER(PngImage::width) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.This());
    double width = png_get_image_width(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(width));
}

NAN_GETTER(PngImage::height) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.This());
    double height = png_get_image_height(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(height));
}

NAN_GETTER(PngImage::bitDepth) {
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

NAN_GETTER(PngImage::channels) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string channels = convertChannels(png_get_channels(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New(channels).ToLocalChecked());
}

NAN_GETTER(PngImage::colorType) {
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

NAN_GETTER(PngImage::interlaceType) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string interlaceType = convertInterlaceType(png_get_interlace_type(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New<String>(interlaceType).ToLocalChecked());
}

NAN_GETTER(PngImage::rowBytes) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double rowBytes = png_get_rowbytes(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(rowBytes));
}

// NAN_GETTER(PngImage::lastModification) {
//     auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
//     png_timep modificationTime;
//     png_get_tIME(pngPtr, infoPtr, &modificationTime);
//     auto lastModification = Nan::New(pngImageInstance->lastModification).ToLocalChecked();
//     info.GetReturnValue().Set(lastModification);
// }

NAN_GETTER(PngImage::offsetX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetX = png_get_x_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetX));
}

NAN_GETTER(PngImage::offsetY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetY = png_get_y_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetY));
}

NAN_GETTER(PngImage::pixelsPerMeterX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterX = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterX));
}

NAN_GETTER(PngImage::pixelsPerMeterY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterY = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterY));
}

