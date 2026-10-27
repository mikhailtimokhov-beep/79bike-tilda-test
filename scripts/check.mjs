// Проверки сборки перед публикацией. Публикация на тестовый адрес идёт ТОЛЬКО если всё зелёное.
// node scripts/check.mjs                 — проверяет dist/ локально (встроенный http-сервер)
// node scripts/check.mjs --url <base>    — дымовая проверка уже опубликованной сборки
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "check-report");
const PAGE = "site/rep/index.html";
const WIDTHS = [[375, 812], [390, 844], [768, 1024], [1440, 900], [1920, 1080]];
const args = process.argv.slice(2);
const remote = args.includes("--url") ? args[args.indexOf("--url") + 1].replace(/\/?$/, "/") : null;
mkdirSync(OUT, { recursive: true });

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };
function serve(dir, port) {
  return new Promise((res) => {
    const srv = createServer((req, rsp) => {
      const p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
      let f = join(dir, p);
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
      if (!existsSync(f)) { rsp.writeHead(404); return rsp.end("404"); }
      const body = readFileSync(f), range = req.headers.range;
      if (range && extname(f) === ".mp4") { // видео отдаём частями, как настоящий хостинг
        const [a, b] = range.replace("bytes=", "").split("-"); const s = +a, e = b ? +b : body.length - 1;
        rsp.writeHead(206, { "Content-Type": TYPES[".mp4"], "Content-Range": `bytes ${s}-${e}/${body.length}`, "Accept-Ranges": "bytes", "Content-Length": e - s + 1 });
        return rsp.end(body.subarray(s, e + 1));
      }
      rsp.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream" }); rsp.end(body);
    }).listen(port, "127.0.0.1", () => res(srv));
  });
}

const results = []; let failed = 0;
function rec(name, ok, detail = "") { results.push({ name, ok, detail }); if (!ok) failed++; console.log(`${ok ? "OK  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`); }

const servers = [];
let BASE = remote;
if (!remote) { servers.push(await serve(DIST, 8790)); BASE = "http://127.0.0.1:8790/"; }

const browser = await chromium.launch();
const origin = new URL(BASE).origin;

for (const [w, h] of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
  const page = await ctx.newPage();
  const errors = [], bad = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.url().startsWith(origin) && r.status() >= 400) bad.push(r.status() + " " + r.url().replace(origin, "")); });
  page.on("requestfailed", (r) => { if (r.url().startsWith(origin) && !/\.mp4/.test(r.url())) bad.push("failed " + r.url().replace(origin, "")); });
  const tag = `[${w}px]`;
  const resp = await page.goto(BASE + PAGE, { waitUntil: "load", timeout: 60000 });
  rec(`${tag} страница открывается`, resp && resp.ok(), resp ? "HTTP " + resp.status() : "нет ответа");
  // прокручиваем до конца, чтобы подгрузились отложенные картинки
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const imgs = [...document.images].filter((i) => i.getAttribute("src") || i.getAttribute("srcset"));
    const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0 && getComputedStyle(i).display !== "none").map((i) => i.getAttribute("src"));
    // якорь в порядке, если блок есть на странице, ссылку обрабатывает скрипт (data-*) или это диалог (#support → #dlg-support)
    const jsHandled = (a) => [...a.attributes].some((x) => x.name.startsWith("data-"));
    const anchors = [...document.querySelectorAll('a[href^="#"]')].filter((a) => { const id = a.getAttribute("href").slice(1); const delegated = /^select-/.test(id) && document.getElementById("select"); // общий обработчик a[href^='#select-'] открывает модель в селекторе
      return id && !document.getElementById(id) && !document.getElementById("dlg-" + id) && !jsHandled(a) && !delegated; }).map((a) => a.getAttribute("href"));
    const emptyLinks = [...document.querySelectorAll("a")].filter((a) => (!a.getAttribute("href") && !a.hasAttribute("data-l")) || /undefined|null/.test(a.getAttribute("href") || "")).length;
    const noAlt = imgs.filter((i) => !i.hasAttribute("alt")).length;
    return {
      sw: document.documentElement.scrollWidth, iw: innerWidth,
      h1: document.querySelectorAll("h1").length, h2: document.querySelectorAll("h2").length,
      title: document.title, desc: (document.querySelector('meta[name="description"]') || {}).content || "",
      robots: (document.querySelector('meta[name="robots"]') || {}).content || "",
      imgs: imgs.length, broken, anchors: [...new Set(anchors)], emptyLinks, noAlt,
      buttons: document.querySelectorAll("a.btn, button").length,
    };
  });
  rec(`${tag} нет ошибок JavaScript`, errors.length === 0, errors.slice(0, 3).join(" | "));
  rec(`${tag} все ресурсы сайта отдаются`, bad.length === 0, bad.slice(0, 5).join(", "));
  rec(`${tag} картинки загрузились`, m.broken.length === 0, `${m.imgs} шт.` + (m.broken.length ? ", битые: " + m.broken.slice(0, 5).join(", ") : ""));
  rec(`${tag} нет горизонтальной прокрутки`, m.sw <= m.iw + 1, `scrollWidth ${m.sw} / окно ${m.iw}`);
  rec(`${tag} ровно один H1`, m.h1 === 1, `H1: ${m.h1}, H2: ${m.h2}`);
  rec(`${tag} title и description`, m.title.length > 10 && m.desc.length > 50, m.title);
  rec(`${tag} закрыто от индексации`, /noindex/.test(m.robots), m.robots);
  rec(`${tag} якорные ссылки ведут на блоки`, m.anchors.length === 0, m.anchors.join(", "));
  rec(`${tag} нет пустых ссылок`, m.emptyLinks === 0, `${m.emptyLinks}`);
  rec(`${tag} у картинок есть alt`, m.noAlt === 0, `без alt: ${m.noAlt}`);
  // меню
  try {
    if (w < 1181) {
      await page.click("#menu-open");
      await page.waitForTimeout(400);
      const open = await page.evaluate(() => { const m = document.getElementById("menu"); return !!m && getComputedStyle(m).visibility !== "hidden" && m.getBoundingClientRect().width > 0 && !m.hidden; });
      rec(`${tag} мобильное меню открывается`, open);
      await page.click("#menu-close").catch(() => {});
    } else {
      const btn = page.locator(".nav__btn").first();
      await btn.click(); await page.waitForTimeout(300);
      rec(`${tag} выпадающее меню открывается`, (await btn.getAttribute("aria-expanded")) === "true");
      await page.keyboard.press("Escape");
    }
  } catch (e) { rec(`${tag} меню`, false, e.message.split("\n")[0]); }
  await page.screenshot({ path: join(OUT, `page-${w}.png`), fullPage: false });
  await page.screenshot({ path: join(OUT, `page-${w}-full.png`), fullPage: true });
  await ctx.close();
}

