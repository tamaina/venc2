
/**
 * https://aomediacodec.github.io/av1-spec/#profiles
 */
export const av01ProfileToProfileIdTable = {
    'Main': 0,
    'High': 1,
    'Professional': 2,
} as const;

/**
 * Chroma subsampling to bits
 * https://aomediacodec.github.io/av1-spec/#color-config-semantics
 */
export const av01ChromaSubsamplingTable = {
    '4:0:0': '111',
    '4:2:0': '110',
    '4:2:2': '100',
    '4:4:4': '000',
} as const;

/**
 * color primaries
 * The prefix "CP_" omitted.
 */
export const av01ColorPrimariesTable = {
    BT_709: 1,
    UNSPECIFIED: 2,
  // RESERVED?: 3,
    BT_470_M: 4,
    BT_470_B_G: 5,
    BT_601: 6,
    SMPTE_240: 7,
    GENERIC_FILM: 8,
    BT_2020: 9,
    XYZ: 10,
    SMPTE_431: 11,
    SMPTE_432: 12,
    EBU_3213: 22,
} as const;

/**
 * transfer characteristics: 伝達-特性
 * The prefix "TC_" omitted.
 */
export const av01TransferCharacteristicsTable = {
    RESERVED_0: 0,
    BT_709: 1,
    UNSPECIFIED: 2,
    RESERVED_3: 3,
    BT_470_M: 4,
    BT_470_B_G: 5,
    BT_601: 6,
    SMPTE_240: 7,
    LINEAR: 8,
    LOG_100: 9,
    LOG_100_SQRT10: 10,
    IEC_61966: 11,
    BT_1361: 12,
    SRGB: 13,
    BT_2020_10_BIT: 14,
    BT_2020_12_BIT: 15,
    SMPTE_2084: 16,
    SMPTE_428: 17,
    HLG: 18,
} as const;

/**
 * matrix coefficients: 行列係数
 * The prefix "MC_" omitted.
 */
export const av01MatrixCoefficientsTable = {
    IDENTITY: 0,
    BT_709: 1,
    UNSPECIFIED: 2,
    RESERVED_3: 3,
    FCC: 4,
    BT_470_B_G: 5,
    BT_601: 6,
    SMPTE_240: 7,
    SMPTE_YCGCO: 8,
    BT_2020_NCL: 9,
    BT_2020_CL: 10,
    SMPTE_2085: 11,
    CHROMAT_NCL: 12,
    CHROMAT_CL: 13,
    ICTCP: 14,
}

/**
 * https://github.com/FFmpeg/FFmpeg/blob/3be81e3/libavcodec/av1_levels.c#L26
 */
const VOID = undefined;
class Av01LevelLimit {
    constructor(
        public readonly name: string,
        public readonly levelIdx: number,
        public readonly maxPicSize: number,
        public readonly maxHSize: number,
        public readonly maxVSize: number,
        public readonly maxDisplayRate: number,
        public readonly maxDecodeRate: number,
        public readonly maxHeaderRate: number,
        public readonly mainMbps: number,
        public readonly highMbps: number | typeof VOID,
        public readonly mainCR: number,
        public readonly highCR: number | typeof VOID,
        public readonly maxTiles: number,
        public readonly maxTileCols: number,
    ) { }
}

/** Specs: https://aomediacodec.github.io/av1-spec/#levels */
export const av01LevelLimitTable = [
    //                 name levelIdx maxPicSize maxH maxV  maxDisplayR  maxDecodeR maxHeaderR mainbr highbr mainCR highCR maxTiles maxTileCols
    new Av01LevelLimit("2.0",     0,   147456,  2048, 1152,    4423680,    5529600,      150,   1.5,  VOID,      2,  VOID,      8,  4),
    new Av01LevelLimit("2.1",     1,   278784,  2816, 1584,    8363520,   10454400,      150,   3.0,  VOID,      2,  VOID,      8,  4),
    new Av01LevelLimit("3.0",     4,   665856,  4352, 2448,   19975680,   24969600,      150,   6.0,  VOID,      2,  VOID,     16,  6),
    new Av01LevelLimit("3.1",     5,  1065024,  5504, 3096,   31950720,   39938400,      150,  10.0,  VOID,      2,  VOID,     16,  6),
    new Av01LevelLimit("4.0",     8,  2359296,  6144, 3456,   70778880,   77856768,      300,  12.0,  30.0,      4,     4,     32,  8),
    new Av01LevelLimit("4.1",     9,  2359296,  6144, 3456,  141557760,  155713536,      300,  20.0,  50.0,      4,     4,     32,  8),
    new Av01LevelLimit("5.0",    12,  8912896,  8192, 4352,  267386880,  273715200,      300,  30.0, 100.0,      6,     4,     64,  8),
    new Av01LevelLimit("5.1",    13,  8912896,  8192, 4352,  534773760,  547430400,      300,  40.0, 160.0,      8,     4,     64,  8),
    new Av01LevelLimit("5.2",    14,  8912896,  8192, 4352, 1069547520, 1094860800,      300,  60.0, 240.0,      8,     4,     64,  8),
    new Av01LevelLimit("5.3",    15,  8912896,  8192, 4352, 1069547520, 1176502272,      300,  60.0, 240.0,      8,     4,     64,  8),
    new Av01LevelLimit("6.0",    16, 35651584, 16384, 8704, 1069547520, 1176502272,      300,  60.0, 240.0,      8,     4,    128, 16),
    new Av01LevelLimit("6.1",    17, 35651584, 16384, 8704, 2139095040, 2189721600,      300, 100.0, 480.0,      8,     4,    128, 16),
    new Av01LevelLimit("6.2",    18, 35651584, 16384, 8704, 4278190080, 4379443200,      300, 160.0, 800.0,      8,     4,    128, 16),
    new Av01LevelLimit("6.3",    19, 35651584, 16384, 8704, 4278190080, 4706009088,      300, 160.0, 800.0,      8,     4,    128, 16),
];

