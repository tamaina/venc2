import { DataStream } from "@webav/mp4box.js";

export function getMfraStream({
    startPositionMap,
    fileSize,
}: {
    /**
     * key: trackId
     * value: moof position
     */
    startPositionMap: Map<number, number>;

    /**
     * file size, used to set mfra start position
     */
    fileSize?: number;
}): DataStream {
    //#region make mfra/tfra/mfro
    // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/box-write.js
    const mfraStream = new DataStream();
    mfraStream.endianness = DataStream.BIG_ENDIAN;
    //#region write mfra header
    mfraStream.writeUint32(0); // size placeholder
    mfraStream.writeString('mfra', null, 4);
    //#endregion
    //#region write mfra data: write tfras
    // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/parsing/tfra.js#L1
    for (const [trackId, pos] of startPositionMap) {
        mfraStream.writeUint32(43); // size placeholder
        mfraStream.writeString('tfra', null, 4);
        mfraStream.writeUint8(1); // version
        mfraStream.writeUint24(0); // flags
        mfraStream.writeUint32(trackId); // track_ID
        mfraStream.writeUint32(0); // length_size_of_traf_num, length_size_of_trun_num, length_size_of_sample_num
        mfraStream.writeUint32(1); // number_of_entry
        mfraStream.writeUint64(0); // time
        mfraStream.writeUint64(pos); // moof_offset
        mfraStream.writeUint8(1); // traf_number
        mfraStream.writeUint8(1); // trun_number
        mfraStream.writeUint8(1); // sample_number
    }
    //#endregion
    //#region write mfra data: write mfro
    mfraStream.writeUint32(16); // size placeholder
    mfraStream.writeString('mfro', null, 4);
    mfraStream.writeUint8(0); // version
    mfraStream.writeUint24(0); // flags
    const mfraSize = mfraStream.getPosition() + 4;
    mfraStream.writeUint32(mfraSize); // size
    //#endregion
    mfraStream.adjustUint32(0, mfraSize); // adjust size

    if (fileSize) (mfraStream.buffer as any).fileStart = fileSize;

    return mfraStream;
}
