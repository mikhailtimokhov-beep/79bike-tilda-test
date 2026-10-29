/* Cookie-баннер для falcon-bike.ru и 79bike.ru. Черновик от 26.10.2026, НЕ подключён.
 *
 * Подключение (после согласования с владельцем):
 *   <link rel="stylesheet" href="assets/cookie-banner.css">
 *   <script>window.COOKIE_BANNER_CONFIG = { policyUrl: "privacy.html#cookie", operator: "ИП Тимоховым М. С.", metrikaId: 00000000 };</script>
 *   <script src="assets/cookie-banner.js" defer></script>
 * На Tilda: оба файла — во внешний блок T123 (HTML) в подвале всех страниц;
 * счётчик Метрики НЕ вписывать в «Настройки сайта → Аналитика» (там он грузится без согласия).
 *
 * Что делает:
 *  - до выбора посетителя Метрика не загружается; «Принять» -> loadMetrika(), «Отказаться» -> не загружается;
 *  - выбор хранится в localStorage (ключ cookie-consent) 12 месяцев; при смене версии текста баннер покажется снова;
 *  - если localStorage недоступен (приватный режим, запрет) — выбор живёт до закрытия вкладки, баннер покажется снова;
 *  - ссылка «Настройки cookie» в подвале: любой элемент с атрибутом data-cookie-settings или href="#cookie-settings";
 *  - отзыв согласия: удаляет cookie _ym* этого сайта и перезагружает страницу, если Метрика уже работала;
 *  - баннер поднимается над фиксированной нижней панелью (.dock и др.) на телефоне.
 *
 * API: window.CookieConsent.open() — показать баннер; .analytics() — true/false/null (нет выбора);
 *      .onAnalytics(fn) — вызвать fn, когда (если) посетитель согласится; .goal(name, params) — цель Метрики только при согласии.
 */
