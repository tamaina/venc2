import { createFile, Log, MP4Info } from '@webav/mp4box.js';
import { calculateSize } from '@misskey-dev/browser-image-resizer';
import { getMP4Info, generateDemuxTransformer, SimpleVideoInfoWithoutVideoTrack } from './demux';
export * from './demux';
import { generateVideoDecodeTransformer, generateSampleToEncodedVideoChunkTransformer } from './decode';
export * from './decode';
import { floorWithSignificance, generateResizeTransformer, generateVideoSortTransformer } from './transform';
export * from './transform';
import { generateVideoEncoderTransformStream } from './encode';
export * from './encode';
import { writeAudioSamplesToMP4File, writeEncodedVideoChunksToMP4File } from './mux';
export * from './mux';
import type { VencWorkerOrder, EasyVideoEncoderEvents } from './type';
export * from './type';
import { getBoxBuffer } from './box';
export * from './box';
import { avc1PLFromVideoInfo } from './specs/avc1';
export * from './specs/avc1';
import { av01PL } from './specs/av01';
export * from './specs/av01';
export * from './specs/av1C';
import { getMfraStream } from './specs/mfra';
export * from './specs/mfra';

export interface EasyVideoEncoder extends EventTarget {
    addEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
};

export function createDstFile(
    brands: string[],
    info: MP4Info,
) {
    const dstFile = createFile();
    dstFile.init({
        brands: Array.from(brands).filter(brand => brand && typeof brand === 'string' && brand.length === 4),
        timescale: info.timescale,
        duration: 0,
    });
    if (dstFile.moov) {
        const _1904 = new Date('1904-01-01T00:00:00Z').getTime();
        (dstFile.moov as any).mvhd?.set('creation_time', Math.floor((info.created.getTime() - _1904) / 1000));
        (dstFile.moov as any).mvhd?.set('modification_time', Math.floor((Date.now() - _1904) / 1000));

        // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/isofile-write.js#L49
        const mehd = (dstFile.moov as any).mvex?.add('mehd');
        mehd.set('fragment_duration', info.duration);
    }
    return dstFile;
}

export class BoxSendManager {
    public nextBox = 0;
    public fileSize = 0;

    /**
     * For tfra creating
     */
    public startPositionMap = new Map<number, number>();
    constructor(
        private dstFile: ReturnType<typeof createDstFile>,
        private cb: (buffer: ArrayBuffer) => void,
        private DEV = false,
    ) { }
    send() {
        if (this.DEV) console.log('index: send box called', this.nextBox, this.dstFile.boxes.length)
        for (let i = this.nextBox; i < this.dstFile.boxes.length; i++) {
            if (this.DEV) console.log('index: send box', this.nextBox, i, this.dstFile.boxes[i]);
            const box = this.dstFile.boxes[i] as any;
            if (box.type === 'moof') {
                const trackId = box.trafs[0].tfhd.track_id;
                if (!this.startPositionMap.has(trackId)) {
                    this.startPositionMap.set(trackId, this.fileSize);
                    if (this.DEV) console.log('index: send box: set start position', trackId, this.fileSize);
                }
            }
            const buffer = getBoxBuffer(box);
            this.fileSize += buffer.byteLength;
            this.cb(buffer);
            //dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
            if (box.data) {
                box.data = undefined;
            }
        }
        if (this.DEV) console.log('index: send box: next', this.dstFile.boxes.length);
        this.nextBox = this.dstFile.boxes.length;
    }
}

export class StreamCounter {
    public count = 0;
    constructor(
    ) { }
    public countingTransformStream(cb?: () => void) {
        const self = this;
        return new TransformStream({
            start() { },
            transform(chunk, controller) {
                controller.enqueue(chunk);
                self.count++;
                if (cb) cb();
            },
            flush() { },
        });
    }
}

