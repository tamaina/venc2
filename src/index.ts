import { createFile, DataStream, Log } from '@webav/mp4box.js';
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
    private aborts = new Set<any>();
    private aborters = new Map<any, Set<() => void>>();
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
    public abort(identifier, memo: any) {
        const process = this.processes.get(identifier);
        if (!process) return;

        this.aborts.add(identifier);
        process
            .catch(() => { })
            .finally(() => {
                this.aborts.delete(identifier);
            });
        this.aborters.get(identifier)?.forEach(aborter => {
            try {
                aborter();
            } catch (e) {}
        });
        this.dispatchEvent(new CustomEvent('aborted', { detail: { identifier, memo } }));
        this.aborters.delete(identifier);
        this.processes.delete(identifier);
        return process;
    }
    private async _start(order: VencWorkerOrder & { identifier: any }) {
        const DEV = order.DEV ?? false;
        Log.setLogLevel(DEV ? Log.LOG_LEVEL_DEBUG : Log.LOG_LEVEL_ERROR);
        const identifier = order.identifier;
        const aborters = this.aborters.set(identifier, new Set()).get(identifier)!;
        if (DEV) console.log('start', order);

        const dispatchEvent = this.dispatchEvent.bind(this);
        const info = await getMP4Info(order.file)

        const fps = info.fps;
        if (DEV) console.log('info', info);

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
        const encoderConfig = {
            ...order.videoEncoderConfig,
            codec: (order.videoCodecEntries?.find((entry) => entry[0] >= fps) ?? [null, 'avc1.4d002a'])[1],
            ...outputSize,
        };
        await VideoEncoder.isConfigSupported(encoderConfig);

        if (this.aborts.has(identifier)) return;

        const dstFile = createFile();
        dstFile.init({
            timescale: info.info.timescale,
            duration: info.info.duration,
        });
        (dstFile as any).isFragmentationInitialized = true;
        if (dstFile.moov) {
            const _1904 = new Date('1904-01-01T00:00:00Z').getTime();
            (dstFile.moov as any).mvhd?.set('creation_time', Math.floor((info.info.created.getTime() - _1904) / 1000));
            (dstFile.moov as any).mvhd?.set('modification_time', Math.floor((Date.now() - _1904) / 1000));

            // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/isofile-write.js#L49
            const mehd = (dstFile.moov as any).mvex?.add('mehd');
            mehd.set('fragment_duration', info.info.duration);
        }

        if (DEV) console.log('prepare', samplesNumber, samplesCount, outputSize, encoderConfig, dstFile);

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
            for (let i = nextBox; i < dstFile.boxes.length; i++) {
                if (DEV) console.log('send box', nextBox, i, dstFile.boxes[i]);
                const box = dstFile.boxes[i] as any;
                if (box.type === 'moof') {
                    const trackId = box.trafs[0].tfhd.track_id;
                    if (!startPositionMap.has(trackId)) {
                        startPositionMap.set(trackId, fileSize);
                        if (DEV) console.log('send box: set start position', trackId, fileSize);
                    }
                }
                const ds = new DataStream();
                ds.endianness = DataStream.BIG_ENDIAN;
                box.write(ds);
                const buffer = ds.buffer;
                fileSize += ds.buffer.byteLength;
                dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
                if (box.data) {
                    box.data = undefined;
                }
            }
            if (DEV) console.log('send box: next', dstFile.boxes.length);
            nextBox = dstFile.boxes.length;
        }

        const sharedData = {
            /**
             * Number of samples/frames video_sort_transformer has dropped
             */
            dropFrames: 0,
            getResultSamples: () => info.videoInfo.nb_samples - sharedData.dropFrames,
        };
        const writeThenSendBoxStream = () => new WritableStream({
            start() { },
            write() { sendBoxes() },
            close() { sendBoxes() },
        });
        const videoWriter = writeThenSendBoxStream();
        aborters.add(() => videoWriter.abort());
        const videoStreamPromise = order.file.stream()
            .pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV), preventer)
            .pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV))
            .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, order.videoDecoderConfig ?? {}, DEV), preventer)
            .pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV), preventer)
            .pipeThrough(generateResizeTransformer(order.resizeConfig, DEV))
            .pipeThrough(generateVideoEncoderTransformStream(encoderConfig, sharedData, DEV), preventer)
            .pipeThrough(upcnt())
            .pipeThrough(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo, sharedData, ___.videoTrackAddedCallback, Promise.resolve(), DEV))
            .pipeTo(videoWriter)
            .catch(e => {
                if (this.aborts.has(identifier)) return;
                console.error('video stream error', e);
                dispatchEvent(new CustomEvent('error', { detail: { identifier, error: e } }));
                // ここでthrow eしてもルートに伝わらない
            });

        if (this.aborts.has(identifier)) return;

        // add a video track
        await ___.videoTrackAddedPromise;

        const audioStreams = [] as (() => Promise<void>)[];
        const audioTrackIds = [] as number[];
        for (const track of info.info.audioTracks) {
            if (this.aborts.has(identifier)) return;
    
            // add audio tracks
            const { writable: audioWriter, trackId } = writeAudioSamplesToMP4File(dstFile, track, DEV);
            aborters.add(() => audioWriter.abort());

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

        if (this.aborts.has(identifier)) return;

        //#region send the first segment
        //        after all tracks are added
        if (DEV) console.log('send first boxes', dstFile);
        sendBoxes();
        //#endregion

        //#region process!
        // Add audio tracks first because they are usually smaller than video tracks
        for (let i = 0; i < audioStreams.length; i++) {
            const audioStream = audioStreams[i];

            if (this.aborts.has(identifier)) return;
            await audioStream();
            if (this.aborts.has(identifier)) return;
            sendBoxes();
        }
        // Stop writing video samples until all tracks are added
        if (DEV) console.log('start writing video chunks');
        ___.startToWriteVideoChunksCallback();
        await videoStreamPromise;
        if (this.aborts.has(identifier)) return;
        //#endregion

        //#region make mfra/tfra/mfro
        // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/box-write.js
        const mfraStream = new DataStream();
        mfraStream.endianness = DataStream.BIG_ENDIAN;
        //#region write mfra header
        mfraStream.writeUint32(0); // size placeholder
        mfraStream.writeString('mfra', null, 4);
        //#endregion
        //#region write mfra data: write tfras
        // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/parsing/tfra.js#L1
        for (const [trackId, pos] of startPositionMap) {
            mfraStream.writeUint32(43); // size placeholder
            mfraStream.writeString('tfra', null, 4);
            mfraStream.writeUint8(1); // version
            mfraStream.writeUint24(0); // flags
            mfraStream.writeUint32(trackId); // track_ID
            mfraStream.writeUint32(0); // length_size_of_traf_num, length_size_of_trun_num, length_size_of_sample_num
            mfraStream.writeUint32(1); // number_of_entry
            mfraStream.writeUint64(0); // time
            mfraStream.writeUint64(pos); // moof_offset
            mfraStream.writeUint8(1); // traf_number
            mfraStream.writeUint8(1); // trun_number
            mfraStream.writeUint8(1); // sample_number
        }
        //#endregion
        //#region write mfra data: write mfro
        mfraStream.writeUint32(16); // size placeholder
        mfraStream.writeString('mfro', null, 4);
        mfraStream.writeUint8(0); // version
        mfraStream.writeUint24(0); // flags
        const mfraSize = mfraStream.getPosition() + 4;
        mfraStream.writeUint32(mfraSize); // size
        //#endregion
        mfraStream.adjustUint32(0, mfraSize); // adjust size

        (mfraStream.buffer as any).fileStart = fileSize;
        dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer: mfraStream.buffer } }));
        //#endregion

        if (samplesCount !== samplesNumber) {
            samplesCount = samplesNumber;
            dispatchProgress();
        }

        if (DEV) console.log('mux finish', samplesNumber, samplesCount, dstFile);

        dispatchEvent(new CustomEvent('complete', { detail: { identifier } }));

        dstFile.flush();
    };
}
