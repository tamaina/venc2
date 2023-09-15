import { BrowserImageResizerConfigWithOffscreenCanvasOutput, readAndCompressImage } from "@misskey-dev/browser-image-resizer";
import { MP4VideoTrack } from "@webav/mp4box.js";

const TIMESTAMP_MARGINS = [0, -1, 1, -2, 2];
/**
 * Returns a transform stream that sorts videoframes by timestamp and duration.
 * **Set preventClose: true** when using the stream with pipeThrough.
 * 
 * SafariのVideoDecoderはtimestamp通りにフレームを出力してくれないのでこれが必要
 * 
 * 壊れたmp4が来た場合、timestampが飛んでいる場合がある。その場合は最後に送信したtimestamp以降のフレームを送信する
 */
export function generateVideoSortTransformer(videoInfo: MP4VideoTrack, data: { nbSamples: number }, DEV = false) {
	let expectedNextTimestamp = 0;
	const cache = new Map<number, VideoFrame>();
	let recievedcnt = 0;
	let enqueuecnt = 0;
	const totalcnt = videoInfo.nb_samples;

	function send(controller: TransformStreamDefaultController<VideoFrame>, incoming: VideoFrame, _buffer?: Set<VideoFrame>) {
		if (DEV) console.log('sort: send: trying to send', expectedNextTimestamp, incoming, cache.keys());

		// 前のフレームをenqueueしてしまうと次の処理でframeがcloseされてしまう可能性があるため、
		// バッファに入れておいてまとめてexpectedNextTimestampに当てはまるフレームが来るまでenqueueする
		const buffer = _buffer ?? new Set<VideoFrame>();

		cache.set(incoming.timestamp, incoming);

		for (const margin of TIMESTAMP_MARGINS) {
			const timestamp = expectedNextTimestamp + margin;
			if (incoming?.timestamp === timestamp) {
				buffer.add(incoming);
				cache.delete(incoming.timestamp);
				expectedNextTimestamp = timestamp + (incoming.duration ?? 0);
				break;
			}
			if (cache.size && cache.has(timestamp)) {
				const frame = cache.get(timestamp)!;
				buffer.add(frame);
				cache.delete(timestamp);

				if (frame?.duration) {
					expectedNextTimestamp = timestamp + frame.duration;
					send(controller, frame, buffer);
					return;
				}
			}
		}

		if (buffer.size > 0) {
			if (DEV) console.log('sort: send: enqueue buffer', buffer, buffer.size);
			for (const frame of buffer) {
				controller.enqueue(frame);
				cache.delete(frame.timestamp);
				enqueuecnt++;
				if (DEV) console.log('sort: send: enqueue buffer: sending frame', frame.timestamp, recievedcnt, enqueuecnt, cache.size);
			}
			return;
		} else {
			if (DEV) console.log('sort: send: no frame to enqueue');
		}
	}

	return new TransformStream<VideoFrame, VideoFrame>({
		start() {},
		transform(frame, controller) {
			recievedcnt++
			if (DEV) console.log('sort: recieving frame', frame.timestamp, recievedcnt, enqueuecnt, cache.size);

			if (frame.timestamp < expectedNextTimestamp) {
				console.error('sort: recieving frame: drop frame', frame.timestamp, expectedNextTimestamp);
				data.nbSamples--;
				frame.close();
				return;
			}

			if (recievedcnt === totalcnt) {
				// 最後のフレームを受信した場合片付ける
				if (DEV) console.log('sort: recieving frame: last frame', frame.timestamp, cache);
				for (const timestamp of Array.from(cache.keys()).filter(x => x >= expectedNextTimestamp).sort((a, b) => a - b)) {
					// キャッシュを全てenqueueする
					if (DEV) console.log('sort: recieving frame: enqueue cache', timestamp);
					controller.enqueue(cache.get(timestamp)!);
					cache.delete(timestamp);
				}
				if (frame.timestamp >= expectedNextTimestamp) {
					if (DEV) console.log('sort: recieving frame: enqueue last frame', frame.timestamp);
					controller.enqueue(frame);
				} else {
					if (DEV) console.error('sort: recieving frame: drop last frame', frame.timestamp, expectedNextTimestamp);
				}
				if (DEV) console.log('sort: recieving frame: [terminate]', totalcnt, data.nbSamples);
				controller.terminate();
				return;
			}

			if (cache.size >= 14) {
				// cacheが多すぎる場合何らかの不整合が発生していると思われるため、
				// 最小のtimestampを探してexpectedNextTimestampとする
				// （14にしているのは、Chromeだと15以上にすると動かなくなるため）
				// 最初のtimestampが0でない場合もこの処理が必要
				console.error('sort: recieving frame: cache is too large', frame.timestamp, expectedNextTimestamp, Array.from(cache.keys()));
				for (const timestamp of cache.keys()) {
					if (timestamp < expectedNextTimestamp) {
						cache.get(timestamp)?.close();
						cache.delete(timestamp);
						data.nbSamples--;
					}
				}
				expectedNextTimestamp = Math.min(...cache.keys());
				if (DEV) console.log('sort: recieving frame: cache is too large (cache and expectedNextTimestamp fixed)', Array.from(cache.keys()), expectedNextTimestamp);
			}
			send(controller, frame);
		},
		flush(controller) {
			if (DEV) console.log('sort: [terminate] frame flush');
            controller.terminate();
		},
	});
}

export function floorWithSignificance(value: number, significance: number) {
    return Math.floor(value / significance) * significance;
}

/**
 * Returns a transform stream that resizes videoframes by `@misskey-dev/browser-image-resizer`.
 * **Set preventClose: false** when using the stream with pipeThrough.
 * 
 * @param config Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>
 * @returns TransformStream<VideoFrame, VideoFrame>
 * 
 */
export function generateResizeTransformer(config: Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>, DEV = false) {
    let framecnt = 0;
    return new TransformStream<VideoFrame, VideoFrame>({
        start() {},
        async transform(srcFrame, controller) {
            framecnt++;
            if (DEV) {
                performance.mark('resize start');
                console.log('resize: recieved', framecnt, srcFrame);
            }
            const canvas = await readAndCompressImage(srcFrame, {
                ...config,
                mimeType: null,
            });
            srcFrame.close();
            const dstFrame = new VideoFrame(canvas, {
                timestamp: srcFrame.timestamp,
				//duration: srcFrame.duration ?? undefined,
            });
            if (DEV) {
                performance.mark('resize end');
                console.log('resize: transform', framecnt, performance.measure('resize', 'resize start').duration, dstFrame);
            }
            controller.enqueue(dstFrame);
        },
        flush(controller) {
            if (DEV) console.log('resize: [terminate]  cache is too large flush')
            controller.terminate();
        },
    });
}
