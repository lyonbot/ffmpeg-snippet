import { forEach, reduce } from "lodash";
import { CommonFileType } from "./constants";

export const commonExtname: Record<CommonFileType, string[]> = {
  video: [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".mpeg", ".3gp", ".ts"],
  audio: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a", ".ape", ".alac"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".svg", ".webp", ".heic"],
  subtitle: [".srt", ".sub", ".ass", ".vtt", ".sbv", ".ssa", ".smi", ".stl", ".usf"],
};

const ext2TypeLUT = reduce(
  commonExtname,
  (acc: Record<string, CommonFileType>, exts, type) => {
    forEach(exts, (ext) => {
      acc[ext] = type as CommonFileType;
    });
    return acc;
  },
  {}
);

/** get file extname like `.txt` */
export function extname(name: string) {
  let p = name.lastIndexOf(".");
  if (p === -1) return "";
  const ext = name.slice(p).trim().toLowerCase();
  return ext;
}

export function guessTypeByFilename(name: string): CommonFileType | undefined {
  return ext2TypeLUT[extname(name)];
}
