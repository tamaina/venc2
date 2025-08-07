import { BoxParser, DataStream, Endianness } from "mp4box";

/**
 * https://aomediacodec.github.io/av1-isobmff/#av1codecconfigurationbox-syntax
 * 
 * @param codec e.g. av01.0.08M.08.0.110.01.01.01.0
 */
export function av1CDescription(
    codec: string,
    configOBUs: Uint8Array = new Uint8Array(0),
) {
    if (!codec.startsWith('av01.')) throw new Error(`codec ${codec} is not supported`);
    const [
        /* av01 */,
        profile,
        levelAndTier,
        bits,
        monochrome,
        chromaSubsampling,
    ] = codec.split('.');

    //#region make data
    // https://github.com/gpac/mp4box.js/blob/a7684537c1d8d08eb7c70ebc5963a6be996416cc/src/box-write.js
    const stream = new DataStream();
    stream.endianness = Endianness.BIG_ENDIAN;

    //stream.writeUint8(0); // aligned(8)
    stream.writeUint8(129); // marker, version)
    stream.writeUint8(
        (parseInt(profile) << 5) +         // profile
        parseInt(levelAndTier.slice(0, -1)) // level
    );
    stream.writeUint8(
        ((levelAndTier.slice(0, -1) === 'M' ? 0 : 1) << 7) + // seq_tier_0
        ((parseInt(bits) > 8 ? 1 : 0) << 6) +                  // high_bitdepth
        ((parseInt(bits) === 12 ? 1 : 0) << 5) +               // twelve_bit
        (parseInt(monochrome) << 4) +                        // monochrome
        (parseInt((chromaSubsampling ?? '110').slice(0, 2), 2) << 2) +  // chroma_subsampling_x/y
        0                                                  // chroma_sample_position(TODO?)
    );
    stream.writeUint8(0); // reserved,initial_presentation_delay_present, reserved
    stream.writeUint8Array(configOBUs);
    //#endregion

    return stream.buffer;
}

// Info: https://github.com/gpac/mp4box.js/blob/master/src/parsing/av1C.js
BoxParser.av1CBox.prototype.write = function(stream) {
	this.size = 4 + (this.configOBUs?.byteLength ?? 0);

	this.writeHeader(stream);
    stream.writeUint8((1 << 7) + this.version);
    stream.writeUint8((this.seq_profile << 5) + this.seq_level_idx_0);
    stream.writeUint8(
        (this.seq_tier_0 << 7) +
        (this.high_bitdepth << 6) +
        (this.twelve_bit << 5) +
        (this.monochrome << 4) +
        (this.chroma_subsampling_x << 3) +
        (this.chroma_subsampling_y << 2) +
        this.chroma_sample_position
    );
    stream.writeUint8(
        (this.reserved_1 << 5) +
        (this.initial_presentation_delay_present << 4) +
        this.initial_presentation_delay_present ? this.initial_presentation_delay_minus_one : this.reserved_2
    );
    stream.writeUint8Array(this.configOBUs);
}
