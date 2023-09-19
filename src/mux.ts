import { BoxParser, MP4AudioTrack, MP4File, MP4MediaTrack, MP4Track, MP4VideoTrack, Sample, SampleOptions } from "@webav/mp4box.js";
import type { VideoEncoderOutputChunk } from "./type";

function copyEdits(tragetTrak: BoxParser.trakBox, srcInfo: MP4MediaTrack) {
    // Copy edits
    if ((srcInfo as any).edits) {
        const edts = tragetTrak.add('edts');
        const elst = edts.add('elst');
        ((srcInfo as any).edits).forEach((editEntry: any) => {
            elst.addEntry(editEntry);
        });
    }
}

export function writeEncodedVideoChunksToMP4File(
    file: MP4File,
    encoderConfig:
    VideoEncoderConfig,
    videoInfo: MP4VideoTrack,
    sharedData: { getResultSamples: () => number },
    trackAddedCallback: (result: number) => void,
    promiseToStartChunks: Promise<void>,
    DEV = false
) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    let trackId: number;
    let trak: BoxParser.trakBox;
    let samplecnt = 0;
    let prevChunk: EncodedVideoChunk;
    let currentChunk: EncodedVideoChunk | null;

    return new TransformStream<VideoEncoderOutputChunk, Sample>({
        start() {
        },
        async transform(data, controller) {
            if (data.type === 'metadata' && !trak) {
                const media_duration = videoInfo.duration;
                trackId = file.addTrack({
                    name: 'VideoHandle',
                    timescale: videoInfo.timescale,
                    duration: media_duration,
                    media_duration: media_duration,
                    language: videoInfo.language,
                    width: encoderConfig.width,
                    height: encoderConfig.height,
                    ...(encoderConfig.codec.startsWith('avc') ? {
                        avcDecoderConfigRecord: data.data.decoderConfig?.description,
                    } : encoderConfig.codec.startsWith('hevc') ? {
                        hevcDecoderConfigRecord: data.data.decoderConfig?.description,
                    } : {}),
                });
                trak = file.getTrackById(trackId)!;
                if ((trak as any).tkhd) {
                    (trak as any).tkhd.set('matrix', (videoInfo as any).matrix)
                }
                copyEdits(trak, videoInfo);

                file.setSegmentOptions(trackId, null, { nbSamples: sharedData.getResultSamples() });

                if (DEV) console.log('write: addTrack', trackId, trak, videoInfo.timescale);
                trackAddedCallback(trackId);
                await promiseToStartChunks;
                return;
            } else if (data.type === 'encodedVideoChunk') {
                samplecnt++;
                if (!prevChunk) {
                    prevChunk = data.data as EncodedVideoChunk;
                    return;
                }

                currentChunk = data.data as EncodedVideoChunk;
                const b = new ArrayBuffer(prevChunk.byteLength);
                prevChunk.copyTo(b);
                const times = {
                    cts: Math.round((prevChunk.timestamp * videoInfo.timescale) / 1e6),
                    dts: Math.round((prevChunk.timestamp * videoInfo.timescale) / 1e6),
                    duration: Math.round(((currentChunk.timestamp - prevChunk.timestamp) * videoInfo.timescale) / 1e6),
                };
                const sample = file.addSample(trackId, b, {
                    ...times,
                    is_sync: prevChunk.type === 'key',
                });
                prevChunk = currentChunk;
                currentChunk = null;
                if (DEV) console.log('write: addSample', samplecnt - 1, times, sample);
                controller.enqueue(sample);

                if (samplecnt === sharedData.getResultSamples()) {
                    const b = new ArrayBuffer(prevChunk.byteLength);
                    prevChunk.copyTo(b);
                    const sample = file.addSample(trackId, b, {
                        cts: Math.round((prevChunk.timestamp * videoInfo.timescale) / 1e6),
                        dts: Math.round((prevChunk.timestamp * videoInfo.timescale) / 1e6),
                        duration: Math.max(0, Math.round((((videoInfo.duration / videoInfo.timescale) * 1e6 - prevChunk.timestamp) * videoInfo.timescale) / 1e6)),
                    })
                    controller.enqueue(sample);
                    if (DEV) console.log('write: [terminate] addSample last', sharedData.getResultSamples(), samplecnt, sample, file);
                    controller.terminate();
                }
            }
        },
        flush(controller) {
            if (DEV) console.log('write: flush', file);
            controller.terminate();
        },
    });
}