// Встраивание: имитация опубликованной страницы Tilda с кодом T123
const t123 = readFileSync(join(ROOT, "tilda", "t123.html"), "utf8").replace("__PUBLIC_BASE__", BASE);
const sim = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tilda sim</title></head><body><div id="allrecords" class="t-records"><div id="rec1" class="r t-rec"><div class="t123"><div class="t-container_100"><div class="t-width t-width_100">${t123}</div></div></div></div></div></body></html>`;
mkdirSync(join(ROOT, ".sim"), { recursive: true }); writeFileSync(join(ROOT, ".sim", "index.html"), sim);
servers.push(await serve(join(ROOT, ".sim"), 8791));
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8791/index.html", { waitUntil: "load" });
  const frame = page.frameLocator("#b79-frame");
  let ok = false; try { await frame.locator("h1").waitFor({ timeout: 30000 }); ok = true; } catch {}
  const box = await page.locator("#b79-frame").boundingBox();
  const src = await page.locator("#b79-frame").getAttribute("src");
  rec(`[Tilda ${w}px] главная загружается в блоке T123`, ok, src || "");
  rec(`[Tilda ${w}px] фрейм на весь экран`, !!box && Math.round(box.width) === w && Math.round(box.height) === h, box ? `${Math.round(box.width)}×${Math.round(box.height)}` : "");
  rec(`[Tilda ${w}px] загрузчик без ошибок`, errors.length === 0, errors.join(" | "));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, `tilda-${w}.png`) });
  await ctx.close();
}

await browser.close();
servers.forEach((s) => s.close());
const md = `# Проверка сборки\n\n${new Date().toISOString()} · ${remote ? "опубликованная: " + remote : "локальная dist/"}\n\n| Проверка | Итог | Детали |\n|---|---|---|\n` +
  results.map((r) => `| ${r.name} | ${r.ok ? "✅" : "❌"} | ${String(r.detail).replace(/\|/g, "/")} |`).join("\n") + `\n\nИтого: ${results.length - failed} из ${results.length} пройдено.\n`;
writeFileSync(join(OUT, "report.md"), md);
writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed}/${results.length} проверок пройдено`);
process.exit(failed ? 1 : 0);
