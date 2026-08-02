/** Renders the home page from content/portfolio.json. */

import {
  boot,
  esc,
  getLang,
  icon,
  loadData,
  observeReveals,
  pick,
  renderError,
  t,
} from "./core.js";

const app = document.getElementById("app");

function isLandscape(shots) {
  const first = shots?.[0];
  return Boolean(first && first.w > first.h);
}

/* -------------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------------- */

/**
 * Two real product screens for the hero. They sit side by side, so the pair is
 * chosen from one gallery whose shots share an aspect ratio: a mismatched pair
 * makes the offset read as a layout bug rather than a composition.
 */
function heroShots(media) {
  const shots = media.galleries.qurba ?? media.galleries.shella ?? [];
  const ratio = (img) => img.h / img.w;
  const tall = shots.filter((img) => ratio(img) > 1.8);
  const first = tall[0];
  if (!first) return [];
  const match = tall.find(
    (img) => img !== first && Math.abs(ratio(img) - ratio(first)) < 0.05,
  );
  return [first, match].filter(Boolean);
}

function heroSection(data) {
  const s = t();
  const { profile } = data;
  const picks = heroShots(data.media);

  const cv = profile.cv
    ? `<a class="btn btn-ghost" href="${esc(profile.cv)}" download>${icon("file-download")}${esc(s.downloadCv)}</a>`
    : "";

  const social = [
    profile.github && ["brand-github", profile.github, s.github],
    profile.linkedin && ["brand-linkedin", profile.linkedin, s.linkedin],
    profile.email && ["mail", `mailto:${profile.email}`, s.email],
  ]
    .filter(Boolean)
    .map(
      ([ic, href, label]) =>
        `<a href="${esc(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${esc(label)}">${icon(ic)}</a>`,
    )
    .join("");

  return `
    <section class="hero shell">
      <div class="hero-grid">
        <div data-reveal>
          <h1>${esc(pick(profile.headline))}</h1>
          <p class="hero-sub">${esc(pick(profile.summary))}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#work">${esc(s.viewWork)}</a>
            ${cv}
          </div>
          <div class="hero-social">${social}</div>
        </div>
        <div class="hero-media" data-reveal>
          ${picks
            .map(
              (img, i) =>
                // Both sit above the fold, so neither is lazy loaded.
                `<img src="${esc(img.src)}" width="${img.w}" height="${img.h}"
                   alt="${esc(s.screenshotAlt("Qurba", i + 1))}"
                   ${i === 0 ? 'fetchpriority="high"' : ""} decoding="async">`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

/**
 * Projects without screenshots fall back to their measured numbers. The figure
 * block is not decoration: it is the only visual the entry has, so it takes the
 * slot the media would occupy rather than leaving a hole in the grid.
 */
function metricPanel(project, s) {
  if (!project.metrics?.length) return "";
  return `
    <dl class="metric-panel">
      ${project.metrics
        .map(
          (m) => `
        <div>
          <dt class="mono">${esc(m.value)}</dt>
          <dd>${esc(pick(m.label))}</dd>
        </div>`,
        )
        .join("")}
    </dl>`;
}

function workItem(project, media, s) {
  const shots = media.galleries[project.slug] ?? [];
  const landscape = isLandscape(shots);
  const name = pick(project.name);
  const href = `project.html?p=${encodeURIComponent(project.slug)}`;

  const thumbs = shots
    .slice(0, 3)
    .map(
      (img, i) =>
        `<img src="${esc(img.thumb)}" width="${img.thumbW}" height="${img.thumbH}"
           alt="${esc(s.screenshotAlt(name, i + 1))}" loading="lazy" decoding="async">`,
    )
    .join("");

  const external = [
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
        `<a class="link-arrow" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon(ic)}${esc(label)}</a>`,
    )
    .join("");

  const visual = thumbs
    ? `<a class="work-media" href="${href}" tabindex="-1" aria-hidden="true"
         ${landscape ? 'data-orientation="landscape"' : ""}>${thumbs}</a>`
    : metricPanel(project, s);

  const status = project.status
    ? `<span class="badge">${esc(pick(project.status))}</span>`
    : "";

  return `
    <article class="work-item${thumbs ? "" : " work-item--figures"}" data-reveal>
      ${visual}
      <div class="work-body">
        <p class="work-kind">${esc(pick(project.kind))}${status}</p>
        <h3><a href="${href}">${esc(name)}</a></h3>
        <p class="work-summary">${esc(pick(project.summary))}</p>
        <ul class="chips">
          ${project.tech.map((tech) => `<li class="chip">${esc(tech)}</li>`).join("")}
        </ul>
        <div class="work-actions">
          <a class="link-arrow" href="${href}">${esc(s.caseStudy)}${icon("arrow-narrow-right", "")}</a>
          ${external}
        </div>
      </div>
    </article>`;
}

/**
 * Career totals. These sit below the hero rather than inside it, because the
 * hero carries the value proposition and one primary action, nothing else.
 */
function statsSection(data) {
  if (!data.stats?.length) return "";
  return `
    <section class="stats-band">
      <dl class="shell stats-grid" data-reveal>
        ${data.stats
          .map(
            (stat) => `
          <div>
            <dt class="mono">${esc(stat.value)}</dt>
            <dd>${esc(pick(stat.label))}</dd>
          </div>`,
          )
          .join("")}
      </dl>
    </section>`;
}

function workSection(data) {
  const s = t();
  return `
    <section class="section shell" id="work">
      <header class="section-head" data-reveal>
        <h2>${esc(s.selectedWork)}</h2>
        <p>${esc(s.selectedWorkSub)}</p>
      </header>
      <div class="work-list">
        ${data.projects.map((p) => workItem(p, data.media, s)).join("")}
      </div>
    </section>`;
}

function skillsSection(data) {
  const s = t();
  return `
    <section class="section shell" id="skills">
      <header class="section-head" data-reveal>
        <h2>${esc(s.skillsTitle)}</h2>
        <p>${esc(s.skillsSub)}</p>
      </header>
      <div class="skills-grid">
        ${data.skills
          .map(
            (group) => `
          <div class="skill-group" data-reveal>
            <h3>${esc(pick(group.label))}</h3>
            <ul>${group.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
          </div>`,
          )
          .join("")}
      </div>
    </section>`;
}

function experienceSection(data) {
  const s = t();
  return `
    <section class="section shell" id="experience">
      <header class="section-head" data-reveal>
        <h2>${esc(s.experienceTitle)}</h2>
      </header>
      <div class="exp-list">
        ${data.experience
          .map(
            (item) => `
          <article class="exp-item" data-reveal>
            <p class="exp-period">${esc(
              getLang() === "ar" && item.periodAr ? item.periodAr : item.period,
            )}</p>
            <div>
              <h3>${esc(pick(item.position))}</h3>
              <p class="exp-company">${esc(pick(item.company))}</p>
              <p>${esc(pick(item.description))}</p>
              <ul class="chips">
                ${item.tech.map((tech) => `<li class="chip">${esc(tech)}</li>`).join("")}
              </ul>
            </div>
          </article>`,
          )
          .join("")}
      </div>
    </section>`;
}

function contactSection(data) {
  const s = t();
  const { profile } = data;

  const channels = [
    profile.whatsapp && [
      "brand-whatsapp",
      `https://wa.me/${profile.whatsapp}`,
      s.whatsapp,
      profile.phone,
      true,
    ],
    profile.email && ["mail", `mailto:${profile.email}`, s.email, profile.email, false],
    profile.phone && [
      "phone",
      `tel:${profile.phone}`,
      s.phone,
      profile.phone,
      false,
    ],
  ]
    .filter(Boolean)
    .map(
      ([ic, href, label, value, ext]) => `
      <li>
        <a class="channel" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>
          ${icon(ic)}
          <span>
            <span class="channel-label">${esc(label)}</span><br>
            <span class="channel-value" dir="ltr">${esc(value)}</span>
          </span>
          ${icon("arrow-up-right", "channel-arrow")}
        </a>
      </li>`,
    )
    .join("");

  return `
    <section class="section shell" id="contact">
      <div class="contact-grid">
        <div data-reveal>
          <h2 class="contact-statement">${esc(s.contactStatement)}</h2>
          <p class="hero-sub">${esc(s.contactSub)}</p>
        </div>
        <ul class="channels" data-reveal>${channels}</ul>
      </div>
    </section>`;
}

