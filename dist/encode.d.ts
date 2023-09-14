import { MP4AudioTrack, MP4File, MP4VideoTrack } from "@webav/mp4box.js";
type VideoEncoderOutputEncodedVideoChunk = {
    type: 'encodedVideoChunk';
    data: EncodedVideoChunk;
};
type VideoEncoderOutputMetadata = {
    type: 'metadata';
    data: EncodedVideoChunkMetadata;
};
export type VideoEncoderOutputChunk = VideoEncoderOutputEncodedVideoChunk | VideoEncoderOutputMetadata;
/**
 * Returns a transform stream that encodes videoframes.
 * **Set preventClose: true** when using the stream with pipeThrough.
 */
export declare function generateVideoEncoderTransformStream(config: VideoEncoderConfig, data: {
    nbSamples: number;
}, DEV?: boolean): TransformStream<VideoFrame, VideoEncoderOutputChunk>;
export declare function writeEncodedVideoChunksToMP4File(file: MP4File, encoderConfig: VideoEncoderConfig, srcInfo: MP4VideoTrack, DEV?: boolean): WritableStream<VideoEncoderOutputChunk>;
export declare function writeAudioSamplesToMP4File(file: MP4File, srcInfo: MP4AudioTrack, DEV?: boolean): WritableStream<Sample>;
export {};
