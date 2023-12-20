import { MP4VideoTrack, Sample } from '@webav/mp4box.js';
import { VideoFrameAndIsKeyFrame } from './type';

// VideoDecoderが持つキューの最大数
const DECODE_QUEUE_MAX = 32;

// デコードのTransformStreamのhighWaterMark
const DECODE_HWM = 16;

/**
 * Returns a transform stream that transforms Sample to EncodedVideoChunk.
 * 
 * @returns TransformStream<Sample, EncodedVideoChunk>
 */
export const generateSampleToEncodedVideoChunkTransformer = (DEV = false) => {
	return new TransformStream<Sample, EncodedVideoChunk>({
		start() {},
		transform(sample, controller) {
			try {
				const chunk = new EncodedVideoChunk({
					type: sample.is_sync ? 'key' : 'delta',
					timestamp: 1e6 * sample.cts / sample.timescale,
					duration: 1e6 * sample.duration / sample.timescale,
					data: sample.data,
				});
				if (DEV) console.log('sample: transform from sample to EncodedVideoChunk', sample, chunk);
				controller.enqueue(chunk);
			} catch (e) {
				console.error('sample: caught error', e);
			}
		},
		flush(controller) {
			if (DEV) console.log('sample: [terminate] sample flush');
			controller.terminate();
		},
	});
}

/**
 * Returns a transform stream that decodes video frames from a mp4 file stream (Blob.stream).
 * 
 * @param file Source file (mp4)
 * @returns TransformStream<Sample, VideoFrameAndIsKeyFrame>
 */
export async function generateVideoDecodeTransformer(
	videoInfo: MP4VideoTrack,
	description: BufferSource,
	orderConfig: Partial<VideoDecoderConfig>,
	sharedData: { dropFramesOnDecoding: number; startTimeShift?: number; },
	DEV = false,
) {
	let samplecnt = 0;
	let framecnt = 0;
	let decoder: VideoDecoder;

	// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L82
	const config = {
		codec: videoInfo.codec.startsWith('vp08') ? 'vp8' : videoInfo.codec,
		hardwareAcceleration: 'prefer-software' as const,
		optimizeForLatency: false,
		...orderConfig,
		codedHeight: videoInfo.video.height,
		codedWidth: videoInfo.video.width,
		description,
	};
	if (DEV) console.log('decode: configure', config);
	await VideoDecoder.isConfigSupported(config);

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
	const allowWriteEval = () => samplecnt <= framecnt + DECODE_QUEUE_MAX;

	const keyFrames = new Set<number>();

	return new TransformStream<EncodedVideoChunk, VideoFrameAndIsKeyFrame>({
		start(controller) {
			decoder = new VideoDecoder({
				output: (frame) => {
					if (frame) {
						try {
							if (DEV) console.log('decode: enqueue frame:', frame.timestamp, keyFrames.has(framecnt), framecnt, videoInfo.nb_samples, decoder.decodeQueueSize);
							framecnt++;
							controller.enqueue({
								frame,
								isKeyFrame: keyFrames.has(frame.timestamp),
							});
						} catch (e) {
							console.error('decode: enqueue frame: caught error', e);
						}
					} else {
						console.error('decode: enqueue frame: no frame output??');
					}
					if (allowWriteEval()) emitResolve();
				},
				error: (e) => {
					console.error('decode: decoder error', e);
					controller.error(e);
				}
			});

			decoder.configure(config);
		},
		transform(vchunk, controller) {
			try {
				samplecnt++;
				if (vchunk.type === 'key') {
					keyFrames.add(vchunk.timestamp);
				}
	
				if (DEV) console.log('decode: recieving vchunk:', samplecnt, framecnt, decoder.decodeQueueSize);
				if (decoder.state !== 'configured') {
					console.error('decode: recieving vchunk: decoder state is strange', decoder.state);
					return Promise.resolve();
				} else {
					// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
					decoder.decode(vchunk);
				}
	
				// safety
				emitResolve();

				if (allowWriteEval()) {
					if (DEV) console.log('decode: recieving vchunk: resolve immediate');
					return Promise.resolve();
				}
				if (DEV) console.log('decode: recieving vchunk: wait for allowWrite');
				return new Promise<void>((resolve) => {
					allowWriteResolve = resolve;
				});
			} catch (e) {
				console.error('decode: caught error', e);
				return Promise.resolve();
			}
		},
		async flush(controller) {
			if (DEV) console.log('decode: [terminate] vchunk flush');
			return decoder.flush()
				.then(() => {
					if (DEV) console.log('decode: [terminate] decoder flushed!!!', videoInfo.nb_samples, framecnt);

					// VideoDecoder(特にprefer-software)はフレームを捨てるため記録しておく
					// https://github.com/tamaina/venc2/issues/10
					sharedData.dropFramesOnDecoding = videoInfo.nb_samples - framecnt;
					controller.terminate();
				});
			controller.terminate();
		},
	}, {
		highWaterMark: DECODE_HWM,
	});
}
