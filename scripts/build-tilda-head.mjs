// Код для «Настройки сайта → Вставка кода → HTML-код для вставки внутрь HEAD» проекта 79bike.ru (Тильда 13481273).
// Решение SEO-79-02 (29.10.2026, согласовано Михаилом): Яндекс Метрика — только после «Принять» в баннере cookie,
// на всех страницах сайта (и новых, и старых). Баннер и счётчик живут здесь, на уровне проекта.
// В новых страницах есть своя копия баннера — она не запускается (window.CookieConsent уже создан здесь).
// Запуск: node scripts/build-tilda-head.mjs → dist-native/live/tilda-head.html
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { minify as terser } from "terser";
import { minify as csso } from "csso";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const METRIKA_ID = 102316370; // счётчик «79bike.ru». 101107975 — счётчик FALCON-bike.ru, на 79bike.ru не ставим.

let js = readFileSync(join(ROOT, "src/rep/cookie-banner.js"), "utf8");
const stub = 'document.documentElement.setAttribute("data-metrika", "allowed");';
if (!js.includes(stub)) throw new Error("не нашёл место для загрузчика Метрики в cookie-banner.js");
const loader = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    window.ym(CFG.metrikaId,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,ecommerce:"dataLayer"});
    ${stub}`;
js = js.replace(stub, loader);

// Цель «Заявка с сайта»: успешная отправка любой формы Тильды (в т. ч. скрытой формы, через которую уходят заявки новых страниц).
const goals = `(function(){function ok(e){var f=e&&e.target,id=f&&(f.id||(f.closest&&f.closest(".t-rec")||{}).id)||"";try{window.CookieConsent&&window.CookieConsent.goal("form_submit",{form:id})}catch(x){}}
document.addEventListener("tildaform:aftersuccess",ok,true);
if(window.jQuery)try{window.jQuery(document).on("tildaform:aftersuccess",ok)}catch(x){}
document.addEventListener("DOMContentLoaded",function(){if(window.jQuery)try{window.jQuery(document).off("tildaform:aftersuccess",ok).on("tildaform:aftersuccess",ok)}catch(x){}});})();`;

const cfg = `window.COOKIE_BANNER_CONFIG={policyUrl:"https://79bike.ru/policy",operator:"ИП Тимоховым М. С.",metrikaId:${METRIKA_ID}};`;
const jsMin = (await terser(cfg + "\n" + js + "\n" + goals, { compress: { passes: 1 }, mangle: true, format: { comments: false } })).code;
const cssMin = csso(readFileSync(join(ROOT, "src/rep/cookie-banner.css"), "utf8"), { restructure: false }).css;

const out = `<!-- 79BIKE: баннер cookie и Яндекс Метрика (счётчик ${METRIKA_ID}) только после согласия. Собрано scripts/build-tilda-head.mjs, ${new Date().toISOString().slice(0, 10)}. Не править вручную — правки в репозитории 79bike-tilda-test. Прежний код (счётчик 101107975 без согласия) — overrides/tilda-head-old-2910.html -->
<style data-b79="cookie-banner">${cssMin}</style>
<script data-b79="cookie-banner">${jsMin.replace(/<\/script/gi, "<\\/script")}</script>
`;
mkdirSync(join(ROOT, "dist-native/live"), { recursive: true });
writeFileSync(join(ROOT, "dist-native/live/tilda-head.html"), out);
console.log(`tilda-head.html: ${out.length} символов`);
