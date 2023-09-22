// https://datatracker.ietf.org/doc/html/rfc6184#section-8.1
// DO NOT USE THIS FOR PARSE
export const avc1ProfileToProfileIdTable = {
    'constrained_baseline': '4240',
    'baseline':             '4200',
    'extended':             '5800',
    'constrained_main':     '4d40',
    'main':                 '4d00',
    'constrained_high':     '640c',
    'high':                 '6400',
    'high_progressive':     '6408',
    /**
     * 10bit and 422/444 are not supported by JS Canvas,
     * so the following definitions are not used in this application,
     * but may be useful for something else.
     */
    'high_10':              '6e00',
    'high_10_intra':        '6e10',
    'high_422':             '7a00',
    'high_422_intra':       '7a10',
    'high_444_predictive':  'f400',
    'high_444_intra':       'f410',
    'cavlc_444_intra':      '2c00',
} as const;

class Avc1ProfileIdcToFactor {
    constructor(
        public readonly profileIdc: number,
        public readonly cpbBrVclFactor: number,
        public readonly cpbBrNalFactor: number,
    ) {}
}

/**
 * [profile_idc, cpbBrVclFactor, cpbBrNalFactor][]
 * 
 * https://www.itu.int/rec/T-REC-H.264-202108-I Table A-2
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L52
 */
export const avc1ProfileIdcToFactorTable = [
    new Avc1ProfileIdcToFactor( 66 /*0x42*/, 1000, 1200),
    new Avc1ProfileIdcToFactor( 77 /*0x4d*/, 1000, 1200),
    new Avc1ProfileIdcToFactor( 88 /*0x58*/, 1000, 1200),
    new Avc1ProfileIdcToFactor(100 /*0x64*/, 1250, 1500),
    new Avc1ProfileIdcToFactor(110 /*0x6e*/, 3000, 3600),
    new Avc1ProfileIdcToFactor(122 /*0x7a*/, 4000, 4800),
    new Avc1ProfileIdcToFactor(244 /*0xf4*/, 4000, 4800),
    new Avc1ProfileIdcToFactor( 44 /*0x2c*/, 4000, 4800),
] as const;

/**
 * Get cpbBrNalFactor from profile name.
 * There is cpbBrVclFactor, but it is not used in this application,
 * based on ffmpeg's implementation.
 * @param profile profile name
 * @returns NAL factor
 */
export function avc1GetProfileToNalFactor(profile: keyof typeof avc1ProfileToProfileIdTable) {
    const targetProfileIdc = parseInt(avc1ProfileToProfileIdTable[profile].substring(0, 2), 16);
    // profile_idcのバリエーションはavc1ProfileIdcToFactorTableで定義されたものしか存在しない
    const factor = avc1ProfileIdcToFactorTable.find(({ profileIdc }) => profileIdc === targetProfileIdc);
    if (!factor) throw new Error(`profile ${profile} is not supported`);
    return factor.cpbBrNalFactor;
}

class Avc1LevelLimit {
    constructor(
        public readonly name: string,
        public readonly levelIdc: number,
        public readonly cs3fFlag: number,
        public readonly maxMBPS: number,
        public readonly maxFS: number,
        public readonly maxDpbMbs: number,
        public readonly maxBR: number,
        public readonly maxCPB: number,
        public readonly maxVmvR: number,
        public readonly minCR: number,
        public readonly maxMvsPer2Mb: number,
    ) {}
}

/**
 * [Name, level_idc, cs3f, MaxMBPS, MaxFS, MaxDpbMbs, MaxBR, MaxCPB, MaxVmvR, MinCR, MaxMvsPer2Mb]
 * 
 * https://www.itu.int/rec/T-REC-H.264-202108-I Table A-1
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L24
 */
export const avc1LevelLimitsTable = [
  //                   Name, idc, cs3f,MxMBPS,  MaxFS, DpbMbs,  MaxBR, MaxCPB, VmvR,CR, Mvs/2Mb]
    new Avc1LevelLimit("1",   10, 0,     1485,     99,    396,     64,    175,   64, 2,  0),
  //new Avc1LevelLimit("1b",  11, 1,     1485,     99,    396,    128,    350,   64, 2,  0),
    new Avc1LevelLimit("1b",   9, 0,     1485,     99,    396,    128,    350,   64, 2,  0),
    new Avc1LevelLimit("1.1", 11, 0,     3000,    396,    900,    192,    500,  128, 2,  0),
    new Avc1LevelLimit("1.2", 12, 0,     6000,    396,   2376,    384,   1000,  128, 2,  0),
    new Avc1LevelLimit("1.3", 13, 0,    11880,    396,   2376,    768,   2000,  128, 2,  0),
    new Avc1LevelLimit("2",   20, 0,    11880,    396,   2376,   2000,   2000,  128, 2,  0),
    new Avc1LevelLimit("2.1", 21, 0,    19800,    792,   4752,   4000,   4000,  256, 2,  0),
    new Avc1LevelLimit("2.2", 22, 0,    20250,   1620,   8100,   4000,   4000,  256, 2,  0),
    new Avc1LevelLimit("3",   30, 0,    40500,   1620,   8100,  10000,  10000,  256, 2, 32),
    new Avc1LevelLimit("3.1", 31, 0,   108000,   3600,  18000,  14000,  14000,  512, 4, 16),
    new Avc1LevelLimit("3.2", 32, 0,   216000,   5120,  20480,  20000,  20000,  512, 4, 16),
    new Avc1LevelLimit("4",   40, 0,   245760,   8192,  32768,  20000,  25000,  512, 4, 16),
    new Avc1LevelLimit("4.1", 41, 0,   245760,   8192,  32768,  50000,  62500,  512, 2, 16),
    new Avc1LevelLimit("4.2", 42, 0,   522240,   8704,  34816,  50000,  62500,  512, 2, 16),
    new Avc1LevelLimit("5",   50, 0,   589824,  22080, 110400, 135000, 135000,  512, 2, 16),
    new Avc1LevelLimit("5.1", 51, 0,   983040,  36864, 184320, 240000, 240000,  512, 2, 16),
    new Avc1LevelLimit("5.2", 52, 0,  2073600,  36864, 184320, 240000, 240000,  512, 2, 16),
    new Avc1LevelLimit("6",   60, 0,  4177920, 139264, 696320, 240000, 240000, 8192, 2, 16),
    new Avc1LevelLimit("6.1", 61, 0,  8355840, 139264, 696320, 480000, 480000, 8192, 2, 16),
    new Avc1LevelLimit("6.2", 62, 0, 16711680, 139264, 696320, 800000, 800000, 8192, 2, 16),
] as const;

