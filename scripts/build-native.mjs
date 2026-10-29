// Нативная сборка для Тильды: каждая страница — один фрагмент HTML для блока T123, без фрейма.
// Текст лежит прямо в коде страницы (видят поисковики), стили и скрипты встроены, картинки — с сервера Тильды
// (overrides/asset-map.json: путь в сборке → адрес static.tildacdn.com), шрифты встроены в CSS.
// Запуск после node scripts/build.mjs:  TARGET=test|live node scripts/build-native.mjs
// Результат: dist-native/<target>/<page>.html (+ settings.json — title, description и адрес для настроек страницы в Тильде).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, normalize, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = join(ROOT, "dist", "site");
const TARGET = process.env.TARGET || "test";
const OUT = join(ROOT, "dist-native", TARGET);
mkdirSync(OUT, { recursive: true });

// адреса страниц на Тильде: на живом 79bike.ru гарантия остаётся по старому адресу /garant
const ROUTES = {
  test: { index: "/", blog: "/blog", warranty: "/warranty", factory: "/factory", instructions: "/instructions" },
  live: { index: "/", blog: "/blog", warranty: "/garant", factory: "/factory", instructions: "/instructions" },
}[TARGET];
const ORIGIN = { test: "https://b79-redesign-test.tilda.ws", live: "https://79bike.ru" }[TARGET];

const MAPF = join(ROOT, "overrides", "asset-map.json");
let AMAP = existsSync(MAPF) ? JSON.parse(readFileSync(MAPF, "utf8")).map : {};
// для локальной проверки: ASSETS=local — картинки берутся из самой сборки (/site/...)
if (process.env.ASSETS === "local") { AMAP = {}; for (const k of Object.keys(JSON.parse(readFileSync(join(ROOT, "overrides", "asset-names.json"), "utf8")).names)) AMAP[k] = "/site/" + k; }
const missing = new Set();
const read = (p) => readFileSync(join(SITE, p), "utf8");

// путь (относительно файла from) → ключ сборки (относительно dist/site)
function key(ref, fromFile) {
  const clean = ref.split("#")[0].split("?")[0];
  return normalize(join(dirname(fromFile), clean)).replace(/\\/g, "/");
}
function asset(ref, fromFile) {
  if (!ref || /^(https?:|data:|mailto:|tel:|#|javascript:|\/\/)/i.test(ref)) return null;
  const k = key(ref, fromFile);
  if (!/\.(webp|jpe?g|png|svg|gif|avif)$/i.test(k)) return null;
  // спрайты иконок встроены в страницу: <use href="…icons.svg#x"> → "#x" (<use> с чужого сервера не работает)
  if (/(^|\/)(icons|bike)\.svg$/.test(k) && ref.includes("#")) return "#" + ref.split("#")[1];
  if (AMAP[k]) return AMAP[k] + (ref.includes("#") ? "#" + ref.split("#")[1] : "");
  missing.add(k);
  return null;
}
function pageLink(ref) {
  const m = /^(?:\.\.\/rep\/|\.\/)?([a-z-]+)\.html(\?[^#]*)?(#.*)?$/.exec(ref);
  if (!m || !(m[1] in ROUTES)) return null;
  const q = new URLSearchParams((m[2] || "").slice(1));
  const s = q.get("s"); q.delete("s"); q.delete("v");
  let path = ROUTES[m[1]];
  if (m[1] === "blog" && s) path = "/blog/" + s;
  const rest = q.toString();
  return path + (rest ? "?" + rest : "") + (m[3] || "");
}

// CSS: url(...) → сервер Тильды; шрифты → встроенные data:
function css(text, fromFile) {
  // у каждого шрифта две одинаковые ссылки (woff2-variations и woff2) — встраиваем один раз;
  // расширенная кириллица на сайте не используется — её @font-face убираем
  text = text.replace(/src:url\(([^)]+\.woff2)\) format\("woff2-variations"\),url\(\1\) format\("woff2"\)/g, 'src:url($1) format("woff2")')
    .replace(/@font-face\{[^}]*cyrillic-ext[^}]*\}/g, "");
  return text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (all, q, ref) => {
    if (/^(data:|https?:|#)/.test(ref)) return all;
    const k = key(ref, fromFile);
    if (/\.woff2$/.test(k)) {
      // шрифт урезан до символов сайта (overrides/fonts, pyftsubset) — в разы меньше, встраивается в страницу
      const sub = join(ROOT, "overrides", "fonts", k.split("/").pop().replace("-wght-normal.woff2", "-sub.woff2"));
      return `url(data:font/woff2;base64,${readFileSync(existsSync(sub) ? sub : join(SITE, k)).toString("base64")})`;
    }
    const a = asset(ref, fromFile);
    return a ? `url("${a}")` : all;
  });
}

// разметка: атрибуты с картинками и ссылками на страницы
function markup(html, fromFile) {
  html = html.replace(/\s(src|poster|data-src|href|data-href)="([^"]*)"/g, (all, attr, v) => {
    const pl = pageLink(v);
    if (pl && /href/.test(attr)) return ` ${attr}="${pl}"`;
    const a = asset(v, fromFile);
    return a ? ` ${attr}="${a}"` : all;
  });
  html = html.replace(/\s(srcset|data-srcset)="([^"]*)"/g, (all, attr, v) => ` ${attr}="${v.split(",").map((part) => {
    const [u, ...d] = part.trim().split(/\s+/); const a = asset(u, fromFile); return [a || u, ...d].join(" ");
  }).join(", ")}"`);
  html = html.replace(/style="([^"]*url\([^"]*)"/g, (all, st) => `style="${css(st.replace(/&quot;/g, "'"), fromFile).replace(/"/g, "&quot;")}"`);
  return html;
}

