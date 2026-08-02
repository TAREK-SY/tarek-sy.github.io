/**
 * Renders each screen of a .dc.html prototype and screenshots it.
 *
 * The prototypes are single React components whose visible screen is driven by
 * one `screen` state field, so a per-screen variant is produced by rewriting the
 * initial state, then captured with headless Chrome.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { join, extname } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const SRC = process.argv[2];
const SHOTS = process.argv[3];
const PORT = 4180;

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** Frame size per prototype. Phones keep the device mock; the dashboard is a
 *  desktop layout and is shot at laptop width. */
const TARGETS = [
  { file: "customer.html", slug: "customer", width: 438, height: 892, pad: 24 },
  { file: "agent.html", slug: "agent", width: 438, height: 892, pad: 24 },
  { file: "ops.html", slug: "ops", width: 1440, height: 900, pad: 0 },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

function screensOf(html) {
  const m = /\[([^\]]+)\]\.forEach\(k\s*=>\s*screenIs\[k\]/.exec(html);
  if (!m) throw new Error("screen list not found");
  return m[1].replace(/['"\s]/g, "").split(",").filter(Boolean);
}

/** Strips the centring page padding so the capture is the frame itself. */
function overrideCss(pad) {
  return `<style id="capture-override">
    html,body{margin:0!important;padding:0!important;overflow:hidden!important}
    #dc-root>div[dir="rtl"]{padding:${pad}px!important;min-height:0!important;align-items:flex-start!important}
  </style>`;
}

async function build() {
  const jobs = [];
  for (const t of TARGETS) {
    let html;
    try {
      html = await readFile(join(SRC, t.file), "utf8");
    } catch {
      console.log(`skip ${t.file} (not extracted yet)`);
      continue;
    }
    const screens = screensOf(html);
    console.log(`${t.slug}: ${screens.length} screens`);
    for (const screen of screens) {
      const patched = html
        .replace(/(state\s*=\s*\{[^}]*?screen:\s*)'[^']+'/, `$1'${screen}'`)
        .replace("</head>", `${overrideCss(t.pad)}</head>`);
      const name = `_cap-${t.slug}-${screen}.html`;
      await writeFile(join(SRC, name), patched, "utf8");
      jobs.push({ ...t, screen, name });
    }
  }
  return jobs;
}

function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "");
      try {
        const body = await readFile(join(SRC, path));
        res.writeHead(200, { "Content-Type": MIME[extname(path)] ?? "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404).end("not found");
      }
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const jobs = await build();
if (!jobs.length) {
  console.log("nothing to capture");
  process.exit(0);
}
await mkdir(SHOTS, { recursive: true });
const server = await serve();

let ok = 0;
let failed = [];
for (const job of jobs) {
  const out = join(SHOTS, `${job.slug}-${job.screen}.png`);
  try {
    await run(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      `--window-size=${job.width},${job.height}`,
      "--virtual-time-budget=9000",
      `--screenshot=${out}`,
      `http://127.0.0.1:${PORT}/${job.name}`,
    ], { timeout: 60000 });
    ok++;
  } catch (err) {
    failed.push(`${job.slug}-${job.screen}: ${err.code ?? err.message}`);
  }
}
server.close();

const files = (await readdir(SHOTS)).filter((f) => f.endsWith(".png"));
console.log(`\ncaptured ${ok}/${jobs.length}, ${files.length} png on disk`);
if (failed.length) console.log("failed:\n  " + failed.join("\n  "));
