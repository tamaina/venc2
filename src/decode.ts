import { DataStream, MP4ArrayBuffer, MP4AudioTrack, MP4File, MP4Info, MP4VideoTrack, Sample, createFile } from 'mp4box';

export const generateDemuxTransformerBase = (getTrackId: (info: MP4Info) => number | undefined) => {
	let seek = 0;
	let mp4boxfile: MP4File;
	return new TransformStream<Uint8Array, Sample>({
		start(controller) {
			mp4boxfile = createFile();

			mp4boxfile.onError = (e) => {
				controller.error(e);
				mp4boxfile.flush();
			};

			mp4boxfile.onReady = (info) => {
				const track = info.tracks.find((track) => track.id === getTrackId(info));

				if (track) {
					mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: 300 });
					mp4boxfile.start();
				}

				mp4boxfile.flush();
			};

			mp4boxfile.onSamples = (id, user, samples) => {
				for (const sample of samples) {
					controller.enqueue(sample);
					//console.log('enqueue', sample, controller.desiredSize);
				}
			};
		},
		transform(chunk, controller) {
			//console.log('filechunk', chunk, chunk.byteLength, seek);
			if (chunk) {
				const buff = chunk.buffer as MP4ArrayBuffer;
				buff.fileStart = seek;
				mp4boxfile.appendBuffer(buff);
				seek += chunk.byteLength;
			}
		},
	});
}

export const generateDemuxToVideoTransformer = () => {
	return generateDemuxTransformerBase((info) => info.videoTracks[0]?.id);
};

export const generateDemuxToAudioTransformer = () => {
	return generateDemuxTransformerBase((info) => info.audioTracks[0]?.id);
};

export type DecodeResult = {
	info: MP4Info,
	videoInfo: MP4VideoTrack,
	audioInfo?: MP4AudioTrack,
};

// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L64
export function getDescriptionBuffer(entry: any) {
	const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
	//console.log(box);
	if (box) {
	  const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
	  box.write(stream);
	  return new Uint8Array(stream.buffer, 8);  // Remove the box header.
	}
	throw new Error("avcC, hvcC, vpcC, or av1C box not found");
}

export function getMP4Info(file: File) {
	const result = {} as Partial<DecodeResult>;

    return new Promise<DecodeResult>(async (resolve, reject) => {
        const mp4boxfile = createFile();
		//console.log(mp4boxfile);

		/**
		 * readerを用いる
		 */
		const reader = file.stream().getReader();
		let seek = 0;
		function push() {
			reader.read().then(({ done, value }) => {
				if (done) {
					return;
				}
				if (value) {
					const buff = value.buffer as MP4ArrayBuffer;
					buff.fileStart = seek;
					mp4boxfile.appendBuffer(buff);
					seek += value.byteLength;
				}
				push();
			});
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
			if (info.audioTracks.length > 0) {
				result.audioInfo = info.audioTracks[0];
			}

			resolve(result as DecodeResult);
			mp4boxfile.flush();
			reader.cancel();
        };

		push();
    });
}

export async function generateVideoDecodeTransformer(file: File) {
	const info = await getMP4Info(file);
	const confBase = {
		codec: info.videoInfo.codec.startsWith('vp08') ? 'vp8' : info.videoInfo.codec,
		codedHeight: info.videoInfo.track_height,
		codedWidth: info.videoInfo.track_width,
		hardwareAcceleration: 'prefer-hardware',
	} as VideoDecoderConfig;

	let decoder: VideoDecoder;
	return new TransformStream<Sample, VideoFrame>({
		start(controller) {
			decoder = new VideoDecoder({
				output: (frame) => {
					controller.enqueue(frame);
				},
				error: (e) => {
					controller.error(e);
				}
			});
		},
		transform(sample, controller) {
			console.log('sample', sample);
			if (!sample) return;

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L82
			if (decoder.state === 'unconfigured') {
				decoder.configure({
					...confBase,
					description: getDescriptionBuffer(sample.description),
				});
				console.log('decoder configured', confBase, getDescriptionBuffer(sample.description));
			}

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
			decoder.decode(new EncodedVideoChunk({
				type: sample.is_sync ? 'key' : 'delta',
				timestamp: 1e6 * sample.cts / sample.timescale,
				duration: 1e6 * sample.duration / sample.timescale,
				data: sample.data,
			}));
		},
	});
}

/**
export async function drawFrames(file: File, canvas: HTMLCanvasElement) {
	const info = await getMP4Info(file);
	const confBase = {
		codec: info.videoInfo.codec.startsWith('vp08') ? 'vp8' : info.videoInfo.codec,
		codedHeight: info.videoInfo.track_height,
		codedWidth: info.videoInfo.track_width,
		hardwareAcceleration: 'prefer-hardware',
	} as VideoDecoderConfig;

	let decoder: VideoDecoder;
	return new WritableStream<Sample>({
		start(controller) {
			decoder = new VideoDecoder({
				output: (frame) => {
					const ctx = canvas.getContext('2d');
					if (ctx) ctx.drawImage(frame, 0, 0);
				},
				error: (e) => {
					controller.error(e);
				}
			});
		},
		write(sample, controller) {
			console.log('sample', sample);
			if (!sample) return;

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L82
			if (decoder.state === 'unconfigured') {
				decoder.configure({
					...confBase,
					description: getDescriptionBuffer(sample.description),
				});
			}

			// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L99
			decoder.decode(new EncodedVideoChunk({
				type: sample.is_sync ? 'key' : 'delta',
				timestamp: 1e6 * sample.cts / sample.timescale,
				duration: 1e6 * sample.duration / sample.timescale,
				data: sample.data,
			}));
		},
	});
}
 */
