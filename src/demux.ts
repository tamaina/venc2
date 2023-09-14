import { DataStream, MP4ArrayBuffer, MP4AudioTrack, MP4File, MP4Info, MP4Track, MP4VideoTrack, Sample, createFile } from '@webav/mp4box.js';

const DEV = import.meta.env.DEV;

// デコードのTransformStreamのhighWaterMark
const DECODE_HWM = 16;

export type DemuxInfoChunk = {
	type: 'info',
	data: MP4Info,
}
export type DemuxSampleChunk = {
	type: 'sample',
	data: Sample,
}
export type DemuxChunk = DemuxInfoChunk | DemuxSampleChunk;

/**
 * Returns a transform stream that sends samples from a mp4 file stream (Blob.stream).
 * **Set preventClose: true** when using the stream with pipeThrough.
 *
 * (For memory saving, transform is delayed with Promise, but it is not effective unless the mp4 is progressive.)
 */
export const generateDemuxTransformer = () => {
	let seek = 0;
	let mp4boxfile: MP4File;
	const data = {
		track: undefined as MP4Track | undefined,

		totalSamples: 0,
		processedSample: new Map<number, number>(),

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
	return new TransformStream<Uint8Array, DemuxChunk>({
		start(controller) {
			mp4boxfile = createFile();

			mp4boxfile.onError = (e) => {
				controller.error(e);
				console.error('demux: mp4box error', e);
				mp4boxfile.flush();
				clearInterval();
			};

			mp4boxfile.onReady = (info) => {
				controller.enqueue({ type: 'info', data: info });
				for (const track of info.tracks) {
					mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: 1 });
					data.totalSamples += track.nb_samples;
				}
				if (DEV) console.log('demux: onReady', info, data.totalSamples);
				mp4boxfile.start();
			};

			mp4boxfile.onSamples = (id, user, samples) => {
				if (!samples || samples.length === 0) return;
				if (DEV) console.log('demux: onSamples: desiredSize', controller.desiredSize);
				for (const sample of samples) {
					controller.enqueue({ type: 'sample', data: sample });
					data.processedSample.set(sample.track_id, sample.number);
					const processed = Array.from(data.processedSample.values())
						.reduce(
							(sum, el) => sum + el,
							Array.from(data.processedSample.keys()).length // because sample.number starts from 0
						);
					if (DEV) console.log('demux: onSamples: sample', sample.track_id, sample.number, sample.cts, sample.duration, sample.timescale, sample.is_sync, processed, data.totalSamples, sample);
					if (processed === data.totalSamples) {
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

				for (const [trackId, processed] of data.processedSample) {
					if (processed > 100) {
						// チャンクをappendBufferしたら古い内容を順次開放する
	
						// desiredSize（負のみ・nullは0）
						// 負の場合、その絶対値分のサンプルはブラウザが管理している　この分のサンプルは開放してはならない
						// 正の場合processedSampleに足すと不必要に開放するのもだめ
						const desiredNegative = Math.min(controller.desiredSize ?? 0, 0);
	
						// 一応の安全マージンでHWMの5倍は保持しておく
						const hwmFiveTimes = DECODE_HWM * 5;
	
						const sampleNumber = Math.max(processed + desiredNegative - hwmFiveTimes, 0);
						if (DEV) console.log('demux: recieving chunk: release used samples', trackId, sampleNumber, data.processedSample, desiredNegative, hwmFiveTimes);
						mp4boxfile.releaseUsedSamples(trackId, sampleNumber);
					}
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
			controller.terminate();
		},
	}, {
		highWaterMark: 1,
	});
}

export function pickTransformer(trackId: number) {
	return new TransformStream<DemuxChunk, Sample>({
		start() {},
		transform(chunk, controller) {
			if (chunk.type === 'sample' && chunk.data.track_id === trackId) {
				controller.enqueue(chunk.data);
			}
		},
		flush(controller) {
			if (DEV) console.log('pick: flush');
			controller.terminate();
		},
	});
}

export type VideoInfo = {
	info: MP4Info,
	videoInfo: MP4VideoTrack,
	audioInfo?: MP4AudioTrack,
	description: Uint8Array,
	file: MP4File,
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

/**
 * Returns video info from a mp4 file generated by mp4box.js.
 * @param file MP4 File
 * @returns VideoInfo
 */
export function getMP4Info(file: File) {
	const result = {} as Partial<VideoInfo>;

    return new Promise<VideoInfo>((resolve, reject) => {
        const mp4boxfile = createFile();
		result.file = mp4boxfile;

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
