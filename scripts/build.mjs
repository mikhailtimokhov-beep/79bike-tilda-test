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

let htmlCount = 0;
for (const file of walk(join(DIST, "site"))) {
  if (extname(file) !== ".html") continue;
  let s = readFileSync(file, "utf8");
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
