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
// SITE=falcon → тот же код для проекта falcon-bike.ru (Тильда 12863191), счётчик 101107975 (решение F5 плана переноса Falcon).
const FALCON = process.env.SITE === "falcon";
const METRIKA_ID = FALCON ? 101107975 : 102316370; // 102316370 — «79bike.ru», 101107975 — «falcon-bike.ru»; чужой счётчик на сайт не ставим.
const POLICY = FALCON ? "https://falcon-bike.ru/privacy" : "https://79bike.ru/policy";
// 101183217 — счётчик карточки «Falcon-bike — онлайн-организация» Яндекс Бизнеса (стоял в «Аналитике» Тильды без согласия) — тоже только после согласия.
const OUT = FALCON ? "dist-native/falcon/tilda-head.html" : "dist-native/live/tilda-head.html";

let js = readFileSync(join(ROOT, "src/rep/cookie-banner.js"), "utf8");
const stub = 'document.documentElement.setAttribute("data-metrika", "allowed");';
if (!js.includes(stub)) throw new Error("не нашёл место для загрузчика Метрики в cookie-banner.js");
const loader = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    window.ym(CFG.metrikaId,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,ecommerce:"dataLayer"});
    (CFG.metrikaExtra||[]).forEach(function(x){window.ym(x,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true})});
    ${stub}`;
js = js.replace(stub, loader);

// 30.10.2026 (Михаил): «Метрика сразу должна включаться без согласия» — для обоих сайтов.
// Метрика грузится при открытии страницы; баннер — уведомление с одной кнопкой «Понятно», текст без обещания «только с согласия».
const ALWAYS = process.env.METRIKA_AFTER_CONSENT !== "1";
if (ALWAYS) {
  const rep = (a, b) => { if (!js.includes(a)) throw new Error("cookie-banner.js изменился: " + a.slice(0, 50)); js = js.replace(a, b); };
  rep('if (rec && rec.a) loadMetrika();      // согласие уже дано — Метрика грузится сразу, баннер не показываем\n    else if (!rec) show();', 'loadMetrika(); if (!rec) show();');
  rep(`'Аналитические (Яндекс Метрика) помогают понять, какие страницы полезны, — включим их только с вашего согласия. ' +
      'Нажимая «Принять», вы соглашаетесь на обработку ' + esc(CFG.operator) + ' данных cookie для статистики посещений. ' +
      'Отказ не влияет на работу сайта. Подробнее`, `'Аналитические (Яндекс Метрика) помогают понять, какие страницы полезны. ' +
      'Продолжая пользоваться сайтом, вы соглашаетесь на обработку ' + esc(CFG.operator) + ' данных cookie для статистики посещений. Подробнее`);
  rep(`'<p class="cb__text cb__text--short">Используем cookie. Яндекс Метрику включим только с вашего согласия — ' +
      'отказ не влияет на работу сайта. <a href="' + p + '">Подробнее</a></p>'`, `'<p class="cb__text cb__text--short">Используем cookie и Яндекс Метрику для статистики посещений. <a href="' + p + '">Подробнее</a></p>'`);
  rep(`'<button type="button" class="cb__btn cb__btn--no" data-cb="no">Отказаться</button>' +
      '<button type="button" class="cb__btn cb__btn--yes" data-cb="yes">Принять</button>'`, `'<button type="button" class="cb__btn cb__btn--yes" data-cb="yes">Понятно</button>'`);
}

// Цель «Заявка с сайта»: успешная отправка любой формы Тильды (в т. ч. скрытой формы, через которую уходят заявки новых страниц).
const goals = `(function(){function ok(e){var f=e&&e.target,id=f&&(f.id||(f.closest&&f.closest(".t-rec")||{}).id)||"";try{window.CookieConsent&&window.CookieConsent.goal("form_submit",{form:id})}catch(x){}}
document.addEventListener("tildaform:aftersuccess",ok,true);
if(window.jQuery)try{window.jQuery(document).on("tildaform:aftersuccess",ok)}catch(x){}
document.addEventListener("DOMContentLoaded",function(){if(window.jQuery)try{window.jQuery(document).off("tildaform:aftersuccess",ok).on("tildaform:aftersuccess",ok)}catch(x){}});})();`;

const cfg = `window.COOKIE_BANNER_CONFIG={policyUrl:"${POLICY}",operator:"ИП Тимоховым М. С.",metrikaId:${METRIKA_ID}${FALCON ? ",metrikaExtra:[101183217]" : ""}};`;
const jsMin = (await terser(cfg + "\n" + js + "\n" + goals, { compress: { passes: 1 }, mangle: true, format: { comments: false } })).code;
const cssMin = csso(readFileSync(join(ROOT, "src/rep/cookie-banner.css"), "utf8"), { restructure: false }).css;

const out = `<!-- ${FALCON ? "FALCON-BIKE" : "79BIKE"}: баннер cookie и Яндекс Метрика (счётчик ${METRIKA_ID}) ${ALWAYS ? "сразу при открытии страницы, баннер — уведомление" : "только после согласия"}. Собрано scripts/build-tilda-head.mjs, ${new Date().toISOString().slice(0, 10)}. Не править вручную — правки в репозитории 79bike-tilda-test. Прежний код (счётчик 101107975 без согласия) — overrides/tilda-head-old-2910.html -->
<style data-b79="cookie-banner">${cssMin}</style>
<script data-b79="cookie-banner">${jsMin.replace(/<\/script/gi, "<\\/script")}</script>
`;
// 01.11.2026: карточки товаров магазина (/tproduct/) Тильда отдаёт без шапки и подвала проекта — оформление нового дизайна держим в HEAD проекта Falcon
const outAll = FALCON ? out + readFileSync(join(ROOT, "overrides/falcon-tproduct-skin.html"), "utf8") : out;
mkdirSync(dirname(join(ROOT, OUT)), { recursive: true });
writeFileSync(join(ROOT, OUT), outAll);
console.log(`tilda-head.html: ${out.length} символов`);
