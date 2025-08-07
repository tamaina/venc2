import { BoxParser, MP4BoxStream, ISOFile, Track, Sample, SampleOptions } from "mp4box";
import type { VideoEncoderOutputChunk } from "./type";
import { av1CDescription } from "./specs/av1C";
import { getDescriptionBoxEntriesFromTrak } from './box';

function copyEdits(tragetTrak: (typeof BoxParser)['box']['trak'], srcInfo: Track) {
    // Copy edits
    if ((srcInfo as any).edits) {
        const edts = tragetTrak.add('edts');
        const elst = edts.add('elst');
        ((srcInfo as any).edits).forEach((editEntry: any) => {
            elst.addEntry(editEntry);
        });
    }
}

function getAv1CBox(codec: string, DEV = false) {
    const buffer = av1CDescription(codec);
    const av1CBox = new BoxParser.av1CBox(buffer.byteLength);
    av1CBox.parse(new MP4BoxStream(buffer));
    if (DEV) console.log('write: metadata: getAv1CBox', codec, buffer, av1CBox);
    return av1CBox;
}

export function writeEncodedVideoChunksToISOFile(
    file: ISOFile,
    encoderConfig:
    VideoEncoderConfig,
    videoInfo: Track,
    sharedData: { getResultSamples: () => number },
    trackAddedCallback: (result: number) => void,
    promiseToStartChunks: Promise<void>,
    DEV = false
) {
    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    let trackId: number;
    let trak: BoxParser.trakBox;
    let samplecnt = 0;
    let nextDtsTime = 0;

    return new TransformStream<VideoEncoderOutputChunk, Sample>({
        start() {
        },
        async transform(data, controller) {
            try {
                if (data.type === 'metadata' && !trak) {
                    const media_duration = videoInfo.duration;
                    trackId = file.addTrack({
                        name: 'VideoHandle',
                        type: encoderConfig.codec.split('.')[0],
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
                        } : encoderConfig.codec.startsWith('av01') ? {
                            description: getAv1CBox(data.data.decoderConfig?.codec ?? encoderConfig.codec, DEV),
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
    
                    const chunk = data.data as EncodedVideoChunk;
                    const b = new ArrayBuffer(chunk.byteLength);
                    chunk.copyTo(b);
                    const times = {
                        cts: Math.round((chunk.timestamp * videoInfo.timescale) / 1e6),
                        dts: Math.round((nextDtsTime * videoInfo.timescale) / 1e6),
                        duration: Math.round(((chunk.duration ?? 1) * videoInfo.timescale) / 1e6),
                    };
                    const sample = file.addSample(trackId, b, {
                        ...times,
                        is_sync: chunk.type === 'key',
                    });
                    if (DEV) console.log('write: addSample', samplecnt, times, sample);
                    controller.enqueue(sample);

                    nextDtsTime += (chunk.duration ?? 1);
                }
            } catch (e) {
                console.error('write: caught error', e);
            }
        },
        flush(controller) {
            if (DEV) console.log('write: flush', file);
            controller.terminate();
        },
    });
}

export function samplesToMp4FileWritable(file: ISOFile, trackId: number, srcInfo: Track | Track, sampleOptions: Partial<SampleOptions> = {}, DEV = false) {
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
 * @param file ISOFile via mp4box.js
 * @param videoInfo Track
 * @param videoTrak ←SrcFile.getTrackById(videoInfo.track_id)
 * @param DEV enable debug log
 */
export function writeVideoSamplesToISOFile(file: ISOFile, videoInfo: Track, videoTrak: any, DEV = false) {
    //#region copy description
    // audioTrackのesdsコピーと同様にvideoTrackもdescriptionをコピーする
    const entiries = getDescriptionBoxEntriesFromTrak(videoTrak)
    const description = entiries.reduce((acc, entry) => {
        if (acc) return acc;
        if (entry.type?.startsWith('avc') && 'av1C' in entry) {
            return entry.av1C as BoxParser.esdsBox;
        } else if (entry.type === 'hvc1' && 'hvcC' in entry) {
            return entry.hvcC as BoxParser.esdsBox;
        } else if (entry.type === 'hev1' && 'hvcC' in entry) {
            return entry.hvcC as BoxParser.esdsBox;
        } else if (entry.type?.startsWith('vp') && 'vpcC' in entry) {
            return entry.vpcC as BoxParser.esdsBox;
        } else if (entry.type === 'av01' && 'av1C' in entry) {
            return entry.av1C as BoxParser.esdsBox;
        }
        return undefined;
    }, undefined as undefined | BoxParser.esdsBox);
    //#endregion

    // https://github.com/gpac/mp4box.js/issues/243#issuecomment-950450478
    const trackId = file.addTrack({
        name: 'VideoHandle',
        type: videoInfo.codec.split('.')[0],
        timescale: videoInfo.timescale,
        //duration: videoInfo.duration,
        //media_duration: videoInfo.duration,
        // duration must be 0 for fragmented mp4
        duration: 0,
        media_duration: 0,
        language: videoInfo.language,
        width: videoInfo.video.width,
        height: videoInfo.video.height,
        description,
    });

    return {
        writable: samplesToMp4FileWritable(file, trackId, videoInfo, {}, DEV),
        trackId,
    }
}

/**
 * Simply copy video samples to the dst-file from the src-file
 * 
 * @param file ISOFile via mp4box.js
 * @param audioInfo MP4AudioTrack
 * @param DEV enable debug log
 */
export function writeAudioSamplesToISOFile(file: ISOFile, audioInfo: MP4AudioTrack, audioTrak: any, DEV = false) {
    //#region copy description
    // esdsをコピーしないとFirefoxで音声を再生できない
    const entiries = getDescriptionBoxEntriesFromTrak(audioTrak)
    const description = entiries.reduce((acc, entry) => {
        if (acc) return acc;
        if (entry.type === 'mp4a' && 'esds' in entry) {
            return entry.esds as BoxParser.esdsBox;
        }
        return undefined;
    }, undefined as undefined | BoxParser.esdsBox);
    //#endregion

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

        description,
    });

    return {
        writable: samplesToMp4FileWritable(file, trackId, audioInfo, {}, DEV),
        trackId,
    }
}
