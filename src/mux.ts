import { BoxParser, MP4AudioTrack, MP4File, MP4MediaTrack, MP4VideoTrack, Sample } from "@webav/mp4box.js";
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
    srcInfo: MP4VideoTrack,
    sharedData: { nbSamples: number },
    trackAddedCallback: () => any,
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
                const media_duration = srcInfo.duration;
                trackId = file.addTrack({
                    name: 'VideoHandle',
                    timescale: srcInfo.timescale,
                    duration: media_duration,
                    media_duration: media_duration,
                    language: srcInfo.language,
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
                    (trak as any).tkhd.set('matrix', (srcInfo as any).matrix)
                }
                copyEdits(trak, srcInfo);

                file.setSegmentOptions(trackId, null, { nbSamples: sharedData.nbSamples });

                if (DEV) console.log('write: addTrack', trackId, trak, srcInfo.timescale);
                trackAddedCallback();
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
                    cts: Math.round((prevChunk.timestamp * srcInfo.timescale) / 1e6),
                    dts: Math.round((prevChunk.timestamp * srcInfo.timescale) / 1e6),
                    duration: Math.round(((currentChunk.timestamp - prevChunk.timestamp) * srcInfo.timescale) / 1e6),
                };
                const sample = file.addSample(trackId, b, {
                    ...times,
                    is_sync: prevChunk.type === 'key',
                });
                prevChunk = currentChunk;
                currentChunk = null;
                if (DEV) console.log('write: addSample', samplecnt - 1, times, sample);
                controller.enqueue(sample);

                if (samplecnt === sharedData.nbSamples) {
                    const b = new ArrayBuffer(prevChunk.byteLength);
                    prevChunk.copyTo(b);
                    const sample = file.addSample(trackId, b, {
                        cts: Math.round((prevChunk.timestamp * srcInfo.timescale) / 1e6),
                        dts: Math.round((prevChunk.timestamp * srcInfo.timescale) / 1e6),
                        duration: Math.round((((srcInfo.duration / srcInfo.timescale) * 1e6 - prevChunk.timestamp) * srcInfo.timescale) / 1e6),
                    })
                    controller.enqueue(sample);
                    if (DEV) console.log('write: [terminate] addSample last', sharedData.nbSamples, samplecnt, sample, file);
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

export function writeAudioSamplesToMP4File(file: MP4File, srcInfo: MP4AudioTrack, DEV = false) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    const trackId = file.addTrack({
        type: srcInfo.codec.split('.')[0],
        hdlr: 'soun',
        name: 'SoundHandle',
        timescale: srcInfo.timescale,

        duration: srcInfo.duration,
        media_duration: srcInfo.duration,
        language: srcInfo.language,
        width: 0,
        height: 0,

        channel_count: srcInfo.audio.channel_count,
        samplerate: srcInfo.audio.sample_rate,
        samplesize: srcInfo.audio.sample_size,
    });

    if (DEV) console.log('write audio: addTrack', trackId);
    const trak = file.getTrackById(trackId)!;
    copyEdits(trak, srcInfo);
    file.setSegmentOptions(trackId, null, { nbSamples: srcInfo.nb_samples });

    let samplecnt = 0;
    return new WritableStream<Sample>({
        start() {
        },
        write(sample) {
                samplecnt++;
                const res = file.addSample(trackId, sample.data, {
                    //sample_description_index: sample.description_index,
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
                });
                if (DEV) console.log('write audio: addSample', samplecnt, sample, res);
        },
        close() {
            //file.setSegmentOptions(trackId, null, { nbSamples: samplecnt });
            if (DEV) console.log('write audio: close', file);
        },
    });
}
