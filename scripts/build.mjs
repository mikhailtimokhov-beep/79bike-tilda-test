// Сборка тестовой версии главной 79bike.ru для встраивания в Tilda.
// Исходник (src/) не меняется. Результат — dist/, который GitHub Actions публикует на GitHub Pages.
// Запуск: node scripts/build.mjs   (переменные: BUILD_VERSION, PUBLIC_BASE)
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const PAGE = "site/rep/index.html"; // главная — единственная страница, которую переносим

function sh(cmd) { try { return execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } }
const commit = process.env.GITHUB_SHA || sh("git rev-parse HEAD") || "local";
const VERSION = process.env.BUILD_VERSION || (commit.slice(0, 7) + "-" + Date.now().toString(36));
const PUBLIC_BASE = process.env.PUBLIC_BASE ? process.env.PUBLIC_BASE.replace(/\/?$/, "/") : ""; // https://<owner>.github.io/<repo>/

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "site"), { recursive: true });
cpSync(SRC, join(DIST, "site"), { recursive: true });

// Скрипт совместимости для работы внутри iframe на странице Tilda:
//  - внешние ссылки без target открываются во всём окне, а не внутри фрейма;
//  - ссылки на другие страницы сайта ведут на соответствующие адреса Тильды (/blog, /warranty …),
//    чтобы в адресной строке был правильный адрес и работали «Назад» и «Поделиться»;
//  - заголовок страницы передаётся Тильде для вкладки браузера.
// Адрес Тильды приходит от загрузчика в параметре ?top= (только http/https-источник, иначе игнорируется).
const PAGES = ["index", "blog", "warranty", "factory", "instructions"];
const FRAME_COMPAT = `<script data-tilda-embed>(function(){if(window.top===window)return;
var P=${JSON.stringify(PAGES)},T=null;
try{var q=new URLSearchParams(location.search).get("top");if(q&&/^https?:\\/\\/[a-z0-9.-]+(:\\d+)?$/i.test(q))T=q;}catch(_){}
function title(){try{if(T)parent.postMessage({type:"b79-title",title:document.title},T);}catch(_){}}
title();addEventListener("load",title);
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target)return;
var h=a.getAttribute("href")||"";if(/^(mailto:|tel:|#|javascript:)/i.test(h))return;
var u;try{u=new URL(a.href,location.href);}catch(_){return;}
if(u.origin!==location.origin){a.target="_top";return;}
var m=u.pathname.match(/\\/site\\/rep\\/([a-z-]+)\\.html$/);if(!m||P.indexOf(m[1])<0||!T)return;
if(u.pathname===location.pathname&&u.hash)return; /* якорь на этой же странице — прокрутка внутри */
var s=new URLSearchParams(u.search);s.delete("v");s.delete("top");var qs=s.toString();
a.href=T+"/"+(m[1]==="index"?"":m[1])+(qs?"?"+qs:"")+u.hash;a.target="_top";},true);})();</script>`;

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, out) : out.push(p); }
  return out;
}

// Наши ролики в Kinescope: карточки этих YouTube-роликов открывают плеер прямо на сайте (overrides/)
const KMAP = JSON.parse(readFileSync(join(ROOT, "overrides", "kinescope.json"), "utf8"));
delete KMAP._comment;
cpSync(join(ROOT, "overrides", "kinescope-player.js"), join(DIST, "site", "rep", "kinescope-player.js"));
const KINESCOPE = `<script>window.B79_KINESCOPE=${JSON.stringify(KMAP)};</script>\n<script src="kinescope-player.js?v=${VERSION}"></script>`;

