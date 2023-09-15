import { createFile, Log } from '@webav/mp4box.js';
import { calculateSize } from '@misskey-dev/browser-image-resizer';
import { generateVideoDecodeTransformer, generateSampleToEncodedVideoChunkTransformer } from './decode';
export * from './decode';
import { getMP4Info, generateDemuxTransformer } from './demux';
export * from './demux';
import { floorWithSignificance, generateResizeTransformer, generateVideoSortTransformer } from './transform';
export * from './transform';
import { generateVideoEncoderTransformStream, writeAudioSamplesToMP4File, writeEncodedVideoChunksToMP4File } from './encode';
export * from './encode';
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
        const dispatchEvent = this.dispatchEvent.bind(this);
        const info = await getMP4Info(order.file)

        const fps = info.fps;
        if (DEV) console.log('info', info);

        const samplesNumber = info.audioInfo ? info.videoInfo.nb_samples + info.audioInfo.nb_samples : info.videoInfo.nb_samples;
        let samplesCount = 0;
        
        dispatchEvent(new CustomEvent('progress', { detail: { samplesNumber, samplesCount } }));

        const _outputSize = calculateSize(info.videoInfo.video, order.resizeConfig);
        const outputSize = {
            width: floorWithSignificance(_outputSize.width, 2),
            height: floorWithSignificance(_outputSize.height, 2),
        };
        const encoderConfig = {
            ...order.encoderConfig,
            codec: (order.codecEntries?.find((entry) => entry[0] >= fps) ?? [null, 'avc1.4d002a'])[1],
            ...outputSize,
        };

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


        function upcnt() {
            return new TransformStream({
                start() { },
                transform(chunk, controller) {
                    controller.enqueue(chunk);
                    samplesCount++;
                    dispatchEvent(new CustomEvent('progress', { detail: { samplesNumber, samplesCount } }));
                },
                flush() { },
            });
        }

        const sharedData = { nbSamples: info.videoInfo.nb_samples };

        await order.file.stream()
            .pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV), preventer)
            .pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV))
            .pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, DEV), preventer)
            .pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV), preventer)
            .pipeThrough(generateResizeTransformer(order.resizeConfig, DEV))
            .pipeThrough(generateVideoEncoderTransformStream(encoderConfig, sharedData, DEV), preventer)
            .pipeThrough(upcnt())
            .pipeTo(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo, sharedData, DEV));

        if (info.audioInfo) {
            await order.file.stream()
                .pipeThrough(generateDemuxTransformer(info.audioInfo.id, DEV), preventer)
                .pipeThrough(upcnt())
                .pipeTo(writeAudioSamplesToMP4File(dstFile, info.audioInfo, DEV));
        }

        if (samplesCount !== samplesNumber) {
            samplesCount = samplesNumber;
            dispatchEvent(new CustomEvent('progress', { detail: { samplesNumber, samplesCount } }));
        }

        // NEVER execute initializeSegmentation
        const buffer = dstFile.getBuffer();

        dispatchEvent(new CustomEvent('result', { detail: { buffer } }));

        dstFile.flush();
    };
}
