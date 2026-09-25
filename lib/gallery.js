import fs from "fs";
import path from "path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function readNote(folder, files) {
  const jsonName = files.find((name) => name.toLowerCase() === "message.json");
  if (!jsonName) return "";

  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(folder, jsonName), "utf8")
    );
    return String(raw._message || raw.message || raw.note || "").trim();
  } catch {
    return "";
  }
}

export function getGalleryPages() {
  const root = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(root)) return [];

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^page\d+$/i.test(entry.name))
    .sort((a, b) => {
      const left = Number.parseInt(a.name.replace(/\D/g, ""), 10);
      const right = Number.parseInt(b.name.replace(/\D/g, ""), 10);
      return left - right;
    });

  return dirs
    .map((dir, pageIndex) => {
      const folder = path.join(root, dir.name);
      const files = fs.readdirSync(folder);
      const images = files
        .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        )
        .slice(0, 3)
        .map((filename, photoIndex) => ({
          src: `/gallery/${dir.name}/${filename}`,
          alt: `Album page ${pageIndex + 1}, photo ${photoIndex + 1}`,
        }));

      return {
        id: dir.name,
        pageNumber: pageIndex + 1,
        note: readNote(folder, files),
        images,
      };
    })
    .filter((page) => page.images.length > 0);
}
