import { BoxParser, MP4AudioTrack, MP4File, MP4VideoTrack, Sample } from "@webav/mp4box.js";

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
export function generateVideoEncoderTransformStream(config: VideoEncoderConfig, data: { nbSamples: number }, DEV = false) {
    let encoder: VideoEncoder;
    let framecnt = 0;
    let enqueuecnt = 0;

	/**
	 * transformで返されているPromiseのresolve
	 * これを実行することでデータ受信を再開する
	 */
	let allowWriteResolve: (() => void) | null = null;
	const emitResolve = () => {
		if (DEV) console.log('encode: emit resolve', allowWriteResolve);
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
                    if (DEV) console.log('encode: encoded', framecnt, chunk, encoder.encodeQueueSize);

                    if (framecnt === data.nbSamples) {
                        if (DEV) console.log('encode: encoded: done', framecnt, data.nbSamples);
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
            if (DEV) console.log('encode: frame', framecnt, frame, encoder.encodeQueueSize);

            encoder.encode(frame);

			// safety
			emitResolve();

			if (allowWriteEval()) {
				if (DEV) console.log('encode: recieving vchunk: resolve immediate');
				return Promise.resolve();
			}
			if (DEV) console.log('encode: recieving vchunk: wait for allowWrite');

			return new Promise<void>((resolve) => {
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

export function writeEncodedVideoChunksToMP4File(file: MP4File, encoderConfig: VideoEncoderConfig, srcInfo: MP4VideoTrack, DEV = false) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    let trackId: number;
    let trak: BoxParser.trakBox;
    let samplecnt = 0;
    let prevChunk: EncodedVideoChunk;
    let currentChunk: EncodedVideoChunk | null;
    const TIMESCALE = srcInfo.timescale || 90000;    
    const scaleScale = TIMESCALE / srcInfo.timescale;

    return new WritableStream<VideoEncoderOutputChunk>({
        start() {
        },
        write(data) {
            if (data.type === 'metadata' && !trak) {
                const media_duration = Math.round(srcInfo.duration * scaleScale);
                trackId = file.addTrack({
                    name: 'VideoHandle',
                    timescale: TIMESCALE,
                    duration: media_duration,
                    media_duration: media_duration,
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
                if ((trak as any).tkhd) {
                    (trak as any).tkhd.set('matrix', (srcInfo as any).matrix)
                }
                if (DEV) console.log('write: addTrack', trackId, trak);
                return;
            } else {
                samplecnt++;
                if (!prevChunk) {
                    prevChunk = data.data as EncodedVideoChunk;
                    return;
                }

                currentChunk = data.data as EncodedVideoChunk;
                const b = new ArrayBuffer(prevChunk.byteLength);
                prevChunk.copyTo(b);
                const sample = file.addSample(trackId, b, {
                    cts: Math.round(prevChunk.timestamp * TIMESCALE / 1e6),
                    dts: Math.round(prevChunk.timestamp * TIMESCALE / 1e6),
                    duration: Math.round((currentChunk.timestamp - prevChunk.timestamp) * TIMESCALE / 1e6),
                    is_sync: prevChunk.type === 'key',
                });
                prevChunk = currentChunk;
                currentChunk = null;
                if (DEV) console.log('write: addSample', samplecnt - 1, sample);
            }

        },
        close() {
            const b = new ArrayBuffer(prevChunk.byteLength);
            prevChunk.copyTo(b);
            const sample = file.addSample(trackId, b, {
                cts: Math.round(prevChunk.timestamp * TIMESCALE / 1e6),
                dts: Math.round(prevChunk.timestamp * TIMESCALE / 1e6),
                duration: Math.round(((srcInfo.duration / srcInfo.timescale) * 1e6 - prevChunk.timestamp) * TIMESCALE / 1e6),
            })
            if (DEV) console.log('write: addSample last', samplecnt, sample);
            file.setSegmentOptions(trackId, null, { nbSamples: samplecnt });
            if (DEV) console.log('write: close', file);
        },
    });
}

export function writeAudioSamplesToMP4File(file: MP4File, srcInfo: MP4AudioTrack, DEV = false) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    const trackId = file.addTrack({
        type: srcInfo.codec.split('.')[0],
        hdlr: 'soun',
        name: 'SoundHandle',
        timescale: srcInfo.timescale,

        duration: srcInfo.duration,
        media_duration: srcInfo.duration,
        language: srcInfo.language,
        width: 0,
        height: 0,

        channel_count: srcInfo.audio.channel_count,
        samplerate: srcInfo.audio.sample_rate,
        samplesize: srcInfo.audio.sample_size,
    });

    if (DEV) console.log('write audio: addTrack', trackId);
    let samplecnt = 0;
    return new WritableStream<Sample>({
        start() {
        },
        write(sample) {
                samplecnt++;
                const res = file.addSample(trackId, sample.data, {
                    //sample_description_index: sample.description_index,
                    duration: sample.duration,
                    cts: sample.cts,
                    dts: sample.dts,
                    is_sync: sample.is_sync,
                    is_leading: sample.is_leading,
                    depends_on: sample.depends_on,
                    is_depended_on: sample.is_depended_on,
                    has_redundancy: sample.has_redundancy,
                    degradation_priority: sample.degradation_priority,
                    subsamples: sample.subsamples,
                });
                if (DEV) console.log('write audio: addSample', samplecnt, sample, res);
        },
        close() {
            file.setSegmentOptions(trackId, null, { nbSamples: samplecnt });
            if (DEV) console.log('write audio: close', file);
        },
    });
}
