#ifndef PNG_IMAGE_HPP
#define PNG_IMAGE_HPP

#include <nan.h>
#include <png.h>

class PngImage : public Nan::ObjectWrap {
    public:
        static NAN_MODULE_INIT(Init);

    private:

        static NAN_METHOD(New);

        static NAN_GETTER(bitDepth);
        static NAN_GETTER(channels);
        static NAN_GETTER(colorType);
        static NAN_GETTER(height);
        static NAN_GETTER(width);
        static NAN_GETTER(interlaceType);
        static NAN_GETTER(rowBytes);
        // static NAN_GETTER(lastModification);
        static NAN_GETTER(offsetX);
        static NAN_GETTER(offsetY);
        static NAN_GETTER(pixelsPerMeterX);
        static NAN_GETTER(pixelsPerMeterY);

        explicit PngImage(png_structp &pngPtr, png_infop &infoPtr);
        ~PngImage();

        png_structp pngPtr;
        png_infop infoPtr;
};

#endif
