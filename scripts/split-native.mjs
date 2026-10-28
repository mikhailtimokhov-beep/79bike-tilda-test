// Нарезка нативной страницы на блоки T123 Тильды.
// У Тильды есть предел размера одного блока T123 (50 КБ сохраняются, ~100 КБ — уже нет), поэтому страница
// раскладывается на несколько блоков подряд, каждый до LIMIT символов, по безопасным границам:
// стили — по CSS-правилам, скрипты — целиком (сжатые), разметка — по элементам верхнего уровня.
// Обёртки Тильды вокруг блоков делаются «прозрачными» (display: contents), чтобы блоки вели себя как одна страница.
import { minify as terser } from "terser";
import { minify as cssoMinify } from "csso";

export const LIMIT = 40000;
const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "wbr", "track", "base", "param"]);

// разбор на узлы верхнего уровня (теги, текст, комментарии; script/style/textarea — как сырой текст)
export function topLevel(html) {
  const out = []; let i = 0, depth = 0, start = 0;
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) { if (depth === 0) { if (m.index > start) out.push(html.slice(start, m.index)); out.push(m[0]); start = re.lastIndex; } continue; }
    const close = m[1] === "/", name = m[2].toLowerCase(), self = m[4] === "/" || VOID.has(name);
    if (!close && (name === "script" || name === "style" || name === "textarea")) {
      const end = html.indexOf(`</${name}`, re.lastIndex); const endTag = html.indexOf(">", end) + 1;
      if (depth === 0) { if (m.index > start) out.push(html.slice(start, m.index)); out.push(html.slice(m.index, endTag)); start = endTag; }
      re.lastIndex = endTag; continue;
    }
    if (close) { depth--; if (depth === 0) { out.push(html.slice(start, re.lastIndex)); start = re.lastIndex; } }
    else if (self) { if (depth === 0) { if (m.index > start) out.push(html.slice(start, m.index)); out.push(m[0]); start = re.lastIndex; } }
    else { if (depth === 0 && m.index > start) { out.push(html.slice(start, m.index)); start = m.index; } depth++; }
  }
  if (start < html.length) out.push(html.slice(start));
  return out.filter((x) => x.trim());
}

function splitCss(css) {
  // правила верхнего уровня (с учётом вложенных @media {...})
  const rules = []; let depth = 0, s = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { rules.push(css.slice(s, i + 1)); s = i + 1; } }
    else if (c === ";" && depth === 0) { rules.push(css.slice(s, i + 1)); s = i + 1; } // @import/@charset
  }
  if (s < css.length && css.slice(s).trim()) rules.push(css.slice(s));
  return rules;
}

