import { DataStream, MP4ArrayBuffer, MP4AudioTrack, MP4File, MP4Info, MP4Track, MP4VideoTrack, createFile } from 'mp4box';

const DEV = import.meta.env.DEV;

// VideoDecoderが持つキューの最大数
const DECODE_QUEUE_MAX = 32;

// デコードのTransformStreamのhighWaterMark
const DECODE_HWM = 16;

/**
 * ファイルのstreamをmp4boxで読み込んでSampleに加工するTransformStreamを生成する
 * （メモリの節約のためにtransformをPromiseで遅延させたりしているが、progressiveでなければ効果がない）
 */
export const generateDemuxTransformerBase = (getTrackId: (info: MP4Info) => number | undefined) => {
	let seek = 0;
	let mp4boxfile: MP4File;
	let track: MP4Track;
	const data = {
		track: undefined as MP4Track | undefined,

		totalSamples: 0,
		processedSample: 0,

		/**
		 * controller.desiredSizeを1msおきに監視するsetIntervalのID
		 */
		interval: 0,

		/**
		 * transformで返されているPromiseのresolve
		 * これを実行することでデータ受信を再開する
		 */
		resolve: null as (() => void) | null,
	};
	const clearInterval = () => {
		if (DEV) console.log('demux: clearInterval', data.interval);
		if (data.interval) {
			globalThis.clearInterval(data.interval);
			data.interval = 0;
		}
	}
	return new TransformStream<Uint8Array, EncodedVideoChunk>({
		start(controller) {
			mp4boxfile = createFile();

			mp4boxfile.onError = (e) => {
				controller.error(e);
				console.error('demux: mp4box error', e);
				mp4boxfile.flush();
				clearInterval();
			};

			mp4boxfile.onReady = (info) => {
				const _track = info.tracks.find((track) => track.id === getTrackId(info));

				if (_track) {
					track = _track;
					data.totalSamples = track.nb_samples;
					mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: 1 });
					mp4boxfile.start();
				} else {
					controller.error('demux: track not found');
					mp4boxfile.flush();
					clearInterval();
				}
			};

			mp4boxfile.onSamples = (id, user, samples) => {
				if (!samples || samples.length === 0) return;
				if (DEV) console.log('demux: onSamples: desiredSize', controller.desiredSize);
				for (const sample of samples) {
					const timestamp = 1e6 * sample.cts / sample.timescale;
					const duration = 1e6 * sample.duration / sample.timescale;
					controller.enqueue(new EncodedVideoChunk({
						type: sample.is_sync ? 'key' : 'delta',
						timestamp,
						duration,
						data: sample.data,
					}));
					if (DEV) console.log('demux: onSamples: sample', sample.number, sample.cts, timestamp, sample.duration, duration, sample.timescale, sample.is_sync);
					data.processedSample = sample.number;

					if (sample.number + 1 === data.totalSamples) {
						// totalSamplesとsample.number+1が一致する = 最後のサンプルを処理した
						// なのでクリーンアップを行う
						if (DEV) console.log('demux: onSamples: last sample', sample.number);
						controller.terminate();
						mp4boxfile.flush();
						clearInterval();
					}
				}
			};

			data.interval = (globalThis.setInterval as Window['setInterval'])(() => {
				if (data.resolve && (controller.desiredSize ?? 0) >= 0) {
					if (DEV) console.log('demux: recieving chunk resolve!!');
					data.resolve();
					data.resolve = null;
				}
			}, 1);
		},
		transform(chunk, controller) {
			if (chunk) {
				const buff = chunk.buffer as MP4ArrayBuffer;
				buff.fileStart = seek;
				mp4boxfile.appendBuffer(buff);
				seek += chunk.byteLength;
				if (DEV) console.log('demux: recieving chunk', chunk.byteLength, seek, controller.desiredSize);

				if (data.processedSample > 100) {
					// チャンクをappendBufferしたら古い内容を順次開放する

					// desiredSize（負のみ・nullは0）
					// 負の場合、その絶対値分のサンプルはブラウザが管理している　この分のサンプルは開放してはならない
					// 正の場合processedSampleに足すと不必要に開放するのもだめ
					const desiredNegative = Math.min(controller.desiredSize ?? 0, 0);

					// 一応の安全マージンでHWMの5倍は保持しておく
					const hwmFiveTimes = DECODE_HWM * 5;

					const sampleNumber = Math.max(data.processedSample + desiredNegative - hwmFiveTimes, 0);
					if (DEV) console.log('demux: recieving chunk: release used samples', sampleNumber, data.processedSample, desiredNegative, hwmFiveTimes);
					mp4boxfile.releaseUsedSamples(track.id, sampleNumber);
				}
			}

			// readyになるまでは問答無用で読み込む
			if (data.totalSamples === 0) return;

			return new Promise((resolve) => {
				if (data.resolve) data.resolve();
				data.resolve = resolve;
			});
		},
		flush(controller) {
			// 呼ばれたのを見たことがないが一応書いておく
			if (DEV) console.log('demux: file flush');
			clearInterval();
		},
	}, {
		highWaterMark: 1,
	});
}

export const generateDemuxToVideoTransformer = () => {
	return generateDemuxTransformerBase((info) => info.videoTracks[0]?.id);
};

export const generateDemuxToAudioTransformer = () => {
	return generateDemuxTransformerBase((info) => info.audioTracks[0]?.id);
};

export type VideoInfo = {
	info: MP4Info,
	videoInfo: MP4VideoTrack,
	audioInfo?: MP4AudioTrack,
	description: Uint8Array,
};

// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L64
export function getDescriptionBuffer(entry: any) {
	const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
	if (box) {
	  const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
	  box.write(stream);
	  return new Uint8Array(stream.buffer, 8);  // Remove the box header.
	}
	throw new Error("avcC, hvcC, vpcC, or av1C box not found");
}

export function getMP4Info(file: File) {
	const result = {} as Partial<VideoInfo>;

    return new Promise<VideoInfo>((resolve, reject) => {
        const mp4boxfile = createFile();

		const reader = file.stream().getReader();
		let seek = 0;
		async function push(): Promise<void> {
			const { done, value } = await reader.read();

			if (done) {
				return;
			}
			if (value) {
				const buff = value.buffer as MP4ArrayBuffer;
				buff.fileStart = seek;
				mp4boxfile.appendBuffer(buff);
				seek += value.byteLength;
			}
			return push();
		}

        mp4boxfile.onError = (e) => {
            reject(e);
			mp4boxfile.flush();
			reader.cancel();
        };

        mp4boxfile.onReady = (info) => {
			if (info.videoTracks.length === 0) {
				return reject('No video track found');
			}

			result.info = info;
            result.videoInfo = info.videoTracks[0];
			const trak = mp4boxfile.getTrackById(result.videoInfo.id);
			if (!trak) {
				return reject('No video track found');
			}
			for (const entry of (trak as any).mdia.minf.stbl.stsd.entries) {
				try {
					result.description = getDescriptionBuffer(entry);
				} catch (e) {
					if (DEV) console.error('getMP4Info: getDescriptionBuffer error', e);
				}
			}
			if (!result.description) {
				return reject('No description found');
			}
			if (info.audioTracks.length > 0) {
				result.audioInfo = info.audioTracks[0];
			}

			resolve(result as VideoInfo);
			mp4boxfile.flush();
			reader.cancel();
        };

		push();
    });
}

/**
 * Returns a transform stream that decodes video frames from a mp4 file stream (Blob.stream).
 * @param file Source file (mp4)
 * @returns TransformStream<Sample, VideoFrame> please use `preventClose: true` when using pipeThrough
 */
export async function generateVideoDecodeTransformer(videoInfo: MP4VideoTrack, description: BufferSource) {
	let samplecnt = 0;
	let framecnt = 0;
	const totalcnt = videoInfo.nb_samples;
	let decoder: VideoDecoder;

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

	return new TransformStream<EncodedVideoChunk, VideoFrame>({
		start(controller) {
			decoder = new VideoDecoder({
				output: (frame) => {
					if (frame) {
						framecnt++;
						if (DEV) console.log('decode: enqueue frame', frame.timestamp, framecnt, totalcnt);
						controller.enqueue(frame);
					}
					if (allowWriteEval()) emitResolve();
					if (totalcnt === framecnt) {
						if (DEV) console.log('decode: enqueue frame: last frame', totalcnt, framecnt);
						controller.terminate();
					}
				},
				error: (e) => {
					console.error('decode: decoder error', e);
					controller.error(e);
				}
			});

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L82
			decoder.configure({
				codec: videoInfo.codec.startsWith('vp08') ? 'vp8' : videoInfo.codec,
				codedHeight: videoInfo.track_height,
				codedWidth: videoInfo.track_width,
				hardwareAcceleration: 'prefer-hardware',
				description,
			})
		},
		transform(vchunk, controller) {
			samplecnt++;

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
			decoder.decode(vchunk);
			if (DEV) console.log('decode: recieving vchunk', samplecnt, framecnt, decoder.decodeQueueSize);

			// safety
			emitResolve();

			if (totalcnt === samplecnt) {
				if (DEV) console.log('decode: recieving vchunk: last chunk', totalcnt, samplecnt);
				decoder.flush();
				return Promise.resolve();
			}
			if (allowWriteEval()) {
				if (DEV) console.log('decode: recieving vchunk: resolve immediate');
				return Promise.resolve();
			}
			if (DEV) console.log('decode: recieving vchunk: wait for allowWrite');
			return new Promise((resolve) => {
				allowWriteResolve = resolve;
			});
		},
		flush(controller) {
			if (DEV) console.log('decode: vchunk flush');
			return decoder.flush();
		},
	}, {
		highWaterMark: DECODE_HWM,
	});
}

const TIMESTAMP_MARGINS = [0, -1, 1, -2, 2];
/**
 * Returns a transform stream that sorts videoframes by timestamp and duration.
 * SafariのVideoDecoderはtimestamp通りにフレームを出力してくれないのでこれが必要
 */
export function generateVideoSortTransformer(videoInfo: MP4VideoTrack) {
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
				controller.terminate();
				return;
			}

			if (cache.size >= 15) {
				// cacheが多すぎる場合何らかの不整合が発生していると思われるため、
				// 最小のtimestampを探してexpectedNextTimestampとする
				console.error('sort: recieving frame: cache is too large', frame.timestamp, expectedNextTimestamp, Array.from(cache.keys()));
				for (const timestamp of cache.keys()) {
					if (timestamp < expectedNextTimestamp) {
						cache.get(timestamp)?.close();
						cache.delete(timestamp);
					}
				}
				console.error('sort: recieving frame: cache is too large (cache and expectedNextTimestamp fixed)', Array.from(cache.keys()), Math.min(...cache.keys()));
				expectedNextTimestamp = Math.min(...cache.keys());
			}
			send(controller, frame);
		},
		flush(controller) {
			if (DEV) console.log('sort: frame flush');
		},
	});
}
