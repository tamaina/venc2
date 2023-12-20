import { BrowserImageResizerConfigWithOffscreenCanvasOutput } from "@misskey-dev/browser-image-resizer";
import { MP4VideoTrack } from "@webav/mp4box.js";
import { VideoFrameAndIsKeyFrame } from "./type";
/**
 * Returns a transform stream that sorts videoframes by timestamp and duration.
 * **Set preventClose: false** when using the stream with pipeThrough.
 *
 * SafariのVideoDecoderはtimestamp通りにフレームを出力してくれないのでこれが必要
 *
 * 壊れたmp4が来た場合、timestampが飛んでいる場合がある。その場合は最後に送信したtimestamp以降のフレームを送信する
 */
export declare function generateVideoSortTransformer(videoInfo: MP4VideoTrack, sharedData: {
    dropFrames: number;
    dropFramesOnDecoding: number;
    getResultSamples: () => number;
    startTimeShift?: number;
}, DEV?: boolean): TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>;
export declare function floorWithSignificance(value: number, significance: number): number;
/**
 * Returns a transform stream that resizes videoframes by `@misskey-dev/browser-image-resizer`.
 * **Set preventClose: false** when using the stream with pipeThrough.
 *
 * @param config Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>
 * @returns TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>
 *
 */
export declare function generateResizeTransformer(config: Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>, DEV?: boolean): TransformStream<VideoFrameAndIsKeyFrame, VideoFrameAndIsKeyFrame>;