export type Avc1VideoInfoToGuessLevel = {
    profile: keyof typeof avc1ProfileToProfileIdTable;
    width: number;
    height: number;
    fps: number;
    prefferedAllowingMaxBitrate?: number;
    maxDecFrameBuffering?: number;
}

/**
 * Guess suitable level from video informations.
 *
 * https://github.com/FFmpeg/FFmpeg/blob/ea063171903638541a8debded3a828456dd73fc9/libavcodec/h264_levels.c#L79C37-L79C37
 */
export function avc1GuessLevelIdcFromInformations(
    { profile, width, height, fps, prefferedAllowingMaxBitrate, maxDecFrameBuffering }: Avc1VideoInfoToGuessLevel,
    DEV = false,
) {
    const profileIdc = avc1ProfileToProfileIdTable[profile];
    if (!profileIdc) {
        throw new Error(`avc1 guess lv: profile ${profile} is not supported`);
    }
    if (!Math.max(width, 0) || !Math.max(height, 0) || !Math.max(fps, 0)) {
        throw new Error('avc1 guess lv: width, heighta and fps must be positive number');
    }
    const acceptCs3f = profileIdc.startsWith('42') || profileIdc.startsWith('4d') || profileIdc.startsWith('58');
    const factor = avc1GetProfileToNalFactor(profile);
    
    // Example: 1280x720@30fps expected 3.1
    const widthMBs = Math.ceil(width / 16);   // 1280 -> 80
    const heightMBs = Math.ceil(height / 16); //  720 -> 45
    const whMBs = widthMBs * heightMBs;       // 3600
    const whMBPS = whMBs * fps;               // 108000
    const whDpbMbs = whMBs * (maxDecFrameBuffering ?? 0); // 180000 if 4
    const wwMBs = widthMBs ** 2;              // 6400
    const hhMBs = heightMBs ** 2;             // 2025

    let antiprefferedLevelIdc: number | undefined = undefined;
    for (let i = 0; i < avc1LevelLimitsTable.length; i++) {
        const level = avc1LevelLimitsTable[i];
        if (level.cs3fFlag && !acceptCs3f) continue;

        if (whMBs > level.maxFS) continue;
        if (wwMBs > 8 * level.maxFS) continue;
        if (hhMBs > 8 * level.maxFS) continue;
        if (whMBPS > level.maxMBPS) continue;

        if (maxDecFrameBuffering) {
            if (whDpbMbs > level.maxDpbMbs) continue;
        }
        if (DEV) console.log('avc1 guess lv: level choosing: bitrate', level.name, (prefferedAllowingMaxBitrate ?? 0) / 1000, level.maxBR, factor, (level.maxBR * factor) / 1000);
        if (prefferedAllowingMaxBitrate &&
            prefferedAllowingMaxBitrate > level.maxBR * factor) {
            antiprefferedLevelIdc = level.levelIdc;
            continue;
        }
        if (DEV) console.log('avc1 guess lv: level choosing: level chosen', level.name, level.levelIdc);
        return level.levelIdc;
    }
    if (antiprefferedLevelIdc) {
        if (DEV) console.log('avc1 guess lv: level choosing: anti-preffered level chosen', antiprefferedLevelIdc);
        return antiprefferedLevelIdc;
    }
    throw new Error(`suitable level is not found`);
}

/**
 * Just convert from decimal to hex.
 * @param levelx10 10 means 1.0
 * @returns '00' - 'ff'
 */
function avc1LevelId(levelx10: number) {
    return levelx10.toString(16).padStart(2, '0');
}

export function avc1PL<E extends keyof typeof avc1ProfileToProfileIdTable>(
    profile: E,
    levelx10: number,
): `avc1.${typeof avc1ProfileToProfileIdTable[E]}${string}` {
    return `avc1.${avc1ProfileToProfileIdTable[profile]}${avc1LevelId(levelx10)}`;
}

export function avc1PLFromVideoInfo(
    videoInfo: Avc1VideoInfoToGuessLevel,
    DEV = false,
): string {
    return avc1PL(videoInfo.profile, avc1GuessLevelIdcFromInformations(videoInfo, DEV));
}
