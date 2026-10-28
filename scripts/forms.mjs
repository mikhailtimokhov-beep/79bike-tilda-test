// Проверка всех форм 79bike.ru: открытие, подсказки при ошибках, успешная отправка, сброс; что именно форма соберёт для отправки.
// Запуск после сборки: node scripts/forms.mjs   (телефон 390 px и ПК 1440 px)
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname, DIST = join(ROOT, "dist"), OUT = join(ROOT, "check-report");
mkdirSync(OUT, { recursive: true });
const T = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".woff2": "font/woff2", ".json": "application/json" };
const srv = createServer((q, r) => { let f = join(DIST, decodeURIComponent(q.url.split("?")[0])); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html"); if (!existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": T[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f)); }).listen(8796);
const URL0 = "http://127.0.0.1:8796/site/rep/index.html";

const FORMS = [
  { key: "dealer", name: "Заявка на дилерство", open: async (p) => { await p.locator("#pform").scrollIntoViewIfNeeded(); }, sel: "#pform" },
  { key: "blogger", name: "Заявка блогера", open: async (p) => { await p.locator('[data-dlg="dlg-blog"]').first().click(); }, sel: "#dlg-blog form" },
  { key: "support", name: "Техподдержка (первый экран)", open: async (p) => {
      await p.locator('[data-dlg="dlg-support"]').first().click();
      // ветка «у другого продавца»: форма не показывается, предлагаются официальные дилеры, «Назад» возвращает к выбору
      await p.locator('#dlg-support [data-sup="no"]').click();
      const no = await p.locator('#dlg-support [data-step="no"]').isVisible(), formHidden = !(await p.locator("#dlg-support form").isVisible());
      await p.locator('#dlg-support [data-step="no"] [data-sup="back"]').click();
      if (!no || !formHidden) throw new Error("ветка «У другого продавца» работает неверно");
      await p.locator('#dlg-support [data-sup="ok"]').first().click();
    }, sel: "#dlg-support form" },
  { key: "model", name: "Консультация по модели (подбор)", open: async (p) => { await p.locator("#select").scrollIntoViewIfNeeded(); await p.locator('[aria-controls="sel-consult"]').first().click(); }, sel: "#sel-consult form" },
];

const browser = await chromium.launch();
const rows = []; let bad = 0;
const note = (tag, ok, what, d = "") => { rows.push({ tag, ok, what, d }); if (!ok) bad++; console.log(`${ok ? "OK  " : "FAIL"} [${tag}] ${what}${d ? " — " + d : ""}`); };
const payloads = {};

