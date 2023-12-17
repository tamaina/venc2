import { MP4VideoTrack, Sample } from '@webav/mp4box.js';
import { VideoFrameAndIsKeyFrame } from './type';

// VideoDecoderが持つキューの最大数
const DECODE_QUEUE_MAX = 128;

// デコードのTransformStreamのhighWaterMark
const DECODE_HWM = 16;

/**
 * Returns a transform stream that transforms Sample to EncodedVideoChunk.
 * **Set preventClose: false** when using the stream with pipeThrough.
 * 
 * @returns TransformStream<Sample, EncodedVideoChunk>
 */
export const generateSampleToEncodedVideoChunkTransformer = (DEV = false) => {
	return new TransformStream<Sample, EncodedVideoChunk>({
		start() {},
		transform(sample, controller) {
			controller.enqueue(new EncodedVideoChunk({
				type: sample.is_sync ? 'key' : 'delta',
				timestamp: 1e6 * sample.cts / sample.timescale,
				duration: 1e6 * sample.duration / sample.timescale,
				data: sample.data,
			}));
		},
		flush(controller) {
			if (DEV) console.log('sample: [terminate] sample flush');
			controller.terminate();
		},
	});
}

/**
 * Returns a transform stream that decodes video frames from a mp4 file stream (Blob.stream).
 * **Set preventClose: true** when using the stream with pipeThrough.
 * 
 * @param file Source file (mp4)
 * @returns TransformStream<Sample, VideoFrameAndIsKeyFrame>
 */
export async function generateVideoDecodeTransformer(videoInfo: MP4VideoTrack, description: BufferSource, orderConfig: Partial<VideoDecoderConfig>, DEV = false) {
	let samplecnt = 0;
	let framecnt = 0;
	let decoder: VideoDecoder;

	// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L82
	const config = {
		codec: videoInfo.codec.startsWith('vp08') ? 'vp8' : videoInfo.codec,
		hardwareAcceleration: 'prefer-hardware' as const,
		...orderConfig,
		codedHeight: videoInfo.track_height,
		codedWidth: videoInfo.track_width,
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
		async start(controller) {
			decoder = new VideoDecoder({
				output: (frame) => {
					if (frame) {
						framecnt++;
						if (DEV) console.log('decode: enqueue frame', frame.timestamp, keyFrames.has(framecnt), framecnt, videoInfo.nb_samples);
						controller.enqueue({
							frame: frame.clone(),
							isKeyFrame: keyFrames.has(framecnt),
						});
						frame.close();
					}
					if (allowWriteEval()) emitResolve();
					if (framecnt === videoInfo.nb_samples) {
						if (DEV) console.log('decode: enqueue frame: [terminate] last frame', videoInfo.nb_samples, framecnt);
						controller.terminate();
					}
				},
				error: (e) => {
					console.error('decode: decoder error', e);
					controller.error(e);
				}
			});

			decoder.configure(config);
		},
		transform(vchunk, controller) {
			samplecnt++;
			if (vchunk.type === 'key') {
				keyFrames.add(samplecnt);
			}
			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
			decoder.decode(vchunk);
			if (DEV) console.log('decode: recieving vchunk', samplecnt, framecnt, decoder.decodeQueueSize);

			// safety
			emitResolve();

			if (samplecnt === videoInfo.nb_samples) {
				if (DEV) console.log('decode: recieving vchunk: last chunk', videoInfo.nb_samples, samplecnt);
				decoder.flush();
				return Promise.resolve();
			}
			if (allowWriteEval()) {
				if (DEV) console.log('decode: recieving vchunk: resolve immediate');
				return Promise.resolve();
			}
			if (DEV) console.log('decode: recieving vchunk: wait for allowWrite');
			return new Promise<void>((resolve) => {
				allowWriteResolve = resolve;
			});
		},
		flush(controller) {
			if (DEV) console.log('decode: [terminate] vchunk flush');
			controller.terminate();
			return decoder.flush();
		},
	}, {
		highWaterMark: DECODE_HWM,
	});
}
