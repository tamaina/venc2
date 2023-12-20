import { BrowserImageResizerConfigWithOffscreenCanvasOutput, readAndCompressImage } from "@misskey-dev/browser-image-resizer";
import { MP4VideoTrack } from "@webav/mp4box.js";
import { VideoFrameAndIsKeyFrame } from "./type";

const TIMESTAMP_MARGINS = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
/**
 * Returns a transform stream that sorts videoframes by timestamp and duration.
 * 
 * SafariのVideoDecoderはtimestamp通りにフレームを出力してくれないのでこれが必要
 * 
 * 壊れたmp4が来た場合、timestampが飛んでいる場合がある。その場合は最後に送信したtimestamp以降のフレームを送信する
 */
export function generateVideoSortTransformer(
	videoInfo: MP4VideoTrack,
	sharedData: { dropFrames: number; dropFramesOnDecoding: number; getResultSamples: () => number; startTimeShift?: number; },
	DEV = false
) {
	let expectedNextTimestamp = 0;
	let prevTimestamp = 0;

	const cache = new Map<number, VideoFrameAndIsKeyFrame>();
	let recievedcnt = 0;
	let enqueuecnt = 0;

	function dropByCache(timestamp: number) {
		cache.get(timestamp)?.frame.close();
		cache.delete(timestamp);
		sharedData.dropFrames++;
	}
	function enqueue(f: VideoFrameAndIsKeyFrame, controller: TransformStreamDefaultController<VideoFrameAndIsKeyFrame>) {
		enqueuecnt++;
		const prefferedDuration = f.frame.timestamp - prevTimestamp;
		if (DEV) console.log('sort: enqueue: prefferedDuration', enqueuecnt, prefferedDuration, prevTimestamp, f.frame.timestamp, f.frame.duration, f.frame);
		prevTimestamp = f.frame.timestamp;

		if (f.frame.duration !== prefferedDuration) {
			const frame = new VideoFrame(f.frame, {
				timestamp: f.frame.timestamp,
				duration: prefferedDuration,
				visibleRect: f.frame.visibleRect ?? undefined,
			});
			f.frame.close();
			controller.enqueue({
				frame,
				isKeyFrame: f.isKeyFrame,
			});
		} else {
			// そのままenqueueする
			controller.enqueue(f);
		}
	}
	function enqueueByCache(timestamp: number, controller: TransformStreamDefaultController<VideoFrameAndIsKeyFrame>) {
		const frame = cache.get(timestamp)!;
		enqueue(frame, controller);
		cache.delete(timestamp);
	}

	function send(controller: TransformStreamDefaultController<VideoFrameAndIsKeyFrame>, incoming: VideoFrameAndIsKeyFrame, _timestamps?: Set<number>) {
		if (DEV) console.log('sort: send: trying to send', expectedNextTimestamp, incoming, cache.keys());

		// 前のフレームをenqueueしてしまうと次の処理でframeがcloseされてしまう可能性があるため、
		// バッファに入れておいてまとめてexpectedNextTimestampに当てはまるフレームが来るまでenqueueする
		const timestamps = _timestamps ?? new Set<number>();

		cache.set(incoming.frame.timestamp, incoming);

		for (const margin of TIMESTAMP_MARGINS) {
			const timestamp = expectedNextTimestamp + margin;
			if (incoming?.frame.timestamp === timestamp) {
				timestamps.add(incoming.frame.timestamp);
				expectedNextTimestamp = timestamp + (incoming.frame.duration ?? 0);
				break;
			}
			if (cache.size && cache.has(timestamp)) {
				timestamps.add(timestamp);
				const frame = cache.get(timestamp)!;

				if (frame.frame.duration) {
					expectedNextTimestamp = timestamp + frame.frame.duration;
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

	return new TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>({
		start() {},
		transform(frame, controller) {
			try {
				recievedcnt++
				if (DEV) console.log('sort: recieving frame', frame.frame.timestamp, recievedcnt, videoInfo.nb_samples, enqueuecnt, sharedData, cache.size);
				if (cache.has(frame.frame.timestamp)) {
					console.error('sort: recieving frame: timestamp duplicated', frame.frame.timestamp);
					dropByCache(frame.frame.timestamp);
				}
	
				if (frame.frame.timestamp < expectedNextTimestamp) {
					console.error('sort: recieving frame: drop frame', frame.frame.timestamp, expectedNextTimestamp);
					frame.frame.close();
					return;
				}

				if (cache.size >= 13) {
					// cacheが多すぎる場合何らかの不整合が発生していると思われるため、
					// 最小のtimestampを探してexpectedNextTimestampとする
					// 最初のtimestampが0でない場合もこの処理が必要
					console.error('sort: recieving frame: cache is too large', frame.frame.timestamp, expectedNextTimestamp, Array.from(cache.keys()));
					for (const timestamp of cache.keys()) {
						if (timestamp < expectedNextTimestamp) {
							dropByCache(timestamp);
						}
					}
					expectedNextTimestamp = Math.min(...cache.keys());
					if (!('startTimeShift' in sharedData)) {
						sharedData.startTimeShift = expectedNextTimestamp;
					}
					if (DEV) console.log('sort: recieving frame: cache is too large (cache and expectedNextTimestamp fixed)', Array.from(cache.keys()), expectedNextTimestamp);
				}

				send(controller, frame);
			} catch (e) {
				console.error('sort: recieving frame: caught error', e);
			}
		},
		flush(controller) {
			if (DEV) console.log('sort: [terminate] frame flush');
			// 残ったフレームを全てenqueueする
			const stamps = Array.from(cache.keys()).sort((a, b) => a - b);
			if (DEV) console.log('sort: recieving frame: last frame:', stamps);
			for (const timestamp of stamps) {
				// キャッシュを全てenqueueする
				if (timestamp < expectedNextTimestamp) {
					if (DEV) console.error('sort: recieving frame: last framee: drop frame', timestamp, expectedNextTimestamp, enqueuecnt);
					dropByCache(timestamp);
				} else {
					const f = cache.get(timestamp)!;
					expectedNextTimestamp = timestamp + (f.frame.duration ?? 0);
					if (DEV) console.log('sort: recieving frame: last frame: enqueue', timestamp, expectedNextTimestamp, enqueuecnt);
					enqueue(f, controller);
					cache.delete(timestamp);
				}
			}
			if (DEV) console.log('sort: recieving frame: [terminate]', enqueuecnt, sharedData, sharedData.getResultSamples());
            controller.terminate();
		},
	}, {
		highWaterMark: 16,
	});
}

export function floorWithSignificance(value: number, significance: number) {
    return Math.floor(value / significance) * significance;
}

/**
 * Returns a transform stream that resizes videoframes by `@misskey-dev/browser-image-resizer`.
 * 
 * @param config Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>
 * @returns TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>
 * 
 */
export function generateResizeTransformer(
	config: Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>,
	DEV = false,
) {
    let framecnt = 0;
    return new TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>({
        start() {},
        async transform(srcFrame, controller) {
			try {
				framecnt++;
				if (DEV) {
					performance.mark('resize start');
					console.log('resize: recieved', framecnt, srcFrame);
				}
				const canvas = await readAndCompressImage(srcFrame.frame, {
					...config,
					mimeType: null,
				})
				srcFrame.frame.close();
				const dstFrame = new VideoFrame(canvas, {
					timestamp: srcFrame.frame.timestamp,
					duration: srcFrame.frame.duration ?? undefined,
				});
				if (DEV) {
					performance.mark('resize end');
					console.log('resize: transform', framecnt, performance.measure('resize', 'resize start').duration, dstFrame);
				}
				controller.enqueue({ frame: dstFrame, isKeyFrame: srcFrame.isKeyFrame });
			} catch (e) {
				console.error('resize: caught error', e);
			}
        },
        flush(controller) {
            if (DEV) console.log('resize: [terminate] flush');
            controller.terminate();
        },
    });
}
