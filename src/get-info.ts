import { MP4ArrayBuffer, MP4Info, createFile } from 'mp4box';

export function getMp4Info(file: File) {
    return new Promise<MP4Info>(async (resolve, reject) => {
        const mp4boxfile = createFile();
        mp4boxfile.onError = (e) => {
            reject(e);
        };
        mp4boxfile.onReady = (info) => {
            resolve(info);
        };
        const buff = await file.arrayBuffer() as MP4ArrayBuffer;
        buff.fileStart = 0;
        mp4boxfile.appendBuffer(buff);
        mp4boxfile.flush();
    });
}
