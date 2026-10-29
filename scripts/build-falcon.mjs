// Нативная сборка falcon-bike.ru для Тильды (как scripts/build-native.mjs для 79bike.ru).
// Прототип (src/falcon, артефакт AyD6SKmq1hL2juyCRy7Tk1) строит страницу скриптом app.js из data/*.js. Здесь страница
// заранее отрисовывается в браузере (Playwright) — готовый HTML кладётся в блоки T123, текст видят поисковики.
// При загрузке app.js перерисовывает тот же контейнер #b79-root (B79_INSERT в overrides/native-runtime-falcon.js) — дублей нет.
// Запуск: node scripts/build-falcon.mjs   (ASSETS=local — картинки из src/falcon для локальной проверки)
// Результат: dist-native/falcon/<страница>/NN.html, preview.html, settings.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import vm from "node:vm";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src", "falcon");
const OUT = join(ROOT, "dist-native", "falcon");
const ORIGIN = "https://falcon-bike.ru";
// страница успеха /spasibo и её скрипт — не из прототипа (добавлены при переносе 29.10): кладём в исходники перед сборкой
copyFileSync(join(ROOT, "overrides", "falcon-spasibo.html"), join(SRC, "spasibo.html"));
copyFileSync(join(ROOT, "overrides", "thanks.js"), join(SRC, "assets", "b79-thanks.js"));
// каталоги магазина Тильды (/accessories и разделы) — оболочка нового дизайна (overrides/falcon-tstore.*)
const TSTORE = JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-tstore.json"), "utf8"));
{ const tpl = readFileSync(join(ROOT, "overrides", "falcon-tstore.html"), "utf8");
  for (const p of TSTORE.pages) { const nm = p.key ? (TSTORE.cats.find((c) => c[0] === p.key) || [])[1] : ""; writeFileSync(join(SRC, "tstore-" + (p.key || "accessories") + ".html"), tpl.replace("{{KEY}}", p.key).replace("</head>", `<script>window.B79_TSTORE=${JSON.stringify({ cats: TSTORE.cats })};</script>\n</head>`).replace("{{TITLE}}", nm ? "Запчасти: " + nm.toLowerCase() + " — Falcon, Lynx | Falcon Bike" : "Запчасти и аксессуары для Falcon и Lynx | Falcon Bike")); } }
mkdirSync(OUT, { recursive: true });

