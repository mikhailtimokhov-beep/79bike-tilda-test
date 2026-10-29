// Нативная сборка falcon-bike.ru для Тильды (как scripts/build-native.mjs для 79bike.ru).
// Прототип (src/falcon, артефакт AyD6SKmq1hL2juyCRy7Tk1) строит страницу скриптом app.js из data/*.js. Здесь страница
// заранее отрисовывается в браузере (Playwright) — готовый HTML кладётся в блоки T123, текст видят поисковики.
// При загрузке app.js перерисовывает тот же контейнер #b79-root (B79_INSERT в overrides/native-runtime-falcon.js) — дублей нет.
// Запуск: node scripts/build-falcon.mjs   (ASSETS=local — картинки из src/falcon для локальной проверки)
// Результат: dist-native/falcon/<страница>/NN.html, preview.html, settings.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import vm from "node:vm";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src", "falcon");
const OUT = join(ROOT, "dist-native", "falcon");
const ORIGIN = "https://falcon-bike.ru";
mkdirSync(OUT, { recursive: true });

// файл прототипа → адрес на сайте (адреса живого сайта сохраняются; новые — по data/seo.js)
const ROUTES = {
  "index.html": "/", "pro.html": "/falcon-pro", "gt.html": "/falcongt", "lite.html": "/falcon_lite", "lynx-trail.html": "/lynx",
  "lynx-x.html": "/lynx-x", "surge-v.html": "/surge-v", "podbor.html": "/podbor", "compare.html": "/compare", "video.html": "/video",
  "delivery.html": "/delivery", "credit.html": "/rassrochka", "warranty.html": "/warranty", "parts.html": "/accessories", "faq.html": "/faq",
  "testdrive.html": "/test-drive", "contacts.html": "/contacts", "events.html": "/events", "blog.html": "/blog", "post.html": "/blog",
  "bloggers.html": "/bloggers", "instructions.html": "/instructions", "manual-gt.html": "/manual-gt", "manual-pro.html": "/manual-pro",
  "manual-light.html": "/manual-light", "manual-lynx-trail.html": "/manual-lynx-trail", "manual-surge-v.html": "/manual-surge-v",
  "privacy.html": "/privacy", "consent.html": "/consent",
};
const ONLY = process.env.PAGES ? process.env.PAGES.split(",") : null;

