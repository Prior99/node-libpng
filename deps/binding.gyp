{
    "target_defaults" : {
        "default_configuration" : "Debug",
        "configuration" : {
            "Debug" : {
                "defines" : ["DEBUG", "_DEBUG"]
            },
            "Release" : {
                "defines" : ["NODEBUG"]
            }
        }
    },
    "targets" : [
        {
            "target_name" : "libpng",
            "type" : "static_library",
            "cflags" : [
                "-Wall",
                "-Wno-unused-parameter",
                "-Wno-missing-field-initializers",
                "-Wextra"
            ],
            "include_dirs": [
                "config/linux/"
            ],
            "sources" : [
                "libpng/png.c",
                "libpng/pngerror.c",
                "libpng/pngget.c",
                "libpng/pngmem.c",
                "libpng/pngpread.c",
                "libpng/pngread.c",
                "libpng/pngrio.c",
                "libpng/pngrtran.c",
                "libpng/pngrutil.c",
                "libpng/pngset.c",
                "libpng/pngtest.c",
                "libpng/pngtrans.c",
                "libpng/pngwio.c",
                "libpng/pngwrite.c",
                "libpng/pngwtran.c",
                "libpng/pngwutil.c"
            ]
        }
    ]
}
