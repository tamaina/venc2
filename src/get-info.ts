import { MP4ArrayBuffer, MP4Info, MP4Track, createFile } from 'mp4box';

export function getMp4Info(file: File) {
    return new Promise<MP4Track>(async (resolve, reject) => {
        const mp4boxfile = createFile();
        mp4boxfile.onError = (e) => {
            reject(e);
        };
        mp4boxfile.onReady = (info) => {
            const track = info.videoTracks[0];
            console.log(track);
            mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: 1 });
            mp4boxfile.start();
            resolve(track);
        };
        mp4boxfile.onSamples = (id, track, data) => {
            console.log('onSamples', id, track, data);
        };
        const buff = await file.arrayBuffer() as MP4ArrayBuffer;
        buff.fileStart = 0;
        mp4boxfile.appendBuffer(buff);
        mp4boxfile.flush();
    });
}
