#include <png.h>
#include <node_buffer.h>

#include "is-png.hpp"

using namespace node;
using namespace v8;

NAN_METHOD(isPng) {
    // 1st Parameter: The input buffer.
    Local<Object> inputBuffer = Local<Object>::Cast(info[0]);

    auto lengthIn = Buffer::Length(inputBuffer);
    auto *dataIn = reinterpret_cast<uint8_t*>(Buffer::Data(inputBuffer)); //Buffer for inputdata, as short array
    if (lengthIn < 8) {
        info.GetReturnValue().Set(Nan::False());
        return;
    }
    if (png_sig_cmp(dataIn, 0, 8)) {
        info.GetReturnValue().Set(Nan::False());
        return;
    }
    info.GetReturnValue().Set(Nan::True());
}

NAN_MODULE_INIT(InitIsPng) {
    Nan::Set(target, Nan::New("__native_isPng").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(isPng)).ToLocalChecked());
}
