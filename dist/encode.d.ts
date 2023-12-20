import { VideoEncoderOutputChunk, VideoFrameAndIsKeyFrame, VideoKeyframeConfig } from "./type";
export declare function validateVideoKeyFrameConfig(config?: VideoKeyframeConfig | undefined): void;
/**
 * Returns a transform stream that encodes videoframes.
 * **Set preventClose: true** when using the stream with pipeThrough.
 */
export declare function generateVideoEncoderTransformStream(config: VideoEncoderConfig, videoKeyframeConfig: VideoKeyframeConfig | undefined, sharedData: {
    getResultSamples: () => number;
}, DEV?: boolean): TransformStream<VideoFrameAndIsKeyFrame, VideoEncoderOutputChunk>;