// файл прототипа → адрес на сайте (адреса живого сайта сохраняются; новые — по data/seo.js)
const ROUTES = {
  "index.html": "/", "pro.html": "/falcon-pro", "gt.html": "/falcongt", "lite.html": "/falcon_lite", "lynx-trail.html": "/lynx",
  "lynx-x.html": "/lynx-x", "surge-v.html": "/surge-v", "podbor.html": "/podbor", "compare.html": "/compare", "video.html": "/video",
  "delivery.html": "/delivery", "credit.html": "/rassrochka", "warranty.html": "/warranty", "parts.html": "/accessories", "faq.html": "/faq",
  "testdrive.html": "/test-drive", "contacts.html": "/contacts", "events.html": "/events", "blog.html": "/blog", "post.html": "/blog",
  "bloggers.html": "/bloggers", "instructions.html": "/instructions", "manual-gt.html": "/manual-gt", "manual-pro.html": "/manual-pro",
  "manual-light.html": "/manual-light", "manual-lynx-trail.html": "/manual-lynx-trail", "manual-surge-v.html": "/manual-surge-v",
  "privacy.html": "/privacy", "consent.html": "/consent", "spasibo.html": "/spasibo", ...Object.fromEntries(JSON.parse(readFileSync(new URL("../overrides/falcon-tstore.json", import.meta.url), "utf8")).pages.map((p) => ["tstore-" + (p.key || "accessories") + ".html", p.path])),
};
// общие скрипты — один раз в подвале проекта Тильды (страница Footer), а не на каждой странице: так страница занимает
// ~7 блоков вместо ~21. Подвал отдаёт сама Тильда, внешних источников нет. SHARED=0 — всё встраивать в страницу.
const SHARED = process.env.SHARED === "0" ? [] : ["data/models.js", "data/photos.js", "data/gallery.js", "data/content.js", "data/videos.js", "data/sidebox.js", "assets/app.js", "assets/range-q.js"];
const KIN = JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-kinescope.json"), "utf8")); // ролики Falcon в Kinescope
function patchApp(js) {
  const ins = 'document.body.insertAdjacentHTML("afterbegin", header()';
  if (!js.includes(ins)) throw new Error("app.js: не нашёл вставку разметки");
  js = js.replace(ins, '(window.B79_INSERT || function (h) { document.body.insertAdjacentHTML("afterbegin", h); })(header()');
  js = js.split('new URLSearchParams(location.search), s = qs.get("s")').join('new URLSearchParams(location.search), s = window.B79_BLOG_SLUG || qs.get("s")');
  // формы прототипа только показывают «Спасибо» — на сайте заявка уходит через скрытую форму Тильды (lead-bridge → lead-sink)
  const okLine = 'if (bad) { out.className = "form__ok is-err"; out.textContent = msg; bad.focus(); return; }';
  if (!js.includes(okLine)) throw new Error("app.js: не нашёл проверку формы");
  // «Спасибо» прототипа показывается сразу; на сайте — «Отправляем…», и только после подтверждения Тильды — страница успеха /spasibo
  // (overrides/thanks.js). При сбое — сообщение с телефоном. Подсказка про «Я не робот» — через 8 с.
  js = js.replace(okLine, okLine + ' if (window.B79_LEAD) setTimeout(function () { var sb = f.querySelector(\'button[type="submit"]\'), okHtml = out.innerHTML; if (sb) { sb.disabled = true; sb.setAttribute("aria-busy", "true"); } out.className = "form__ok is-wait"; out.textContent = "Отправляем заявку…"; var hint = setTimeout(function () { if (/Отправляем/.test(out.textContent)) out.textContent = "Отправляем заявку… Если появилось окно «Я не робот» — подтвердите его, и заявка уйдёт."; }, 8000); window.B79_LEAD(f, function (ok) { clearTimeout(hint); if (sb) sb.removeAttribute("aria-busy"); if (ok) { var u = window.B79_THANKS && window.B79_THANKS(f, "falcon"); if (u) { location.href = u; return; } out.className = "form__ok"; out.innerHTML = okHtml; return; } out.className = "form__ok is-err"; out.innerHTML = "Заявка не отправилась. Позвоните нам: <a href=\\"tel:+79999005588\\">+7 (999) 900-55-88</a> или напишите в <a href=\\"https://wa.me/79999005588\\" target=\\"_blank\\" rel=\\"noopener\\">WhatsApp</a>."; if (sb) sb.disabled = false; }); }, 0);');
  // точечные правки прототипа (overrides/falcon-app-patches.json)
  for (const [from, to, why] of JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-app-patches.json"), "utf8")).patches) {
    if (!js.includes(from)) throw new Error("app.js: не найдено место правки — " + why);
    js = js.replace(from, to.replace(/\{\{(\w+)\}\}/g, (a, k) => { if (!KIN[k]) throw new Error("нет ролика Kinescope: " + k); return KIN[k]; }));
  }
  // страница успеха: разметку даёт overrides/thanks.js
  const pFaq = "  P.faq = function () {";
  if (!js.includes(pFaq)) throw new Error("app.js: не нашёл P.faq");
  js = js.replace(pFaq, '  P.thanks = function () { return window.B79_THANKS_RENDER ? window.B79_THANKS_RENDER("falcon") : ""; };\n' + pFaq);
  return js;
}
// на новых страницах Falcon шапка и подвал Тильды включены: в шапке корзина (t706) и скрипты корзины, доставки и оплаты.
// Видимые части старой шапки и подвала (меню, виджеты, старый подвал) прячем только на новых страницах.
const HIDE_OLD = '<style data-b79="hide-old">body.fb-native #t-header .t-rec[data-record-type="327"],body.fb-native #t-header .t-rec[data-record-type="456"],body.fb-native #t-header .t-rec[data-record-type="890"],body.fb-native #t-header .t-rec[data-record-type="898"],body.fb-native #t-footer .t-rec[data-record-type="396"],body.fb-native #t-footer .t-rec[data-record-type="945"]{display:none!important}</style>';
const HEADCODE = '<script>document.documentElement.classList.add("fb-native")</script><style>html.fb-native #t-header .t-rec[data-record-type="327"],html.fb-native #t-header .t-rec[data-record-type="456"],html.fb-native #t-header .t-rec[data-record-type="890"],html.fb-native #t-header .t-rec[data-record-type="898"],html.fb-native #t-footer .t-rec[data-record-type="396"],html.fb-native #t-footer .t-rec[data-record-type="945"]{display:none!important}</style>';
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

