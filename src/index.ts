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
    constructor() {
        super();
    };
    async start(order: VencWorkerOrder) {
        const DEV = order.DEV ?? false;
        Log.setLogLevel(DEV ? Log.LOG_LEVEL_DEBUG : Log.LOG_LEVEL_ERROR);
        const identifier = order.identifier;
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

        const dstFile = createFile();
        dstFile.init({
            timescale: info.info.timescale,
            duration: info.info.duration,
        });
        if (dstFile.moov) {
            const _1904 = new Date('1904-01-01T00:00:00Z').getTime();
            (dstFile.moov as any).mvhd?.set('creation_time', Math.floor((info.info.created.getTime() - _1904) / 1000));
            (dstFile.moov as any).mvhd?.set('modification_time', Math.floor((Date.now() - _1904) / 1000));
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

        const sharedData = { nbSamples: info.videoInfo.nb_samples };

        // videoTrackAddedCallbackを初期化したことにするために即時関数を使う
        const [videoTrackAddedCallback, videoTrackAddedPromise] = (() => {
            let videoTrackAddedCallback: () => any;
            const videoTrackAddedPromise = new Promise<void>((resolve) => {
                videoTrackAddedCallback = resolve;
            });
            return [videoTrackAddedCallback!, videoTrackAddedPromise];
        })();

        const videoStreamPromise = order.file.stream()
            .pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV), preventer)
            .pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV))
            .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, order.videoDecoderConfig ?? {}, DEV), preventer)
            .pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV), preventer)
            .pipeThrough(generateResizeTransformer(order.resizeConfig, DEV))
            .pipeThrough(generateVideoEncoderTransformStream(encoderConfig, sharedData, DEV), preventer)
            .pipeThrough(upcnt())
            .pipeTo(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo, sharedData, videoTrackAddedCallback, DEV));

        // add a video track
        await videoTrackAddedPromise;

        const audioStreams = new Set<() => Promise<void>>();
        for (const track of info.info.audioTracks) {
            // add audio tracks
            const writer = writeAudioSamplesToMP4File(dstFile, track, DEV);

            audioStreams.add(() => order.file.stream()
                .pipeThrough(generateDemuxTransformer(track.id, DEV), preventer)
                .pipeThrough(upcnt())
                .pipeTo(writer)
            );
        }

        dstFile.onSegment = (id, user, buffer, sampleNum) => {
            if (DEV) console.log('onSegment', id, user, buffer, sampleNum);
            dispatchEvent(new CustomEvent('segment', { detail: { identifier, buffer } }));
        }

        if (samplesCount !== samplesNumber) {
            samplesCount = samplesNumber;
            dispatchProgress();
        }

        if (DEV) console.log('mux finish', samplesNumber, samplesCount, dstFile);

        // NEVER execute initializeSegmentation
        const buffer = dstFile.getBuffer();

        dispatchEvent(new CustomEvent('result', { detail: { identifier, buffer } }));

        dstFile.flush();
    };
}
