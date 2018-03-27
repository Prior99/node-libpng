#include "png-image.hpp"

#include <node_buffer.h>
#include <string>
#include <vector>
#include <iostream>

using namespace node;
using namespace v8;
using namespace std;

Nan::Persistent<Function> constructor;

PngImage::PngImage(png_structp &pngPtr, png_infop &infoPtr) : pngPtr(pngPtr), infoPtr(infoPtr) {}

PngImage::~PngImage() {}

NAN_MODULE_INIT(PngImage::Init) {
    Nan::HandleScope scope;
    // Define the constructor. Rename `PngImage` to `NativePngImage` as it will be wrapped on JS side.
    auto ctor = Nan::New<FunctionTemplate>(PngImage::New);
    auto ctorInstance = ctor->InstanceTemplate();
    ctor->SetClassName(Nan::New("__native_PngImage").ToLocalChecked());
    ctorInstance->SetInternalFieldCount(2);
    // Hand over all getters defined on `PngImage` to node.
    Nan::SetAccessor(ctorInstance, Nan::New("bitDepth").ToLocalChecked(), PngImage::getBitDepth);
    Nan::SetAccessor(ctorInstance, Nan::New("channels").ToLocalChecked(), PngImage::getChannels);
    Nan::SetAccessor(ctorInstance, Nan::New("colorType").ToLocalChecked(), PngImage::getColorType);
    Nan::SetAccessor(ctorInstance, Nan::New("height").ToLocalChecked(), PngImage::getHeight);
    Nan::SetAccessor(ctorInstance, Nan::New("width").ToLocalChecked(), PngImage::getWidth);
    Nan::SetAccessor(ctorInstance, Nan::New("interlaceType").ToLocalChecked(), PngImage::getInterlaceType);
    Nan::SetAccessor(ctorInstance, Nan::New("rowBytes").ToLocalChecked(), PngImage::getRowBytes);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetX").ToLocalChecked(), PngImage::getOffsetX);
    Nan::SetAccessor(ctorInstance, Nan::New("offsetY").ToLocalChecked(), PngImage::getOffsetY);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterX").ToLocalChecked(), PngImage::getPixelsPerMeterX);
    Nan::SetAccessor(ctorInstance, Nan::New("pixelsPerMeterY").ToLocalChecked(), PngImage::getPixelsPerMeterY);
    Nan::SetAccessor(ctorInstance, Nan::New("time").ToLocalChecked(), PngImage::getTime);
    Nan::SetAccessor(ctorInstance, Nan::New("backgroundColor").ToLocalChecked(), PngImage::getBackgroundColor);
    Nan::SetAccessor(ctorInstance, Nan::New("palette").ToLocalChecked(), PngImage::getPalette);
    // Make sure the constructor stays persisted by storing it in a `Nan::Persistant`.
    constructor.Reset(ctor->GetFunction());
    // Store `NativePngImage` in the module's exports.
    Nan::Set(target, Nan::New("__native_PngImage").ToLocalChecked(), ctor->GetFunction());
}

/*
 * This struct is used when reading (decoding) the PNG image into a raw buffer.
 * It stores information about the data which should be read and how much data has already
 * been consumed.
 */
struct ReadStruct {
    // The total size of `input`.
    uint32_t length;
    // The pointer to the raw PNG data.
    uint8_t *input;
    // The amount of bytes which have already been read.
    uint32_t consumed;
};

