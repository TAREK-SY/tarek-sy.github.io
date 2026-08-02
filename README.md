# tarek-sy.github.io

Portfolio site for Tarek Nassan. Static HTML, CSS and JavaScript with no build
step: what is in the repository is what GitHub Pages serves.

## Running it locally

ES modules and `fetch` need a real origin, so opening `index.html` from the
filesystem will not work. Serve the folder instead:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Layout

```
index.html            Home page shell
project.html          Case study shell, addressed by ?p=<slug>
404.html              Not found page
content/
  portfolio.json      All copy and project data, bilingual
assets/
  css/
    fonts.css         Generated @font-face rules
    base.css          Design tokens, reset, typography
    site.css          Layout and components
  js/
    core.js           Theme, language, data loading, scroll reveal
    home.js           Home page rendering
    case.js           Case study rendering and lightbox
  fonts/              Self-hosted woff2 subsets
  icons/sprite.svg    Tabler Icons subset
  media/              WebP screenshots plus manifest.json
scripts/              Asset generators, see below
```

## Editing content

Everything visible on the site comes from `content/portfolio.json`. Nothing
needs to be edited in HTML or JavaScript to change copy, add a project, or
update contact details.

### Adding a project

1. Put the screenshots in a folder and run the media script (see below) so they
   land in `assets/media/<slug>/` and get registered in `manifest.json`.
2. Append an object to the `projects` array in `content/portfolio.json`. The
   `slug` must match the media folder name.

```jsonc
{
  "slug": "my-project",
  "name":    { "en": "My Project", "ar": "مشروعي" },
  "kind":    { "en": "Mobile app", "ar": "تطبيق موبايل" },
  "year":    "2025",
  "role":    { "en": "Sole developer", "ar": "مطوّر منفرد" },
  "status":  { "en": "Working prototype", "ar": "نموذج أوّلي" },  // optional badge
  "summary": { "en": "One or two sentences.", "ar": "جملة أو جملتان." },
  "tech":    ["Flutter", "Dart"],
  "metrics": [
    { "value": "27", "label": { "en": "Screens", "ar": "شاشة" } }
  ],
  "challenges": [
    { "en": "The hard part", "ar": "الجزء الصعب" }
  ],
  "links": { "playStore": "", "website": "" }
}
```

Empty strings are omitted from the page rather than rendered blank, so it is
safe to leave `year`, `role`, `status`, or either link unset.

`metrics` doubles as the fallback visual: a project with screenshots shows a
thumbnail strip, and a project without them shows its figures in that slot
instead. Add screenshots and the strip takes over automatically.

The same file also drives `stats` (the band under the hero), `skills`,
`experience`, and `education`.

## Asset generators

These run by hand when the inputs change. They are not part of deployment.

| Script                    | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `scripts/fetch-fonts.mjs` | Downloads Geist and IBM Plex Sans Arabic, writes `fonts.css` |
| `scripts/fetch-icons.mjs` | Builds `assets/icons/sprite.svg` from Tabler Icons           |
| `scripts/build-media.py`  | Converts source images to WebP and writes `manifest.json`    |

```bash
node scripts/fetch-fonts.mjs .
node scripts/fetch-icons.mjs .
python scripts/build-media.py .          # expects source images under images/
```

`build-media.py` reads from an `images/` folder laid out by project. That folder
is not committed; point the script at your originals when adding screenshots.

### Where the Qurba screens came from

Qurba has no store listing to screenshot, so its 23 screens were rendered from
the source design files rather than mocked up. `scripts/capture-dc.mjs` takes a
Claude Design `.dc.html` prototype, rewrites the initial `screen` state once per
screen, serves the result, and captures each one with headless Chrome.
`scripts/qurba-to-media.py` then trims the desktop captures, converts everything
to WebP, and registers it in the manifest.

Both scripts need the `.dc.html` sources and their `support.js`, which live in
the design project, not in this repository.

## Design notes

- One accent colour, vermilion, used identically across every section.
  `#C13D18` on light (5.19:1), `#FF7A55` on dark (7.6:1).
- One corner radius system: 4px for controls, 6px for surfaces.
- Theme is locked per page, follows `prefers-color-scheme`, and can be
  overridden by the toggle. The choice persists in `localStorage`.
- Arabic uses IBM Plex Sans Arabic with full RTL. Direction flips through CSS
  logical properties, so there is no separate RTL stylesheet.
- Motion is limited to transitions and one `IntersectionObserver` reveal. There
  are no scroll event listeners, and everything collapses under
  `prefers-reduced-motion: reduce`.

## Deployment

Push to `main`. GitHub Pages serves the repository root.

## Contact

- Email: tareknassan2015@gmail.com
- WhatsApp: +963 988 450 079
- GitHub: https://github.com/TAREK-SY
