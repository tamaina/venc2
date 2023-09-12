import { BoxParser, MP4File } from "mp4box";

const DEV = import.meta.env.DEV;

type VideoEncoderOutputEncodedVideoChunk = {
    type: 'encodedVideoChunk',
    data: EncodedVideoChunk,
};
type VideoEncoderOutputMetadata = {
    type: 'metadata',
    data: EncodedVideoChunkMetadata,
}
export type VideoEncoderOutputChunk = VideoEncoderOutputEncodedVideoChunk | VideoEncoderOutputMetadata;

/**
 * Returns a transform stream that encodes videoframes.
 * **Set preventClose: true** when using the stream with pipeThrough.
 */
export function generateVideoEncoderTransformStream(config: VideoEncoderConfig) {
    let encoder: VideoEncoder;
    let recievedcnt = 0;
    let enqueuecnt = 0;
    return new TransformStream<VideoFrame, VideoEncoderOutputChunk>({
        start(controller) {
            encoder = new VideoEncoder({
                output: (chunk, config) => {
                    enqueuecnt++;
                    if (config && Object.keys(config).length) {
                        controller.enqueue({ type: 'metadata', data: config });
                        if (DEV) console.log('encode: encoded: metadata', config);
                    }
                    controller.enqueue({ type: 'encodedVideoChunk', data: chunk });
                    if (DEV) console.log('encode: encoded', chunk);

                    if (recievedcnt === enqueuecnt) {
                        if (DEV) console.log('encode: encoded: done', recievedcnt, enqueuecnt);
                        controller.terminate();
                    }
                },
                error: (error) => {
                    console.error('encoder error', error);
                    controller.error(error);
                }
            });
            encoder.configure(config);
        },
        async transform(frame, controller) {
            recievedcnt++;
            if (DEV) console.log('encode: frame', recievedcnt, frame);
            encoder.encode(frame);
        },
        flush(controller) {
            encoder.flush();
            controller.terminate();
        },
    });
}

const TIMESCALE = 90000;

export function writeEncodedVideoChunksToMP4File(file: MP4File, encoderConfig: VideoEncoderConfig) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    let trackId: number;
    let trak: BoxParser.trakBox;
    let samplecnt = 0;
    return new WritableStream<VideoEncoderOutputChunk>({
        start() {
        },
        write(data) {
            if (data.type === 'metadata' && !trak) {
                trackId = file.addTrack({
                    timescale: TIMESCALE,
                    width: encoderConfig.width,
                    height: encoderConfig.height,
                    ...(encoderConfig.codec.startsWith('avc') ? {
                        avcDecoderConfigRecord: data.data.decoderConfig?.description,
                    } : encoderConfig.codec.startsWith('hevc') ? {
                        hevcDecoderConfigRecord: data.data.decoderConfig?.description,
                    } : {}),
                });
                trak = file.getTrackById(trackId)!;
                if (DEV) console.log('write: addTrack', trackId, trak);
                return;
            } else {
                samplecnt++;
                const chunk = data.data as EncodedVideoChunk;
                const b = new ArrayBuffer(chunk.byteLength);
                chunk.copyTo(b);
                const sample = file.addSample(trackId, b, {
                    cts: Math.round(chunk.timestamp * TIMESCALE / 1e6),
                    is_sync: chunk.type === 'key',
                });
                console.log('write: addSample', samplecnt, chunk, Math.round(chunk.timestamp * TIMESCALE / 1e6), chunk.type === 'key', sample);
            }

        },
        close() {
            if (DEV) console.log('write: close', file);
        },
    });
}
