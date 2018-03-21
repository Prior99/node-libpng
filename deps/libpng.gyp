{
    "targets" : [
        {
            "dependencies": [
                "zlib.gyp:zlib"
            ],
            "target_name" : "libpng",
            "type" : "static_library",
            "cflags" : [],
            "direct_dependent_settings": {
                "include_dirs": [
                    "./config/linux/",
                    "./libpng"
                ]
            },
            "include_dirs": [
                "./config/<(OS)",
                "./libpng"
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
