// Проверка нативных страниц: фрагмент T123 вставляется в оболочку, похожую на страницу Тильды,
// и сравнивается с исходной страницей: ошибки JS, картинки, прокрутка, ссылки, объём текста.
// Запуск: TARGET=test ASSETS=local node scripts/build-native.mjs && node scripts/check-native.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";
const ROOT = new URL("..", import.meta.url).pathname, DIST = join(ROOT, "dist"), NAT = join(ROOT, "dist-native", process.env.TARGET || "test");
const T = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".woff2": "font/woff2" };
const PAGES = { "/": "index", "/blog": "blog", "/warranty": "warranty", "/garant": "warranty", "/factory": "factory", "/instructions": "instructions" };
import { readdirSync } from "node:fs";
// как на Тильде: каждый блок T123 в своей обёртке
const partsOf = (page) => readdirSync(join(NAT, page)).filter((f) => /^\d+\.html$/.test(f)).sort().map((f, i) => `<div id="rec${i + 1}" class="r t-rec" data-record-type="131"><div class="t123"><div class="t-container_100 "><div class="t-width t-width_100 ">${readFileSync(join(NAT, page, f), "utf8")}</div></div></div></div>`).join("\n");
const shellParts = (page) => shell("", partsOf(page));
const shell = (frag, recs) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>shell</title>
<style>/* как у Тильды */body{margin:0;-webkit-font-smoothing:antialiased}.t-records{position:relative}.t-rec{position:relative}.t123 *{box-sizing:border-box}</style></head>
<body class="t-body"><div id="allrecords" class="t-records">${recs || `<div id="rec1" class="r t-rec"><div class="t123"><div class="t-container_100"><div class="t-width t-width_100">${frag}</div></div></div></div>`}</div></body></html>`;
const srv = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]);
  const page = PAGES[u] || (u.startsWith("/blog/") ? "blog--" + u.split("/")[2] : null);
  if (page) { r.writeHead(200, { "Content-Type": T[".html"] }); return r.end(shellParts(page)); }
  const f = join(DIST, u); if (!existsSync(f) || statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": T[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f));
}).listen(8800);
const B = "http://127.0.0.1:8800";
const browser = await chromium.launch(); let bad = 0, n = 0;
const rec = (ok, what, d = "") => { n++; if (!ok) bad++; console.log(`${ok ? "OK  " : "FAIL"} ${what}${d ? " — " + d : ""}`); };
const textOf = async (url, w) => { const p = await browser.newPage({ viewport: { width: w, height: 900 } }); await p.route(/^https?:\/\/(?!127)/, (x) => x.abort()); await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(400); const t = (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").length; await p.close(); return t; };
const BLOGP = ["kak-stat-dilerom-79bike", "garantiya-79bike-v-rossii", "tehnologii-79bike", "kak-otlichit-oficialnyj-79bike"];
const LIST = [["/factory", "factory"], ["/instructions", "instructions"], ["/warranty", "warranty"], ["/blog", "blog"], ["/", "index"]].concat(BLOGP.map((b) => ["/blog/" + b, "blog?s=" + b]));
const noJsText = async (url) => { const c = await browser.newContext({ javaScriptEnabled: false }); const p = await c.newPage(); await p.goto(url); const t = (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").length; await c.close(); return t; };
for (const [path, page] of LIST) for (const w of [390, 1440]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 }, isMobile: w < 800, hasTouch: w < 800 });
  const errs = [], fails = [];
  p.on("pageerror", (e) => errs.push(e.message));
  // ролик первого экрана переносится на Kinescope отдельным шагом — пока не считаем его ошибкой (см. CHANGELOG)
  p.on("response", (x) => { if (x.url().startsWith(B) && x.status() >= 400 && !/\/hero\/hero[-a-z]*\.mp4/.test(x.url())) fails.push(x.status() + " " + x.url().replace(B, "")); });
  await p.route(/^https?:\/\/(?!127)/, (x) => x.abort());
  await p.goto(B + path, { waitUntil: "load" });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, broken: [...document.images].filter((i) => i.complete && i.getAttribute("src") && i.naturalWidth === 0 && getComputedStyle(i).display !== "none").map((i) => i.getAttribute("src")).slice(0, 4),
    rel: [...document.querySelectorAll("img[src],source[srcset]")].map((i) => i.getAttribute("src") || i.getAttribute("srcset")).filter((s) => !/^(\/site\/|https?:|data:)/.test(s)).slice(0, 4),
    htmlLinks: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => /\.html/.test(h)).slice(0, 4), h1: document.querySelectorAll("h1").length,
    uses: [...document.querySelectorAll("use")].map((u) => u.getAttribute("href") || u.getAttribute("xlink:href") || "").filter((h) => !h.startsWith("#") || !document.getElementById(h.slice(1))).slice(0, 4),
    text: document.body.innerText.replace(/\s+/g, " ").length }));
  const orig = await textOf(`${B}/site/rep/${page.replace("?", ".html?").replace(/^([a-z]+)$/, "$1.html")}`, w);
  const tag = `[${page} ${w}px]`;
  rec(errs.length === 0, `${tag} нет ошибок JavaScript`, errs.slice(0, 2).join(" | "));
  rec(fails.length === 0, `${tag} все файлы отдаются`, fails.slice(0, 3).join(", "));
  rec(m.broken.length === 0 && m.rel.length === 0, `${tag} картинки с сервера, все загрузились`, [...m.broken, ...m.rel].join(", "));
  rec(m.sw <= m.iw + 1, `${tag} нет горизонтальной прокрутки`, `${m.sw}/${m.iw}`);
  rec(m.htmlLinks.length === 0, `${tag} ссылки ведут на адреса Тильды, не на .html`, m.htmlLinks.join(", "));
  rec(m.h1 === 1, `${tag} один H1`, String(m.h1));
  rec(m.uses.length === 0, `${tag} иконки из встроенного спрайта`, m.uses.join(", "));
  rec(Math.abs(m.text - orig) / orig < 0.03, `${tag} текста столько же, сколько в исходной странице (нет дублей)`, `${m.text} / ${orig}`);
  if (w === 1440) { const nj = await noJsText(B + path); rec(nj / orig > 0.85, `${tag} текст виден поисковикам без JavaScript`, `${nj} из ${orig} (${Math.round(nj / orig * 100)}%)`); }
  await p.close();
}
await browser.close(); srv.close();
console.log(`\nИтог: ${n - bad}/${n}`); process.exit(bad ? 1 : 0);
