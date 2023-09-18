import { EasyVideoEncoder } from '.';
import type { EasyVideoEncoderEvents, VencWorkerRequest } from './type';

const eventsWithoutComplete: (keyof EasyVideoEncoderEvents)[] = ['progress', 'segment', 'error', 'aborted'];
function onEvent<E extends keyof EasyVideoEncoderEvents>(type: E) {
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

    if (order.type === 'abort') {
        encoder.abort(order.identifier, order.memo);
        return;
    } else {
        await new Promise<void>((resolve, reject) => {
            // 一応Promiseにしてawaitしておく
            const eventFuncs = new Map(eventsWithoutComplete.map(type => [type, onEvent(type)] as const));
            
            eventFuncs.set('complete', (ev: EasyVideoEncoderEvents['complete']) => {
                onEvent('complete')(ev);
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
    }
};
