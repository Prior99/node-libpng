#include <nan.h>

#include "is-png.hpp"
#include "encode.hpp"
#include "png-image.hpp"
#include "resize.hpp"
#include "copy.hpp"
#include "fill.hpp"

NAN_MODULE_INIT(InitNodeLibPng) {
    PngImage::Init(target);
    InitIsPng(target);
    InitEncode(target);
    InitResize(target);
    InitCopy(target);
    InitFill(target);
}

NODE_MODULE(node_libpng, InitNodeLibPng)
