export declare const avc1ProfileToProfileIdTable: {
    readonly constrained_baseline: "4240";
    readonly baseline: "4200";
    readonly extended: "5800";
    readonly constrained_main: "4d40";
    readonly main: "4d00";
    readonly constrained_high: "640c";
    readonly high: "6400";
    readonly high_progressive: "6408";
    /**
     * 10bit and 422/444 are not supported by JS Canvas,
     * so the following definitions are not used in this application,
     * but may be useful for something else.
     */
    readonly high_10: "6e00";
    readonly high_10_intra: "6e10";
    readonly high_422: "7a00";
    readonly high_422_intra: "7a10";
    readonly high_444_predictive: "f400";
    readonly high_444_intra: "f410";
    readonly cavlc_444_intra: "2c00";
};
declare class Avc1ProfileIdcToFactor {
    readonly profileIdc: number;
    readonly cpbBrVclFactor: number;
    readonly cpbBrNalFactor: number;
    constructor(profileIdc: number, cpbBrVclFactor: number, cpbBrNalFactor: number);
}
/**
 * [profile_idc, cpbBrVclFactor, cpbBrNalFactor][]
 *
 * https://www.itu.int/rec/T-REC-H.264-202108-I Table A-2
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L52
 */
export declare const avc1ProfileIdcToFactorTable: readonly [Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor, Avc1ProfileIdcToFactor];
/**
 * Get cpbBrNalFactor from profile name.
 * There is cpbBrVclFactor, but it is not used in this application,
 * based on ffmpeg's implementation.
 * @param profile profile name
 * @returns NAL factor
 */
export declare function avc1GetProfileToNalFactor(profile: keyof typeof avc1ProfileToProfileIdTable): number;
declare class Avc1LevelLimit {
    readonly name: string;
    readonly levelIdc: number;
    readonly cs3fFlag: number;
    readonly maxMBPS: number;
    readonly maxFS: number;
    readonly maxDpbMbs: number;
    readonly maxBR: number;
    readonly maxCPB: number;
    readonly maxVmvR: number;
    readonly minCR: number;
    readonly maxMvsPer2Mb: number;
    constructor(name: string, levelIdc: number, cs3fFlag: number, maxMBPS: number, maxFS: number, maxDpbMbs: number, maxBR: number, maxCPB: number, maxVmvR: number, minCR: number, maxMvsPer2Mb: number);
}
/**
 * [Name, level_idc, cs3f, MaxMBPS, MaxFS, MaxDpbMbs, MaxBR, MaxCPB, MaxVmvR, MinCR, MaxMvsPer2Mb]
 *
 * https://www.itu.int/rec/T-REC-H.264-202108-I Table A-1
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L24
 */
export declare const avc1LevelLimitsTable: readonly [Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit, Avc1LevelLimit];
export type Avc1VideoInfoToGuessLevel = {
    profile: keyof typeof avc1ProfileToProfileIdTable;
    width: number;
    height: number;
    fps: number;
    prefferedAllowingMaxBitrate?: number;
    maxDecFrameBuffering?: number;
};
/**
 * Guess suitable level from video informations.
 *
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L79C37-L79C37
 */
export declare function avc1GuessLevelIdcFromInformations({ profile, width, height, fps, prefferedAllowingMaxBitrate, maxDecFrameBuffering }: Avc1VideoInfoToGuessLevel, DEV?: boolean): number;
export declare function avc1PL<E extends keyof typeof avc1ProfileToProfileIdTable>(profile: E, levelx10: number): `avc1.${typeof avc1ProfileToProfileIdTable[E]}${string}`;
export declare function avc1PLFromVideoInfo(videoInfo: Avc1VideoInfoToGuessLevel, DEV?: boolean): string;
export {};
