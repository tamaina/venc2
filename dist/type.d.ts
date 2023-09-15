import type { BrowserImageResizerConfigWithOffscreenCanvasOutput } from '@misskey-dev/browser-image-resizer';
export type VencWorkerOrder = {
    file: Blob;
    /**
     * [number(max fps), codec][]
     *
     * Example: [[32, 'avc1.4d001f'], [64, 'avc1.4d0020'], [Infinity, 'avc1.4d0028']]
     * If not set, encoding codec will be set to `avc1.4d0034`.
     */
    codecEntries?: [number, string][];
    encoderConfig: Partial<VideoEncoderConfig>;
    resizeConfig: Partial<BrowserImageResizerConfigWithOffscreenCanvasOutput>;
    DEV?: boolean;
};
export type VencWorkerProgress = {
    type: 'progress';
    samplesNumber: number;
    samplesCount: number;
};
export type VencWorkerResult = {
    type: 'result';
    buffer: Uint8Array;
};
export type VencWorkerMessage = VencWorkerProgress | VencWorkerResult;
export type EasyVideoEncoderEvents = {
    progress: CustomEvent<Omit<VencWorkerProgress, 'type'>>;
    result: CustomEvent<Omit<VencWorkerResult, 'type'>>;
};
