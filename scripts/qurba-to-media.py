"""Selects the Qurba screens worth showing, trims dead space from the desktop
captures, and writes them into the portfolio's media folder + manifest."""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops

SHOTS = Path(sys.argv[1])
REPO = Path(sys.argv[2])
OUT = REPO / "assets" / "media" / "qurba"
SLUG = "qurba"

FULL_MAX = 1400
THUMB_MAX = 620
QUALITY = 80

# Ordered so the strip on the home page is three customer-app screens, and the
# case study then walks customer -> agent -> operations.
SELECTION = [
    "customer-home",
    "customer-tasksBoard",
    "customer-taskTracking",
    "customer-beneficiariesList",
    "customer-beneficiaryDetail",
    "customer-newTaskInPlan",
    "customer-completionProof",
    "customer-taskRating",
    "customer-plansCompare",
    "customer-subscriptionManage",
    "customer-chatScreen",
    "customer-onboarding",
    "agent-login",
    "agent-newTasksQueue",
    "agent-myTasks",
    "agent-taskExecution",
    "agent-earnings",
    "agent-profile",
    "ops-kpi",
    "ops-tasks",
    "ops-agents",
    "ops-disputes",
    "ops-reports",
]


def trim_bottom(img: Image.Image, min_ratio: float = 16 / 10) -> Image.Image:
    """Desktop screens are shot at a fixed height; drop the uniform tail but
    never crop tighter than a 16:10 frame."""
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, rgb.getpixel((rgb.width // 2, rgb.height - 2)))
    box = ImageChops.difference(rgb, bg).getbbox()
    if not box:
        return img
    content_bottom = box[3] + 24
    floor = int(img.width / min_ratio)
    return img.crop((0, 0, img.width, max(floor, min(img.height, content_bottom))))


def save(img: Image.Image, dest: Path, max_edge: int) -> dict:
    im = img.convert("RGB").copy()
    im.thumbnail((max_edge, max_edge), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    return {"w": im.width, "h": im.height}


entries = []
missing = []
for i, name in enumerate(SELECTION, 1):
    src = SHOTS / f"{name}.png"
    if not src.is_file():
        missing.append(name)
        continue
    stem = f"{i:02d}"
    with Image.open(src) as img:
        if name.startswith("ops-"):
            img = trim_bottom(img)
        full = save(img, OUT / f"{stem}.webp", FULL_MAX)
        thumb = save(img, OUT / f"{stem}-sm.webp", THUMB_MAX)
    entries.append(
        {
            "src": f"assets/media/{SLUG}/{stem}.webp",
            "thumb": f"assets/media/{SLUG}/{stem}-sm.webp",
            "w": full["w"],
            "h": full["h"],
            "thumbW": thumb["w"],
            "thumbH": thumb["h"],
        }
    )
    print(f"{stem}  {name:32s} {full['w']}x{full['h']}")

manifest_path = REPO / "assets" / "media" / "manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf8"))
manifest["galleries"][SLUG] = entries
manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf8")

size = sum(f.stat().st_size for f in OUT.iterdir())
print(f"\n{len(entries)} screens -> {size / 1024 / 1024:.1f}MB")
if missing:
    print("missing:", ", ".join(missing))
