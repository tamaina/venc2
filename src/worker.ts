import { EasyVideoEncoder } from '.';
import type { EasyVideoEncoderEvents, VencWorkerOrder } from './type';

globalThis.onmessage = async (ev) => {
    const order = ev.data as VencWorkerOrder;
    await new Promise<void>((resolve, reject) => {
        // 一応Promiseにしてawaitしておく
        const encoder = new EasyVideoEncoder();
        function onEvent<E extends keyof EasyVideoEncoderEvents>(type: E) {
            return (ev: EasyVideoEncoderEvents[E]) => {
                globalThis.postMessage({
                    type,
                    ...ev.detail,
                });
            };
        }
        const onProgress = onEvent('progress');
        const onResult = (ev: EasyVideoEncoderEvents['result']) => {
            onEvent('result')(ev);
            resolve();

            encoder.removeEventListener('progress', onProgress);
            encoder.removeEventListener('result', onResult);
        };
        encoder.addEventListener('progress', onProgress);
        encoder.addEventListener('result', onResult);

        encoder.start(order).catch(e => reject(e));
    });
};
