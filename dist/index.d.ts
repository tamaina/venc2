export * from './demux';
export * from './decode';
export * from './transform';
export * from './encode';
export * from './mux';
import type { VencWorkerOrder, EasyVideoEncoderEvents } from './type';
export * from './type';
export * from './box';
export * from './specs/avc1';
export * from './specs/av01';
export * from './specs/av1C';
export * from './specs/mfra';
export interface EasyVideoEncoder extends EventTarget {
    addEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener<K extends keyof EasyVideoEncoderEvents>(event: K, listener: ((this: EasyVideoEncoder, ev: EasyVideoEncoderEvents[K]) => any) | null, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
export declare class EasyVideoEncoder extends EventTarget {
    private processes;
    constructor();
    waitForAllProcesses(): Promise<void>;
    getProcesses(): Promise<Map<any, Promise<void>>>;
    start(order: VencWorkerOrder): Promise<void>;
    private _start;
}
