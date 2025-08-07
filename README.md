# venc

## DEPRECATED

Use Mediabunny https://mediabunny.dev/

## About

Toolset for video resizing and re-encoding

Sample: https://venc2.vercel.app/

## Features
- [mp4box.js](https://github.com/gpac/mp4box.js/)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [WHATWG Streams API](https://developer.mozilla.org/ja/docs/Web/API/Streams_API)
- [OPFS](https://developer.mozilla.org/ja/docs/Web/API/File_System_API/Origin_private_file_system)

## WebCodecs API Implementation Status

|VideoEncoder|avc1|av01|
|:--|:-:|:-:|
|Safari 17.2|~high ＊1|❌|
|Safari 17.4 TP 191|~high ＊1|Main|
|Chrome|~high_progressive|Main|
|Firefox|❌|❌|

＊1: A bug exists in Safari 17.4 and older with all frames being keyframes. This has been fixed in `Safari TP Release 191 (Safari 17.4, WebKit 19619.1.6.3)`. See https://github.com/tamaina/venc2/issues/4

## References
https://github.com/vjeux/mp4-h264-re-encode
