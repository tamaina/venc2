import { createFile, Log } from '@webav/mp4box.js';
import { calculateSize } from '@misskey-dev/browser-image-resizer';
import { getMP4Info, generateDemuxTransformer } from './demux';
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

const preventer = {
    preventCancel: true,
    preventClose: true,
    preventAbort: true,
};

export interface EasyVideoEncoder extends EventTarget {
    addEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
};

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
        const info = await getMP4Info(order.file)

        const fps = info.fps;
        if (DEV) console.log('index: info', info);

        const samplesNumber = info.videoInfo.nb_samples + info.info.audioTracks.reduce((acc, track) => acc + track.nb_samples, 0);
        let samplesCount = 0;

        function dispatchProgress() {
            dispatchEvent(new CustomEvent('progress', { detail: { identifier, samplesNumber, samplesCount } }));   
        }
        dispatchProgress();

        const _outputSize = calculateSize(info.videoInfo.video, order.resizeConfig);
        const outputSize = {
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
                            width: outputSize.width,
                            height: outputSize.height,
                            profile: order.videoEncodeCodecRequest?.profile ?? 'Main',
                            fps,
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
                width: outputSize.width,
                height: outputSize.height,
                profile: order.videoEncodeCodecRequest?.profile ?? 'constrained_baseline',
                fps,
                prefferedAllowingMaxBitrate: order.videoEncoderConfig?.bitrate ?? undefined,
            }, DEV);
        })();
        const encoderConfig = {
            ...order.videoEncoderConfig,
            ...outputSize,
            codec: targetVideoCodec.startsWith('vp08') ? 'vp8' : targetVideoCodec,
            framerate: Math.round(fps * 100) / 100,
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
        const dstFile = createFile();
        dstFile.init({
            brands: Array.from(new Set([
                'isom', 'iso6', 'iso2',
                encoderConfig.codec.split('.')[0],
                ...info.info.audioTracks.map(track => track.codec.split('.')[0])
            ])).filter(brand => brand && typeof brand === 'string' && brand.length === 4),
            timescale: info.info.timescale,
            //duration: info.info.duration,
            // duration must be 0 for fragmented mp4
            duration: 0,
        });
        if (dstFile.moov) {
            const _1904 = new Date('1904-01-01T00:00:00Z').getTime();
            (dstFile.moov as any).mvhd?.set('creation_time', Math.floor((info.info.created.getTime() - _1904) / 1000));
            (dstFile.moov as any).mvhd?.set('modification_time', Math.floor((Date.now() - _1904) / 1000));

            // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/isofile-write.js#L49
            const mehd = (dstFile.moov as any).mvex?.add('mehd');
            mehd.set('fragment_duration', info.info.duration);
        }

        if (DEV) console.log('index: prepare', samplesNumber, samplesCount, outputSize, encoderConfig, dstFile);

        function upcnt() {
            return new TransformStream({
                start() { },
                transform(chunk, controller) {
                    controller.enqueue(chunk);
                    samplesCount++;
                    dispatchProgress();
                },
                flush() { },
            });
        }

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

        let nextBox = 0;

        /**
         * File size count for mfra/tfra/mfro
         */
        let fileSize = 0;

        /**
         * For tfra
         */
        const startPositionMap = new Map<number, number>();

        function sendBoxes() {
            if (DEV) console.log('index: send box called', nextBox, dstFile.boxes.length)
            for (let i = nextBox; i < dstFile.boxes.length; i++) {
                if (DEV) console.log('index: send box', nextBox, i, dstFile.boxes[i]);
                const box = dstFile.boxes[i] as any;
                if (box.type === 'moof') {
                    const trackId = box.trafs[0].tfhd.track_id;
                    if (!startPositionMap.has(trackId)) {
                        startPositionMap.set(trackId, fileSize);
                        if (DEV) console.log('index: send box: set start position', trackId, fileSize);
                    }
                }
                const buffer = getBoxBuffer(box);
                fileSize += buffer.byteLength;
                dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
                if (box.data) {
                    box.data = undefined;
                }
            }
            if (DEV) console.log('index: send box: next', dstFile.boxes.length);
            nextBox = dstFile.boxes.length;
        }

        const sharedData = {
            /**
             * Number of samples/frames video_sort_transformer has dropped
             */
            dropFramesOnDecoding: 0,
            dropFrames: 0,
            getResultSamples: () => info.videoInfo.nb_samples - sharedData.dropFrames - sharedData.dropFramesOnDecoding,
        };
        const writeThenSendBoxStream = () => new WritableStream({
            start() { },
            write() { sendBoxes() },
            close() { sendBoxes() },
        });
        const videoWriter = writeThenSendBoxStream();
        const videoStreamPromise = order.file.stream()
            .pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV), preventer)
            .pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV))
            .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, order.videoDecoderConfig ?? {}, sharedData, DEV), preventer)
            .pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV), preventer)
            .pipeThrough(generateResizeTransformer(order.resizeConfig, sharedData, DEV))
            .pipeThrough(generateVideoEncoderTransformStream(encoderConfig, order.videoKeyframeConfig, sharedData, DEV), preventer)
            .pipeThrough(upcnt())
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
                .pipeThrough(generateDemuxTransformer(track.id, DEV), preventer)
                .pipeThrough(upcnt())
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
        sendBoxes();
        //#endregion

        //#region process!
        // Add audio tracks first because they are usually smaller than video tracks
        for (let i = 0; i < audioStreams.length; i++) {
            const audioStream = audioStreams[i];

            await audioStream();
            sendBoxes();
        }
        // Stop writing video samples until all tracks are added
        if (DEV) console.log('index: start writing video chunks');
        ___.startToWriteVideoChunksCallback();
        await videoStreamPromise;
        if (DEV) console.log('index: writing video chunks finished');
        //#endregion
        const mfraStream = getMfraStream({
            startPositionMap,
            fileSize,
        });
        dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer: mfraStream.buffer } }));
        //#endregion

        if (samplesCount !== samplesNumber) {
            samplesCount = samplesNumber;
            dispatchProgress();
        }

        if (DEV) console.log('index: mux finish', samplesNumber, samplesCount, dstFile);

        dispatchEvent(new CustomEvent('complete', { detail: { identifier } }));

        dstFile.flush();
    };
}