export type Av01VideoInfoToGuessLevel = {
    profile: keyof typeof av01ProfileToProfileIdTable;
    width: number;
    height: number;
    tiles?: number;
    tileCols?: number;
    fps: number;
    prefferedAllowingMaxBitrate?: number;
};

export function av01GuessLevelFromInformations(
    { profile, width, height, tiles, tileCols, fps, prefferedAllowingMaxBitrate }: Av01VideoInfoToGuessLevel,
    DEV = false,
) {
    let maxBrMbps: number | typeof VOID = VOID;

    const picSize = width * height;
    const displayRate = picSize * fps;

    for (let i = 0; i < av01LevelLimitTable.length; i++) {
        const level = av01LevelLimitTable[i];
        // Limitation: decode rate, header rate, compress rate, etc. are not considered.
        if (picSize > level.maxPicSize) continue;
        if (width > level.maxHSize) continue;
        if (height > level.maxVSize) continue;
        if (displayRate > level.maxDisplayRate) continue;

        maxBrMbps = profile === 'Main' ? level.mainMbps : level.highMbps ;

        if (maxBrMbps === VOID) continue;
        if (prefferedAllowingMaxBitrate) {
            if (prefferedAllowingMaxBitrate > 1000000.0 * maxBrMbps) continue;
        }

        if (tiles ?? 0 > level.maxTiles) continue;
        if (tileCols ?? 0 > level.maxTileCols) continue;

        return level;
    }

    throw new Error(`av01 guess lv: suitable level is not found`);
}

// https://aomediacodec.github.io/av1-spec/#general-sequence-header-obu-syntax
export function av01CorrectSeqTier(
    requestedSeqTier: 'M' | 'H',
    levelIdx: number,
) {
    return levelIdx > 7 ? requestedSeqTier : 'M';
}

export type Av01VideoAdditionalInfoToBuildCodecsParameterString = {
    monoChrome: boolean;
    chromaSubsampling: keyof typeof av01ChromaSubsamplingTable;
    colorPrimary: keyof typeof av01ColorPrimariesTable;
    transferCharacteristics: keyof typeof av01TransferCharacteristicsTable;
    matrixCoefficients: keyof typeof av01MatrixCoefficientsTable;
    videoFullRange: boolean;
};

export const av01VideoAdditionalInfoToBuildCodecsParameterStringDefaults = {
    monoChrome: false,
    chromaSubsampling: '4:2:0',
    colorPrimary: 'BT_709',
    transferCharacteristics: 'BT_709',
    matrixCoefficients: 'BT_709',
    videoFullRange: false,
} as const satisfies Av01VideoAdditionalInfoToBuildCodecsParameterString;

function numPad(num: number, length: number) {
    return num.toString().padStart(length, '0');
}

/**
 * Build codecs parameter string for av01.
 * https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs#recording_video
 * https://aomediacodec.github.io/av1-isobmff/#codecsparam
 */
export function av01PL(
    levelInfo: Av01VideoInfoToGuessLevel,

    /**
     * Color depth, like 8, 10 and 12.
     */
    depth: number | '8' | '10' | '12' = 8,

    /**
     * Sequence tier: 'M' or 'H', maybe related to temporal and spatial scalability.
     */
    seqTier: 'M' | 'H' = 'M',

    additional?: Av01VideoAdditionalInfoToBuildCodecsParameterString | null,
    DEV = false,
): `av01.${string}` {
    const level = av01GuessLevelFromInformations(levelInfo, DEV);
    const basic = `av01.${av01ProfileToProfileIdTable[levelInfo.profile]}.${numPad(level.levelIdx, 2)}${av01CorrectSeqTier(seqTier, level.levelIdx)}.${depth.toString().padStart(2, '0')}` as `av01.${string}`;
    if (additional) {
        return [
            basic,
            additional.monoChrome ? '1' : '0',
            av01ChromaSubsamplingTable[additional.chromaSubsampling],
            numPad(av01ColorPrimariesTable[additional.colorPrimary], 2),
            numPad(av01TransferCharacteristicsTable[additional.transferCharacteristics], 2),
            numPad(av01MatrixCoefficientsTable[additional.matrixCoefficients], 2),
            additional.videoFullRange ? '1' : '0',
        ].join('.') as `av01.${string}`;
    }
    return basic;
}