function footer(data) {
  const s = t();
  const year = new Date().getFullYear();
  const edu = data.education;
  const eduLine = edu
    ? `<p>${esc(pick(edu.degree))}, ${esc(pick(edu.institution))}, ${esc(
        getLang() === "ar" && edu.periodAr ? edu.periodAr : edu.period,
      )}</p>`
    : "";
  return `
    <footer class="footer">
      <div class="shell footer-inner">
        <p>&copy; ${year} ${esc(pick(data.profile.name))}. ${esc(s.rights)}</p>
        ${eduLine}
      </div>
    </footer>`;
}

/* -------------------------------------------------------------------------
   Chrome outside #app
   ------------------------------------------------------------------------- */

function paintChrome(data) {
  const s = t();
  const set = (sel, value) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = value;
  };
  set("[data-nav-brand]", pick(data.profile.name));
  set("[data-nav-work]", s.navWork);
  set("[data-nav-skills]", s.navSkills);
  set("[data-nav-experience]", s.navExperience);
  set("[data-nav-contact]", s.getInTouch);
  set("[data-skip]", s.skipToContent);

  document.title = `${pick(data.profile.name)} — ${pick(data.profile.role)}`
    .replace("—", "|");
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", pick(data.profile.summary));
}

/* -------------------------------------------------------------------------
   Render
   ------------------------------------------------------------------------- */

function render(data) {
  paintChrome(data);
  app.innerHTML = [
    heroSection(data),
    statsSection(data),
    workSection(data),
    skillsSection(data),
    experienceSection(data),
    contactSection(data),
    footer(data),
  ].join("");
  observeReveals(app);
}

async function start() {
  app.setAttribute("aria-busy", "true");
  try {
    const data = await loadData();
    render(data);
    document.addEventListener("langchange", () => render(data));
  } catch (err) {
    console.error(err);
    renderError(app, start);
  } finally {
    app.removeAttribute("aria-busy");
  }
}

await boot();
await start();
