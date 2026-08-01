/**
 * Shared behaviour for every page: theme, language, icon sprite, scroll reveal.
 *
 * Scroll work is done with IntersectionObserver only. There is no scroll
 * event listener anywhere in this codebase.
 */

/* -------------------------------------------------------------------------
   UI strings. Page content lives in content/portfolio.json; these are the
   chrome labels around it.
   ------------------------------------------------------------------------- */

export const UI = {
  en: {
    skipToContent: "Skip to content",
    navWork: "Work",
    navSkills: "Skills",
    navExperience: "Experience",
    getInTouch: "Get in touch",
    viewWork: "View work",
    downloadCv: "Download CV",
    selectedWork: "Selected work",
    selectedWorkSub:
      "Four products taken from first commit to store listing or live domain.",
    skillsTitle: "Skills",
    skillsSub: "The stack I reach for, grouped by where it sits in a product.",
    experienceTitle: "Experience",
    contactStatement: "Have something you want built?",
    contactSub:
      "The fastest reply is on WhatsApp. Email works just as well for longer briefs.",
    caseStudy: "Case study",
    playStore: "Play Store",
    visitSite: "Visit site",
    backToWork: "Back to work",
    overview: "Overview",
    whatItTook: "What it took",
    builtWith: "Built with",
    screens: "Screens",
    nextProject: "Next project",
    metaType: "Type",
    metaYear: "Year",
    metaRole: "Role",
    metaStack: "Stack",
    email: "Email",
    whatsapp: "WhatsApp",
    phone: "Phone",
    github: "GitHub",
    linkedin: "LinkedIn",
    close: "Close",
    previous: "Previous",
    next: "Next",
    loading: "Loading",
    errorTitle: "Could not load the content",
    errorBody:
      "The project data did not load. Check your connection and try again.",
    retry: "Retry",
    notFoundTitle: "Project not found",
    notFoundBody: "There is no project at this address.",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    switchLang: "التبديل إلى العربية",
    rights: "All rights reserved.",
    imageOf: (i, n) => `Image ${i} of ${n}`,
    screenshotAlt: (name, i) => `${name} screenshot ${i}`,
  },
  ar: {
    skipToContent: "تخطَّ إلى المحتوى",
    navWork: "الأعمال",
    navSkills: "المهارات",
    navExperience: "الخبرة",
    getInTouch: "تواصل معي",
    viewWork: "عرض الأعمال",
    downloadCv: "تحميل السيرة الذاتية",
    selectedWork: "أعمال مختارة",
    selectedWorkSub:
      "أربعة منتجات أخذتها من أول commit حتى النشر على المتجر أو النطاق المباشر.",
    skillsTitle: "المهارات",
    skillsSub: "الأدوات التي أعتمد عليها، مرتّبة حسب موقعها في المنتج.",
    experienceTitle: "الخبرة",
    contactStatement: "لديك شيء تريد بناءه؟",
    contactSub: "أسرع رد يكون عبر واتساب. والبريد مناسب للطلبات الأطول.",
    caseStudy: "تفاصيل المشروع",
    playStore: "متجر Play",
    visitSite: "زيارة الموقع",
    backToWork: "العودة للأعمال",
    overview: "نظرة عامة",
    whatItTook: "ما تطلّبه العمل",
    builtWith: "بُني بـ",
    screens: "لقطات الشاشة",
    nextProject: "المشروع التالي",
    metaType: "النوع",
    metaYear: "السنة",
    metaRole: "الدور",
    metaStack: "التقنيات",
    email: "البريد",
    whatsapp: "واتساب",
    phone: "الهاتف",
    github: "GitHub",
    linkedin: "LinkedIn",
    close: "إغلاق",
    previous: "السابق",
    next: "التالي",
    loading: "جارٍ التحميل",
    errorTitle: "تعذّر تحميل المحتوى",
    errorBody: "لم تُحمَّل بيانات المشاريع. تحقّق من اتصالك ثم أعد المحاولة.",
    retry: "إعادة المحاولة",
    notFoundTitle: "المشروع غير موجود",
    notFoundBody: "لا يوجد مشروع على هذا العنوان.",
    themeToLight: "التبديل إلى الوضع الفاتح",
    themeToDark: "التبديل إلى الوضع الداكن",
    switchLang: "Switch to English",
    rights: "جميع الحقوق محفوظة.",
    imageOf: (i, n) => `صورة ${i} من ${n}`,
    screenshotAlt: (name, i) => `لقطة شاشة ${i} من ${name}`,
  },
};

const LANG_KEY = "tn.lang";
const THEME_KEY = "tn.theme";

/* -------------------------------------------------------------------------
   Language
   ------------------------------------------------------------------------- */

export function getLang() {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "en" || stored === "ar") return stored;
  return navigator.language?.startsWith("ar") ? "ar" : "en";
}

export function t() {
  return UI[getLang()];
}

