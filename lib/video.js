import fs from "fs";
import path from "path";
import { content } from "@/lib/content";

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".ogg", ".m4v"]);

export function getVideoSrc() {
  const root = path.join(process.cwd(), "public", "video");
  if (!fs.existsSync(root)) return content.videoSrc;

  const file = fs
    .readdirSync(root)
    .filter((name) => VIDEO_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    )[0];

  return file ? `/video/${file}` : content.videoSrc;
}
