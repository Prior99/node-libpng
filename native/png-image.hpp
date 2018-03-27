#ifndef PNG_IMAGE_HPP
#define PNG_IMAGE_HPP

#include <nan.h>
#include <png.h>
#include <vector>

class PngImage : public Nan::ObjectWrap {
    public:
        static NAN_MODULE_INIT(Init);

    private:
        // Define a method for creating a new instance using the `new` keyword.
        static NAN_METHOD(New);
        // Define all getters referring to the `png_get_...` functions.
        static NAN_GETTER(getBitDepth);
        static NAN_GETTER(getChannels);
        static NAN_GETTER(getColorType);
        static NAN_GETTER(getHeight);
        static NAN_GETTER(getWidth);
        static NAN_GETTER(getInterlaceType);
        static NAN_GETTER(getRowBytes);
        static NAN_GETTER(getOffsetX);
        static NAN_GETTER(getOffsetY);
        static NAN_GETTER(getPixelsPerMeterX);
        static NAN_GETTER(getPixelsPerMeterY);
        static NAN_METHOD(encode);
        static NAN_GETTER(getTime);
        static NAN_GETTER(getBackgroundColor);
        static NAN_GETTER(getPalette);
        static NAN_GETTER(getGamma);

        // C++ only constructor and destructor.
        explicit PngImage(png_structp &pngPtr, png_infop &infoPtr);
        ~PngImage();
        // Internal methods.
        v8::Local<v8::Object> convertColor(png_color_16p color);
        v8::Local<v8::Object> convertColor(png_colorp color);
        // libpng pointers.
        png_structp pngPtr;
        png_infop infoPtr;
};

#endif
