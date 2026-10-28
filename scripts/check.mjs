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
const PAGES = [["index", "Главная"], ["blog", "Блог"], ["warranty", "Гарантия"], ["factory", "Завод"], ["instructions", "Инструкции"]];
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

for (const [slug, label] of PAGES) for (const [w, h] of WIDTHS) {
  const PAGE = `site/rep/${slug}.html`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
  const page = await ctx.newPage();
  const errors = [], bad = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.url().startsWith(origin) && r.status() >= 400) bad.push(r.status() + " " + r.url().replace(origin, "")); });
  page.on("requestfailed", (r) => { if (r.url().startsWith(origin) && !/\.mp4/.test(r.url())) bad.push("failed " + r.url().replace(origin, "")); });
  const tag = `[${label} ${w}px]`;
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
  await page.screenshot({ path: join(OUT, `page-${slug}-${w}.png`), fullPage: false });
  await page.screenshot({ path: join(OUT, `page-${slug}-${w}-full.png`), fullPage: true });
  await ctx.close();
}

// Встраивание: имитация опубликованной страницы Tilda с кодом T123
const t123 = readFileSync(join(ROOT, "tilda", "t123.html"), "utf8").replace("__PUBLIC_BASE__", BASE);
const sim = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tilda sim</title></head><body><div id="allrecords" class="t-records"><div id="rec1" class="r t-rec"><div class="t123"><div class="t-container_100"><div class="t-width t-width_100">${t123}</div></div></div></div></div></body></html>`;
for (const [slug] of PAGES) { const d = join(ROOT, ".sim", slug === "index" ? "" : slug); mkdirSync(d, { recursive: true }); writeFileSync(join(d, "index.html"), sim); }
servers.push(await serve(join(ROOT, ".sim"), 8791));
const SIM = "http://127.0.0.1:8791";
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [slug, label] of PAGES) {
    await page.goto(SIM + "/" + (slug === "index" ? "" : slug), { waitUntil: "load" });
    const frame = page.frameLocator("#b79-frame");
    let ok = false; try { await frame.locator("h1").waitFor({ timeout: 30000 }); ok = true; } catch {}
    const src = (await page.locator("#b79-frame").getAttribute("src")) || "";
    rec(`[Tilda ${w}px] ${label}: открывается нужная страница`, ok && src.includes(`/site/rep/${slug}.html`), src.replace(BASE, ""));
    await page.waitForTimeout(600);
    const t = await page.title();
    rec(`[Tilda ${w}px] ${label}: заголовок вкладки со страницы`, t !== "Tilda sim" && t.length > 5, t);
    if (slug === "index") {
      const box = await page.locator("#b79-frame").boundingBox();
      rec(`[Tilda ${w}px] фрейм на весь экран`, !!box && Math.round(box.width) === w && Math.round(box.height) === h, box ? `${Math.round(box.width)}×${Math.round(box.height)}` : "");
      await page.screenshot({ path: join(OUT, `tilda-${w}.png`) });
    }
  }
  // переход между страницами меняет адрес на Тильде: с главной на «Гарантию», затем «Назад»
  await page.goto(SIM + "/", { waitUntil: "load" });
  const fr = page.frameLocator("#b79-frame");
  await fr.locator("h1").waitFor({ timeout: 30000 });
  const link = fr.locator('a[href="warranty.html"]').first();
  let navOk = false, backOk = false;
  try {
    await link.evaluate((a) => a.scrollIntoView());
    await Promise.all([page.waitForURL(SIM + "/warranty", { timeout: 20000 }), link.evaluate((a) => a.click())]);
    await fr.locator("h1").waitFor({ timeout: 30000 });
    navOk = ((await page.locator("#b79-frame").getAttribute("src")) || "").includes("/site/rep/warranty.html");
    await page.goBack({ waitUntil: "load" });
    backOk = page.url() === SIM + "/";
  } catch (e) { errors.push("переход: " + e.message.split("\n")[0]); }
  rec(`[Tilda ${w}px] ссылка «Гарантия» открывает /warranty на Тильде`, navOk, page.url());
  rec(`[Tilda ${w}px] кнопка «Назад» возвращает на главную`, backOk);
  // параметры блога доходят до страницы
  await page.goto(SIM + "/blog?r=test", { waitUntil: "load" });
  const bsrc = (await page.locator("#b79-frame").getAttribute("src")) || "";
  rec(`[Tilda ${w}px] параметры адреса блога передаются`, /[?&]r=test/.test(bsrc), bsrc.replace(BASE, ""));
  rec(`[Tilda ${w}px] загрузчик без ошибок`, errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// Плеер Kinescope: карточка нашего ролика открывает плеер на сайте, чужой ролик по-прежнему уходит на YouTube
{
  const KMAP = JSON.parse(readFileSync(join(ROOT, "overrides", "kinescope.json"), "utf8"));
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
    const page = await ctx.newPage(); const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route(/kinescope\.io|youtube\.com/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>stub</body></html>" }));
    await page.goto(BASE + "site/rep/factory.html", { waitUntil: "load" });
    await page.locator("button:has-text('Отказаться')").first().click({ timeout: 2000 }).catch(() => {});
    const own = page.locator('a[href*="EVj42tyAZZk"]').first();
    await own.scrollIntoViewIfNeeded(); await own.click();
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => { const d = document.querySelector(".kdlg"); const f = d && d.querySelector("iframe"); const b = d && d.querySelector(".kdlg__box").getBoundingClientRect(); return { open: !!d && d.classList.contains("is-open"), src: f ? f.src : "", w: b ? Math.round(b.width) : 0, sw: document.documentElement.scrollWidth - innerWidth }; });
    rec(`[Kinescope ${w}px] свой ролик открывает плеер на сайте`, st.open && st.src.includes(KMAP.EVj42tyAZZk.k), st.src.replace(/\?.*/, ""));
    rec(`[Kinescope ${w}px] окно плеера помещается в экран`, st.w > 0 && st.w <= w && st.sw <= 1, `ширина ${st.w}`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(200);
    const closed = await page.evaluate(() => !document.querySelector(".kdlg.is-open") && !document.querySelector(".kdlg iframe"));
    rec(`[Kinescope ${w}px] Esc закрывает плеер и останавливает видео`, closed);
    const [popup] = await Promise.all([page.waitForEvent("popup", { timeout: 5000 }).catch(() => null), page.locator('a[href*="sINYMFZpdR8"]').first().click()]);
    const still = await page.evaluate(() => !!document.querySelector(".kdlg.is-open"));
    rec(`[Kinescope ${w}px] чужой ролик по-прежнему открывается на YouTube`, !!popup && !still);
    if (popup) await popup.close();
    rec(`[Kinescope ${w}px] без ошибок JavaScript`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
}

await browser.close();
servers.forEach((s) => s.close());
const md = `# Проверка сборки\n\n${new Date().toISOString()} · ${remote ? "опубликованная: " + remote : "локальная dist/"}\n\n| Проверка | Итог | Детали |\n|---|---|---|\n` +
  results.map((r) => `| ${r.name} | ${r.ok ? "✅" : "❌"} | ${String(r.detail).replace(/\|/g, "/")} |`).join("\n") + `\n\nИтого: ${results.length - failed} из ${results.length} пройдено.\n`;
writeFileSync(join(OUT, "report.md"), md);
writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed}/${results.length} проверок пройдено`);
process.exit(failed ? 1 : 0);