// стили прототипа — в шапке проекта (страница Header), только для новых страниц: каждое правило ограничено .fb-native
// (html.fb-native / body.fb-native ставит скрипт по адресу страницы до отрисовки) — старые страницы не затрагиваются.
async function scopeCss(text) {
  const { syntax: t } = (await import("csso")).default || (await import("csso"));
  const ast = t.parse(text);
  t.walk(ast, { visit: "Rule", enter(rule) {
    if (this.atrule && /keyframes/i.test(this.atrule.name)) return;
    t.walk(rule.prelude, { visit: "Selector", enter(sel) {
      const L = sel.children, f = L.first;
      if (!f) return;
      if (f.type === "TypeSelector" && /^html$/i.test(f.name)) { L.insertData({ type: "ClassSelector", name: "fb-native" }, L.head.next); return; }
      if (f.type === "PseudoClassSelector" && f.name === "root") { L.shift(); L.prependData({ type: "ClassSelector", name: "fb-native" }); L.prependData({ type: "TypeSelector", name: "html" }); return; }
      L.prependData({ type: "Combinator", name: " " }); L.prependData({ type: "ClassSelector", name: "fb-native" });
    } });
  } });
  return t.generate(ast);
}

// Михаил 29.10: в заголовках вкладок falcon-bike.ru окончание «| Falcon Bike» вместо «| 79BIKE» (меняется только окончание title)
const FIX_TITLE = (t) => t.replace(/ \| 79BIKE(?=["'<`]|$)/gm, " | Falcon Bike");
// данные SEO: на странице нужен только её ключ (data/seo.js ~105 КБ на все страницы)
function seoFor(key) {
  const w = {}; vm.runInNewContext(readFileSync(join(SRC, "data/seo.js"), "utf8"), { window: w });
  for (const v of Object.values(w.SEO || {})) if (v && typeof v.title === "string") v.title = FIX_TITLE(v.title);
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
    if (m[1]) { const k = m[1].split("?")[0]; if (/cookie-banner/.test(k) || /^https?:/.test(k)) continue; if (SHARED.length && /^assets\/(site|fonts)\.css$/.test(k)) continue; styles.push(`<style data-src="${k}">${css(readFileSync(join(SRC, k), "utf8"))}</style>`); }
    else styles.push(`<style>${css(m[2])}</style>`);
  }
  const scripts = [];
  const sre = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  while ((m = sre.exec(body))) {
    const src = (/src="([^"]+)"/.exec(m[1]) || [])[1];
    if (!src) { scripts.push(`<script>${m[2]}</script>`); continue; }
    const k = src.split("?")[0];
    if (/cookie-banner/.test(k)) continue; // баннер cookie и Метрика — в HEAD проекта (как на 79bike.ru)
    if (SHARED.includes(k)) continue; // в подвале проекта
    let js = readFileSync(join(SRC, k), "utf8");
    if (k === "data/seo.js") js = seoFor(seoKey);
    if (k === "assets/app.js") js = patchApp(js);
    scripts.push(`<script data-src="${k}">${js.replace(/<\/script/gi, "<\\/script")}</script>`);
  }
  const rt = readFileSync(join(ROOT, "overrides", "native-runtime-falcon.js"), "utf8")
    .replace("/*M*/{}", "{}").replace("/*R*/{}", JSON.stringify(ROUTES)).replace("/*P*/{}", JSON.stringify(attrs));
  const leadSink = ""; // приёмник заявок — в общем подвале
  // /rassrochka: ссылки Т-Банка по срокам (данные страницы; читает правка bank() в app.js)
  if (attrs["data-page"] === "tstore") scripts.unshift(`<script data-src="tstore">window.B79_TSTORE=${JSON.stringify({ cats: TSTORE.cats })};</script>`);
  // страница модели: какой товар магазина Тильды соответствует цвету (overrides/falcon-store-map.json)
  if (attrs["data-page"] === "model") { const SM = JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-store-map.json"), "utf8")); if (SM[attrs["data-slug"]]) scripts.unshift(`<script data-src="store-map">window.B79_STORE_MAP=${JSON.stringify({ [attrs["data-slug"]]: SM[attrs["data-slug"]] })};</script>`); }
  if (file === "credit.html") scripts.unshift(`<script data-src="tbank-links">window.B79_TBANK=${JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-tbank-links.json"), "utf8"))).filter(([k]) => k[0] !== "_")))};</script>`);
  return `<!-- Falcon Bike · ${file} · нативная сборка для T123. Не редактировать вручную: правки — в репозитории 79bike-tilda-test. -->\n` +
    `<script data-src="native-runtime">${rt}</script>\n` + HIDE_OLD + "\n" + leadSink + styles.join("\n") + "\n" +
    `<div id="b79-root" hidden></div>\n` + markPre(markup(pre)) + "\n" + scripts.join("\n");
}

// --- пререндер прототипа ---
const { createServer } = await import("node:http");
const { chromium } = await import("playwright");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".mp4": "video/mp4" };
const srv = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]); const f = join(SRC, u === "/" ? "index.html" : u);
  if (!existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream" });
  if (/assets[/\\]app\.js$/.test(f)) return r.end(patchApp(readFileSync(f, "utf8"))); // пререндер — с теми же правками, что на сайте (ролики Kinescope и т. д.)
  if (/\.(html|js)$/.test(f) && !/assets[/\\]app\.js$/.test(f)) return r.end(FIX_TITLE(readFileSync(f, "utf8")).replace(/<title>([^<]*)<\/title>/, (a, t) => "<title>" + FIX_TITLE(t) + "</title>"));
  r.end(readFileSync(f));
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
  settings[j.name] = { path, headCode: HEADCODE, title: pre.title, description: pre.description, canonical: ORIGIN + (path === "/" ? "/" : path), h1: pre.h1.trim().slice(0, 120), bytes: Buffer.byteLength(frag) };
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
if (SHARED.length && (!ONLY || ONLY.includes("_shared"))) {
  const mapJs = `<script data-src="falcon-asset-map">window.B79_FB_MAP=${JSON.stringify(LOCAL ? Object.fromEntries(Object.keys(JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-asset-names.json"), "utf8")).names).map((k) => [k, "/src/falcon/" + k])) : AMAP)};</script>\n`;
  const body = mapJs + SHARED.map((k) => { let js = readFileSync(join(SRC, k), "utf8"); if (k === "assets/app.js") js = patchApp(js);
    const code = /^data\//.test(k) ? js : `if (window.B79_NATIVE) {\n${js}\n}`;
    return `<script data-src="${k}">${code.replace(/<\/script/gi, "<\\/script")}</script>`; }).join("\n") +
    ["lead-sink.js", "lead-bridge.js", "thanks.js", "store-bridge-falcon.js"].map((f) => `\n<script data-src="${f}">${readFileSync(join(ROOT, "overrides", f), "utf8")}</script>`).join("");
  const NEWP = Object.values(ROUTES).concat((BLOG.posts || []).map((p) => "/blog/" + p.slug));
  // класс .fb-native включает код HEAD самой страницы (настройки страницы → «HTML-код для вставки внутрь HEAD») — см. settings.json, headCode
  const fontsCss = css(readFileSync(join(SRC, "assets/fonts.css"), "utf8"));
  const siteCss = await scopeCss(css(readFileSync(join(SRC, "assets/site.css"), "utf8")));
  const headFrag = `<!-- Falcon Bike · стили нового дизайна (шапка проекта, страница Header). Действуют только на новых страницах (.fb-native). Не редактировать вручную. -->\n` + HIDE_OLD + `\n<style data-src="assets/fonts.css">${fontsCss}</style>\n<style data-src="assets/site.css">${siteCss}</style>`;
  const hparts = await toParts(headFrag); const hdir = join(OUT, "_head"); rmSync(hdir, { recursive: true, force: true }); mkdirSync(hdir, { recursive: true });
  writeFileSync(join(OUT, "_head.html"), headFrag); hparts.forEach((p, i) => writeFileSync(join(hdir, `${String(i + 1).padStart(2, "0")}.html`), p));
  settings._head = { path: "(Header)", parts: hparts.length, partSizes: hparts.map((p) => p.length), bytes: Buffer.byteLength(headFrag) };
  console.log(`_head (шапка проекта: стили)            ${(settings._head.bytes / 1024).toFixed(0).padStart(5)} КБ → блоков: ${hparts.length}`);
  const frag = `<!-- Falcon Bike · общие скрипты прототипа (подвал проекта, страница Footer). Работают только на новых страницах (window.B79_NATIVE). Не редактировать вручную. -->\n` + body;
  const parts = await toParts(frag); const dir = join(OUT, "_shared"); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  writeFileSync(join(OUT, "_shared.html"), frag); parts.forEach((p, i) => writeFileSync(join(dir, `${String(i + 1).padStart(2, "0")}.html`), p));
  settings._shared = { path: "(Footer)", parts: parts.length, partSizes: parts.map((p) => p.length), bytes: Buffer.byteLength(frag) };
  console.log(`_shared (подвал проекта)                ${(settings._shared.bytes / 1024).toFixed(0).padStart(5)} КБ → блоков: ${parts.length}`);
}
await browser.close(); srv.close();
writeFileSync(join(OUT, "settings.json"), JSON.stringify(settings, null, 2));
if (Object.keys(errors).length) console.log("\nОшибки JS при пререндере:", JSON.stringify(errors).slice(0, 800));
if (missing.size) console.log(`\nНет на сервере Тильды (${missing.size}): ` + [...missing].slice(0, 10).join(", ") + (missing.size > 10 ? " …" : ""));
