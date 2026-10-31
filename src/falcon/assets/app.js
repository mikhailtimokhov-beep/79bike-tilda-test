/* Falcon 79BIKE — общий скрипт прототипа.
   Данные: data/models.js, data/photos.js, data/content.js, data/videos.js (те же, что в основном прототипе).
   Каждая страница — оболочка с <body data-page="..."> (и data-slug для страниц моделей). */
(function () {
  "use strict";
  // 25.10 (Михаил): переход на страницу модели должен открывать её с самого верха — отключаем восстановление прокрутки браузером
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  (function () {
    var moved = false, t0 = Date.now();
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { passive: true, once: true }); });
    function top() { if (!location.hash && !moved && Date.now() - t0 < 4000) window.scrollTo(0, 0); }
    top(); document.addEventListener("DOMContentLoaded", top); window.addEventListener("load", function () { top(); setTimeout(top, 60); });
    window.addEventListener("pageshow", function (e) { if (e.persisted) return; top(); });
  })();
  var MODELS = window.MODELS || [], PH = window.PHOTOS || {}, C = window.CONTENT || {}, VID = window.VIDEOS || {};
  var PHONE = "+7 (999) 900-55-88", PHONE_HREF = "tel:+79999005588";
  var RUTUBE = "https://rutube.ru/channel/65461061/";
  var FILE = { gt: "gt.html", pro: "pro.html", "lynx-trail": "lynx-trail.html", light: "lite.html", "lynx-x": "lynx-x.html", "surge-v": "surge-v.html" };
  var CODE = { gt: "GT", pro: "PRO", "lynx-trail": "LYNX", light: "LITE", "lynx-x": "X", "surge-v": "SV" };
  var SHORT = { gt: "Falcon GT", pro: "Falcon Pro", "lynx-trail": "Lynx Trail", light: "Falcon Lite", "lynx-x": "Lynx X", "surge-v": "Y-Volt Surge V" };
  var TAG = { gt: "Флагман для опытных", pro: "Новичку и любителю", "lynx-trail": "Для высоких райдеров", light: "Первый байк", "lynx-x": "Старт продаж в 2027", "surge-v": "Эндуро для профи" };
  var COVER = {};
  var PAINT = { black: "#1D1D23", white: "#F5F5F7", silver: "#B8BBC4", grey: "#7B7E88", violet: "#7658F5", yellow: "#F4C300", red: "#C8262F", gold: "#C49A3A" };
  var ORDER = ["light", "pro", "lynx-trail", "gt", "surge-v", "lynx-x"];
  var TABS = ["pro", "lynx-trail", "light", "gt", "surge-v"];
  var TAB_LABEL = { pro: "Pro", light: "Lite", "lynx-trail": "Lynx", gt: "GT", "surge-v": "Surge V" };
  function TAG_LABEL_FIX(s) { return TAB_LABEL[s]; }
  function nb(t) { return String(t).replace(/Y-Volt/g, "Y\u2011Volt").replace(/Sur-Ron/g, "Sur\u2011Ron"); }
  var SALE = ORDER.filter(function (s) { var m = bySlug(s); return m && m.price; });

  function $(id) { return document.getElementById(id); }
  function remember(s) { try { sessionStorage.setItem("falcon:model", s); } catch (e) {} }
  function recall() { try { var v = sessionStorage.getItem("falcon:model"); return v && bySlugSafe(v) ? v : null; } catch (e) { return null; } }
  function bySlugSafe(s) { var M = window.MODELS || []; for (var i = 0; i < M.length; i++) if (M[i].slug === s) return M[i]; return null; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bySlug(s) { for (var i = 0; i < MODELS.length; i++) if (MODELS[i].slug === s) return MODELS[i]; return null; }
  function money(n) { return n == null ? "" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽"; }
  function num(n) { return String(n).replace(".", ","); }
  function photos(s) { return PH[s] || []; }
  /* вырезанные байки без фона, все развёрнуты вправо; ширина — пропорционально реальной длине (24.10.2026) */
  function cutSrc(s) { return "assets/photos/cut/" + s + ".webp" + (s === "lynx-x" ? "?v=5" : "?v=4"); }
  var CUT_H = {"gt": 93.6, "pro": 90.5, "lynx-trail": 92.0, "light": 91.0, "lynx-x": 92.0 /* Михаил 26.10: как Lynx Trail */, "surge-v": 96.4}; // высота картинки в % от самой высокой: масштаб по длине и высоте из спецификаций (среднее геометрическое)
  function cutH(s) { return CUT_H[s] || 90; }
  function firstImg(s) { var p = photos(s)[0]; return p ? p.images[0].src : "assets/bike.svg"; }
  /* лёгкие версии фото (QA 25.10.2026): -s.webp 320 px — миниатюры, меню, нижняя панель; -m.webp 800 px — главное фото на узких экранах */
  function photoV(src, suf) { if (/lynx-x-black-\d\.webp$/.test(src || "")) return src; /* 30.10: новые студийные фото Lynx X без вариантов -m/-s (лимит файлов артефакта) */ return /^assets\/photos\/[\w-]+\.webp$/.test(src || "") && !/-(s|m)\.webp$/.test(src) && !/rider\.webp$/.test(src) ? src.replace(/\.webp$/, suf + ".webp") : src; }
  function photoSet(src) { var m = photoV(src, "-m"), w = /surge-v-white-/.test(src) ? 1080 : 1600; return m === src || w <= 800 ? "" : m + " 800w, " + src + " " + w + "w"; }
  function imgTag(s, src, alt, extra) { return '<img src="' + esc(photoV(src, "-s")) + '" alt="' + esc(alt || "") + '"' + (COVER[s] ? ' class="is-cover"' : s === "surge-v" ? ' class="is-studio"' : "") + (extra || "") + ">"; }
  function spec(m, k) { return m.specs[k]; }
  function kv(m) { var s = m.specs; return [num(s.powerKw) + " кВт", s.speedKmh + " км/ч", s.weightKg + " кг"]; }
  var page = document.body.getAttribute("data-page") || "home";
  var slug = document.body.getAttribute("data-slug");
  var ICON = {
    cartS: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2l1.7-7.1H6.2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 10h4v4h-4zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M11 9l-2 3h3l-2 3"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 5a7 7 0 0 0 0 14z"/><path d="M14 8h7M14 12h7M14 16h7"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1.2"/></svg>',
    spring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v3M12 19v3M7 5h10M7 19h10M8 8l8 2-8 2 8 2-8 2"/></svg>',
    reverse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v5h5"/><path d="M3.5 12A8.5 8.5 0 1 0 6 6"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>'
  };

  /* ---------- шапка, меню, подвал ---------- */
  // 25.10 (Михаил): шапка — Модели ▾ · Запчасти и аксессуары · Доставка и оплата · Клиентам ▾ · Контакты; в «Клиентам» первым — Вопрос-ответ, Блог — внутри
  var CLIENTS = [
    ["faq.html", "Вопрос-ответ", "Пробег, заряд, дождь, гарантия"],
    ["warranty.html", "Гарантия и сервис", "Ремонт и техподдержка в России"],
    ["instructions.html", "Инструкции", "Сборка, зарядка, обслуживание"],
    ["credit.html", "Рассрочка", "С процентами, Т-Банк и POSCREDIT"],
    ["blog.html", "Блог", "Статьи, советы и обзоры"],
    ["events.html", "События", "Выставки, тест-драйвы, шоурум"],
    ["bloggers.html", "Блогерам", "Тест-драйв для обзора, сотрудничество"]
  ];
  var FOOT_CLIENTS = [["delivery.html", "Доставка и оплата"], ["parts.html", "Запчасти и аксессуары"], ["faq.html", "Вопрос-ответ"], ["warranty.html", "Гарантия и сервис"], ["instructions.html", "Инструкции"], ["credit.html", "Рассрочка"], ["blog.html", "Блог"], ["events.html", "События"], ["bloggers.html", "Блогерам"]];
  var here = location.pathname.split("/").pop() || "index.html";
  function cur(href) { return href === here ? ' aria-current="page"' : ""; }
  function header() {
    var mega = ORDER.map(function (s) {
      var m = bySlug(s);
      return '<a href="' + FILE[s] + '"' + cur(FILE[s]) + '><span class="mega__pic">' + imgTag(s, firstImg(s), "", ' loading="lazy" decoding="async"') + '</span><span style="display:flex;flex-direction:column;gap:2px;color:var(--fg);font-weight:700">' + esc(m.name) + '<span>' + (m.price ? money(m.price) : "Старт продаж в 2027") + "</span></span></a>";
    }).join("") + '<div class="mega__links"><a class="mega__all" href="podbor.html"' + cur("podbor.html") + '>Подобрать по росту и весу</a><a class="mega__all" href="compare.html"' + cur("compare.html") + '>Сравнить модели</a><a class="mega__all" href="video.html"' + cur("video.html") + '>Видеообзоры</a></div>';
    var isModel = page === "model" || ["podbor.html", "compare.html", "video.html"].indexOf(here) >= 0, isClient = page === "post" || page === "manual" || CLIENTS.some(function (c) { return c[0] === here; });
    return '<p class="promo"><span class="wrap" style="display:block"><a class="promo__a" href="testdrive.html#visit"><span class="promo__l">Записаться на тест-драйв в шоуруме «Речников 21» — Москва и МО</span><span class="promo__s">Записаться на тест-драйв</span></a></span></p>' +
      '<header class="top"><div class="wrap">' +
      '<a class="logo" href="index.html" aria-label="Falcon Bike — официальный магазин 79BIKE в России"><picture><img src="assets/logo/falcon-bike-logo.svg" alt="Falcon Bike — официальный магазин 79BIKE в России" width="545" height="136"></picture></a>' +
      '<nav class="nav" aria-label="Основное меню">' +
        '<div class="nav__item"><button class="nav__btn' + (isModel ? " is-current" : "") + '" type="button" aria-expanded="false" aria-controls="dd-models">Модели' + ICON.chev + '</button><div class="drop mega" id="dd-models" hidden>' + mega + "</div></div>" +
        '<a href="parts.html"' + cur("parts.html") + ">Запчасти и аксессуары</a>" +
        '<a href="delivery.html"' + cur("delivery.html") + ">Доставка и оплата</a>" +
        '<div class="nav__item"><button class="nav__btn' + (isClient ? " is-current" : "") + '" type="button" aria-expanded="false" aria-controls="dd-clients">Клиентам' + ICON.chev + '</button><div class="drop" id="dd-clients" hidden>' +
          CLIENTS.map(function (c) { return '<a href="' + c[0] + '"' + cur(c[0]) + ">" + c[1] + "<span>" + c[2] + "</span></a>"; }).join("") + "</div></div>" +
        '<a href="contacts.html"' + cur("contacts.html") + ">Контакты</a>" +
      "</nav>" +
      '<a class="top__phone" href="' + PHONE_HREF + '">' + PHONE + "</a>" +
      '<a class="btn btn--main" href="testdrive.html#visit" style="min-height:44px">Тест-драйв</a>' +
      '<div style="display:flex;gap:2px">' + '<a class="icon-btn hdr-cart hdr-cart--m" href="parts.html#cart" aria-label="Корзина" hidden>' + ICON.cartS + '<b class="hdr-cart__n"></b></a>' + '<a class="icon-btn" href="' + PHONE_HREF + '" aria-label="Позвонить">' + ICON.phone + '</a>' + (page === "parts" ? '<button class="icon-btn hdr-chat" type="button" data-msgr aria-label="Написать в мессенджер"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 20.5l1.4-4.6A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/></svg></button>' : "") + '<button class="icon-btn" type="button" id="menu-open" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu">' + ICON.menu + "</button></div>" +
      "</div></header>" +
      '<div class="menu" id="menu" hidden role="dialog" aria-modal="true" aria-label="Меню"><div class="menu__head"><img class="logo-menu" src="assets/logo/falcon-bike-logo.svg" alt="Falcon Bike — официальный магазин 79BIKE в России" width="545" height="136"><button class="icon-btn" type="button" id="menu-close" aria-label="Закрыть меню" style="display:inline-flex">' + ICON.close + "</button></div>" +
      '<div class="menu__group"><span>Модели</span><div class="menu__models">' + ORDER.map(function (s) { return '<a href="' + FILE[s] + '"><span class="menu__pic"><img src="' + cutSrc(s) + '" alt="" loading="lazy" decoding="async" style="height:' + (cutH(s) * 0.8).toFixed(1) + '%"></span>' + esc(SHORT[s]) + (bySlug(s).status === "soon" ? '<span class="menu__soon">2027</span>' : "") + "</a>"; }).join("") + '<a class="menu__parts" href="parts.html"><b>Запчасти и аксессуары</b><span class="menu__parts-pics"><i style="background-position:0 0"></i><i style="background-position:33.333% 0"></i><i style="background-position:66.667% 0"></i><i style="background-position:100% 0"></i></span><span class="menu__parts-go">В каталог →</span></a>' + "</div></div>" +
      '<nav aria-label="Разделы" class="menu__nav"><span class="menu__h">Выбрать байк</span><a href="podbor.html">Подбор по росту и весу</a><a href="compare.html">Сравнение моделей</a><a href="video.html">Видеообзоры</a><a href="credit.html">Рассрочка</a><span class="menu__h">Покупка и владение</span><a href="delivery.html">Доставка и оплата</a><a href="warranty.html">Гарантия и сервис</a><a href="instructions.html">Инструкции</a><a href="faq.html">Вопрос-ответ</a><span class="menu__h">Сообщество</span><a href="blog.html">Блог</a><a href="events.html">События</a><a href="bloggers.html">Блогерам</a><a class="btn btn--main menu__cta" href="contacts.html">Контакты</a></nav>' +
      '<div class="room"><span class="room__phone">' + PHONE + '</span><span class="room__row"><span class="open-dot" aria-hidden="true"></span>Шоурум «Речников 21», в удобное время по звонку</span></div></div>';
  }
  /* 25.10: подвал — каналы связи и соцсети раздельно, иконки в фирменном стиле */
  var SOC_IC = {
    tg: '<path d="M3.75 11.7l15.75-6.45-2.85 13.95-6-4.5-2.4 2.55.15-4.65L16.5 7.35"/><path d="M3.75 11.7l4.65 1.95"/>',
    wa: '<path d="M4 20l1.3-3.9A8.6 8.6 0 1 1 8.2 19z"/><path d="M9.2 8.4c-.4 1 .1 2.6 1.5 4s3 1.9 4 1.5l.8-1.3-1.8-1-.8.7a3.6 3.6 0 0 1-1.6-1.6l.7-.8-1-1.8z"/>',
    vk: '<path d="M3.75 7.5l3 9 3-9M13.5 7.5v9M19.2 7.5L14.1 12l5.4 4.5"/>',
    rt: '<path d="M6.3 18V6h5.4a3.2 3.2 0 0 1 0 6.4H6.3M11.4 12.4l4.3 5.6"/><path d="M17.6 6h.01" stroke-width="2.6"/>',
    vkm: '<path d="M4 5.5h16v10.5H9.5L5 19.5V16H4z"/><path d="M7.6 8.6l1.6 4.4 1.6-4.4M12.6 8.6v4.4M16.4 8.6l-2.6 2.2 2.8 2.2"/>',
    dz: '<path d="M9.76 5h5.74v11.2M9.76 5c0 5.32-1.12 9.24-2.8 11.2M5.7 16.2h12.6M5.7 16.2v2.8M18.3 16.2v2.8"/>'
  };
  var DZEN = "https://dzen.ru/id/684bd16cbdb83b450944e2da";
  function footSoc() {
    function a(k, t, h) { return '<a class="soc__a" href="' + (h || "#") + '"' + (h ? ' target="_blank" rel="noopener"' : ' aria-disabled="true"') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SOC_IC[k] + "</svg>" + t + "</a>"; }
    return '<div class="soc"><p class="soc__h">Написать нам</p><div class="soc__row">' + a("tg", "Telegram", "https://t.me/Meliso_group") + a("wa", "WhatsApp", "https://wa.me/79999005588") + a("vkm", "VK Мессенджер", "https://vk.me/79bike") + "</div>" +
      '<p class="soc__h">Мы в соцсетях</p><div class="soc__row">' + a("vk", "ВКонтакте", "https://vk.com/79bike") + a("rt", "RUTUBE", RUTUBE) + a("dz", "Дзен", DZEN) + "</div></div>";
  }
  function footer() {
    return '<footer class="foot"><div class="wrap"><h2 class="vh">Разделы сайта и контакты</h2><div class="foot__grid">' +
      '<div class="foot__brand" style="display:flex;flex-direction:column;gap:14px"><img class="logo-foot" src="assets/logo/falcon-bike-logo.svg" alt="Falcon Bike — официальный магазин 79BIKE в России" width="545" height="136"><p style="color:var(--mute);font-size:14px;max-width:34ch">' + "Официальный магазин 79BIKE в России: продажа, гарантия, сервис и запчасти для Falcon, Lynx и Y\u2011Volt. Доставка по всей стране." + '</p>' +
      footSoc() + '</div>' +
      '<div><h3>Модели</h3><ul>' + ORDER.map(function (s) { return '<li><a href="' + FILE[s] + '">' + esc(nb(bySlug(s).name)) + "</a></li>"; }).join("") + '<li><a href="compare.html">Сравнение моделей</a></li></ul></div>' +
      '<div><h3>Клиентам</h3><ul>' + FOOT_CLIENTS.map(function (c) { return '<li><a href="' + c[0] + '">' + c[1] + "</a></li>"; }).join("") + '</ul></div>' +
      '<div class="foot__room"><h3>Шоурум в Москве</h3><div class="room"><span class="room__phone">' + PHONE + '</span><span class="room__row"><span class="open-dot" aria-hidden="true"></span>В удобное для вас время, по звонку</span><span class="room__row">Тест-драйв — для Москвы и МО</span><span class="room__row">Москва, ул. Речников, 21 — бизнес-пространство «Речников 21», м. «Кленовый бульвар»</span><span class="room__row"><b>Визит по предварительному звонку</b></span><a class="btn btn--main" href="testdrive.html#visit" style="min-height:46px;margin-top:4px">Тест-драйв (Москва и МО)</a></div></div>' +
      '</div><div class="legal"><span>' + esc(C.footer ? C.footer.legal : "") + '</span><a href="https://falcon-bike.ru/declaration" target="_blank" rel="noopener">Декларация соответствия</a><a href="warranty.html">Гарантийная политика</a><a href="privacy.html">Политика обработки персональных данных</a><a href="consent.html">Согласие на обработку ПД</a><a href="#cookie-settings" data-cookie-settings>Настройки cookie</a></div>' +
      '<p class="legal" style="border:0;margin-top:0;padding-top:8px">' + esc(C.legal ? C.legal.text : "") + "</p>" +
      '<p class="legal" style="border:0;margin-top:0;padding-top:4px">© FALCON-BIKE (ИП Тимохов М. С.). Копирование материалов сайта без письменного разрешения правообладателя не допускается.</p></div></footer>';
  }
  /* виджет мессенджеров — ссылки как на falcon-bike.ru (24.10.2026) */
  function msgrHtml() {
    var I = {
      wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
      tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2 1.8 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
      vk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.8 17.5C6.6 17.5 3 13.3 2.9 6.3h3.1c.1 5.1 2.4 7.3 4.2 7.7V6.3h2.9v4.4c1.8-.2 3.7-2.2 4.3-4.4h2.9a8.6 8.6 0 0 1-3.9 5.6 8.9 8.9 0 0 1 4.6 5.6h-3.2a5.6 5.6 0 0 0-4.7-4v4H12.8Z"/></svg>',
      imo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.7c0 2.6 1.3 4.9 3.4 6.5L4.6 22l4-2.2c1 .3 2.2.5 3.4.5 5.5 0 10-3.9 10-8.6S17.5 3 12 3Zm-4 10.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z"/></svg>',
      chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 20.5l1.4-4.6A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/></svg>'
    };
    var L = [["wa", "WhatsApp", "https://wa.me/79999005588", "#25D366"], ["tg", "Telegram", "https://t.me/Meliso_group", "#2AABEE"], ["vk", "VK Мессенджер", "https://vk.me/79bike", "#0077FF"]];
    return '<div class="msgr" id="msgr"><div class="msgr__panel" id="msgr-panel" hidden><p class="msgr__title">Напишите нам</p><p class="msgr__sub">Ответим в мессенджере или перезвоним</p><ul>' +
      L.map(function (x) { return '<li><a href="' + x[2] + '" target="_blank" rel="noopener" style="--c:' + x[3] + '"><span class="msgr__ic">' + I[x[0]] + '</span>' + x[1] + '</a></li>'; }).join("") +
      '<li><a href="' + PHONE_HREF + '" style="--c:#7658F5"><span class="msgr__ic">' + ICON.phone + '</span>' + PHONE + '</a></li></ul></div>' +
      '<button type="button" class="msgr__btn" id="msgr-btn" aria-expanded="false" aria-controls="msgr-panel" aria-label="Написать в мессенджер"><span class="msgr__open">' + I.chat + '</span><span class="msgr__close">' + ICON.close + '</span></button></div>';
  }
  function accHtml(slug) {
    var A = (C.modelPage && C.modelPage.accessories) || {}, L = (A.byModel || {})[slug];
    if (!L || !L.length) return '<div class="tech">' + (A.items || []).map(function (a) { return '<article class="card"><h3 class="h3">' + esc(a.title) + "</h3><p>" + esc(a.text) + "</p></article>"; }).join("") + "</div>";
    return '<div class="acc">' + L.map(function (a) {
      return '<article class="card acc__card"><figure class="acc__pic"><img src="' + esc(a.img) + '" alt="' + esc(a.title) + '" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'is-empty\')"></figure>' +
        '<div class="acc__body"><h3 class="h3">' + esc(a.title) + '</h3><p class="acc__fit">Подходит: ' + esc(a.fits) + '</p><p class="acc__price">' + money(a.price) + '</p>' +
        '<a class="btn btn--ghost acc__btn" href="#order" data-acc="' + esc(a.title) + '">Добавить к заказу</a></div></article>';
    }).join("") + '</div><p class="t-cap" style="margin-top:10px">Если доставка нашим курьером — привезём вместе с байком. Если транспортной компанией — отправим запчасти СДЭКом.</p>';
  }
  function dockHtml(s) {
    if (page === "parts") return ""; /* 26.10 (правка 31): на странице запчастей вместо нижней плашки — закреплённая строка поиска */
    var m = bySlug(s), WA = '<button type="button" class="dock__wa" data-msgr aria-label="Написать в мессенджер"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 20.5l1.4-4.6A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/></svg></button>';
    if (page === "model") return '<div class="dock" id="dock"><span class="dock__pic">' + imgTag(s, firstImg(s), "", ' id="d-img"') + '</span><span class="dock__txt"><b id="d-name">' + esc(m.name) + '</b><span id="d-price">' + (m.price ? money(m.price) : "Старт продаж в 2027") + '</span></span>' + WA + '<a class="btn btn--main" href="#order">' + (m.price ? "Заказать" : "Узнать первым") + "</a></div>";
    var act = { delivery: ["#calc", "Рассчитать доставку"], credit: ["#order", "Узнать условия"], contacts: ["#visit", "Записаться"], testdrive: ["#visit", "Записаться"], warranty: ["#order", "Связаться с сервисом"], parts: ["#order", "Подобрать запчасть"] }[page] || ["testdrive.html#visit", "Тест-драйв"];
    if (page === "home") return '<div class="dock" id="dock"><span class="dock__pic">' + imgTag(s, firstImg(s), "", ' id="d-img"') + '</span><span class="dock__txt"><b id="d-name">' + esc(m.name) + '</b><span id="d-price">' + money(m.price) + '</span></span>' + WA + '<a class="btn btn--main" href="testdrive.html#visit">Тест-драйв</a></div>';
    return '<div class="dock dock--page" id="dock"><span class="dock__txt"><b>Шоурум «Речников 21»</b><span>В удобное время, по звонку</span></span>' + WA + '<a class="btn btn--main" href="' + act[0] + '">' + act[1] + "</a></div>";
  }
  function setDock(s) {
    var m = bySlug(s), i = $("d-img"); if (!m || !i || !$("d-name")) return;
    i.src = photoV(firstImg(s), "-s"); i.className = COVER[s] ? "is-cover" : "";
    $("d-name").textContent = m.name; $("d-price").textContent = m.price ? money(m.price) : "Старт продаж в 2027";
  }

  /* ---------- общие блоки ---------- */
  function head(crumb, h1, lead) {
    return '<section class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Навигация"><a href="index.html">Главная</a><span aria-hidden="true">/</span>' + crumb + "</nav><h1>" + h1 + "</h1>" + (lead ? '<p class="t-lead">' + lead + "</p>" : "") + "</div></section>";
  }
  // секция с заголовком H2 только для экранных дикторов и поисковиков (порядок H1→H2→H3 без пропусков)
  function secH(id, title, inner) {
    return '<section class="sec"' + (id ? ' id="' + id + '"' : "") + '><div class="wrap"><h2 class="vh">' + title + "</h2>" + inner + "</div></section>";
  }
  function sec(id, title, inner, extra) {
    return '<section class="sec"' + (id ? ' id="' + id + '"' : "") + '><div class="wrap">' + (title ? '<div class="sec-head"><h2 class="h2">' + title + "</h2>" + (extra || "") + "</div>" : "") + inner + "</div></section>";
  }
  function modelCards(list) {
    return '<div class="models">' + list.map(function (s) {
      var m = bySlug(s), code = CODE[s], fs = code.length > 3 ? 54 : code.length > 2 ? 70 : 92;
      return '<a class="model" href="' + FILE[s] + '" data-k="' + s + '"><span class="model__pic">' + (COVER[s] ? "" : '<span class="model__code" aria-hidden="true" style="font-size:' + fs + 'px">' + code + "</span>") + '<img class="is-cut" src="' + cutSrc(s) + '" alt="' + esc(m.name) + '" loading="lazy" style="height:' + cutH(s) * 0.78 + '%">' +
        '</span><span class="model__body"><span class="model__badge">' + esc(TAG[s]) + '</span><span class="model__name">' + esc(m.name) + '</span><span class="model__spec">' + kv(m).join(", ") + '</span><span class="model__price">' + (m.price ? "<b>" + money(m.price) + "</b>" + (m.oldPrice ? "<s>" + money(m.oldPrice) + "</s>" : "") : "<b>Скоро</b>") + '</span><span class="btn btn--main">Подробнее</span></span></a>';
    }).join("") + "</div>";
  }
  function trustList() {
    return '<ul class="trust" aria-label="Почему у нас"><li><a href="warranty.html">' + ICON.shield + '<span><b>Гарантия</b>Ремонт в России</span>' + ICON.chev + '</a></li><li><a href="delivery.html">' + ICON.truck + '<span><b>Доставка по России</b>ПЭК, Деловые линии и др.</span>' + ICON.chev + '</a></li><li><a href="parts.html">' + ICON.box + '<span><b>Запчасти</b>На складе в Москве</span>' + ICON.chev + '</a></li></ul>';
  }
  /* 26.10 (правка 21): названия других моделей в ответах — ссылки на их страницы (текущую страницу не ссылаем) */
  var MLINK = [["Falcon Lynx Trail", "lynx-trail"], ["Falcon Lynx X", "lynx-x"], ["Lynx Trail", "lynx-trail"], ["Lynx X", "lynx-x"], ["Falcon Lite", "light"], ["Falcon Pro", "pro"], ["Falcon GT", "gt"], ["Y-Volt Surge V", "surge-v"], ["Y‑Volt Surge V", "surge-v"], ["Surge V", "surge-v"]];
  var MLINK_RE = new RegExp("(" + MLINK.map(function (x) { return x[0].replace(/[-‑]/g, "[-‑]"); }).join("|") + ")(?![\\wЀ-ӿ])", "g");
  function mSlugOf(name) { var n = name.replace(/‑/g, "-"); for (var i = 0; i < MLINK.length; i++) if (MLINK[i][0].replace(/‑/g, "-") === n) return MLINK[i][1]; return null; }
  function linkModels(html, cur) {
    var done = {};
    return html.replace(MLINK_RE, function (m) { var s = mSlugOf(m); if (!s || s === cur || done[s] || !FILE[s]) return m; done[s] = 1; return '<a href="' + FILE[s] + '">' + m + "</a>"; });
  }
  /* 26.10 (правка 22): «Чем X отличается от Y» — раскрывающаяся таблица двух моделей по data/models.js */
  function faqCmp(q) {
    var mm = /^Чем (.+?) отличается от (.+?)\?$/.exec(q || ""); if (!mm) return "";
    var a = mSlugOf(mm[1].trim()), b = mSlugOf(mm[2].trim()); if (!a || !b || a === b || !bySlug(a) || !bySlug(b)) return "";
    var L = [a, b], R = [["Мощность", function (m) { return fmt(m, "powerKw", "кВт"); }], ["Момент", function (m) { return fmt(m, "torqueNm", "Н·м"); }], ["Скорость", function (m) { return fmt(m, "speedKmh", "км/ч"); }],
      ["Батарея", function (m) { var sp = m.specs; return sp.capacityAh ? (sp.voltage ? sp.voltage + "\u00a0В, " : "") + num(sp.capacityAh) + "\u00a0Ач" : "—"; }], ["Вес", function (m) { return fmt(m, "weightKg", "кг"); }], ["Сиденье", function (m) { return fmt(m, "seatMm", "мм"); }],
      ["Нагрузка", function (m) { return fmt(m, "payloadKg", "кг"); }], ["Колёса", function (m) { return fmt(m, "wheels", ""); }], ["Цена", function (m) { return m.price ? money(m.price) : "Старт продаж в 2027"; }]];
    return '<details class="qa-more"><summary>Сравнить подробно</summary><div class="qa-more__in"><div class="cmp qa-cmp"><table><caption class="vh">' + esc(SHORT[a] + " и " + SHORT[b]) + '</caption><thead><tr><th scope="col"></th>' + L.map(function (s) { return '<th scope="col">' + esc(SHORT[s]) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      R.map(function (r) { return '<tr><th scope="row">' + r[0] + "</th>" + L.map(function (s) { return "<td>" + esc(r[1](bySlug(s))) + "</td>"; }).join("") + "</tr>"; }).join("") + '</tbody></table></div><p class="qa-more__go"><a href="compare.html">Полное сравнение всех моделей</a></p></div></details>';
  }
  /* 26.10 (правка 23): сноска «Как считается запас хода» — общий текст, без цифр и сторонних тестов */
  function faqRange(q) {
    if (!/на одном заряде|запас хода|Сколько заряжается/i.test(q || "")) return "";
    return '<details class="qa-more"><summary>Как считается запас хода</summary><div class="qa-more__in"><p>Запас хода указан по данным производителя — для спокойной, равномерной езды на полностью заряженной батарее. В реальной поездке он зависит от условий.</p>' +
      '<p><b>Что уменьшает запас хода</b></p><ul><li>Большой вес райдера и груза</li><li>Высокая скорость и режим Sport</li><li>Затяжные подъёмы</li><li>Бездорожье: песок, грязь, глубокая трава</li><li>Холод — на морозе батарея отдаёт меньше энергии</li><li>Низкое давление в шинах</li></ul>' +
      '<p><b>Как проехать больше</b></p><ul><li>Ездите в Eco или Drive, плавно работайте газом</li><li>Держите давление в шинах по инструкции</li><li>Заряжайте и храните батарею в тепле</li><li>Перед поездкой заряжайте батарею полностью штатным ЗУ</li></ul></div></details>';
  }
  /* 29.10 (Михаил): ролики теста на воду — в ответе о влагозащите */
  function faqVids(list) {
    if (!list || !list.length) return "";
    return '<div class="qa-vids">' + list.map(function (v) {
      var emb = vEmbed(v.url || ""), pl = vPlat(v);
      return '<a class="vcard qa-vid" href="' + esc(v.url) + '" data-embed="' + esc(emb) + '" data-vt="' + esc(v.title) + '" data-vp="' + pl + '" aria-label="' + esc(v.title + (VSRC[pl] ? " — " + VSRC[pl] : "") + ", " + v.duration + " (смотреть здесь)") + '"><span class="qa-vid__pic" style="background-image:url(' + esc(v.sprite) + ');background-position:' + esc(v.pos) + '"><span class="vcard__play" aria-hidden="true">' + ICON.play + '</span><span class="vcard__dur" aria-hidden="true">' + esc(v.duration) + '</span></span><span class="qa-vid__t">' + esc(v.title) + "</span></a>";
    }).join("") + "</div>";
  }
  function faqHtml(list, openFirst) {
    var cur = page === "model" ? slug : null;
    return '<div class="qa">' + list.map(function (f, i) {
      var link = f.link ? ' <a href="' + esc(f.link.href) + '" target="_blank" rel="noopener">' + esc(f.link.text) + "</a>" : "";
      var body = f.blocks ? '<div class="qa__blocks">' + f.blocks.map(function (b) { return '<div class="qa__blk"><p class="qa__bh">' + esc(b.h) + "</p><p>" + linkModels(esc(b.t), cur) + (b.link ? ' <a href="' + esc(b.link.href) + '">' + esc(b.link.text) + "</a>" : "") + "</p></div>"; }).join("") + "</div>" + (link ? "<p>" + link.trim() + "</p>" : "")
        : "<p>" + linkModels(esc(f.a), cur) + link + "</p>";
      return "<details" + (f.id ? ' id="' + esc(f.id) + '"' : "") + (openFirst && i === 0 ? " open" : "") + "><summary>" + esc(f.q) + '<span aria-hidden="true">' + ICON.plus + '</span></summary><div class="qa__a">' + body + faqVids(f.videos) + faqCmp(f.q) + faqRange(f.q) + "</div></details>";
    }).join("") + "</div>";
  }
  function radios(name, legend, opts) {
    return '<fieldset class="form__how"><legend>' + legend + '</legend>' + opts.map(function (o, i) { return '<label class="opt"><input type="radio" name="' + name + '" value="' + esc(o) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") + "</fieldset>";
  }
  /* страница модели: быстрые переходы по разделам (липкая полоса под шапкой) */
  function mnavHtml(slug, soon, mc) {
    var L = [];
    if (galItems(slug).length) L.push(["gallery", "Фото"]);
    L.push(["size", "Примерка по росту"], ["video", "Видео"], ["specs", "Характеристики"]);
    if ((((C.modelPage || {}).accessories || {}).byModel || {})[slug]) L.push(["acc", "Запчасти"]);
    if (mc.faq && mc.faq.length) L.push(["faq", "Вопросы"]);
    return '<nav class="mnav" id="mnav" aria-label="Разделы страницы"><div class="wrap mnav__in">' + L.map(function (x) { return '<a href="#' + x[0] + '" data-sec="' + x[0] + '">' + x[1] + "</a>"; }).join("") + '<a class="mnav__cta" href="#order" data-sec="order">' + (soon ? "Узнать о старте" : "Заказать") + "</a></div></nav>";
  }
  /* 26.10 (правки 4, 33): контакт + способ связи. Позвонить/WhatsApp — маска телефона; Telegram/VK Мессенджер — телефон или @username */
  var HOW = ["Позвонить", "WhatsApp", "Telegram", "VK Мессенджер"];
  function contactHtml(id, first) {
    var opts = first ? [first].concat(HOW.filter(function (x) { return x !== first; })) : HOW;
    return '<label for="' + id + '-ph" data-contact-l>Телефон</label><input id="' + id + '-ph" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" maxlength="40" data-contact>' +
      '<p class="form__hint form__hint--ct" data-contact-hint hidden></p>' +
      radios(id + "-how", "Как удобнее связаться", opts);
  }
  function orderForm(id, title, text, btn, ok, o) {
    o = o || {};
    var pre = o.model ? recall() : null;
    return '<div class="cta-band"><div style="flex:1 1 340px"><h2>' + title + "</h2><p>" + text + '</p></div><form class="form" id="' + id + '" style="flex:1 1 400px" novalidate>' +
      (o.sum ? '<div class="osum" id="osum"><span class="osum__pic">' + imgTag(o.sum, firstImg(o.sum), "", ' id="osum-img"') + '</span><span class="osum__txt"><span class="osum__cap">Ваш выбор</span><b>' + esc(bySlug(o.sum).name) + '</b><span id="osum-color"></span></span><span class="osum__price"><b class="num">' + money(bySlug(o.sum).price) + "</b>" + (bySlug(o.sum).oldPrice ? "<s>" + money(bySlug(o.sum).oldPrice) + "</s>" : "") + '</span><input type="hidden" name="color" id="osum-in"></div>' : "") +
      (o.city && o.cityFirst ? '<label for="' + id + '-city">Город</label><input id="' + id + '-city" data-req="Укажите город." type="text" autocomplete="address-level2" placeholder="Например, Екатеринбург">' : "") +
      (o.model ? '<label for="' + id + '-m">Модель</label><select id="' + id + '-m" class="form__sel"><option value="">Ещё не выбрал</option>' + ORDER.map(function (s) { return '<option value="' + s + '"' + (s === pre ? " selected" : "") + ">" + esc(bySlug(s).name) + "</option>"; }).join("") + '</select>' : "") +
      (o.city && !o.cityFirst ? '<label for="' + id + '-city">Город</label><input id="' + id + '-city" data-req="Укажите город." type="text" autocomplete="address-level2" placeholder="Например, Екатеринбург">' : "") +
      contactHtml(id) +
      (o.when ? '<div class="form__when"><div><label for="' + id + '-date">Дата визита</label><input id="' + id + '-date" type="date" data-req="Выберите дату визита." data-visit-date></div></div><p class="form__hint">Время согласуем по телефону — в удобное для вас. После записи пришлём видео, как пройти в шоурум.</p>' : "") +
      ((o || {}).when ? '<label class="form__check"><input type="checkbox" name="age18" data-req-check="Чтобы записаться на тест-драйв, подтвердите, что вам есть 18 лет и вы готовы внести залог."><span>Мне есть 18 лет, я готов внести залог на случай повреждений</span></label>' : "") + /* 26.10 (Михаил): обязательная галочка во всех формах тест-драйва */
      '<label class="form__check"><input type="checkbox" name="pd" data-req-check="Чтобы отправить заявку, отметьте согласие на обработку персональных данных."><span>Даю <a href="consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a></span></label>' + ((o || {}).ads ? '<label class="form__check"><input type="checkbox" name="ads"><span>Согласен(на) получать от ИП Тимохова М. С. сообщения о новинках и акциях 79BIKE по телефону, SMS и в мессенджерах. Отказаться можно в любой момент. <small style="display:block;color:var(--mute)">Необязательно: о старте продаж Lynx X сообщим и без этой отметки.</small></span></label>' : "") + '<button class="btn" type="submit">' + btn + '</button><p class="form__legal">' + (o.legal ? esc(o.legal) + " " : "") + 'Подробнее — в <a href="privacy.html" target="_blank" rel="noopener">Политике обработки персональных данных</a>.</p><p class="form__ok" aria-live="polite" data-ok="' + esc(ok) + '"></p></form></div>';
  }
  /* ---------- видеообзоры: карточки с обложкой ---------- */
  var VSRC = { vk: "VK Видео", youtube: "YouTube", rutube: "RUTUBE" }; /* local — свой ролик (mp4 на сайте), без значка площадки */
  function vPlat(v) { return v.platform || (/\.mp4(\?|$)/.test(v.url || "") ? "local" : /youtu/.test(v.url || "") ? "youtube" : /rutube/.test(v.url || "") ? "rutube" : "vk"); }
  function vItems(list, slug) { return (list || []).map(function (t) { return typeof t === "string" ? { slug: slug, title: t } : Object.assign({ slug: slug }, t); }); }
  /* ролик открывается во всплывающем окне сайта: встраиваемый плеер без ухода на площадку */
  function vEmbed(u) {
    var m;
    if (/\.mp4(\?|$)/.test(u)) return u;
    if ((m = u.match(/kinescope\.io\/(?:embed\/)?([\w-]{10,})/))) return "https://kinescope.io/embed/" + m[1] + "?autoplay=1"; /* 31.10: свои ролики в Kinescope */
    if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/))) return "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1&enablejsapi=1";
    if ((m = u.match(/video(-?\d+)_(\d+)/))) return "https://vkvideo.ru/video_ext.php?oid=" + m[1] + "&id=" + m[2] + "&hd=2&autoplay=1&js_api=1";
    if ((m = u.match(/rutube\.ru\/video\/(\w+)/))) return "https://rutube.ru/play/embed/" + m[1] + "?autoplay=1";
    return "";
  }
  function videoCards(items) {
    return '<div class="vgrid">' + items.map(function (v) {
      var pl = vPlat(v), src = VSRC[pl] || "", meta = [v.author, v.views].filter(Boolean).join(" · ");
      var pic = v.cover ? '<img src="' + esc(v.cover) + '" alt="" width="960" height="540" loading="lazy" decoding="async">' : '<span class="vcard__fb">' + imgTag(v.slug, photoV(firstImg(v.slug), "-m"), "", ' loading="lazy" decoding="async"') + "</span>";
      var emb = vEmbed(v.url || "");
      return '<a class="vcard" href="' + esc(v.url || RUTUBE) + '"' + (emb ? ' data-embed="' + esc(emb) + '" data-vt="' + esc(v.title) + '" data-vp="' + pl + '"' : ' target="_blank" rel="noopener"') + ' aria-label="' + esc(v.title + (src ? " — " + src : "") + (v.duration ? ", " + v.duration : "") + (emb ? " (смотреть здесь)" : " (откроется в новой вкладке)")) + '">' +
        '<span class="vcard__pic">' + pic + '<span class="vcard__shade" aria-hidden="true"></span><span class="vcard__play" aria-hidden="true">' + ICON.play + "</span>" +
        (src ? '<span class="vcard__src vcard__src--' + pl + '" aria-hidden="true">' + src + "</span>" : "") + (v.duration ? '<span class="vcard__dur" aria-hidden="true">' + esc(v.duration) + "</span>" : "") + "</span>" +
        '<span class="vcard__body"><span class="vcard__t">' + esc(v.title) + "</span>" + (v.desc ? '<span class="vcard__d">' + esc(v.desc) + "</span>" : "") + (meta ? '<span class="vcard__m">' + esc(meta) + "</span>" : "") + "</span></a>";
    }).join("") + "</div>";
  }
  function homeVideos() {
    var R = C.reviews || {}, pin = R.pinned || {};
    return (R.home || []).map(function (h) { var v = (pin[h.slug] || [])[h.i || 0]; return v ? Object.assign({ slug: h.slug }, v) : null; }).filter(Boolean);
  }
  function cmpTable(list, full) {
    var rows = (window.SPEC_ROWS || []).slice();
    var SL = { powerKw: "Мощность", speedKmh: "Скорость", capacityAh: "Батарея", rangeKm: "Запас хода", weightKg: "Вес", seatMm: "Сиденье", chargeH: "Зарядка" };
    if (!full) rows = rows.filter(function (r) { return SL[r.key]; }).map(function (r) { return { key: r.key, unit: r.unit, label: SL[r.key] }; });
    var body = rows.map(function (r) {
      var vals = list.map(function (s) { return fmt(bySlug(s), r.key, r.unit); });
      var same = vals.every(function (v) { return v === vals[0]; });
      return '<tr' + (same && full ? ' class="is-same"' : "") + '><th scope="row">' + esc(r.label) + "</th>" + vals.map(function (v, i) { return '<td data-col="' + list[i] + '">' + esc(v) + "</td>"; }).join("") + "</tr>";
    }).join("");
    body += '<tr class="is-price"><th scope="row">Цена</th>' + list.map(function (s) { var m = bySlug(s); return '<td data-col="' + s + '">' + (m.price ? money(m.price) : "Скоро") + "</td>"; }).join("") + "</tr>";
    if (full) body += '<tr class="is-go"><th scope="row"></th>' + list.map(function (s) { return '<td data-col="' + s + '"><a class="btn btn--main" href="' + FILE[s] + '" style="min-height:44px;padding:0 14px;font-size:14px">Подробнее</a></td>'; }).join("") + "</tr>";
    return '<div class="cmp' + (full ? " cmp-full" : "") + '" id="' + (full ? "cmp-full" : "cmp-short") + '"><table><caption class="vh">Характеристики моделей</caption><thead><tr><th scope="col">Модель</th>' + list.map(function (s) { return '<th scope="col" data-col="' + s + '"><a href="' + FILE[s] + '" style="text-decoration:none">' + esc(SHORT[s]) + "</a></th>"; }).join("") + "</tr></thead><tbody>" + body + '</tbody></table></div><p class="cmp-hint">Таблица прокручивается вбок</p>';
  }
  function plural(n, a, b, c) { var k = n % 10, h = n % 100; return k === 1 && h !== 11 ? a : k >= 2 && k <= 4 && (h < 10 || h >= 20) ? b : c; }
  function fmt(m, key, unit) {
    var v = m.specs[key];
    if (key === "colors") { var c = m.colors || {}; if (c.names && c.names.length) return c.names.join(", "); return (c.frame || []).join(", ") + (c.accents && c.accents.length ? "; вставки: " + c.accents.join(", ").toLowerCase() : ""); }
    if (v == null || v === "") return "—";
    if (typeof v === "boolean") return v ? "Есть" : "Нет";
    if (key === "dimensions" && typeof v === "object") return v.lengthMm + " × " + v.widthMm + " × " + v.heightMm + " мм";
    if (key === "wheels" && typeof v === "object") return v.front === v.rear ? v.front : "перед " + v.front + ", зад " + v.rear;
    if (key === "cells") return (m.specs.voltage ? m.specs.voltage + " В, " : "") + v;
    if (typeof v === "object") return Object.keys(v).map(function (k) { return v[k]; }).join(", ");
    return num(v) + (unit ? " " + unit : "");
  }

  /* ---------- выбор цвета: рама и вставки ---------- */
  function accPl(a) { return a ? String(a).replace(/(ый|ой)$/, "ые").replace(/ий$/, "ие") : "Без вставок"; }
  function chipsHtml(s, ci) {
    var vs = photos(s); if (vs.length < 2) return vs.length ? '<p class="cpick__val">Цвет: <b>' + esc(vs[0].label) + "</b></p>" : "";
    var c = vs[ci], split = vs.some(function (v) { return v.accent; });
    function chip(attr, p, name, on, dis) { return '<button type="button" class="chip" ' + attr + ' aria-pressed="' + on + '"' + (dis ? " disabled" : "") + '><i style="background:' + (PAINT[p] || "#999") + '"></i>' + esc(name) + "</button>"; }
    var html;
    if (!split) html = '<div class="cpick__row"><span class="cpick__label">Цвет</span><span class="cpick__list">' + vs.map(function (v, i) { return chip('data-pick="' + i + '"', v.paint[0], v.label, i === ci, false); }).join("") + "</span></div>";
    else {
      var fr = [], ac = [];
      vs.forEach(function (v) { if (!fr.some(function (f) { return f.n === v.frame; })) fr.push({ n: v.frame, p: v.paint[0] }); var an = v.accent || ""; if (!ac.some(function (x) { return x.n === an; })) ac.push({ n: an, p: v.accent ? v.paint[1] : v.paint[0] }); });
      ac.sort(function (x, y) { return (x.n === "") - (y.n === ""); });
      html = (fr.length > 1 ? '<div class="cpick__row"><span class="cpick__label">Рама</span><span class="cpick__list">' + fr.map(function (f) { return chip('data-frame="' + esc(f.n) + '"', f.p, f.n, f.n === c.frame, false); }).join("") + "</span></div>" : "") +
        '<div class="cpick__row"><span class="cpick__label">Вставки</span><span class="cpick__list">' + ac.map(function (x) { var ok = vs.some(function (v) { return v.frame === c.frame && (v.accent || "") === x.n; }); return chip('data-accent="' + esc(x.n) + '"', x.p, (x.n ? accPl(x.n) : ((vs.filter(function (v) { return !v.accent && v.label !== v.frame; })[0] || {}).label || accPl("")).replace(/\s*\(.*\)$/, "")), x.n === (c.accent || ""), !ok); }).join("") + "</span></div>";
    }
    return html + '<p class="cpick__val">' + vs.length + ' ' + plural(vs.length, 'расцветка', 'расцветки', 'расцветок') + ' · <b>' + esc(c.label) + "</b></p>";
  }

  /* ---------- визуализатор: райдер сидит на байке, в одном масштабе ---------- */
  function vizHtml(id) {
    return '<div class="viz" id="' + id + '"><div class="viz__stage"><div class="viz__pose" role="group" aria-label="Положение райдера"><button type="button" data-pose="sit" aria-pressed="true">Сидя</button><button type="button" data-pose="stand" aria-pressed="false">Стойка</button><button type="button" data-pose="ground" aria-pressed="false">Стоя</button></div><svg class="viz__svg" id="' + id + '-svg" role="img" ><g id="' + id + '-grid"></g><g id="' + id + '-back"></g><image id="' + id + '-img" class="viz__bike" preserveAspectRatio="none"/><g id="' + id + '-dyn"></g></svg><p class="viz__legend"><span><i class="viz__k viz__k--seat"></i>высота сиденья</span><span><i class="viz__k viz__k--legm"></i>длина ног</span></p></div>' +
      '<div class="viz__side"><div class="viz__params"><div class="vparam"><div class="height"><span style="color:var(--soft)">Ваш рост</span><div class="stepper"><button type="button" id="' + id + '-minus" aria-label="Рост меньше на 1 см">' + ICON.minus + '</button><output id="' + id + '-h" aria-live="polite">175 <small>см</small></output><button type="button" id="' + id + '-plus" aria-label="Рост больше на 1 см">' + ICON.plus + '</button></div></div>' +
      '<input class="range" id="' + id + '-r" type="range" min="' + H_MIN + '" max="' + H_MAX + '" step="1" value="175" aria-label="Рост, см"></div>' +
      /* 26.10.2026 (одобрено Михаилом): вес райдера — сверка с максимальной нагрузкой модели; 27.10 — меняет комплекцию райдера на рисунке */
      '<div class="vparam"><div class="height"><span style="color:var(--soft)">Ваш вес</span><div class="stepper"><button type="button" id="' + id + '-wminus" aria-label="Вес меньше на 1 кг">' + ICON.minus + '</button><output id="' + id + '-w" aria-live="polite">75 <small>кг</small></output><button type="button" id="' + id + '-wplus" aria-label="Вес больше на 1 кг">' + ICON.plus + '</button></div></div>' +
      '<input class="range" id="' + id + '-wr" type="range" min="' + W_MIN + '" max="' + W_MAX + '" step="1" value="75" aria-label="Вес, кг"></div></div>' +
      '<p class="fit" id="' + id + '-cap" aria-live="polite"></p><p class="fit fit--w" id="' + id + '-wcap" aria-live="polite"></p></div></div>'; /* 26.10: таблица и пояснение под ней убраны (правка 15) */
  }

  /* фото сбоку, где байк смотрит влево (передом налево) */
  var SIDE_LEFT = { "assets/photos/light-black-2.webp": 1, "assets/photos/pro-black-1.webp": 1, "assets/photos/pro-black-grey-1.webp": 1, "assets/photos/pro-black-red-2.webp": 1, "assets/photos/pro-black-violet-1.webp": 1, "assets/photos/pro-silver-red-1.webp": 1, "assets/photos/pro-silver-red-2.webp": 1, "assets/photos/pro-silver-yellow-1.webp": 1, "assets/photos/pro-silver-yellow-2.webp": 1 };
  /* вырезанные фото (все смотрят вправо): [ширина, высота, ось заднего колеса x, ось переднего x, линия земли y, x середины сиденья, y верха сиденья], px */
  var CUT_GEO = {"gt":[1314,836,218.5,1099.0,835,570,245],"pro":[1160,697,196.0,971.5,696,506,182],"lynx-trail":[1185,724,188.5,986.5,723,507,178],"light":[1281,774,212.5,1069.0,773,555,204],"lynx-x":[769,509,119.4,645.5,508,329,142],"surge-v":[1300,778,213.0,1085.5,746,562,180]};
  /* фото райдера сидя: размер, точка посадки (cx, cy), верх шлема, px */
  var RIDER_GEO = { w: 524, h: 1166, cx: 140, cy: 740, top: 0, top_x: 200, hand: [478, 475], hip: [150, 690], knee: [445, 690], foot: [400, 1148] };
  /* точки посадки на вырезанных фото, px: S — где сидит райдер (верх сиденья), P — подножка, G — центр грипса руля */
  var CUT_LM = { gt: { S: [470, 235], P: [500, 585], G: [850, 35] }, pro: { S: [440, 165], P: [470, 490], G: [735, 70] }, "lynx-trail": { S: [450, 178], P: [450, 510], G: [740, 25] },
    light: { S: [500, 205], P: [495, 525], G: [815, 25] }, "lynx-x": { S: [340, 125], P: [300, 368], G: [500, 20] }, "surge-v": { S: [530, 172], P: [535, 555], G: [785, 40] } };
  /* райдер в экипировке, сидящий на байке. Всё в мм, y вверх, перед байка справа (x растёт к переду). */
  function riderParts(Hm, seat, L, topMm) {
    var f = L / 1900;
    var hip = [L - 1170 * f, seat + 0.07 * Hm];
    var grip = [L - 680 * f, topMm - 55];
    var peg = [L - 1140 * f, 335];
    var th = 0.245 * Hm, sh = 0.24 * Hm, ank = 0.045 * Hm, ft = 0.15 * Hm, ua = 0.172 * Hm, fa = 0.175 * Hm, tor = 0.29 * Hm;
    function ik(A, B, l1, l2, pickFwd) {
      var dx = B[0] - A[0], dy = B[1] - A[1], d = Math.sqrt(dx * dx + dy * dy), reach = l1 + l2 - 0.5;
      var ux = dx / d, uy = dy / d;
      if (d >= reach) return { j: [A[0] + ux * l1, A[1] + uy * l1], e: [A[0] + ux * reach, A[1] + uy * reach], short: d - reach };
      var a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
      var c = Math.cos(a), sn = Math.sin(a);
      var k1 = [A[0] + l1 * (ux * c - uy * sn), A[1] + l1 * (ux * sn + uy * c)], k2 = [A[0] + l1 * (ux * c + uy * sn), A[1] + l1 * (-ux * sn + uy * c)];
      return { j: pickFwd(k1, k2) ? k1 : k2, e: B.slice(), short: 0 };
    }
    var fwd = function (a, b) { return a[0] > b[0]; }, low = function (a, b) { return a[1] < b[1]; };
    // корпус: наклон, при котором руки слегка согнуты
    var best = null;
    for (var t = 8; t <= 40; t += 1) {
      var r = t * Math.PI / 180, S = [hip[0] + tor * Math.sin(r), hip[1] + tor * Math.cos(r)];
      var dd = Math.hypot(grip[0] - S[0], grip[1] - S[1]), score = Math.abs(dd - 0.9 * (ua + fa));
      if (!best || score < best.sc) best = { sc: score, S: S, r: r };
    }
    var S = best.S, lean = best.r;
    var high = function (a, b) { return a[1] > b[1]; };
    var arm = ik(S, grip, ua, fa, high);
    // ближняя нога — тянется к земле
    var diff = 0.46 * Hm - seat, foot;
    var gx = hip[0] + (diff >= 0 ? 0.13 : 0.07) * Hm;
    var leg, toe, heel, gap = 0;
    if (diff >= 0) {
      leg = ik(hip, [gx, ank], th, sh, fwd); toe = [leg.e[0] + 0.115 * Hm, 0]; heel = [leg.e[0] - 0.04 * Hm, 0]; foot = "flat";
    } else if (diff >= -60) {
      leg = ik(hip, [gx, ank - diff], th, sh, fwd);
      var tl = 0.12 * Hm, h0 = leg.e[1], ang = Math.asin(Math.min(1, h0 / tl));
      toe = [leg.e[0] + tl * Math.cos(ang), 0]; heel = [leg.e[0] - 0.035 * Hm * Math.cos(ang), leg.e[1] + 0.035 * Hm * Math.sin(ang)]; foot = "toe";
    } else {
      leg = ik(hip, [gx + 0.02 * Hm, -2000], th, sh, fwd);
      var tl2 = 0.12 * Hm, ang2 = 62 * Math.PI / 180;
      toe = [leg.e[0] + tl2 * Math.cos(ang2), leg.e[1] - tl2 * Math.sin(ang2)]; heel = [leg.e[0] - 0.03 * Hm, leg.e[1] + 0.02 * Hm]; foot = "hang"; gap = Math.max(0, toe[1]);
    }
    // дальняя нога — на подножке
    var far = ik(hip, [peg[0] + 0.02 * Hm, peg[1] + ank], th, sh, fwd);
    var farToe = [far.e[0] + 0.11 * Hm, peg[1] - 5], farHeel = [far.e[0] - 0.04 * Hm, peg[1]];
    var farArm = ik([S[0] - 0.02 * Hm, S[1]], [grip[0] - 0.015 * Hm, grip[1] + 10], ua, fa, high);
    // голова в шлеме
    var hr = Math.max(0.12, lean * 0.45), nb = [S[0] + 0.035 * Hm * Math.sin(lean), S[1] + 0.035 * Hm * Math.cos(lean)];
    var hc = [nb[0] + 0.06 * Hm * Math.sin(hr) + 0.015 * Hm, nb[1] + 0.06 * Hm * Math.cos(hr)];
    return { H: Hm, hip: hip, S: S, lean: lean, arm: arm, farArm: farArm, grip: grip, leg: leg, toe: toe, heel: heel, foot: foot, gap: gap, far: far, farToe: farToe, farHeel: farHeel, hc: hc, nb: nb, top: hc[1] + 0.075 * Hm };
  }
  function riderSvg(R, L, flip) {
    var Hm = R.H, dirF = flip ? -1 : 1;
    function X(p) { return Math.round(flip ? L - p[0] : p[0]); }
    function Y(p) { return Math.round(-p[1]); }
    function P(p) { return X(p) + "," + Y(p); }
    function add(p, v, k) { return [p[0] + v[0] * k, p[1] + v[1] * k]; }
    // сужающийся сегмент: трапеция + скругления на концах
    function limb(a, b, wa, wb, c) {
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, n = [-dy / d, dx / d];
      return '<path d="M' + P(add(a, n, wa / 2)) + " L" + P(add(b, n, wb / 2)) + " L" + P(add(b, n, -wb / 2)) + " L" + P(add(a, n, -wa / 2)) + 'Z" fill="' + c + '"/>' +
        '<circle cx="' + X(a) + '" cy="' + Y(a) + '" r="' + Math.round(wa / 2) + '" fill="' + c + '"/><circle cx="' + X(b) + '" cy="' + Y(b) + '" r="' + Math.round(wb / 2) + '" fill="' + c + '"/>';
    }
    function boot(ank, toe, heel, c) {
      // голенище + стопа
      var up = [ank[0] - 0.012 * Hm, ank[1] + 0.12 * Hm];
      var sole = '<line x1="' + X(heel) + '" y1="' + Y(heel) + '" x2="' + X(toe) + '" y2="' + Y(toe) + '" stroke="#55565F" stroke-width="' + Math.round(0.012 * Hm) + '" stroke-linecap="round"/>';
      return limb(up, ank, 0.07 * Hm, 0.068 * Hm, c) + '<path d="M' + P([ank[0] - 0.03 * Hm, ank[1] + 0.03 * Hm]) + " L" + P([ank[0] + 0.035 * Hm, ank[1] + 0.02 * Hm]) + " L" + P(toe) + " L" + P(heel) + 'Z" fill="' + c + '" stroke="' + c + '" stroke-width="' + Math.round(0.02 * Hm) + '" stroke-linejoin="round"/>' + sole +
        '<line x1="' + X([up[0] - 0.03 * Hm, up[1] - 0.035 * Hm]) + '" y1="' + Y([0, up[1] - 0.035 * Hm]) + '" x2="' + X([up[0] + 0.035 * Hm, up[1] - 0.035 * Hm]) + '" y2="' + Y([0, up[1] - 0.035 * Hm]) + '" stroke="#6E7080" stroke-width="' + Math.round(0.008 * Hm) + '"/>';
    }
    var jersey = "#30323F", jersey2 = "#24252F", pants = "#1F2029", pantsF = "#2B2C36", glove = "#121318", bootC = "#101116", bootF = "#26272F", acc = "#7658F5";
    var back = boot(R.far.e, R.farToe, R.farHeel, bootF) + limb(R.hip, R.far.j, 0.11 * Hm, 0.075 * Hm, pantsF) + limb(R.far.j, R.far.e, 0.07 * Hm, 0.06 * Hm, pantsF) +
      limb([R.S[0] - 0.015 * Hm, R.S[1] - 0.01 * Hm], R.farArm.j, 0.06 * Hm, 0.05 * Hm, jersey2) + limb(R.farArm.j, R.farArm.e, 0.05 * Hm, 0.042 * Hm, jersey2) +
      '<circle cx="' + X(R.farArm.e) + '" cy="' + Y(R.farArm.e) + '" r="' + Math.round(0.026 * Hm) + '" fill="' + glove + '"/>';
    var tx = Math.sin(R.lean), ty = Math.cos(R.lean), ax = [tx, ty], nx = [ty, -tx]; // ось корпуса и нормаль (вперёд)
    var hipB = add(add(R.hip, nx, -0.06 * Hm), ax, -0.01 * Hm), hipF = add(R.hip, nx, 0.055 * Hm);
    var chest = add(add(R.S, nx, 0.065 * Hm), ax, -0.07 * Hm), shF = add(R.S, nx, 0.035 * Hm), shB = add(add(R.S, nx, -0.055 * Hm), ax, -0.02 * Hm), back1 = add(add(R.hip, nx, -0.075 * Hm), ax, 0.16 * Hm);
    var torso = '<path d="M' + P(hipB) + " Q" + P(back1) + " " + P(shB) + " Q" + P(add(R.S, ax, 0.03 * Hm)) + " " + P(shF) + " Q" + P(chest) + " " + P(add(hipF, ax, 0.08 * Hm)) + " L" + P(hipF) + 'Z" fill="' + jersey + '"/>' +
      '<path d="M' + P(add(add(R.hip, nx, -0.06 * Hm), ax, 0.06 * Hm)) + " Q" + P(add(add(R.hip, nx, -0.07 * Hm), ax, 0.17 * Hm)) + " " + P(add(add(R.S, nx, -0.045 * Hm), ax, -0.04 * Hm)) + '" fill="none" stroke="' + acc + '" stroke-width="' + Math.round(0.016 * Hm) + '" stroke-linecap="round"/>' +
      // номерная полоса-пояс
      limb(add(R.hip, nx, -0.065 * Hm), add(R.hip, nx, 0.055 * Hm), 0.03 * Hm, 0.03 * Hm, "#17181F");
    // шлем-кроссовый: купол, подбородок, козырёк, очки
    var c = R.hc, r = 0.07 * Hm, F = function (u, v) { return [c[0] + u * r, c[1] + v * r]; };
    var helmet = '<path d="M' + P(F(-0.98, -0.1)) + " C" + P(F(-1.0, 0.95)) + " " + P(F(0.55, 1.2)) + " " + P(F(0.98, 0.3)) + " L" + P(F(1.05, -0.05)) + " L" + P(F(1.45, -0.55)) + " Q" + P(F(1.35, -1.0)) + " " + P(F(0.75, -1.0)) + " L" + P(F(-0.2, -0.95)) + " Q" + P(F(-0.85, -0.75)) + " " + P(F(-0.98, -0.1)) + 'Z" fill="#EDEDF1" stroke="#0B0B0F" stroke-width="' + Math.round(0.005 * Hm) + '" stroke-linejoin="round"/>' +
      // козырёк
      '<path d="M' + P(F(-0.2, 0.98)) + " Q" + P(F(0.7, 1.12)) + " " + P(F(1.75, 0.62)) + " L" + P(F(0.95, 0.42)) + 'Z" fill="' + acc + '"/>' +
      // проём под очки и очки
      '<path d="M' + P(F(0.42, 0.32)) + " L" + P(F(1.02, 0.28)) + " L" + P(F(1.06, -0.12)) + " L" + P(F(0.45, -0.08)) + 'Z" fill="#0B0B0F"/>' +
      '<path d="M' + P(F(0.5, 0.22)) + " L" + P(F(0.98, 0.19)) + " L" + P(F(1.0, -0.03)) + " L" + P(F(0.52, -0.01)) + 'Z" fill="#C9A227" opacity=".85"/>' +
      '<path d="M' + P(F(0.42, 0.12)) + " L" + P(F(-0.75, 0.25)) + '" stroke="#0B0B0F" stroke-width="' + Math.round(0.014 * Hm) + '" stroke-linecap="round"/>' +
      // подбородочная часть: вентиляция
      '<path d="M' + P(F(1.12, -0.45)) + " L" + P(F(0.85, -0.78)) + '" stroke="#55565F" stroke-width="' + Math.round(0.01 * Hm) + '" stroke-linecap="round"/>' +
      '<path d="M' + P(F(-0.85, -0.35)) + " Q" + P(F(-0.2, -0.55)) + " " + P(F(0.4, -0.85)) + '" stroke="' + acc + '" stroke-width="' + Math.round(0.012 * Hm) + '" fill="none" stroke-linecap="round"/>';
    var neck = limb(R.S, R.nb, 0.065 * Hm, 0.06 * Hm, jersey);
    var front = limb(R.hip, R.leg.j, 0.125 * Hm, 0.08 * Hm, pants) + limb(R.leg.j, R.leg.e, 0.078 * Hm, 0.06 * Hm, pants) +
      limb(add(R.leg.j, [0, 1], 0.035 * Hm), add(R.leg.j, [0, -1], 0.07 * Hm), 0.058 * Hm, 0.052 * Hm, "#3A3C4A") + // наколенник
      boot(R.leg.e, R.toe, R.heel, bootC) +
      torso + neck + helmet +
      limb([R.S[0] + 0.01 * Hm, R.S[1] - 0.015 * Hm], R.arm.j, 0.068 * Hm, 0.054 * Hm, jersey) + limb(R.arm.j, R.arm.e, 0.054 * Hm, 0.045 * Hm, jersey) +
      limb(add(R.arm.e, [R.arm.e[0] - R.arm.j[0], R.arm.e[1] - R.arm.j[1]], -0.12), R.arm.e, 0.05 * Hm, 0.046 * Hm, glove) +
      '<circle cx="' + X(R.grip) + '" cy="' + Y(R.grip) + '" r="' + Math.round(0.03 * Hm) + '" fill="' + glove + '"/>';
    var gapSvg = "";
    if (R.gap > 5) {
      var gx = X([R.toe[0], 0]);
      gapSvg = '<line x1="' + gx + '" x2="' + gx + '" y1="' + Y(R.toe) + '" y2="0" class="viz__gap"/>' +
        '<text x="' + (gx + dirF * 50) + '" y="' + Math.round(-R.gap / 2 + 20) + '" class="viz__lab viz__lab--gap" text-anchor="' + (flip ? "end" : "start") + '">−' + Math.round(R.gap / 10) + ' см</text>';
    }
    return { back: back, front: front + gapSvg };
  }
  var SIDE_DEFAULT = { gt: "assets/photos/gt-black-1.webp", pro: "assets/photos/pro-black-violet-1.webp", "lynx-trail": "assets/photos/lynx-black-violet-1.webp", light: "assets/photos/light-black-1.webp", "lynx-x": "assets/photos/lynx-x-black-1.webp", "surge-v": "assets/photos/surge-v-white-1.webp" };
  function sideSrc(s, colorIdx) {
    var B = window.SIDE_BOX || {}, v = photos(s)[colorIdx || 0];
    function side(x) { if (x) for (var i = 0; i < x.images.length; i++) if (x.images[i].view === "side" && B[x.images[i].src]) return x.images[i].src; return null; }
    var r = side(v); if (r) return r;
    var all = photos(s);
    if (v) for (var j = 0; j < all.length; j++) if (all[j].frame === v.frame && (r = side(all[j]))) return r;
    return SIDE_DEFAULT[s];
  }
  function sideLabel(s, src) {
    var all = photos(s);
    for (var j = 0; j < all.length; j++) for (var i = 0; i < all[j].images.length; i++) if (all[j].images[i].src === src) return all[j].label;
    return "";
  }
  function riderPath(H, x) {
    var u = H / 100, hr = 6.3 * u, sh = 82 * u, hip = 52 * u, legW = 6.6 * u, torsoW = 19 * u, gap = 1.4 * u, p = [];
    p.push('<circle cx="' + x + '" cy="' + (-(H - hr)) + '" r="' + hr + '"/>');
    p.push('<rect x="' + (x - 2.4 * u) + '" y="' + (-(H - 2 * hr + 0.5 * u)) + '" width="' + 4.8 * u + '" height="' + 3 * u + '" rx="' + u + '"/>');
    p.push('<rect x="' + (x - torsoW / 2) + '" y="' + (-sh) + '" width="' + torsoW + '" height="' + (sh - hip + 4 * u) + '" rx="' + 5 * u + '"/>');
    p.push('<rect x="' + (x - torsoW / 2 - 5.2 * u) + '" y="' + (-sh + 1.5 * u) + '" width="' + 4.6 * u + '" height="' + 36 * u + '" rx="' + 2.3 * u + '"/>');
    p.push('<rect x="' + (x + torsoW / 2 + 0.6 * u) + '" y="' + (-sh + 1.5 * u) + '" width="' + 4.6 * u + '" height="' + 36 * u + '" rx="' + 2.3 * u + '"/>');
    p.push('<rect x="' + (x - gap / 2 - legW) + '" y="' + (-hip - 2 * u) + '" width="' + legW + '" height="' + (hip + 2 * u) + '" rx="' + 3 * u + '"/>');
    p.push('<rect x="' + (x + gap / 2) + '" y="' + (-hip - 2 * u) + '" width="' + legW + '" height="' + (hip + 2 * u) + '" rx="' + 3 * u + '"/>');
    return p.join("");
  }
  function dimsSvg(m, src, B) {
    var d = m.specs.dimensions || {}, sp = m.specs, L = d.lengthMm, Hh = d.heightMm, seat = sp.seatMm, wb = sp.wheelbaseMm, cl = sp.clearanceMm;
    if (!B || !L) return null;
    var k = L / (B[4] - B[2]), fs = 62, o = [];
    function arrowH(x1, x2, y, lab) { return '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y + '" y2="' + y + '" class="dims__ln" marker-start="url(#dm-a)" marker-end="url(#dm-a)"/><text x="' + (x1 + x2) / 2 + '" y="' + (y - 22) + '" text-anchor="middle" class="dims__t">' + lab + '</text>'; }
    o.push('<defs><marker id="dm-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7658F5"/></marker></defs>');
    o.push('<image href="' + esc(photoV(src, "-m")) + '" x="' + (-B[2] * k) + '" y="' + (-B[5] * k) + '" width="' + (B[0] * k) + '" height="' + (B[1] * k) + '" preserveAspectRatio="none" class="dims__bike"' + (m.slug === "surge-v" ? ' style="filter:brightness(1.17) contrast(1.04)"' : "") + '/>');
    o.push('<line x1="-240" x2="' + (L + 120) + '" y1="0" y2="0" class="dims__g"/>');
    if (Hh) o.push('<line x1="-150" x2="-150" y1="0" y2="' + (-Hh) + '" class="dims__ln" marker-start="url(#dm-a)" marker-end="url(#dm-a)"/><line x1="-200" x2="' + L * 0.55 + '" y1="' + (-Hh) + '" y2="' + (-Hh) + '" class="dims__x"/><text x="-120" y="' + (-Hh - 26) + '" class="dims__t">' + Hh + ' мм</text>');
    if (seat) o.push('<line x1="' + L * 0.38 + '" x2="' + (L + 100) + '" y1="' + (-seat) + '" y2="' + (-seat) + '" class="dims__seat"/><text x="' + (L + 100) + '" y="' + (-seat - 26) + '" text-anchor="end" class="dims__t dims__t--acc">' + seat + ' мм</text>');
    if (cl) o.push('<line x1="' + L * 0.5 + '" x2="' + L * 0.5 + '" y1="0" y2="' + (-cl) + '" class="dims__ln" marker-start="url(#dm-a)" marker-end="url(#dm-a)"/><text x="' + (L * 0.5 + 30) + '" y="' + (-cl / 2 + fs / 3) + '" class="dims__t dims__t--halo">' + cl + ' мм</text>');
    if (wb) o.push(arrowH((L - wb) / 2, (L + wb) / 2, 130, "база " + wb + " мм"));
    o.push(arrowH(0, L, 290, "длина " + L + " мм"));
    return { vb: "-260 " + (-(Hh || 1100) - 130) + " " + (L + 400) + " " + ((Hh || 1100) + 470), svg: o.join("") };
  }
  function rangeNote(slug) {
    var gt = slug === "gt" ? '<p class="rng__gt"><b>Совет для Falcon GT.</b> У GT есть отдельный рекуперационный тормоз. Тормозите им, где это возможно: байк возвращает энергию в батарею, и заряда хватает надольше.</p>' : "";
    return '<div class="rng" id="rng" hidden><h3 class="h3">Сколько реально проедет байк</h3>' +
      '<p>Реальный пробег зависит от множества факторов: режима езды, веса райдера, уклона, стиля вождения, погоды и покрытия. Поэтому точную цифру заранее назвать нельзя, и производитель указывает диапазон.</p>' +
      '<div class="rng__two"><div class="rng__c rng__c--up"><b>Расход больше</b><ul><li>Большая нагрузка: тяжёлый райдер, затяжные подъёмы</li><li>Постоянная высокая скорость по ровной трассе</li><li>Рекуперация почти не работает</li></ul></div>' +
      '<div class="rng__c rng__c--down"><b>Расход меньше</b><ul><li>Пересечённая местность с частым сбросом газа</li><li>Спуски с горки</li><li>Работает рекуперация и возвращает энергию в батарею</li></ul></div></div>' + gt + '</div>';
  }
  var FIT_RANGE = { pro: [150, 185], gt: [150, 185], light: [150, 185], "lynx-trail": [155, 195], "lynx-x": [155, 195], "surge-v": [165, 195] };
  var H_MIN = 140, H_MAX = 205; /* рост в подборе — единый диапазон для всего сайта (решение Михаила 26.10.2026) */
  var W_MIN = 40, W_MAX = 150, FIT_KEY = "fb_fit"; /* вес райдера в примерке, кг; рост и вес запоминаем вместе */
  /* лимит веса для примерки: fitMaxKg (решение Михаила 26.10 — Surge V 130 кг), иначе паспортная нагрузка payloadKg */
  function fitMaxKg(m) { return m.fitMaxKg || (m.specs && m.specs.payloadKg) || 0; }
  function initViz(id, getSlug, getColor) {
    var svg = $(id + "-svg"); if (!svg) return null;
    var h = 175, w = 75, pose = "sit";
    try { var sv = JSON.parse(localStorage.getItem(FIT_KEY) || "{}") || {}; if (+sv.h >= H_MIN && +sv.h <= H_MAX) h = Math.round(+sv.h); if (+sv.w >= W_MIN && +sv.w <= W_MAX) w = Math.round(+sv.w); } catch (e) {}
    function store() { try { localStorage.setItem(FIT_KEY, JSON.stringify({ h: h, w: w })); } catch (e) {} }
    $(id).addEventListener("click", function (e) { var b = e.target.closest("[data-pose]"); if (!b) return; pose = b.getAttribute("data-pose"); $(id).querySelectorAll("[data-pose]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); render(); });
    function render() {
      var s = getSlug(), m = bySlug(s), fm = s === "lynx-x" ? (bySlug("lynx-trail") || m) : m /* Михаил 26.10: Lynx X и Lynx Trail одного размера — в примерке за основу Lynx Trail */, d = fm.specs.dimensions || { lengthMm: 1900, heightMm: 1100 }, seat = fm.specs.seatMm;
      var src = sideSrc(s, getColor ? getColor() : 0), B = (window.SIDE_BOX || {})[src];
      var H = h * 10, inseam = Math.round(H * 0.46), L = d.lengthMm, G = CUT_GEO[s] || CUT_GEO.pro;
      // масштаб байка — по колёсной базе (оси колёс на фото), мм на пиксель
      var wb = fm.specs.wheelbaseMm || 1270, k = s === "lynx-x" ? seat / (G[4] - CUT_LM["lynx-x"].S[1]) : wb / (G[3] - G[2]), /* Lynx X: фото снято в другом ракурсе — масштаб по высоте сиденья Lynx Trail, чтобы байки в примерке были одного размера */ /* у фото Lynx X масштаб по базе завышает сиденье на ~9 см — подгоняем к паспортной высоте сиденья */ bw = G[0] * k, bh = G[1] * k, gy = G[4] * k;
      var img = $(id + "-img");
      if (img.getAttribute("data-src") !== s) {
        img.setAttribute("href", cutSrc(s)); img.setAttribute("data-src", s);
        img.setAttribute("x", 0); img.setAttribute("y", Math.round(-gy)); img.setAttribute("width", Math.round(bw)); img.setAttribute("height", Math.round(bh));
      }
      img.style.display = ""; img.style.filter = "";
      /* рекомендуемый рост — данные 79BIKE (Михаил, 25.10): Pro, GT, Lite — 150–185 см; Lynx и Y-Volt — 155–195 см.
         Подвеска под весом райдера проседает (sag): при нижней границе роста райдер достаёт до земли носками */
      var FR = FIT_RANGE[s] || [150, 185], sag = Math.max(30, seat - (Math.round(FR[0] * 10 * 0.46) + 50)), effSeat = seat - sag;
      var diff = inseam - effSeat, inR = h >= FR[0] && h <= FR[1], verdict, ok = "1";
      var rng = FR[0] + "–" + FR[1] + "\u00a0см";
      if (h < FR[0]) { verdict = m.name + " — рекомендуемый рост " + rng + ". Приезжайте на примерку в шоурум: подскажем посадку и настройку подвески"; ok = "0"; }
      else if (h > FR[1]) { verdict = m.name + " — рекомендуемый рост " + rng + (FR[1] < 195 ? ". Для роста выше посмотрите Lynx Trail или Y\u2011Volt Surge V — до 195 см" : ". Приезжайте на примерку в шоурум — подберём посадку"); ok = "0"; }
      else if (diff >= 0) verdict = m.name + " подходит по росту (" + rng + "). Обе ноги уверенно стоят на земле";
      else verdict = m.name + " подходит по росту (" + rng + "). До земли достаёте носками — обычная посадка для эндуро";
      // райдер-фото: точка посадки (ягодицы) — на сиденье; масштаб — по росту (высота сидя ≈ 52% роста + шлем 4 см)
      /* посадка: масштаб райдера — по росту; таз на сиденье, наклон корпуса и место на сиденье подбираются так,
         чтобы ступни встали на подножки, а руки — на грипсы (как сидит райдер на эндуро) */
      var RG = RIDER_GEO, rs = (0.52 * H + 40) / (RG.cy - RG.top), LM = CUT_LM[s] || CUT_LM.pro;
      var S0 = [LM.S[0] * k, LM.S[1] * k - gy + 10], Pg = [LM.P[0] * k, LM.P[1] * k - gy], Gr = [LM.G[0] * k, LM.G[1] * k - gy]; // экранные мм: y вниз, земля = 0
      /* шарнирный райдер из одного фото: корпус (поворот вокруг таза) подбираем по грипсу,
         ноги — двухзвенная IK от тазобедренного сустава к подножке (колено вперёд-вверх) */
      function rot(v, a) { var c = Math.cos(a), sn = Math.sin(a); return [v[0] * c - v[1] * sn, v[0] * sn + v[1] * c]; }
      var vH = [(RG.hand[0] - RG.cx) * rs, (RG.hand[1] - RG.cy) * rs], best = null;
      for (var th = 0; th <= 28; th += 1) {
        var hd = rot(vH, th * Math.PI / 180);
        for (var dx = -220; dx <= 220; dx += 5) {
          var eh = Math.hypot(S0[0] + dx + hd[0] - Gr[0], S0[1] + hd[1] - Gr[1]);
          var cost = eh * eh + 8 * (th - 14) * (th - 14) + 0.3 * dx * dx;
          if (!best || cost < best.c) best = { c: cost, th: th, hx: S0[0] + dx };
        }
      }
      function tf(p, a, piv, sc) { return "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ") rotate(" + (a * 180 / Math.PI).toFixed(2) + ") scale(" + (sc || rs).toFixed(4) + ") translate(" + (-piv[0]) + " " + (-piv[1]) + ")"; }
      var tilt = best.th, ta = tilt * Math.PI / 180, seatPt = [best.hx, S0[1]];
      var hj = rot([(RG.hip[0] - RG.cx) * rs, (RG.hip[1] - RG.cy) * rs], ta); hj = [seatPt[0] + hj[0], seatPt[1] + hj[1]];
      var Lt = Math.hypot(RG.knee[0] - RG.hip[0], RG.knee[1] - RG.hip[1]) * rs, Ls = Math.hypot(RG.foot[0] - RG.knee[0], RG.foot[1] - RG.knee[1]) * rs;
      var torsoT = tf(seatPt, ta, [RG.cx, RG.cy]), topW = null;
      if (pose === "stand") {
        /* стоя на подножках: ноги почти прямые (колени чуть согнуты), таз над подножками, корпус наклонён к рулю */
        var vHh = [(RG.hand[0] - RG.hip[0]) * rs, (RG.hand[1] - RG.hip[1]) * rs], sb = null, reach = 0.93 * (Lt + Ls);
        for (var sdx = -160; sdx <= 60; sdx += 10) {
          var hp = [Pg[0] + sdx, Pg[1] - Math.sqrt(Math.max(0, reach * reach - sdx * sdx))];
          for (var sth = 10; sth <= 55; sth += 1) {
            var hh = rot(vHh, sth * Math.PI / 180), e2 = Math.hypot(hp[0] + hh[0] - Gr[0], hp[1] + hh[1] - Gr[1]);
            var c2 = e2 * e2 + 14 * (sth - 22) * (sth - 22) + 0.5 * (sdx + 50) * (sdx + 50);
            if (!sb || c2 < sb.c) sb = { c: c2, hp: hp, th: sth };
          }
        }
        hj = sb.hp; tilt = sb.th; ta = tilt * Math.PI / 180; torsoT = tf(hj, ta, RG.hip);
        var tw = rot([(RG.top_x - RG.hip[0]) * rs, (0 - RG.hip[1]) * rs], ta); topW = [hj[0] + tw[0], hj[1] + tw[1]];
      }
      var tgt = Pg, legK = 1;
      if (pose === "ground") {
        /* стоя: ноги на земле, байк между ног. Хватает длины ног — стоит над сиденьем; не хватает — сидит на передней части сиденья, ноги тянутся к земле */
        var Ltot = Lt + Ls, Ft = [Pg[0] + 40, 0], hipOff = (RG.hip[1] - RG.cy) * rs;
        /* высота паха = длина ног по росту (inseam), как в подписи; тазобедренный сустав выше паха на |hipOff| */
        /* сиденье под весом проседает на sag: в рекомендуемом росте стопа достаёт до земли (носком), ниже — чуть не достаёт */
        var hipSeat = S0[1] + hipOff + 0.5 * sag, reachLeg = inseam + (h >= FR[0] ? 0.5 * sag + 50 : 0);
        legK = Math.min(1.12, (reachLeg - hipOff) / (0.997 * Ltot)); Lt *= legK; Ls *= legK; Ltot = Lt + Ls;
        if (inseam >= seat) { hj = [Ft[0] - 20, -Math.min(inseam - hipOff, 0.997 * Ltot)]; }
        else { hj = [Ft[0] - 20, hipSeat]; if (h < FR[0]) Ft = [Ft[0], -Math.max(0, effSeat - 50 - inseam)]; } // ниже рекомендуемого роста — стопа чуть над землёй, без красных меток
        var vHg = [(RG.hand[0] - RG.hip[0]) * rs, (RG.hand[1] - RG.hip[1]) * rs], gb = null;
        for (var gth = -5; gth <= 45; gth += 1) {
          var gh = rot(vHg, gth * Math.PI / 180), ge = Math.hypot(hj[0] + gh[0] - Gr[0], hj[1] + gh[1] - Gr[1]);
          var gc = ge * ge + 10 * (gth - 10) * (gth - 10);
          if (!gb || gc < gb.c) gb = { c: gc, th: gth };
        }
        tilt = gb.th; ta = tilt * Math.PI / 180; torsoT = tf(hj, ta, RG.hip);
        var tg = rot([(RG.top_x - RG.hip[0]) * rs, (0 - RG.hip[1]) * rs], ta); topW = [hj[0] + tg[0], hj[1] + tg[1]];
        tgt = Ft;
      }
      var dv = [tgt[0] - hj[0], tgt[1] - hj[1]], dd = Math.hypot(dv[0], dv[1]), u = [dv[0] / dd, dv[1] / dd], kn, ft;
      if (dd >= Lt + Ls - 1) { kn = [hj[0] + u[0] * Lt, hj[1] + u[1] * Lt]; ft = [hj[0] + u[0] * (Lt + Ls - 1), hj[1] + u[1] * (Lt + Ls - 1)]; }
      else {
        var ca = (Lt * Lt + dd * dd - Ls * Ls) / (2 * Lt * dd), aa = Math.acos(Math.max(-1, Math.min(1, ca)));
        var k1 = rot(u, -aa), k2 = rot(u, aa), kk = k1[0] > k2[0] ? k1 : k2; // колено вперёд
        kn = [hj[0] + kk[0] * Lt, hj[1] + kk[1] * Lt]; ft = tgt.slice();
      }
      var a0t = Math.atan2(RG.knee[1] - RG.hip[1], RG.knee[0] - RG.hip[0]), a0s = Math.atan2(RG.foot[1] - RG.knee[1], RG.foot[0] - RG.knee[0]);
      var at = Math.atan2(kn[1] - hj[1], kn[0] - hj[0]), as = Math.atan2(ft[1] - kn[1], ft[0] - kn[0]);
      var IMG = '<image href="assets/photos/rider-seat.webp?v=2" x="0" y="0" width="' + RG.w + '" height="' + RG.h + '"/>';
      var CP = { shin: "290,700 524,680 524,1166 240,1166", thigh: "100,592 300,592 524,630 524,790 330,800 100,800", torso: "0,0 524,0 524,585 320,585 245,598 205,640 195,820 0,820" }; /* 26.10.2026: граница корпуса выше бедра — без «обрубка» бедра при наклоне ноги */
      /* 27.10 (Михаил): комплекция райдера по весу — толщина корпуса, бедра и голени по ИМТ (рост и вес); шлем, руки и посадка не меняются */
      var gK = Math.max(0.84, Math.min(1.3, Math.sqrt((w / Math.pow(h / 100, 2)) / 23)));
      CP.head = "40,0 360,0 360,70 300,215 262,262 200,262 160,235 120,205 60,175 40,150"; CP.arms = "300,255 524,255 524,585 320,585 300,588"; CP.torso = "0,132 40,142 60,167 120,197 160,227 200,254 262,254 300,247 330,247 330,585 320,585 245,598 205,640 195,820 0,820"; /* 26.10 (Михаил): шлем вырезан по контуру, плечи и спина — в корпусе: при большом весе нет «ступеньки» у шеи */
      var GT = { torso: "translate(200 0) scale(" + gK.toFixed(3) + " 1) translate(-200 0)", thigh: "translate(0 690) scale(1 " + gK.toFixed(3) + ") translate(0 -690)", shin: "translate(425 0) scale(" + (1 + (gK - 1) * 0.8).toFixed(3) + " 1) translate(-425 0)", arms: "", head: "" };
      /* 31.10 (КК, жалоба Михаила): на iPhone (Safari) комплекция по весу не отображалась. Причины: вложенные <g transform> с clipPath внутри
         и CSS drop-shadow на группе (Safari обрезает фигуру по старому контуру). Теперь: одна группа на часть тела с общим transform,
         clipPath вне трансформированных групп, тень — SVG-фильтром с большой областью. В Chrome вид не изменился (проверено 31.10). */
      var man = '<g class="viz__man" style="filter:url(#' + id + '-sh)"><filter id="' + id + '-sh" filterUnits="userSpaceOnUse" x="-5000" y="-5000" width="12000" height="12000"><feDropShadow dx="0" dy="30" stdDeviation="15" flood-color="#000" flood-opacity=".18"/></filter>' + ["shin", "thigh", "arms", "torso", "head"].map(function (pt) {
        var t = pt === "torso" || pt === "arms" || pt === "head" ? torsoT : pt === "thigh" ? tf(hj, at - a0t, RG.hip, rs * legK) : tf(kn, as - a0s, RG.knee, rs * legK);
        return '<clipPath id="' + id + "-cp-" + pt + '"><polygon points="' + CP[pt] + '"/></clipPath><g clip-path="url(#' + id + "-cp-" + pt + ')" transform="' + t + (GT[pt] ? " " + GT[pt] : "") + '">' + IMG + "</g>";
      }).join("") + "</g>";
      var top0 = rot([(RG.top_x - RG.cx) * rs, (0 - RG.cy) * rs], ta);
      var hipX = seatPt[0], hipY = -seatPt[1], rx = 0, rw = 0;
      /* верх шлема — самая высокая из точек контура шлема после поворота корпуса */
      var hpiv = topW ? RG.hip : [RG.cx, RG.cy], hbase = topW ? hj : seatPt, headY = -1e9, headX = 0;
      [[60, 40], [150, 5], [250, 20], [345, 55]].forEach(function (q) { var w = rot([(q[0] - hpiv[0]) * rs, (q[1] - hpiv[1]) * rs], ta); if (-(hbase[1] + w[1]) > headY) { headY = -(hbase[1] + w[1]); } });
      var hc = rot([(200 - hpiv[0]) * rs, (40 - hpiv[1]) * rs], ta); headX = hbase[0] + hc[0];
      var top = Math.max(1500, Math.round(headY + 230)), W = bw + 60, x0 = -470;
      var grid = "";
      for (var y = 500; y <= top - 100; y += 500) grid += '<line x1="' + x0 + '" x2="' + W + '" y1="' + (-y) + '" y2="' + (-y) + '" class="viz__grid"/><text x="' + (x0 + 10) + '" y="' + (-y - 18) + '" class="viz__tick">' + y / 10 + ' см</text>';
      svg.setAttribute("viewBox", x0 + " " + (-top) + " " + Math.round(W - x0 + 40) + " " + (top + 90));
      $(id + "-grid").innerHTML = grid + '<clipPath id="' + id + '-clip"><rect x="-500" y="' + (-top - 500) + '" width="' + (W + 1000) + '" height="' + (top + 512) + '"/></clipPath>';
      img.setAttribute("clip-path", "url(#" + id + "-clip)");
      svg.setAttribute("aria-label", "Райдер ростом " + h + " см сидит на " + m.name + ". " + verdict + ".");
      $(id + "-back").innerHTML = "";
      // мерная линия: длина ног от земли (нейтрально, без «не хватает»)
      var lx = -150, leg = '<line x1="' + lx + '" x2="' + lx + '" y1="0" y2="' + (-inseam) + '" class="viz__legm"/><text x="' + (lx - 24) + '" y="' + Math.round(-inseam * 0.3) + '" text-anchor="end" class="viz__lab viz__halo">' + Math.round(inseam / 10) + ' см</text>';
      $(id + "-dyn").innerHTML = '<line x1="' + x0 + '" x2="' + (W + 40) + '" y1="0" y2="0" class="viz__ground"/>' +
        '<line x1="' + Math.round(bw * 0.1) + '" x2="' + Math.round(bw * 0.9) + '" y1="' + (-seat) + '" y2="' + (-seat) + '" class="viz__seat"/>' +
        man + leg +
        '<text x="' + Math.round(headX) + '" y="' + Math.round(-headY - 50) + '" class="viz__lab" text-anchor="middle">' + h + ' см</text>';
      var dm = $(id + "-dims");
      var ci0 = getColor ? getColor() : 0, cur = photos(s)[ci0], shown = sideLabel(s, src), note = $(id + "-dims-note");
      if (note) note.textContent = cur && shown && shown !== cur.label ? "Фото сбоку для цвета «" + cur.label + "» пока нет — показан «" + shown + "». Габариты одинаковые." : "";
      if (dm && dm.getAttribute("data-src") !== src) {
        var r = dimsSvg(m, src, B), sp = m.specs, dd = sp.dimensions || {};
        if (r) { dm.setAttribute("viewBox", r.vb); dm.innerHTML = r.svg; dm.setAttribute("data-src", src); dm.setAttribute("aria-label", "Габариты " + m.name + ": длина " + dd.lengthMm + " мм, высота " + dd.heightMm + " мм, сиденье " + sp.seatMm + " мм"); }
        var li = [["Общая длина", dd.lengthMm], ["Общая высота", dd.heightMm], ["Высота сиденья", sp.seatMm], ["Колёсная база", sp.wheelbaseMm], ["Клиренс", sp.clearanceMm], ["Ширина руля", sp.handlebarMm || dd.widthMm]];
        $(id + "-dims-list").innerHTML = li.filter(function (x) { return x[1]; }).map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + " мм</dd></div>"; }).join("");
      }
      $(id + "-h").innerHTML = h + " <small>см</small>";
      $(id + "-r").value = h;
      $(id + "-minus").disabled = h <= H_MIN; $(id + "-plus").disabled = h >= H_MAX;
      var cap = $(id + "-cap"); cap.dataset.ok = ok; cap.textContent = verdict + ".";
      renderW(m);
    }
    function renderW(m) {
      m = m || bySlug(getSlug());
      var N = fitMaxKg(m), sv = bySlug("surge-v"), svN = sv ? fitMaxKg(sv) : 0, wc = $(id + "-wcap");
      $(id + "-w").innerHTML = w + " <small>кг</small>"; $(id + "-wr").value = w;
      $(id + "-wminus").disabled = w <= W_MIN; $(id + "-wplus").disabled = w >= W_MAX;
      if (!N) { wc.hidden = true; return; }
      wc.hidden = false;
      if (w <= N) { wc.dataset.ok = "1"; wc.innerHTML = '<span class="fit__tag">По весу: подходит</span> (до ' + N + "\u00a0кг)"; }
      else {
        wc.dataset.ok = "2";
        wc.innerHTML = "Больше допустимой нагрузки " + esc(m.name) + " (" + N + "\u00a0кг) — подберём вариант в шоуруме." +
          (m.slug !== "surge-v" && svN > N && w <= svN ? ' <a href="' + (FILE["surge-v"] || "surge-v.html") + '">Y\u2011Volt Surge V — до ' + svN + "\u00a0кг</a>" : "");
      }
    }
    /* 26.10.2026: единый диапазон роста 140–205 см; изменение роста сообщаем странице (на подборе синхронизируется с верхним подбором) */
    var tell = function () { $(id).dispatchEvent(new CustomEvent("viz:h", { detail: h })); };
    $(id + "-r").addEventListener("input", function () { h = +$(id + "-r").value; render(); tell(); });
    $(id + "-minus").onclick = function () { h = Math.max(H_MIN, h - 1); render(); tell(); };
    $(id + "-plus").onclick = function () { h = Math.min(H_MAX, h + 1); render(); tell(); };
    $(id + "-r").addEventListener("change", store); $(id + "-minus").addEventListener("click", store); $(id + "-plus").addEventListener("click", store);
    var setW = function (v) { w = Math.max(W_MIN, Math.min(W_MAX, Math.round(+v) || 75)); render(); store(); };
    $(id + "-wr").addEventListener("input", function () { setW($(id + "-wr").value); });
    $(id + "-wminus").onclick = function () { setW(w - 1); };
    $(id + "-wplus").onclick = function () { setW(w + 1); };
    render();
    if (h !== 175) tell(); /* сохранённый рост — сообщаем странице (верхний подбор на podbor.html) */
    return { render: render, setH: function (v) { v = Math.max(H_MIN, Math.min(H_MAX, Math.round(+v) || 175)); if (v !== h) { h = v; render(); store(); } } };
  }

  /* ---------- страницы ---------- */
  var P = {};
  P.home = function () {
    var feat = "pro";
    var T = [ // универсальные — по ТЗ (слайд 5), без привязки к модели
      [ICON.zap, "Мощный двигатель с мгновенным откликом", "Тяга приходит сразу, как только поворачиваете ручку газа, и ровно растёт вместе с ней. Для бездорожья, подъёмов и плотного трафика.", "motor"],
      [ICON.chip, "Контроллер 79BIKE FOC с AI", "Следит за газом, скоростью и током и подстраивает отдачу мотора под вашу манеру езды: старт плавный, подъём уверенный.", "controller"],
      [ICON.battery, "Надёжные батареи Samsung и LG", "Аккумуляторы 72 В на элементах Samsung и LG. Система защищает от перегрева и перезаряда, влагозащита — IP67.", "battery"],
      [ICON.light, "LED-фары и поворотники", "Датчик освещённости сам переключает фару между дневным и ночным режимом, для тёмных участков есть дальний свет.", "light"],
      [ICON.gauge, "Удобное управление", "Режимы Eco, Drive и Sport: Eco бережёт заряд, Drive — на каждый день, Sport отдаёт всю мощность.", "dash"],
      [ICON.spring, "Подвеска Fastace с регулировкой", "Перевёрнутая вилка с ходом 200 мм. Сжатие и отскок настраиваются под ваш вес, манеру езды и покрытие.", "fork"],
      [ICON.reverse, "Задний ход", "Выкатить байк из гаража, сдать назад на узкой тропе или развернуться на склоне — без толкания руками.", "reverse"]];
    var Q = (C.ownerReviews && C.ownerReviews.items || []).slice(0, 3);
    var FH = ["pro", "lynx-trail", "light", "gt", "surge-v", "lynx-x"];
    /* 25.10 (Михаил): первый экран — вариант A «Сплит», как на 79bike.ru: ролик сверху, под ним пиктограммы, сетка моделей, кнопки */
    return '<section class="fh" aria-labelledby="h1"><div class="fh__media"><video class="fh__video" muted loop playsinline autoplay preload="metadata" poster="assets/hero/poster.jpg?v=2" aria-hidden="true"><source src="assets/hero/hero-m.mp4?v=4" type="video/mp4" media="(max-width: 900px)"><source src="assets/hero/hero.mp4?v=4" type="video/mp4"></video><button type="button" class="fh__snd" aria-pressed="false" aria-label="Включить звук"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="fh__snd-off" d="M16 9l5 6M21 9l-5 6"/><path class="fh__snd-on" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg></button>' +
      '<div class="wrap fh__txt"><h1 id="h1">Электро&shy;мотоциклы 79BIKE</h1><p class="fh__lead">Falcon, Lynx и Y\u2011Volt с\u00a0гарантией и\u00a0доставкой по\u00a0РФ</p></div></div>' +
      '<div class="fh__panel"><div class="wrap fh__grid"><div class="fh__side"><ul class="fh__bul">' +
        '<li><a href="warranty.html"><span class="fh__ic">' + ICON.shield + '</span><b>Гарантия</b><small>Сервисная поддержка</small></a></li>' +
        '<li><a href="delivery.html"><span class="fh__ic">' + ICON.truck + '</span><b>Доставка по России</b><small>Все посылки застрахованы</small></a></li>' +
        '<li><a href="parts.html"><span class="fh__ic">' + ICON.box + '</span><b>Запчасти</b><small>В наличии, быстрая доставка</small></a></li></ul>' +
        '<div class="fh__cta"><a class="btn btn--main" href="podbor.html">Подобрать байк</a><a class="btn btn--ghost" href="compare.html">Сравнить модели</a></div></div>' +
      '<div class="fh__models">' + FH.map(function (s) { var m = bySlug(s); return '<a class="fh__m" href="' + FILE[s] + '">' + (m.status === "soon" ? '<i class="fh__new">2027</i>' : "") + '<img src="' + cutSrc(s) + '" alt="" width="1300" height="760" decoding="async"><b>' + esc(SHORT[s]) + '</b><span>' + (m.price ? money(m.price) : "Скоро") + "</span></a>"; }).join("") + '</div></div></div></section>' +
      sec("", "Технологии Falcon", '<div class="tech">' + T.map(function (t) { var FI = ["motor", "controller", "battery", "light", "dash", "fork", "reverse"].indexOf(t[3]); /* 29.10: 7 фото технологий — один спрайт (лимит файлов артефакта) */ var pic = t[3] ? '<figure class="tcard__pic"><i class="tcard__sp" role="img" aria-label="' + esc(t[1]) + '" style="background-position:0 ' + (FI * 100 / 6).toFixed(3) + '%"></i></figure>' : '<figure class="tcard__pic tcard__pic--rev">' + '<img src="' + cutSrc("pro") + '" alt="" loading="lazy">' + '<span class="tcard__r" aria-hidden="true"><b>R</b>' + ICON.chev + '</span></figure>'; return '<article class="card tcard">' + pic + '<div class="tcard__body"><span class="mark" aria-hidden="true">' + t[0] + '</span><h3 class="h3">' + t[1] + "</h3><p>" + t[2] + "</p></div></article>"; }).join("") + '<a class="card card--cta" href="podbor.html"><b>Не знаете, какой выбрать?</b><span class="btn btn--light" style="align-self:flex-start;min-height:44px">Подобрать за минуту</span></a></div>') +
      sec("pick", "", pickerHtml()) +
      sec("models", "Выберите свой байк", modelCards(SALE) + '<ul class="strip"><li>' + ICON.truck + '<a href="delivery.html">Доставка байков по всей России</a></li><li>' + ICON.shield + '<a href="credit.html">Рассрочка Т-Банк или POSCREDIT</a></li><li>' + ICON.box + '<a href="delivery.html"><span data-reg="msk">Оплата наличными при получении — Москва и МО</span><span data-reg="rf">Удобный формат оплаты</span></a></li></ul><p class="note">Falcon Lynx X, 26 кВт: старт продаж в 2027 году. <a href="lynx-x.html">Узнать первым</a></p>', '<p>Все модели стоят в шоуруме. Цены указаны со скидкой.</p>') +
      sec("compare", "Сравнение моделей", cmpTable(SALE, false), '<a class="btn btn--ghost" href="compare.html">Полное сравнение</a>') +
      homeGallery() +
      homeEvents() +
      sec("room", "Шоурум в Москве", '<div class="room-home">' + showroomGallery() + '<div class="room-home__txt"><p class="room-home__lead">Приезжайте посмотреть байки вживую: все модели стоят в шоуруме, можно сесть, примерить посадку по росту и сравнить расцветки. Здесь же — большой выбор оригинальных запчастей.</p><ul class="room-home__list"><li>' + ICON.check + 'Примерка посадки под ваш рост</li><li>' + ICON.check + 'Тест-драйв для Москвы и МО</li><li>' + ICON.check + 'Большой выбор оригинальных запчастей</li></ul><p class="room__row metro-row"><span class="metro-m" aria-hidden="true">М</span>«Кленовый бульвар» · ул. Речников, 21</p><div class="visit-cta"><a class="btn btn--main" href="testdrive.html#visit">Записаться на визит</a><a class="btn btn--ghost" href="contacts.html#route">Как добраться</a></div></div></div>') +
      sec("video", "Видеообзоры", videoCards(homeVideos()), '<a class="btn btn--ghost" href="video.html">Все видеообзоры</a>') +
      homeBlog() +
      sec("", "Отзывы владельцев", '<div class="trio">' + Q.map(function (q) { var t = nb(q.text.replace(/79 ?bike pro/gi, "79BIKE Pro").replace(/79 ?bike/gi, "79BIKE").replace(/суррон/gi, "Sur-Ron").replace(/Талария/g, "Talaria")); return '<figure class="quote"><blockquote>' + esc(t) + '</blockquote><figcaption><span class="ava" aria-hidden="true">' + esc(q.name[0]) + "</span><span>" + esc(q.name) + '<span class="quote__model">' + esc(q.model ? "Владелец " + q.model : "Покупатель 79BIKE") + '</span></span></figcaption></figure>'; }).join("") + "</div>") +
      sec("faq", "", '<div class="faq"><div class="faq__aside"><h2 class="h2">Вопрос-ответ</h2><p>Не нашли ответ? Позвоните, менеджер подскажет по модели, доставке и рассрочке.</p><span class="room__phone">' + PHONE + '</span><a class="btn btn--ghost" href="faq.html" style="align-self:flex-start">Все вопросы</a></div>' + faqHtml((C.faq || []).slice(0, 6), true) + "</div>") +
      sec("delivery", "Доставка и оплата", deliveryCards(), '<a class="btn btn--ghost" href="delivery.html">Подробнее</a>') +
      sec("order", "", orderForm("f-home", "Подберём байк и рассчитаем доставку", "Оставьте телефон и город. Менеджер поможет с выбором, посчитает доставку и расскажет о рассрочке.", "Получить консультацию", "Спасибо! Менеджер скоро свяжется.", { city: true }));
  };
  function deliveryCards() {
    var d = C.delivery || { shipping: [], payment: [] }, RG = d.regions || { msk: "Москва и МО", rf: "Другой город" };
    var li = function (x) { return '<li' + (x.reg ? ' data-reg="' + x.reg + '"' : "") + "><span><b>" + esc(x.title) + ".</b> " + esc(x.text) + (x.link ? ' <a href="' + esc(x.link.href) + '" style="color:var(--accent-ink)">' + esc(x.link.text) + "</a>" : "") + "</span></li>"; };
    return '<div class="duo"><div class="card"><h3 class="h3">Доставка</h3><ul class="list">' + d.shipping.map(li).join("") + '</ul></div><div class="card"><h3 class="h3">Оплата</h3>' +
      '<div class="reg-pick" role="group" aria-label="Откуда вы?"><span>Вы из:</span>' + ["msk", "near", "rf"].filter(function (k) { return RG[k]; }).map(function (k) { return '<button type="button" class="chip" data-setreg="' + k + '" aria-pressed="false">' + esc(RG[k]) + "</button>"; }).join("") + "</div>" +
      '<ul class="list">' + d.payment.map(li).join("") + "</ul></div></div>";
  }
  function pickerHtml() {
    return '<div class="pick"><div class="pick__ctl"><h2 class="h2">Подбор за минуту</h2><p>Укажите рост и опыт. Покажем модель, которая подходит по высоте сиденья и мощности.</p>' +
      '<div class="height"><span style="color:var(--soft)">Ваш рост</span><div class="stepper"><button type="button" id="h-minus" aria-label="Меньше на 5 см">' + ICON.minus + '</button><output id="h-val" aria-live="polite">175 <small>см</small></output><button type="button" id="h-plus" aria-label="Больше на 5 см">' + ICON.plus + '</button></div></div>' +
      '<div class="seg" role="group" aria-label="Опыт"><button type="button" id="exp-new" aria-pressed="true">Только начинаю</button><button type="button" id="exp-pro" aria-pressed="false">Уже катаюсь</button></div></div>' +
      '<div class="result" aria-live="polite"><img id="r-img" src="" alt="" width="1600" height="900"><p class="result__k">Вам подойдёт</p><p class="result__name" id="r-name"></p><p id="r-why"></p><p class="result__alt" id="r-alt"></p><div class="result__row"><b id="r-price"></b><a class="btn btn--main" href="#" id="r-go" style="min-height:46px">Смотреть</a></div><div class="result__more"><a href="testdrive.html#visit" id="r-try">Записаться на примерку</a><a href="compare.html" id="r-cmp">Сравнить с другими</a></div></div></div>';
  }
  P.podbor = function () {
    return head("<span>Подбор</span>", "Подбор электромотоцикла по росту и опыту", "Подбор подсказывает по характеристикам, но посадку лучше проверить вживую: приезжайте в шоурум (тест-драйв — для Москвы и Московской области).") + sec("pick", "", pickerHtml()) +
      sec("compare-me", "Примерка по росту и весу", '<div class="ptabs" role="tablist" aria-label="Модель" id="viz-tabs">' + SALE.concat(["lynx-x"]).map(function (s) { return '<button type="button" role="tab" aria-selected="' + (s === "pro") + '" data-k="' + s + '">' + esc(SHORT[s]) + "</button>"; }).join("") + "</div>" + vizHtml("viz")) +
      sec("", "Как мы подбираем", '<div class="steps"><div class="card step"><h3 class="h3">Рост</h3><ul class="step__ul"><li><a href="pro.html">Falcon Pro</a>, <a href="gt.html">GT</a> и <a href="lite.html">Lite</a> — 150–185 см</li><li><a href="lynx-trail.html">Lynx</a> — 155–195 см</li><li><a href="surge-v.html">Y\u2011Volt Surge V</a> — 165–195 см</li></ul></div><div class="card step"><h3 class="h3">Мощность</h3><ul class="step__ul"><li>Новичку спокойнее на <a href="lite.html">Lite</a> и <a href="pro.html">Pro</a></li><li><a href="gt.html">GT</a> и <a href="surge-v.html">Surge V</a> — для тех, кто уже уверенно держит байк</li></ul></div><div class="card step"><h3 class="h3">Тест-драйв</h3><p>В шоуруме «Речников 21» можно сесть на все модели и прокатиться.</p></div></div>') +
      sec("", "Все модели", modelCards(SALE));
  };
  /* ---------- фотогалерея (data/gallery.js) ---------- */
  function galItems(s) { return ((window.GALLERY || {})[s]) || []; }
  function galHtml(s, o) {
    o = o || {};
    var L = galItems(s); if (o.max) L = L.slice(0, o.max);
    if (!L.length) return "";
    var cols = []; L.forEach(function (g) { if (g.color && cols.indexOf(g.color) < 0) cols.push(g.color); });
    var chips = !o.noChips && cols.length > 1 ? '<div class="pgal__chips" role="group" aria-label="Расцветка на фото"><button type="button" class="chip" data-gcol="" aria-pressed="true">Все фото</button>' + cols.map(function (c) { return '<button type="button" class="chip" data-gcol="' + esc(c) + '" aria-pressed="false">' + esc(c) + "</button>"; }).join("") + "</div>" : "";
    return '<div class="pgal pgal--n' + Math.min(L.length, 5) + '" data-gal="' + s + '"' + (o.max ? ' data-max="' + o.max + '"' : "") + ">" + chips + '<div class="pgal__grid">' + L.map(function (g, i) {
      return '<button type="button" class="pgal__it' + (g.h > g.w ? " is-tall" : "") + '" data-gi="' + i + '" data-gc="' + esc(g.color || "") + '" aria-label="Открыть фото: ' + esc(nb(g.alt)) + '"><img' + (g.pos ? ' style="object-position:' + esc(g.pos) + '"' : "") + ' src="' + esc(g.thumb) + '" srcset="' + esc(g.thumb) + " 640w, " + esc(g.src) + " " + (g.w || 1920) + 'w" sizes="(min-width: 900px) ' + (i === 0 ? "50vw" : "25vw") + ', 82vw" alt="' + esc(nb(g.alt)) + '" loading="lazy" decoding="async"' + (g.w ? ' width="' + g.w + '" height="' + g.h + '"' : "") + '></button>';
    }).join("") + "</div>" + (o.note ? '<p class="pgal__note">' + esc(o.note) + "</p>" : "") + "</div>";
  }
  function homeGallery() {
    /* порядок — решение Михаила 25.10: Pro, GT, Lynx, Lite, Y-Volt */
    var list = ["gt", "pro", "lynx-trail", "light", "surge-v"].filter(function (s) { return galItems(s).length >= 3; });
    if (!list.length) return "";
    return sec("gallery", "Фотогалерея", '<div class="ptabs" role="tablist" aria-label="Модель" id="hgal-tabs">' + list.map(function (s, i) { return '<button type="button" role="tab" id="hgal-t-' + s + '" aria-controls="hgal-' + s + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-k="' + s + '">' + esc(SHORT[s]) + "</button>"; }).join("") + "</div>" +
      list.map(function (s, i) { return '<div class="hgal" role="tabpanel" id="hgal-' + s + '" aria-labelledby="hgal-t-' + s + '"' + (i ? " hidden" : "") + ">" + galHtml(s, { max: 5, noChips: true }) + '<a class="pgal__link" href="' + FILE[s] + '#gallery">Все фото ' + esc(SHORT[s]) + " " + ICON.chev + "</a></div>"; }).join(""));
  }
  P.model = function () {
    var m = bySlug(slug), mc = (C.models && C.models[slug]) || {}, vs = photos(slug), soon = m.status === "soon";
    var save = m.oldPrice && m.price ? m.oldPrice - m.price : 0;
    var s = m.specs, rows = window.SPEC_ROWS || [];
    var sizeImg = m.sizeImage ? m.sizeImage.src : null;
    var KEYS = ["powerKw", "speedKmh", "rangeKm", "capacityAh", "chargeH", "seatMm", "weightKg", "ip"];
    var rest = rows.filter(function (r) { return KEYS.indexOf(r.key) < 0; });
    var others = SALE.filter(function (x) { return x !== slug; });
    return '<div class="wrap"><nav class="crumbs" aria-label="Навигация" style="margin-top:20px"><a href="index.html">Главная</a><span aria-hidden="true">/</span><a href="index.html#models">Модели</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(m.name) + "</span></nav></div>" +
      '<section class="wrap mp" aria-labelledby="m-h1"><div class="gal"><div class="gal__main">' + (COVER[slug] ? "" : '<span class="gal__code" aria-hidden="true">' + CODE[slug] + "</span>") + '<img id="g-img" src="' + esc(firstImg(slug)) + '"' + (photoSet(firstImg(slug)) ? ' srcset="' + photoSet(firstImg(slug)) + '" sizes="(max-width: 900px) 100vw, 760px"' : "") + ' alt="' + esc(m.name) + '"' + (COVER[slug] ? ' class="is-cover"' : "") + '><span class="gal__view" id="g-view"></span><span class="gal__color" id="g-color"></span></div><div class="thumbs" id="g-thumbs"></div><div class="cpick gal__chips" id="g-chips"></div></div>' +
      '<aside class="buy"><div><p class="t-cap">' + esc(TAG[slug]) + '</p><h1 id="m-h1" style="margin-top:6px">' + esc(mc.h1 || m.name) + '</h1></div><p style="color:var(--soft)">' + esc(mc.lead || m.tagline) + "</p>" +
      '<dl class="kpis" style="margin:0"><div><dt>Мощность</dt><dd class="num">' + num(s.powerKw) + ' <small>кВт</small></dd></div><div><dt>Скорость</dt><dd class="num">' + s.speedKmh + ' <small>км/ч</small></dd></div><div><dt>Батарея</dt><dd class="num">' + s.capacityAh + ' <small>Ач</small></dd></div><div><dt>Вес</dt><dd class="num">' + s.weightKg + ' <small>кг</small></dd></div></dl>' +
            (soon ? '<div class="buy__price"><b>Старт продаж в ' + esc(m.launch || "2027") + "</b></div>" : '<div class="buy__price"><b class="num">' + money(m.price) + "</b>" + (m.oldPrice ? "<s>" + money(m.oldPrice) + "</s>" : "") + (save ? '<span class="save">−' + money(save) + "</span>" : "") + "</div>") +
      '<div class="buy__actions">' + (soon ? '<a class="btn btn--main" href="#order">Сообщить о старте продаж</a>' : '<a class="btn btn--main" href="#order">Заказать</a>') + (soon ? "" : '<button type="button" class="btn btn--ghost buy__cart" id="buy-cart" data-ci="0">' + ICON.cartS + 'В корзину</button><a class="btn btn--ghost" href="testdrive.html#visit">Тест-драйв (Москва и МО)</a>') + '</div>' +
      (soon ? "" : '<ul class="buy__links"><li><a href="credit.html">' + (creditMin(slug) ? 'Рассрочка от ' + money(creditMin(slug)) + ' в месяц (с процентами)*' : 'Рассрочка Т-Банк или POSCREDIT на 6–24 месяца (с процентами)') + '</a></li><li><a href="delivery.html#calc">Доставка в ваш город — рассчитать</a></li>' + (MN_ORDER.indexOf(slug) >= 0 ? '<li><a href="' + mnFile(slug) + '">Инструкция по эксплуатации</a></li>' : "") + '</ul>' + (creditMin(slug) ? '<p class="fine">* Кредит банков-партнёров (Т-Банк, кредиторы через POSCREDIT) на 24 мес., с переплатой. Ставку и полную стоимость кредита определяет кредитор. Не является офертой. <a href="credit.html#plans">Условия</a></p>' : '')) +
      '<p class="buy__trust">' + ICON.shield + '<span>Байк из фирменного магазина 79BIKE: официальная поставка, не блокируется после активации, гарантия и сервис в России.</span></p>' +
      '<div class="hl">' + (m.highlights || []).map(function (h) { return "<span>" + esc(h) + "</span>"; }).join("") + "</div></aside></section>" +
      mnavHtml(slug, soon, mc) +
      (galItems(slug).length ? sec("gallery", "Фотогалерея " + esc(SHORT[slug]), galHtml(slug, { note: soon && galItems(slug).length < 3 ? "Пока есть только официальное фото производителя. Живые фото Lynx X покажем ближе к старту продаж." : "" })) : "") +
      sec("size", "Примерка по росту и весу", vizHtml("viz") + '<details class="size-scheme" open><summary>Габариты производителя на выбранном цвете</summary><div class="size__img"><svg class="dims" id="viz-dims" role="img"></svg><p class="dims__note" id="viz-dims-note"></p><dl class="dims__list" id="viz-dims-list"></dl></div></details>') +
      sec("video", "Видеообзоры", videoCards(vItems(((C.reviews && C.reviews.pinned && C.reviews.pinned[slug]) || [m.name + ": обзор"]).slice(0, 4), slug)) /* 29.10: на странице модели — 4 ролика в ряд, все — на странице «Видео» */, '<a class="btn btn--ghost" href="video.html">Все видео</a>') +
      sec("specs", "Характеристики", '<dl class="specs-t" style="margin:0">' + rows.filter(function (r) { return KEYS.indexOf(r.key) >= 0; }).map(function (r) { return "<div><dt>" + esc(r.label) + "</dt><dd>" + esc(fmt(m, r.key, r.unit)) + (r.key === "rangeKm" ? ' <button type="button" class="rng-q" aria-expanded="false" aria-controls="rng">А сколько реально проедет?</button>' : "") + "</dd></div>"; }).join("") + '</dl>' + rangeNote(slug) + '<details class="size-scheme"><summary>Ещё характеристики (' + rest.length + ')</summary><dl class="specs-t" style="margin:0 14px 14px">' + rest.map(function (r) { return "<div><dt>" + esc(r.label) + "</dt><dd>" + esc(fmt(m, r.key, r.unit)) + "</dd></div>"; }).join("") + '</dl></details><p class="t-cap" style="margin-top:10px">Данные производителя. Запас хода указан диапазоном: реальный пробег зависит от условий езды.</p>', '<a class="btn btn--ghost" href="compare.html">Сравнить с другими</a>') +
      sec("order", "", soon ? orderForm("f-order", "Узнать о старте продаж", "Оставьте телефон: позвоним или напишем, как только Lynx X можно будет заказать.", "Сообщить мне", "Готово! Мы сообщим о старте продаж.", { ads: true }) : orderForm("f-order", "Заказать " + esc(SHORT[slug]), "Оставьте телефон. Менеджер подтвердит заказ и уточнит доставку и способ оплаты. Заполнять анкету не нужно.", "Заказать", "Спасибо! Заявка принята.", { sum: slug })) +
      sec("about", "", '<details class="size-scheme"><summary>Подробнее о ' + esc(SHORT[slug]) + '</summary><div class="prose" style="padding:0 18px 18px">' + (mc.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></details>") +
      ((((C.modelPage || {}).accessories || {}).byModel || {})[slug] ? sec("acc", "Рекомендуем купить к " + esc(SHORT[slug]), accHtml(slug) + '<p class="acc__all"><a class="btn btn--ghost" href="parts.html">Все запчасти</a></p>') : "") +
      (mc.faq && mc.faq.length ? sec("faq", "Вопросы о " + esc(SHORT[slug]), faqHtml(mc.faq, true)) : "") +
      sec("others", "Другие модели", modelCards(others));
  };
  P.compare = function () {
    return head("<span>Сравнение</span>", "Сравнение моделей Falcon, Lynx и Y-Volt", "Все характеристики в одной таблице. По умолчанию показываем только различия.") +
      sec("", "", '<div class="cmp-pick" role="group" aria-label="Какие модели сравнивать" id="cmp-pick">' + ORDER.map(function (s) { return '<button type="button" class="chip" aria-pressed="false" data-k="' + s + '">' + esc(SHORT[s]) + "</button>"; }).join("") + '</div><div class="cmp-tools"><button class="btn btn--ghost" type="button" id="cmp-all" aria-pressed="false" style="min-height:44px">Показать все строки</button><a class="btn btn--main" href="podbor.html" style="min-height:44px">Не знаю, что выбрать</a></div>' + cmpTable(ORDER, true)) + sec("", "Модели", modelCards(SALE));
  };
  P.video = function () {
    var R = C.reviews || {}, pin = R.pinned || {};
    return head("<span>Видеообзоры</span>", "Видеообзоры электромотоциклов Falcon", "Тест-драйвы, сравнения и опыт владельцев: наши ролики и самые популярные обзоры блогеров по каждой модели.") +
      sec("", "", '<div class="ptabs" role="tablist" aria-label="Модель" id="vtabs">' + ORDER.map(function (s, i) { return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-k="' + s + '">' + esc(SHORT[s]) + "</button>"; }).join("") + '</div><div id="vlist"></div>') +
      sec("", "", '<div class="cta-band"><div><h2>Канал 79BIKE на RUTUBE</h2><p>Новые ролики выходят регулярно. Подпишитесь, чтобы не пропустить.</p></div><a class="btn" href="' + RUTUBE + '" target="_blank" rel="noopener" style="background:#000;color:#fff">Открыть канал</a></div>');
  };
  function boxHtml() {
    var D = C.delivery || {}, B = D.boxes || [], F = D.boxPhotos || [];
    return '<div class="boxes"><div class="boxes__info"><p class="room-home__lead">Байк приезжает в штатной заводской коробке на деревянном поддоне: она надёжно защищает его в пути, обрешётка не нужна. Все отправления застрахованы.</p><div class="boxes__list">' +
      B.map(function (b) { return '<div class="card boxes__card"><p class="t-cap">' + esc(b.title) + '</p><dl><div><dt>Размер (Д × Ш × В)</dt><dd>' + esc(b.dims) + '</dd></div><div><dt>Вес с упаковкой</dt><dd>' + esc(b.weight) + "</dd></div></dl></div>"; }).join("") +
      '</div><p class="t-cap">Забираете сами? Коробка поместится в грузовое такси или машину с большим багажником — ориентируйтесь на размеры выше.</p></div><div class="boxes__pics">' +
      F.map(function (f) { return '<figure><img src="' + f.img + '" alt="' + esc(f.caption) + ' на поддоне" loading="lazy" decoding="async"><figcaption>' + esc(f.caption) + "</figcaption></figure>"; }).join("") + "</div></div>";
  }
  /* 26.10.2026 (Михаил): «Доставка и оплата» по утверждённому макету (mockups/delivery-2026-10-26), зона нашего курьера — до 500 км. Префикс классов dn- */
  function rich(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" class="dn-link">$1</a>'); }
  var DN_IC = {
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14.5h4"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    box: '<path d="M3 8l9-4 9 4v8l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v8"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    doc: '<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function dnIc(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (DN_IC[k] || "") + "</svg>"; }
  function dnZoneSvg(Z) {
    var R = 330, k = R / (Z.km || 500), f = function (n) { return Math.round(n * 10) / 10; };
    var dots = (Z.cities || []).map(function (c) {
      var r = c.km * k, a = c.a * Math.PI / 180, x = 400 + r * Math.cos(a), y = 400 + r * Math.sin(a);
      return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" class="dn-z-dot"/><text x="' + f(x + (c.dx || 0)) + '" y="' + f(y + (c.dy || 0)) + '" text-anchor="' + (c.lab || "start") + '" class="dn-z-l">' + esc(c.n) + "</text>";
    }).join("");
    return '<svg class="dn-svg" viewBox="0 0 800 800" role="img" aria-labelledby="dn-zone-t"><title id="dn-zone-t">Схема: зона доставки нашим курьером — круг ' + Z.km + ' км вокруг Москвы</title>' +
      '<defs><radialGradient id="dn-zg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7658F5" stop-opacity=".34"/><stop offset="1" stop-color="#7658F5" stop-opacity=".08"/></radialGradient></defs>' +
      '<circle cx="400" cy="400" r="' + R + '" fill="url(#dn-zg)" stroke="#9B6BFF" stroke-width="2.5"/>' +
      '<circle cx="400" cy="400" r="' + R / 2 + '" fill="none" stroke="#9B6BFF" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="6 7"/>' +
      '<text x="400" y="' + (400 + R / 2 + 22) + '" class="dn-z-km" text-anchor="middle">' + Z.km / 2 + ' км</text>' +
      '<text x="400" y="760" class="dn-z-km dn-z-km--b" text-anchor="middle">' + Z.km + ' км по дорогам</text>' + dots +
      '<circle cx="400" cy="400" r="11" class="dn-z-msk"/><circle cx="400" cy="400" r="20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><text x="400" y="446" text-anchor="middle" class="dn-z-l dn-z-l--m">Москва</text></svg>';
  }
  P.delivery = function () {
    var D = C.delivery || {}, G = D.page || {}, Z = G.zone || {}, K = G.calc || {}, RG = D.regions || {};
    var nav = '<nav class="dn-nav" id="dn-nav" aria-label="Разделы страницы"><div class="wrap"><div class="dn-nav__in">' + (G.nav || []).map(function (x, i) { return '<a href="#' + x[0] + '" data-sec="' + x[0] + '"' + (i === 0 ? ' class="is-on"' : "") + ">" + esc(x[1]) + "</a>"; }).join("") + "</div></div></nav>";
    var city = '<section class="sec dn-sec dn-first" id="ways"><div class="wrap"><div class="card dn-city"><p class="dn-city__q">Ваш город</p>' +
      '<div class="dn-city__chips" role="group" aria-label="Ваш город">' + (G.cities || []).map(function (c) { return '<button type="button" class="chip" data-setreg="' + c.k + '" aria-pressed="' + (c.k === "msk") + '">' + esc(c.label) + "</button>"; }).join("") + "</div>" +
      (G.cities || []).map(function (c) { return '<div class="dn-panel" data-reg="' + c.k + '"><dl class="dn-rows">' + c.rows.map(function (r) { return "<div><dt>" + dnIc(r.ic) + esc(r.h) + "</dt><dd>" + rich(r.t) + "</dd></div>"; }).join("") + "</dl></div>"; }).join("") +
      '<div class="dn-city__cta"><a class="btn btn--main" href="#calc">' + esc(K.title || "Рассчитать доставку") + '</a><a class="btn btn--ghost" href="credit.html">Рассрочка</a></div></div></div></section>';
    var ways = sec("compare", "Способы доставки", '<div class="dn-cmp">' + (G.ways || []).map(function (w) { return '<article class="card dn-way"><div class="dn-way__h"><span class="dn-ic">' + dnIc(w.ic) + '</span><h3 class="h3">' + esc(w.title) + "</h3></div><dl>" + w.rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + rich(r[1]) + "</dd></div>"; }).join("") + "</dl></article>"; }).join("") + "</div>", '<p class="dn-swipe" aria-hidden="true">Листайте →</p>');
    var zone = sec("zone", esc(Z.title || ""), '<div class="dn-zone"><figure class="card dn-map">' + dnZoneSvg(Z) + "<figcaption>" + esc(Z.caption) + '</figcaption></figure><div class="dn-zone__side"><p class="t-cap">' + esc(Z.listCap) + '</p><ul class="dn-tags">' +
      (Z.cities || []).map(function (c) { return "<li>" + esc(c.n) + "</li>"; }).join("") + "</ul>" + (Z.far ? '<p class="dn-far">' + dnIc("box") + "<span>" + esc(Z.far) + "</span></p>" : "") + '<p class="t-cap">' + esc(Z.note) + '</p><a class="btn btn--ghost" href="#calc">' + esc(Z.btn) + "</a></div></div>", "<p>" + esc(Z.lead) + "</p>");
    var van = D.vanPhoto ? sec("", "", '<figure class="dl-van"><img src="' + D.vanPhoto.img + '" srcset="' + D.vanPhoto.img.replace(/\.webp$/, "-800.webp") + ' 800w, ' + D.vanPhoto.img + ' 1448w" sizes="(max-width: 900px) 100vw, 1100px" alt="' + esc(D.vanPhoto.alt) + '" loading="lazy" decoding="async"><figcaption>' + esc(D.vanPhoto.caption) + "</figcaption></figure>") : "";
    var flow = sec("terms", esc(G.flowTitle || ""), '<ol class="dn-flow">' + (G.flow || []).map(function (x) { return '<li><span class="dn-ic">' + dnIc(x.ic) + "</span><div><b>" + esc(x.t) + "</b><p>" + rich(x.p) + "</p></div></li>"; }).join("") + "</ol>");
    var pay = sec("pay", "Оплата", '<div class="dn-pay">' + (G.pay || []).map(function (x) { return '<div class="card' + (x.accent ? " dn-pay__cr" : "") + '"><p class="t-cap">' + esc(x.cap) + '</p><h3 class="h3">' + esc(x.h) + '</h3><p class="dn-soft">' + esc(x.p) + "</p>" + (x.link ? '<a href="' + esc(x.link.href) + '" class="dn-link">' + esc(x.link.text) + "</a>" : "") + "</div>"; }).join("") + "</div>");
    var CH = G.check || {};
    var pack = sec("pack", "Упаковка и размеры коробки", boxHtml() +
      '<div class="card dn-check"><h3 class="h3">' + esc(CH.title || "") + "</h3><ol>" + (CH.items || []).map(function (x) { return "<li><b>" + esc(x[0]) + "</b> " + esc(x[1]) + "</li>"; }).join("") + "</ol></div>" +
      (G.parts ? '<div class="callout dn-parts">' + dnIc("box") + "<p>" + rich(G.parts) + "</p></div>" : ""));
    var calc = sec("calc", "", orderForm("f-city", esc(K.title || "Рассчитать доставку"), esc(K.text || ""), esc(K.btn || "Рассчитать"), K.ok || "Спасибо! Менеджер рассчитает доставку.", { city: true, cityFirst: true, model: true, legal: K.legal }));
    var faq = sec("faq", "Вопросы", faqHtml((C.faq || []).filter(function (f) { return /достав|оплат|рассроч/i.test(f.q); }), true));
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Доставка и оплата</span>', "Доставка и оплата", esc(G.lead || D.homeSubtitle || "")) +
      nav + city + ways + zone + van + flow + pay + pack + calc + faq;
  };
  function creditMin(s) { var P = (C.creditPlans || {})[s]; if (!P) return 0; var m = Infinity; ["t", "p"].forEach(function (b) { P[b].forEach(function (r) { if (r[2] < m) m = r[2]; }); }); return m; }
  P.credit = function () {
    var CP = C.creditPlans || {}, MG = C.creditManager || {}, keys = SALE.filter(function (s) { return CP[s]; });
    var tabs = '<div class="ptabs" role="tablist" aria-label="Модель" id="cr-tabs">' + keys.map(function (s, i) { return '<button type="button" role="tab" class="chip" aria-selected="' + (i === 0) + '" aria-pressed="' + (i === 0) + '" data-k="' + s + '">' + esc(SHORT[s]) + "</button>"; }).join("") + "</div>";
    var tables = keys.map(function (s, i) {
      var P = CP[s], m = bySlug(s);
      function bank(name, rows, note) { return '<div class="card cr-bank"><h3 class="h3">' + name + '</h3><p class="t-cap">' + note + '</p><table class="cr-t"><thead><tr><th>Срок</th><th>В месяц</th><th>Итого</th><th>Переплата</th></tr></thead><tbody>' + rows.map(function (r) { return "<tr><td>" + r[0] + " мес.</td><td><b>" + money(r[2]) + "</b></td><td>" + money(r[1]) + "</td><td>" + r[3] + "%</td></tr>"; }).join("") + "</tbody></table></div>"; }
      return '<div class="cr-panel" data-k="' + s + '"' + (i ? " hidden" : "") + '><p class="cr-price">' + esc(m.name) + " — " + money(m.price) + '</p><div class="duo">' + bank("Т-Банк", P.t, "Заявка онлайн") + bank("POSCREDIT", P.p, "Оформление через менеджера") + "</div></div>";
    }).join("");
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Рассрочка</span>', "Рассрочка на электромотоциклы", "Т-Банк или POSCREDIT на 6, 12 или 24 месяца. Заявку в Т-Банк можно оформить онлайн, в POSCREDIT — через менеджера.") +
      sec("plans", "Платежи по моделям", tabs + tables + '<p class="fine">Кредит (рассрочку) предоставляют банки-партнёры: Т-Банк (заявка онлайн) и кредиторы через сервис POSCREDIT. Переплата в таблице — разница между суммой выплат и ценой байка, это не беспроцентная рассрочка. Расчёт предварительный: решение о выдаче, процентную ставку и полную стоимость кредита определяет кредитор. Не является публичной офертой.</p>') +
      (C.creditScope ? sec("", "", '<div class="callout">' + ICON.zap + "<p>" + esc(C.creditScope) + "</p></div>") : "") +
      (C.creditPromo ? sec("", "", '<div class="callout">' + ICON.zap + "<p>" + esc(C.creditPromo) + "</p></div>") : "") +
      sec("", "Как оформить", '<div class="steps"><div class="card step"><h3 class="h3">Выберите байк</h3><p>Подберите модель и цвет на сайте или в шоуруме.</p></div><div class="card step"><h3 class="h3">Оставьте заявку</h3><p>Онлайн в Т-Банк или через менеджера в POSCREDIT.</p></div><div class="card step"><h3 class="h3">Получите решение</h3><p>Банк сообщит решение и условия. Срок — 6, 12 или 24 месяца.</p></div><div class="card step"><h3 class="h3">Заберите байк</h3><p>По Москве и области привезёт наш курьер, в регионы — транспортная компания. Можно забрать в шоуруме.</p></div></div>') +
      (MG.phone ? sec("", "", '<div class="card cr-mgr"><p class="t-cap">Менеджер по рассрочке</p><a class="contact-big" href="' + MG.href + '">' + esc(MG.phone) + '</a><div class="social"><a href="' + MG.tg + '" target="_blank" rel="noopener">Написать в Telegram</a></div></div>') : "") +
      sec("order", "", orderForm("f-credit", "Оформить рассрочку", "Оставьте телефон. Менеджер поможет выбрать банк и оформить заявку.", "Оформить", "Спасибо! Менеджер скоро позвонит.", { model: true })) +
      sec("", "Модели", modelCards(SALE));
  };
  P.warranty = function () {
    var g = C.greyImport || {};
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Гарантия и сервис</span>', "Гарантия и сервис", "Официальная гарантия 79BIKE — 6 месяцев на контроллер, батарею, двигатель и раму. Ремонт и техподдержка — в России.") +
      secH("", "Что входит в гарантию", '<div class="grid3"><div class="card">' + ICON.shield.replace("<svg", '<svg width="30" height="30" style="color:var(--accent-2)"') + '<h3 class="h3">6 месяцев гарантии</h3><p>На контроллер, батарею, двигатель и раму.</p></div><div class="card">' + ICON.wrench.replace("<svg", '<svg width="30" height="30" style="color:var(--accent-2)"') + '<h3 class="h3">Сервис в Москве</h3><p>Диагностика и ремонт в нашем сервисе, техподдержка на русском.</p></div><div class="card">' + ICON.truck.replace("<svg", '<svg width="30" height="30" style="color:var(--accent-2)"') + '<h3 class="h3">Запчасти в наличии</h3><p>Расходники и запчасти держим на складе, в регионы отправляем СДЭК.</p></div></div>') +
      // 25.10 (Михаил): гарантия развёрнута по руководству по эксплуатации (разд. 10 «Правила гарантии…» и 11 «Карточка учёта ТО»)
      sec("w-terms", "Условия гарантии", '<ul class="list"><li><span><b>Срок — 6 месяцев</b> со дня оформления договора купли-продажи.</span></li><li><span><b>Что покрывает.</b> Двигатель, контроллер, аккумуляторную батарею и раму. Гарантийный случай — когда один из этих узлов перестал работать из-за заводского брака, а правила эксплуатации соблюдались.</span></li><li><span><b>Кому.</b> Гарантия продавца действует для первого покупателя и не переходит к следующему владельцу.</span></li></ul>') +
      sec("w-refuse", "Когда в гарантии могут отказать", '<p class="t-cap" style="margin-bottom:12px">Если неисправность вызвана одним из этих обстоятельств:</p><ul class="list"><li><span><b>Вмешательство в конструкцию и электронику,</b> замена комплектующих.</span></li><li><span><b>Самостоятельный вход в сервисные режимы,</b> перепрошивка, калибровка, изменение заводских параметров вне главного меню и другие действия с настройками и программным обеспечением.</span></li><li><span><b>Дооснащение и тюнинг</b> любого рода — в том числе оборудование и комплектующие, установленные временно.</span></li><li><span><b>Механические повреждения:</b> падение, столкновение, ДТП, перегрузка.</span></li><li><span><b>Вода внутри узлов.</b> Влагозащита IP67 спасает от дождя и луж, но не от мойки высоким давлением и глубокого брода.</span></li><li><span><b>Неправильное хранение и зарядка аккумулятора:</b> несовместимое зарядное устройство, нарушение температурного режима и влажности. Храните аккумулятор при температуре не ниже +10 °C.</span></li></ul>') +
      sec("w-wear", "Что не считается браком", '<ul class="list"><li><span><b>Естественный износ</b> тормозных колодок, шин, камер, цепи и звёзд, подшипников, элементов подвески и других расходных деталей.</span></li><li><span><b>Скрипы,</b> а также изменения функций и программного обеспечения, которые вносит производитель, — в том числе в работе приложения.</span></li><li><span><b>Снижение ёмкости аккумулятора</b> из-за естественного старения и количества циклов зарядки.</span></li></ul>') +
      sec("w-to", "Плановое ТО — условие гарантии", '<p class="t-cap" style="margin-bottom:12px">Проходите техническое обслуживание вовремя, в авторизованном сервисе. Пропуск ТО может стать причиной отказа в гарантийном ремонте.</p><div style="overflow-x:auto"><table class="cr-t"><thead><tr><th>Пробег / срок</th><th>Что делаем</th></tr></thead><tbody><tr><td>300 км / 1 месяц</td><td>Проверка крепежа, натяжения цепи (и ремня — у моделей с ремнём), всех узлов: двигателя, колёс, тормозов, спиц</td></tr><tr><td>1000 км / 3 месяца</td><td>Повторная проверка всех узлов и систем, особое внимание — тормозам, цепи и ремню (если он есть)</td></tr><tr><td>2000 км / 6 месяцев</td><td>Проверка тормозных колодок: если фрикционный слой тоньше 1,5 мм — замена</td></tr></tbody></table></div>') +
      sec("w-how", "Как проходит гарантийный ремонт", '<ul class="list"><li><span><b>Напишите менеджеру</b> и пришлите фото или видео неисправности, номер заказа или документ о покупке.</span></li><li><span><b>Многие вопросы решаем дистанционно:</b> диагностика по видеосвязи и отправка нужной детали СДЭК.</span></li><li><span><b>Если нужен ремонт в сервисе,</b> доставка байка в сервис и обратно — силами и за счёт покупателя.</span></li><li><span><b>Возврат.</b> Электромотоцикл — технически сложный товар, поэтому возврат после покупки невозможен. Чтобы вы были уверены в выборе заранее, поможем подобрать модель по росту и опыту, ответим на все вопросы, а в Москве и Московской области можно приехать на тест-драйв.</span></li></ul>') +
      sec("", "", '<div class="callout">' + ICON.alert + "<p><b>" + esc(g.title || "") + ".</b> " + esc(g.text || "") + "</p></div>") +
      sec("order", "", orderForm("f-service", "Нужен сервис?", "Оставьте телефон. Мастер перезвонит и подскажет, что делать.", "Связаться", "Спасибо! Мастер скоро позвонит."));
  };
  /* ---------- запчасти: каталог из data/parts.js (снято с falcon-bike.ru и y-volt.ru) ---------- */
  var PC_TABS = [["", "Все Falcon и Lynx"], ["light"], ["pro"], ["gt"], ["lynx-trail"], ["surge-v", "Y\u2011Volt Surge V"]];
  var PC_ICON = { electronika: "chip", electro: "chip", dvigatel_i_pitanie: "battery", amortisaciya: "spring", podveska: "spring", tormosa: "shield", aksessuari: "box", akss: "box" };
  var PC_STEP = 24;
  function pcSite(m) { var S = (window.PARTS || {}).sites || []; for (var i = 0; i < S.length; i++) if (m ? S[i].models.indexOf(m) >= 0 : S[i].key === "falcon") return S[i]; return S[0]; }
  function pcCard(it, site) {
    var cats = {}; site.categories.forEach(function (c) { cats[c[0]] = c[1]; });
    var cn = cats[it.c[0]] || "Запчасть", ic = ICON[PC_ICON[it.c[0]] || "wrench"];
    var fit = site.key === "yvolt" ? "Y‑Volt Surge V" : it.m.length ? it.m.map(function (s) { return TAB_LABEL[s] === "Lynx" ? "Lynx Trail" : TAB_LABEL[s]; }).join(", ") : "уточните у менеджера";
    var ok = /^в наличии/i.test(it.a || "");
    /* фото: сначала локальное (assets/parts/<uid>-s.webp 400px + <uid>.webp 800px, белый фон), tildacdn — только запасной вариант */
    var loc = it.loc || "", sm = loc ? loc.replace(/\.webp$/, "-s.webp") : "", src = sm || it.img || "";
    var SP = window.PARTS_SPRITE, sp = SP && loc && SP.map[loc];
    if (sp) {
      var col = sp[1] % SP.cols, row = Math.floor(sp[1] / SP.cols), sh = "assets/parts-sprite/p" + (sp[0] < 10 ? "0" : "") + sp[0] + ".webp";
      src = ""; var spr = '<span class="pc__img" role="img" aria-label="' + esc(it.t) + '" style="background-image:url(' + sh + ');background-size:' + SP.cols * 100 + '% ' + SP.rows * 100 + '%;background-position:' + (col * 100 / (SP.cols - 1)) + '% ' + (row * 100 / (SP.rows - 1)) + '%"></span>';
    }
    return '<article class="card acc__card pc__card" data-pid="' + esc(it.id) + '"><a class="pc__open" href="#p-' + esc(it.id) + '" data-open="' + esc(it.id) + '" aria-label="Подробнее: ' + esc(it.t) + '"></a><figure class="acc__pic pc__pic' + (src || sp ? "" : " is-empty") + '">' + (sp ? spr : "") + (src ? '<img src="' + esc(src) + '"' + (sm ? ' srcset="' + esc(sm) + ' 400w, ' + esc(loc) + ' 800w" sizes="(max-width:1000px) 50vw, 25vw"' : "") + (sm && it.img ? ' data-fb="' + esc(it.img) + '"' : "") + ' alt="' + esc(it.t) + '" width="400" height="400" loading="lazy" decoding="async" onerror="if(this.dataset.fb){this.removeAttribute(\'srcset\');this.src=this.dataset.fb;this.dataset.fb=\'\'}else this.parentNode.classList.add(\'is-empty\')">' : "") +
      '<span class="pc__ph" aria-hidden="true">' + ic + "<span>" + esc(cn) + "</span></span></figure>" +
      '<div class="acc__body"><h3 class="h3 pc__t">' + esc(it.t) + '</h3><p class="acc__fit">Подходит: ' + esc(fit) + "</p>" +
      (it.sku ? '<p class="pc__sku">Арт. ' + esc(it.sku) + "</p>" : "") +
      '<p class="pc__av' + (ok ? " is-ok" : "") + '">' + (ok ? "В наличии" : "Уточнить наличие") + "</p>" +
      '<p class="acc__price">' + (it.p ? money(it.p) + (it.op ? " <s>" + money(it.op) + "</s>" : "") : "Цена по запросу") + "</p>" +
      (it.p ? '<button type="button" class="btn btn--ghost acc__btn" data-cart="' + esc(it.id) + '">В корзину</button>' : '<a class="btn btn--ghost acc__btn" href="#order" data-acc="' + esc(it.t + (it.sku ? " (арт. " + it.sku + ")" : "")) + '">Узнать цену</a>') + "</div></article>";
  }
  /* 26.10 (Михаил): карточка запчасти (фото, описание, характеристики — как на старом сайте) и корзина */
  function pcBike(id) { var p = /^bike:([\w-]+):(\d+)$/.exec(id || ""); if (!p) return null; var m = bySlug(p[1]); if (!m || !m.price) return null; var vs = photos(p[1]) || [], v = vs[+p[2]] || vs[0]; var img = v && v.images && v.images[0] ? photoV(v.images[0].src, "-s") : ""; return { it: { id: id, t: m.name + (v && v.label ? ", " + v.label : ""), p: m.price, img: img, bike: p[1], m: [], c: [] }, site: { key: "bike" } }; }
  function pcFind(id) { if (/^bike:/.test(id || "")) return pcBike(id); var S = (window.PARTS || {}).sites || []; for (var i = 0; i < S.length; i++) for (var j = 0; j < S[i].items.length; j++) if (S[i].items[j].id === id) return { it: S[i].items[j], site: S[i] }; return null; }
  function pcThumb(it) {
    var SP = window.PARTS_SPRITE, sp = SP && it.loc && SP.map[it.loc];
    if (!sp) return it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy">' : "";
    var col = sp[1] % SP.cols, row = Math.floor(sp[1] / SP.cols), sh = "assets/parts-sprite/p" + (sp[0] < 10 ? "0" : "") + sp[0] + ".webp";
    return '<span class="pc__img" style="background-image:url(' + sh + ');background-size:' + SP.cols * 100 + '% ' + SP.rows * 100 + '%;background-position:' + (col * 100 / (SP.cols - 1)) + '% ' + (row * 100 / (SP.rows - 1)) + '%"></span>';
  }
  /* 26.10 (правка 30): сортировка по востребованности. Нет статистики продаж — порядок по типичной частоте замены
     на электро-эндуро/питбайках (износ: колодки, шины, цепь/звёзды; падения: рычаги, грипсы, защита рук, крылья, зеркала, свет, подножки),
     крупные редкие узлы (рама, вилка, маятник, оси, мотор, батарея) — ниже. Первое совпадение по названию задаёт приоритет. */
  var PC_PRIO = [
    [1, /колодк/],                                                     // тормозные колодки
    [2, /^(пара шин|шина|шины|передняя покрышка|задняя покрышка|покрышк|камер|внедорожная шина)/], // шины и камеры
    [3, /цеп[ьи]|звезд|ведущ|ведом|шестер|ремен|натяжител|натяжени/], // цепь, звёзды, ремень
    [4, /тормозной рычаг|ручка .*тормоз|тормозная ручка|рычаг сцеплен|курок/], // рычаги/ручки тормоза
    [5, /грипс|ручка газа|дроссел/],                                   // грипсы и ручка газа
    [6, /защит\S* (для )?рук/],                                       // защита рук
    [7, /крыл|подкрыл|брызгов/],                                        // крылья, брызговики
    [8, /зеркал/],                                                      // зеркала
    [9, /зарядн\S* устрой|^зу([^а-я]|$)/],                                    // зарядные устройства
    [30, /датчик/],                                                     // датчики — электрика
    [90, /(подставка|поддон|пластина) аккумулятор/],                   // крепёж батареи
    [10, /фар[аы]|фонар|поворотник|подсветк/],                          // свет
    [11, /подножк|подставк|подcтавк/],                                           // подножки
    [12, /тормоз|калипер|суппорт/],                                                     // тормозные диски, тормоз в сборе
    [13, /^руль|вынос руля|заглушка руля/],                             // руль
    [14, /защит|облицовк|накладк|сиденье|номерн/],                      // защита, пластик, сиденье
    [15, /шлем|очки|джерси|экипиров|сумочк/],                           // экипировка и аксессуары
    [30, /кабел|переключат|приборн|дисплей|преобразоват|жгут|коса|разъ[её]м/], // электрика
    [90, /рама|вилк|амортиз|маятник|(^|[^а-я])ос[ьи]([^а-я]|$)|болт|двигател|мотор|контроллер|аккумулятор|батаре|рулев|подшипник|втулк|кронштейн|энкодер|(^|[^а-я])вал([^а-я]|$)|прогресс|тяг[аи]|сальник/], // крупные/редкие узлы
    [20, /колес|спиц|обод/]                                             // колёса в сборе
  ];
  function pcPrio(it) { if (it.prio != null) return it.prio; var t = String(it.t || "").toLowerCase().replace(/ё/g, "е"); for (var i = 0; i < PC_PRIO.length; i++) if (PC_PRIO[i][1].test(t)) return it.prio = PC_PRIO[i][0]; return it.prio = 50; }
  function pcSort(L) { return L.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return pcPrio(a[0].it || a[0]) - pcPrio(b[0].it || b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; }); }
  function pcFit(it, site) { return site.key === "yvolt" ? "Y‑Volt Surge V" : it.m.length ? it.m.map(function (s) { return TAB_LABEL[s] === "Lynx" ? "Lynx Trail" : TAB_LABEL[s]; }).join(", ") : "уточните у менеджера"; }
  /* 26.10.2026: значок корзины в шапке — виден, только когда в корзине что-то лежит */
  function hdrCart() { var n = 0; try { n = CART.raw(); } catch (e) {} document.querySelectorAll(".hdr-cart").forEach(function (a) { a.hidden = !n; var b = a.querySelector(".hdr-cart__n"); if (b) b.textContent = n; a.setAttribute("aria-label", "Корзина: " + n); }); }
  document.addEventListener("DOMContentLoaded", function () { setTimeout(hdrCart, 0); }); addEventListener("load", hdrCart); addEventListener("pageshow", hdrCart);
  var CART = (function () {
    var K = "falcon:cart", c = {};
    try { c = JSON.parse(localStorage.getItem(K) || "{}") || {}; } catch (e) { c = {}; }
    function save() { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) {} }
    return {
      all: function () { return Object.keys(c).filter(function (id) { return pcFind(id); }).map(function (id) { return { id: id, q: c[id] }; }); },
      add: function (id, q) { c[id] = Math.min(99, (c[id] || 0) + (q || 1)); save(); hdrCart(); },
      set: function (id, q) { if (q <= 0) delete c[id]; else c[id] = Math.min(99, q); save(); hdrCart(); },
      clear: function () { c = {}; save(); hdrCart(); },
      raw: function () { return Object.keys(c).reduce(function (n, id) { return n + (c[id] || 0); }, 0); },
      count: function () { return this.all().reduce(function (n, x) { return n + x.q; }, 0); },
      sum: function () { return this.all().reduce(function (n, x) { var f = pcFind(x.id); return n + (f && f.it.p ? f.it.p * x.q : 0); }, 0); }
    };
  })();
  P.parts = function () {
    var items = (C.modelPage && C.modelPage.accessories && C.modelPage.accessories.items) || [];
    if (window.PARTS && window.PARTS.sites) {
      var nAll = window.PARTS.sites.reduce(function (n, s) { return n + s.items.length; }, 0);
      var tabs = '<div class="ptabs pc__tabs" role="tablist" aria-label="Модель" id="pc-models">' + PC_TABS.map(function (t) { return '<button type="button" role="tab" aria-selected="false" data-m="' + t[0] + '">' + esc(t[1] || SHORT[t[0]]) + "</button>"; }).join("") + "</div>";
      return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Запчасти и аксессуары</span>', "Запчасти и аксессуары", "Оригинальные запчасти для Falcon, Lynx и Y‑Volt Surge V. Выберите модель и раздел, добавьте детали в заказ: менеджер проверит наличие и отправит СДЭК или выдаст в шоуруме.") +
        secH("catalog", "Каталог запчастей", '<div class="pc pc--side" id="pc"><div class="pc__layout"><aside class="pc__aside" aria-label="Фильтры каталога">' +
          '<div class="pc__bar"><label class="pc__sel"><span>Модель</span><select id="pc-sel-m" aria-label="Модель">' + PC_TABS.map(function (t) { return '<option value="' + t[0] + '">' + esc(t[1] || SHORT[t[0]]) + "</option>"; }).join("") + '</select></label><label class="pc__sel"><span>Раздел</span><select id="pc-sel-c" aria-label="Раздел"></select></label><button type="button" class="pc__barcart" id="pc-barcart" hidden aria-label="Открыть корзину"></button></div>' +
          '<p class="pc__h">Модель</p>' + tabs +
          '<p class="pc__h">Раздел</p><div class="pc__cats" id="pc-cats" role="group" aria-label="Раздел"></div>' +
          '<button type="button" class="pc__sidecart" id="pc-sidecart" hidden></button>' +
          /* 26.10 (правка 31): поиск по всем запчастям — на ПК липкий под списками, на телефоне закреплён внизу экрана вместо нижней плашки */
          '<div class="pc__find" id="pc-find" role="search"><p class="pc__h pc__find-h" aria-hidden="true">Поиск по всем запчастям</p><label class="pc__search"><span class="vh">Поиск по всем запчастям: название или артикул</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="search" id="pc-q" placeholder="Поиск по всем запчастям" autocomplete="off" enterkeyhint="search"></label></div></aside><div class="pc__main">' +
          '<div class="pc__tools"><p class="pc__meta" id="pc-meta" aria-live="polite"></p><a class="btn btn--main pc__cart" id="pc-cart" href="#order" hidden></a></div>' +
          '<div class="acc pc__grid" id="pc-grid"></div><div class="pc__more"><button type="button" class="btn btn--ghost" id="pc-more" hidden>Показать ещё</button></div>' +
          '</div></div></div>' +
          '<dialog class="pcd" id="pcd" aria-labelledby="pcd-t"><div class="pcd__in" id="pcd-in"></div></dialog>' +
          '<dialog class="pcd pcd--cart" id="pck" aria-labelledby="pck-t"><div class="pcd__in" id="pck-in"></div></dialog>' +
          '<button type="button" class="pc__fab" id="pc-fab" hidden aria-label="Открыть корзину"></button>') +
        sec("order", "", orderForm("f-parts", "Не нашли нужную деталь?", "Оставьте телефон или пришлите фото детали в мессенджер. Менеджер подберёт запчасть под вашу модель и год выпуска.", "Подобрать", "Спасибо! Менеджер скоро позвонит."));
    }
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Запчасти и аксессуары</span>', "Запчасти и аксессуары", "Оригинальные запчасти, зарядные устройства и расходники для Falcon, Lynx и Y-Volt. Если доставка нашим курьером — привезём вместе с байком, если транспортной компанией — отправим СДЭКом.") +
      sec("", "Запчасти", '<div class="tech">' + items.map(function (a) { return '<article class="card"><h3 class="h3">' + esc(a.title) + "</h3><p>" + esc(a.text) + "</p></article>"; }).join("") + "</div>") +
      sec("", "Запчасти", '<div class="duo"><div class="card"><h3 class="h3">Держим в наличии</h3><ul class="list"><li><span>Расходники: колодки, камеры, покрышки, цепи.</span></li><li><span>Штатные зарядные устройства.</span></li><li><span>Детали подвески и пластик — уточняйте у менеджера.</span></li></ul></div><div class="card"><h3 class="h3">Как заказать</h3><ul class="list"><li><span>Назовите модель и деталь менеджеру или пришлите фото в мессенджер.</span></li><li><span>Отправим СДЭК в любой город или выдадим в шоуруме.</span></li></ul></div></div>') +
      sec("order", "", orderForm("f-parts", "Подобрать запчасть", "Оставьте телефон. Менеджер уточнит модель и наличие.", "Подобрать", "Спасибо! Менеджер скоро позвонит."));
  };
  function faqGroups() {
    var seen = {}, all = (C.faq || []).filter(function (f) { if (seen[f.q]) return false; seen[f.q] = 1; return true; });
    var G = [
      ["buy", "Покупка, доставка и оплата", function (q) { return /достав|оплат|рассроч|вернуть|«серого»|вживую|собранным/i.test(q); }],
      ["use", "Эксплуатация, гарантия и сервис", function (q) { return /права|дожд|гаранти|запчаст|зарядк/i.test(q) && !/Surge|Falcon|Lynx/.test(q); }],
      ["pick", "Выбор модели", function (q) { return (!/GT|Pro|Lynx|Lite|Surge/.test(q) || /Sur-Ron/.test(q)) && !/музыка|эндуро/.test(q); }],
      ["gt", "Falcon GT", function (q) { return /GT/.test(q); }],
      ["pro", "Falcon Pro", function (q) { return /Pro/.test(q) && !/Lite/.test(q); }],
      ["lynx-trail", "Falcon Lynx Trail", function (q) { return /Lynx Trail|музыка/.test(q) && !/^Чем Lynx X/.test(q); }],
      ["light", "Falcon Lite", function (q) { return /Lite/.test(q); }],
      ["lynx-x", "Falcon Lynx X", function (q) { return /Lynx X/.test(q); }],
      ["surge-v", "Y-Volt Surge V", function (q) { return /Surge|эндуро/.test(q); }]
    ], used = {}, out = [];
    G.forEach(function (g) { var items = all.filter(function (f) { if (used[f.q] || !g[2](f.q)) return false; used[f.q] = 1; return true; }); if (items.length) out.push([g[0], g[1], items]); });
    var rest = all.filter(function (f) { return !used[f.q]; }); if (rest.length) out[2] ? out[2][2] = out[2][2].concat(rest) : out.push(["more", "Другие вопросы", rest]);
    var nav = '<nav class="faq-nav" aria-label="Разделы">' + out.map(function (g) { return '<a class="chip" href="#faq-' + g[0] + '">' + esc(g[1]) + "</a>"; }).join("") + "</nav>";
    return sec("", "", nav) + out.map(function (g) { return sec("faq-" + g[0], g[1], faqHtml(g[2], true)); }).join("") +
      sec("", "", '<div class="callout">' + ICON.phone + '<p>Не нашли ответ? Позвоните <a href="' + PHONE_HREF + '">' + PHONE + '</a> или напишите в мессенджер — менеджер подскажет.</p></div>');
  }
  /* 01.11.2026: служебные страницы (политика, возврат, декларация, дилерам, 404) — данные window.DOCS (data/legal.js) */
  P.doc = function () {
    var k = window.B79_DOC_SLUG || new URLSearchParams(location.search).get("d") || "error", d = (window.DOCS || {})[k] || (window.DOCS || {}).error || { title: "Страница", html: "" };
    try { if (!window.B79_NATIVE) document.title = d.title + " | Falcon Bike"; } catch (e) {}
    return head((d.crumb ? "<span>" + esc(d.crumb) + '</span><span aria-hidden="true">/</span>' : "") + "<span>" + esc(d.title) + "</span>", d.title, d.lead || "") +
      sec("", "", '<article class="doc">' + d.html + "</article>");
  };
  P.legal = function () {
    var d = (window.LEGAL || {})[document.body.getAttribute("data-doc")] || { title: "Документ", html: "" };
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>' + esc(d.title) + "</span>", d.title, "") +
      sec("", "", '<div class="callout">' + ICON.alert + '<p>Черновик документа. Перед публикацией его проверит юрист; места, выделенные цветом, заполнит владелец.</p></div><article class="doc">' + d.html + "</article>");
  };
  P.faq = function () {
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Вопрос-ответ</span>', "Вопрос-ответ", "Права и регистрация, заряд, дождь, гарантия, доставка и оплата.") +
      faqGroups();
  };
  /* ---------- События (данные: data/events.js, общий файл с 79bike.ru) ---------- */
  var REP_EVENTS = "https://79bike.ru/events";
  function evList() {
    var E = (window.EVENTS || []).slice();
    function key(e) { return e.date ? String(e.date) : ""; }
    return E.sort(function (a, b) { if (!!a.upcoming !== !!b.upcoming) return a.upcoming ? -1 : 1; var ka = key(a), kb = key(b); if (!ka !== !kb) return ka ? -1 : 1; return ka < kb ? 1 : ka > kb ? -1 : 0; });
  }
  function evImg(src, w) { return "assets/" + src + "-" + w + ".webp"; }
  function evMeta(e) { return '<p class="ev__meta">' + (e.dateText ? '<b>' + esc(e.dateText) + "</b>" : "") + '<span>' + esc([e.place, e.city].filter(Boolean).join(" · ")) + "</span></p>"; }
  function evCard(e, compact) {
    var ph = e.photos || [], p0 = ph[0];
    var pics = p0 ? '<a class="ev__pic" href="' + evImg(p0.src, 1600) + '" target="_blank" rel="noopener"><img src="' + evImg(p0.src, 640) + '" alt="' + esc(p0.alt || e.title) + '" loading="lazy" decoding="async"><span class="ev__type">' + esc(e.type) + "</span></a>" : "";
    var more = !compact && ph.length > 1 ? '<div class="ev__thumbs">' + ph.slice(1).map(function (q) { return '<a href="' + evImg(q.src, 1600) + '" target="_blank" rel="noopener"><img src="' + evImg(q.src, 640) + '" alt="' + esc(q.alt || "") + '" loading="lazy" decoding="async"></a>'; }).join("") + "</div>" : "";
    var link = !compact && e.link && e.link.url ? '<a class="ev__link" href="' + esc(e.link.url) + '" target="_blank" rel="noopener">' + esc(e.link.text || "Подробнее") + "</a>" : "";
    return '<article class="ev" data-type="' + esc(e.type) + '">' + pics + '<div class="ev__body">' + evMeta(e) + '<h3 class="h3">' + esc(e.title) + "</h3>" + (compact ? "" : "<p>" + esc(e.text) + "</p>" + more + link) + "</div></article>";
  }
  function evUp(e) {
    var ph = e.photos || [], p0 = ph[0];
    return '<article class="ev-up">' + (p0 ? '<a class="ev-up__pic" href="' + evImg(p0.src, 1600) + '" target="_blank" rel="noopener"><img src="' + evImg(p0.src, 1600) + '" alt="' + esc(p0.alt || e.title) + '" loading="lazy" decoding="async"></a>' : "") +
      '<div class="ev-up__body"><p class="ev-up__tag">' + (e.date && /^\d{4}-\d\d(-\d\d)?$/.test(e.date) ? "Ближайшее событие" : "Действует сейчас") + " · " + esc(e.type) + "</p>" + '<h3 class="h3">' + esc(e.title) + "</h3>" + evMeta(e) + "<p>" + esc(e.text) + '</p><div class="visit-cta">' + evCta(e) + "</div></div></article>";
  }
  function evCta(e) {
    if (!e.cta || !e.cta.length) return '<a class="btn btn--main" href="testdrive.html#visit">Записаться</a><a class="btn btn--ghost" href="' + PHONE_HREF + '">Позвонить</a>';
    return e.cta.map(function (c, i) { var ext = /^https?:/.test(c.url); return '<a class="btn ' + (i ? "btn--ghost" : "btn--main") + '" href="' + esc(c.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(c.text) + "</a>"; }).join("");
  }
  function evRepLink() { return '<a class="ev-rep" href="' + REP_EVENTS + '" target="_blank" rel="noopener">Все события 79BIKE на сайте бренда 79bike.ru<span aria-hidden="true"> →</span></a>'; }
  function homeEvents() {
    var E = evList(); if (!E.length) return "";
    return sec("events", "События", '<div class="ev-grid ev-grid--home">' + E.slice(0, 3).map(function (e) { return evCard(e, true); }).join("") + "</div>", '<a class="btn btn--ghost" href="events.html">Все события</a>');
  }
  P.events = function () {
    var E = evList(), up = E.filter(function (e) { return e.upcoming; }), past = E.filter(function (e) { return !e.upcoming; });
    var types = []; past.forEach(function (e) { if (types.indexOf(e.type) < 0) types.push(e.type); });
    var flt = types.length > 1 ? '<div class="ev-filter" role="group" aria-label="Тип события"><button class="chip" type="button" aria-pressed="true" data-ev="">Все</button>' + types.map(function (t) { return '<button class="chip" type="button" aria-pressed="false" data-ev="' + esc(t) + '">' + esc(t[0].toUpperCase() + t.slice(1)) + "</button>"; }).join("") + "</div>" : "";
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>События</span>', "События 79BIKE", "Выставки, тест-драйвы и встречи с электромотоциклами 79BIKE в России и в мире. Ближайшие события — сверху, ниже — фото и итоги прошедших.") +
      '<div class="wrap ev-top">' + evRepLink() + "</div>" +
      (up.length ? sec("upcoming", "Ближайшие", up.map(evUp).join("")) : "") +
      sec("past", "Прошедшие события", flt + '<div class="ev-grid" id="ev-grid">' + past.map(function (e) { return evCard(e, false); }).join("") + '</div><p class="ev-empty" id="ev-empty" hidden>Событий этого типа пока нет.</p>'); /* 26.10 (правка 11): ссылка на события 79bike.ru убрана */
  };

  /* ---------- Блогерам и медиа (bloggers.html) ---------- */
  function blogForm() {
    var id = "f-blog";
    var plat = ["YouTube", "VK Видео", "RUTUBE", "Telegram", "Instagram", "TikTok", "Дзен", "Другая"];
    return '<div class="cta-band blog-band"><div style="flex:1 1 320px"><h2>Заявка на сотрудничество</h2><p>Расскажите о канале и идее ролика. Менеджер свяжется, обсудит формат и подберёт байк и дату съёмки.</p><p class="blog-band__note">Условия партнёрства обсуждаем индивидуально — после знакомства с каналом.</p><p class="blog-band__note">Техника выдаётся только под залог полной стоимости. Доставка оплачивается отдельно.</p></div>' +
      '<form class="form blog-form" id="' + id + '" style="flex:1 1 420px" novalidate>' +
      '<label for="' + id + '-name">Имя</label><input id="' + id + '-name" name="name" type="text" autocomplete="name" data-req="Укажите имя." placeholder="Как к вам обращаться">' +
      '<label for="' + id + '-url">Ссылка на канал</label><input id="' + id + '-url" type="url" inputmode="url" data-req="Добавьте ссылку на канал или профиль." placeholder="https://">' +
      '<fieldset class="form__how form__plats"><legend>Площадки <small>(можно несколько)</small></legend>' + plat.map(function (x, i) { return '<label class="opt"><input type="checkbox" name="pl" value="' + esc(x) + '"' + (i === 0 ? ' data-req-any="Отметьте хотя бы одну площадку."' : "") + "><span>" + esc(x) + "</span></label>"; }).join("") + "</fieldset>" +
      '<div class="blog-form__row"><div><label for="' + id + '-aud">Аудитория, подписчиков</label><input id="' + id + '-aud" type="text" inputmode="numeric" data-req="Укажите размер аудитории." placeholder="Например, 25 000"></div>' +
      '<div><label for="' + id + '-city">Город</label><input id="' + id + '-city" type="text" autocomplete="address-level2" data-req="Укажите город." placeholder="Москва"></div></div>' +
      '<label for="' + id + '-idea">Идея ролика</label><textarea id="' + id + '-idea" class="form__ta" rows="3" placeholder="Формат, локация, какую модель хотите снять"></textarea>' +
      contactHtml(id, "Telegram") +
      '<label class="form__check"><input type="checkbox" name="age18" data-req-check="Подтвердите, что вам есть 18 лет и вы готовы внести залог."><span>Мне есть 18 лет, я готов внести залог на случай повреждений</span></label>' + /* 26.10 (Михаил): тест-драйв для обзора — та же обязательная галочка */
      '<label class="form__check"><input type="checkbox" name="pd" data-req-check="Чтобы отправить заявку, отметьте согласие на обработку персональных данных."><span>Даю <a href="consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a></span></label>' +
      '<button class="btn" type="submit">Отправить заявку</button><p class="form__legal">Подробнее — в <a href="privacy.html" target="_blank" rel="noopener">Политике обработки персональных данных</a>.</p><p class="form__ok" aria-live="polite" data-ok="Спасибо! Заявку получили — посмотрим канал и ответим."></p></form></div>';
  }
  function blogVideos() {
    var pin = (C.reviews || {}).pinned || {}, want = [["surge-v", "Роман Курбатов"], ["lynx-trail", "EXPLOSIVE MIKE"], ["lynx-trail", "Raptor TV"]], out = [];
    want.forEach(function (w) { (pin[w[0]] || []).forEach(function (v) { if (v.author === w[1] && out.length < 3 && !out.some(function (o) { return o.url === v.url; })) out.push(Object.assign({ slug: w[0] }, v)); }); });
    if (out.length < 3) Object.keys(pin).forEach(function (k) { pin[k].forEach(function (v) { if (out.length < 3 && v.author && v.author !== "79BIKE" && !/official/i.test(v.author) && !out.some(function (o) { return o.url === v.url; })) out.push(Object.assign({ slug: k }, v)); }); });
    return out;
  }
  P.bloggers = function () {
    var who = [["Мото- и эндуро-блогеры", "Обзоры, замеры, покатушки по бездорожью и трассе."], ["Лайфстайл и путешествия", "Байк как часть образа жизни: выходные за городом, дача, хобби."], ["Авто- и техноблогеры", "Сравнения с ДВС, разбор электроники, батарей и приложения."], ["Новые форматы", "Шортсы, стримы, Telegram-каналы и подкасты о технике."]];
    var plats = ["YouTube", "VK Видео", "RUTUBE", "Telegram", "Instagram"];
    var offer = [["Тест-драйв байка", "Модели линейки — Falcon Lite, Pro, GT и Lynx Trail — в шоуруме «Речников 21» или на площадке для съёмки. Формат, модель и время согласуем заранее."], ["Материалы бренда", "Официальные фото и видео 79BIKE, характеристики и ответы инженеров — для точного и интересного ролика."], ["Партнёрские форматы", "Обзоры, интеграции, совместные проекты и долгосрочное сотрудничество. Условия обсуждаем индивидуально."]];
    var expect = ["Честный обзор: плюсы и минусы — как вы их видите", "Отметка бренда 79BIKE и ссылка на falcon-bike.ru в описании", "Маркировка рекламы по закону, если ролик — рекламная интеграция", "Бережное отношение к байку и соблюдение правил на съёмке"];
    var steps = [["Заявка", "Заполните форму ниже: канал, аудитория, идея ролика."], ["Созвон", "Обсудим формат, модель, локацию и условия."], ["Бронь байка", "Согласуем дату и время тест-драйва или съёмки."], ["Съёмка", "Покажем байк, расскажем об особенностях, ответим на вопросы."], ["Публикация", "Выпускаете ролик, присылаете ссылку — делимся им в наших каналах и в каналах блогера."]];
    var vids = blogVideos();
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Блогерам и медиа</span>', "Блогерам и медиа", "Снимаете о мототехнике, бездорожье или технологиях? Дадим электромотоцикл 79BIKE на тест-драйв для обзора и обсудим партнёрство.") +
      '<div class="wrap blog-hero-cta"><a class="btn btn--main" href="#apply">Оставить заявку</a><a class="btn btn--ghost" href="https://t.me/Meliso_group" target="_blank" rel="noopener">Написать в Telegram</a></div>' +
      sec("who", "Кому подходит", '<div class="grid2 blog-who">' + who.map(function (w) { return '<div class="card"><h3 class="h3">' + esc(w[0]) + "</h3><p>" + esc(w[1]) + "</p></div>"; }).join("") + '</div><p class="blog-plats" aria-label="Площадки">' + plats.map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") + "</p>") +
      sec("offer", "Что предлагаем", '<div class="grid3">' + offer.map(function (o) { return '<div class="card"><h3 class="h3">' + esc(o[0]) + "</h3><p>" + esc(o[1]) + "</p></div>"; }).join("") + "</div>") +
      sec("expect", "Что ждём от вас", '<ul class="list blog-list">' + expect.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>") +
      sec("how", "Как проходит сотрудничество", '<ol class="steps blog-steps">' + steps.map(function (st) { return '<li class="card step"><h3 class="h3">' + esc(st[0]) + "</h3><p>" + esc(st[1]) + "</p></li>"; }).join("") + "</ol>") +
      (vids.length ? sec("reviews", "Обзоры блогеров", videoCards(vids), '<a class="btn btn--ghost" href="video.html">Все видеообзоры</a>') : "") +
      sec("apply", "", blogForm());
  };
  function showroomGallery() {
    var G = [["lineup", "Все модели в шоуруме — смотрите и сравнивайте вживую"], ["pro-colors", "Falcon Pro в разных расцветках"], ["gear", "Линейка Falcon и белый Falcon GT"], ["wall", "Стена Falcon Pro и Falcon GT"]];
    return '<div class="room-gal room-gal--4">' + G.map(function (g, i) { return '<a class="room-gal__i' + (i === 0 ? " room-gal__i--big" : "") + '" href="assets/showroom/' + g[0] + '-1600.webp" target="_blank" rel="noopener"><img src="assets/showroom/' + g[0] + '-' + (i === 0 ? 1600 : 800) + '.webp" alt="Шоурум 79BIKE в Москве: ' + esc(g[1]) + '" loading="lazy" decoding="async"><span>' + esc(g[1]) + "</span></a>"; }).join("") + "</div>";
  }
  P.contacts = function () {
    var sh = C.showroom || {};
    return head("<span>Контакты</span>", "Шоурум и контакты", esc(sh.text || "")) +
      sec("", "", showroomGallery()) +
      sec("", "", '<div class="grid2"><div class="card" style="gap:14px"><p class="t-cap">Телефон и мессенджеры</p><span class="contact-big">' + PHONE + '</span><div class="social"><a href="https://t.me/Meliso_group" target="_blank" rel="noopener">Telegram</a><a href="https://wa.me/79999005588" target="_blank" rel="noopener">WhatsApp</a><a href="https://vk.me/79bike" target="_blank" rel="noopener">VK Мессенджер</a><a href="https://vk.com/79bike" target="_blank" rel="noopener">ВКонтакте</a></div></div>' +
        '<div class="card" style="gap:14px"><p class="t-cap">Шоурум</p><h2 class="h3" style="font-size:24px">' + esc(sh.address || "") + '</h2>' + (sh.metro ? '<p class="room__row metro-row"><span class="metro-m" aria-hidden="true">М</span>' + esc(sh.metro) + '</p>' : "") + '<p class="room__row"><span class="open-dot" aria-hidden="true"></span>' + esc(sh.hours || "") + '</p><p class="visit-note">' + ICON.phone + '<b>' + esc(sh.visitNote || "") + '</b></p><div class="visit-cta"><a class="btn btn--main" href="' + PHONE_HREF + '">Позвонить</a>' + (sh.mapUrl ? '<a class="btn btn--ghost" href="' + sh.mapUrl + '" target="_blank" rel="noopener">Построить маршрут</a>' : "") + '</div></div></div>') +
      sec("route", "Как к нам приехать", '<div class="route-wrap"><div class="route-vid route-vid--page"><video src="assets/route/route-720.mp4" poster="assets/route/route-poster.webp" controls playsinline preload="none" aria-label="Видео: как пройти от въезда на ул. Речников, 21 до шоурума 79BIKE"></video></div><div><ol class="steps visit-steps">' + (sh.steps || []).map(function (st, i) { return '<li class="card step"><h3 class="h3">' + esc(st[0]) + "</h3><p>" + esc(st[1]) + "</p></li>"; }).join("") + '</ol><p class="t-cap" style="margin-top:12px">' + esc(sh.testDrive || "") + "</p></div></div>") +
      ((sh.testDriveRules && sh.testDriveRules.length) ? sec("td-rules", "Условия тест-драйва", '<ul class="td-rules">' + sh.testDriveRules.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + '</ul><p style="margin-top:12px"><a class="btn btn--ghost" href="testdrive.html">Подробнее о тест-драйве</a></p>') : "") +
      sec("visit", "", orderForm("f-visit", "Записаться на тест-драйв", "Тест-драйв проводим для жителей Москвы и Московской области. Выберите модель и оставьте телефон. Перезвоним и согласуем время визита.", "Записаться", "Спасибо! Перезвоним и согласуем время.", { model: true, when: true })) +
      sec("", "Реквизиты", '<p class="req">' + esc(C.footer ? C.footer.legal : "") + "<br>" + esc(C.footer ? C.footer.copyright : "") + "</p>");
  };

  /* 29.10: отдельная страница тест-драйва (согласовано в «Главной» 28.10, вопрос 10): Москва и МО, модели без Lynx X */
  P.testdrive = function () {
    var sh = C.showroom || {}, list = ["pro", "gt", "light", "lynx-trail", "surge-v"].filter(function (s) { return bySlug(s); });
    return head("<span>Тест-драйв</span>", "Тест-драйв электромотоциклов в Москве и МО", "Тест-драйв Falcon GT, Falcon Pro, Falcon Lite, Falcon Lynx Trail и Y-Volt Surge V — в шоуруме «Речников 21» в Москве, для жителей Москвы и Московской области. Только по предварительной записи: позвоните или оставьте заявку — подготовим нужную модель.") +
      '<div class="wrap blog-hero-cta"><a class="btn btn--main" href="#visit">Записаться на тест-драйв</a><a class="btn btn--ghost" href="' + PHONE_HREF + '">Позвонить</a></div>' +
      sec("td-models", "Какие модели можно попробовать", modelCards(list)) +
      ((sh.testDriveRules && sh.testDriveRules.length) ? sec("td-rules", "Условия тест-драйва", '<ul class="td-rules">' + sh.testDriveRules.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>") : "") +
      sec("td-how", "Как проходит тест-драйв", '<ol class="steps visit-steps">' + (sh.steps || []).map(function (st) { return '<li class="card step"><h3 class="h3">' + esc(st[0]) + "</h3><p>" + esc(st[1]) + "</p></li>"; }).join("") + "</ol>") +
      sec("", "Шоурум в Москве", showroomGallery() + '<p class="t-cap" style="margin-top:12px">' + esc(sh.address || "") + (sh.metro ? " · м. " + esc(sh.metro.replace(/^м\.?\s*/i, "")) : "") + ' · <a href="contacts.html#route">Как к нам приехать</a></p>') +
      sec("visit", "", orderForm("f-visit", "Записаться на тест-драйв", "Тест-драйв проводим для жителей Москвы и Московской области. Выберите модель и оставьте телефон. Перезвоним и согласуем время визита.", "Записаться", "Спасибо! Перезвоним и согласуем время.", { model: true, when: true }));
  };
  /* ---------- блог: data/blog.js → blog.html (список), post.html?s=<slug> (статья), блок «Полезное» на главной ---------- */
  var BLOG = window.BLOG || { rubrics: [], posts: [] }, BSITE = "https://falcon-bike.ru";
  function blogPosts() { return (BLOG.posts || []).map(function (p, i) { return [p, i]; }).sort(function (a, b) { return a[0].date < b[0].date ? 1 : a[0].date > b[0].date ? -1 : a[1] - b[1]; }).map(function (x) { return x[0]; }); }
  function blogRub(id) { var R = BLOG.rubrics || []; for (var i = 0; i < R.length; i++) if (R[i].id === id) return R[i]; return { id: id, name: "" }; }
  function blogPost(s) { var L = BLOG.posts || []; for (var i = 0; i < L.length; i++) if (L[i].slug === s) return L[i]; return null; }
  function blogDate(d) { var M = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"], p = String(d || "").split("-"); return p.length === 3 ? +p[2] + " " + M[+p[1] - 1] + " " + p[0] : ""; }
  function blogUrl(p) { return "post.html?s=" + encodeURIComponent(p.slug); }
  function blogThumb(p) { return /assets\/gallery\/.+\.webp$/.test(p.cover || "") ? p.cover.replace(/\.webp$/, "-s.webp") : p.cover; }
  function blogFill(html) {
    return String(html || "").replace(/\{\{price:([\w-]+)\}\}/g, function (m, s) { var x = bySlugSafe(s); return x && x.price ? money(x.price) : "цена по запросу"; })
      .replace(/\{\{credit:([\w-]+)\}\}/g, function (m, s) { var v = creditMin(s); return v && isFinite(v) ? money(v) : "—"; });
  }
  function blogCard(p) {
    return '<article class="bcard" data-rub="' + esc(p.rubric) + '"><a href="' + blogUrl(p) + '">' +
      '<span class="bcard__pic">' + (p.cover ? '<img src="' + esc(blogThumb(p)) + '" alt="' + esc(p.coverAlt || p.title) + '" loading="lazy" decoding="async">' : "") + "</span>" +
      '<span class="bcard__body"><span class="bcard__meta">' + esc(blogRub(p.rubric).name) + " · " + p.readMin + " мин</span>" +
      '<span class="bcard__t">' + esc(p.title) + '</span><span class="bcard__lead">' + esc(p.lead) + "</span></span></a></article>";
  }
  function blogRepLink() {
    var r = BLOG.repBlog; if (!r) return "";
    return '<a class="card blog-rep" href="' + esc(r.href) + '" target="_blank" rel="noopener"><span class="t-cap">79bike.ru</span><b>' + esc(r.text) + "</b><span>" + esc(r.note) + "</span></a>";
  }
  function blogSeo(o) {
    function meta(attr, name, content) {
      var m = document.head.querySelector("meta[" + attr + '="' + name + '"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute(attr, name); document.head.appendChild(m); }
      m.setAttribute("content", content);
    }
    document.title = o.title;
    meta("name", "description", o.description);
    meta("property", "og:type", o.type); meta("property", "og:site_name", "FALCON-BIKE"); meta("property", "og:locale", "ru_RU");
    meta("property", "og:title", o.title); meta("property", "og:description", o.description); meta("property", "og:url", o.canonical);
    meta("property", "og:image", new URL(o.image || "assets/og/brand.jpg", location.href).href);
    meta("name", "twitter:card", "summary_large_image");
    var c = document.head.querySelector('link[rel="canonical"]') || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
    c.href = o.canonical;
    (o.ld || []).forEach(function (x) { var t = document.createElement("script"); t.type = "application/ld+json"; t.text = JSON.stringify(x); document.head.appendChild(t); });
  }
  function blogCrumbsLd(items) {
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(function (x, i) { return { "@type": "ListItem", position: i + 1, name: x[0], item: x[1] }; }) };
  }
  function homeBlog() {
    var L = blogPosts().slice(0, 3);
    return L.length ? sec("blog", "Полезное", '<div class="bgrid bgrid--home">' + L.map(blogCard).join("") + "</div>", '<a class="btn btn--ghost" href="blog.html">Все статьи</a>') : "";
  }
  P.blog = function () {
    var L = blogPosts(), R = (BLOG.rubrics || []).filter(function (r) { return L.some(function (p) { return p.rubric === r.id; }); });
    // мета-теги, canonical и JSON-LD (Blog + BreadcrumbList) списка статей — в data/seo.js (seo/build-seo.js, ключ "blog"), применяет applySeo()
    return head("<span>Блог</span>", esc(BLOG.title || "Блог 79BIKE"), esc(BLOG.lead || "")) +
      secH("", "Статьи", '<div class="blog-rubs" role="group" aria-label="Рубрики"><button type="button" class="chip" data-brub="" aria-pressed="true">Все статьи</button>' + R.map(function (r) { return '<button type="button" class="chip" data-brub="' + esc(r.id) + '" aria-pressed="false">' + esc(r.name) + "</button>"; }).join("") + "</div>" +
        '<div class="bgrid" id="blog-grid">' + L.map(blogCard).join("") + '</div><p class="note" id="blog-empty" hidden>В этой рубрике пока нет статей.</p>') +
      sec("", "", '<div class="blog-foot">' + blogRepLink() + '<a class="card card--cta" href="podbor.html"><b>Не знаете, какой байк выбрать?</b><span class="btn btn--light" style="align-self:flex-start;min-height:44px">Подобрать за минуту</span></a></div>');
  };
  /* 26.10 (Михаил): блоки покупки в статье — B «подбор по росту» в середине (слот <div class="buy-slot" data-pos="mid"> в data/blog.js,
     без слота — перед средним H2), в конце — A «карточка модели из статьи» и компактная форма заявки. Цифры и цены — только из data/models.js. */
  var BUY_FIT = ["lynx-trail", "surge-v", "gt", "pro", "light", "lynx-x"];
  function buyCard(s, mini) {
    var x = bySlug(s), sp = x.specs || {}, href = FILE[s] || x.page;
    var price = x.price ? "<b>" + money(x.price) + "</b>" + (x.oldPrice ? "<s>" + money(x.oldPrice) + "</s>" : "") : "<b>Старт продаж в " + esc(x.launch || "2027") + "</b>";
    return '<aside class="pbuy buy-a' + (mini ? " buy-a--mini" : "") + '" aria-label="' + esc(x.name) + '">' +
      '<a class="buy-a__pic" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + cutSrc(s) + '" alt="" loading="lazy" decoding="async"></a>' +
      '<div><span class="buy-a__badge">' + esc(x.audience || "") + '</span><span class="buy-a__name">' + esc(x.name) + "</span>" +
      '<ul class="buy-a__kv"><li>сиденье <b>' + sp.seatMm + " мм</b></li><li>нагрузка <b>до " + sp.payloadKg + " кг</b></li><li><b>" + String(sp.powerKw).replace(".", ",") + " кВт</b></li></ul>" +
      '<div class="buy-a__price">' + price + "</div></div>" +
      '<div class="buy-a__btns"><a class="btn btn--main" href="' + href + '">Подробнее</a><a class="btn btn--ghost" href="testdrive.html#visit">Тест-драйв</a></div></aside>';
  }
  function buyEnd(ms) {
    if (!ms.length) return "";
    return '<div class="buy-end"><span class="buy-end__t">' + (ms.length > 1 ? "Модели из статьи" : "Модель из статьи") + "</span>" +
      (ms.length === 1 ? buyCard(ms[0]) : '<div class="buy-pair">' + ms.map(function (s) { return buyCard(s, true); }).join("") + "</div>") + "</div>";
  }
  function buyFit() {
    return '<aside class="pbuy buy-b" aria-label="Подбор по росту"><span class="buy-b__t">Подбор по росту за минуту</span><p class="buy-b__s">Введите рост — покажем модели, которые 79BIKE рекомендует для него.</p>' +
      '<div class="bfit"><label for="fit-h">Ваш рост</label><span class="fit__in"><button type="button" class="fit__step" data-fit-d="-1" aria-label="Меньше">−</button><input id="fit-h" type="number" inputmode="numeric" min="' + H_MIN + '" max="' + H_MAX + '" value="175"><span>см</span><button type="button" class="fit__step" data-fit-d="1" aria-label="Больше">+</button></span></div>' +
      '<ul class="fit__res" id="fit-res" aria-live="polite"></ul><p class="fit__note" id="fit-note"></p>' +
      '<div class="buy-b__foot"><a class="btn btn--main" href="podbor.html">Посмотреть посадку на байке</a><a class="btn btn--ghost" href="testdrive.html#visit">Примерить в шоуруме</a></div></aside>';
  }
  function buyFitUpdate() {
    var inp = $("fit-h"); if (!inp) return;
    var h = parseInt(inp.value, 10), L = BUY_FIT.filter(function (s) { var r = FIT_RANGE[s]; return r && bySlugSafe(s) && h >= r[0] && h <= r[1]; });
    $("fit-res").innerHTML = L.map(function (s) { var x = bySlug(s), soon = x.status === "soon"; return '<li><a class="' + (soon ? "is-soon" : "") + '" href="' + (FILE[s] || x.page) + '">' + esc(x.name) + " <small>сиденье <b>" + x.specs.seatMm + " мм</b>" + (soon ? " · старт продаж в " + esc(x.launch || "2027") : "") + "</small></a></li>"; }).join("");
    $("fit-note").textContent = !h ? "Введите рост в сантиметрах." : !L.length ? (h > 195 ? "Рекомендации производителя заканчиваются на 195 см — приезжайте на примерку." : "Рекомендации производителя начинаются со 150 см — приезжайте на примерку.") : "Окончательно посадку проверьте на примерке: стоя на подножках, а не только сидя.";
  }
  function buyForm() {
    var id = "f-post";
    return '<form class="form qf" id="' + id + '" novalidate aria-label="Заявка на консультацию"><span class="qf__t">Остались вопросы? Перезвоним</span>' +
      '<div class="qf__row"><input id="' + id + '-name" type="text" name="name" autocomplete="name" placeholder="Имя" aria-label="Имя">' +
      '<input id="' + id + '-ph" type="tel" name="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" maxlength="40" aria-label="Телефон" data-contact>' +
      '<button class="btn btn--main" type="submit">Отправить</button></div>' +
      '<label class="form__check"><input type="checkbox" name="pd" data-req-check="Чтобы отправить заявку, отметьте согласие на обработку персональных данных."><span>Даю <a href="consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a>. Подробнее — в <a href="privacy.html" target="_blank" rel="noopener">политике конфиденциальности</a>.</span></label>' +
      '<p class="form__ok" aria-live="polite" data-ok="Спасибо! Заявка принята."></p></form>';
  }
  function buyModels(p) {
    var ms = (p.models || []).filter(function (x) { return bySlugSafe(x); });
    if (ms.length) return ms;
    var t = (p.title || "") + " " + (p.html || "");
    ms = ORDER.filter(function (s) { var x = bySlugSafe(s); return x && t.indexOf(x.name) >= 0; });
    return ms.length ? ms.slice(0, 4) : ["pro", "lynx-trail"];
  }
  function buyInsert(body, ms) {
    var done = false;
    body = body.replace(/<div class="buy-slot" data-pos="mid"><\/div>/g, function () { if (done) return ""; done = true; return buyFit(); });
    if (!done) {
      var hs = body.match(/<h2 id="b\d+">/g) || [], mid = hs[Math.floor(hs.length / 2)];
      if (mid && hs.length > 2) body = body.replace(mid, buyFit() + "\n" + mid);
    }
    return body + buyEnd(ms) + buyForm();
  }
  if (page === "post") {
    document.addEventListener("input", function (e) { if (e.target && e.target.id === "fit-h") buyFitUpdate(); });
    document.addEventListener("change", function (e) { var i = e.target; if (i && i.id === "fit-h" && i.value !== "") { var v = parseInt(i.value, 10); if (v < H_MIN || v > H_MAX) { i.value = Math.max(H_MIN, Math.min(H_MAX, v)); buyFitUpdate(); } } });
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-fit-d]"); if (!b) return;
      var i = $("fit-h"); i.value = Math.max(H_MIN, Math.min(H_MAX, (parseInt(i.value, 10) || 175) + +b.getAttribute("data-fit-d"))); buyFitUpdate();
    });
    setTimeout(buyFitUpdate, 0);
  }
  P.post = function () {
    var qs = new URLSearchParams(location.search), s = qs.get("s") || decodeURIComponent((location.hash || "").replace(/^#/, "")), p = blogPost(s);
    if (!p) {
      document.title = "Статья не найдена | Блог 79BIKE";
      return head('<a href="blog.html">Блог</a>', "Статья не найдена", "Возможно, адрес изменился. Все статьи — в блоге.") + sec("", "", '<a class="btn btn--main" href="blog.html">Перейти в блог</a>');
    }
    var canon = BSITE + "/blog/" + p.slug, rub = blogRub(p.rubric), toc = [], n = 0;
    var body = blogFill(p.html).replace(/<h2>([\s\S]*?)<\/h2>/g, function (m, t) { n++; toc.push(["b" + n, t.replace(/<[^>]+>/g, "")]); return '<h2 id="b' + n + '">' + t + "</h2>"; });
    var faq = p.faq || [], ms = (p.models || []).filter(function (x) { return bySlugSafe(x); });
    var rel = (p.related || []).map(blogPost).filter(Boolean);
    if (rel.length < 3) blogPosts().forEach(function (x) { if (rel.length < 3 && x.slug !== p.slug && rel.indexOf(x) < 0) rel.push(x); });
    var ld = [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.h1, description: p.seoDescription, image: p.cover ? BSITE + "/" + p.cover : undefined, datePublished: p.date, dateModified: p.updated || p.date, inLanguage: "ru-RU", articleSection: rub.name,
      author: { "@type": "Organization", name: "79BIKE · Falcon-Bike", url: BSITE + "/" }, publisher: { "@type": "Organization", name: "FALCON-BIKE", logo: { "@type": "ImageObject", url: BSITE + "/assets/logo/logo-dark.png" } }, mainEntityOfPage: canon },
      blogCrumbsLd([["Электромотоциклы 79BIKE", BSITE + "/"], ["Блог", BSITE + "/blog"], [p.h1, canon]])];
    if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(function (f) { return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }; }) });
    blogSeo({ title: p.seoTitle || p.title, description: p.seoDescription || p.lead, canonical: canon, type: "article", image: p.cover, ld: ld });
    return head('<a href="blog.html">Блог</a><span aria-hidden="true">/</span><a href="blog.html?r=' + esc(p.rubric) + '">' + esc(rub.name) + "</a>", esc(p.h1), esc(p.lead)) +
      '<div class="wrap"><p class="post-meta"><time datetime="' + esc(p.date) + '">' + blogDate(p.date) + "</time><span>" + p.readMin + " мин чтения</span><span>Официальный магазин 79BIKE</span></p>" +
      (p.cover ? '<figure class="post-cover"><img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt || p.h1) + '" decoding="async"></figure>' : "") + "</div>" +
      '<section class="sec post-sec"><div class="wrap post">' +
        (toc.length > 2 ? '<nav class="post-toc" aria-label="Содержание"><details' + (window.matchMedia && matchMedia("(min-width: 901px)").matches ? " open" : "") + '><summary>Содержание</summary><ol>' + toc.map(function (t) { return '<li><a href="#' + t[0] + '">' + esc(t[1]) + "</a></li>"; }).join("") + "</ol></details></nav>" : "<div></div>") +
        '<article class="prose blog-body">' + buyInsert(body, buyModels(p)) + "</article></div></section>" +
      (faq.length ? sec("post-faq", "Вопрос-ответ", faqHtml(faq, true)) : "") +
      // 26.10: секция «Модели из статьи» (modelCards) убрана — её роль взял блок A в конце статьи (buyEnd)
      // 26.10: карточка «Поможем выбрать…» убрана (решение 77) — дублировала блок A и форму в конце статьи
      (rel.length ? sec("post-rel", "Читайте также", '<div class="bgrid">' + rel.slice(0, 3).map(blogCard).join("") + "</div>", '<a class="btn btn--ghost" href="blog.html">Все статьи</a>') : "") +
      sec("", "", '<div class="blog-foot">' + blogRepLink() + "</div>");
  };
  if (page === "blog") document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-brub]"); if (!b) return;
    blogFilter(b.getAttribute("data-brub"));
  });
  function blogFilter(r) {
    var shown = 0;
    document.querySelectorAll("[data-brub]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-brub") === r)); });
    document.querySelectorAll("#blog-grid .bcard").forEach(function (c) { var on = !r || c.getAttribute("data-rub") === r; c.hidden = !on; if (on) shown++; });
    var em = document.getElementById("blog-empty"); if (em) em.hidden = shown > 0;
  }
  if (page === "blog") setTimeout(function () { var r = new URLSearchParams(location.search).get("r"); if (r) blogFilter(r); }, 0);


  /* ---------- 26.10 (Михаил): инструкции по эксплуатации (data/manuals.js; характеристики — из data/models.js) ---------- */
  var MN_ORDER = ["gt", "pro", "lynx-trail", "light", "surge-v"]; // 26.10: + Surge V (по руководству Y-VOLT)
  function mnFile(s) { return "manual-" + s + ".html"; }
  function mnSwitch(cur) {
    return '<nav class="mn-models" aria-label="Инструкции к другим моделям">' + MN_ORDER.map(function (s) { return '<a class="chip" href="' + mnFile(s) + '"' + (s === cur ? ' aria-current="page"' : "") + ">" + esc(SHORT[s]) + "</a>"; }).join("") +
      '<span class="chip is-off">Lynx X · к старту продаж</span></nav>';
  }
  function mnSpecs(m, ov) {
    if (!m) return "";
    ov = ov || {};
    var s = m.specs, d = s.dimensions || {}, R = [];
    function r(k, v) { if (v != null && v !== "" && v !== false) R.push([k, v]); }
    r("Максимальная мощность", s.powerKw != null ? num(s.powerKw) + " кВт" : "");
    r("Максимальная скорость", s.speedKmh ? s.speedKmh + " км/ч" : "");
    r("Крутящий момент на колесе", s.torqueNm ? s.torqueNm + " Н·м" : "");
    r("Аккумулятор", [s.voltage ? num(s.voltage) + " В" : "", s.capacityAh ? s.capacityAh + " А·ч" : "", s.cells || ""].filter(Boolean).join(", "));
    r("Запас хода", s.rangeKm ? s.rangeKm + " км" : "");
    r("Время зарядки", s.chargeH ? num(s.chargeH) + " ч" : "");
    r("Вес с аккумулятором", s.weightKg ? s.weightKg + " кг" : "");
    r("Допустимая нагрузка", (ov.payloadKg || s.payloadKg) ? (ov.payloadKg || s.payloadKg) + " кг" : ""); // ov — поправки из data/manuals.js (Lynx Trail: 120 кг, ответ Михаила 26.10)
    r("Высота сиденья", s.seatMm ? s.seatMm + " мм" : "");
    r("Клиренс", s.clearanceMm ? s.clearanceMm + " мм" : "");
    r("Колёсная база", s.wheelbaseMm ? s.wheelbaseMm + " мм" : "");
    r("Габариты (Д × Ш × В)", d.lengthMm ? d.lengthMm + " × " + d.widthMm + " × " + d.heightMm + " мм" : "");
    r("Шины", s.wheels ? s.wheels.front + " / " + s.wheels.rear : "");
    r("Передняя подвеска", s.frontSuspension);
    r("Задняя подвеска", s.rearSuspension);
    r("Тормозные диски, мм", s.brakes);
    r("Ширина руля", s.handlebarMm ? s.handlebarMm + " мм" : "");
    r("Влагозащита", s.ip ? s.ip + " (разъёмы IP55)" : "");
    r("Запуск по NFC", s.nfc === true ? "Есть" : s.nfc === false ? "Нет" : "");
    return '<div class="mn-tw"><table class="cr-t"><tbody>' + R.map(function (x) { return "<tr><td>" + esc(x[0]) + "</td><td>" + esc(x[1]) + "</td></tr>"; }).join("") + '</tbody></table></div><p class="mn-note">Характеристики совпадают с карточкой модели. <a href="' + FILE[m.slug] + '">Страница ' + esc(m.name) + "</a></p>";
  }
  var MN_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>';
  function mnBlock(b, m, ck, D) {
    var t = b[0];
    if (t === "p") return "<p>" + b[1] + "</p>";
    if (t === "h") return '<h3 class="h3">' + esc(b[1]) + "</h3>";
    if (t === "ul") return '<ul class="list">' + b[1].map(function (x) { return "<li><span>" + x + "</span></li>"; }).join("") + "</ul>";
    if (t === "ol") return '<ol class="mn-ol">' + b[1].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>";
    if (t === "steps") return '<ol class="mn-steps">' + b[1].map(function (x) { return "<li><b>" + esc(x[0]) + "</b>" + x[1] + "</li>"; }).join("") + "</ol>";
    if (t === "note" || t === "warn") return '<div class="callout' + (t === "warn" ? " mn-warn" : "") + '">' + MN_WARN + "<p>" + b[1] + "</p></div>";
    if (t === "table") return '<div class="mn-tw"><table class="cr-t">' + (b[1] ? "<thead><tr>" + b[1].map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead>" : "") + "<tbody>" + b[2].map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
    if (t === "modes") return '<div class="mn-modes">' + b[1].map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + esc(x[1].replace("%MAX%", m && m.specs.speedKmh ? m.specs.speedKmh : "максимальной")) + "</span></div>"; }).join("") + "</div>";
    if (t === "check") return '<ul class="mn-check" id="mn-check" data-key="' + ck + '">' + b[1].map(function (x) { return '<li><label><input type="checkbox"><span>' + esc(x) + "</span></label></li>"; }).join("") + "</ul>";
    if (t === "specs") return mnSpecs(m, D && D.specOverride);
    /* 27.10.2026 (Михаил): сборка — переключатель «Видеоинструкция / Пошагово (кадры и текст)» */
    if (t === "asm") { var A = b[1];
      return '<div class="asm" data-asm>' +
        '<div class="asm__tabs" role="tablist" aria-label="Формат инструкции"><button type="button" role="tab" aria-selected="true" data-asm-tab="v"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>Видеоинструкция</button><button type="button" role="tab" aria-selected="false" data-asm-tab="t"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>Текст и кадры</button></div>' +
        '<div class="asm__p" data-asm-p="v"><h3 class="h3 asm__h">Видеоинструкция: сборка ' + esc(A.model) + '</h3><div class="asm__v"><video controls playsinline preload="none" poster="' + esc(A.poster) + '" data-hls="' + esc(A.hls) + '"></video></div><p class="asm__meta">' + esc(A.meta) + '</p></div>' +
        '<div class="asm__p" data-asm-p="t" hidden><h3 class="h3 asm__h">Фотоинструкция: сборка ' + esc(A.model) + ' по шагам</h3><ol class="asm__steps">' + A.steps.map(function (x, i) { return '<li><figure role="img" aria-label="' + esc(x[0]) + '" style="background-image:url(' + A.sprite + ');background-size:' + (A.cols * 100) + '% ' + (A.rows * 100) + '%;background-position:' + ((i % A.cols) / (A.cols - 1) * 100) + '% ' + (A.rows > 1 ? (Math.floor(i / A.cols) / (A.rows - 1) * 100) : 0) + '%"></figure><div><p class="asm__n">Шаг ' + (i + 1) + '</p><b>' + esc(x[0]) + '</b>' + (x[1].replace(/[.!]$/, "") !== x[0] ? '<p>' + esc(x[1]) + '</p>' : "") + '</div></li>'; }).join("") + '</ol></div></div>'; }
    return "";
  }
  P.manual = function () {
    var s = document.body.getAttribute("data-model"), D = (window.MANUALS || {})[s], m = bySlug(s);
    if (!D) return head('<a href="instructions.html">Инструкции</a>', "Инструкция не найдена", "") + sec("", "", '<a class="btn btn--main" href="instructions.html">Все инструкции</a>');
    var S = D.sections, toc = "<ol>" + S.map(function (x) { return '<li><a href="#' + x.id + '">' + esc(x.title) + "</a></li>"; }).join("") + "</ol>";
    var body = S.map(function (x, i) {
      var prev = S[i - 1], next = S[i + 1], n = (i < 9 ? "0" : "") + (i + 1);
      return '<section class="mn-s" id="' + x.id + '" aria-labelledby="h-' + x.id + '"><h2 class="h2" id="h-' + x.id + '"><span class="mn-n">' + n + "</span>" + esc(x.title) + "</h2>" +
        x.blocks.map(function (b) { return mnBlock(b, m, "falcon:manual:" + s + ":check", D); }).join("") +
        '<div class="mn-next">' + (prev ? '<a href="#' + prev.id + '">← ' + esc(prev.title) + "</a>" : "<span></span>") + (next ? '<a href="#' + next.id + '">Дальше: ' + esc(next.title) + " →</a>" : "") + "</div></section>";
    }).join("");
    var other = '<section class="mn-otherwrap" aria-labelledby="h-other"><h2 class="h3" id="h-other">Инструкции к другим моделям</h2>' + mnCards(s) + "</section>";
    return '<div class="mn-bar" id="mn-bar"><div class="wrap"><button type="button" id="mn-open" aria-haspopup="dialog" aria-controls="mn-sheet"><b>Раздел</b><span id="mn-cur">' + esc(S[0].title) + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button></div><i class="mn-bar__prog" id="mn-prog-m"></i></div>' +
      head('<span>Клиентам</span><span aria-hidden="true">/</span><a href="instructions.html">Инструкции</a><span aria-hidden="true">/</span><span>' + esc(SHORT[s]) + "</span>", "Инструкция " + esc(D.name), D.lead) +
      '<div class="wrap">' + mnSwitch(s) + "</div>" +
      '<div class="wrap mn-layout"><aside class="mn-toc" aria-label="Содержание инструкции"><p class="mn-toc__h">Содержание</p><nav id="mn-toc-list">' + toc + '</nav><div class="mn-toc__prog" aria-hidden="true"><i id="mn-prog"></i></div><div class="mn-toc__aside">Не нашли ответ?<a href="' + PHONE_HREF + '">' + PHONE + '</a><button type="button" class="mn-linkbtn" data-msgr>Написать в мессенджер</button></div></aside>' +
      '<article class="mn-body" id="manual">' + body + other + "</article></div>" +
      '<dialog class="mn-sheet" id="mn-sheet" aria-label="Содержание"><div class="mn-sheet__in"><div class="mn-sheet__h"><p>Содержание</p><button class="icon-btn" type="button" id="mn-close" aria-label="Закрыть">' + ICON.close + '</button></div><nav class="mn-toc mn-toc--sheet" aria-label="Содержание">' + toc + "</nav></div></dialog>";
  };
  function mnCards(cur) {
    var L = MN_ORDER.map(function (s) { return [s, mnFile(s), s === cur ? "Вы здесь" : "Инструкция"]; }).concat([["lynx-x", FILE["lynx-x"], "К старту продаж"]]);
    return '<div class="mn-other">' + L.map(function (x) {
      var off = x[0] === "lynx-x";
      return '<a href="' + x[1] + '"' + (x[0] === cur ? ' aria-current="page"' : "") + (off ? ' class="is-off"' : "") + '><span class="mn-other__pic"><img src="' + cutSrc(x[0]) + '" alt="" loading="lazy" decoding="async"></span>' + esc(SHORT[x[0]]) + "<small>" + esc(x[2]) + "</small></a>";
    }).join("") + "</div>";
  }
  P.instructions = function () {
    return head('<span>Клиентам</span><span aria-hidden="true">/</span><span>Инструкции</span>', "Инструкции по эксплуатации", "Сборка после доставки, управление, зарядка и хранение, проверка перед поездкой, обслуживание и гарантия — для каждой модели.") +
      secH("models", "Выберите модель", mnCards("")) +
      sec("inside", "Что в каждой инструкции", '<ul class="list mn-inside">' + ["Перед первой поездкой — пять шагов", "Безопасность, погода, вода", "Сборка после доставки", "Управление, режимы, коды ошибок", "Зарядка и хранение аккумулятора", "Чек-лист перед поездкой", "Если что-то не так", "Обслуживание и плановое ТО", "Характеристики и комплектация"].map(function (x) { return "<li><span>" + x + "</span></li>"; }).join("") + "</ul>") +
      sec("", "", '<div class="callout">' + ICON.phone + '<p>Нет инструкции к вашей модели или остались вопросы? Позвоните <a href="' + PHONE_HREF + '">' + PHONE + "</a> или напишите в мессенджер — подскажем.</p></div>");
  };

  /* ---------- сборка ---------- */
  var mainHtml = (P[page] || P.home)();
  document.body.insertAdjacentHTML("afterbegin", header() + '<main id="main">' + mainHtml + "</main>" + footer() + dockHtml(slug && bySlug(slug) ? slug : "pro") + msgrHtml());
  document.title = document.title || "Falcon 79BIKE";

  /* 26.10: инструкция — подсветка раздела, прогресс, мобильное оглавление, чек-лист */
  if (page === "manual" && $("manual")) (function () {
    var links = [].slice.call(document.querySelectorAll("#mn-toc-list a")), all = [].slice.call(document.querySelectorAll(".mn-toc a[href^='#']"));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var cur = $("mn-cur"), pd = $("mn-prog"), pm = $("mn-prog-m"), top = document.querySelector(".top"), bar = $("mn-bar");
    function topH() { return top ? top.offsetHeight : 64; }
    function setVars() { document.documentElement.style.setProperty("--mn-top", topH() + "px"); }
    var tk = 0;
    function spy() {
      tk = 0; var y = scrollY + topH() + (bar && bar.offsetHeight ? bar.offsetHeight + 60 : 80), i = 0;
      secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top + scrollY <= y) i = k; });
      var id = secs[i] && secs[i].id;
      all.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false"); });
      if (cur && links[i]) cur.textContent = links[i].textContent;
      var r = $("manual").getBoundingClientRect(), p = Math.min(1, Math.max(0, (topH() - r.top) / Math.max(1, r.height - innerHeight + topH())));
      if (pd) pd.style.width = (p * 100).toFixed(1) + "%"; if (pm) pm.style.width = (p * 100).toFixed(1) + "%";
    }
    addEventListener("scroll", function () { if (!tk) tk = requestAnimationFrame(spy); }, { passive: true });
    addEventListener("resize", function () { setVars(); spy(); }); setVars(); spy();
    var dlg = $("mn-sheet");
    if (dlg && $("mn-open")) {
      $("mn-open").addEventListener("click", function () { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
      $("mn-close").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("a")) { dlg.close ? dlg.close() : dlg.removeAttribute("open"); } });
    }
    var ul = $("mn-check");
    if (ul) {
      var K = ul.getAttribute("data-key"), box = [].slice.call(ul.querySelectorAll("input")), st = [];
      try { st = JSON.parse(localStorage.getItem(K) || "[]") || []; } catch (e) { st = []; }
      box.forEach(function (b, i) { b.checked = !!st[i]; b.addEventListener("change", function () { try { localStorage.setItem(K, JSON.stringify(box.map(function (x) { return x.checked ? 1 : 0; }))); } catch (e) {} }); });
    }
  })();

  /* меню и выпадашки */
  var menu = $("menu");
  function setMenu(o) {
    menu.hidden = !o; $("menu-open").setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : "";
    ["main", "dock"].forEach(function (id) { var el = $(id); if (el) el.inert = o; });
    document.querySelectorAll(".foot, .top, .promo").forEach(function (el) { el.inert = o; });
    (o ? $("menu-close") : $("menu-open")).focus();
  }
  menu.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = menu.querySelectorAll("a[href], button:not([disabled])"), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  $("menu-open").onclick = function () { setMenu(true); };
  $("menu-close").onclick = function () { setMenu(false); };
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  function closeDrops(except) { document.querySelectorAll(".nav__btn").forEach(function (b) { if (b === except) return; b.setAttribute("aria-expanded", "false"); $(b.getAttribute("aria-controls")).hidden = true; }); }
  document.querySelectorAll(".nav__btn").forEach(function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); var o = b.getAttribute("aria-expanded") !== "true"; closeDrops(b); b.setAttribute("aria-expanded", o); $(b.getAttribute("aria-controls")).hidden = !o; });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".nav__item")) closeDrops(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = document.querySelector('.nav__btn[aria-expanded="true"]');
    if (open) { closeDrops(); open.focus(); }
    if (!menu.hidden) setMenu(false);
  });
  document.querySelectorAll(".nav__item").forEach(function (it) {
    it.addEventListener("focusout", function (e) { if (!it.contains(e.relatedTarget)) { var b = it.querySelector(".nav__btn"); b.setAttribute("aria-expanded", "false"); $(b.getAttribute("aria-controls")).hidden = true; } });
  });

  /* нижняя панель: только после первого экрана (на главной — когда витрина ушла из вида) */
  (function () {
    var d = $("dock"); if (!d) return;
    var anchor = document.querySelector(".stage__go") || document.querySelector(".buy__actions");
    d.classList.add("is-off");
    if (!anchor || !("IntersectionObserver" in window)) { d.classList.remove("is-off"); document.body.classList.add("dock-on"); return; }
    new IntersectionObserver(function (es) { es.forEach(function (en) { var off = en.isIntersecting || (page === "home" && en.boundingClientRect.top > 0); d.classList.toggle("is-off", off); document.body.classList.toggle("dock-on", !off); }); }).observe(anchor);
  })();

  /* формы-заявки: маска телефона, проверка, ответ «что дальше» */
  if (page === "model") remember(slug);
  /* 26.10 (правка 33): телефон — маска +7 (XXX) XXX-XX-XX; устойчиво к вставке и автозаполнению
     («+7 999 123-45-67», «8 (999) 1234567», «79991234567», «+7+7…», пробелы) — без дублей +7, прыжков курсора и обрезки */
  function phoneDigits(v, prev, typing) {
    v = String(v || "").trim(); prev = prev || "";
    var d = v.replace(/\D/g, "");
    if (/^\+\s*7/.test(v)) d = d.slice(1);            // наш префикс «+7»
    if (typing) {
      if (!prev && d === "7") return "";               // набрали «7» как код страны — он уже есть
      if (d.length > 10) {
        if (prev.length === 10 && prev[0] === "8" && d.length === 11 && d[0] === "8") return d.slice(1); // набирали «8 999…» — 8 была кодом выхода
        if (prev.length === 10) return null;           // номер полный — лишнюю цифру не принимаем
        d = d.slice(0, 10);
      }
      return d;
    }
    while (d.length > 10 && (d[0] === "7" || d[0] === "8")) d = d.slice(1); // вставка/автозаполнение: «8…», «7…», «+7+7…»
    return d.slice(0, 10);
  }
  function fmtPhone(d) {
    var out = "+7 ("; if (!d.length) return out;
    out += d.slice(0, 3); if (d.length > 3) out += ") " + d.slice(3, 6); if (d.length > 6) out += "-" + d.slice(6, 8); if (d.length > 8) out += "-" + d.slice(8, 10);
    return out;
  }
  function caretAfter(f, n) { if (!n) return 4; var c = 0; for (var i = 4; i < f.length; i++) if (/\d/.test(f[i]) && ++c === n) return i + 1; return f.length; }
  function ctMethod(t) { var r = t.form && t.form.querySelector('input[type="radio"][name$="-how"]:checked'); return r ? r.value : "Позвонить"; }
  function ctUserOk(m) { return m === "Telegram" || m === "VK Мессенджер"; }
  function ctLooksUser(v) { return /^\s*[^\d+(\s-]/.test(v); }
  function ctUser(v, m) {
    v = String(v).trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?(t\.me|telegram\.me|vk\.com|vk\.me|vk\.ru)\//i, "").replace(/^@+/, "");
    return "@" + v.replace(/[^A-Za-z0-9_]/g, "").slice(0, 32);
  }
  function ctSetMode(t) {
    var m = ctMethod(t), user = ctUserOk(m), f = t.form, l = f && f.querySelector("[data-contact-l]"), h = f && f.querySelector("[data-contact-hint]");
    if (l) l.textContent = m === "Telegram" ? "Телефон или @username в Telegram" : m === "VK Мессенджер" ? "Телефон или имя пользователя VK" : "Телефон";
    t.placeholder = user ? "+7 (___) ___-__-__ или @username" : "+7 (___) ___-__-__";
    t.setAttribute("inputmode", user ? "text" : "tel");
    if (h) { h.hidden = !user; h.textContent = user ? "Номер телефона или имя пользователя латиницей: буквы, цифры и _" : ""; }
    if (!user && t.dataset.mode === "user") { t.value = ""; t.dataset.mode = ""; }
    t.setAttribute("aria-label", l ? l.textContent : "Телефон");
  }
  function ctNormalize(t, e) {
    var v = t.value, m = ctMethod(t), it = e && e.inputType || "";
    var v2 = v.replace(/^\+7 \((?=\D|$)/, "");
    if (ctUserOk(m) && v2 && ctLooksUser(v2)) { t.value = ctUser(v2, m); t.dataset.mode = "user"; t.dataset.d = ""; return; }
    if (!v.replace(/[\s+()-]/g, "") && !/\d/.test(v)) { t.dataset.mode = ""; t.dataset.d = ""; if (it.indexOf("delete") === 0 && v.length < 4) { t.value = ""; } return; }
    var prev = t.dataset.d || "", typing = it === "insertText" && (e.data == null || e.data.length <= 1), sel = t.selectionStart == null ? v.length : t.selectionStart, atEnd = sel >= v.length;
    var d = phoneDigits(v, prev, typing);
    if (d === null) d = prev;                                   // полный номер: лишние цифры не принимаем
    var k = atEnd ? d.length : Math.min(d.length, (phoneDigits(v.slice(0, sel), "", false) || "").length);
    if (it === "deleteContentBackward" && d === prev && d.length) { var kk = Math.max(1, k); d = d.slice(0, kk - 1) + d.slice(kk); k = kk - 1; }
    else if (it === "deleteContentForward" && d === prev && k < d.length) d = d.slice(0, k) + d.slice(k + 1);
    t.dataset.d = d; t.dataset.mode = "tel";
    var f = fmtPhone(d); t.value = f;
    if (document.activeElement === t) { var pos = atEnd ? f.length : caretAfter(f, k); try { t.setSelectionRange(pos, pos); } catch (x) {} }
  }
  function ctValid(t) {
    var m = ctMethod(t), v = t.value.trim();
    if (t.dataset.mode === "user") {
      if (m === "Telegram" && !/^@[A-Za-z0-9_]{5,32}$/.test(v)) return "Имя пользователя Telegram — от 5 символов: латиница, цифры и _. Или введите номер телефона.";
      if (m === "VK Мессенджер" && !/^@[A-Za-z0-9_]{3,32}$/.test(v)) return "Имя пользователя VK — от 3 символов: латиница, цифры и _. Или введите номер телефона.";
      if (!ctUserOk(m)) return "Введите номер полностью: 10 цифр после +7.";
      return "";
    }
    if (v.replace(/\D/g, "").length < 11) return ctUserOk(m) ? "Введите номер полностью (10 цифр после +7) или имя пользователя." : "Введите номер полностью: 10 цифр после +7.";
    return "";
  }
  document.querySelectorAll("form.form input[data-contact]").forEach(function (t) {
    ctSetMode(t);
    t.addEventListener("focus", function () { if (!t.value && !ctUserOk(ctMethod(t))) { t.value = "+7 ("; t.dataset.d = ""; try { t.setSelectionRange(4, 4); } catch (x) {} } });
    t.addEventListener("input", function (e) { ctNormalize(t, e); });
    t.addEventListener("change", function () { ctNormalize(t, null); });   // автозаполнение без input
    t.addEventListener("blur", function () { if (t.dataset.mode !== "user" && t.value.replace(/\D/g, "").length <= 1) { t.value = ""; t.dataset.d = ""; t.dataset.mode = ""; } });
    if (t.form) t.form.addEventListener("change", function (e) { if (e.target.type === "radio" && /-how$/.test(e.target.name)) ctSetMode(t); });
    if (t.value) ctNormalize(t, null);                                      // значение, подставленное браузером до скрипта
  });
  /* текст для WhatsApp: модель и цвет из формы заказа, чтобы не повторять их в переписке */
  function waText(f) {
    var c = f.querySelector('input[name="color"]'); if (!c || !c.value || page !== "model") return "";
    return "?text=" + encodeURIComponent("Здравствуйте! Оставил заявку на сайте: " + bySlug(slug).name + ", цвет: " + c.value + ".");
  }
  document.querySelectorAll("form.form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var out = f.querySelector(".form__ok"), bad = null, msg = "";
      /* проверяем поля сверху вниз — в том порядке, в каком они стоят на экране (QA 26.10.2026) */
      var now = new Date(), z2 = function (n) { return (n < 10 ? "0" : "") + n; }, today = now.getFullYear() + "-" + z2(now.getMonth() + 1) + "-" + z2(now.getDate());
      [].some.call(f.querySelectorAll("input, select, textarea"), function (i) {
        if (i.type === "hidden" || i.disabled) return false;
        if (i.hasAttribute("data-contact")) { var cm = ctValid(i); if (cm) { bad = i; msg = cm; } }
        else if (i.hasAttribute("data-req-any")) { if (!f.querySelector('input[name="' + i.name + '"]:checked')) { bad = i; msg = i.getAttribute("data-req-any"); } }
        else if (i.hasAttribute("data-req") && !i.value.trim()) { bad = i; msg = i.getAttribute("data-req"); }
        else if (i.hasAttribute("data-visit-date") && i.value < (i.min > today ? i.min : today)) { bad = i; msg = "Эта дата уже прошла. Выберите сегодняшний день или любой день позже."; }
        else if (i.hasAttribute("data-req-check") && !i.checked) { bad = i; msg = i.getAttribute("data-req-check"); }
        else if (i.hasAttribute("data-visit-time") && !i.value) { bad = i; msg = "Выберите удобное время визита."; }
        return !!bad;
      });
      if (bad) { out.className = "form__ok is-err"; out.textContent = msg; bad.focus(); return; }
      var how = f.querySelector('input[type="radio"]:checked'), sel = f.querySelector("select:not([data-visit-time])");
      if (sel && sel.value) remember(sel.value);
      out.className = "form__ok"; out.innerHTML = esc(out.getAttribute("data-ok")) + " Свяжемся " + (how && how.value !== "Позвонить" ? "в " + esc(how.value) : "по телефону") + " в ближайшее время. Не хотите ждать? <a href=\"https://wa.me/79999005588" + waText(f) + "\" target=\"_blank\" rel=\"noopener\">Напишите в WhatsApp</a>.";
      var vd = f.querySelector("[data-visit-date]");
      if (vd) {
        var dd = new Date(vd.value + "T00:00"), dstr = isNaN(dd) ? vd.value : dd.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + " " + dd.getFullYear() + " (" + dd.toLocaleDateString("ru-RU", { weekday: "long" }) + ")";
        out.innerHTML = "<b>Записали вас на " + esc(dstr) + ".</b> Менеджер перезвонит, согласует удобное время и подтвердит визит. " + (how && how.value !== "Позвонить" ? "В " + esc(how.value) + " пришлём" : "Пришлём") + " видео, как пройти в шоурум, — вот оно:" +
          '<span class="route-vid"><video src="assets/route/route-720.mp4" poster="assets/route/route-poster.webp" controls playsinline preload="none"></video></span>';
      }
      f.querySelector('button[type="submit"]').disabled = true;
    });
  });
  document.querySelectorAll("[data-visit-date]").forEach(function (i) { var d = new Date(), z = function (n) { return (n < 10 ? "0" : "") + n; }; i.min = d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); });
  /* запись на сегодня: прошедшие часы недоступны (QA 25.10.2026) */
  document.querySelectorAll("[data-visit-date]").forEach(function (i) {
    var t = i.form && i.form.querySelector("[data-visit-time]"); if (!t) return;
    function sync() {
      var now = new Date(), today = i.min, h = now.getHours();
      [].forEach.call(t.options, function (o) { if (!o.value) return; o.disabled = i.value === today && parseInt(o.value, 10) <= h; });
      if (t.selectedOptions[0] && t.selectedOptions[0].disabled) t.value = "";
    }
    i.addEventListener("change", sync); i.addEventListener("input", sync);
  });
  document.addEventListener("click", function (e) { var a = e.target.closest("#r-try, #r-cmp"); if (a && window.__pick) remember(window.__pick); });
  if ($("f-visit")) { var mv = recall(); if (mv) { var t = $("f-visit").parentNode.querySelector("h2"); if (t) t.textContent = "Тест-драйв " + bySlug(mv).name; } }

  /* сравнение: выбор моделей (по умолчанию 3: последняя просмотренная и соседи по цене) */
  if ($("cmp-pick")) {
    var base = recall() || "pro", bi = SALE.indexOf(base); if (bi < 0) bi = 1;
    var lo = Math.max(0, Math.min(bi - 1, SALE.length - 3)), on = SALE.slice(lo, lo + 3);
    var apply = function () {
      document.querySelectorAll("#cmp-pick .chip").forEach(function (b) { b.setAttribute("aria-pressed", on.indexOf(b.dataset.k) >= 0); });
      document.querySelectorAll("#cmp-full [data-col]").forEach(function (c) { c.hidden = on.indexOf(c.dataset.col) < 0; });
      document.querySelectorAll("#cmp-full tr").forEach(function (tr) {
        if (tr.classList.contains("is-go") || tr.classList.contains("is-price")) return;
        var v = []; tr.querySelectorAll("td[data-col]").forEach(function (td) { if (!td.hidden) v.push(td.textContent); });
        if (v.length) tr.classList.toggle("is-same", v.length > 1 && v.every(function (x) { return x === v[0]; }));
      });
    };
    $("cmp-pick").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; var k = b.dataset.k, i = on.indexOf(k); if (i >= 0) { if (on.length > 1) on.splice(i, 1); } else on.push(k); on.sort(function (x, y) { return ORDER.indexOf(x) - ORDER.indexOf(y); }); apply(); });
    apply();
  }

  /* 26.10 (правка 3): длинное слово в крупном заголовке не помещается — сначала снимаем ограничение ширины, затем уменьшаем шрифт (не меньше 60%) */
  function fitHeads() {
    document.querySelectorAll("main h1, main h2:not(.vh), main .h2, main h3, .cta-band h2").forEach(function (h) {
      if (h.dataset.fit) { h.style.fontSize = ""; h.style.maxWidth = ""; delete h.dataset.fit; }
      if (!h.clientWidth) return;
      h.style.overflowWrap = "normal"; /* меряем без аварийного переноса слова по буквам */
      if (h.scrollWidth > h.clientWidth + 1) {
        h.dataset.fit = "1";
        var pw = h.parentElement ? h.parentElement.clientWidth : 0;
        if (pw && h.clientWidth < pw - 1) h.style.maxWidth = "none";
        var fs = parseFloat(getComputedStyle(h).fontSize), min = Math.max(15, Math.round(fs * 0.6));
        while (h.scrollWidth > h.clientWidth + 1 && fs > min) { fs -= 1; h.style.fontSize = fs + "px"; }
      }
      h.style.overflowWrap = "";
    });
  }
  var fitT; function fitLater() { clearTimeout(fitT); fitT = setTimeout(fitHeads, 60); }
  fitHeads(); addEventListener("load", fitHeads); addEventListener("resize", fitLater);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeads);
  document.addEventListener("click", function () { setTimeout(fitHeads, 30); });
  document.addEventListener("toggle", fitLater, true);

  /* витрина на главной */
  /* кнопка «Наверх» */
  (function(){var b=document.createElement("button");b.type="button";b.className="totop";b.setAttribute("aria-label","Наверх");b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';document.body.appendChild(b);
function pos(){var d=document.querySelector("#dock,.dock,.mbar,.rbar,.mob-cta");var h=(d&&getComputedStyle(d).position=="fixed"&&d.offsetHeight>0&&innerWidth<900)?d.offsetHeight+12:96;document.documentElement.style.setProperty("--totop-b",h+"px");}
function on(){b.classList.toggle("is-on",scrollY>innerHeight*1.5);}
var t;addEventListener("scroll",function(){if(!t)t=requestAnimationFrame(function(){t=0;on();});},{passive:true});addEventListener("resize",pos);pos();on();setTimeout(pos,1500);
b.addEventListener("click",function(){var r=matchMedia("(prefers-reduced-motion: reduce)").matches;scrollTo({top:0,behavior:r?"auto":"smooth"});});})();
  /* 25.10 (Михаил): клик по логотипу — на главную; если уже на главной — плавно наверх */
  document.querySelectorAll(".top .logo, .menu .logo, .foot .logo").forEach(function (l) {
    l.addEventListener("click", function (e) { if (page === "home") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } });
  });
  /* первый экран: ролик стартует сам без звука (iOS требует muted как свойство); кнопка включает звук */
  (function () {
    var v = document.querySelector(".fh__video"), b = document.querySelector(".fh__snd");
    if (!v) return;
    if (window.matchMedia && matchMedia("(max-width: 900px)").matches && !/hero-m/.test(v.currentSrc || "")) { v.src = "assets/hero/hero-m.mp4?v=4"; }
    v.muted = true; v.defaultMuted = true; v.setAttribute("muted", ""); v.playsInline = true;
    var tryPlay = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    /* 26.10: если браузер не запустил ролик сам (режим энергосбережения iOS, экономия трафика, встроенный просмотр по внешней ссылке) — показываем кнопку «Смотреть ролик» и пробуем снова при любом касании или прокрутке */
    var pb = document.createElement("button"); pb.type = "button"; pb.className = "fh__play"; pb.hidden = true; pb.setAttribute("aria-label", "Смотреть ролик");
    pb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><span>Смотреть ролик</span>';
    v.parentNode.appendChild(pb);
    var check = function () { pb.hidden = !v.paused; };
    v.addEventListener("playing", function () { pb.hidden = true; });
    v.addEventListener("pause", check);
    pb.addEventListener("click", function () { v.muted = true; tryPlay(); setTimeout(check, 600); });
    ["touchstart", "pointerdown", "scroll", "keydown"].forEach(function (ev) { document.addEventListener(ev, function once() { if (v.paused) tryPlay(); document.removeEventListener(ev, once); }, { passive: true }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && v.paused) tryPlay(); }); }).observe(v);
    /* если хостинг отдаёт ролик без поддержки докачки (iOS Safari тогда не играет mp4) — загружаем файл целиком и играем из памяти */
    /* 26.10.2026: запасной вариант ограничен — только iOS/iPadOS, не в режиме экономии трафика и только если хостинг действительно не отдаёт докачку (ответ не 206 на запрос первых байтов) */
    var blobTried = false, isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var viaBlob = function () {
      if (blobTried || !isIOS || !window.fetch || !window.URL) return;
      if (navigator.connection && navigator.connection.saveData) return;
      blobTried = true;
      var src = v.currentSrc || v.src || (v.querySelector("source") || {}).src; if (!src) return;
      fetch(src, { headers: { Range: "bytes=0-1" } }).then(function (r) {
        if (r.status === 206 || !r.ok) { if (r.body && r.body.cancel) r.body.cancel(); return null; } /* докачка работает — целиком не грузим */
        return r.blob();
      }).then(function (bl) { if (!bl) return; v.src = URL.createObjectURL(bl); v.load(); tryPlay(); }).catch(function () {});
    };
    v.addEventListener("error", viaBlob, true);
    tryPlay(); setTimeout(function () { if (v.paused || v.readyState < 2) viaBlob(); check(); }, 2500);
    if (b) b.addEventListener("click", function () { v.muted = !v.muted; if (!v.muted) { v.volume = 1; tryPlay(); } b.setAttribute("aria-pressed", String(!v.muted)); b.setAttribute("aria-label", v.muted ? "Включить звук" : "Выключить звук"); });
  })();
  if ($("tabs")) {
    var show = function (k) {
      var m = bySlug(k);
      document.querySelectorAll(".tab").forEach(function (b) { var on = b.dataset.k === k; b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; if (on && b.scrollIntoView && b.parentNode.scrollWidth > b.parentNode.clientWidth) b.scrollIntoView({ block: "nearest", inline: "nearest" }); });
      $("s-code").textContent = CODE[k]; $("s-code").style.opacity = COVER[k] ? "0" : "1";
      $("s-img").src = cutSrc(k); $("s-img").alt = m.name; $("s-img").style.height = cutH(k) + "%";
      $("s-name").textContent = m.name; $("s-tag").textContent = TAG[k];
      $("s-specs").innerHTML = kv(m).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");
      $("s-price").textContent = money(m.price); $("s-old").textContent = m.oldPrice ? money(m.oldPrice) : ""; $("s-old").hidden = !m.oldPrice;
      $("s-more").href = FILE[k]; setDock(k);
      cur = k; $("s-dots").innerHTML = TABS.map(function (t) { return '<i' + (t === k ? ' class="on"' : "") + "></i>"; }).join("");
      if (dir) { var st = $("stage"); st.classList.remove("sw-l", "sw-r"); void st.offsetWidth; st.classList.add(dir > 0 ? "sw-l" : "sw-r"); }
    };
    var cur = "pro", dir = 0;
    var go = function (d) { var i = (TABS.indexOf(cur) + d + TABS.length) % TABS.length; dir = d; show(TABS[i]); dir = 0; };
    $("stage").addEventListener("click", function (e) { var b = e.target.closest(".stage__nav"); if (b) go(+b.dataset.step); });
    (function () {
      var st = $("stage"), x0 = null, y0 = 0, lock = 0;
      st.addEventListener("touchstart", function (e) { if (e.touches.length !== 1) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; lock = 0; }, { passive: true });
      st.addEventListener("touchmove", function (e) { if (x0 === null || lock) return; var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0; if (Math.abs(dx) > 10 || Math.abs(dy) > 10) lock = Math.abs(dx) > Math.abs(dy) ? 1 : 2; }, { passive: true });
      st.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (lock === 1 && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0 = null; });
    })();
    $("tabs").addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) { var d = TABS.indexOf(b.dataset.k) - TABS.indexOf(cur); dir = d > 0 ? 1 : d < 0 ? -1 : 0; show(b.dataset.k); dir = 0; } });
    $("tabs").addEventListener("keydown", function (e) {
      var keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" }; if (!(e.key in keys)) return; e.preventDefault();
      var f = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : TABS[0], i = TABS.indexOf(f);
      i = keys[e.key] === "first" ? 0 : keys[e.key] === "last" ? TABS.length - 1 : (i + keys[e.key] + TABS.length) % TABS.length;
      show(TABS[i]); $("tab-" + TABS[i]).focus();
    });
    show("pro");
  }

  /* подбор */
  if ($("h-val")) {
    var h = 175, exp = "new";
    var pick = function () {
      var k, why;
      var alt = "";
      if (exp === "new") { if (h < 165) { k = "light"; why = "Самая спокойная тяга, 8 кВт, и самая доступная цена в линейке."; alt = 'Чуть легче и мощнее — <a href="pro.html">Falcon Pro</a>.'; } else if (h <= 185) { k = "pro"; why = "Самый лёгкий Falcon, 59 кг: легко управлять и разворачивать. Сиденье 820 мм."; alt = 'Дешевле и спокойнее — <a href="lite.html">Falcon Lite</a>.'; } else { k = "lynx-trail"; why = "Длинная колёсная база 1270 мм и сиденье 855 мм: высокому райдеру не тесно. Нагрузка — до 120 кг."; alt = 'Больше мощности — <a href="gt.html">Falcon GT</a>.'; } }
      else { if (h < 166) { k = "pro"; why = "Сиденье 820 мм и вес 59 кг: уверенно держите байк, даже при невысоком росте."; alt = 'Мощнее, но сиденье 830 мм — <a href="gt.html">Falcon GT</a>.'; } else if (h <= 185) { k = "gt"; why = "17 кВт и 610 Н·м для уверенной езды по бездорожью. Подходит при росте 150–185 см."; if (h >= 180) alt = 'Для жёсткого эндуро — <a href="surge-v.html">Y\u2011Volt Surge V</a>: 35 кВт, рост 155–195 см.'; } else { k = "surge-v"; why = "35 кВт и крупная рама: подходит при росте 155–195 см."; alt = 'Спокойнее и легче — <a href="lynx-trail.html">Falcon Lynx Trail</a>, тоже до 195 см.'; } }
      var m = bySlug(k);
      $("h-val").innerHTML = h + " <small>см</small>"; $("r-img").src = photoV(firstImg(k), "-m"); $("r-img").alt = m.name; $("r-img").className = COVER[k] ? "is-cover" : k === "surge-v" ? "is-studio" : "";
      $("r-name").textContent = m.name; $("r-why").textContent = why; $("r-alt").innerHTML = alt; $("r-alt").hidden = !alt; $("h-minus").disabled = h <= H_MIN; $("h-plus").disabled = h >= H_MAX; if (window.__vizPodbor && !pick.fromViz) window.__vizPodbor.setH(h); $("r-price").textContent = money(m.price); $("r-go").href = FILE[k]; $("r-go").textContent = "Смотреть " + SHORT[k].replace("Falcon ", ""); window.__pick = k;
      $("exp-new").setAttribute("aria-pressed", exp === "new"); $("exp-pro").setAttribute("aria-pressed", exp === "pro");
    };
    $("h-minus").onclick = function () { h = Math.max(H_MIN, h - 5); pick(); };
    $("h-plus").onclick = function () { h = Math.min(H_MAX, h + 5); pick(); };
    if ($("viz")) $("viz").addEventListener("viz:h", function (e) { h = e.detail; pick.fromViz = true; pick(); pick.fromViz = false; });
    $("exp-new").onclick = function () { exp = "new"; pick(); };
    $("exp-pro").onclick = function () { exp = "pro"; pick(); };
    pick();
  }

  /* карточки моделей обновляют нижнюю панель */

  /* страница модели: галерея и цвета */
  if (page === "model" && $("g-thumbs")) {
    var vs = photos(slug), ci = 0, vi = 0;
    var VIEWS = window.PHOTO_VIEWS || {};
    var draw = function () {
      var v = vs[ci]; if (!v) return; var im = v.images[vi] || v.images[0];
      $("g-img").srcset = photoSet(im.src); $("g-img").src = im.src; $("g-img").alt = bySlug(slug).name + ", " + v.label;
      $("g-view").textContent = VIEWS[im.view] || "";
      $("g-thumbs").innerHTML = v.images.length > 1 ? v.images.map(function (x, i) { return '<button type="button" aria-label="' + esc(VIEWS[x.view] || "Фото " + (i + 1)) + '" aria-pressed="' + (i === vi) + '" data-i="' + i + '"><img src="' + esc(photoV(x.src, "-s")) + '" alt=""></button>'; }).join("") : "";
      $("g-chips").innerHTML = chipsHtml(slug, ci);
      $("g-color").textContent = v.label;
      if ($("buy-cart")) { $("buy-cart").dataset.ci = ci; bikeBtn(); }
      var sm = photoV(v.images[0].src, "-s");
      if ($("d-img")) $("d-img").src = sm;
      if ($("osum")) { $("osum-img").src = sm; $("osum-color").textContent = "Цвет: " + v.label; $("osum-in").value = v.label; }
      if (viz) viz.render();
    };
    var viz = null;
    function bikeBtn() { var b = $("buy-cart"); if (!b) return; var id = "bike:" + slug + ":" + b.dataset.ci, q = 0; CART.all().forEach(function (x) { if (x.id === id) q = x.q; }); b.innerHTML = ICON.cartS + (q ? "В корзине · перейти" : "В корзину"); b.classList.toggle("is-added", !!q); }
    if ($("buy-cart")) $("buy-cart").addEventListener("click", function () { var id = "bike:" + slug + ":" + this.dataset.ci, has = CART.all().some(function (x) { return x.id === id; }); if (has) { location.href = "parts.html#cart"; return; } CART.add(id, 1); bikeBtn(); });
    $("g-thumbs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { vi = +b.dataset.i; draw(); } });
    $("g-chips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b || b.disabled) return;
      var c = vs[ci], t = -1;
      if (b.hasAttribute("data-pick")) t = +b.dataset.pick;
      else { var fr = b.hasAttribute("data-frame") ? b.dataset.frame : c.frame, ac = b.hasAttribute("data-accent") ? b.dataset.accent : (c.accent || ""); vs.forEach(function (v, i) { if (t < 0 && v.frame === fr && (v.accent || "") === ac) t = i; }); if (t < 0) vs.forEach(function (v, i) { if (t < 0 && v.frame === fr) t = i; }); }
      if (t >= 0) { ci = t; vi = 0; draw(); }
    });
    viz = initViz("viz", function () { return slug; }, function () { return ci; });
    draw();
    if (false) {
      var seat = bySlug(slug).specs.seatMm;
      var fit = function () { var hh = +$("fit-r").value, need = Math.ceil(seat / 10 / 0.5); $("fit-v").textContent = hh; var ok = hh >= need; $("fit-t").dataset.ok = ok ? "1" : "0"; $("fit-t").textContent = ok ? "Подходит: при росте " + hh + " см сиденье " + seat + " мм комфортно, ноги достают до земли." : "Высоковато: комфортно от " + need + " см. Лучше примерить на тест-драйве."; };
      $("fit-r").addEventListener("input", fit); fit();
    }
  }

  if (page === "model" && $("mnav")) (function () {
    var nav = $("mnav"), row = nav.firstChild, links = [].slice.call(nav.querySelectorAll("a[data-sec]"));
    var tick = 0, upd = function () {
      tick = 0; var cur = null;
      links.forEach(function (a) { var t = $(a.dataset.sec); if (t && a.offsetParent && t.getBoundingClientRect().top <= 150) cur = a; });
      links.forEach(function (a) { if (a === cur) { if (a.getAttribute("aria-current") !== "true") { a.setAttribute("aria-current", "true"); if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" }); } } else a.removeAttribute("aria-current"); });
    };
    addEventListener("scroll", function () { if (!tick) tick = requestAnimationFrame(upd); }, { passive: true }); upd();
    var sen = document.createElement("span"); sen.setAttribute("aria-hidden", "true"); nav.parentNode.insertBefore(sen, nav);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { nav.classList.toggle("is-stuck", !es[0].isIntersecting && es[0].boundingClientRect.top < 70); }, { rootMargin: "-65px 0px 0px 0px" }).observe(sen);
  })();

  /* 26.10.2026: «Доставка и оплата» — липкая навигация по разделам (подсветка), высота шапки, выбор города из адреса (?city=msk|near|rf).
     Переключатель «Ваш город» — те же кнопки data-setreg, что и «Вы из» на главной: один выбор региона на весь сайт */
  if (page === "delivery" && $("dn-nav")) (function () {
    var nav = $("dn-nav"), row = nav.querySelector(".dn-nav__in"), top = document.querySelector(".top");
    var links = [].slice.call(nav.querySelectorAll("a[data-sec]")), secs = links.map(function (a) { return $(a.dataset.sec); });
    function topH() { return top ? top.offsetHeight : 64; }
    function setVars() { document.documentElement.style.setProperty("--dn-top", topH() + "px"); }
    var tk = 0, last = -1;
    function spy() {
      tk = 0; var y = topH() + nav.offsetHeight + 40, on = 0;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) on = i; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { var f = secs[secs.length - 1]; if (f && f.getBoundingClientRect().top < innerHeight) on = secs.length - 1; }
      if (on === last) return; last = on;
      links.forEach(function (a, i) { a.classList.toggle("is-on", i === on); if (i === on) { a.setAttribute("aria-current", "true"); if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" }); } else a.removeAttribute("aria-current"); });
    }
    setVars(); spy();
    addEventListener("resize", function () { setVars(); last = -1; spy(); });
    addEventListener("scroll", function () { if (!tk) tk = requestAnimationFrame(spy); }, { passive: true });
    var q = /[?&#]city=(msk|near|rf)\b/.exec(location.search + location.hash);
    if (q) setTimeout(function () { var b = document.querySelector('.dn-city [data-setreg="' + q[1] + '"]'); if (b) b.click(); }, 0); /* обработчик регионов подключается ниже */
  })();

  /* ---------- условия тест-драйва: скрытый попап у каждой кнопки «Тест-драйв» ---------- */
  (function () {
    var TDN = '<button type="button" class="tdn" data-tdn aria-haspopup="dialog">' + '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>Условия тест-драйва</button>';
    document.body.insertAdjacentHTML("beforeend", '<div class="tdp" id="tdp" role="dialog" aria-modal="true" aria-labelledby="tdp-h" hidden><div class="tdp__box"><button type="button" class="tdp__x" aria-label="Закрыть">' + ICON.close + '</button><p class="tdp__h" id="tdp-h">Кому доступен тест-драйв</p><ol class="tdp__list"><li>С 18 лет</li><li>Залог за байк — наличными</li><li>При повреждениях вы платите за байк</li></ol></div></div>');
    var dlg = $("tdp"), last = null;
    function add() {
      var v = document.querySelector("#visit form"); if (v && !v.parentNode.querySelector(".tdn-row")) v.insertAdjacentHTML("beforebegin", '<p class="tdn-row">' + TDN + "</p>");
    }
    add();
    function open(btn) { last = btn; dlg.hidden = false; dlg.querySelector(".tdp__x").focus(); }
    function close() { dlg.hidden = true; if (last) last.focus(); }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-tdn]"); if (t) { e.preventDefault(); open(t); return; }
      if (!dlg.hidden && (e.target === dlg || e.target.closest(".tdp__x"))) close();
    });
    document.addEventListener("keydown", function (e) { if (!dlg.hidden && e.key === "Escape") close(); });
  })();

  (function () {
    var w = $("msgr"), b = $("msgr-btn"), p = $("msgr-panel"); if (!w) return;
    function set(o) { b.setAttribute("aria-expanded", o); p.hidden = !o; w.classList.toggle("is-open", o); if (o) { var f = p.querySelector("a"); if (f) f.focus(); } }
    b.addEventListener("click", function () { set(p.hidden); });
    document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("[data-msgr]"); if (t) { e.stopPropagation(); set(p.hidden); } }, true);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !p.hidden) { set(false); b.focus(); } });
    document.addEventListener("click", function (e) { if (!p.hidden && !w.contains(e.target) && !(e.target.closest && e.target.closest("[data-msgr]"))) set(false); });
    document.addEventListener("focusin", function (e) { document.body.classList.toggle("is-typing", /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== "range"); });
    document.addEventListener("focusout", function () { document.body.classList.remove("is-typing"); });
  })();
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".rng-q"); if (!b) return;
    var p = $(b.getAttribute("aria-controls")); if (!p) return;
    var open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open); p.hidden = !open;
    if (open) p.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-acc]"); if (!b) return;
    var f = $("f-order") || $("f-parts"); if (!f) return;
    var n = f.querySelector(".form__acc"); if (!n) { n = document.createElement("p"); n.className = "form__acc"; var h = f.querySelector("h2, h3"); (h ? h.parentNode : f).insertBefore(n, h ? h.nextSibling : f.firstChild); n.dataset.list = ""; }
    var L = n.dataset.list ? n.dataset.list.split("|") : []; if (L.indexOf(b.dataset.acc) < 0) L.push(b.dataset.acc);
    n.dataset.list = L.join("|"); n.textContent = "Добавим к заказу: " + L.join(", ") + ".";
    b.textContent = "Добавлено"; b.classList.add("is-added");
  });
  /* SEO: мета-теги, canonical, Open Graph, JSON-LD (data/seo.js — собирает seo/build-seo.js) */
  (function applySeo() {
    var b = document.body, key = b.dataset.page === "model" ? "model:" + b.dataset.slug : (b.dataset.page || "home");
    var s = (window.SEO || {})[key], D = window.SEO_DEFAULTS || {};
    if (!s) return;
    document.title = s.title;
    function meta(attr, name, content) {
      if (!content) return;
      var m = document.head.querySelector("meta[" + attr + '="' + name + '"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute(attr, name); document.head.appendChild(m); }
      m.setAttribute("content", content);
    }
    var img = new URL(s.ogImage, location.href).href; // на боевом сайте — абсолютный URL с tildacdn
    meta("name", "description", s.description);
    meta("property", "og:type", key.indexOf("model:") === 0 ? "product" : "website");
    meta("property", "og:site_name", D.siteName); meta("property", "og:locale", D.locale);
    meta("property", "og:title", s.ogTitle); meta("property", "og:description", s.ogDescription);
    meta("property", "og:url", s.canonical); meta("property", "og:image", img);
    meta("name", "twitter:card", D.twitterCard); meta("name", "twitter:title", s.ogTitle);
    meta("name", "twitter:description", s.ogDescription); meta("name", "twitter:image", img);
    var c = document.head.querySelector('link[rel="canonical"]') || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
    c.href = s.canonical;
    ((window.SEO_LD || {})[key] || []).forEach(function (o) {
      var t = document.createElement("script"); t.type = "application/ld+json"; t.text = JSON.stringify(o); document.head.appendChild(t);
    });
    var h1 = document.querySelector("h1");
    if (h1 && s.h1check && h1.textContent.replace(/\u00AD/g, "").replace(/\s+/g, " ").trim() !== s.h1check) console.warn("SEO: H1 «" + h1.textContent.trim() + "» ≠ ожидаемому «" + s.h1check + "»");
  })();
  /* alt по шаблону «Модель, цвет, вид» (SEO, этап 1) и переприменение при смене фото */
  (function () {
    var A = window.SEO_ALT || {};
    function fix(img) { var k = img.getAttribute("src"); if (k && A[k] && img.alt !== A[k] && !img.closest("[aria-hidden=true]")) img.alt = A[k]; }
    document.querySelectorAll("img").forEach(fix);
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "attributes") fix(m.target); else m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.tagName === "IMG") fix(n); n.querySelectorAll && n.querySelectorAll("img").forEach(fix); } }); }); }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  })();
  /* типограф: неразрывные пробелы после коротких слов и между числом и единицей */
  (function typo(root) {
    var SHORT_W = /(^|[\s(«])(в|во|и|с|со|к|ко|у|о|об|а|но|на|по|до|от|за|из|не|ни|для|без|при|или|что|как|под|над|его|её|их)\s+/gi;
    var UNIT = /(\d)\s+(км\/ч|км|кг|мм|см|кВт|Н·м|Ач|ч|В|мес\.?|месяц[аев]*|₽|%|л\.\s?с\.)(?=[\s.,;:)»]|$)/g;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return /^(SCRIPT|STYLE|TEXTAREA|OPTION|text|tspan)$/.test(p) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), n, L = [];
    while ((n = w.nextNode())) L.push(n);
    L.forEach(function (t) { var v = t.nodeValue, o = v; if (!/\S/.test(v)) return;
      v = v.replace(SHORT_W, function (m, a, b) { return a + b + "\u00a0"; }).replace(SHORT_W, function (m, a, b) { return a + b + "\u00a0"; });
      v = v.replace(UNIT, "$1\u00a0$2").replace(/(\d)–(\d)/g, "$1\u2060–\u2060$2");
      if (v !== o) t.nodeValue = v; });
  })(document.getElementById("main") || document.body);

  /* запчасти: модель → раздел → поиск, порции по 24 */
  if (page === "parts" && $("pc") && window.PARTS) (function () {
    var st = { m: "", cat: "", q: "", n: PC_STEP }, r = recall();
    if (r && r !== "lynx-x") st.m = r;
    function site() { return pcSite(st.m); }
    function byModel() { var s = site(); return pcSort(s.items.filter(function (it) { return !st.m || s.key === "yvolt" || it.m.indexOf(st.m) >= 0; })); }
    /* поиск — по всем запчастям всех моделей, фильтры модели/раздела не учитываются */
    function allHits() { var out = []; ((window.PARTS || {}).sites || []).forEach(function (S) { S.items.forEach(function (it) { if (match(it, true)) out.push({ it: it, site: S }); }); }); return pcSort(out); }
    function match(it, all) {
      if (!all && st.cat && it.c.indexOf(st.cat) < 0) return false;
      if (!st.q) return true;
      var h = (it.t + " " + (it.sku || "")).toLowerCase().replace(/ё/g, "е");
      return st.q.split(/\s+/).every(function (w) { return h.indexOf(w) >= 0; });
    }
    function drawTabs() { document.querySelectorAll("#pc-models button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.m === st.m); }); var sm = $("pc-sel-m"); if (sm) sm.value = st.m; $("pc").classList.toggle("is-q", !!st.q); }
    function drawCats() {
      var s = site(), L = byModel(), cnt = {};
      L.forEach(function (it) { it.c.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; }); });
      if (st.cat && !cnt[st.cat]) st.cat = "";
      $("pc-cats").innerHTML = [["", "Все разделы", L.length]].concat(s.categories.map(function (c) { return [c[0], c[1], cnt[c[0]] || 0]; })).map(function (c) {
        return '<button type="button" class="chip" data-c="' + c[0] + '" aria-pressed="' + (c[0] === st.cat) + '"' + (c[2] ? "" : " disabled") + ">" + esc(c[1]) + "</button>";
      }).join("");
      var sc = $("pc-sel-c"); if (sc) sc.innerHTML = [["", "Все разделы", L.length]].concat(s.categories.map(function (c) { return [c[0], c[1], cnt[c[0]] || 0]; })).filter(function (c) { return c[2]; }).map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === st.cat ? " selected" : "") + ">" + esc(c[1]) + "</option>"; }).join("");
    }
    function drawGrid() {
      var s = site(), L = st.q ? allHits() : byModel().filter(function (it) { return match(it); }).map(function (it) { return { it: it, site: s }; }), shown = L.slice(0, st.n);
      $("pc-grid").innerHTML = shown.length ? shown.map(function (x) { return pcCard(x.it, x.site); }).join("") :
        '<div class="card pc__empty"><h3 class="h3">Ничего не нашли</h3><p>Проверьте название или артикул. Или пришлите фото детали — менеджер подберёт её под вашу модель.</p><a class="btn btn--main" href="#order">Подобрать с менеджером</a></div>';
      $("pc-meta").textContent = st.q ? "Поиск по всем запчастям: " + (L.length ? "найдено " + L.length + " " + plural(L.length, "позиция", "позиции", "позиций") : "ничего не найдено") : L.length ? "Найдено: " + L.length + " " + plural(L.length, "позиция", "позиции", "позиций") + (s.key === "yvolt" ? " · Y‑Volt Surge V" : "") : "";
      var more = $("pc-more"), rest = L.length - shown.length;
      more.hidden = rest <= 0; if (rest > 0) more.textContent = "Показать ещё " + Math.min(rest, PC_STEP) + " из " + rest;
      document.querySelectorAll("#pc-grid [data-acc]").forEach(function (x) { if (added.indexOf(x.dataset.acc) >= 0) { x.textContent = "Добавлено"; x.classList.add("is-added"); } });
    }
    var SPECS = window.PARTS_SPECS || {}, dlg = $("pcd"), ck = $("pck");
    /* 26.10.2026 (QA): на количестве 1 кнопка «−» неактивна; убрать товар — отдельной кнопкой «Удалить» (крестик) */
    function qtyHtml(id, q, cls) { return '<span class="qty ' + (cls || "") + '"><button type="button" data-q="-1" data-id="' + esc(id) + '" aria-label="Меньше"' + (q <= 1 ? " disabled" : "") + '>−</button><b>' + q + '</b><button type="button" data-q="1" data-id="' + esc(id) + '" aria-label="Больше"' + (q >= 99 ? " disabled" : "") + '>+</button></span>'; }
    function syncCart() {
      var n = CART.count(), sum = CART.sum(), fab = $("pc-fab"), c = $("pc-cart");
      c.hidden = !n; fab.hidden = !n;
      var sc2 = $("pc-sidecart"), bc = $("pc-barcart"); var CI = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2l1.7-7.1H6.2"/></svg>'; if (sc2) { sc2.hidden = !n; sc2.innerHTML = CI + "Корзина <i>" + n + "</i>"; } if (bc) { bc.hidden = !n; bc.innerHTML = CI + "<i>" + n + "</i>"; }
      if (n) { c.textContent = "Корзина: " + n + " · " + money(sum); fab.innerHTML = ICON.box + "<span>" + n + "</span>"; c.setAttribute("href", "#cart"); }
      document.querySelectorAll("#pc-grid [data-cart]").forEach(function (b) { var q = 0; CART.all().forEach(function (x) { if (x.id === b.dataset.cart) q = x.q; }); b.textContent = q ? "В корзине · " + q : "В корзину"; b.classList.toggle("is-added", !!q); });
    }
    function openCard(id, push) {
      var f = pcFind(id); if (!f) return; var it = f.it, site = f.site, sp = SPECS[id] || ["", ""];
      var cats = {}; site.categories.forEach(function (c) { cats[c[0]] = c[1]; });
      var rows = [["Модель", pcFit(it, site)]].concat((sp[0] || "").split(";").map(function (x) { var i = x.indexOf(":"); return i > 0 ? [x.slice(0, i).trim(), x.slice(i + 1).trim()] : null; }).filter(Boolean));
      if (it.sku) rows.push(["Артикул", it.sku]);
      rows.push(["Раздел", it.c.map(function (c) { return cats[c] || c; }).join(", ") || "—"]);
      var desc = (sp[1] || it.d || "").trim(); if (desc === it.t || desc === it.sku || it.t.indexOf(desc.replace(/\.$/, "")) >= 0) desc = "";
      if (desc && desc.length < 30 && !/\s\S+\s/.test(desc)) { rows.splice(1, 0, ["Маркировка", desc]); desc = ""; }
      var ok = /^в наличии/i.test(it.a || ""), big = pcThumb(it) + (function () { var B = window.PARTS_BIG, b = B && it.loc && B.map[it.loc]; if (!b) return ""; var c = B.cols, x = b[1] % c, y = Math.floor(b[1] / c); return '<span class="pcd__big" role="img" aria-label="' + esc(it.t) + '" style="background-image:url(assets/parts-big/b' + (b[0] < 10 ? "0" : "") + b[0] + '.webp);background-size:' + c * 100 + "% " + c * 100 + "%;background-position:" + (x * 100 / (c - 1)) + "% " + (y * 100 / (c - 1)) + '%"></span>'; })();
      $("pcd-in").innerHTML = '<button type="button" class="pcd__x" data-close aria-label="Закрыть">' + ICON.close + '</button><figure class="pcd__pic">' + big + '</figure><div class="pcd__body"><p class="t-cap">' + esc(site.key === "yvolt" ? "Y‑Volt Surge V" : "Falcon и Lynx") + '</p><h2 class="h3 pcd__t" id="pcd-t">' + esc(it.t) + '</h2>' +
        '<p class="pcd__price">' + (it.p ? money(it.p) + (it.op ? " <s>" + money(it.op) + "</s>" : "") : "Цена по запросу") + ' <span class="pc__av' + (ok ? " is-ok" : "") + '">' + (ok ? "В наличии" : "Уточнить наличие") + '</span></p>' +
        (desc ? '<p class="pcd__d">' + esc(desc) + "</p>" : "") +
        '<dl class="pcd__specs">' + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
        '<div class="pcd__buy">' + (it.p ? qtyHtml(id, 1, "js-cq") + '<button type="button" class="btn btn--main" data-add="' + esc(id) + '">В корзину</button>' : '<a class="btn btn--main" href="#order" data-close data-acc="' + esc(it.t + (it.sku ? " (арт. " + it.sku + ")" : "")) + '">Узнать цену</a>') + "</div>" +
        '<p class="t-cap">Перед отправкой менеджер сверит деталь по году выпуска байка. Запчасти отправляем СДЭК по России, в Москве — самовывоз из шоурума «Речников 21».</p></div>';
      if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); } }
      if (push !== false) try { history.replaceState(null, "", "#p-" + id); } catch (e) {}
    }
    function closeDlg(d) { if (d.open) { try { d.close(); } catch (e) { d.removeAttribute("open"); } } if (/^#p-/.test(location.hash)) try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
    function drawCartDlg() {
      var L = CART.all();
      $("pck-in").innerHTML = '<button type="button" class="pcd__x" data-close aria-label="Закрыть">' + ICON.close + '</button><div class="pcd__body pcd__body--cart"><h2 class="h3" id="pck-t">Корзина</h2>' +
        (L.length ? '<ul class="cart">' + L.map(function (x) { var f = pcFind(x.id), it = f.it, lk = it.bike ? 'href="' + esc(FILE[it.bike]) + '"' : 'href="#p-' + esc(x.id) + '" data-open="' + esc(x.id) + '"'; return '<li><a class="cart__pic" ' + lk + '>' + pcThumb(it) + '</a><div class="cart__t"><a ' + lk + '>' + esc(it.t) + "</a>" + (it.sku ? "<small>Арт. " + esc(it.sku) + "</small>" : "") + "</div>" + qtyHtml(x.id, x.q, "js-kq") + '<b class="cart__s">' + money(it.p * x.q) + '</b><button type="button" class="cart__rm" data-rm="' + esc(x.id) + '" aria-label="Удалить из корзины" title="Удалить из корзины"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button></li>'; }).join("") + "</ul>" +
          '<p class="cart__sum">Итого: <b>' + money(CART.sum()) + '</b></p><p class="t-cap">' + (L.some(function (x) { return /^bike:/.test(x.id); }) ? "Наличие и цвет байка менеджер подтвердит перед оплатой. Байк доставляем по России: по Москве и области — нашими курьерами, в регионы — транспортной компанией. Если доставка нашим курьером — запчасти привезём вместе с байком. Если транспортной компанией — отправим запчасти СДЭКом." : "Наличие и совместимость с вашим байком менеджер подтвердит перед оплатой. Доставка запчастей — СДЭК, стоимость по тарифу.") + '</p><div class="cart__act"><a class="btn btn--main" href="#order" data-checkout>Оформить заказ</a><button type="button" class="btn btn--ghost" data-close>Продолжить покупки</button></div>'
          : '<p>Корзина пуста. Добавьте запчасти из каталога.</p><button type="button" class="btn btn--ghost" data-close>К каталогу</button>') + "</div>";
    }
    function openCart() { drawCartDlg(); if (!ck.open) { try { ck.showModal(); } catch (e) { ck.setAttribute("open", ""); } } }
    function checkout() {
      var f = $("f-parts"); if (!f) return; var L = CART.all();
      var n = f.querySelector(".form__acc"); if (!n) { n = document.createElement("p"); n.className = "form__acc"; var h = f.querySelector("h2, h3"); (h ? h.parentNode : f).insertBefore(n, h ? h.nextSibling : f.firstChild); }
      n.textContent = "Ваш заказ: " + L.map(function (x) { var it = pcFind(x.id).it; return it.t + (it.sku ? " (арт. " + it.sku + ")" : "") + " × " + x.q; }).join("; ") + ". Итого " + money(CART.sum()).replace(/\u00a0/g, " ") + ".";
      var band = f.closest(".cta-band"), h2 = band && band.querySelector("h2"), pp = h2 && h2.nextElementSibling, sb = f.querySelector('button[type="submit"], .btn');
      if (h2) h2.textContent = "Оформить заказ";
      if (pp) pp.textContent = L.some(function (x) { return /^bike:/.test(x.id); }) ? "Оставьте телефон — менеджер подтвердит наличие, цвет и стоимость доставки. Оплата — после подтверждения." : "Оставьте телефон — менеджер подтвердит наличие, совместимость с вашим байком и стоимость доставки СДЭК. Оплата — после подтверждения.";
      if (sb) sb.textContent = "Оформить заказ";
      var hid = f.querySelector('input[name="cart"]'); if (!hid) { hid = document.createElement("input"); hid.type = "hidden"; hid.name = "cart"; f.appendChild(hid); } hid.value = n.textContent;
    }
    document.addEventListener("click", function (e) {
      var t = e.target; if (!t.closest) return;
      var o = t.closest("[data-open]"); if (o && (o.closest("#pc-grid") || o.closest("#pck"))) { e.preventDefault(); if (ck.open) closeDlg(ck); openCard(o.dataset.open); return; }
      var a = t.closest("[data-cart]"); if (a && a.closest("#pc-grid")) { e.preventDefault(); CART.add(a.dataset.cart, 1); syncCart(); return; }
      var ad = t.closest("[data-add]"); if (ad) { var qe = dlg.querySelector(".js-cq b"); CART.add(ad.dataset.add, qe ? +qe.textContent : 1); syncCart(); closeDlg(dlg); openCart(); return; }
      var q = t.closest("[data-q]"); if (q) { if (q.disabled) return; var box = q.parentNode, b = box.querySelector("b"), v = Math.max(1, Math.min(99, +b.textContent + (+q.dataset.q))); if (box.classList.contains("js-kq")) { CART.set(q.dataset.id, v); drawCartDlg(); syncCart(); } else { b.textContent = v; box.querySelector('[data-q="-1"]').disabled = v <= 1; box.querySelector('[data-q="1"]').disabled = v >= 99; } return; }
      var rm = t.closest("[data-rm]"); if (rm) { CART.set(rm.dataset.rm, 0); drawCartDlg(); syncCart(); return; }
      if (t.closest("[data-checkout]")) { e.preventDefault(); checkout(); closeDlg(ck); var or = $("order"); if (or) or.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      if (t.closest("#pc-fab") || t.closest('#pc-cart[href="#cart"]') || t.closest(".hdr-cart")) { e.preventDefault(); openCart(); return; }
      var cl = t.closest("[data-close]"); if (cl) { var d = cl.closest("dialog"); if (d) { if (!cl.hasAttribute("data-acc")) e.preventDefault(); closeDlg(d); } return; }
      if (t === dlg) closeDlg(dlg); else if (t === ck) closeDlg(ck);
    });
    [dlg, ck].forEach(function (d) { d.addEventListener("cancel", function (e) { e.preventDefault(); closeDlg(d); }); });
    function draw() { drawTabs(); drawCats(); drawGrid(); syncCart(); }
    function qOff() { if (!st.q) return; st.q = ""; $("pc-q").value = ""; }
    $("pc-models").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; qOff(); st.m = b.dataset.m; st.cat = ""; st.n = PC_STEP; if (st.m) remember(st.m); draw(); });
    $("pc-cats").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || b.disabled) return; var had = !!st.q; qOff(); st.cat = b.dataset.c; st.n = PC_STEP; if (had) drawTabs(); drawCats(); drawGrid(); syncCart(); });
    /* при вводе запроса фильтры визуально сбрасываются в «Все»; очистили запрос — возвращаем прежние модель и раздел */
    var keep = null;
    $("pc-q").addEventListener("input", function () {
      var q = this.value.trim().toLowerCase().replace(/ё/g, "е"), was = !!st.q;
      if (q && !was) { keep = { m: st.m, cat: st.cat }; st.m = ""; st.cat = ""; }
      if (!q && was && keep) { st.m = keep.m; st.cat = keep.cat; keep = null; }
      st.q = q; st.n = PC_STEP; drawTabs(); drawCats(); drawGrid(); syncCart();
      if (q && !was) { var g = $("pc-grid"), r = g.getBoundingClientRect(), top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--top-h")) || 64; if (r.top < top || r.top > innerHeight * 0.5) window.scrollTo({ top: Math.max(0, scrollY + r.top - top - 120), behavior: "smooth" }); }
    });
    /* ПК: высота панели фильтров — по видимой части экрана, чтобы липкий поиск под списками всегда был в зоне видимости */
    (function () { var as = document.querySelector("#pc .pc__aside"); if (!as) return; var raf = 0;
      function fit() { raf = 0; if (innerWidth <= 900) { as.style.maxHeight = ""; return; } var top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--top-h")) || 72, r = as.getBoundingClientRect(); as.style.maxHeight = Math.max(320, innerHeight - Math.max(r.top, top + 16) - 16) + "px"; }
      function req() { if (!raf) raf = requestAnimationFrame(fit); } addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); fit(); })();
    (function () { var mq = window.matchMedia("(max-width:900px)"), q = $("pc-q"); function ph() { q.placeholder = mq.matches ? "Поиск по всем запчастям" : "Название, артикул"; } ph(); if (mq.addEventListener) mq.addEventListener("change", ph); })();
    $("pc-q").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });
    $("pc-sel-m").addEventListener("change", function () { var b = document.querySelector('#pc-models button[data-m="' + this.value + '"]'); if (b) b.click(); });
    $("pc-sel-c").addEventListener("change", function () { var b = document.querySelector('#pc-cats button[data-c="' + this.value + '"]'); if (b) b.click(); });
    ["pc-sidecart", "pc-barcart"].forEach(function (id) { $(id).addEventListener("click", function (e) { e.preventDefault(); openCart(); }); });
    $("pc-more").addEventListener("click", function () { st.n += PC_STEP; drawGrid(); syncCart(); });
    draw();
    var hm = /^#p-([\w-]+)$/.exec(location.hash); if (hm && pcFind(hm[1])) openCard(hm[1], false); if (location.hash === "#cart" && CART.count()) openCart();
  })();

  if ($("cr-tabs")) $("cr-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    document.querySelectorAll("#cr-tabs button").forEach(function (x) { var on = x === b; x.setAttribute("aria-selected", on); x.setAttribute("aria-pressed", on); });
    document.querySelectorAll(".cr-panel").forEach(function (p) { p.hidden = p.dataset.k !== b.dataset.k; });
  });
  /* подбор: визуализатор с вкладками моделей */
  if (page === "podbor" && $("viz-tabs")) {
    var vk = "pro";
    var vz = initViz("viz", function () { return vk; }, null); window.__vizPodbor = vz;
    $("viz-tabs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; vk = b.dataset.k; document.querySelectorAll("#viz-tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); }); vz.render(); });
  }

  /* сравнение: все строки / только различия */
  if ($("cmp-all")) {
    $("cmp-all").onclick = function () { var on = $("cmp-all").getAttribute("aria-pressed") !== "true"; $("cmp-all").setAttribute("aria-pressed", on); $("cmp-full").classList.toggle("show-all", on); $("cmp-all").textContent = on ? "Только различия" : "Показать все строки"; };
  }

  /* видеообзоры по моделям */
  if ($("vtabs")) {
    var pin = (C.reviews && C.reviews.pinned) || {};
    var vshow = function (k) {
      document.querySelectorAll("#vtabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.k === k); });
      $("vlist").innerHTML = videoCards(vItems(pin[k] || [bySlug(k).name + ": обзор"], k)) + '<p class="note">Ролики открываются в новой вкладке на VK Видео или YouTube. Новые видео — на нашем канале в RUTUBE.</p>';
    };
    $("vtabs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) vshow(b.dataset.k); });
    vshow(ORDER[0]);
  }


  /* регион клиента: Москва и МО — наличные при получении; другие города — оплата картой */
  (function () {
    var KEY = "falcon:region";
    var MO = /москв|подмоск|\bмо\b|московск|зеленоград|химки|балаших|подольск|королёв|королев|мытищ|люберц|красногорск|электросталь|коломн|одинцов|домодедов|серпухов|щёлков|щелков|раменск|долгопрудн|жуковск|пушкин|реутов|сергиев|ногинск|видное|лобня|дмитров|чехов|истр|клин|воскресенск|наро-фоминск|егорьевск|ступин|дзержинск|лыткарин|котельник|ивантеевк|фрязин|солнечногорск|красноармейск|орехово|павловский посад|шатур|кашир|лосино|звенигород|апрелевк|троицк|щербинк|московский/i;
    /* 26.10.2026: города в зоне нашего курьера (до 500 км) — data/content.js → delivery.page.zone */
    var NEAR = /^(г\.?\s*)?(твер|владимир|тул[аеуы]?$|тул[аеуы]?[\s,]|калуг|рязан|ярослав|иванов|костром|ор[её]л|орл[аеу]|брянск|смоленск|нижн|н\.\s*новгород|липецк|тамбов)/i;
    function get() { try { var v = localStorage.getItem(KEY); return /^(msk|near|rf)$/.test(v) ? v : null; } catch (e) { return null; } }
    function set(r, save) {
      document.body.classList.remove("reg-msk", "reg-near", "reg-rf"); document.body.classList.add("reg-" + r);
      document.querySelectorAll("[data-setreg]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.setreg === r); });
      if (save) try { localStorage.setItem(KEY, r); } catch (e) {}
    }
    var r = get();
    if (!r) { var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {} r = tz && tz !== "Europe/Moscow" ? "rf" : "msk"; }
    set(r, false);
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-setreg]"); if (b) set(b.dataset.setreg, true); });
    document.addEventListener("change", function (e) { var i = e.target; if (i.matches && i.matches('input[id$="-city"]') && i.value.trim()) set(MO.test(i.value) ? "msk" : NEAR.test(i.value.trim()) ? "near" : "rf", true); });
  })();

  /* разметка Event для ближайших выставок с точными датами (решение Михаила 25.10.2026: даты точные) */
  (function () {
    if (page !== "events" && page !== "home") return;
    var END = { "motozima-2026": "2026-11-15", "eicma-2026": "2026-11-08" };
    var LOC = { "motozima-2026": { name: "КВЦ «Патриот Экспо»", addr: { "@type": "PostalAddress", addressLocality: "Кубинка", addressRegion: "Московская область", addressCountry: "RU", streetAddress: "Минское шоссе, 55-й км, парк «Патриот»" } },
      "eicma-2026": { name: "Fiera Milano Rho", addr: { "@type": "PostalAddress", addressLocality: "Rho (Milano)", addressCountry: "IT" } } };
    (window.EVENTS || []).forEach(function (e) {
      if (!e.upcoming || !END[e.id] || !/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) return;
      var ld = { "@context": "https://schema.org", "@type": "Event", name: e.title + (e.id === "motozima-2026" ? " — стенд 79BIKE" : " — 79BIKE"), startDate: e.date, endDate: END[e.id],
        eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: LOC[e.id].name, address: LOC[e.id].addr }, description: e.text,
        organizer: { "@type": "Organization", name: "79BIKE", url: "https://falcon-bike.ru" }, url: "https://falcon-bike.ru/events#" + e.id };
      var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
    });
  })();
  /* видео во всплывающем окне */
  (function () {
    var dlg = null, frame = null, endBox = null, ttl = null, lastFocus = null, vkApi = null;
    function build() {
      document.body.insertAdjacentHTML("beforeend", '<div class="vmodal" id="vmodal" role="dialog" aria-modal="true" aria-labelledby="vmodal-t" hidden><div class="vmodal__back" data-vclose></div><div class="vmodal__box"><div class="vmodal__head"><p class="vmodal__t" id="vmodal-t"></p><button type="button" class="vmodal__x" data-vclose aria-label="Закрыть видео">' + ICON.close + '</button></div><div class="vmodal__frame"><div class="vmodal__end" hidden><p>Понравился байк?</p><div class="visit-cta"><a class="btn btn--main" href="testdrive.html#visit">Записаться на тест-драйв</a><button type="button" class="btn btn--ghost" data-vagain>Смотреть ещё раз</button></div></div></div></div></div>');
      dlg = $("vmodal"); endBox = dlg.querySelector(".vmodal__end"); ttl = $("vmodal-t");
      dlg.addEventListener("click", function (e) { if (e.target.closest("[data-vclose]")) close(); if (e.target.closest("[data-vagain]")) play(dlg.dataset.src, dlg.dataset.p); });
      document.addEventListener("keydown", function (e) { if (!dlg.hidden && e.key === "Escape") close(); });
      // YouTube: в конце ролика закрываем плеер своим экраном, чтобы не показывались чужие ролики
      window.addEventListener("message", function (e) {
        if (!frame || !/youtube/.test(e.origin)) return;
        try { var d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; if (d && d.info && d.info.playerState === 0) ended(); } catch (x) {}
      });
    }
    function ended() { if (frame) { frame.remove(); frame = null; } endBox.hidden = false; }
    function play(src, p) {
      endBox.hidden = true; if (frame) frame.remove();
      if (p === "local") { /* 29.10: свой ролик — встроенный плеер браузера */
        frame = document.createElement("video"); frame.src = src; frame.controls = true; frame.autoplay = true; frame.playsInline = true; frame.preload = "auto";
        frame.setAttribute("style", "position:absolute;inset:0;width:100%;height:100%;background:#000");
        frame.addEventListener("ended", ended); dlg.querySelector(".vmodal__frame").appendChild(frame); return;
      }
      frame = document.createElement("iframe");
      frame.src = src; frame.title = ttl.textContent; frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture"; frame.referrerPolicy = "strict-origin-when-cross-origin";
      dlg.querySelector(".vmodal__frame").appendChild(frame);
      if (p === "youtube") frame.addEventListener("load", function () { try { frame.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*"); } catch (x) {} });
      if (p === "vk") frame.addEventListener("load", function () {
        var hook = function () { try { vkApi = window.VK.VideoPlayer(frame); vkApi.on("ended", ended); } catch (x) {} };
        if (window.VK && window.VK.VideoPlayer) hook(); else { var sc = document.createElement("script"); sc.src = "https://vk.com/js/api/videoplayer.js"; sc.onload = hook; document.head.appendChild(sc); }
      });
    }
    function open(a) {
      if (!dlg) build();
      lastFocus = a; ttl.textContent = a.dataset.vt || "Видеообзор"; dlg.dataset.src = a.dataset.embed; dlg.dataset.p = a.dataset.vp;
      dlg.hidden = false; document.body.style.overflow = "hidden";
      play(a.dataset.embed, a.dataset.vp);
      dlg.querySelector(".vmodal__x").focus();
    }
    function close() { if (frame) { frame.remove(); frame = null; } dlg.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    document.addEventListener("click", function (e) { var a = e.target.closest("a.vcard[data-embed]"); if (!a || e.ctrlKey || e.metaKey) return; e.preventDefault(); open(a); });
  })();
  /* фотогалерея: фильтр по цвету, мозаика, вкладки на главной, лайтбокс */
  (function () {
    var G = document.querySelectorAll(".pgal");
    if (!G.length) return;
    function layout(g) {
      var its = g.querySelectorAll(".pgal__it"), vis = [], col = g.dataset.col || "";
      its.forEach(function (b) { var ok = !col || b.dataset.gc === col; b.hidden = !ok; b.classList.remove("is-big", "is-more"); b.removeAttribute("data-more"); if (ok) vis.push(b); });
      vis.forEach(function (b, i) { if (i === 0) b.classList.add("is-big"); if (i >= 5) b.classList.add("is-more"); });
      if (vis.length > 5) vis[4].setAttribute("data-more", "+" + (vis.length - 5) + " фото");
      g.className = g.className.replace(/pgal--n\d/, "pgal--n" + Math.min(vis.length, 5));
      var img = vis[0] && vis[0].querySelector("img"); if (img) img.sizes = "(min-width: 900px) 50vw, 82vw";
    }
    G.forEach(function (g) {
      layout(g);
      g.addEventListener("click", function (e) {
        var c = e.target.closest("[data-gcol]");
        if (c) { g.dataset.col = c.dataset.gcol; g.querySelectorAll("[data-gcol]").forEach(function (x) { x.setAttribute("aria-pressed", x === c); }); layout(g); g.querySelector(".pgal__grid").scrollLeft = 0; return; }
        var b = e.target.closest(".pgal__it"); if (b) open(g, b);
      });
    });
    var ht = $("hgal-tabs");
    if (ht) {
      var tabs = ht.querySelectorAll('[role="tab"]');
      var pick = function (t, f) { tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("hgal-" + x.dataset.k).hidden = !on; }); if (f) t.focus(); };
      ht.addEventListener("click", function (e) { var t = e.target.closest('[role="tab"]'); if (t) pick(t); });
      ht.addEventListener("keydown", function (e) { var i = [].indexOf.call(tabs, document.activeElement), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (i < 0 || !d) return; e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); });
    }
    var box, img, cap, cnt, list = [], idx = 0, last = null, tx = null, ty = 0;
    function build() {
      document.body.insertAdjacentHTML("beforeend", '<div class="glb" id="glb" role="dialog" aria-modal="true" aria-label="Фотогалерея" hidden><div class="glb__top"><span class="glb__cnt" id="glb-cnt" aria-live="polite"></span><button type="button" class="glb__x" data-gclose aria-label="Закрыть">' + ICON.close + '</button></div><div class="glb__stage" data-gclose><img id="glb-img" alt=""><button type="button" class="glb__nav glb__nav--prev" data-gstep="-1" aria-label="Предыдущее фото">' + ICON.chev + '</button><button type="button" class="glb__nav glb__nav--next" data-gstep="1" aria-label="Следующее фото">' + ICON.chev + '</button></div><p class="glb__cap" id="glb-cap"></p></div>');
      box = $("glb"); img = $("glb-img"); cap = $("glb-cap"); cnt = $("glb-cnt");
      box.addEventListener("click", function (e) { var s = e.target.closest("[data-gstep]"); if (s) { step(+s.dataset.gstep); return; } if (e.target.closest(".glb__x") || e.target.classList.contains("glb__stage")) close(); });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); close(); } else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "Tab") { var f = box.querySelectorAll("button"), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      });
      var st = box.querySelector(".glb__stage");
      st.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      st.addEventListener("touchend", function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1); });
    }
    function show() {
      var g = list[idx]; img.src = g.src; img.alt = nb(g.alt);
      /* 26.10 (правка 17): подписи на экране не показываем — только у фото событий/выставок (g.event); alt остаётся */
      cap.hidden = !g.event; cap.textContent = g.event ? nb(g.alt) : "";
      cnt.textContent = (idx + 1) + " / " + list.length;
      box.classList.toggle("is-single", list.length < 2);
      var n = list[(idx + 1) % list.length]; if (n) { var p = new Image(); p.src = n.src; }
    }
    function step(d) { if (list.length < 2) return; idx = (idx + d + list.length) % list.length; show(); }
    function open(g, b) {
      if (!box) build();
      var all = galItems(g.dataset.gal), col = g.dataset.col || "", vis = [];
      g.querySelectorAll(".pgal__it").forEach(function (x) { if (!x.hidden) vis.push(x); });
      list = vis.map(function (x) { return all[+x.dataset.gi]; });
      idx = Math.max(0, vis.indexOf(b)); last = b;
      box.hidden = false; document.body.style.overflow = "hidden"; show();
      box.querySelector(".glb__x").focus();
    }
    function close() { box.hidden = true; document.body.style.overflow = ""; img.removeAttribute("src"); if (last) last.focus(); }
  })();
})();

