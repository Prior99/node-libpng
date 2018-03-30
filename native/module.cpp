#include <nan.h>

#include "is-png.hpp"
#include "encode.hpp"
#include "png-image.hpp"
#include "resize.hpp"
#include "copy.hpp"

NAN_MODULE_INIT(InitNodeLibPng) {
    PngImage::Init(target);
    InitIsPng(target);
    InitEncode(target);
    InitResize(target);
    InitCopy(target);
}

NODE_MODULE(node_libpng, InitNodeLibPng)