NAN_METHOD(PngImage::New) {
    if (info.IsConstructCall()) {
        // 1st Parameter: The input buffer.
        Local<Object> inputBuffer = Local<Object>::Cast(info[0]);
        uint32_t inputSize = Buffer::Length(inputBuffer);
        uint8_t *input = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer));

        // Check if the buffer contains a PNG image at all.
        if (inputSize < 8 || png_sig_cmp(input, 0, 8)) {
            Nan::ThrowTypeError("Invalid PNG buffer.");
            return;
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
        // Create instance of `PngImage`.
        PngImage* instance = new PngImage(pngPtr, infoPtr);
        instance->Wrap(info.This());
        // Store information about the read progres in a separate struct which will be handed into the read function.
        ReadStruct readStruct{ inputSize, input, 8 };
        // This callback will be called each time libpng requests a new chunk.
        png_set_read_fn(pngPtr, reinterpret_cast<png_voidp>(&readStruct), [] (png_structp passedStruct, png_bytep target, png_size_t length) {
            auto readStruct = reinterpret_cast<ReadStruct*>(png_get_io_ptr(passedStruct));
            memcpy(reinterpret_cast<uint8_t*>(target), readStruct->input + readStruct->consumed, length);
            readStruct->consumed += length;
        });
        // Tell libpng that the initial 8 bytes for the header have already been read.
        png_set_sig_bytes(pngPtr, 8);
        // Read the infos.
        png_read_info(pngPtr, infoPtr);

        auto rowCount = png_get_image_height(pngPtr, infoPtr);
        auto rowBytes = png_get_rowbytes(pngPtr, infoPtr);
        auto decodedSize = rowBytes * rowCount;
        // A vector is used to address each row of the image inside the 1-dimensional `decoded` array.
        // Resize the vector to the amount of rows used, assigning each row to `nullptr`.
        vector<png_bytep> rows;
        rows.resize(rowCount, nullptr);
        // Initialize the array into which the decoded data will be written.
        // This array will be handed to a `Buffer` instance which will take care of freeing the memory.
        auto decoded = new png_byte[decodedSize];
        // Iterate over every row, and assign the pointer inside the `decoded` array to the element in the vector.
        // This way each element in the vector points to the beginning of the 2-dimensional row inside the 1-dimensional array.
        for(size_t row = 0; row < rowCount; ++row) {
            rows[row] = decoded + row * rowBytes;
        }
        png_read_image(pngPtr, &rows[0]);
        // Store the created buffer on the object.
        Nan::Set(info.This(), Nan::New("data").ToLocalChecked(), Nan::NewBuffer(reinterpret_cast<char*>(decoded), decodedSize).ToLocalChecked());
        // Set the return value of the call to the constructor to the newly created instance.
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

/**
 * This getter will return the width of the image, gathered from `png_get_image_width`.
 */
NAN_GETTER(PngImage::getWidth) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double width = png_get_image_width(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    // libpng will return `0` instead of the width if it couldn't be read.
    if (width == 0) {
        Nan::ThrowError("Unable to read width from PNG.");
    }
    info.GetReturnValue().Set(Nan::New(width));
}

/**
 * This getter will return the width of the image, gathered from `png_get_image_height`.
 */
NAN_GETTER(PngImage::getHeight) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double height = png_get_image_height(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    // libpng will return `0` instead of the height if it couldn't be read.
    if (height == 0) {
        Nan::ThrowError("Unable to read width from PNG.");
    }
    info.GetReturnValue().Set(Nan::New(height));
}

/**
 * This getter will return the bit depth of the image, gathered from `png_get_bit_depth`.
 */
NAN_GETTER(PngImage::getBitDepth) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double bitDepth = png_get_bit_depth(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(bitDepth));
}

/**
 * Used to convert the color type from libpng's internal enum format into strings.
 */
static string convertColorType(const png_byte &colorType) {
    switch (colorType) {
        case PNG_COLOR_TYPE_PALETTE: return "palette";
        case PNG_COLOR_TYPE_GRAY: return "gray-scale";
        case PNG_COLOR_TYPE_GRAY_ALPHA: return "gray-scale-alpha";
        case PNG_COLOR_TYPE_RGB: return "rgb";
        case PNG_COLOR_TYPE_RGB_ALPHA: return "rgba";
        default: return "unknown";
    }
}

/**
 * This getter will return the amount of channels of the image, gathered from `png_get_channels`.
 */
NAN_GETTER(PngImage::getChannels) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double channels = png_get_channels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(channels));
}

/**
 * This getter will return the color type of the image as a string, gathered from `png_get_color_type`.
 */
NAN_GETTER(PngImage::getColorType) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string colorType = convertColorType(png_get_color_type(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New(colorType).ToLocalChecked());
}

/**
 * Used to convert the interlace type from libpng's internal enum format into strings.
 */
static string convertInterlaceType(const png_byte &interlaceType) {
    switch (interlaceType) {
        case PNG_INTERLACE_NONE: return "none";
        case PNG_INTERLACE_ADAM7: return "adam7";
        default: return "unknown";
    }
}

/**
 * This getter will return the interlace type of the image as a string, gathered from `png_get_interlace_type`.
 */
NAN_GETTER(PngImage::getInterlaceType) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    string interlaceType = convertInterlaceType(png_get_interlace_type(pngImageInstance->pngPtr, pngImageInstance->infoPtr));
    info.GetReturnValue().Set(Nan::New<String>(interlaceType).ToLocalChecked());
}

/**
 * This getter will return the amount of bytes per row of the image, gathered from `png_get_rowbytes`.
 */
NAN_GETTER(PngImage::getRowBytes) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double rowBytes = png_get_rowbytes(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(rowBytes));
}

/**
 * This getter will return the horizontal offset of the image, gathered from `png_get_x_offset_pixels`.
 */
NAN_GETTER(PngImage::getOffsetX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetX = png_get_x_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetX));
}

/**
 * This getter will return the vertical offset of the image, gathered from `png_get_y_offset_pixels`.
 */
NAN_GETTER(PngImage::getOffsetY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double offsetY = png_get_y_offset_pixels(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(offsetY));
}

/**
 * This getter will return the horizontal amount of pixels per meter of the image, gathered from `png_get_x_pixels_per_meter`.
 */
