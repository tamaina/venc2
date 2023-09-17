import type { BrowserImageResizerConfigWithOffscreenCanvasOutput } from '@misskey-dev/browser-image-resizer';

export type VencWorkerOrder = {
    identifier?: any;
    file: Blob;

    /**
     * [number(max fps), codec][]
     * 
     * Example: [[32, 'avc1.4d001f'], [64, 'avc1.4d0020'], [Infinity, 'avc1.4d0028']]
     * If not set, encoding codec will be set to `avc1.4d002a`.
     */
    videoCodecEntries?: [number, string][];
    videoDecoderConfig?: Partial<VideoDecoderConfig>;
    videoEncoderConfig: Partial<VideoEncoderConfig>;
    resizeConfig: Partial<BrowserImageResizerConfigWithOffscreenCanvasOutput>;

    DEV?: boolean;
};

export type VencWorkerProgress = {
    identifier?: any;
    type: 'progress',
    samplesNumber: number;
    samplesCount: number;
};

export type VencWorkerSegment = {
    identifier?: any;
    type: 'segment',
    buffer: ArrayBuffer,
};

export type VencWorkerComplete = {
    identifier?: any;
    type: 'complete',
};

export type VencWorkerMessage = VencWorkerProgress | VencWorkerSegment | VencWorkerComplete;

export type EasyVideoEncoderEvents = {
    [k in VencWorkerMessage['type']]: CustomEvent<Omit<Extract<VencWorkerMessage, { type: k }> , 'type'>>;
};

type VideoEncoderOutputEncodedVideoChunk = {
    type: 'encodedVideoChunk',
    data: EncodedVideoChunk,
};
type VideoEncoderOutputMetadata = {
    type: 'metadata',
    data: EncodedVideoChunkMetadata,
}
export type VideoEncoderOutputChunk = VideoEncoderOutputEncodedVideoChunk | VideoEncoderOutputMetadata;