// переводчик путей для скриптов: картинки и иконки, которые скрипты собирают на ходу
function runtime(page) {
  const code = readFileSync(join(ROOT, "overrides", "native-runtime.js"), "utf8")
    .replace("/*M*/{}", JSON.stringify(AMAP)).replace("/*R*/{}", JSON.stringify(ROUTES))
    .replace("/*P*/{}", JSON.stringify({ "data-page": page.dataPage, "data-root": "" }));
  return `<script data-src="native-runtime">${code}</script>`;
}

const PAGES = ["factory", "instructions", "warranty", "blog", "index"];
const settings = {};
for (const page of PAGES) {
  const file = `rep/${page}.html`;
  const html = read(file);
  const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"));
  const bodyOpen = /<body([^>]*)>/.exec(html);
  let body = html.slice(bodyOpen.index + bodyOpen[0].length, html.lastIndexOf("</body>"));
  const attr = (n) => ((new RegExp(`${n}="([^"]*)"`)).exec(bodyOpen[1]) || [])[1] || "";
  const meta = (n) => ((new RegExp(`<meta[^>]+(?:name|property)="${n}"[^>]+content="([^"]*)"`)).exec(head) || [])[1] || "";

  settings[page] = {
    path: ROUTES[page], title: (/<title>([^<]*)<\/title>/.exec(head) || [])[1] || "",
    description: meta("description"), ogTitle: meta("og:title"), ogDescription: meta("og:description"),
    canonical: ORIGIN + (ROUTES[page] === "/" ? "/" : ROUTES[page]),
  };

  // голова: стили и скрипты по порядку; мета-теги не переносим (они в настройках страницы Тильды)
  const parts = [];
  const re = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>|<style[^>]*>([\s\S]*?)<\/style>|<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  const deferred = [];
  function script(attrs, inline, from) {
    const src = (/src="([^"]+)"/.exec(attrs) || [])[1];
    if (/data-tilda-embed/.test(attrs)) return ""; // совместимость с фреймом не нужна
    if (src) {
      if (/^https?:/.test(src)) return `<script src="${src}"></script>`;
      const k = key(src, from);
      let js = readFileSync(join(SITE, k), "utf8").replace(/<\/script/gi, "<\\/script");
      if (k === "assets/app.js") {
        js = js.replace("return ROOT + path;", "return window.B79_ASSET ? window.B79_ASSET(ROOT + path) : ROOT + path;")
               .replace('if (!window.fetch || location.protocol === "file:") return;', 'if (!window.fetch || location.protocol === "file:" || window.B79_NATIVE) return;');
      }
      const tag = `<script data-src="${k}">${js}</script>`;
      if (/\bdefer\b/.test(attrs)) { deferred.push(tag); return ""; }
      return tag;
    }
    // блог: статью берём из адреса /blog/<статья>, а не только из ?s=
    inline = inline.split('new URLSearchParams(location.search).get("s")').join('(window.B79_BLOG_SLUG || new URLSearchParams(location.search).get("s"))');
    return `<script${attrs}>${inline}</script>`;
  }
  while ((m = re.exec(head))) {
    if (m[1]) { if (/^https?:/.test(m[1])) continue; const k = key(m[1], file); parts.push(`<style data-src="${k}">${css(readFileSync(join(SITE, k), "utf8"), k)}</style>`); }
    else if (m[2] !== undefined) parts.push(`<style>${css(m[2], file)}</style>`);
    else parts.push(script(m[3], m[4], file));
  }

  // тело: разметка + скрипты по месту; defer — в самый конец
  // разметку обрабатываем отдельно от скриптов: строки внутри кода не трогаем (их чинит переводчик путей на лету)
  // первый экран: на Тильде ролик нельзя положить на её сервер — показываем его через Kinescope (фоновый режим:
  // без кнопок, без звука, по кругу). На телефоне — вертикальная версия, на планшете и ПК — горизонтальная.
  const KIN = existsSync(join(ROOT, "overrides", "hero-kinescope.json")) ? JSON.parse(readFileSync(join(ROOT, "overrides", "hero-kinescope.json"), "utf8")) : null;
  if (page === "index" && KIN && KIN.desktop) {
    const vre = /<video class="hv__video" id="hv-video"[^>]*><\/video><script>[\s\S]*?<\/script>/;
    if (!vre.test(body)) throw new Error("первый экран: не найден <video id=hv-video>");
    const cfg = JSON.stringify({ d: KIN.desktop, p: KIN.phone || KIN.desktop, da: KIN.desktopAspect || 16 / 9, pa: KIN.phone ? (KIN.phoneAspect || 9 / 16) : (KIN.desktopAspect || 16 / 9) });
    body = body.replace(vre, `<div class="hv__video hv__kin" id="hv-kin" aria-hidden="true" style="overflow:hidden;background-image:url('hero/poster.jpg')"></div>` +
      `<script>(function(){var c=${cfg},w=document.getElementById("hv-kin");if(!w)return;var p=window.matchMedia&&matchMedia("(max-width: 600px)").matches,a=p?c.pa:c.da,f=document.createElement("iframe");` +
      `f.src="https://kinescope.io/embed/"+(p?c.p:c.d)+"?background=1";f.title="Видео";f.setAttribute("allow","autoplay; fullscreen; picture-in-picture; encrypted-media");f.setAttribute("tabindex","-1");f.setAttribute("frameborder","0");` +
      `f.style.cssText="position:absolute;left:50%;top:50%;border:0;pointer-events:none;transform:translate(-50%,-50%)";w.appendChild(f);` +
      `function fit(){var W=w.clientWidth,H=w.clientHeight;if(!W||!H)return;if(W/H>a){f.style.width=W+"px";f.style.height=Math.ceil(W/a)+"px"}else{f.style.height=H+"px";f.style.width=Math.ceil(H*a)+"px"}}fit();addEventListener("resize",fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(w)})();</script>`);
    // кнопка звука не нужна: фоновый режим Kinescope всегда без звука
    body = body.replace(/<button type="button" class="hv__snd"[\s\S]*?<\/button>/, "");
  }
  body = body.split(/(<script[^>]*>[\s\S]*?<\/script>)/g).map((seg) => {
    const sm = /^<script([^>]*)>([\s\S]*?)<\/script>$/.exec(seg);
    return sm ? script(sm[1], sm[2], file) : markup(seg, file);
  }).join("");
  // спрайты иконок — прямо в страницу (с чужого сервера <use> не работает)
  const sprites = ["assets/icons.svg", "assets/bike.svg"].filter((s) => page === "index" || body.includes(s.split("/")[1]))
    .map((s) => read(s).replace(/<\?xml[^>]*>/, "").replace(/<svg/, '<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"')).join("");
  const out = `<!-- 79BIKE · ${page} · нативная сборка для T123 (${TARGET}). Не редактировать вручную: правки — в репозитории 79bike-tilda-test. -->\n` +
    runtime({ dataPage: attr("data-page") }) + "\n" + `<script data-src="lead-sink">${readFileSync(join(ROOT, "overrides", "lead-sink.js"), "utf8")}</script>` + "\n" + parts.join("\n") + "\n" + sprites + "\n" + body + "\n" + deferred.join("\n");
  writeFileSync(join(OUT, `${page}.html`), out);
  settings[page].bytes = Buffer.byteLength(out);
}
// Предрендер: блоки, которые наполняют скрипты, сохраняем готовым HTML — текст видят поисковики без выполнения JavaScript.
// Скрипты при загрузке перерисовывают те же блоки (innerHTML), поэтому дублей нет — это проверяет check-native.mjs (объём текста).
const PRE = {
  index: ["dd-models", "menu-models", "hero-lineup", "hot-list", "brand-facts", "model-cards", "picker", "cfg", "sel-panel", "sel-revs", "compare-table", "dealer-list", "terms", "pluses", "rep-blog-cards", "rep-events", "rep-faq", "contacts-messengers", "footer-social", "footer-models"],
  blog: ["main"],
};
const BLOG = (() => { const w = {}; new Function("window", read("rep/blog.js"))(w); return w.REP_BLOG; })();
if (process.env.PRERENDER !== "0") {
  const { createServer } = await import("node:http");
  const { chromium } = await import("playwright");
  const shell = (frag) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body class="t-body"><div class="t-records"><div class="r t-rec"><div class="t123">${frag}</div></div></div></body></html>`;
  let current = "";
  const srv = createServer((q, r) => {
    const u = decodeURIComponent(q.url.split("?")[0]);
    if (!/\.[a-z0-9]+$/.test(u)) { r.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); return r.end(shell(current)); }
    const f = join(ROOT, "dist", u); if (!existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200); r.end(readFileSync(f));
  }).listen(8803);
  const browser = await chromium.launch();
  async function render(frag, path, ids) {
    current = frag;
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pg.route(/^https?:\/\/(?!127)/, (x) => x.abort());
    await pg.goto("http://127.0.0.1:8803" + path, { waitUntil: "load" });
    await pg.waitForTimeout(500);
    const got = await pg.evaluate((ids) => { const o = {}; ids.forEach((id) => { const e = document.getElementById(id); if (e) o[id] = e.innerHTML; }); return o; }, ids);
    await pg.close();
    for (const [id, inner] of Object.entries(got)) {
      const re = new RegExp(`(<([a-z]+)[^>]*\\sid="${id}"[^>]*>)\\s*(</\\2>)`);
      if (re.test(frag)) frag = frag.replace(re, (all, open, tag, close) => open + inner + close);
    }
    return frag;
  }
  for (const page of Object.keys(PRE)) {
    const f = join(OUT, `${page}.html`);
    const pre = await render(readFileSync(f, "utf8"), ROUTES[page], PRE[page]);
    writeFileSync(f, pre); settings[page].bytes = Buffer.byteLength(pre);
  }
  // статьи блога — отдельные страницы /blog/<статья>
  for (const post of BLOG.posts) {
    const base = readFileSync(join(OUT, "blog.html"), "utf8").replace(/(<main[^>]*id="main"[^>]*>)[\s\S]*?(<\/main>)/, "$1$2");
    const pre = await render(base, "/blog/" + post.slug, ["main"]);
    const name = `blog--${post.slug}`;
    writeFileSync(join(OUT, `${name}.html`), pre);
    settings[name] = { path: "/blog/" + post.slug, title: (post.seoTitle || post.title) + " | Блог 79BIKE", description: post.description || post.lead || "", canonical: ORIGIN + "/blog/" + post.slug, bytes: Buffer.byteLength(pre) };
  }
  await browser.close(); srv.close();
}
// нарезка на блоки T123
const { toParts, LIMIT } = await import("./split-native.mjs");
const { rmSync } = await import("node:fs");
for (const name of Object.keys(settings)) {
  const parts = await toParts(readFileSync(join(OUT, `${name}.html`), "utf8"));
  const dir = join(OUT, name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  parts.forEach((p, i) => writeFileSync(join(dir, `${String(i + 1).padStart(2, "0")}.html`), p));
  // предпросмотр: блоки в тех же обёртках, что делает Тильда, — для проверки в браузере до вставки
  writeFileSync(join(dir, "preview.html"), `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Предпросмотр · ${name}</title><style>body{margin:0}</style></head><body class="t-body"><div id="allrecords" class="t-records">` +
    parts.map((p, i) => `<div id="rec${i + 1}" class="r t-rec" data-record-type="131"><div class="t123"><div class="t-container_100 "><div class="t-width t-width_100 ">${p}</div></div></div></div>`).join("\n") + `</div></body></html>`);
  settings[name].parts = parts.length; settings[name].partSizes = parts.map((p) => p.length);
  if (parts.some((p) => p.length > LIMIT + 200)) { console.error("Блок больше предела: " + name); process.exit(1); }
}
writeFileSync(join(OUT, "settings.json"), JSON.stringify(settings, null, 2));
for (const [p, s] of Object.entries(settings)) console.log(`${p.padEnd(13)} ${(s.bytes / 1024).toFixed(0).padStart(5)} КБ → блоков T123: ${s.parts} (${s.partSizes.map((x) => Math.round(x / 1024)).join("+")} КБ)  ${s.path}`);
if (missing.size) { console.log(`\nНет на сервере Тильды (${missing.size}): ` + [...missing].slice(0, 12).join(", ") + (missing.size > 12 ? " …" : "")); if (process.env.STRICT) process.exit(1); }
