import { BoxParser } from "@webav/mp4box.js";
export declare function getBoxBuffer(box: BoxParser.Box | BoxParser.ContainerBox | BoxParser.TrackReferenceTypeBox): any;
export declare function getDescriptionBuffer(entry: any): Uint8Array;
export declare function getDescriptionBoxEntriesFromTrak(trak: any): BoxParser.Box[];
