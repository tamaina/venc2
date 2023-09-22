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
export function generateVideoSortTransformer(
	videoInfo: MP4VideoTrack,
	sharedData: { dropFrames: number; getResultSamples: () => number; shiftDuration?: number; },
	DEV = false
) {
	let expectedNextTimestamp = 0;
	let prevTimestamp = 0;

	function getDuration(timestamp: number) {
		const duration = timestamp - prevTimestamp;
		prevTimestamp = timestamp;
		return duration;
	}

	const cache = new Map<number, VideoFrame>();
	let recievedcnt = 0;
	let enqueuecnt = 0;

	function dropByCache(timestamp: number) {
		cache.get(timestamp)?.close();
		cache.delete(timestamp);
		sharedData.dropFrames++;
	}
	function enqueue(frame: VideoFrame, controller: TransformStreamDefaultController<VideoFrame>) {
		controller.enqueue(new VideoFrame(frame, {
			timestamp: frame.timestamp,
			duration: getDuration(frame.timestamp),
			visibleRect: frame.visibleRect ?? undefined,
		}));
		frame.close();
		enqueuecnt++;
	}
	function enqueueByCache(timestamp: number, controller: TransformStreamDefaultController<VideoFrame>) {
		const frame = cache.get(timestamp)!;
		enqueue(frame, controller);
		cache.delete(timestamp);
	}

	function send(controller: TransformStreamDefaultController<VideoFrame>, incoming: VideoFrame, _timestamps?: Set<number>) {
		if (DEV) console.log('sort: send: trying to send', expectedNextTimestamp, incoming, cache.keys());

		// 前のフレームをenqueueしてしまうと次の処理でframeがcloseされてしまう可能性があるため、
		// バッファに入れておいてまとめてexpectedNextTimestampに当てはまるフレームが来るまでenqueueする
		const timestamps = _timestamps ?? new Set<number>();

		cache.set(incoming.timestamp, incoming);

		for (const margin of TIMESTAMP_MARGINS) {
			const timestamp = expectedNextTimestamp + margin;
			if (incoming?.timestamp === timestamp) {
				timestamps.add(incoming.timestamp);
				expectedNextTimestamp = timestamp + (incoming.duration ?? 0);
				break;
			}
			if (cache.size && cache.has(timestamp)) {
				timestamps.add(timestamp);
				const frame = cache.get(timestamp)!;

				if (frame.duration) {
					expectedNextTimestamp = timestamp + frame.duration;
					send(controller, frame, timestamps);
					return;
				}
			}
		}

		if (timestamps.size > 0) {
			if (DEV) console.log('sort: send: enqueue buffer', timestamps, timestamps.size);
			for (const frame of timestamps) {
				enqueueByCache(frame, controller);
				if (DEV) console.log('sort: send: enqueue buffer: sending frame', frame, recievedcnt, enqueuecnt, cache.size);
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
				sharedData.dropFrames++;
				frame.close();
				return;
			}

			if (recievedcnt === videoInfo.nb_samples) {
				// 最後のフレームを受信した場合片付ける
				cache.set(expectedNextTimestamp, frame);
				if (DEV) console.log('sort: recieving frame: last frame', frame.timestamp, cache);
				for (const timestamp of Array.from(cache.keys()).sort((a, b) => a - b)) {
					// キャッシュを全てenqueueする
					if (timestamp < expectedNextTimestamp) {
						if (DEV) console.error('sort: recieving frame: drop frame', timestamp, expectedNextTimestamp);
						dropByCache(timestamp);
					} else {
						if (DEV) console.log('sort: recieving frame: enqueue cache', timestamp);
						const f = cache.get(timestamp)!;
						expectedNextTimestamp = timestamp + (f.duration ?? 0);
						enqueue(f, controller);
						cache.delete(timestamp);
					}
				}
				if (DEV) console.log('sort: recieving frame: [terminate]', enqueuecnt, sharedData.dropFrames, sharedData.getResultSamples());
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
						dropByCache(timestamp);
					}
				}
				expectedNextTimestamp = Math.min(...cache.keys());
				if (!('shiftDuration' in sharedData)) {
					sharedData.shiftDuration = expectedNextTimestamp;
				}
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
				duration: srcFrame.duration ?? undefined,
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
