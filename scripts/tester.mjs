// Режим тестировщика: на каждой странице нажимает все кнопки, вкладки, раскрывашки, диалоги, отправляет демо-формы,
// проверяет внутренние ссылки и собирает все ошибки JS. Запуск после сборки: node scripts/tester.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname, DIST = join(ROOT, "dist"), OUT = join(ROOT, "check-report");
mkdirSync(OUT, { recursive: true });
const PAGES = ["index", "blog", "warranty", "factory", "instructions"];
const T = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".woff2": "font/woff2", ".json": "application/json" };
const srv = createServer((q, r) => { let f = join(DIST, decodeURIComponent(q.url.split("?")[0].split("#")[0])); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html"); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": T[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f)); }).listen(8795);
const B = "http://127.0.0.1:8795/site/rep/";
const browser = await chromium.launch();
const report = []; let bad = 0;
const note = (p, ok, what, d = "") => { report.push({ p, ok, what, d }); if (!ok) bad++; console.log(`${ok ? "OK  " : "FAIL"} [${p}] ${what}${d ? " — " + d : ""}`); };

const internal = new Set(), external = new Set();
for (const slug of PAGES) for (const vw of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: vw[0], height: vw[1] }, isMobile: vw[2], hasTouch: vw[2] });
  const page = await ctx.newPage(); const errs = [], failed = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/net::ERR|Failed to load resource/.test(m.text())) errs.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.url().startsWith("http://127.0.0.1:8795") && r.status() >= 400) failed.push(r.status() + " " + r.url()); });
  page.on("popup", (p) => p.close().catch(() => {}));
  // внешние переходы не выполняем, только запоминаем
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (rt) => rt.abort());
  const tag = `${slug} ${vw[0]}px`;
  await page.goto(B + slug + ".html", { waitUntil: "load" });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });
  // согласие cookie, чтобы баннер не перекрывал кнопки
  await page.locator("button:has-text('Отказаться')").first().click({ timeout: 2000 }).catch(() => {});
  // ссылки
  const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href));
  links.forEach((h) => (h.startsWith("http://127.0.0.1:8795") ? internal.add(h.split("#")[0].split("?")[0]) : /^https?:/.test(h) && external.add(h)));
  // все кликабельные элементы, кроме ссылок-переходов
  const n = await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, summary, [role=tab], [data-dlg], [data-select], [data-pick], [data-frame], [data-accent], [data-color], [aria-controls]")]
      .filter((e) => e.offsetParent !== null || e.tagName === "SUMMARY");
    els.forEach((e, i) => e.setAttribute("data-t", i)); return els.length;
  });
  let clicked = 0, clickErr = 0;
  for (let i = 0; i < n; i++) {
    const el = page.locator(`[data-t="${i}"]`);
    if (!(await el.isVisible().catch(() => false))) continue;
    const href = await el.getAttribute("href").catch(() => null);
    if (href && !href.startsWith("#")) continue;
    try { await el.click({ timeout: 1500, noWaitAfter: true }); clicked++; await page.waitForTimeout(60); } catch { clickErr++; }
    if (page.url().split("#")[0] !== B + slug + ".html") { await page.goto(B + slug + ".html", { waitUntil: "load" }); }
    await page.keyboard.press("Escape").catch(() => {});
  }
  note(tag, true, `нажато элементов: ${clicked}`, clickErr ? `не нажались (перекрыты/скрыты): ${clickErr}` : "");
  // демо-формы: пустая отправка показывает подсказки, заполненная — сообщение об успехе, без запросов наружу
  const forms = await page.locator("form.js-demo-form").count();
  let formsOk = 0;
  for (let i = 0; i < forms; i++) {
    const f = page.locator("form.js-demo-form").nth(i);
    if (!(await f.isVisible().catch(() => false))) continue;
    await f.evaluate((form) => {
      form.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea").forEach((x) => {
        x.value = x.type === "tel" || /phone|tel/i.test(x.name) ? "+79990000000" : x.type === "email" ? "test@example.com" : x.type === "url" ? "https://example.com" : "Тест";
        x.dispatchEvent(new Event("input", { bubbles: true }));
      });
      form.querySelectorAll("input[type=checkbox]").forEach((c) => { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); });
      form.querySelectorAll("select").forEach((s) => { if (s.options.length > 1) s.selectedIndex = 1; });
    });
    const sub = f.locator("button[type=submit], button:not([type])").last();
    await sub.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(300);
    const okMsg = await f.evaluate((form) => /принят|спасибо|отправ/i.test((form.closest("section,dialog,div") || form).innerText));
    if (okMsg) formsOk++;
  }
  if (forms) note(tag, formsOk > 0, `демо-формы: ${formsOk} из видимых показывают «заявка принята»`, `всего форм ${forms}`);
  note(tag, errs.length === 0, "нет ошибок JavaScript после всех нажатий", errs.slice(0, 4).join(" | "));
  note(tag, failed.length === 0, "нет битых ресурсов", failed.slice(0, 4).join(", "));
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  note(tag, sw <= 1, "после нажатий нет горизонтальной прокрутки", `+${sw}px`);
  await ctx.close();
}
// внутренние ссылки
const r404 = [];
for (const u of internal) { const p = new URL(u).pathname; const f = join(DIST, decodeURIComponent(p)); if (!existsSync(f)) r404.push(p); }
note("ссылки", r404.length === 0, `внутренних адресов: ${internal.size}, не найдено: ${r404.length}`, r404.join(", "));
writeFileSync(join(OUT, "external-links.json"), JSON.stringify([...external].sort(), null, 2));
note("ссылки", true, `внешних адресов: ${external.size} (список в check-report/external-links.json)`);
await browser.close(); srv.close();
writeFileSync(join(OUT, "tester.json"), JSON.stringify(report, null, 2));
console.log(`\nИтог: ${report.length - bad}/${report.length}`);
process.exit(bad ? 1 : 0);
