import { VideoEncoderOutputChunk, VideoFrameAndIsKeyFrame, VideoKeyframeConfig } from "./type";

// VideoEncoderが持つキューの最大数
const ENCODE_QUEUE_MAX = 32;

export function validateVideoKeyFrameConfig(config?: VideoKeyframeConfig | undefined) {
    if (!config) return;
    if (config.type === 'microseconds') {
        if (config.interval < 0) throw new Error('videoKeyframeConfig.interval must be positive');
    }
}

/**
 * Returns a transform stream that encodes videoframes.
 * **Set preventClose: false** when using the stream with pipeThrough.
 */
export function generateVideoEncoderTransformStream(config: VideoEncoderConfig, videoKeyframeConfig: VideoKeyframeConfig | undefined, DEV = false) {
    let encoder: VideoEncoder;
    let framecnt = 0;
    let enqueuecnt = 0;
    let prevKeyFrameNumber = 0;

    validateVideoKeyFrameConfig(videoKeyframeConfig);

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

    return new TransformStream<VideoFrameAndIsKeyFrame, VideoEncoderOutputChunk>({
        start(controller) {
            encoder = new VideoEncoder({
                output: (chunk, metadata) => {
                    enqueuecnt++;
                    if (metadata && Object.keys(metadata).length) {
                        controller.enqueue({ type: 'metadata', data: metadata });
                        if (DEV) {
                            console.log(
                                'encode: encoded: metadata',
                                metadata,
                                Array.from(new Uint8Array(metadata.decoderConfig?.description as ArrayBuffer ?? new ArrayBuffer(0)))
                                    .map(n => n.toString(16).padStart(2, '0') as any)
                                    .join(' ')
                            );
                        }
                    }
                    controller.enqueue({ type: 'encodedVideoChunk', data: chunk });
                    if (DEV) console.log('encode: encoded', chunk.timestamp, enqueuecnt - 1, framecnt,  chunk, encoder.encodeQueueSize, metadata);

					if (allowWriteEval()) emitResolve();
                },
                error: (error) => {
                    console.error('encode: encoder error', error);
                    controller.error(error);
                }
            });

            try {
                encoder.configure(config);
            } catch (e) {
                console.error('encoder configure error', e);
                controller.error(e);
            }
        },
        async transform(frame, controller) {
            try {
                framecnt++;
                const keyFrame = (() => {
                    if (DEV) console.log('encode: keyframe decision:', framecnt, frame.frame.timestamp, videoKeyframeConfig);
                    if (framecnt === 1) return true;
                    if (!videoKeyframeConfig) {
                        return frame.isKeyFrame;
                    }
                    if (videoKeyframeConfig.type === 'microseconds') {
                        if (videoKeyframeConfig.interval === 0) return frame.isKeyFrame;
                        if (frame.frame.timestamp - prevKeyFrameNumber >= videoKeyframeConfig.interval) {
                            if (DEV) console.log('encode: keyframe decision: microseconds true:', framecnt, frame.frame.timestamp, prevKeyFrameNumber, videoKeyframeConfig.interval);
                            prevKeyFrameNumber = frame.frame.timestamp;
                            return true;
                        }
                        return false;
                    }

                    return frame.isKeyFrame;
                })();
    
                if (DEV) console.log('encode: frame:', framecnt, frame, keyFrame, encoder.encodeQueueSize);
    
                encoder.encode(frame.frame, {
                    keyFrame,
                });
                frame.frame.close();

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
            } catch (e) {
                console.error('encode: caught error', e);
                return Promise.resolve();
            }
        },
        async flush(controller) {
            if (DEV) console.log('encode: [terminate] flush', framecnt, enqueuecnt);
            return encoder.flush()
                .then(() => {
                    if (DEV) console.log('encode: [terminate] done', framecnt, enqueuecnt);
                    controller.terminate();
                });
            controller.terminate();
        },
    });
}
