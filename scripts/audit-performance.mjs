import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const issues = [];
let images = 0;
let bytes = 0;
async function walk(dir) {
  try {
    return (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
  } catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
for (const file of await walk(path.join(root, "public"))) {
  const relative = path.relative(root, file);
  if (/\.(png|jpe?g|avif|gif)$/i.test(file)) issues.push(relative + ": use WebP for content images (SVG remains vector).");
  if (/\.webp$/i.test(file)) {
    const size = (await fs.stat(file)).size;
    images++;
    bytes += size;
    const header = (await fs.readFile(file)).subarray(0, 12);
    if (header.toString("ascii", 0, 4) !== "RIFF" || header.toString("ascii", 8, 12) !== "WEBP") issues.push(relative + ": extension is WebP but its file signature is not.");
    if (size > 250 * 1024) issues.push(relative + ": exceeds the 250 KiB source-image budget; resize or compress it.");
  }
}
for (const dir of ["app", "components", "lib", "content"]) {
  for (const file of await walk(path.join(root, dir))) {
    if (!/\.[jt]sx?$/.test(file)) continue;
    const source = await fs.readFile(file, "utf8");
    const allIcons = /import\s+\*\s+as\s+\w+\s+from\s+["'](?:lucide-react|@phosphor-icons\/react|@hugeicons\/core-free-icons)["']|lucide-react\/(?:dynamic|dynamicIconImports)|from\s+["'](?:lucide-react|@phosphor-icons\/react)["'][^;]*\bicons\b/;
    const catalog = /import\s*{[^}]*\b(?:icons|dynamicIconImports)\b[^}]*}\s*from\s*["']lucide-react["']|import\s*\(\s*["'](?:lucide-react|@phosphor-icons\/react|@hugeicons\/core-free-icons)["']\s*\)/;
    if (allIcons.test(source) || catalog.test(source)) issues.push(path.relative(root, file) + ": import only named icons; do not ship the whole icon catalog.");
  }
}
console.log(images + " WebP images, " + (bytes / 1024).toFixed(1) + " KiB total source assets.");
if (issues.length) { console.error(issues.join("\n")); process.exitCode = 1; }
else console.log("PASS: image format/size budget and icon imports.");
