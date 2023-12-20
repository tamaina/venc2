import { MP4VideoTrack } from '@webav/mp4box.js';
import { VideoFrameAndIsKeyFrame } from './type';
/**
 * Returns a transform stream that transforms Sample to EncodedVideoChunk.
 * **Set preventClose: false** when using the stream with pipeThrough.
 *
 * @returns TransformStream<Sample, EncodedVideoChunk>
 */
export declare const generateSampleToEncodedVideoChunkTransformer: (DEV?: boolean) => TransformStream<Sample, EncodedVideoChunk>;
/**
 * Returns a transform stream that decodes video frames from a mp4 file stream (Blob.stream).
 * **Set preventClose: false** when using the stream with pipeThrough.
 *
 * @param file Source file (mp4)
 * @returns TransformStream<Sample, VideoFrameAndIsKeyFrame>
 */
export declare function generateVideoDecodeTransformer(videoInfo: MP4VideoTrack, description: BufferSource, orderConfig: Partial<VideoDecoderConfig>, sharedData: {
    dropFramesOnDecoding: number;
    startTimeShift?: number;
}, DEV?: boolean): Promise<TransformStream<EncodedVideoChunk, VideoFrameAndIsKeyFrame>>;