for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) for (const F of FORMS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob });
  const page = await ctx.newPage(); const errs = [], outgoing = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("request", (r) => { if (["POST", "PUT"].includes(r.method())) outgoing.push(r.method() + " " + r.url()); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (rt) => rt.abort());
  await page.goto(URL0, { waitUntil: "load" });
  await page.locator("button:has-text('Отказаться')").first().click({ timeout: 2000 }).catch(() => {});
  const tag = `${F.name}, ${w}px`;
  try { await F.open(page); } catch (e) { note(tag, false, "форма открывается", e.message.split("\n")[0]); await ctx.close(); continue; }
  const form = page.locator(F.sel).first();
  await page.waitForTimeout(250);
  note(tag, await form.isVisible(), "форма открывается и видна");
  if (!(await form.isVisible())) { await ctx.close(); continue; }
  const box = await form.boundingBox();
  note(tag, box && box.x >= -1 && box.x + box.width <= w + 1, "форма помещается по ширине экрана", box ? `${Math.round(box.x)}…${Math.round(box.x + box.width)} из ${w}` : "");
  const submit = form.locator('button[type=submit], button:not([type])').last();
  const msg = async () => form.evaluate((f) => { const m = f.querySelector(".form-msg"); const inv = f.querySelector('[aria-invalid="true"]'); return { text: m ? m.textContent.trim() : "", cls: m ? m.className : "", invalid: inv ? (inv.name || inv.type) : "" }; });
  const fillText = async () => form.evaluate((f) => {
    f.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=tel]):not([data-contact]), textarea').forEach((x) => { x.value = x.type === "url" ? "https://example.com/test" : "Тест Тестов"; x.dispatchEvent(new Event("input", { bubbles: true })); });
    f.querySelectorAll("select").forEach((s) => { if (s.options.length > 1) s.selectedIndex = 1; s.dispatchEvent(new Event("change", { bubbles: true })); });
    const pl = f.querySelector('input[name="platforms"]'); if (pl) pl.checked = true;
  });
  const setTel = async (v) => form.evaluate((f, v) => { const t = f.querySelector("input[data-contact], input[type=tel]"); t.value = v; t.dispatchEvent(new Event("input", { bubbles: true })); }, v);
  const setChecks = async (on) => form.evaluate((f, on) => f.querySelectorAll("input[data-req-check]").forEach((c) => { c.checked = on; c.dispatchEvent(new Event("change", { bubbles: true })); }), on);
  const how = async (v) => form.evaluate((f, v) => { const r = f.querySelector(`input[name="how"][value="${v}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); } return !!r; }, v);

  // 1. пустая отправка
  await submit.click(); await page.waitForTimeout(150);
  let m = await msg();
  note(tag, /error/.test(m.cls) && !!m.text && !!m.invalid, "пустая форма: подсказка и подсвеченное поле", `«${m.text}» (${m.invalid})`);
  // 2. короткий телефон
  await fillText(); await setTel("+7 999 12"); await setChecks(true);
  await submit.click(); await page.waitForTimeout(150); m = await msg();
  note(tag, /error/.test(m.cls) && /цифр|номер/i.test(m.text), "неполный телефон: подсказка", `«${m.text}»`);
  // 3. без согласия на обработку данных
  await setTel("+7 999 900-55-88"); await setChecks(false);
  await submit.click(); await page.waitForTimeout(150); m = await msg();
  note(tag, /error/.test(m.cls) && !!m.text, "без согласия: отправка не проходит", `«${m.text}»`);
  // 4. Telegram: имя пользователя вместо телефона
  if (await how("telegram")) {
    await setTel("@и"); await setChecks(true); await submit.click(); await page.waitForTimeout(150); m = await msg();
    note(tag, /error/.test(m.cls), "Telegram: неверное имя пользователя отклоняется", `«${m.text}»`);
    await setTel("ivan_petrov");
  } else await setChecks(true);
  // 5. верное заполнение
  await setChecks(true);
  const data = await form.evaluate((f) => { const o = {}; new FormData(f).forEach((v, k) => { o[k] = o[k] ? o[k] + ", " + v : v; }); const t = f.querySelector("input[data-contact], input[type=tel]"); o["_контакт"] = t ? t.value : ""; return o; });
  await submit.click(); await page.waitForTimeout(200); m = await msg();
  const okNow = /is-ok/.test(m.cls) || /принят/i.test(await form.evaluate((f) => (f.closest("dialog,section,div") || f).innerText));
  note(tag, okNow, "верное заполнение: сообщение «заявка принята»", `«${m.text.slice(0, 90)}»`);
  payloads[F.key] = data;
  note(tag, outgoing.length === 0, "заявка НЕ уходит никуда (так устроен прототип — на живом сайте нужно подключение)", outgoing.join(", ") || "запросов на отправку нет");
  note(tag, errs.length === 0, "нет ошибок JavaScript", errs.slice(0, 3).join(" | "));
  await ctx.close();
}
await browser.close(); srv.close();
writeFileSync(join(OUT, "forms.json"), JSON.stringify({ rows, payloads }, null, 2));
console.log(`\nИтог: ${rows.length - bad}/${rows.length}`);
console.log("Что собирает каждая форма:\n" + JSON.stringify(payloads, null, 1));
process.exit(bad ? 1 : 0);
