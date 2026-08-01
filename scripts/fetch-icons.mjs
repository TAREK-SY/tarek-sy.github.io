// Builds an SVG sprite from real Tabler Icons source. No hand-drawn paths.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.argv[2];
const VERSION = "3.36.0";

const ICONS = [
  "brand-github",
  "brand-linkedin",
  "brand-whatsapp",
  "brand-google-play",
  "mail",
  "phone",
  "external-link",
  "file-download",
  "arrow-up-right",
  "arrow-narrow-left",
  "arrow-narrow-right",
  "sun",
  "moon",
  "language",
  "x",
  "chevron-left",
  "chevron-right",
  "menu-2",
  "copy",
  "check",
];

const CANDIDATES = (name) => [
  `https://unpkg.com/@tabler/icons@${VERSION}/icons/outline/${name}.svg`,
  `https://unpkg.com/@tabler/icons@${VERSION}/icons/${name}.svg`,
];

const symbols = [];
for (const name of ICONS) {
  let svg = null;
  for (const url of CANDIDATES(name)) {
    const res = await fetch(url);
    if (res.ok) {
      svg = await res.text();
      break;
    }
  }
  if (!svg) {
    console.error(`MISSING: ${name}`);
    continue;
  }
  // Keep only the drawing children; stroke styling is applied on <use> via CSS.
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<path stroke="none"[^>]*\/>/g, "")
    .trim();
  symbols.push(
    `  <symbol id="i-${name}" viewBox="0 0 24 24">\n    ${inner.replace(/\n\s*/g, "\n    ")}\n  </symbol>`,
  );
  console.log(`ok  ${name}`);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<!-- Tabler Icons ${VERSION} (MIT). https://tabler.io/icons -->
${symbols.join("\n")}
</svg>
`;

await mkdir(join(ROOT, "assets", "icons"), { recursive: true });
await writeFile(join(ROOT, "assets", "icons", "sprite.svg"), sprite, "utf8");
console.log(`\n${symbols.length} symbols -> assets/icons/sprite.svg`);
