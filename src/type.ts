import type { BrowserImageResizerConfigWithOffscreenCanvasOutput } from '@misskey-dev/browser-image-resizer';
import { avc1ProfileToProfileIdTable } from './specs/h264';

export type VideoKeyframeConfig = {
    // TODO!!
    type: 'ms' | 'frame';
    interval: number;
};

export type VencWorkerOrder = {
    type?: 'encode',
    identifier?: any;
    file: Blob;

    videoDecoderConfig?: Partial<VideoDecoderConfig>;
    videoEncoderConfig: Partial<VideoEncoderConfig>;
    resizeConfig: Partial<BrowserImageResizerConfigWithOffscreenCanvasOutput>;

    videoKeyframeConfig?: VideoKeyframeConfig;
    avc1Profile?: keyof typeof avc1ProfileToProfileIdTable;

    DEV?: boolean;
};

export type VideoFrameAndIsKeyFrame = {
    frame: VideoFrame;
    isKeyFrame: boolean;
};

export type VencWorkerRequest = VencWorkerOrder;

export type VencWorkerProgress = {
    identifier?: any;
    type: 'progress';
    samplesNumber: number;
    samplesCount: number;
};

export type VencWorkerSegment = {
    identifier?: any;
    type: 'segment';
    buffer: ArrayBuffer;
};

export type VencWorkerComplete = {
    identifier?: any;
    type: 'complete';
};

export type VencWorkerError = {
    identifier?: any;
    type: 'error';
    error: any;
};

export type VencWorkerMessage = VencWorkerProgress | VencWorkerSegment | VencWorkerComplete | VencWorkerError;

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
