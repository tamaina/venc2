import type { BrowserImageResizerConfigWithOffscreenCanvasOutput } from '@misskey-dev/browser-image-resizer';
import { avc1ProfileToProfileIdTable } from './specs/avc1';
import { Av01VideoAdditionalInfoToBuildCodecsParameterString, av01ProfileToProfileIdTable } from './specs/av01';

export type VideoKeyframeConfig = {
    // TODO!!
    type: 'microseconds';
    interval: number;
};

export type VencWorkerOrder = {
    type?: 'encode',
    identifier?: any;
    file: Blob;

    codecRequest?: CodecRequests;

    videoDecoderConfig?: Partial<VideoDecoderConfig>;
    videoEncoderConfig: Partial<VideoEncoderConfig>;
    resizeConfig: Partial<BrowserImageResizerConfigWithOffscreenCanvasOutput>;

    videoKeyframeConfig?: VideoKeyframeConfig;

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

export type VencOpfsWorkerFileCreated = {
    identifier: any;
    type: 'opfs-file-created';
};

export type VencWorkerMessage = VencWorkerProgress | VencWorkerSegment | VencWorkerComplete | VencWorkerError | VencOpfsWorkerFileCreated;

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

export type CodecRequests = {
    type: 'avc1';
    profile?: keyof typeof avc1ProfileToProfileIdTable;
} | {
    type: 'av01';
    profile: keyof typeof av01ProfileToProfileIdTable;

    /**
     * Color depth, like 8, 10 and 12.
     */
    depth?: number | '8' | '10' | '12',

    /**
     * Sequence tier: e.g. 'M', maybe related to temporal and spatial scalability.
     */
    seqTier?: 'M' | string,

    additional?: Av01VideoAdditionalInfoToBuildCodecsParameterString;
};
