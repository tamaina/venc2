import { DataStream, MP4ArrayBuffer, MP4AudioTrack, MP4File, MP4Info, MP4Track, MP4VideoTrack, createFile } from 'mp4box';

const DEV = import.meta.env.DEV;

// VideoDecoderが持つキューの最大数
const DECODE_QUEUE_MAX = 200;

// デコードのTransformStreamのhighWaterMark
const DECODE_HWM = 10;

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
					controller.enqueue(new EncodedVideoChunk({
						type: sample.is_sync ? 'key' : 'delta',
						timestamp: 1e6 * sample.cts / sample.timescale,
						duration: 1e6 * sample.duration / sample.timescale,
						data: sample.data,
					}));
					if (DEV) console.log('demux: onSamples: sample', sample);
					data.processedSample = sample.number;

					if (sample.number + 1 === data.totalSamples) {
						// totalSamplesとsample.number+1が一致する = 最後のサンプルを処理した
						// なのでクリーンアップを行う
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
export async function generateVideoDecodeTransformer(file: File) {
	const info = await getMP4Info(file);

	let samplecnt = 0;
	let framecnt = 0;
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
						if (DEV) console.log('decode: enqueue frame', framecnt);
						controller.enqueue(frame);
					}
					if (allowWriteEval()) emitResolve();
					if (samplecnt === framecnt) {
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
				codec: info.videoInfo.codec.startsWith('vp08') ? 'vp8' : info.videoInfo.codec,
				codedHeight: info.videoInfo.track_height,
				codedWidth: info.videoInfo.track_width,
				hardwareAcceleration: 'prefer-hardware',
				description: info.description,
			})
		},
		transform(vchunk, controller) {
			samplecnt++;

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
			decoder.decode(vchunk);
			if (DEV) console.log('decode: recieving vchunk', samplecnt, framecnt, decoder.decodeQueueSize);

			if (allowWriteEval()) {
				if (DEV) console.log('decode: recieving vchunk: resolve immediate');
				emitResolve();
				return Promise.resolve();
			};
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
