import { VideoEncoderOutputChunk } from "./type";

// VideoEncoderが持つキューの最大数
const ENCODE_QUEUE_MAX = 32;

/**
 * Returns a transform stream that encodes videoframes.
 * **Set preventClose: true** when using the stream with pipeThrough.
 */
export function generateVideoEncoderTransformStream(config: VideoEncoderConfig, sharedData: { getResultSamples: () => number }, DEV = false) {
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
                    if (DEV) console.log('encode: encoded', chunk.timestamp, enqueuecnt - 1, framecnt, chunk, encoder.encodeQueueSize, metadata);

                    if (enqueuecnt === sharedData.getResultSamples()) {
                        if (DEV) console.log('encode: encoded: [terminate] done', framecnt, sharedData.getResultSamples());
                        encoder.flush();
                        controller.terminate();
                    }
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
        transform(frame, controller) {
            framecnt++;
            if (DEV) console.log('encode: frame', framecnt, frame, encoder.encodeQueueSize);

            encoder.encode(frame);
            frame.close();

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
            if (DEV) console.log('encode: [terminate] flush', framecnt, enqueuecnt);
            encoder.flush();
            controller.terminate();
        },
    });
}
