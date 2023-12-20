import { DataStream } from "@webav/mp4box.js";
export declare function getMfraStream({ startPositionMap, fileSize, }: {
    /**
     * key: trackId
     * value: moof position
     */
    startPositionMap: Map<number, number>;
    /**
     * file size, used to set mfra start position
     */
    fileSize?: number;
}): DataStream;
