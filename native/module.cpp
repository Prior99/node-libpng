#include <nan.h>

#include "is-png.hpp"
#include "encode.hpp"
#include "png-image.hpp"

NAN_MODULE_INIT(InitNodeLibPng) {
    PngImage::Init(target);
    InitIsPng(target);
    InitEncode(target);
}

NODE_MODULE(node_libpng, InitNodeLibPng)