// Видео первого экрана для телефонов (≤600 px): кадр 1280×1080 по центру — то, что реально видно на телефоне.
// HEVC 3,6 МБ, если телефон его поддерживает; иначе H.264 6,0 МБ. Планшеты (601–900) — прежний hero-m.mp4, ПК — hero.mp4.
cpSync(join(ROOT, "overrides", "hero"), join(DIST, "site", "rep", "hero"), { recursive: true });
const HERO_OLD = `v.src=m?"hero/hero-m.mp4?v=6":"hero/hero.mp4?v=6";`;
const HERO_NEW = `var p=window.matchMedia&&matchMedia("(max-width: 600px)").matches,h=p&&v.canPlayType&&/probably|maybe/.test(v.canPlayType('video/mp4; codecs="hvc1"'));v.src=p?(h?"hero/hero-p-hevc.mp4?v=7":"hero/hero-p.mp4?v=7"):m?"hero/hero-m.mp4?v=6":"hero/hero.mp4?v=6";`;

// Ссылки на falcon-bike.ru: пока сайт Falcon не обновлён — ведём на существующие страницы старых сайтов (overrides/falcon-links.json).
// Будущий адрес остаётся в data-release-href. Заглушки на прототип Claude заменяются всегда — на живом сайте их быть не должно.
const FL = JSON.parse(readFileSync(join(ROOT, "overrides", "falcon-links.json"), "utf8")); delete FL._comment;
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NOW = (u) => FL[u] || u;
const FALCON_TEXT = [ // подписи, которые меняются вместе с адресом (блога на старом Falcon нет — ведём в «Вопросы и ответы»)
  ["https://falcon-bike.ru/blog", "Блог фирменного магазина 79BIKE", "Вопросы и ответы фирменного магазина 79BIKE"],
  ["https://falcon-bike.ru/blog", "блоге фирменного магазина 79BIKE", "разделе «Вопросы и ответы» фирменного магазина 79BIKE"],
  ["https://falcon-bike.ru/events", "Шоурум и тест-драйвы в Москве — falcon-bike.ru/events", "Шоурум и тест-драйвы в Москве — falcon-bike.ru/contacts"],
];
const falconStats = { placeholders: 0, direct: 0 };
function falconLinks(s) {
  // 1) заглушки: href на прототип Claude + data-release-href → href = рабочий адрес сейчас
  s = s.replace(/href="https:\/\/claude\.ai\/artifact\/[^"]*"(\s+data-release-href="([^"]*)")/g, (_, rel, fut) => { falconStats.placeholders++; return `href="${NOW(fut)}"${rel}`; });
  // 2) прямые адреса (вне data-release-href)
  for (const [fut, now] of Object.entries(FL)) {
    const re = new RegExp(`(?<!data-release-href=")${reEsc(fut)}(?![\\w-])`, "g");
    s = s.replace(re, () => { falconStats.direct++; return now; });
  }
  // 2б) адреса, которые скрипты собирают как SHOP + 'путь': сравнение в подвале главной — свой блок #compare, остальное — по таблице
  s = s.replace(/'<li><a href="' \+ SHOP \+ 'compare">/g, () => { falconStats.direct++; return `'<li><a href="#compare">`; });
  s = s.replace(/' \+ SHOP \+ '([\w-]+)/g, (m, p) => { const u = "https://falcon-bike.ru/" + p; if (!FL[u]) return m; falconStats.direct++; return FL[u]; });
  // 3) адреса моделей, которые собираются скриптом: SHOP + LIVE[slug]
  s = s.replace(/("lynx-x":\s*)"lynx-x"/g, `$1"${NOW("https://falcon-bike.ru/lynx-x").replace("https://falcon-bike.ru/", "")}"`);
  s = s.replace(/("surge-v":\s*)"surge-v"/g, `$1"${NOW("https://falcon-bike.ru/surge-v")}"`);
  s = s.replace(/SHOP \+ \(LIVE\[([\w.]+)\] \|\| ""\)/g, (_, k) => `(/^https?:/.test(LIVE[${k}] || "") ? LIVE[${k}] : SHOP + (LIVE[${k}] || ""))`);
  for (const [fut, a, b] of FALCON_TEXT) if (FL[fut]) s = s.split(a).join(b);
  if (/claude\.ai\/artifact/.test(s)) throw new Error("остались ссылки на прототип Claude");
  return s;
}
for (const file of walk(join(DIST, "site", "rep")).concat(walk(join(DIST, "site", "assets")))) {
  if (![".html", ".js"].includes(extname(file))) continue;
  const s0 = readFileSync(file, "utf8"), s = falconLinks(s0);
  if (s !== s0) writeFileSync(file, s);
}
for (const f of ["rep/index.html", "rep/blog.html"]) {
  const s = readFileSync(join(DIST, "site", f), "utf8");
  if (/(?<!: )SHOP \+ \(LIVE\[/.test(s) || /"surge-v":\s*"surge-v"/.test(s)) { console.error("Не заменены адреса моделей в " + f); process.exit(1); }
}
console.log(`Ссылки Falcon: заглушек заменено ${falconStats.placeholders}, прямых адресов ${falconStats.direct}`);

// Заявки: формы отправляют данные через приёмник Тильды (overrides/lead-bridge.js + lead-sink.js).
// «Заявка принята» — только после подтверждения Тильды; при сбое — сообщение с телефоном. Пометка прототипа убирается.
mkdirSync(join(DIST, "tilda"), { recursive: true });
cpSync(join(ROOT, "overrides", "lead-sink.js"), join(DIST, "tilda", "lead-sink.js"));
cpSync(join(ROOT, "overrides", "lead-bridge.js"), join(DIST, "site", "rep", "lead-bridge.js"));
// Страница успеха /spasibo (решение Михаила 29.10): после подтверждения Тильды форма переходит сюда (overrides/thanks.js).
// Шапка и подвал — как у страницы «Производство»; содержимое рисует thanks.js по сводке заявки (без персональных данных).
cpSync(join(ROOT, "overrides", "thanks.js"), join(DIST, "site", "rep", "thanks.js"));
{
  let t = readFileSync(join(DIST, "site", "rep", "factory.html"), "utf8");
  const a = t.indexOf('<main id="main">'), b = t.indexOf("</main>");
  if (a < 0 || b < 0) { console.error("factory.html: не найден <main> для страницы успеха"); process.exit(1); }
  t = t.slice(0, a) + '<main id="main"><div id="ty-root"></div></main>\n<script data-ty>document.addEventListener("DOMContentLoaded",function(){var r=document.getElementById("ty-root");if(r&&window.B79_THANKS_RENDER)r.outerHTML=window.B79_THANKS_RENDER("79bike");});</script>' + t.slice(b + 7);
  t = t.replace(/<title>[^<]*<\/title>/, "<title>Заявка принята — 79BIKE</title>")
    .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Заявка принята. Специалист 79BIKE свяжется с вами.">')
    .replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex, nofollow">')
    .replace('data-page="rep-warranty"', 'data-page="rep-thanks"');
  writeFileSync(join(DIST, "site", "rep", "spasibo.html"), t);
}
{
  const p = join(DIST, "site", "assets", "app.js");
  let s = readFileSync(p, "utf8");
  const OLD = `    msg.classList.add("is-ok");
    msg.innerHTML = icon("check") + "<span>" + esc(ok) + " " + esc(PROTO_NOTE) + "</span>";
    form.dispatchEvent(new CustomEvent("demo:submitted", { bubbles: true }));`;
  const NEW = `    var sb = form.querySelector('button[type="submit"], button:not([type])');
    var fin = function (sent) {
      if (sb) { sb.disabled = false; sb.removeAttribute("aria-busy"); }
      msg.className = "form-msg";
      if (sent) {
        var ty = window.B79_THANKS && window.B79_THANKS(form, "79bike");
        if (ty) { location.href = ty; return; }
        msg.classList.add("is-ok");
        msg.innerHTML = icon("check") + "<span>" + esc(ok) + "</span>";
        form.dispatchEvent(new CustomEvent("demo:submitted", { bubbles: true }));
      } else {
        msg.classList.add("is-error");
        msg.innerHTML = "Не удалось отправить заявку. Позвоните нам: <a href=\\"tel:+79999005588\\">+7 999 900-55-88</a> или напишите в <a href=\\"https://wa.me/79999005588\\" target=\\"_blank\\" rel=\\"noopener\\">WhatsApp</a> или <a href=\\"https://vk.me/79bike\\" target=\\"_blank\\" rel=\\"noopener\\">VK</a>.";
      }
    };
    if (!window.B79_LEAD) { fin(false); return; }
    if (sb) { sb.disabled = true; sb.setAttribute("aria-busy", "true"); }
    msg.textContent = "Отправляем заявку…";
    var hint = setTimeout(function () { if (/Отправляем/.test(msg.textContent)) msg.textContent = "Отправляем заявку… Если появилось окно «Я не робот» — подтвердите его, и заявка уйдёт."; }, 8000);
    window.B79_LEAD(form, function (sent) { clearTimeout(hint); fin(sent); });`;
  if (!s.includes(OLD)) { console.error("app.js: не найден блок успешной отправки формы"); process.exit(1); }
  s = s.replace(OLD, NEW).replace('var PROTO_NOTE = "В прототипе заявка никуда не отправляется.";', 'var PROTO_NOTE = "";');
  writeFileSync(p, s);
}
const LEAD = `<script src="lead-bridge.js?v=${VERSION}"></script>`;
const THANKS = `<script src="thanks.js?v=${VERSION}"></script>`; // только там, где есть формы (главная) и на самой странице успеха

let htmlCount = 0;
for (const file of walk(join(DIST, "site"))) {
  if (extname(file) !== ".html") continue;
  let s = readFileSync(file, "utf8");
  if (file.includes(`${join("site", "rep")}`)) {
    s = s.replace(/<\/body>/i, KINESCOPE + "\n" + LEAD + (/(index|spasibo)\.html$/.test(file) ? "\n" + THANKS : "") + "\n</body>");
    if (s.includes(HERO_OLD)) s = s.replace(HERO_OLD, HERO_NEW);
    else if (file.endsWith(join("rep", "index.html"))) { console.error("Не найден выбор ролика первого экрана в index.html"); process.exit(1); }
    s = s.replace(/\s*<p class="dlg__fine">В прототипе заявка никуда не отправляется\.<\/p>/g, "");
    s = s.replace("Видео открываются на YouTube.", "Ролики 79BIKE и Y-VOLT открываются прямо на сайте, остальные — на YouTube.");
  }
  // 1) тестовая версия не индексируется
  s = s.replace(/<meta name="robots"[^>]*>\s*/gi, "");
  s = s.replace(/<head>/i, `<head>\n<meta name="robots" content="noindex, nofollow">\n<meta name="x-build" content="${VERSION}">`);
  // 2) единый сброс кэша: все локальные ?v=… в CSS/JS заменяем на версию сборки
  s = s.replace(/((?:src|href)="(?!https?:|\/\/)[^"?#]+\.(?:css|js))(\?v=[^"]*)?"/g, `$1?v=${VERSION}"`);
  // 3) совместимость с iframe
  s = s.replace(/<\/body>/i, FRAME_COMPAT + "\n</body>");
  writeFileSync(file, s);
  htmlCount++;
}

// Корень Pages: перенаправление на главную + версия для загрузчика Tilda
writeFileSync(join(DIST, "index.html"), `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>79BIKE — тестовая сборка</title><meta http-equiv="refresh" content="0; url=${PAGE}"><a href="${PAGE}">Открыть главную</a>`);
writeFileSync(join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
writeFileSync(join(DIST, ".nojekyll"), "");
const meta = { version: VERSION, commit, builtAt: new Date().toISOString(), page: PAGE };
writeFileSync(join(DIST, "version.json"), JSON.stringify(meta, null, 2));

// Код для блока T123 с подставленным адресом сборки
const t123 = readFileSync(join(ROOT, "tilda", "t123.html"), "utf8").replace("__PUBLIC_BASE__", PUBLIC_BASE || "__PUBLIC_BASE__");
writeFileSync(join(DIST, "tilda-t123.html"), t123);

if (!existsSync(join(DIST, PAGE))) { console.error("Нет главной страницы: " + PAGE); process.exit(1); }
console.log(`Сборка ${VERSION}: ${htmlCount} HTML, база ${PUBLIC_BASE || "(не задана)"}`);
