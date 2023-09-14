import { BrowserImageResizerConfigWithOffscreenCanvasOutput } from "@misskey-dev/browser-image-resizer";
import { MP4VideoTrack } from "@webav/mp4box.js";
/**
 * Returns a transform stream that sorts videoframes by timestamp and duration.
 * **Set preventClose: true** when using the stream with pipeThrough.
 *
 * SafariのVideoDecoderはtimestamp通りにフレームを出力してくれないのでこれが必要
 *
 * 壊れたmp4が来た場合、timestampが飛んでいる場合がある。その場合は最後に送信したtimestamp以降のフレームを送信する
 */
export declare function generateVideoSortTransformer(videoInfo: MP4VideoTrack, data: {
    nbSamples: number;
}, DEV?: boolean): TransformStream<VideoFrame, VideoFrame>;
export declare function floorWithSignificance(value: number, significance: number): number;
/**
 * Returns a transform stream that resizes videoframes by `@misskey-dev/browser-image-resizer`.
 * **Set preventClose: false** when using the stream with pipeThrough.
 *
 * @param config Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>
 * @param forcedSize { width: number, height: number } Size to force resize to (crop).
 * @returns TransformStream<VideoFrame, VideoFrame>
 *
 */
export declare function generateResizeTransformer(config: Partial<Omit<BrowserImageResizerConfigWithOffscreenCanvasOutput, 'quality'>>, DEV?: boolean): TransformStream<VideoFrame, VideoFrame>;
