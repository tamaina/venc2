export * from './decode';
export * from './demux';
export * from './transform';
export * from './encode';
import type { VencWorkerOrder, EasyVideoEncoderEvents } from './type';
export * from './type';
export interface EasyVideoEncoder extends EventTarget {
    addEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare class EasyVideoEncoder extends EventTarget {
    constructor();
    start(order: VencWorkerOrder): Promise<void>;
}
