{
    "targets" : [
        {
            "target_name" : "zlib",
            "type" : "static_library",
            "cflags" : [],
            "include_dirs": [
                "config/<(OS)/",
                "zlib"
            ],
            "sources" : [
                "zlib/adler32.c",
                "zlib/compress.c",
                "zlib/crc32.c",
                "zlib/deflate.c",
                "zlib/gzclose.c",
                "zlib/gzlib.c",
                "zlib/gzread.c",
                "zlib/gzwrite.c",
                "zlib/infback.c",
                "zlib/inffast.c",
                "zlib/inflate.c",
                "zlib/inftrees.c",
                "zlib/trees.c",
                "zlib/uncompr.c",
                "zlib/zutil.c"
            ]
        }
    ]
}