NAN_GETTER(PngImage::getPixelsPerMeterX) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterX = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterX));
}

/**
 * This getter will return the vertical amount of pixels per meter of the image, gathered from `png_get_y_pixels_per_meter`.
 */
NAN_GETTER(PngImage::getPixelsPerMeterY) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    double pixelsPerMeterY = png_get_x_pixels_per_meter(pngImageInstance->pngPtr, pngImageInstance->infoPtr);
    info.GetReturnValue().Set(Nan::New(pixelsPerMeterY));
}

/**
 * This getter will return the modification time of the image, gathered from `png_get_tIME`.
 */
NAN_GETTER(PngImage::getTime) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    png_timep time;
    // If no time information is available in the header, simply return `undefined`.
    if (png_get_tIME(pngImageInstance->pngPtr, pngImageInstance->infoPtr, &time) == 0) {
        info.GetReturnValue().Set(Nan::Undefined());
        return;
    }
    // Copy the struct into a JS object.
    Local<Object> returnValue = Nan::New<Object>();
    returnValue->Set(Nan::New("year").ToLocalChecked(), Nan::New(static_cast<double>(time->year)));
    returnValue->Set(Nan::New("month").ToLocalChecked(), Nan::New(static_cast<double>(time->month)));
    returnValue->Set(Nan::New("day").ToLocalChecked(), Nan::New(static_cast<double>(time->day)));
    returnValue->Set(Nan::New("hour").ToLocalChecked(), Nan::New(static_cast<double>(time->hour)));
    returnValue->Set(Nan::New("minute").ToLocalChecked(), Nan::New(static_cast<double>(time->minute)));
    returnValue->Set(Nan::New("second").ToLocalChecked(), Nan::New(static_cast<double>(time->second)));
    info.GetReturnValue().Set(returnValue);
}

Local<Object> PngImage::convertColor(png_color_16p color) {
    // Copy the struct into a JS object, taking only valid color information into account.
    Local<Object> convertedColor = Nan::New<Object>();
    switch (png_get_color_type(this->pngPtr, this->infoPtr)) {
        case PNG_COLOR_TYPE_PALETTE:
            convertedColor->Set(Nan::New("index").ToLocalChecked(), Nan::New(static_cast<double>(color->index)));
            break;
        case PNG_COLOR_TYPE_GRAY:
        case PNG_COLOR_TYPE_GRAY_ALPHA:
            convertedColor->Set(Nan::New("gray").ToLocalChecked(), Nan::New(static_cast<double>(color->gray)));
            break;
        case PNG_COLOR_TYPE_RGB:
        case PNG_COLOR_TYPE_RGB_ALPHA:
            convertedColor->Set(Nan::New("red").ToLocalChecked(), Nan::New(static_cast<double>(color->red)));
            convertedColor->Set(Nan::New("green").ToLocalChecked(), Nan::New(static_cast<double>(color->green)));
            convertedColor->Set(Nan::New("blue").ToLocalChecked(), Nan::New(static_cast<double>(color->blue)));
            break;
    }
    return convertedColor;
}

Local<Object> PngImage::convertColor(png_colorp color) {
    Local<Object> convertedColor = Nan::New<Object>();
    convertedColor->Set(Nan::New("red").ToLocalChecked(), Nan::New(static_cast<double>(color->red)));
    convertedColor->Set(Nan::New("green").ToLocalChecked(), Nan::New(static_cast<double>(color->green)));
    convertedColor->Set(Nan::New("blue").ToLocalChecked(), Nan::New(static_cast<double>(color->blue)));
    return convertedColor;
}

/**
 * This getter will return the background color of the image, gathered from `png_get_bKGD`.
 */
NAN_GETTER(PngImage::getBackgroundColor) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    png_color_16p color;
    // If no background color information is available in the header, simply return `undefined`.
    if (png_get_bKGD(pngImageInstance->pngPtr, pngImageInstance->infoPtr, &color) == 0) {
        info.GetReturnValue().Set(Nan::Undefined());
        return;
    }
    info.GetReturnValue().Set(pngImageInstance->convertColor(color));
}

NAN_GETTER(PngImage::getPalette) {
    auto pngImageInstance = Nan::ObjectWrap::Unwrap<PngImage>(info.Holder());
    png_colorp colors;
    int colorCount;
    // If no time information is available in the header, simply return `undefined`.
    if (png_get_PLTE(pngImageInstance->pngPtr, pngImageInstance->infoPtr, &colors, &colorCount) == 0) {
        info.GetReturnValue().Set(Nan::Undefined());
        return;
    }
    Local<Array> palette = Nan::New<Array>(colorCount);
    for (auto i = 0; i < colorCount; ++i) {
        Nan::Set(palette, i, pngImageInstance->convertColor(colors + i));
    }
    info.GetReturnValue().Set(palette);
}