async function shrink(unit) {
  const st = /^<style([^>]*)>([\s\S]*)<\/style>$/.exec(unit);
  if (st) { const min = cssoMinify(st[2], { restructure: false }).css; return `<style${st[1]}>${min}</style>`; }
  const sc = /^<script([^>]*)>([\s\S]*)<\/script>$/.exec(unit);
  if (sc && !/(^|\s)src=/.test(sc[1])) {
    if (/application\/ld\+json/.test(sc[1])) { try { return `<script${sc[1]}>${JSON.stringify(JSON.parse(sc[2]))}</script>`; } catch { return unit; } }
    if (/type="(?!text\/javascript)/.test(sc[1])) return unit;
    const r = await terser(sc[2], { compress: { passes: 1 }, mangle: true, format: { max_line_len: 800, comments: false } });
    return `<script${sc[1]}>${r.code.replace(/<\/script/gi, "<\\/script")}</script>`;
  }
  return unit;
}

const GLUE = '<style data-b79-glue>.t-rec:has(>.t123 .b79-part),.t-rec:has(>.t123 .b79-part) .t123,.t-rec:has(>.t123 .b79-part) .t-container_100,.t-rec:has(>.t123 .b79-part) .t-width{display:contents}.t-rec:has(>.t123 .b79-part){padding:0!important}</style>';

function hasFn(v) { if (typeof v === "function") return true; if (v && typeof v === "object") return Object.values(v).some(hasFn); return false; }

let jsSeq = 0;
export async function toParts(fragment, limit = LIMIT) {
  let units = topLevel(fragment);
  units = await Promise.all(units.map(shrink));
  // слишком большие стили — режем по правилам
  const flat = [];
  for (const u of units) {
    if (u.length <= limit) { flat.push(u); continue; }
    const st = /^<style([^>]*)>([\s\S]*)<\/style>$/.exec(u);
    if (st) {
      let cur = "";
      for (const r of splitCss(st[2])) {
        if (cur && cur.length + r.length > limit - 200) { flat.push(`<style${st[1]}>${cur}</style>`); cur = ""; }
        cur += r;
      }
      if (cur) flat.push(`<style${st[1]}>${cur}</style>`);
      continue;
    }
    // большой скрипт с данными (window.X = {...}): режем JSON на куски по разным <script>, в конце собираем обратно
    const sc = /^<script([^>]*)>([\s\S]*)<\/script>$/.exec(u);
    if (sc) {
      const vm = await import("node:vm");
      const win = {}; let pure = true; const data = {};
      try { vm.runInNewContext(sc[2], { window: win }, { timeout: 2000 }); } catch { pure = false; }
      for (const [k, v] of Object.entries(win)) {
        if (hasFn(v)) { pure = false; break; }
        data[k] = JSON.stringify(v);
      }
      if (pure && Object.keys(data).length) {
        for (const [k, j] of Object.entries(data)) {
          const id = "__b79_" + k, step = Math.floor((limit - 600) / 2);   // запас на экранирование
          for (let a = 0; a < j.length;) {
            let b = Math.min(a + step, j.length);
            const c = j.charCodeAt(b - 1); if (c >= 0xd800 && c <= 0xdbff) b++; // не разрывать суррогатную пару
            flat.push(`<script>window.${id}=(window.${id}||"")+${JSON.stringify(j.slice(a, b)).replace(/<\/script/gi, "<\\/script")};</script>`);
            a = b;
          }
          flat.push(`<script>window.${k}=JSON.parse(window.${id});delete window.${id};</script>`);
        }
        continue;
      }
      // большой скрипт с кодом: текст кода режем на строки по разным <script>, затем выполняем его
      // глобальным eval — так же, как обычный <script> (глобальные функции и переменные сохраняются)
      if (!/(^|\s)src=|type="(?!text\/javascript)/.test(sc[1])) {
        const id = "__b79_js" + (++jsSeq), code = sc[2].replace(/<\\\/script/gi, "</script"), step = Math.floor((limit - 600) / 2);
        for (let a = 0; a < code.length;) {
          let b = Math.min(a + step, code.length);
          const c = code.charCodeAt(b - 1); if (c >= 0xd800 && c <= 0xdbff) b++;
          flat.push(`<script>window.${id}=(window.${id}||"")+${JSON.stringify(code.slice(a, b)).replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--")};</script>`);
          a = b;
        }
        flat.push(`<script${sc[1]}>(0,eval)(window.${id});delete window.${id};</script>`);
        continue;
      }
    }
    // большой элемент разметки (например, <main> главной): дочерние разделы раскладываем по блокам;
    // первая группа — внутри исходного тега, остальные — в «прозрачных» продолжениях (display: contents)
    const el = /^<([a-zA-Z][\w-]*)([^>]*)>([\s\S]*)<\/\1>\s*$/.exec(u.trim());
    if (el && !/^(script|style|textarea)$/i.test(el[1])) {
      const kids = topLevel(el[3]);
      if (kids.every((k) => k.length < limit - 300)) {
        let cur = "", first = true;
        const flush = () => { flat.push(first ? `<${el[1]}${el[2]}>${cur}</${el[1]}>` : `<div class="b79-cont" data-cont="${el[1]}" style="display:contents">${cur}</div>`); first = false; cur = ""; };
        for (const k of kids) { if (cur && cur.length + k.length > limit - 300) flush(); cur += k; }
        if (cur) flush();
        continue;
      }
    }
    throw new Error(`часть больше ${limit} символов и не делится: ${u.slice(0, 80)}… (${u.length})`);
  }
  // раскладываем по блокам
  const parts = []; let cur = [];
  const size = (arr) => arr.reduce((s, x) => s + x.length, 0);
  for (const u of flat) {
    if (cur.length && size(cur) + u.length + 60 > limit) { parts.push(cur); cur = []; }
    cur.push(u);
  }
  if (cur.length) parts.push(cur);
  return parts.map((p, i) => `<div class="b79-part" data-part="${i + 1}/${parts.length}" style="display:contents">\n${i === 0 ? GLUE + "\n" : ""}${p.join("\n")}\n</div>`);
}
