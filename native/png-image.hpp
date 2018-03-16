#ifndef PNG_IMAGE_HPP
#define PNG_IMAGE_HPP

#include <nan.h>
#include <png.h>

class PngImage : public Nan::ObjectWrap {
    public:
        static NAN_MODULE_INIT(Init);

    private:

        static NAN_METHOD(New);

        static NAN_GETTER(getBitDepth);
        static NAN_GETTER(getChannels);
        static NAN_GETTER(getColorType);
        static NAN_GETTER(getHeight);
        static NAN_GETTER(getWidth);
        static NAN_GETTER(getInterlaceType);
        static NAN_GETTER(getRowBytes);
        // static NAN_GETTER(getLastModification);
        static NAN_GETTER(getOffsetX);
        static NAN_GETTER(getOffsetY);
        static NAN_GETTER(getPixelsPerMeterX);
        static NAN_GETTER(getPixelsPerMeterY);

        explicit PngImage(png_structp &pngPtr, png_infop &infoPtr, uint32_t inputSize, uint8_t *dataIn);
        ~PngImage();
        void readCallback(png_structp _, png_bytep target, png_size_t length);

        png_structp pngPtr;
        png_infop infoPtr;
        uint32_t inputSize;
        uint32_t consumed;
        uint8_t *dataIn;
};

#endif
