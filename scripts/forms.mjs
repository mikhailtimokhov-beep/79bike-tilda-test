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
  // вместо Тильды — заглушка приёмника: запоминает заявку; window.__fail = true — имитация сбоя отправки
  await page.addInitScript(() => { window.__leads = []; window.B79_TILDA_SEND = (p, cb) => { window.__leads.push(p); setTimeout(() => cb(!window.__fail, window.__fail ? "test" : ""), 80); }; });
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
  // 5а. сбой отправки: «принята» не показывается, есть телефон
  await page.evaluate(() => { window.__fail = true; });
  await submit.click(); await page.waitForTimeout(400); m = await msg();
  note(tag, /error/.test(m.cls) && /900-55-88/.test(m.text), "сбой отправки: «не удалось отправить» и телефон, без «принята»", `«${m.text.slice(0, 80)}»`);
  await page.evaluate(() => { window.__fail = false; window.__leads = []; });
  // 5б. успешная отправка
  await submit.click(); await page.waitForTimeout(600); m = await msg();
  // у заявки блогера после успеха открывается экран «Заявка отправлена» (шаг done в диалоге)
  const doneStep = await page.evaluate(() => { const d = document.querySelector('#dlg-blog [data-step="done"]'); return d && !d.hidden ? d.innerText.replace(/\s+/g, " ").trim().slice(0, 90) : ""; });
  const okText = F.key === "blogger" ? doneStep : m.text;
  note(tag, (F.key === "blogger" ? !!doneStep : /is-ok/.test(m.cls)) && !/прототип|никуда/i.test(okText), "верное заполнение: «заявка принята» после ответа приёмника, без пометки прототипа", `«${okText.slice(0, 90)}»`);
  const leads = await page.evaluate(() => window.__leads);
  const L = leads[0] || { rows: [] }, rowsT = L.rows.map((r) => r.join(": ")).join(" | ");
  payloads[F.key] = L;
  note(tag, leads.length === 1, "в приёмник ушла ровно одна заявка", `${leads.length}`);
  note(tag, /Контакт: @?ivan_petrov/.test(rowsT) && /Как связаться: Telegram/.test(rowsT) && /Согласие на обработку персональных данных: да/.test(rowsT), "в заявке есть контакт, способ связи и согласие", rowsT.slice(0, 160));
  if (F.key === "model") note(tag, /Консультация по .+/.test(L.title), "консультация по модели: модель указана в заявке", L.title);
  if (F.key === "blogger") note(tag, /Площадки: YouTube/.test(rowsT), "заявка блогера: площадки под своей подписью", rowsT.slice(0, 120));
  if (F.key === "support") note(tag, /Где куплен байк: .+/.test(rowsT) && /Модель: .+/.test(rowsT), "техподдержка: где куплен байк и модель в заявке", rowsT.slice(0, 120));
  note(tag, outgoing.length === 0, "форма сама никуда не отправляет — только через приёмник Тильды", outgoing.join(", ") || "прямых запросов нет");
  note(tag, errs.length === 0, "нет ошибок JavaScript", errs.slice(0, 3).join(" | "));
  await ctx.close();
}
// Приёмник на странице Тильды (tilda/lead-sink.js) на макете формы Тильды: какие поля уйдут и как обрабатывается ошибка
{
  const page = await browser.newPage();
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (rt) => rt.abort());
  await page.goto("http://127.0.0.1:8796/version.json");
  const r = await page.evaluate(async (code) => {
    document.body.innerHTML = '<div class="r" id="rec1"><form class="t-form js-form-proccess"><input name="Name"><textarea name="Comments"></textarea><input name="form-spec-comments"><div class="js-errorbox-all"></div><button type="submit" class="t-submit"></button></form></div>';
    const f = document.querySelector("form"); let mode = "ok", sent = null;
    f.querySelector(".t-submit").addEventListener("click", (e) => { e.preventDefault(); sent = Object.fromEntries(new FormData(f)); setTimeout(() => { if (mode === "ok") f.dispatchEvent(new Event("tildaform:aftersuccess")); else { f.querySelector(".js-errorbox-all").textContent = "Ошибка Тильды"; f.dispatchEvent(new Event("tildaform:aftererror")); } }, 20); });
    eval(code);
    const P = { title: "Консультация по Falcon GT", name: "Иван — тест 2", rows: [["Как связаться", "Позвонить"], ["Контакт", "+7 (999) 000-00-00"], ["Согласие на обработку персональных данных", "да"]] };
    const send = (p) => new Promise((res) => window.B79_TILDA_SEND(p, (ok, err) => res({ ok, err, sent })));
    const a = await send(P);
    mode = "err"; const b = await send({ title: "Стать дилером 79BIKE", name: "Пётр", rows: [["Контакт", "@petr_k"]] });
    return { a, b, hidden: document.getElementById("rec1").classList.contains("b79-sink") };
  }, readFileSync(join(ROOT, "overrides", "lead-sink.js"), "utf8"));
  const A = r.a.sent || {}, B = r.b.sent || {};
  note("приёмник Тильды", r.hidden, "скрытая форма Тильды убрана с экрана");
  note("приёмник Тильды", r.a.ok && A.Name === "Иван тест" && A.Phone === "+79990000000" && A.Form === "Консультация по Falcon GT" && A.Model === "Falcon GT", "стандартные поля: Name, Phone (+7…), Form, Model", JSON.stringify({ Name: A.Name, Phone: A.Phone, Form: A.Form, Model: A.Model }));
  note("приёмник Тильды", /Контакт: \+7 \(999\)/.test(A.Comments || "") && !/Форма:/.test(A.Comments || "") && !Object.keys(A).some((k) => /_/.test(k) && k !== "form-spec-comments"), "текст заявки одним полем Comments, без дублей и полей с «_»", Object.keys(A).join(", "));
  note("приёмник Тильды", !r.b.ok && /Ошибка Тильды/.test(r.b.err) && B.Messenger === "@petr_k" && !B.Phone, "ошибка Тильды передаётся форме; контакт @username — полем Messenger", JSON.stringify({ ok: r.b.ok, err: r.b.err, Messenger: B.Messenger }));
  await page.close();
}
await browser.close(); srv.close();
writeFileSync(join(OUT, "forms.json"), JSON.stringify({ rows, payloads }, null, 2));
console.log(`\nИтог: ${rows.length - bad}/${rows.length}`);
console.log("Что собирает каждая форма:\n" + JSON.stringify(payloads, null, 1));
process.exit(bad ? 1 : 0);
