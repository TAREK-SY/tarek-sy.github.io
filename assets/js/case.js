/** Renders a single project case study, addressed by `?p=<slug>`. */

import {
  boot,
  esc,
  icon,
  loadData,
  observeReveals,
  pick,
  renderError,
  t,
} from "./core.js";

const app = document.getElementById("app");
let gallery = [];
let cursor = 0;

/* -------------------------------------------------------------------------
   Lightbox. Uses <dialog> so focus trapping and Escape come from the platform.
   ------------------------------------------------------------------------- */

const dialog = document.getElementById("lightbox");
const stage = dialog.querySelector("[data-stage]");
const counter = dialog.querySelector("[data-counter]");
const prevBtn = dialog.querySelector("[data-prev]");
const nextBtn = dialog.querySelector("[data-next]");
const closeBtn = dialog.querySelector("[data-close]");

function paintSlide() {
  const s = t();
  const img = gallery[cursor];
  if (!img) return;
  stage.innerHTML = `<img src="${esc(img.src)}" width="${img.w}" height="${img.h}"
      alt="${esc(s.imageOf(cursor + 1, gallery.length))}" decoding="async">`;
  counter.textContent = s.imageOf(cursor + 1, gallery.length);
  prevBtn.disabled = cursor === 0;
  nextBtn.disabled = cursor === gallery.length - 1;
}

function step(delta) {
  const target = cursor + delta;
  if (target < 0 || target >= gallery.length) return;
  cursor = target;
  paintSlide();
}

function openLightbox(index) {
  cursor = index;
  paintSlide();
  dialog.showModal();
}

function syncLightboxLabels() {
  const s = t();
  closeBtn.setAttribute("aria-label", s.close);
  prevBtn.setAttribute("aria-label", s.previous);
  nextBtn.setAttribute("aria-label", s.next);
  closeBtn.innerHTML = icon("x");
  prevBtn.innerHTML = icon("chevron-left");
  nextBtn.innerHTML = icon("chevron-right");
  if (dialog.open) paintSlide();
}

closeBtn.addEventListener("click", () => dialog.close());
prevBtn.addEventListener("click", () => step(-1));
nextBtn.addEventListener("click", () => step(1));

dialog.addEventListener("keydown", (e) => {
  // Arrow semantics follow reading direction.
  const rtl = document.documentElement.dir === "rtl";
  if (e.key === "ArrowRight") step(rtl ? -1 : 1);
  if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
});

// Clicking the backdrop (but not the image) closes.
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

/* -------------------------------------------------------------------------
   Page
   ------------------------------------------------------------------------- */

function metaRow(term, value) {
  return value ? `<dt>${esc(term)}</dt><dd>${esc(value)}</dd>` : "";
}

function render(data, project) {
  const s = t();
  const name = pick(project.name);
  gallery = data.media.galleries[project.slug] ?? [];
  const landscape = Boolean(gallery[0] && gallery[0].w > gallery[0].h);

  const index = data.projects.findIndex((p) => p.slug === project.slug);
  const next = data.projects[(index + 1) % data.projects.length];

  const links = [
    project.links.playStore && [
      "brand-google-play",
      project.links.playStore,
      s.playStore,
    ],
    project.links.website && [
      "external-link",
      project.links.website,
      s.visitSite,
    ],
  ]
    .filter(Boolean)
    .map(
      ([ic, url, label]) =>
        `<a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon(ic)}${esc(label)}</a>`,
    )
    .join("");

  document.title = `${name} | ${pick(data.profile.name)}`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", pick(project.summary));

  app.innerHTML = `
    <header class="case-head shell">
      <a class="back-link" href="index.html#work">${icon("arrow-narrow-left")}${esc(s.backToWork)}</a>
      <h1 class="case-title">${esc(name)}</h1>
      <p class="case-lead">${esc(pick(project.summary))}</p>
      <dl class="case-meta">
        ${metaRow(s.metaType, pick(project.kind))}
        ${metaRow(s.metaYear, project.year)}
        ${metaRow(s.metaRole, pick(project.role))}
        ${metaRow(s.metaStack, project.tech.join(", "))}
      </dl>
      ${links ? `<div class="case-actions">${links}</div>` : ""}
    </header>

    <section class="case-section shell" data-reveal>
      <h2>${esc(s.whatItTook)}</h2>
      <ul class="case-points">
        ${project.challenges.map((c) => `<li>${esc(pick(c))}</li>`).join("")}
      </ul>
    </section>

    ${
      gallery.length
        ? `<section class="case-section shell" data-reveal>
      <h2>${esc(s.screens)}</h2>
      <div class="gallery"${landscape ? ' data-orientation="landscape"' : ""}>
        ${gallery
          .map(
            (img, i) => `
          <button type="button" data-index="${i}" aria-label="${esc(s.imageOf(i + 1, gallery.length))}">
            <img src="${esc(img.thumb)}" width="${img.thumbW}" height="${img.thumbH}"
              alt="${esc(s.screenshotAlt(name, i + 1))}" loading="lazy" decoding="async">
          </button>`,
          )
          .join("")}
      </div>
    </section>`
        : ""
    }

    <nav class="case-next shell" data-reveal>
      <p class="work-kind">${esc(s.nextProject)}</p>
      <h2><a href="project.html?p=${encodeURIComponent(next.slug)}">${esc(pick(next.name))}</a></h2>
    </nav>

    <footer class="footer">
      <div class="shell footer-inner">
        <p>&copy; ${new Date().getFullYear()} ${esc(pick(data.profile.name))}. ${esc(s.rights)}</p>
        <p><a href="index.html">${esc(pick(data.profile.name))}</a></p>
      </div>
    </footer>`;

  app.querySelectorAll(".gallery button").forEach((btn) =>
    btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index))),
  );

  observeReveals(app);
  syncLightboxLabels();
}

function renderNotFound(data) {
  const s = t();
  app.innerHTML = `
    <div class="shell state">
      <h2>${esc(s.notFoundTitle)}</h2>
      <p>${esc(s.notFoundBody)}</p>
      <a class="btn btn-primary" href="index.html#work">${esc(s.backToWork)}</a>
    </div>`;
  if (data) {
    document.querySelector("[data-nav-brand]").textContent = pick(
      data.profile.name,
    );
  }
}

async function start() {
  const slug = new URLSearchParams(location.search).get("p");
  app.setAttribute("aria-busy", "true");
  try {
    const data = await loadData();
    document.querySelector("[data-nav-brand]").textContent = pick(
      data.profile.name,
    );
    const project = data.projects.find((p) => p.slug === slug);

    const paint = () =>
      project ? render(data, project) : renderNotFound(data);
    paint();
    document.addEventListener("langchange", paint);
  } catch (err) {
    console.error(err);
    renderError(app, start);
  } finally {
    app.removeAttribute("aria-busy");
  }
}

await boot();
await start();