(function () {
  "use strict";
  if (window.CookieConsent) return;

  var CFG = {
    key: "cookie-consent",
    version: "2026-10-26",          // поменять при изменении текста баннера или состава cookie — баннер спросит заново
    maxAgeDays: 365,                // 12 месяцев, как в Политике
    policyUrl: "privacy.html#cookie",
    operator: "ИП Тимоховым М. С.",  // в творительном падеже («обработку кем»); для 79bike.ru — оператор этого сайта (вопрос к владельцу)
    metrikaId: null,                 // номер счётчика Метрики (число) — для CookieConsent.goal()
    docks: "#dock,.dock,.mbar,.rbar,.mob-cta" // фиксированные нижние панели сайтов
  };
  var ext = window.COOKIE_BANNER_CONFIG || {};
  for (var k in ext) if (Object.prototype.hasOwnProperty.call(ext, k)) CFG[k] = ext[k];

  var memo = null;          // выбор на случай недоступного localStorage
  var metrikaStarted = false;
  var waiters = [];
  var el = null;

  /* ---------- хранение выбора ---------- */
  function read() {
    var rec = memo;
    try {
      var raw = window.localStorage.getItem(CFG.key);
      if (raw) rec = JSON.parse(raw);
    } catch (e) { /* localStorage недоступен или испорчен — берём memo */ }
    if (!rec || typeof rec !== "object") return null;
    if (rec.v !== CFG.version) return null;
    if (!rec.t || Date.now() - rec.t > CFG.maxAgeDays * 864e5) return null;
    return rec;
  }
  function write(accepted) {
    // Запись без персональных данных: версия текста, решение, время. Это доказательство выбора (ч. 3 ст. 9 152-ФЗ) на стороне браузера.
    // При желании ту же запись (без IP и ФИО) можно отправлять в журнал согласий на сервер CRM.
    var rec = { v: CFG.version, a: !!accepted, t: Date.now() };
    memo = rec;
    try { window.localStorage.setItem(CFG.key, JSON.stringify(rec)); } catch (e) { /* ок: выбор действует до закрытия вкладки */ }
    /* 26.10 (Михаил): журнал согласий в CRM — без персональных данных (сайт, версия текста, решение, время). Адрес задаётся в COOKIE_BANNER_CONFIG.logUrl при релизе. */
    if (CFG.logUrl) { try { var body = JSON.stringify({ site: location.hostname, v: rec.v, a: rec.a, t: rec.t }); if (navigator.sendBeacon) navigator.sendBeacon(CFG.logUrl, body); else fetch(CFG.logUrl, { method: "POST", body: body, keepalive: true }); } catch (e) {} }
    return rec;
  }

  /* ---------- Яндекс Метрика ---------- */
  function loadMetrika() {
    if (metrikaStarted) return;
    metrikaStarted = true;

    /* === СЮДА ВСТАВИТЬ КОД СЧЁТЧИКА ЯНДЕКС МЕТРИКИ (из кабинета Метрики: «Настройка → Код счётчика») ===
     * Только JS-часть, без <script> и без блока <noscript> (noscript-пиксель грузится без согласия — его не ставить).
     * Пример (заменить 00000000 на номер счётчика):
     *
     * (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
     * m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
     * k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
     * (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
     * ym(00000000, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
     *
     * В настройках счётчика: Вебвизор — «Не записывать содержимое полей» (имя, телефон из форм в Метрику не попадают).
     */

    // Заглушка для проверки: сообщает странице, что аналитика разрешена.
    document.documentElement.setAttribute("data-metrika", "allowed");
    try { window.dispatchEvent(new CustomEvent("cookieconsent:analytics")); } catch (e) {}
    var w = waiters; waiters = [];
    for (var i = 0; i < w.length; i++) { try { w[i](); } catch (e) {} }
  }

  function dropMetrikaCookies() {
    // Удаляет cookie Метрики первого уровня (_ym_uid, _ym_d, _ym_isad и др.) на текущем домене и родительских.
    var names = document.cookie.split(";").map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return /^_ym/.test(n); });
    var host = location.hostname.split("."), doms = [""];
    for (var i = 0; i < host.length - 1; i++) doms.push("." + host.slice(i).join("."));
    names.forEach(function (n) {
      doms.forEach(function (d) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
      });
    });
    try {
      for (var j = window.localStorage.length - 1; j >= 0; j--) {
        var key = window.localStorage.key(j);
        if (key && /^_ym/.test(key)) window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }

  /* ---------- разметка ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function build() {
    var p = esc(CFG.policyUrl);
    var box = document.createElement("section");
    box.className = "cb";
    box.id = "cookie-banner";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Согласие на cookie");
    box.hidden = true;
    box.innerHTML =
      '<p class="cb__title">Cookie на сайте</p>' +
      '<p class="cb__text cb__text--full">Мы используем cookie. Необходимые обеспечивают работу сайта. ' +
      'Аналитические (Яндекс Метрика) помогают понять, какие страницы полезны, — включим их только с вашего согласия. ' +
      'Нажимая «Принять», вы соглашаетесь на обработку ' + esc(CFG.operator) + ' данных cookie для статистики посещений. ' +
      'Отказ не влияет на работу сайта. Подробнее — в <a href="' + p + '">Политике обработки персональных данных</a>.</p>' +
      '<p class="cb__text cb__text--short">Используем cookie. Яндекс Метрику включим только с вашего согласия — ' +
      'отказ не влияет на работу сайта. <a href="' + p + '">Подробнее</a></p>' +
      '<div class="cb__row">' +
      '<button type="button" class="cb__btn cb__btn--no" data-cb="no">Отказаться</button>' +
      '<button type="button" class="cb__btn cb__btn--yes" data-cb="yes">Принять</button>' +
      "</div>";
    box.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-cb]") : null;
      if (!b) return;
      choose(b.getAttribute("data-cb") === "yes");
    });
    document.body.appendChild(box);
    return box;
  }

  /* ---------- отступ над нижней панелью ---------- */
  var rafId = 0;
  function place() {
    rafId = 0;
    if (!el || el.hidden) return;
    var lift = 0, list = document.querySelectorAll(CFG.docks);
    for (var i = 0; i < list.length; i++) {
      var d = list[i], cs = getComputedStyle(d);
      if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
      var r = d.getBoundingClientRect();
      if (r.height > 0 && r.top < window.innerHeight && r.bottom > 0) lift = Math.max(lift, window.innerHeight - r.top);
    }
    var v = lift > 0 ? Math.round(lift + 8) + "px" : "calc(16px + env(safe-area-inset-bottom, 0px))";
    if (el.style.getPropertyValue("--cb-bottom") !== v) el.style.setProperty("--cb-bottom", v); // без лишних мутаций — иначе цикл с MutationObserver
  }
  function schedule() { if (!rafId) rafId = (window.requestAnimationFrame || setTimeout)(place); }

  function watchDocks() {
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("transitionend", schedule, true);
    if ("MutationObserver" in window) {
      // панель появляется/прячется сменой класса (.is-off) и рисуется скриптом сайта после загрузки
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    }
    schedule();
  }

  /* ---------- показ и выбор ---------- */
  function show() {
    if (!el) { el = build(); watchDocks(); }
    el.classList.remove("is-hiding");
    el.hidden = false;
    document.documentElement.classList.add("cb-open");
    place();
  }
  function hide() {
    if (!el) return;
    el.hidden = true;
    document.documentElement.classList.remove("cb-open");
  }
  function choose(accepted) {
    var before = read();
    write(accepted);
    hide();
    if (accepted) { loadMetrika(); return; }
    // Отзыв согласия: Метрику из памяти страницы не выгрузить — чистим её cookie и перезагружаем страницу.
    if (metrikaStarted || (before && before.a)) {
      dropMetrikaCookies();
      if (metrikaStarted) location.reload();
    }
  }

  function open() {
    show();
    var b = el && el.querySelector(".cb__btn--yes");
    if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
  }

  // «Настройки cookie» в подвале
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('[data-cookie-settings],a[href$="#cookie-settings"]') : null;
    if (!a) return;
    e.preventDefault();
    open();
  });

  window.CookieConsent = {
    open: open,
    analytics: function () { var r = read(); return r ? r.a : null; },
    onAnalytics: function (fn) { if (metrikaStarted) fn(); else waiters.push(fn); },
    goal: function (name, params) {
      // Цели Метрики (отправка формы и т. п.) — только если посетитель согласился.
      if (!metrikaStarted || !CFG.metrikaId || typeof window.ym !== "function") return;
      try { window.ym(CFG.metrikaId, "reachGoal", name, params || {}); } catch (e) {}
    },
    reset: function () { memo = null; try { window.localStorage.removeItem(CFG.key); } catch (e) {} }
  };

  function init() {
    var rec = read();
    if (rec && rec.a) loadMetrika();      // согласие уже дано — Метрика грузится сразу, баннер не показываем
    else if (!rec) show();                // выбора нет или он устарел — показываем баннер, Метрику не грузим
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