export function samplesToMp4FileWritable(file: MP4File, trackId: number, srcInfo: MP4MediaTrack | MP4Track, sampleOptions: Partial<SampleOptions> = {}, DEV = false) {
    const trak = file.getTrackById(trackId)!;
    copyEdits(trak, srcInfo);
    file.setSegmentOptions(trackId, null, { nbSamples: srcInfo.nb_samples });

    if (DEV) console.log('write samples to file: addTrack', `#${trackId}`, trak, srcInfo.nb_samples);

    let samplecnt = 0;
    return new WritableStream<Sample>({
        start() {
        },
        write(sample) {
                samplecnt++;
                const res = file.addSample(trackId, sample.data, {
                    duration: sample.duration,
                    cts: sample.cts,
                    dts: sample.dts,
                    is_sync: sample.is_sync,
                    is_leading: sample.is_leading,
                    depends_on: sample.depends_on,
                    is_depended_on: sample.is_depended_on,
                    has_redundancy: sample.has_redundancy,
                    degradation_priority: sample.degradation_priority,
                    subsamples: sample.subsamples,
                    ...sampleOptions,
                });
                if (DEV) console.log('write samples to file: addSample', `#${trackId}`, samplecnt, sample, res);
        },
        close() {
            if (DEV) console.log('write samples to file: close', `#${trackId}`, file);
        },
    });
}

/**
 * Simply copy video samples to the dst-file from the src-file
 * 
 * @param file MP4File via mp4box.js
 * @param videoInfo MP4VideoTrack
 * @param description ArrayBuffer decoder config
 * @param DEV enable debug log
 */
export function writeVideoSamplesToMP4File(file: MP4File, videoInfo: MP4VideoTrack, description: any, DEV = false) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    const trackId = file.addTrack({
        name: 'VideoHandle',
        timescale: videoInfo.timescale,
        //duration: videoInfo.duration,
        //media_duration: videoInfo.duration,
        // duration must be 0 for fragmented mp4
        duration: 0,
        media_duration: 0,
        language: videoInfo.language,
        width: videoInfo.video.width,
        height: videoInfo.video.height,
        ...(videoInfo.codec.startsWith('avc') ? {
            avcDecoderConfigRecord: description,
        } : videoInfo.codec.startsWith('hevc') ? {
            hevcDecoderConfigRecord: description,
        } : {}),
    });

    return {
        writable: samplesToMp4FileWritable(file, trackId, videoInfo, {}, DEV),
        trackId,
    }
}

/**
 * Simply copy video samples to the dst-file from the src-file
 * 
 * @param file MP4File via mp4box.js
 * @param audioInfo MP4AudioTrack
 * @param DEV enable debug log
 */
export function writeAudioSamplesToMP4File(file: MP4File, audioInfo: MP4AudioTrack, DEV = false) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    const trackId = file.addTrack({
        type: audioInfo.codec.split('.')[0],
        hdlr: 'soun',
        name: 'SoundHandle',
        timescale: audioInfo.timescale,

        //duration: audioInfo.duration,
        //media_duration: audioInfo.duration,
        // duration must be 0 for fragmented mp4
        duration: 0,
        media_duration: 0,
        language: audioInfo.language,
        width: 0,
        height: 0,

        channel_count: audioInfo.audio.channel_count,
        samplerate: audioInfo.audio.sample_rate,
        samplesize: audioInfo.audio.sample_size,
    });

    return {
        writable: samplesToMp4FileWritable(file, trackId, audioInfo, {}, DEV),
        trackId,
    }
}
