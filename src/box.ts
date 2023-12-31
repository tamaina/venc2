import { BoxParser, DataStream } from "@webav/mp4box.js";

export function getBoxBuffer(box: BoxParser.Box | BoxParser.ContainerBox | BoxParser.TrackReferenceTypeBox) {
    const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
    box.write(stream);
    return stream.buffer;
}

// https://github.com/w3c/webcodecs/blob/261401a02ff2fd7e1d3351e3257fe0ef96848fde/samples/video-decode-display/demuxer_mp4.js#L64
// MEMO: about avcC (AVCDecoderConfigurationRecord)
//       https://gist.github.com/uupaa/8493378ec15f644a3d2b
export function getDescriptionBuffer(entry: any) {
	const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
	if (box) {
		const buffer = getBoxBuffer(box);
		return new Uint8Array(buffer, 8);  // Remove the box header.
	}
	throw new Error("avcC, hvcC, vpcC or av1C box not found");
}

export function getDescriptionBoxEntriesFromTrak(trak: any /* BoxParser.trakBox */) {
    return trak?.mdia?.minf?.stbl?.stsd?.entries as BoxParser.Box[] ?? [];
}
