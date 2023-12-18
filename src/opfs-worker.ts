import { EasyVideoEncoder } from '.';
import type { EasyVideoEncoderEvents, VencWorkerRequest } from './type';

const eventsToPassThrough: (keyof EasyVideoEncoderEvents)[] = ['progress', 'error'];
function eventPassThrough<E extends keyof EasyVideoEncoderEvents>(type: E) {
    return (event: EasyVideoEncoderEvents[E]) => {
        globalThis.postMessage({
            type,
            ...event.detail,
        });
    };
}

const encoder = new EasyVideoEncoder();

globalThis.onmessage = async (ev) => {
    const order = ev.data as VencWorkerRequest;

    if (!order.identifier) throw new Error(`You must specify identifier`);
    if (typeof order.identifier !== 'string') throw new Error(`identifier must be string`);

    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(order.identifier, { create: true });        
    const accessHandle = await fileHandle.createSyncAccessHandle();

    globalThis.postMessage({
        type: 'opfs-file-created',
        identifier: order.identifier,
    });

    await new Promise<void>((resolve, reject) => {
        // 一応Promiseにしてawaitしておく
        const eventFuncs = new Map<keyof EasyVideoEncoderEvents, ((ev: any) => any) | ((ev: any) => Promise<any>)>(eventsToPassThrough.map(type => [type, eventPassThrough(type)] as const));

        eventFuncs.set('segment', async (ev: EasyVideoEncoderEvents['segment']) => {
            accessHandle.write(ev.detail.buffer, { at: accessHandle.getSize()});
        });
        eventFuncs.set('complete', async (ev: EasyVideoEncoderEvents['complete']) => {
            accessHandle.flush();
            eventPassThrough('complete')(ev);
            resolve();

            for (const [type, func] of eventFuncs) {
                encoder.removeEventListener(type, func);
            }
        });
        for (const [type, func] of eventFuncs) {
            encoder.addEventListener(type, func);
        }

        encoder.start(order).catch(e => reject(e));
    });
};