/* События: фильтр по типу (страница events.html) */
(function () {
  var f = document.querySelector(".ev-filter"); if (!f) return;
  f.addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-ev]"); if (!b) return;
    var t = b.getAttribute("data-ev"), n = 0;
    f.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    document.querySelectorAll("#ev-grid .ev").forEach(function (c) { var on = !t || c.getAttribute("data-type") === t; c.hidden = !on; if (on) n++; });
    var em = document.getElementById("ev-empty"); if (em) em.hidden = n > 0;
  });
})();

/* 26.10.2026: звонок в окне-предпросмотре прототипа. Внутри окна просмотра (iframe) браузер может блокировать tel:,
   поэтому показываем лист с номером: «Позвонить» (target=_top), «Скопировать номер», мессенджеры. На настоящем сайте ссылка работает как обычно. */
(function () {
  if (window.top === window) return;
  var sheet;
  function close() { if (sheet) sheet.hidden = true; }
  function open(href) {
    var num = href.replace(/^tel:/, ""), pretty = "+7 (999) 900-55-88";
    if (!sheet) {
      sheet = document.createElement("div"); sheet.className = "telsheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "Позвонить");
      sheet.innerHTML = '<div class="telsheet__bg" data-x></div><div class="telsheet__in"><p class="telsheet__t">Позвонить нам</p><a class="telsheet__num" target="_top"></a>' +
        '<a class="telsheet__btn telsheet__btn--main" target="_top" data-call>Позвонить</a><button type="button" class="telsheet__btn" data-copy>Скопировать номер</button>' +
        '<div class="telsheet__row"><a href="https://wa.me/79999005588" target="_blank" rel="noopener">WhatsApp</a><a href="https://t.me/Meliso_group" target="_blank" rel="noopener">Telegram</a><a href="https://vk.me/79bike" target="_blank" rel="noopener">VK Мессенджер</a></div>' +
        '<button type="button" class="telsheet__x" data-x aria-label="Закрыть">×</button></div>';
      document.body.appendChild(sheet);
      sheet.addEventListener("click", function (e) {
        if (e.target.closest("[data-x]")) { close(); return; }
        var c = e.target.closest("[data-copy]");
        if (c) { var done = function () { c.textContent = "Номер скопирован"; }; try { navigator.clipboard.writeText(pretty).then(done, function () { fallback(); done(); }); } catch (x) { fallback(); done(); } }
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
    function fallback() { var t = document.createElement("textarea"); t.value = pretty; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (x) {} t.remove(); }
    sheet.querySelector(".telsheet__num").href = href; sheet.querySelector(".telsheet__num").textContent = pretty;
    sheet.querySelector("[data-call]").href = href; sheet.querySelector("[data-copy]").textContent = "Скопировать номер";
    sheet.hidden = false;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!a || a.closest(".telsheet")) return;
    e.preventDefault(); open(a.getAttribute("href"));
  }, true);
  var css = document.createElement("style");
  css.textContent = '.telsheet{position:fixed;inset:0;z-index:2147483000}.telsheet[hidden]{display:none}.telsheet__bg{position:absolute;inset:0;background:rgba(0,0,0,.6)}.telsheet__in{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));max-width:420px;margin:0 auto;padding:22px 18px 18px;border-radius:22px;background:#16161c;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.08);display:flex;flex-direction:column;gap:10px;font-family:inherit}.telsheet__t{margin:0;font-size:14px;color:#a6a9b4}.telsheet__num{font-size:26px;font-weight:800;color:#fff;text-decoration:none;user-select:all;-webkit-user-select:all}.telsheet__btn{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;border:0;font:700 16px/1 inherit;font-family:inherit;cursor:pointer;text-decoration:none;background:#24242c;color:#fff}.telsheet__btn--main{background:#7658F5}.telsheet__row{display:flex;flex-wrap:wrap;gap:8px}.telsheet__row a{flex:1 1 40%;white-space:nowrap;padding:0 10px;text-align:center;font-size:15px;display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:999px;color:#fff;text-decoration:none;font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}.telsheet__x{position:absolute;top:10px;right:12px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:#a6a9b4;font-size:26px;cursor:pointer}';
  document.head.appendChild(css);
})();

/* 26.10.2026: высота шапки для липкой панели каталога запчастей */
(function () { function set() { var t = document.querySelector(".top"); if (t) document.documentElement.style.setProperty("--top-h", Math.round(t.getBoundingClientRect().height * 100) / 100 + "px"); } addEventListener("load", set); addEventListener("resize", set); document.addEventListener("DOMContentLoaded", set); set(); var t0 = document.querySelector(".top"); if (t0 && window.ResizeObserver) new ResizeObserver(set).observe(t0); })();
/* 27.10 (Михаил): слова не переносятся посередине. Если длинное слово не помещается в строку на узком экране,
   уменьшаем шрифт этого элемента (до 70 %); только если и так не помещается — разрешаем перенос внутри слова. */
(function () {
  var SEL = "h1,h2,h3,h4,.h2,.h3,summary,legend,p,li,dt,dd,td,th,label,figcaption,blockquote,.btn,button,a,b,strong,span,small,em,output";
  var LONG = /[^\s­\-‐-—\/]{7,}/g;
  function block(el) { while (el && el !== document.body && getComputedStyle(el).display.indexOf("inline") === 0) el = el.parentElement; return el; }
  function avail(b) { var cs = getComputedStyle(b); return b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); }
  function widest(el) {
    var mx = 0, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) {
      if (n.parentElement !== el) continue;
      var t = n.textContent, m; LONG.lastIndex = 0;
      while ((m = LONG.exec(t))) { var r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); var rs = r.getClientRects(), wd = 0; for (var i = 0; i < rs.length; i++) wd += rs[i].width; if (wd > mx) mx = wd; }
    }
    return mx;
  }
  function fit() {
    var done = [];
    document.querySelectorAll("[data-fitfs]").forEach(function (el) { el.style.fontSize = ""; el.style.overflowWrap = ""; el.removeAttribute("data-fitfs"); });
    var seen = new Set(), tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) {
      LONG.lastIndex = 0; if (!LONG.test(n.textContent)) continue;
      var el = n.parentElement; if (!el || seen.has(el) || !el.matches(SEL) || el.closest("script,style,svg,[hidden],.viz__svg,table,.pc__sku")) continue;
      seen.add(el); done.push(el);
    }
    done.forEach(function (el) {
      if (!el.getClientRects().length) return;
      var b = block(el); if (!b) return; var av = avail(b); if (av < 40) return; /* скрытые для экранных дикторов заголовки — пропускаем */
      var w = widest(el); if (w <= av + 0.5) return;
      var fs0 = parseFloat(getComputedStyle(el).fontSize), fs = fs0;
      for (var i = 0; i < 4 && w > av + 0.5 && fs > fs0 * 0.7; i++) { fs = Math.max(fs0 * 0.7, fs * av / w - 0.2); el.style.fontSize = fs.toFixed(2) + "px"; el.setAttribute("data-fitfs", "1"); w = widest(el); }
      if (w > av + 0.5) { el.style.overflowWrap = "break-word"; el.setAttribute("data-fitfs", "1"); }
    });
  }
  /* таблицы: слова в ячейках не рвём; если таблица шире блока — уменьшаем шрифт всей таблицы (до 75 %), иначе — прокрутка по горизонтали */
  function fitTables() {
    document.querySelectorAll("table").forEach(function (t) {
      var par = t.parentElement; if (!par || !t.getClientRects().length) return;
      if (t.hasAttribute("data-fitfs")) { t.style.fontSize = ""; t.removeAttribute("data-fitfs"); par.style.overflowX = ""; }
      var av = avail(par); if (av < 40) return;
      var fs0 = parseFloat(getComputedStyle(t).fontSize), fs = fs0;
      t.querySelectorAll("th,td").forEach(function (c) { c.style.fontSize = ""; });
      for (var i = 0; i < 6 && t.scrollWidth > av + 1 && fs > fs0 * 0.75; i++) { fs = Math.max(fs0 * 0.75, fs * 0.94); t.style.fontSize = fs.toFixed(2) + "px"; t.setAttribute("data-fitfs", "1"); }
      if (t.scrollWidth > av + 1) { par.style.overflowX = "auto"; t.setAttribute("data-fitfs", "1"); }
    });
  }
  var tmr = 0; function later() { clearTimeout(tmr); tmr = setTimeout(function () { fitTables(); fit(); }, 120); }
  function start() {
    later();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    window.addEventListener("resize", later, { passive: true });
    window.addEventListener("load", later);
    if ("MutationObserver" in window) new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) if (ms[i].type === "childList" || ms[i].type === "characterData") { later(); return; } }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* 27.10.2026: видеоинструкция сборки — вкладки и HLS-плеер (Safari — нативно, остальные — hls.js по требованию) */
