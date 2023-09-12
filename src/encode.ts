import { BoxParser, MP4File, MP4VideoTrack } from "mp4box";

const DEV = import.meta.env.DEV;

// VideoEncoderが持つキューの最大数
const ENCODE_QUEUE_MAX = 32;

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
    let framecnt = 0;
    let enqueuecnt = 0;

	/**
	 * transformで返されているPromiseのresolve
	 * これを実行することでデータ受信を再開する
	 */
	let allowWriteResolve: (() => void) | null = null;
	const emitResolve = () => {
		if (DEV) console.log('decode: emit resolve', allowWriteResolve);
		if (allowWriteResolve) {
			allowWriteResolve();
			allowWriteResolve = null;
		}
	};
	const allowWriteEval = () => framecnt <= enqueuecnt + ENCODE_QUEUE_MAX;

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

                    if (framecnt === enqueuecnt) {
                        if (DEV) console.log('encode: encoded: done', framecnt, enqueuecnt);
                        encoder.flush();
                        controller.terminate();
                    }
					if (allowWriteEval()) emitResolve();
                },
                error: (error) => {
                    console.error('encoder error', error);
                    controller.error(error);
                }
            });
            encoder.configure(config);
        },
        transform(frame, controller) {
            framecnt++;
            if (DEV) console.log('encode: frame', framecnt, frame);
            encoder.encode(frame);

			// safety
			emitResolve();

			if (allowWriteEval()) {
				if (DEV) console.log('encode: recieving vchunk: resolve immediate');
				return Promise.resolve();
			}
			if (DEV) console.log('encode: recieving vchunk: wait for allowWrite');
			return new Promise((resolve) => {
				allowWriteResolve = resolve;
            });
        },
        flush(controller) {
            if (DEV) console.log('encode: flush', framecnt, enqueuecnt);
            encoder.flush();
            controller.terminate();
        },
    });
}

const TIMESCALE = 90000;

export function writeEncodedVideoChunksToMP4File(file: MP4File, encoderConfig: VideoEncoderConfig, srcInfo: MP4VideoTrack) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    let trackId: number;
    let trak: BoxParser.trakBox;
    let samplecnt = 0;
    const scaleScale = TIMESCALE / srcInfo.timescale;
    return new WritableStream<VideoEncoderOutputChunk>({
        start() {
        },
        write(data) {
            if (data.type === 'metadata' && !trak) {
                trackId = file.addTrack({
                    timescale: TIMESCALE,
                    duration: Math.round(srcInfo.duration * scaleScale),
                    media_duration: Math.round(srcInfo.movie_duration * scaleScale),
                    language: srcInfo.language,
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