export class EasyVideoEncoder extends EventTarget {
    private processes = new Map<any, Promise<void>>();
    constructor() {
        super();
    };
    public async waitForAllProcesses() {
        await Promise.all(this.processes.values());
    }
    public async getProcesses() {
        return new Map(this.processes);
    }
    public async start(order: VencWorkerOrder) {
        const identifier = order.identifier ?? crypto.randomUUID();
        if (this.processes.has(order.identifier)) throw new Error('Already started');

        const process = this._start({ ...order, identifier });
        this.processes.set(identifier, process);
        try {
            await process;
        } catch (e) {
            if (order.DEV) {
                console.error('start root: error caught', e);
            }
            this.dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
        } finally {
            this.processes.delete(identifier);
        }
    }
    private async _start(order: VencWorkerOrder & { identifier: any }) {
        const DEV = order.DEV ?? false;
        Log.setLogLevel(DEV ? Log.LOG_LEVEL_DEBUG : Log.LOG_LEVEL_ERROR);
        const identifier = order.identifier;
        if (DEV) console.log('index: start', order);

        const dispatchEvent = this.dispatchEvent.bind(this);

        // callbackを初期化したことにするために即時関数を使う
        const ___ = (() => {
            let videoTrackAddedCallback: (result: number) => void;
            const videoTrackAddedPromise = new Promise<number>((resolve) => {
                videoTrackAddedCallback = resolve;
            });
            let startToWriteVideoChunksCallback: () => void;
            const startToWriteVideoChunksPromise = new Promise<void>((resolve) => {
                startToWriteVideoChunksCallback = resolve;
            });
            return {
                videoTrackAddedCallback: videoTrackAddedCallback!,
                videoTrackAddedPromise,
                startToWriteVideoChunksCallback: startToWriteVideoChunksCallback!,
                startToWriteVideoChunksPromise,
            };
        })();

        const info = await getMP4Info(order.file)

        if (DEV) console.log('index: info', info);

        /**
         * If the file has no video track, encode audio tracks only.
         */
        if (!('videoInfo' in info)) {
            if (info.info.audioTracks.length > 0) {
                return this._audioOnly(identifier, order, info, DEV);
            } else {
                throw new Error('No video track found')
            }
        }

        const samplesNumber = (info.videoInfo.nb_samples ?? 0) + info.info.audioTracks.reduce((acc, track) => acc + track.nb_samples, 0);
        const streamCounter = new StreamCounter();

        function dispatchProgress(forceNumber?: number) {
            dispatchEvent(new CustomEvent('progress', { detail: {
                identifier,
                samplesNumber,
                samplesCount: typeof forceNumber === 'number' ? forceNumber : streamCounter.count,
            } }));   
        }
        dispatchProgress();

        const _outputSize = calculateSize(info.videoInfo.video, order.resizeConfig);
        const videoOutputSize = {
            width: floorWithSignificance(_outputSize.width, 2),
            height: floorWithSignificance(_outputSize.height, 2),
        };
        const targetVideoCodec = (() => {
            if (order.videoEncoderConfig.codec) return order.videoEncoderConfig.codec;
            if (order.videoEncodeCodecRequest) {
                if (order.videoEncodeCodecRequest.type === 'av01') {
                    // av01(av1)
                    return av01PL(
                        {
                            width: videoOutputSize.width,
                            height: videoOutputSize.height,
                            profile: order.videoEncodeCodecRequest?.profile ?? 'Main',
                            fps: info.fps,
                            prefferedAllowingMaxBitrate: order.videoEncoderConfig?.bitrate ?? undefined,
                        },
                        order.videoEncodeCodecRequest.depth ?? 8,
                        order.videoEncodeCodecRequest.seqTier ?? 'M',
                        order.videoEncodeCodecRequest.additional,
                        DEV,
                    );
                }
            }
    
            // avc1(h264) and fallback
            return avc1PLFromVideoInfo({
                width: videoOutputSize.width,
                height: videoOutputSize.height,
                profile: order.videoEncodeCodecRequest?.profile ?? 'constrained_baseline',
                fps: info.fps,
                prefferedAllowingMaxBitrate: order.videoEncoderConfig?.bitrate ?? undefined,
            }, DEV);
        })();
        const encoderConfig = {
            ...order.videoEncoderConfig,
            ...videoOutputSize,
            codec: targetVideoCodec.startsWith('vp08') ? 'vp8' : targetVideoCodec,
            framerate: Math.round(info.fps * 100) / 100,
            ...(targetVideoCodec.startsWith('avc') ? {
                avc: {
                    format: 'avc',
                },
            } : {})
        } as VideoEncoderConfig;
        if (DEV) console.log('index: start: encoderConfig', encoderConfig);
    
        try {
            const encoderSupport = await VideoEncoder.isConfigSupported(encoderConfig);
            if (DEV) console.log('index: start: isConfigSupported', JSON.parse(JSON.stringify(encoderSupport)));
            if (!encoderSupport || !encoderSupport.supported) {
                console.error('Your encoding config is not supported.', encoderSupport);
                throw new Error(`Your encoding config is not supported. ${JSON.stringify(encoderSupport)}`);
            }
        } catch (e) {
            dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
            throw e;
        }

        const dstFile = createDstFile([
            'isom', 'iso6', 'iso2',
            encoderConfig.codec.split('.')[0],
            ...info.info.audioTracks.map(track => track.codec.split('.')[0])
        ], info.info);

        if (DEV) console.log('index: prepare', samplesNumber, streamCounter.count, videoOutputSize, encoderConfig, dstFile);

        const boxSendManager = new BoxSendManager(dstFile, (buffer) => {
            dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
        }, DEV);

        const sampleCounter = new StreamCounter();
        const sharedData = {
            /**
             * Number of samples/frames video_sort_transformer has dropped
             */
            dropFramesOnDecoding: 0,
            dropFrames: 0,
            getResultSamples: () => Math.max(info.videoInfo.nb_samples, sampleCounter.count) - sharedData.dropFrames - sharedData.dropFramesOnDecoding,
        };
        const writeThenSendBoxStream = () => new WritableStream({
            start() { },
            write() { boxSendManager.send() },
            close() { boxSendManager.send() },
        });
        const videoWriter = writeThenSendBoxStream();
        const videoStreamPromise = order.file.stream()
            .pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV))
            .pipeThrough(streamCounter.countingTransformStream())
            .pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV))
            .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, order.videoDecoderConfig ?? {}, sharedData, DEV))
            .pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV))
            .pipeThrough(generateResizeTransformer(order.resizeConfig, DEV))
            .pipeThrough(generateVideoEncoderTransformStream(encoderConfig, order.videoKeyframeConfig, DEV))
            .pipeThrough(streamCounter.countingTransformStream(dispatchProgress))
            .pipeThrough(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo, sharedData, ___.videoTrackAddedCallback, Promise.resolve(), DEV))
            .pipeTo(videoWriter)
            .catch(e => {
                console.error('video stream error', e);
                dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
                // ここでthrow eしてもルートに伝わらない
            });

        // add a video track
        await ___.videoTrackAddedPromise;

        const audioStreams = [] as (() => Promise<void>)[];
        const audioTrackIds = [] as number[];
        for (const track of info.info.audioTracks) {
            // add audio tracks
            const { writable: audioWriter, trackId } = writeAudioSamplesToMP4File(dstFile, track, info.file.getTrackById(track.id), DEV);

            audioTrackIds.push(trackId);
            audioStreams.push(() => order.file.stream()
                .pipeThrough(generateDemuxTransformer(track.id, DEV))
                .pipeThrough(streamCounter.countingTransformStream(dispatchProgress))
                .pipeTo(audioWriter)
                .catch(e => {
                    dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
                    // ここでthrow eしてもルートに伝わらない
                })
            );
        }

        //#region send the first segment
        //        after all tracks are added
        if (DEV) console.log('index: send first boxes', dstFile);
        boxSendManager.send();
        //#endregion

        //#region process!
        // Add audio tracks first because they are usually smaller than video tracks
        for (let i = 0; i < audioStreams.length; i++) {
            const audioStream = audioStreams[i];

            await audioStream();
            boxSendManager.send();
        }
        // Stop writing video samples until all tracks are added
        if (DEV) console.log('index: start writing video chunks');
        ___.startToWriteVideoChunksCallback();
        await videoStreamPromise;
        if (DEV) console.log('index: writing video chunks finished');
        //#endregion
        const mfraStream = getMfraStream({
            startPositionMap: boxSendManager.startPositionMap,
            fileSize: boxSendManager.fileSize,
        });
        dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer: mfraStream.buffer } }));
        //#endregion

        if (streamCounter.count !== samplesNumber) {
            dispatchProgress(samplesNumber);
        }

        if (DEV) console.log('index: mux finish', samplesNumber, streamCounter.count, dstFile);

        dispatchEvent(new CustomEvent('complete', { detail: { identifier } }));

        dstFile.flush();
    }

    async _audioOnly(identifier: any, order: VencWorkerOrder, info: SimpleVideoInfoWithoutVideoTrack, DEV = false) {
        if (DEV) console.log('index: THIS IS AUDIO FILE');

        const dispatchEvent = this.dispatchEvent.bind(this);

        const samplesNumber = info.info.audioTracks.reduce((acc, track) => acc + track.nb_samples, 0);
        const streamCounter = new StreamCounter();

        function dispatchProgress(forceNumber?: number) {
            dispatchEvent(new CustomEvent('progress', { detail: {
                identifier,
                samplesNumber,
                samplesCount: typeof forceNumber === 'number' ? forceNumber : streamCounter.count,
            } }));   
        }
        dispatchProgress();

        const dstFile = createDstFile([
            'isom', 'iso6', 'iso2',
            ...info.info.audioTracks.map(track => track.codec.split('.')[0])
        ], info.info);

        if (DEV) console.log('index: prepare', samplesNumber, streamCounter.count, dstFile);

        const boxSendManager = new BoxSendManager(dstFile, (buffer) => {
            dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
        }, DEV);

        const audioStreams = [] as (() => Promise<void>)[];
        const audioTrackIds = [] as number[];
        for (const track of info.info.audioTracks) {
            // add audio tracks
            const { writable: audioWriter, trackId } = writeAudioSamplesToMP4File(dstFile, track, info.file.getTrackById(track.id), DEV);

            audioTrackIds.push(trackId);
            audioStreams.push(() => order.file.stream()
                .pipeThrough(generateDemuxTransformer(track.id, DEV))
                .pipeThrough(streamCounter.countingTransformStream(dispatchProgress))
                .pipeTo(audioWriter)
                .catch(e => {
                    dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
                    // ここでthrow eしてもルートに伝わらない
                })
            );
        }

        //#region send the first segment
        //        after all tracks are added
        if (DEV) console.log('index: send first boxes', dstFile);
        boxSendManager.send();
        //#endregion

        //#region process!
        // Add audio tracks first because they are usually smaller than video tracks
        for (let i = 0; i < audioStreams.length; i++) {
            const audioStream = audioStreams[i];

            await audioStream();
            boxSendManager.send();
        }

        const mfraStream = getMfraStream({
            startPositionMap: boxSendManager.startPositionMap,
            fileSize: boxSendManager.fileSize,
        });
        dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer: mfraStream.buffer } }));
        //#endregion

        if (streamCounter.count !== samplesNumber) {
            dispatchProgress(samplesNumber);
        }

        if (DEV) console.log('index: mux finish', samplesNumber, streamCounter.count, dstFile);

        dispatchEvent(new CustomEvent('complete', { detail: { identifier } }));

        dstFile.flush();
    }
}
