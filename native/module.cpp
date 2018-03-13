#include <nan.h>

#include "is-png.hpp"
#include "png-image.hpp"

NAN_MODULE_INIT(InitNodeLibPng) {
    PngImage::Init(target);
    InitIsPng(target);
}

NODE_MODULE(node_libpng, InitNodeLibPng)