const MAPF = join(ROOT, "overrides", "falcon-asset-map.json");
let AMAP = existsSync(MAPF) ? JSON.parse(readFileSync(MAPF, "utf8")).map : {};
const LOCAL = process.env.ASSETS === "local";
const missing = new Set();
function asset(ref) {
  if (!ref || /^(https?:|data:|mailto:|tel:|#|javascript:|\/\/|\/)/i.test(ref)) return null;
  const k = normalize(ref.split("#")[0].split("?")[0]).replace(/^\.\//, "");
  if (!/\.(webp|jpe?g|png|svg|gif|avif|mp4)$/i.test(k)) return null;
  if (LOCAL) return "/src/falcon/" + k;
  if (AMAP[k]) return AMAP[k];
  missing.add(k); return null;
}
function pageLink(ref) {
  const m = /^(?:\.\/)?([a-z0-9-]+\.html)(\?[^#]*)?(#.*)?$/.exec(ref);
  if (!m || ROUTES[m[1]] === undefined) return null;
  const q = new URLSearchParams((m[2] || "").slice(1)); const s = q.get("s"); q.delete("s"); q.delete("v");
  const path = m[1] === "post.html" && s ? "/blog/" + s : ROUTES[m[1]]; const rest = q.toString();
  return path + (rest ? "?" + rest : "") + (m[3] || "");
}
function css(text) {
  text = text.replace(/src:url\(([^)]+\.woff2)\) format\("woff2-variations"\),url\(\1\) format\("woff2"\)/g, 'src:url($1) format("woff2")');
  text = text.replace(/@font-face\{[^}]*cyrillic-ext[^}]*\}/g, "");
  return text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (all, q, ref) => {
    if (/^(data:|https?:|#)/.test(ref)) return all;
    const k = normalize(ref.split("?")[0]).replace(/^\.\//, "").replace(/^\.\.\//, "");
    if (/\.woff2$/.test(k)) {
      const sub = join(ROOT, "overrides", "fonts-falcon", k.split("/").pop().replace("-wght-normal.woff2", "-sub.woff2"));
      if (existsSync(sub)) return `url(data:font/woff2;base64,${readFileSync(sub).toString("base64")})`;
      const f = existsSync(join(SRC, k)) ? join(SRC, k) : existsSync(join(SRC, "assets", k)) ? join(SRC, "assets", k) : null;
      if (f) return `url(data:font/woff2;base64,${readFileSync(f).toString("base64")})`;
      missing.add(k); return all;
    }
    const a = asset(k.startsWith("assets/") ? k : "assets/" + k);
    return a ? `url("${a}")` : all;
  });
}
function markup(html) {
  html = html.replace(/\s(src|poster|data-src|href|data-href)="([^"]*)"/g, (all, attr, v) => {
    const pl = /href/.test(attr) ? pageLink(v) : null; if (pl) return ` ${attr}="${pl}"`;
    const a = asset(v); return a ? ` ${attr}="${a}"` : all;
  });
  html = html.replace(/\s(srcset|data-srcset)="([^"]*)"/g, (all, attr, v) => ` ${attr}="${v.split(",").map((p) => { const [u, ...d] = p.trim().split(/\s+/); return [asset(u) || u, ...d].join(" "); }).join(", ")}"`);
  html = html.replace(/url\((&quot;|['"]?)([^'")&]+)\1\)/g, (all, q, ref) => { const a = asset(ref); return a ? `url(${q}${a}${q})` : all; });
  return html;
}

// готовые (пререндер) элементы верхнего уровня помечаем data-b79-pre: при загрузке app.js их убирает и вставляет свежие
const { topLevel } = await import("./split-native.mjs");
function markPre(html) {
  return topLevel(html).map((u) => /^<[a-zA-Z]/.test(u) ? u.replace(/^<([a-zA-Z][\w-]*)/, '<$1 data-b79-pre') : (u.trim() ? `<span data-b79-pre>${u}</span>` : "")).join("\n");
}

// данные SEO: на странице нужен только её ключ (data/seo.js ~105 КБ на все страницы)
function seoFor(key) {
  const w = {}; vm.runInNewContext(readFileSync(join(SRC, "data/seo.js"), "utf8"), { window: w });
  const pick = (o) => (o && o[key] !== undefined ? { [key]: o[key] } : {});
  return `window.SEO=${JSON.stringify(pick(w.SEO))};window.SEO_LD=${JSON.stringify(pick(w.SEO_LD))};window.SEO_DEFAULTS=${JSON.stringify(w.SEO_DEFAULTS || {})};window.SEO_ALT=${JSON.stringify(w.SEO_ALT || {})};`;
}

function parse(file) {
  let html = readFileSync(join(SRC, file), "utf8");
  const last = html.lastIndexOf("<!doctype html>"); if (last > 0) html = html.slice(last); // у index.html обёртка артефакта
  const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"));
  const bo = /<body([^>]*)>/.exec(html);
  const body = html.slice(bo.index + bo[0].length, html.lastIndexOf("</body>"));
  const attrs = {}; bo[1].replace(/(data-[a-z-]+)="([^"]*)"/g, (a, n, v) => { attrs[n] = v; });
  return { head, body, attrs };
}

function assemble(file, pre, seoKey) {
  const { head, body, attrs } = parse(file);
  const styles = [];
  const re = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>|<style[^>]*>([\s\S]*?)<\/style>/g; let m;
  while ((m = re.exec(head))) {
    if (m[1]) { const k = m[1].split("?")[0]; if (/cookie-banner/.test(k) || /^https?:/.test(k)) continue; styles.push(`<style data-src="${k}">${css(readFileSync(join(SRC, k), "utf8"))}</style>`); }
    else styles.push(`<style>${css(m[2])}</style>`);
  }
  const scripts = [];
  const sre = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  while ((m = sre.exec(body))) {
    const src = (/src="([^"]+)"/.exec(m[1]) || [])[1];
    if (!src) { scripts.push(`<script>${m[2]}</script>`); continue; }
    const k = src.split("?")[0];
    if (/cookie-banner/.test(k)) continue; // баннер cookie и Метрика — в HEAD проекта (как на 79bike.ru)
    let js = readFileSync(join(SRC, k), "utf8");
    if (k === "data/seo.js") js = seoFor(seoKey);
    if (k === "assets/app.js") {
      const ins = 'document.body.insertAdjacentHTML("afterbegin", header()';
      if (!js.includes(ins)) throw new Error("app.js: не нашёл вставку разметки");
      js = js.replace(ins, '(window.B79_INSERT || function (h) { document.body.insertAdjacentHTML("afterbegin", h); })(header()');
      js = js.split('new URLSearchParams(location.search), s = qs.get("s")').join('new URLSearchParams(location.search), s = window.B79_BLOG_SLUG || qs.get("s")');
    }
    scripts.push(`<script data-src="${k}">${js.replace(/<\/script/gi, "<\\/script")}</script>`);
  }
  const rt = readFileSync(join(ROOT, "overrides", "native-runtime-falcon.js"), "utf8")
    .replace("/*M*/{}", JSON.stringify(LOCAL ? {} : AMAP)).replace("/*R*/{}", JSON.stringify(ROUTES)).replace("/*P*/{}", JSON.stringify(attrs));
  const leadSink = existsSync(join(ROOT, "overrides", "lead-sink.js")) ? `<script data-src="lead-sink">${readFileSync(join(ROOT, "overrides", "lead-sink.js"), "utf8")}</script>\n` : "";
  return `<!-- Falcon Bike · ${file} · нативная сборка для T123. Не редактировать вручную: правки — в репозитории 79bike-tilda-test. -->\n` +
    `<script data-src="native-runtime">${rt}</script>\n` + leadSink + styles.join("\n") + "\n" +
    `<div id="b79-root" hidden></div>\n` + markPre(markup(pre)) + "\n" + scripts.join("\n");
}

// --- пререндер прототипа ---
const { createServer } = await import("node:http");
const { chromium } = await import("playwright");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".mp4": "video/mp4" };
const srv = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]); const f = join(SRC, u === "/" ? "index.html" : u);
  if (!existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f));
}).listen(8805);
const browser = await chromium.launch();
const errors = {};
async function prerender(url, name) {
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (x) => x.abort());
  await pg.goto("http://127.0.0.1:8805/" + url, { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const got = await pg.evaluate(() => {
    const c = document.body.cloneNode(true);
    c.querySelectorAll("script, #cookie-banner").forEach((s) => s.remove());
    const canon = document.querySelector('link[rel="canonical"]');
    const md = document.querySelector('meta[name="description"]');
    return { html: c.innerHTML, title: document.title, description: md ? md.content : "", canonical: canon ? canon.href : "", h1: (document.querySelector("h1") || {}).textContent || "" };
  });
  await pg.close();
  if (errs.length) errors[name] = errs;
  return got;
}

const BLOG = (() => { const w = {}; vm.runInNewContext(readFileSync(join(SRC, "data/blog.js"), "utf8"), { window: w }); return w.BLOG || w.FB_BLOG || w.REP_BLOG || Object.values(w)[0]; })();
const settings = {};
const jobs = [];
for (const file of Object.keys(ROUTES)) {
  if (file === "post.html") continue;
  jobs.push({ name: file.replace(/\.html$/, ""), file, url: file });
}
for (const p of (BLOG && BLOG.posts) || []) jobs.push({ name: "blog--" + p.slug, file: "post.html", url: "post.html?s=" + p.slug, path: "/blog/" + p.slug });

const { toParts, LIMIT } = await import("./split-native.mjs");
for (const j of jobs) {
  if (ONLY && !ONLY.includes(j.name)) continue;
  const { attrs } = parse(j.file);
  const seoKey = attrs["data-page"] === "model" ? "model:" + attrs["data-slug"] : j.file === "index.html" ? "home" : (attrs["data-page"] || "home");
  const pre = await prerender(j.url, j.name);
  const frag = assemble(j.file, pre.html, seoKey);
  const path = j.path || ROUTES[j.file];
  settings[j.name] = { path, title: pre.title, description: pre.description, canonical: ORIGIN + (path === "/" ? "/" : path), h1: pre.h1.trim().slice(0, 120), bytes: Buffer.byteLength(frag) };
  const parts = await toParts(frag);
  const dir = join(OUT, j.name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  writeFileSync(join(OUT, j.name + ".html"), frag);
  parts.forEach((p, i) => writeFileSync(join(dir, `${String(i + 1).padStart(2, "0")}.html`), p));
  writeFileSync(join(dir, "preview.html"), `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Предпросмотр · ${j.name}</title><style>body{margin:0}</style></head><body class="t-body"><div id="allrecords" class="t-records">` +
    parts.map((p, i) => `<div id="rec${i + 1}" class="r t-rec" data-record-type="131"><div class="t123"><div class="t-container_100 "><div class="t-width t-width_100 ">${p}</div></div></div></div>`).join("\n") + `</div></body></html>`);
  settings[j.name].parts = parts.length; settings[j.name].partSizes = parts.map((p) => p.length);
  if (parts.some((p) => p.length > LIMIT + 200)) { console.error("Блок больше предела: " + j.name); process.exit(1); }
  console.log(`${j.name.padEnd(36)} ${(settings[j.name].bytes / 1024).toFixed(0).padStart(5)} КБ → блоков: ${parts.length}  ${path}${errors[j.name] ? "  ОШИБКИ JS: " + errors[j.name].length : ""}`);
}
await browser.close(); srv.close();
writeFileSync(join(OUT, "settings.json"), JSON.stringify(settings, null, 2));
if (Object.keys(errors).length) console.log("\nОшибки JS при пререндере:", JSON.stringify(errors).slice(0, 800));
if (missing.size) console.log(`\nНет на сервере Тильды (${missing.size}): ` + [...missing].slice(0, 10).join(", ") + (missing.size > 10 ? " …" : ""));
