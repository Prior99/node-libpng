{
    "targets" : [
        {
            "target_name" : "node-libpng",
            "dependencies" : [
                "deps/binding.gyp:libpng"
            ],
            "cflags" : [
                "-Wall",
                "-Wno-unused-parameter",
                "-Wno-missing-field-initializers",
                "-Wextra"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ],
            "sources" : [
                "native/module.cpp",
                "native/is-png.cpp",
                "native/png-image.cpp"
            ]
        }
    ]
}

