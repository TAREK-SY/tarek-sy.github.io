"""Converts the legacy images/ tree into optimised WebP under assets/media/.

Emits assets/media/manifest.json with intrinsic dimensions so the markup can set
width/height and avoid layout shift.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(sys.argv[1])
SRC = ROOT / "images"
OUT = ROOT / "assets" / "media"

# legacy folder -> project slug used everywhere in the new site
GALLERIES = {
    "ShellaWebsite": "shella",
    "ShellaApp": "shella",
    "sahlha": "sahlha",
    "maher-store": "maher-store",
    "AlphaGBC": "alpha-gbc",
}
LOGOS = {
    "Shella.png": "shella",
    "sahlha.png": "sahlha",
    "maher_store.jpg": "maher-store",
    "Alpha_GBC.png": "alpha-gbc",
}

FULL_MAX = 1400   # longest edge for the lightbox / case-study view
THUMB_MAX = 620   # longest edge for grid tiles
QUALITY = 80


def natural_key(p: Path):
    """`1 (10).png` must sort after `1 (9).png`."""
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", p.name)]


def save(img: Image.Image, dest: Path, max_edge: int) -> dict:
    im = ImageOps.exif_transpose(img)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")
    im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    return {"w": im.width, "h": im.height}


manifest: dict[str, list] = {}
before = sum(f.stat().st_size for f in SRC.rglob("*") if f.is_file())

# galleries -------------------------------------------------------------
buckets: dict[str, list[Path]] = {}
for folder, slug in GALLERIES.items():
    d = SRC / folder
    if not d.is_dir():
        print(f"skip missing {folder}")
        continue
    buckets.setdefault(slug, []).extend(sorted(d.iterdir(), key=natural_key))

for slug, files in buckets.items():
    entries = []
    for i, src in enumerate(files, 1):
        if not src.is_file():
            continue
        stem = f"{i:02d}"
        with Image.open(src) as img:
            full = save(img, OUT / slug / f"{stem}.webp", FULL_MAX)
        with Image.open(src) as img:
            thumb = save(img, OUT / slug / f"{stem}-sm.webp", THUMB_MAX)
        entries.append(
            {
                "src": f"assets/media/{slug}/{stem}.webp",
                "thumb": f"assets/media/{slug}/{stem}-sm.webp",
                "w": full["w"],
                "h": full["h"],
                "thumbW": thumb["w"],
                "thumbH": thumb["h"],
            }
        )
    manifest[slug] = entries
    print(f"{slug}: {len(entries)} images")

# logos -----------------------------------------------------------------
logos = {}
for filename, slug in LOGOS.items():
    src = SRC / "logo" / filename
    if not src.is_file():
        print(f"skip missing logo {filename}")
        continue
    with Image.open(src) as img:
        dim = save(img, OUT / "logos" / f"{slug}.webp", 240)
    logos[slug] = {"src": f"assets/media/logos/{slug}.webp", **dim}
print(f"logos: {len(logos)}")

(OUT / "manifest.json").write_text(
    json.dumps({"galleries": manifest, "logos": logos}, indent=2), encoding="utf8"
)

after = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
print(f"\n{before / 1024 / 1024:.1f}MB -> {after / 1024 / 1024:.1f}MB "
      f"({100 - after / before * 100:.0f}% smaller)")
