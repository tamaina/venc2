import { MP4AudioTrack, MP4File, MP4MediaTrack, MP4Track, MP4VideoTrack, SampleOptions } from "@webav/mp4box.js";
import type { VideoEncoderOutputChunk } from "./type";
export declare function writeEncodedVideoChunksToMP4File(file: MP4File, encoderConfig: VideoEncoderConfig, videoInfo: MP4VideoTrack, sharedData: {
    getResultSamples: () => number;
}, trackAddedCallback: (result: number) => void, promiseToStartChunks: Promise<void>, DEV?: boolean): TransformStream<VideoEncoderOutputChunk, Sample>;
export declare function samplesToMp4FileWritable(file: MP4File, trackId: number, srcInfo: MP4MediaTrack | MP4Track, sampleOptions?: Partial<SampleOptions>, DEV?: boolean): WritableStream<Sample>;
/**
 * Simply copy video samples to the dst-file from the src-file
 *
 * @param file MP4File via mp4box.js
 * @param videoInfo MP4VideoTrack
 * @param videoTrak ←SrcFile.getTrackById(videoInfo.track_id)
 * @param DEV enable debug log
 */
export declare function writeVideoSamplesToMP4File(file: MP4File, videoInfo: MP4VideoTrack, videoTrak: any, DEV?: boolean): {
    writable: WritableStream<Sample>;
    trackId: any;
};
/**
 * Simply copy video samples to the dst-file from the src-file
 *
 * @param file MP4File via mp4box.js
 * @param audioInfo MP4AudioTrack
 * @param DEV enable debug log
 */
export declare function writeAudioSamplesToMP4File(file: MP4File, audioInfo: MP4AudioTrack, audioTrak: any, DEV?: boolean): {
    writable: WritableStream<Sample>;
    trackId: any;
};
