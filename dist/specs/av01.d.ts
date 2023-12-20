/**
 * https://aomediacodec.github.io/av1-spec/#profiles
 */
export declare const av01ProfileToProfileIdTable: {
    readonly Main: 0;
    readonly High: 1;
    readonly Professional: 2;
};
/**
 * Chroma subsampling to bits
 * https://aomediacodec.github.io/av1-spec/#color-config-semantics
 */
export declare const av01ChromaSubsamplingTable: {
    readonly '4:0:0': "111";
    readonly '4:2:0': "110";
    readonly '4:2:2': "100";
    readonly '4:4:4': "000";
};
/**
 * color primaries
 * The prefix "CP_" omitted.
 */
export declare const av01ColorPrimariesTable: {
    readonly BT_709: 1;
    readonly UNSPECIFIED: 2;
    readonly BT_470_M: 4;
    readonly BT_470_B_G: 5;
    readonly BT_601: 6;
    readonly SMPTE_240: 7;
    readonly GENERIC_FILM: 8;
    readonly BT_2020: 9;
    readonly XYZ: 10;
    readonly SMPTE_431: 11;
    readonly SMPTE_432: 12;
    readonly EBU_3213: 22;
};
/**
 * transfer characteristics: 伝達-特性
 * The prefix "TC_" omitted.
 */
export declare const av01TransferCharacteristicsTable: {
    readonly RESERVED_0: 0;
    readonly BT_709: 1;
    readonly UNSPECIFIED: 2;
    readonly RESERVED_3: 3;
    readonly BT_470_M: 4;
    readonly BT_470_B_G: 5;
    readonly BT_601: 6;
    readonly SMPTE_240: 7;
    readonly LINEAR: 8;
    readonly LOG_100: 9;
    readonly LOG_100_SQRT10: 10;
    readonly IEC_61966: 11;
    readonly BT_1361: 12;
    readonly SRGB: 13;
    readonly BT_2020_10_BIT: 14;
    readonly BT_2020_12_BIT: 15;
    readonly SMPTE_2084: 16;
    readonly SMPTE_428: 17;
    readonly HLG: 18;
};
/**
 * matrix coefficients: 行列係数
 * The prefix "MC_" omitted.
 */
export declare const av01MatrixCoefficientsTable: {
    IDENTITY: number;
    BT_709: number;
    UNSPECIFIED: number;
    RESERVED_3: number;
    FCC: number;
    BT_470_B_G: number;
    BT_601: number;
    SMPTE_240: number;
    SMPTE_YCGCO: number;
    BT_2020_NCL: number;
    BT_2020_CL: number;
    SMPTE_2085: number;
    CHROMAT_NCL: number;
    CHROMAT_CL: number;
    ICTCP: number;
};
/**
 * https://github.com/FFmpeg/FFmpeg/blob/3be81e3/libavcodec/av1_levels.c#L26
 */
declare const VOID: undefined;
declare class Av01LevelLimit {
    readonly name: string;
    readonly levelIdx: number;
    readonly maxPicSize: number;
    readonly maxHSize: number;
    readonly maxVSize: number;
    readonly maxDisplayRate: number;
    readonly maxDecodeRate: number;
    readonly maxHeaderRate: number;
    readonly mainMbps: number;
    readonly highMbps: number | typeof VOID;
    readonly mainCR: number;
    readonly highCR: number | typeof VOID;
    readonly maxTiles: number;
    readonly maxTileCols: number;
    constructor(name: string, levelIdx: number, maxPicSize: number, maxHSize: number, maxVSize: number, maxDisplayRate: number, maxDecodeRate: number, maxHeaderRate: number, mainMbps: number, highMbps: number | typeof VOID, mainCR: number, highCR: number | typeof VOID, maxTiles: number, maxTileCols: number);
}
/** Specs: https://aomediacodec.github.io/av1-spec/#levels */
export declare const av01LevelLimitTable: Av01LevelLimit[];
export type Av01VideoInfoToGuessLevel = {
    profile: keyof typeof av01ProfileToProfileIdTable;
    width: number;
    height: number;
    tiles?: number;
    tileCols?: number;
    fps: number;
    prefferedAllowingMaxBitrate?: number;
};
export declare function av01GuessLevelFromInformations({ profile, width, height, tiles, tileCols, fps, prefferedAllowingMaxBitrate }: Av01VideoInfoToGuessLevel, DEV?: boolean): Av01LevelLimit;
export declare function av01CorrectSeqTier(requestedSeqTier: 'M' | string, levelIdx: number): string;
export type Av01VideoAdditionalInfoToBuildCodecsParameterString = {
    monoChrome: boolean;
    chromaSubsampling: keyof typeof av01ChromaSubsamplingTable;
    colorPrimary: keyof typeof av01ColorPrimariesTable;
    transferCharacteristics: keyof typeof av01TransferCharacteristicsTable;
    matrixCoefficients: keyof typeof av01MatrixCoefficientsTable;
    videoFullRange: boolean;
};
export declare const av01VideoAdditionalInfoToBuildCodecsParameterStringDefaults: {
    readonly monoChrome: false;
    readonly chromaSubsampling: "4:2:0";
    readonly colorPrimary: "BT_709";
    readonly transferCharacteristics: "BT_709";
    readonly matrixCoefficients: "BT_709";
    readonly videoFullRange: false;
};
/**
 * Build codecs parameter string for av01.
 * https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs#recording_video
 * https://aomediacodec.github.io/av1-isobmff/#codecsparam
 */
export declare function av01PL(levelInfo: Av01VideoInfoToGuessLevel, 
/**
 * Color depth, like 8, 10 and 12.
 */
depth?: number | '8' | '10' | '12', 
/**
 * Sequence tier: e.g. 'M', maybe related to temporal and spatial scalability.
 */
seqTier?: 'M' | string, additional?: Av01VideoAdditionalInfoToBuildCodecsParameterString | null, DEV?: boolean): `av01.${string}`;
export {};