/** Picks the active language out of a `{ en, ar }` pair, falling back to English. */
export function pick(pair) {
  if (pair == null) return "";
  if (typeof pair === "string") return pair;
  const lang = getLang();
  return pair[lang] || pair.en || pair.ar || "";
}

function applyLang(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLang(lang);
  document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

/* -------------------------------------------------------------------------
   Theme. Page-level lock: one theme for the whole document, never per section.
   ------------------------------------------------------------------------- */

export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0c0c0b" : "#fafaf9";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

/* -------------------------------------------------------------------------
   Data
   ------------------------------------------------------------------------- */

let dataPromise = null;

export function loadData() {
  if (!dataPromise) {
    dataPromise = Promise.all([
      fetch("content/portfolio.json").then(failFast),
      fetch("assets/media/manifest.json").then(failFast),
    ])
      .then(([portfolio, media]) => ({ ...portfolio, media }))
      .catch((err) => {
        dataPromise = null; // let Retry actually retry
        throw err;
      });
  }
  return dataPromise;
}

function failFast(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.url}`);
  return res.json();
}

/* -------------------------------------------------------------------------
   Markup helpers
   ------------------------------------------------------------------------- */

export function icon(name, extraClass = "") {
  return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

export function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

/** Renders the error state into a container, wiring the retry button. */
export function renderError(container, onRetry) {
  const s = t();
  container.innerHTML = `
    <div class="state">
      <h2>${esc(s.errorTitle)}</h2>
      <p>${esc(s.errorBody)}</p>
      <button class="btn btn-ghost" type="button" data-retry>${esc(s.retry)}</button>
    </div>`;
  container.querySelector("[data-retry]")?.addEventListener("click", onRetry);
}

/* -------------------------------------------------------------------------
   Scroll reveal. Purpose: sequence a long single-column page so the eye lands
   on one block at a time rather than the whole page at once.
   ------------------------------------------------------------------------- */

let revealObserver = null;

export function observeReveals(root = document) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.querySelectorAll("[data-reveal]").forEach((el) =>
      el.classList.add("is-visible"),
    );
    return;
  }
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  root
    .querySelectorAll("[data-reveal]:not(.is-visible)")
    .forEach((el) => revealObserver.observe(el));
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

async function injectSprite() {
  try {
    const res = await fetch("assets/icons/sprite.svg");
    if (!res.ok) return;
    const wrap = document.createElement("div");
    wrap.hidden = true;
    wrap.innerHTML = await res.text();
    document.body.prepend(wrap);
  } catch {
    /* Icons are decorative; every control also carries a text label. */
  }
}

function wireToggles() {
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const langBtn = document.querySelector("[data-lang-toggle]");

  const sync = () => {
    const s = t();
    const dark = getTheme() === "dark";
    if (themeBtn) {
      themeBtn.innerHTML = icon(dark ? "sun" : "moon");
      themeBtn.setAttribute(
        "aria-label",
        dark ? s.themeToLight : s.themeToDark,
      );
    }
    if (langBtn) {
      langBtn.textContent = getLang() === "ar" ? "EN" : "ع";
      langBtn.setAttribute("aria-label", s.switchLang);
    }
  };

  themeBtn?.addEventListener("click", () =>
    setTheme(getTheme() === "dark" ? "light" : "dark"),
  );
  langBtn?.addEventListener("click", () =>
    setLang(getLang() === "ar" ? "en" : "ar"),
  );

  document.addEventListener("themechange", sync);
  document.addEventListener("langchange", sync);
  sync();
}

/** Disclosure menu holding the section links below the desktop breakpoint. */
function wireMenu() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector(".nav-links");
  if (!nav || !toggle || !panel) return;

  const setOpen = (open) => {
    nav.dataset.menu = open ? "open" : "closed";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = icon(open ? "x" : "menu-2");
  };

  setOpen(false);
  toggle.addEventListener("click", () =>
    setOpen(nav.dataset.menu !== "open"),
  );
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.dataset.menu === "open") {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (nav.dataset.menu === "open" && !nav.contains(e.target)) setOpen(false);
  });
  // Leaving the mobile breakpoint must not strand the panel open.
  matchMedia("(min-width: 48rem)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
}

/** Border under the nav appears only once the page has scrolled past the top. */
function wireNavSentinel() {
  const nav = document.querySelector(".nav");
  const sentinel = document.querySelector("[data-nav-sentinel]");
  if (!nav || !sentinel) return;
  new IntersectionObserver(
    ([entry]) => {
      nav.dataset.stuck = String(!entry.isIntersecting);
    },
    { threshold: 1 },
  ).observe(sentinel);
}

/**
 * Runs before any page module renders. Language and theme are applied
 * synchronously in the document head to avoid a flash of the wrong theme; this
 * only handles the parts that need the DOM.
 */
export async function boot() {
  document.documentElement.classList.remove("no-js");
  applyLang(getLang());
  applyTheme(getTheme());
  await injectSprite();
  wireToggles();
  wireMenu();
  wireNavSentinel();
}