(function () {
  function hlsLoad(cb) { if (window.Hls) return cb(); var s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js"; s.onload = cb; document.head.appendChild(s); }
  function attach(v) { if (v.__hls) return; v.__hls = 1; var u = v.getAttribute("data-hls");
    var fb = v.getAttribute("data-fallback");
    hlsLoad(function () { if (window.Hls && Hls.isSupported()) { var h = new Hls(); h.loadSource(u); h.attachMedia(v); h.on(Hls.Events.ERROR, function (ev, d) { if (d && d.fatal && fb) { h.destroy(); v.src = fb; v.play && v.play().catch(function () {}); } }); v.play && v.play().catch(function () {}); } else if (fb) { v.src = fb; v.play && v.play().catch(function () {}); } }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-asm-tab]"); if (!b) return;
    var w = b.closest("[data-asm]"), k = b.getAttribute("data-asm-tab");
    w.querySelectorAll("[data-asm-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
    w.querySelectorAll("[data-asm-p]").forEach(function (p) { p.hidden = p.getAttribute("data-asm-p") !== k; });
    if (k !== "v") { var v = w.querySelector("video"); if (v && !v.paused) v.pause(); }
  });
  document.addEventListener("play", function (e) { if (e.target.matches && e.target.matches("video[data-hls]")) attach(e.target); }, true);
  document.addEventListener("click", function (e) { var v = e.target.closest && e.target.closest(".asm__v"); if (v) attach(v.querySelector("video")); }, true);
})();

/* 31.10.2026: прямая ссылка на вопрос (faq.html#lynx-oil, страница модели#lynx-oil) — вопрос раскрывается и прокручивается к нему */
(function () {
  function go() {
    var h = ""; try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) { return; }
    if (!h || !/^[\w-]+$/.test(h)) return;
    var d = document.getElementById(h); if (!d || d.tagName !== "DETAILS") return;
    d.open = true; setTimeout(function () { d.scrollIntoView({ block: "start" }); }, 80);
  }
  window.addEventListener("hashchange", go);
  if (document.readyState === "complete") setTimeout(go, 300); else window.addEventListener("load", function () { setTimeout(go, 300); });
})();
