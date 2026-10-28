/* falcon-bike.ru: прототип. Общий JS: шапка, подвал, хелперы рендера, виджеты.
   Без библиотек. Подключается с defer после models.js и content.js.

   Как пользоваться на страницах:
     document.addEventListener("DOMContentLoaded", () => {
       el.innerHTML = MODELS.map(m => UI.renderModelCard(m)).join("");
       UI.init(el);           // нужно только для табов; свотчи, формы, раскрывашки работают делегированием
     });
   Inline-скрипт страницы выполняется раньше app.js (defer), поэтому код страницы
   кладём в обработчик DOMContentLoaded: к этому моменту window.UI уже есть.
*/
(function () {
  "use strict";

  var MODELS = Array.isArray(window.MODELS) ? window.MODELS.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }) : [];
  var SPEC_ROWS = Array.isArray(window.SPEC_ROWS) ? window.SPEC_ROWS : [];
  var SPEC_EXTRA_ROWS = Array.isArray(window.SPEC_EXTRA_ROWS) ? window.SPEC_EXTRA_ROWS : [];
  var CONTENT = window.CONTENT || {};

  var NBSP = " ";
  var NNBSP = " ";
  var PHONE = "+7 (999) 900-55-88";
  var PHONE_HREF = "tel:+79999005588";
  var EMAIL = "info@79bike.ru";
  var RUTUBE = "https://rutube.ru/channel/65461061/";
  /* Сообщение после отправки: data-success формы (или «Заявка принята.») + PROTO_NOTE */
  var PROTO_NOTE = "В прототипе заявка никуда не отправляется.";

  /* ---------- пути ---------- */
  var ROOT = (document.body && document.body.getAttribute("data-root")) || "";
  function url(path) {
    if (!path) return ROOT || "index.html";
    if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
    return ROOT + path;
  }
  function icon(id, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false"><use href="' + url("assets/icons.svg#" + id) + '"></use></svg>';
  }

  /* Ссылки «Клиентам» и прочие. Страниц под них пока нет: по умолчанию ведут на якоря главной.
     Переопределяются через window.SITE_LINKS = { delivery: "…", … } до подключения app.js. */
  var LINKS = Object.assign({
    /* Страницы «Клиентам» в ТЗ не перерисовываются — ведут на действующие страницы falcon-bike.ru */
    delivery: "https://falcon-bike.ru/pay",          // полная страница оплаты и доставки (кнопки «Подробнее…»)
    deliveryHome: "index.html#delivery",             // блок «Доставка и оплата» на главной (меню и подвал)
    installment: "https://falcon-bike.ru/rassrochka",
    instructions: "https://falcon-bike.ru/assembling",
    warranty: "https://falcon-bike.ru/warranty",
    parts: "https://falcon-bike.ru/accessories",
    faq: "index.html#faq",
    compare: "compare.html",
    picker: "podbor.html",
    reviews: "reviews.html",
    declaration: "https://falcon-bike.ru/declaration",
    warrantyPolicy: "https://falcon-bike.ru/warranty",
    /* Контакты — как на текущем falcon-bike.ru */
    telegram: "https://t.me/Meliso_group",
    whatsapp: "https://wa.me/79999005588",
    vk: "https://vk.com/79bike",
    rutube: RUTUBE,
    dzen: "https://dzen.ru/id/684bd16cbdb83b450944e2da"
  }, window.SITE_LINKS || {});

  /* target/rel для внешних ссылок (http/https на другой хост) */
  function ext(href) {
    if (!/^https?:\/\//i.test(href || "")) return "";
    try { if (new URL(href).host === location.host) return ""; } catch (e) { /* ничего */ }
    return ' target="_blank" rel="noopener"';
  }

  /* ---------- утилиты ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function lc(s) { return String(s || "").toLocaleLowerCase("ru-RU"); }
  function num(n) {
    if (typeof n !== "number") return String(n);
    var parts = String(n).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
    return parts.join(",");
  }
  var uid = 0;
  function nextId(prefix) { uid += 1; return (prefix || "ui") + "-" + uid; }
  function get(obj, path, fallback) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (cur == null) return fallback;
      cur = cur[path[i]];
    }
    return cur == null ? fallback : cur;
  }

  /* ---------- цены ---------- */
  function fmtPrice(n) {
    if (n == null || n === "" || isNaN(Number(n))) return "Цена по запросу";
    return num(Math.round(Number(n))) + NBSP + "₽";
  }
  function hasOldPrice(model) {
    return !!(model && model.price != null && model.oldPrice != null && Number(model.oldPrice) > Number(model.price));
  }
  /* бейдж «Цена снижена» для угла фото (карточки, страница модели) */
  function saleBadge(model) {
    return hasOldPrice(model) ? '<span class="badge badge--sale">' + esc(get(CONTENT, ["ui", "badges", "sale"], "Цена снижена")) + "</span>" : "";
  }
  /* «Старт продаж — 2027» для модели со статусом soon и полем launch (Lynx X); шаблон — CONTENT.ui.badges.launch */
  function launchText(model) {
    if (!model || model.status !== "soon" || !model.launch) return "";
    return String(get(CONTENT, ["ui", "badges", "launch"], "Старт продаж — {year}")).replace("{year}", model.launch);
  }
  function priceHtml(model, opts) {
    opts = opts || {};
    var cls = "price" + (opts.size === "sm" ? " price--sm" : "");
    if (model.price == null) {
      /* Lynx X: цены нет до старта продаж — «Скоро в продаже» + «Старт продаж — 2027», остальные — «Цена по запросу» */
      var launch = launchText(model);
      return '<p class="' + cls + ' price--request"><span class="price__now">' + (model.status === "soon" ? esc(get(CONTENT, ["ui", "badges", "soon"], "Скоро в продаже")) : "Цена по запросу") + "</span>" +
        (launch ? '<span class="price__note">' + esc(launch) + "</span>" : "") + "</p>";
    }
    /* зачёркнутая цена (oldPrice) — как на текущем falcon-bike.ru; показываем, только если она выше актуальной */
    var flag = flagHtml(flagsFor(model, "price"));
    var old = hasOldPrice(model)
      ? '<s class="price__old"><span class="visually-hidden">' + esc(get(CONTENT, ["ui", "oldPriceLabel"], "Старая цена")) + ": </span>" + fmtPrice(model.oldPrice) + "</s>"
      : "";
    return '<p class="' + cls + '"><span class="price__now">' + fmtPrice(model.price) + "</span>" + old + flag + "</p>";
  }

  /* ---------- флаги «сверить» ----------
     Сопоставляем текст model.flags с ключами характеристик по ключевым словам,
     чтобы метка стояла у конкретного значения. Текст флага уходит в title. */
  var FLAG_RULES = {
    powerKw: /кВт/i,
    speedKmh: /скорост|км\/ч|mph/i,
    torqueNm: /Н·м|момент/i,
    capacityAh: /\d\s?Ач\b|^Батаре|ёмкост/i,   // «60 Ач», «Батарея: …», но не «вес (с батареей)»
    seatMm: /сидень/i,
    weightKg: /^Вес\b/i,
    brakes: /тормоз/i,
    wheels: /колёс(?!н)|колес(?!н)/i,   // «колёса», но не «колёсная база»
    wheelbaseMm: /колёсн\S* баз|колесн\S* баз/i,
    frontSuspension: /вилк|подвеск/i,
    rearSuspension: /амортиз|подвеск/i,
    modes: /режим/i,
    ip: /IP\d|влагозащ/i,
    nfc: /NFC/i,
    motorLight: /подсветк/i,
    colors: /цвет/i,
    price: /опечат|цена.*сверить/i,
    name: /^Название/i
  };
  function flagsFor(model, key) {
    var list = Array.isArray(model && model.flags) ? model.flags : [];
    var out = [];
    list.forEach(function (f) {
      if (/Нет в таблице/i.test(f) && key !== "price" && key !== "name") { out.push(f); return; }
      var re = FLAG_RULES[key];
      if (re && re.test(f)) out.push(f);
    });
    return out;
  }
  function flagHtml(texts, label) {
    if (!texts || !texts.length) return "";
    var t = texts.join(" / ");
    return ' <span class="flag" title="' + esc(t) + '" tabindex="0" aria-label="Сверить: ' + esc(t) + '">' + esc(label || "сверить") + "</span>";
  }

  /* ---------- характеристики ---------- */
  function rowFor(key) {
    for (var i = 0; i < SPEC_ROWS.length; i++) if (SPEC_ROWS[i].key === key) return SPEC_ROWS[i];
    for (var j = 0; j < SPEC_EXTRA_ROWS.length; j++) if (SPEC_EXTRA_ROWS[j].key === key) return SPEC_EXTRA_ROWS[j];
    return { key: key, label: key, unit: "" };
  }
  /* Текст значения без флагов. opts.unit === false: без единицы. null → "". */
  /* «Чёрный» → «чёрная» (рама) / «чёрные» (вставки) */
  function colorAdj(name, plural) {
    var w = lc(name);
    return plural ? w.replace(/(ый|ой)$/, "ые").replace(/ий$/, "ие") : w.replace(/(ый|ой)$/, "ая").replace(/ий$/, "яя");
  }
  function cap1(s) { s = String(s || ""); return s.charAt(0).toLocaleUpperCase("ru-RU") + s.slice(1); }
  /* Строка «Цвета»: только рама → «Чёрный, белый»; рама + вставки → «Рама: чёрная, серебристая · Вставки: фиолетовые, жёлтые» */
  function colorsText(model) {
    var frame = get(model, ["colors", "frame"], []) || [];
    var acc = get(model, ["colors", "accents"], []) || [];
    var extra = get(model, ["colors", "extra"], []) || [];
    /* 26.10 (Михаил): утверждённые названия расцветок «English Name (русский)» — показываем их */
    var names = get(model, ["colors", "names"], []) || [];
    if (names.length) return names.join(" · ");
    if (!frame.length && !acc.length) return "";
    if (!acc.length) return cap1(frame.map(lc).join(", "));
    var parts = [];
    if (frame.length) parts.push("Рама: " + frame.map(function (c) { return colorAdj(c, false); }).join(", "));
    parts.push("Вставки: " + acc.map(function (c) { return colorAdj(c, true); }).join(", "));
    /* отдельные варианты («Полностью чёрный») */
    if (extra.length) parts.push("Также: " + extra.map(lc).join(", "));
    return parts.join(" · ");
  }
  function fmtSpecText(model, key, opts) {
    opts = opts || {};
    if (key === "colors") return colorsText(model);
    var v = get(model, ["specs", key], null);
    if (v == null) return "";
    var row = rowFor(key);
    if (key === "wheels") {
      if (typeof v === "string") return v;
      return "Перед: " + (v.front || "—") + " · Зад: " + (v.rear || "—");
    }
    if (key === "motorLight" || key === "nfc") return typeof v === "string" ? v : (v ? "Да" : "Нет");
    /* аккумулятор: напряжение + элементы — «72 В, Samsung 50S» (энергоёмкость — отдельная строка SPEC_EXTRA_ROWS) */
    if (key === "cells") {
      var volt = get(model, ["specs", "voltage"], null);
      return (volt != null ? num(volt) + NBSP + "В, " : "") + v;
    }
    /* габариты: «2030 × 830 × 1170 мм» */
    if (key === "dimensions") {
      if (typeof v !== "object") return String(v);
      var d = [v.lengthMm, v.widthMm, v.heightMm].map(function (x) { return x == null ? "—" : num(x); }).join(" × ");
      return d + (opts.unit !== false ? NBSP + "мм" : "");
    }
    var s = typeof v === "number" ? num(v) : String(v);
    /* несколько значений через « · » (тормоза Lite): единица — у каждого числа, до пояснения в скобках
       «220 × 2,3 мм (перед) · 203 × 2,3 мм (зад)» */
    if (opts.unit !== false && row.unit && (s.indexOf(" · ") !== -1 || s.indexOf(" (") !== -1)) {  /* и одно значение с пояснением: «до 120 км (при 25 км/ч)» */
      return s.split(" · ").map(function (part) {
        var m = /^(.*?)(\s*\(.*\))?$/.exec(part);
        return m[1] + NBSP + row.unit + (m[2] || "");
      }).join(" · ");
    }
    if (opts.unit !== false && row.unit) s += NBSP + row.unit;
    return s;
  }
  /* Длинные текстовые значения: без nowrap, иначе ломают таблицу на телефоне */
  var TEXT_KEYS = ["frontSuspension", "rearSuspension", "modes", "brakeType", "motorLight", "motorType", "controller", "frame", "chargeCurrent"];
  /* HTML значения: экранированный текст + метка «сверить» (если значение спорное или его нет). */
  function fmtSpec(model, key, opts) {
    var text = fmtSpecText(model, key, opts);
    var flags = flagsFor(model, key);
    if (!text) return "—" + flagHtml(flags.length ? flags : ["Нет данных в таблице характеристик"]);
    // цвета и текстовые описания (подвеска, режимы): каждая часть с новой строки, внутри перенос разрешён
    if (key === "colors" || TEXT_KEYS.indexOf(key) !== -1) {
      return esc(text).split(" · ").map(function (part) { return '<span class="spec-colors">' + part + "</span>"; }).join("") + flagHtml(flags);
    }
    // габариты «2 030 × 830 × 1 170 мм»: перенос между числами разрешён (узкая колонка на телефоне)
    if (key === "dimensions") return esc(text) + flagHtml(flags);
    // размеры колёс и тормозов не должны рваться на дефисе / между числами
    var html = esc(text).split(" · ").map(function (part) { return '<span class="nowrap">' + part + "</span>"; }).join(" · ");
    return html + flagHtml(flags);
  }

  function displayName(model) {
    return model.name;
  }
  function brandSuffix(model) {
    if (!model.brand) return "";
    if (String(model.name).indexOf(model.brand) === 0) return "";
    return model.brand;
  }
  function modelBySlug(slug) {
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].slug === slug) return MODELS[i];
    return null;
  }

  /* ---------- цвета ---------- */
  var PAINT = {
    "чёрный": "var(--paint-black)", "черный": "var(--paint-black)",
    "белый": "var(--paint-white)",
    "серебристый": "var(--paint-silver)",
    "серый": "var(--paint-grey)",
    "фиолетовый": "var(--paint-violet)",
    "жёлтый": "var(--paint-yellow)", "желтый": "var(--paint-yellow)",
    "красный": "var(--paint-red)",
    "золотой": "var(--paint-gold)"
  };
  function paint(name) { return PAINT[lc(name)] || "var(--paint-unknown)"; }
  function accentPhrase(name) {
    // «Фиолетовый» → «с фиолетовыми вставками»
    var w = lc(name).replace(/(ый|ой)$/, "ыми").replace(/ий$/, "ими");
    return "с " + w + " вставками";
  }
  function colorPhrase(frame, accent) {
    var parts = [];
    if (frame) parts.push(lc(frame));
    if (accent) parts.push(accentPhrase(accent));
    return parts.join(" ");
  }
  /* Подпись заглушки: «Фото: Falcon GT, чёрный, вид сбоку» */
  function captionFor(name, frame, accent, view) {
    var color = colorPhrase(frame, accent);
    return "Фото: " + name + (color ? ", " + color : "") + (view ? ", " + view : "");
  }

  /* Свотчи. mediaIds: id одной или нескольких .media (через пробел), у которых меняется подпись. */
  function renderSwatches(model, mediaIds, opts) {
    opts = opts || {};
    var frame = get(model, ["colors", "frame"], []) || [];
    var accents = get(model, ["colors", "accents"], []) || [];
    if (!frame.length && !accents.length) {
      return '<div class="swatches"><p class="swatches__none">Цвета уточняются' + flagHtml(["Цвета модели не указаны в данных"]) + "</p></div>";
    }
    function group(kind, label, list) {
      if (!list.length) return "";
      var gid = nextId("sw");
      return '<div class="swatches__group" role="group" aria-labelledby="' + gid + '">' +
        '<span class="swatches__label" id="' + gid + '">' + label + "</span>" +
        '<span class="swatches__list">' + list.map(function (c, i) {
          return '<button type="button" class="swatch" data-group="' + kind + '" data-color="' + esc(c) + '" style="--swatch:' + paint(c) + '"' +
            ' aria-pressed="' + (i === 0 ? "true" : "false") + '" aria-label="' + esc(label + ": " + lc(c)) + '" title="' + esc(c) + '"></button>';
        }).join("") + "</span>" +
        '<span class="swatches__value" data-swatch-value aria-live="polite">' + esc(list[0]) + "</span></div>";
    }
    return '<div class="swatches" data-swatches data-model-name="' + esc(displayName(model)) + '"' +
      (mediaIds ? ' data-swatches-for="' + esc(mediaIds) + '"' : "") + ">" +
      group("frame", opts.frameLabel || "Цвет", frame) +
      group("accent", opts.accentLabel || "Вставки", accents) +
      "</div>";
  }

  /* ---------- медиа-заглушки ---------- */
  function bikeArt() {
    return '<svg class="media__art" viewBox="0 0 1600 1000" aria-hidden="true" focusable="false"><use href="' + url("assets/bike.svg#bike") + '"></use></svg>';
  }
  /* mediaPlaceholder(label, {video, id, href, duration, corner, icon, ratio, view, modelName})
     label: что должно быть на фото/видео. Префикс «Фото: »/«Видео: » добавляется, если его нет.
     opts.view + opts.modelName: подпись будет меняться свотчами («вид спереди» и т. п.). */
  function mediaPlaceholder(label, opts) {
    opts = opts || {};
    var isVideo = !!opts.video;
    var text = String(label || "");
    if (!/^(Фото|Видео):/.test(text)) text = (isVideo ? "Видео: " : "Фото: ") + text;
    var cls = "media" + (isVideo ? " media--video" : "") + (opts.ratio ? " media--" + opts.ratio : "") + (opts.className ? " " + opts.className : "");
    var attrs = ' role="img" aria-label="' + esc("Заглушка. " + text) + '"';
    if (isVideo) attrs = ""; // внутри интерактивная кнопка, role=img не подходит
    var data = "";
    if (opts.view) data += ' data-view="' + esc(opts.view) + '"';
    if (opts.modelName) data += ' data-model-name="' + esc(opts.modelName) + '"';
    var art = opts.icon ? '<svg class="media__art media__art--icon" aria-hidden="true" focusable="false"><use href="' + url("assets/icons.svg#" + opts.icon) + '"></use></svg>' : bikeArt();
    var play = "";
    if (isVideo) {
      play = '<a class="media__play" href="' + esc(opts.href || LINKS.rutube) + '" target="_blank" rel="noopener" aria-label="' + esc("Смотреть на Rutube. " + text) + '">' + icon("play") + "</a>" +
        (opts.duration ? '<span class="media__duration">' + esc(opts.duration) + "</span>" : "");
    }
    return '<div class="' + cls + '"' + (opts.id ? ' id="' + esc(opts.id) + '"' : "") + attrs + data + ">" +
      art +
      (opts.corner ? '<div class="media__corner">' + opts.corner + "</div>" : "") +
      play +
      '<span class="media__caption" data-media-caption' + (isVideo ? "" : ' aria-hidden="true"') + ">" + esc(text) + "</span></div>";
  }


  /* ---------- реальные фото (photos.js) ----------
     window.PHOTOS[slug] = [{ id, frame, accent, label, paint:[…], flag?, images:[{src, view}] }]
     Нет photos.js или массива для модели → [] и везде остаются заглушки. */
  var VIEW_LABELS = Object.assign({ side: "Сбоку", front34: "3/4 спереди", rear34: "3/4 сзади", front: "Спереди" }, window.PHOTO_VIEWS || {});
  var VIEW_PHRASE = { side: "вид сбоку", front34: "вид 3/4 спереди", rear34: "вид 3/4 сзади", front: "вид спереди" };
  function photos(slug) {
    var all = window.PHOTOS || {};
    var list = all[slug];
    if (!Array.isArray(list)) return [];
    return list.filter(function (c) { return c && c.id && Array.isArray(c.images) && c.images.length; });
  }
  function colorById(slug, colorId) {
    var list = photos(slug);
    for (var i = 0; i < list.length; i++) if (list[i].id === colorId) return list[i];
    return list[0] || null;
  }
  function viewPhrase(v) { return VIEW_PHRASE[v] || (VIEW_LABELS[v] ? lc(VIEW_LABELS[v]) : String(v || "")); }
  function photoAlt(name, color, view) {
    var c = color ? colorPhrase(color.frame, color.accent) : "";
    return name + (c ? ", " + c : "") + (view ? ", " + viewPhrase(view) : "");
  }
  /* photoFor(slug, colorId?, view?|index?) → { src, label, view, viewLabel, color, colorLabel, flag, index, total } | null
     view: "side" | "front34" | … (первый кадр этого ракурса) или число (индекс кадра). */
  function photoFor(slug, colorId, view) {
    var color = colorById(slug, colorId);
    if (!color) return null;
    var imgs = color.images, idx = 0;
    if (typeof view === "number") idx = Math.max(0, Math.min(imgs.length - 1, view));
    else if (view) { for (var i = 0; i < imgs.length; i++) if (imgs[i].view === view) { idx = i; break; } }
    var im = imgs[idx];
    var m = modelBySlug(slug);
    return {
      src: url(im.src), label: photoAlt(m ? displayName(m) : slug, color, im.view),
      view: im.view, viewLabel: VIEW_LABELS[im.view] || im.view || "",
      color: color.id, colorLabel: color.label || color.frame || "", flag: color.flag || "",
      index: idx, total: imgs.length
    };
  }
  function paintVar(name) { return "var(--paint-" + String(name || "unknown").replace(/[^\w-]/g, "") + ")"; }
  function colorValueHtml(color) {
    return esc(color.label || color.frame || "") + (color.flag ? flagHtml([color.flag]) : "");
  }
  /* Выбор расцветки из PHOTOS — кнопки с названиями вместо кружков.
     Если у модели есть вставки и больше одной комбинации: две строки «Рама» и «Вставки» (недоступные сочетания выключены).
     Иначе — одна строка кнопок с названием цвета. Скрытые .swatch[data-photo-color] — для синхронизации блоков (model-page.js).
     targets: id элементов через пробел: .media--photo (меняется картинка) или [data-gallery] (перестраивается галерея). */
  function plural(n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; }
  function accentPlural(a) { return a ? String(a).replace(/(ый|ой)$/, "ые").replace(/ий$/, "ие") : "Без вставок"; }
  function chip(attr, paint, name, on, dis) {
    return '<button type="button" class="cchip" ' + attr + ' aria-pressed="' + (on ? "true" : "false") + '"' + (dis ? " disabled" : "") + ">" +
      '<i class="cchip__c" style="--c:' + paintVar(paint) + '"></i><span>' + esc(name) + "</span></button>";
  }
  function chipRows(slug, cur) {
    var list = photos(slug), split = list.some(function (c) { return c.accent; });
    if (!split) {
      return '<div class="cpick__row"><span class="cpick__list">' + list.map(function (c) {
        var p = (c.paint || ["unknown"]);
        return chip('data-pick="' + esc(c.id) + '"', p[0], c.label || c.frame, c.id === cur.id, false);
      }).join("") + "</span></div>";
    }
    var frames = [], accents = [];
    list.forEach(function (c) {
      if (!frames.some(function (f) { return f.name === c.frame; })) frames.push({ name: c.frame, paint: (c.paint || [])[0] });
      var an = c.accent || "";
      if (!accents.some(function (x) { return x.name === an; })) accents.push({ name: an, paint: c.accent ? (c.paint || [])[1] : (c.paint || [])[0] });
    });
    accents.sort(function (x, y) { return (x.name === "") - (y.name === ""); });
    var row = function (label, items) { return '<div class="cpick__row"><span class="cpick__label">' + label + '</span><span class="cpick__list">' + items + "</span></div>"; };
    return (frames.length > 1 ? row("Рама", frames.map(function (f) { return chip('data-frame="' + esc(f.name) + '"', f.paint, f.name, f.name === cur.frame, false); }).join("")) : "") +
      row(frames.length > 1 ? "Вставки" : "Вставки", accents.map(function (x) {
        var ok = list.some(function (c) { return c.frame === cur.frame && (c.accent || "") === x.name; });
        return chip('data-accent="' + esc(x.name) + '"', x.paint, accentPlural(x.name), x.name === (cur.accent || ""), !ok);
      }).join(""));
  }
  function renderPhotoSwatches(slug, targets, opts) {
    opts = opts || {};
    var list = photos(slug);
    if (!list.length) return "";
    var cur = colorById(slug, opts.current || list[0].id);
    if (list.length < 2) {
      return '<div class="cpick cpick--single"><span class="cpick__label">' + esc(opts.label || "Цвет") + '</span> <span class="cpick__one">' + colorValueHtml(cur) + "</span></div>";
    }
    return '<div class="swatches cpick" data-photo-swatches data-slug="' + esc(slug) + '" data-photo-for="' + esc(targets || "") + '"' + (opts.size === "sm" ? ' data-size="sm"' : "") + ">" +
      '<div class="cpick__rows" data-cpick-rows role="group" aria-label="Выбор цвета">' + chipRows(slug, cur) + "</div>" +
      '<p class="cpick__value"><span class="cpick__count">' + list.length + " " + plural(list.length, "расцветка", "расцветки", "расцветок") + ' · </span><span data-swatch-value aria-live="polite">' + colorValueHtml(cur) + "</span></p>" +
      '<span class="cpick__hidden" hidden>' + list.map(function (c) {
        return '<button type="button" class="swatch" tabindex="-1" data-photo-color="' + esc(c.id) + '" aria-pressed="' + (c.id === cur.id ? "true" : "false") + '"></button>';
      }).join("") + "</span></div>";
  }
  /* Плавная смена картинки: гасим, меняем src, после загрузки проявляем. */
  function swapImg(img, ph) {
    if (!img || !ph) return;
    img.alt = ph.label;
    if (img.getAttribute("src") === ph.src) return;
    img.classList.add("is-swapping");
    var done = function () { img.classList.remove("is-swapping"); img.onload = img.onerror = null; };
    setTimeout(function () {
      img.onload = done; img.onerror = done;
      img.src = ph.src;
      if (img.complete) setTimeout(done, 20);
    }, img.classList.contains("is-hydrated") ? 120 : 0);
    img.classList.add("is-hydrated");
    setTimeout(done, 1500);
  }
  function photoMedia(slug, colorId, view, opts) {
    opts = opts || {};
    var ph = photoFor(slug, colorId, view);
    if (!ph) return "";
    return '<div class="media media--photo' + (opts.className ? " " + opts.className : "") + '"' + (opts.id ? ' id="' + esc(opts.id) + '"' : "") +
      ' data-slug="' + esc(slug) + '"' + (typeof view === "string" ? ' data-view="' + esc(view) + '"' : "") + ">" +
      '<img class="media__img" src="' + esc(ph.src) + '" alt="' + esc(ph.label) + '"' + (opts.eager ? "" : ' loading="lazy"') + ' decoding="async" width="1600" height="1000">' +
      (opts.corner ? '<div class="media__corner">' + opts.corner + "</div>" : "") +
      (opts.inner || "") + "</div>";
  }


  /* ---------- видео-заставка первого экрана (главная falcon-bike.ru и 79bike.ru) ----------
     heroVideo({ slug, color, view, className }) → HTML. Ответ Михаила 19.10.2026: видео без звука по умолчанию,
     звук — по кнопке. Реального mp4 пока нет: <video> без src (data-src пустой), виден постер — реальное фото.
     Когда появится файл, прописать путь в data-src (или src) — initHeroVideos подхватит его.
     Кнопки работают с элементом video (muted, play/pause); состояние хранится в data-атрибутах,
     поэтому без источника они тоже переключаются и не бросают ошибок. prefers-reduced-motion → без автозапуска. */
  var HV_LABELS = { soundOn: "Включить звук", soundOff: "Выключить звук", pause: "Пауза", play: "Воспроизвести",
    badge: "Заставка · фрагмент с 1:17, ~12 с, по кругу" };
  function hvLabel(key) { return get(CONTENT, ["hero", "video", key], HV_LABELS[key]); }
  function heroVideo(opts) {
    opts = opts || {};
    var ph = photoFor(opts.slug || "gt", opts.color, opts.view || "side");
    var visual = ph
      ? '<img class="media__img" src="' + esc(ph.src) + '" alt="' + esc("Кадр-заставка: " + ph.label) + '" decoding="async" width="1600" height="1000">'
      : bikeArt();
    return '<div class="media' + (ph ? " media--photo" : "") + " hero-video" + (opts.className ? " " + opts.className : "") + '" data-hero-video data-playing="true" data-sound="false">' +
      visual +
      "<!-- TODO: mp4 фрагмент с 1:17 (≈12 с) из ролика на Яндекс Диске -->" +
      '<video class="hero-video__video" muted loop playsinline autoplay preload="none"' + (ph ? ' poster="' + esc(ph.src) + '"' : "") +
        ' data-src="" aria-hidden="true" tabindex="-1"></video>' +
      '<span class="hero-video__badge">' + icon("play") + "<span>" + esc(hvLabel("badge")) + "</span></span>" +
      '<div class="hero-video__controls">' +
        '<button type="button" class="hero-video__btn" data-hv-play>' + icon("pause") + '<span class="hero-video__btn-text">' + esc(hvLabel("pause")) + "</span></button>" +
        '<button type="button" class="hero-video__btn" data-hv-sound aria-pressed="false">' + icon("volume-off") + '<span class="hero-video__btn-text">' + esc(hvLabel("soundOn")) + "</span></button>" +
      "</div></div>";
  }
  function hvHasSource(v) {
    return !!(v && (v.getAttribute("src") || v.querySelector("source[src]")));
  }
  function hvPlay(v) {
    if (!hvHasSource(v)) return;           // источника нет — нечего воспроизводить, только меняем состояние кнопок
    try {
      var pr = v.play();
      if (pr && typeof pr.catch === "function") pr.catch(function () { /* автозапуск запрещён браузером — остаёмся на постере */ });
    } catch (e) { /* ничего */ }
  }
  function hvPause(v) { try { v.pause(); } catch (e) { /* ничего */ } }
  function hvSetIcon(btn, id) {
    var u = btn.querySelector("use");
    if (!u) return;
    var h = u.getAttribute("href") || "";
    u.setAttribute("href", h.replace(/(#(?:sprite-icons-)?)[\w-]+$/, "$1" + id)); // и внешний спрайт, и инлайн-символы sprite-icons-*
  }
  function hvRender(box) {
    var playing = box.getAttribute("data-playing") === "true";
    var sound = box.getAttribute("data-sound") === "true";
    var pb = box.querySelector("[data-hv-play]"), sb = box.querySelector("[data-hv-sound]");
    if (pb) {
      pb.querySelector(".hero-video__btn-text").textContent = hvLabel(playing ? "pause" : "play");
      hvSetIcon(pb, playing ? "pause" : "play");
    }
    if (sb) {
      sb.setAttribute("aria-pressed", sound ? "true" : "false");
      sb.querySelector(".hero-video__btn-text").textContent = hvLabel(sound ? "soundOff" : "soundOn");
      hvSetIcon(sb, sound ? "volume" : "volume-off");
    }
  }
  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function initHeroVideos(root) {
    var list = (root || document).querySelectorAll ? (root || document).querySelectorAll("[data-hero-video]:not([data-hv-ready])") : [];
    Array.prototype.forEach.call(list, function (box) {
      box.setAttribute("data-hv-ready", "1");
      var v = box.querySelector("video");
      if (!v) return;
      var ds = v.getAttribute("data-src");
      if (ds && !v.getAttribute("src")) v.setAttribute("src", ds);
      v.muted = true;
      var reduce = !!(reduceMotion && reduceMotion.matches);
      if (reduce) { v.autoplay = false; v.removeAttribute("autoplay"); hvPause(v); }
      box.setAttribute("data-playing", reduce ? "false" : "true");
      box.setAttribute("data-sound", "false");
      v.addEventListener("playing", function () { box.classList.add("has-video"); box.setAttribute("data-playing", "true"); hvRender(box); });
      v.addEventListener("pause", function () { if (hvHasSource(v)) { box.setAttribute("data-playing", "false"); hvRender(box); } });
      v.addEventListener("error", function () { box.classList.remove("has-video"); });
      if (!reduce) hvPlay(v);
      hvRender(box);
    });
  }
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("[data-hv-play], [data-hv-sound]") : null;
    if (!btn) return;
    var box = btn.closest("[data-hero-video]");
    var v = box && box.querySelector("video");
    if (!box || !v) return;
    if (btn.hasAttribute("data-hv-sound")) {
      var on = box.getAttribute("data-sound") !== "true";
      v.muted = !on;
      if (on) { try { v.volume = 1; } catch (err) { /* ничего */ } }
      box.setAttribute("data-sound", on ? "true" : "false");
      if (on && box.getAttribute("data-playing") !== "true") { box.setAttribute("data-playing", "true"); hvPlay(v); }
    } else {
      var playing = box.getAttribute("data-playing") === "true";
      box.setAttribute("data-playing", playing ? "false" : "true");
      if (playing) hvPause(v); else hvPlay(v);
    }
    hvRender(box);
  });

  /* ---------- галерея страницы модели ----------
     renderGallery(slug, { id, color, eager })
     С фото: свотчи расцветок, большое фото со стрелками, лента миниатюр всех кадров расцветки.
     Без фото: сетка заглушек ракурсов + свотчи из models.colors. */
  var PLACEHOLDER_VIEWS = ["вид сбоку", "вид спереди", "вид сзади", "двигатель крупно", "дисплей", "подвеска"];
  function galleryThumbsHtml(slug, color, active) {
    var m = modelBySlug(slug), name = m ? displayName(m) : slug;
    return color.images.map(function (im, i) {
      return '<button type="button" class="gallery__thumb" data-index="' + i + '" aria-pressed="' + (i === active ? "true" : "false") + '"' +
        ' aria-label="' + esc("Кадр " + (i + 1) + " из " + color.images.length + ": " + viewPhrase(im.view)) + '"' + (i === active ? "" : ' tabindex="-1"') + ">" +
        '<img src="' + esc(url(im.src)) + '" alt="" loading="lazy" decoding="async" width="160" height="100"></button>';
    }).join("");
  }
  function galleryCount(ph) { return (ph.index + 1) + " / " + ph.total + " · " + ph.viewLabel; }
  function renderGallery(slug, opts) {
    opts = opts || {};
    var m = modelBySlug(slug);
    if (!m) return "";
    var id = opts.id || nextId("gallery-" + slug);
    var list = photos(slug);
    if (!list.length) {
      var ids = PLACEHOLDER_VIEWS.map(function (v, i) { return id + "-ph" + i; });
      var f0 = get(m, ["colors", "frame", 0], ""), a0 = get(m, ["colors", "accents", 0], "");
      return '<div class="gallery gallery--placeholder" id="' + esc(id) + '" data-slug="' + esc(slug) + '">' +
        '<div class="gallery__bar">' + renderSwatches(m, ids.join(" ")) + "</div>" +
        '<div class="gallery__grid">' + PLACEHOLDER_VIEWS.map(function (v, i) {
          return mediaPlaceholder(captionFor(displayName(m), f0, a0, v), { id: ids[i], view: v, modelName: displayName(m) });
        }).join("") + "</div></div>";
    }
    var color = colorById(slug, opts.color);
    var ph = photoFor(slug, color.id, 0);
    var many = color.images.length > 1;
    var nav = '<button type="button" class="gallery__nav gallery__nav--prev" data-gallery-step="-1" aria-label="Предыдущий кадр"' + (many ? "" : " hidden") + ">" + icon("chevron-left") + "</button>" +
      '<button type="button" class="gallery__nav gallery__nav--next" data-gallery-step="1" aria-label="Следующий кадр"' + (many ? "" : " hidden") + ">" + icon("chevron-right") + "</button>" +
      '<span class="media__caption gallery__count" data-gallery-count aria-live="polite">' + esc(galleryCount(ph)) + "</span>";
    return '<div class="gallery" id="' + esc(id) + '" data-gallery data-slug="' + esc(slug) + '" data-color="' + esc(color.id) + '" data-index="0">' +
      '<div class="gallery__bar">' + renderPhotoSwatches(slug, id, { current: color.id }) + "</div>" +
      photoMedia(slug, color.id, 0, { className: "gallery__stage", eager: opts.eager !== false, inner: nav }) +
      '<div class="gallery__thumbs" role="group" aria-label="Кадры: ' + esc(color.label || "") + '"' + (many ? "" : " hidden") + ">" +
        galleryThumbsHtml(slug, color, 0) + "</div></div>";
  }
  function galleryShow(g, index, focus) {
    var slug = g.getAttribute("data-slug"), colorId = g.getAttribute("data-color");
    var color = colorById(slug, colorId);
    if (!color) return;
    var n = color.images.length;
    index = ((index % n) + n) % n;
    var ph = photoFor(slug, colorId, index);
    g.setAttribute("data-index", String(index));
    swapImg(g.querySelector(".gallery__stage .media__img"), ph);
    var cnt = g.querySelector("[data-gallery-count]");
    if (cnt) cnt.textContent = galleryCount(ph);
    g.querySelectorAll(".gallery__thumb").forEach(function (t, i) {
      var on = i === index;
      t.setAttribute("aria-pressed", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on && t.scrollIntoView && t.parentElement.scrollWidth > t.parentElement.clientWidth) {
        t.parentElement.scrollTo({ left: t.offsetLeft - t.parentElement.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
      }
    });
  }
  function galleryColor(g, colorId) {
    var slug = g.getAttribute("data-slug");
    var color = colorById(slug, colorId);
    if (!color) return;
    g.setAttribute("data-color", color.id);
    var thumbs = g.querySelector(".gallery__thumbs");
    var many = color.images.length > 1;
    if (thumbs) {
      thumbs.innerHTML = galleryThumbsHtml(slug, color, 0);
      thumbs.hidden = !many;
      thumbs.setAttribute("aria-label", "Кадры: " + (color.label || ""));
    }
    g.querySelectorAll(".gallery__nav").forEach(function (b) { b.hidden = !many; });
    galleryShow(g, 0);
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest(".gallery__thumb");
    var step = e.target.closest("[data-gallery-step]");
    var g = (t || step) && (t || step).closest("[data-gallery]");
    if (!g) return;
    var cur = parseInt(g.getAttribute("data-index"), 10) || 0;
    if (t) galleryShow(g, parseInt(t.getAttribute("data-index"), 10) || 0);
    else galleryShow(g, cur + parseInt(step.getAttribute("data-gallery-step"), 10));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var t = e.target.closest && e.target.closest(".gallery__thumb, .gallery__stage, .gallery__nav");
    var g = t && t.closest("[data-gallery]");
    if (!g) return;
    e.preventDefault();
    var cur = parseInt(g.getAttribute("data-index"), 10) || 0;
    galleryShow(g, cur + (e.key === "ArrowRight" ? 1 : -1), !!e.target.closest(".gallery__thumb"));
  });
  /* клик по свотчу расцветки */
  function applyPhotoSwatch(sw) {
    var box = sw.closest("[data-photo-swatches]");
    var slug = box.getAttribute("data-slug"), colorId = sw.getAttribute("data-photo-color");
    box.querySelectorAll(".swatch").forEach(function (b) { b.setAttribute("aria-pressed", b === sw ? "true" : "false"); });
    var color = colorById(slug, colorId);
    var val = box.querySelector("[data-swatch-value]");
    if (val && color) val.innerHTML = colorValueHtml(color);
    var rows = box.querySelector("[data-cpick-rows]");
    if (rows && color) {
      var focused = document.activeElement && rows.contains(document.activeElement) ? document.activeElement : null;
      var key = focused ? (focused.hasAttribute("data-frame") ? '[data-frame="' + focused.getAttribute("data-frame") + '"]' : focused.hasAttribute("data-accent") ? '[data-accent="' + focused.getAttribute("data-accent") + '"]' : '[data-pick="' + focused.getAttribute("data-pick") + '"]') : null;
      rows.innerHTML = chipRows(slug, color);
      if (key) { var nf = rows.querySelector(key); if (nf) nf.focus(); }
    }
    (box.getAttribute("data-photo-for") || "").split(/\s+/).filter(Boolean).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.hasAttribute("data-gallery")) galleryColor(el, colorId);
      else swapImg(el.querySelector(".media__img"), photoFor(slug, colorId, el.getAttribute("data-view") || "side"));
    });
    box.dispatchEvent(new CustomEvent("swatch:change", { bubbles: true, detail: { slug: slug, color: colorId, frame: color && color.frame, accent: color && color.accent } }));
  }

  /* ---------- стат ---------- */
  function statHtml(valueHtml, unit, label) {
    return '<div class="stat"><span class="stat__num"><span class="stat__value">' + valueHtml + "</span>" +
      (unit ? '<span class="stat__unit">' + esc(unit) + "</span>" : "") + '</span><span class="stat__label">' + esc(label) + "</span></div>";
  }
  function specStat(model, key, label) {
    var v = get(model, ["specs", key], null);
    var row = rowFor(key);
    var flags = flagsFor(model, key);
    if (v == null) return statHtml("—", "", label).replace('</span><span class="stat__label">', flagHtml(flags.length ? flags : ["Нет данных"]) + '</span><span class="stat__label">');
    var html = statHtml(esc(typeof v === "number" ? num(v) : v), row.unit, label);
    if (flags.length) html = html.replace('</span><span class="stat__label">', flagHtml(flags) + '</span><span class="stat__label">');
    return html;
  }
  /* 3 цифры-героя: мощность, скорость, батарея. opts.hero: крупный вариант; opts.withRange: 4-я ячейка запас хода */
  function renderStatRow(model, opts) {
    opts = opts || {};
    var cells = [
      specStat(model, "powerKw", "Мощность"),
      specStat(model, "speedKmh", "Скорость"),
      specStat(model, "capacityAh", "Батарея")
    ];
    if (opts.withRange) cells.push(specStat(model, "rangeKm", "Запас хода"));
    return '<div class="stat-row' + (opts.withRange ? " stat-row--4" : "") + (opts.hero ? " stat-row--hero" : "") + '">' + cells.join("") + "</div>";
  }

  /* ---------- карточка модели ----------
     opts: { headingLevel: 3, view: "вид сбоку", showSwatches: true, showTags: true, compact: false } */
  function renderModelCard(model, opts) {
    opts = opts || {};
    if (typeof model === "string") model = modelBySlug(model);
    if (!model) return "";
    var h = "h" + (opts.headingLevel || 3);
    var soon = model.status === "soon";
    var page = url(model.page);
    var mediaId = nextId("media-" + model.slug);
    var frame0 = get(model, ["colors", "frame", 0], "");
    var accent0 = get(model, ["colors", "accents", 0], "");
    var view = opts.view || "вид сбоку";
    var corner = soon ? '<span class="badge badge--soon">Скоро в продаже</span>' : saleBadge(model);
    var hasPhotos = photos(model.slug).length > 0 && opts.photo !== false;
    var media = hasPhotos
      ? photoMedia(model.slug, opts.color, opts.photoView || "side", { id: mediaId, corner: corner, eager: opts.eager })
      : mediaPlaceholder(captionFor(displayName(model), frame0, accent0, view), {
          id: mediaId, view: view, modelName: displayName(model), corner: corner
        });
    var brand = brandSuffix(model);
    var nameFlag = flagHtml(flagsFor(model, "name"));
    var tags = (opts.showTags !== false && model.highlights && model.highlights.length)
      ? '<ul class="tags" aria-label="Особенности">' + model.highlights.map(function (t) { return '<li class="tag">' + esc(t) + "</li>"; }).join("") + "</ul>"
      : "";
    var swatches = opts.showSwatches === false ? "" :
      (hasPhotos ? renderPhotoSwatches(model.slug, mediaId, { current: opts.color }) : renderSwatches(model, mediaId));
    var buttons;
    if (soon) {
      buttons = '<a class="btn btn--signal" href="' + page + '#quick-order">Узнать о старте продаж</a>';
    } else if (model.price == null) {
      buttons = '<a class="btn btn--secondary" href="' + page + '#quick-order">Узнать цену</a>' +
        '<a class="btn btn--primary" href="' + page + '">Выбрать</a>';
    } else {
      buttons = '<a class="btn btn--primary" href="' + page + '">Выбрать</a>';
    }
    return '<article class="card card--model' + (soon ? " card--soon" : "") + '" data-model="' + esc(model.slug) + '">' +
      media +
      '<div class="card__body">' +
        '<div class="card__head">' +
          "<" + h + ' class="card__title"><a href="' + page + '">' + esc(displayName(model)) +
            (brand ? ' <span class="card__brand">| ' + esc(brand) + "</span>" : "") + "</a>" + nameFlag + "</" + h + ">" +
          (model.tagline ? '<p class="card__text">' + esc(model.tagline) + "</p>" : "") +
          (model.useCase ? '<p class="card__use">' + esc(model.useCase) + "</p>" : "") +
        "</div>" +
        renderStatRow(model) +
        '<p class="card__range"><span>Запас хода</span><b>' + fmtSpec(model, "rangeKm") + "</b></p>" +
        (opts.compact ? "" : tags) +
        (opts.compact ? "" : swatches) +
        '<div class="card__foot">' + priceHtml(model, { size: "sm" }) + '<div class="btn-row">' + buttons + "</div></div>" +
      "</div></article>";
  }

  /* ---------- таблица сравнения / характеристик ----------
     renderSpecTable(models, { compact, current: "gt", caption, keys: [...], select: true, price: true })
     Одна модель → вариант «характеристики модели» (две колонки, без кнопок). */
  var COMPACT_KEYS = ["powerKw", "speedKmh", "torqueNm", "capacityAh", "rangeKm", "seatMm", "weightKg"];
  function renderSpecTable(models, opts) {
    opts = opts || {};
    models = (models || MODELS).map(function (m) { return typeof m === "string" ? modelBySlug(m) : m; }).filter(Boolean);
    var single = models.length === 1;
    var keys = opts.keys || (opts.compact ? COMPACT_KEYS : SPEC_ROWS.map(function (r) { return r.key; }));
    var showPrice = opts.price !== false;
    var select = opts.select !== false && !single;
    var cur = opts.current || "";
    function cc(m) { return m.slug === cur ? ' class="is-current"' : ""; }

    var head = "<thead><tr>" + '<th scope="col">Характеристика</th>' +
      (single
        ? '<th scope="col">' + esc(models[0].name) + "</th>"
        : models.map(function (m) {
            return '<th scope="col"' + cc(m) + '><span class="spec-table__model"><a href="' + url(m.page) + '">' + esc(m.name) + "</a>" +
              (m.status === "soon" ? '<span><span class="badge badge--soon">Скоро</span></span>' : "") + "</span></th>";
          }).join("")) +
      "</tr></thead>";

    var rows = keys.map(function (k) {
      var r = rowFor(k);
      /* единица всегда в подписи строки («…, мм»), значения без единицы */
      var unitInLabel = r.unit ? '<span class="spec-table__unit">, ' + esc(r.unit) + "</span>" : "";
      /* таблица одной модели: своя подпись строки, если задана в model.specLabels (Lynx X — «Вес (с батареей)») */
      var own = single && models[0].specLabels && models[0].specLabels[k];
      var label = esc(own || r.label) + unitInLabel;
      return '<tr data-key="' + esc(k) + '"><th scope="row">' + label + "</th>" + models.map(function (m) {
        var html = fmtSpec(m, k, { unit: false });
        return "<td" + cc(m) + ">" + html + "</td>";
      }).join("") + "</tr>";
    });
    if (showPrice) {
      rows.push('<tr><th scope="row">Цена</th>' + models.map(function (m) {
        var p = m.price == null ? '<span class="muted">' + (m.status === "soon" ? "Скоро в продаже" + (launchText(m) ? "<br>" + esc(launchText(m)) : "") : "Цена по запросу") + "</span>" : fmtPrice(m.price) + flagHtml(flagsFor(m, "price"));
        return "<td" + cc(m) + ">" + p + "</td>";
      }).join("") + "</tr>");
    }
    var foot = "";
    if (select) {
      foot = "<tfoot><tr><td></td>" + models.map(function (m) {
        var btn;
        if (m.slug === cur) btn = '<span class="badge">Вы смотрите эту модель</span>';
        else if (m.status === "soon") btn = '<a class="btn btn--signal btn--sm" href="' + url(m.page) + '">Узнать о старте</a>';
        else btn = '<a class="btn btn--primary btn--sm" href="' + url(m.page) + '">Выбрать<span class="visually-hidden"> ' + esc(m.name) + "</span></a>";
        return "<td" + cc(m) + ">" + btn + "</td>";
      }).join("") + "</tr></tfoot>";
    }
    var cap = opts.caption ? "<caption>" + esc(opts.caption) + "</caption>" : "";
    var tableLabel = opts.caption || (single ? "Характеристики " + models[0].name : "Сравнение характеристик моделей");
    return '<div class="table-scroll" tabindex="0" role="region" aria-label="' + esc(tableLabel) + '">' +
      '<table class="spec-table' + (single ? " spec-table--single" : "") + (opts.compact ? " spec-table--compact" : "") + '">' +
      cap + head + "<tbody>" + rows.join("") + "</tbody>" + foot + "</table></div>" +
      (single ? "" : '<p class="table-hint">Таблица прокручивается вбок</p>');
  }

  /* ---------- шапка ---------- */
  function currentFile() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }
  function isCurrent(href) {
    if (!href || /^(https?:|#)/.test(href)) return false;
    var file = href.split("#")[0].split("/").pop();
    return file === currentFile() && href.indexOf("#") === -1;
  }
  function aCur(href) { return isCurrent(href) ? ' aria-current="page"' : ""; }

  /* «Доставка и оплата» в меню и подвале ведёт на блок главной (слайд 2), остальное — на страницы falcon-bike.ru */
  var CLIENT_MENU = [
    ["Доставка и оплата", "deliveryHome"],
    ["Инструкции", "instructions"],
    ["Рассрочка", "installment"],
    ["Гарантия", "warranty"],
    ["Запчасти и аксессуары", "parts"]
  ];
  var CLIENT_FOOTER = [
    ["Доставка и оплата", "deliveryHome"],
    ["Рассрочка", "installment"],
    ["Сборка и инструкции", "instructions"],
    ["Гарантия", "warranty"],
    ["Запчасти и аксессуары", "parts"],
    ["Вопрос-ответ", "faq"]
  ];
  /* Подвал (слайд 19): все значки одним компонентом .icon-tile, VK — только в соцсетях */
  var FOOTER_MESSENGERS = [["telegram", "Telegram"], ["whatsapp", "WhatsApp"]];
  var FOOTER_SOCIALS = [["rutube", "Rutube"], ["dzen", "Дзен"], ["vk", "ВКонтакте"]];
  /* знаки без внешнего кольца — для круглых плашек .icon-tile */
  var MARK = { telegram: "telegram-mark", whatsapp: "whatsapp", vk: "vk-mark", rutube: "rutube-mark", dzen: "dzen-mark" };

  /* «Y-Volt» с неразрывным дефисом (U+2011), чтобы не переносилось */
  function nbName(name) { return esc(name).replace(/Y-Volt/g, "Y\u2011Volt"); }

  function socialLink(kind, label, extraCls, iconId) {
    var href = LINKS[kind];
    var ic = icon(iconId || kind);
    if (!href) {
      return '<span class="icon-link is-pending' + (extraCls ? " " + extraCls : "") + '" role="img" aria-label="' + esc(label + ": ссылка уточняется") + '" title="' + esc(label + ": ссылку нужно уточнить") + '">' + ic + "</span>";
    }
    return '<a class="icon-link' + (extraCls ? " " + extraCls : "") + '" href="' + esc(href) + '"' + (ext(href) || ' target="_blank" rel="noopener"') + ' aria-label="' + esc(label) + '" title="' + esc(label) + '">' + ic + "</a>";
  }
  function messengers() {
    return '<div class="messengers">' + socialLink("telegram", "Telegram") + socialLink("whatsapp", "WhatsApp") + socialLink("vk", "ВКонтакте") + "</div>";
  }
  function iconTiles(list) {
    return list.map(function (x) { return socialLink(x[0], x[1], "icon-tile", MARK[x[0]]); }).join("");
  }
  function brandHtml() {
    return '<a class="brand" href="' + url("index.html") + '" aria-label="79BIKE · FALCON, официальный магазин 79BIKE в России, на главную">' +
      '<span class="brand__word">79BIKE <span>·</span> FALCON</span>' +
      '<span class="brand__plate">' + esc(get(CONTENT, ["header", "badge"], "Официальный магазин 79BIKE в России")) + "</span></a>";
  }

  var YVOLT_PAGE = "surge-v.html";
  function renderHeader() {
    var modelsLinks = MODELS.map(function (m) {
      var meta = m.status === "soon" ? '<span class="badge badge--soon">Скоро</span>' :
        '<span class="nav__meta">' + esc(fmtSpecText(m, "powerKw")) + "</span>";
      return '<li><a href="' + url(m.page) + '"' + aCur(m.page) + "><span>" + nbName(m.name) + "</span>" + meta + "</a></li>";
    }).join("");
    var clientLinks = CLIENT_MENU.map(function (c) {
      return '<li><a href="' + esc(url(LINKS[c[1]])) + '"' + ext(LINKS[c[1]]) + ">" + esc(c[0]) + "</a></li>";
    }).join("");
    var modelsMenuId = "nav-models", clientsMenuId = "nav-clients";
    var phoneLabel = get(CONTENT, ["header", "phoneLabel"], "Звоните или пишите");
    return '<header class="site-header" data-header>' +
      '<a class="skip-link" href="#main">К содержимому</a>' +
      '<div class="wrap site-header__bar">' +
        brandHtml() +
        '<nav class="site-nav" id="site-nav" aria-label="Основное меню">' +
          '<ul class="nav">' +
            /* «Главная» (слайд 3): на десктопе на главную ведёт логотип, пункт виден только в мобильном меню */
            '<li class="nav__item nav__item--mobile"><a class="nav__link" href="' + url("index.html") + '"' + aCur("index.html") + ">Главная</a></li>" +
            '<li class="nav__item nav__item--drop">' +
              '<button type="button" class="nav__link" aria-expanded="false" aria-controls="' + modelsMenuId + '">Модели' + icon("chevron-down") + "</button>" +
              '<ul class="nav__menu" id="' + modelsMenuId + '" hidden>' + modelsLinks +
                '<li><hr></li><li><a class="nav__all" href="' + url(LINKS.compare) + '"' + aCur(LINKS.compare) + ">Сравнение всех моделей</a></li>" +
              "</ul></li>" +
            '<li class="nav__item"><a class="nav__link" href="' + url(LINKS.picker) + '"' + aCur(LINKS.picker) + ">Подбор</a></li>" +
            '<li class="nav__item"><a class="nav__link" href="' + url(YVOLT_PAGE) + '"' + aCur(YVOLT_PAGE) + ">Y\u2011Volt</a></li>" +
            '<li class="nav__item"><a class="nav__link" href="' + url(LINKS.reviews) + '"' + aCur(LINKS.reviews) + ">Видеообзоры</a></li>" +
            '<li class="nav__item nav__item--drop">' +
              '<button type="button" class="nav__link" aria-expanded="false" aria-controls="' + clientsMenuId + '">Клиентам' + icon("chevron-down") + "</button>" +
              '<ul class="nav__menu" id="' + clientsMenuId + '" hidden>' + clientLinks + "</ul></li>" +
            '<li class="nav__item"><a class="nav__link" href="#contacts">Контакты</a></li>' +
          "</ul>" +
          '<div class="mobile-contacts">' +
            '<a class="header-phone" href="' + PHONE_HREF + '">' + PHONE + "</a>" +
            messengers() +
          "</div>" +
        "</nav>" +
        '<div class="header-contacts">' +
          '<a class="header-phone" href="' + PHONE_HREF + '">' + PHONE + "</a>" +
          messengers() +
        "</div>" +
        /* мобильная кнопка звонка: номер текстом во всплывашке (tel: может не сработать) */
        '<div class="header-call">' +
          '<button type="button" class="header-call__btn" aria-expanded="false" aria-controls="header-call-pop" aria-label="' + esc("Телефон: " + PHONE) + '" title="' + esc(PHONE) + '">' + icon("phone") + "</button>" +
          '<div class="header-call__pop" id="header-call-pop" hidden>' +
            '<p class="header-call__label">' + esc(phoneLabel) + "</p>" +
            '<a class="header-phone" href="' + PHONE_HREF + '">' + PHONE + "</a>" +
            messengers() +
          "</div>" +
        "</div>" +
        '<button type="button" class="burger" aria-expanded="false" aria-controls="site-nav" aria-label="Меню">' +
          icon("menu", "icon-open") + icon("close", "icon-close") +
        "</button>" +
      "</div></header>";
  }

  function renderFooter() {
    var copyright = get(CONTENT, ["footer", "copyright"], "FALCON-BIKE — официальный магазин 79BIKE в России · 2026");
    var about = get(CONTENT, ["footer", "about"], "Официальный магазин 79BIKE в России. Продаём электромотоциклы Falcon и Y-Volt с гарантией, доставкой по стране, сервисом и запчастями.");
    var cols = get(CONTENT, ["footer", "columns"], {});
    var modelLinks = MODELS.map(function (m) {
      return '<li><a href="' + url(m.page) + '">' + nbName(m.name) + "</a>" +
        (m.status === "soon" ? ' <span class="badge badge--soon">Скоро</span>' : "") + "</li>";
    }).join("") + '<li><a href="' + url(LINKS.compare) + '">Сравнение всех моделей</a></li>';
    var clientLinks = CLIENT_FOOTER.map(function (c) {
      return '<li><a href="' + esc(url(LINKS[c[1]])) + '"' + ext(LINKS[c[1]]) + ">" + esc(c[0]) + "</a></li>";
    }).join("");
    return '<footer class="site-footer">' +
      '<div class="wrap site-footer__cols">' +
        '<div class="footer-col footer-about">' + brandHtml() + "<p>" + nbName(about) + "</p></div>" +
        '<nav class="footer-col" aria-labelledby="f-models"><h2 id="f-models">' + esc(cols.models || "Модели") + "</h2><ul>" + modelLinks + "</ul></nav>" +
        '<nav class="footer-col" aria-labelledby="f-clients"><h2 id="f-clients">' + esc(cols.clients || "Клиентам") + "</h2><ul>" + clientLinks + "</ul></nav>" +
        '<div class="footer-col" id="contacts"><h2>' + esc(cols.contacts || "Контакты") + "</h2>" +
          '<ul class="footer-contacts">' +
            '<li><a class="header-phone" href="' + PHONE_HREF + '">' + PHONE + "</a></li>" +
            '<li><a href="mailto:' + EMAIL + '">' + EMAIL + "</a></li>" +
            '<li class="footer-addr"><span>' + esc(get(CONTENT, ["showroom", "addressShort"], "Москва, «Речников 21»")) + "</span>" +
              '<span class="muted">' + esc(get(CONTENT, ["showroom", "footerNote"], "Шоурум и тест-драйв — по записи, 12:00–20:00")) + "</span></li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
      '<div class="wrap site-footer__icons">' +
        '<div class="icon-group" role="group" aria-labelledby="f-msg"><p class="icon-group__label" id="f-msg">Мессенджеры</p>' +
          '<div class="icon-group__list">' + iconTiles(FOOTER_MESSENGERS) + "</div></div>" +
        '<div class="icon-group" role="group" aria-labelledby="f-soc"><p class="icon-group__label" id="f-soc">' + esc(cols.social || "Соцсети") + "</p>" +
          '<div class="icon-group__list">' + iconTiles(FOOTER_SOCIALS) + "</div></div>" +
      "</div>" +
      '<div class="wrap site-footer__legal">' +
        "<div><p>" + esc(copyright) + "</p>" +
        '<p class="mono">ИП Тимохов М. С. · ИНН 772472913812 · ОГРН 323774600734207</p>' +
        (get(CONTENT, ["legal", "text"], "") ? '<p class="site-footer__note">' + esc(get(CONTENT, ["legal", "text"], "")) + "</p>" : "") + "</div>" +
        '<p><a href="' + esc(url(LINKS.declaration)) + '"' + ext(LINKS.declaration) + '>Декларация соответствия</a> · <a href="' + esc(url(LINKS.warrantyPolicy)) + '"' + ext(LINKS.warrantyPolicy) + ">Гарантийная политика</a></p>" +
      "</div></footer>";
  }

  /* ---------- поведение шапки ---------- */
  function closeMenus(except) {
    document.querySelectorAll(".site-header .nav__link[aria-expanded]").forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      var m = document.getElementById(b.getAttribute("aria-controls"));
      if (m) m.hidden = true;
    });
  }
  function initHeader(host) {
    var header = host.querySelector("[data-header]");
    if (!header) return;
    var burger = header.querySelector(".burger");
    var callBtn = header.querySelector(".header-call__btn");
    var callPop = header.querySelector(".header-call__pop");
    function setCall(open) {
      if (!callBtn || !callPop) return;
      callBtn.setAttribute("aria-expanded", String(open));
      callPop.hidden = !open;
    }
    burger.addEventListener("click", function () {
      var open = !header.classList.contains("is-open");
      header.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Меню");
      if (open) setCall(false);
    });
    if (callBtn) callBtn.addEventListener("click", function () {
      var open = callBtn.getAttribute("aria-expanded") !== "true";
      setCall(open);
      if (open && header.classList.contains("is-open")) burger.click();
    });
    document.addEventListener("click", function (e) {
      if (callPop && !callPop.hidden && !e.target.closest(".header-call")) setCall(false);
    });
    header.querySelectorAll(".nav__link[aria-controls]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var menu = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") !== "true";
        closeMenus(btn);
        btn.setAttribute("aria-expanded", String(open));
        if (menu) menu.hidden = !open;
      });
    });
    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) closeMenus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (callPop && !callPop.hidden) { setCall(false); callBtn.focus(); return; }
      var openBtn = header.querySelector('.nav__link[aria-expanded="true"]');
      closeMenus();
      if (openBtn) openBtn.focus();
      else if (header.classList.contains("is-open")) { burger.click(); burger.focus(); }
    });
    // клик по пункту мобильного меню закрывает панель (якоря на той же странице)
    header.querySelector(".site-nav").addEventListener("click", function (e) {
      if (e.target.closest("a") && header.classList.contains("is-open")) {
        header.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- свотчи (делегирование) ---------- */
  function applySwatches(box) {
    var pick = function (g) {
      var b = box.querySelector('.swatch[data-group="' + g + '"][aria-pressed="true"]');
      return b ? b.getAttribute("data-color") : "";
    };
    var frame = pick("frame"), accent = pick("accent");
    var ids = (box.getAttribute("data-swatches-for") || "").split(/\s+/).filter(Boolean);
    ids.forEach(function (id) {
      var media = document.getElementById(id);
      if (!media) return;
      var name = media.getAttribute("data-model-name") || box.getAttribute("data-model-name") || "";
      var view = media.getAttribute("data-view") || "";
      var cap = captionFor(name, frame, accent, view);
      var c = media.querySelector("[data-media-caption]");
      if (c) c.textContent = cap;
      if (media.getAttribute("role") === "img") media.setAttribute("aria-label", "Заглушка. " + cap);
      media.setAttribute("data-color", frame || "");
    });
    box.dispatchEvent(new CustomEvent("swatch:change", { bubbles: true, detail: { frame: frame, accent: accent } }));
  }
  document.addEventListener("click", function (e) {
    var ch = e.target.closest && e.target.closest(".cchip");
    if (ch && !ch.disabled) {
      var bx = ch.closest("[data-photo-swatches]"); if (!bx) return;
      var sl = bx.getAttribute("data-slug"), list = photos(sl);
      var on = bx.querySelector('.swatch[aria-pressed="true"]'), now = colorById(sl, on ? on.getAttribute("data-photo-color") : list[0].id);
      var target = null;
      if (ch.hasAttribute("data-pick")) target = ch.getAttribute("data-pick");
      else {
        var fr = ch.hasAttribute("data-frame") ? ch.getAttribute("data-frame") : now.frame;
        var ac = ch.hasAttribute("data-accent") ? ch.getAttribute("data-accent") : (now.accent || "");
        var hit = list.filter(function (c) { return c.frame === fr && (c.accent || "") === ac; })[0] || list.filter(function (c) { return c.frame === fr; })[0];
        target = hit && hit.id;
      }
      var hb = target && bx.querySelector('.swatch[data-photo-color="' + target + '"]');
      if (hb) hb.click();
      return;
    }
    var sw = e.target.closest && e.target.closest(".swatch");
    if (!sw) return;
    if (sw.closest("[data-photo-swatches]")) { applyPhotoSwatch(sw); return; }
    var box = sw.closest("[data-swatches]");
    var group = sw.parentElement;
    group.querySelectorAll(".swatch").forEach(function (b) { b.setAttribute("aria-pressed", b === sw ? "true" : "false"); });
    var val = sw.closest(".swatches__group") && sw.closest(".swatches__group").querySelector("[data-swatch-value]");
    if (val) val.textContent = sw.getAttribute("data-color");
    if (box) applySwatches(box);
  });

  /* ---------- раскрывашки на кнопках (делегирование) ----------
     <button data-toggle aria-controls="more" aria-expanded="false"
             data-label-open="Свернуть" data-label-closed="Показать ещё"><span data-toggle-label>Показать ещё</span></button>
     <div id="more" hidden>…</div> */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-toggle]");
    if (!btn) return;
    var target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    var open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    target.hidden = !open;
    var lbl = btn.querySelector("[data-toggle-label]") || btn;
    var t = btn.getAttribute(open ? "data-label-open" : "data-label-closed");
    if (t && lbl === btn) btn.textContent = t; else if (t) lbl.textContent = t;
  });

  /* ---------- аккордеон: data-accordion="single" закрывает соседей ---------- */
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d || d.tagName !== "DETAILS" || !d.open) return;
    var acc = d.closest('[data-accordion="single"]');
    if (!acc) return;
    acc.querySelectorAll("details[open]").forEach(function (o) { if (o !== d) o.open = false; });
  }, true);

  /* Открыть пункт аккордеона по #якорю (id на <details>) */
  function openDetailsFromHash() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id || !/^[\w-]+$/.test(id)) return;
    var el = document.getElementById(id);
    if (el && el.tagName === "DETAILS") el.open = true;
  }

  /* ---------- табы ----------
     <div class="tabs" data-tabs [data-tabs-hash]>
       <div class="tabs__list" role="tablist" aria-label="…">
         <button class="tabs__tab" role="tab" id="tab-gt" aria-controls="panel-gt" data-hash="gt">GT</button> …
       </div>
       <div class="tabs__panel" role="tabpanel" id="panel-gt" aria-labelledby="tab-gt">…</div> …
     </div>
     #gt в адресе открывает таб с data-hash="gt". data-tabs-hash: клик по табу пишет #hash в адрес. */
  function selectTab(tab, opts) {
    opts = opts || {};
    var box = tab.closest("[data-tabs]");
    if (!box) return;
    var tabs = Array.prototype.filter.call(box.querySelectorAll('[role="tab"]'), function (t) { return t.closest("[data-tabs]") === box; });
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    if (opts.focus) tab.focus();
    if (opts.writeHash && box.hasAttribute("data-tabs-hash") && tab.getAttribute("data-hash") && history.replaceState) {
      history.replaceState(null, "", "#" + tab.getAttribute("data-hash"));
    }
    box.dispatchEvent(new CustomEvent("tabs:change", { bubbles: true, detail: { tab: tab, hash: tab.getAttribute("data-hash") } }));
  }
  function tabFromHash(box) {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (!h) return null;
    return box.querySelector('[role="tab"][data-hash="' + h.replace(/"/g, "") + '"]') ||
      box.querySelector('[role="tab"][aria-controls="' + h.replace(/"/g, "") + '"]');
  }
  function initTabs(scope) {
    (scope || document).querySelectorAll("[data-tabs]").forEach(function (box) {
      var fromHash = tabFromHash(box);
      if (box.getAttribute("data-ui-ready") === "1" && !fromHash) return;
      box.setAttribute("data-ui-ready", "1");
      box.querySelectorAll('[role="tabpanel"]').forEach(function (p) { if (!p.hasAttribute("tabindex")) p.tabIndex = 0; });
      var first = box.querySelector('[role="tab"][aria-selected="true"]') || box.querySelector('[role="tab"]');
      if (fromHash) {
        selectTab(fromHash);
        requestAnimationFrame(function () { box.scrollIntoView({ block: "start" }); });
      } else if (first) selectTab(first);
    });
  }
  document.addEventListener("click", function (e) {
    var tab = e.target.closest && e.target.closest('[data-tabs] [role="tab"]');
    if (tab) selectTab(tab, { writeHash: true });
  });
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest && e.target.closest('[data-tabs] [role="tab"]');
    if (!tab) return;
    var list = Array.prototype.slice.call(tab.parentElement.querySelectorAll('[role="tab"]'));
    var i = list.indexOf(tab), n = null;
    if (e.key === "ArrowRight") n = list[(i + 1) % list.length];
    else if (e.key === "ArrowLeft") n = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") n = list[0];
    else if (e.key === "End") n = list[list.length - 1];
    if (n) { e.preventDefault(); selectTab(n, { focus: true, writeHash: true }); }
  });
  window.addEventListener("hashchange", function () {
    document.querySelectorAll("[data-tabs]").forEach(function (box) {
      var t = tabFromHash(box);
      if (t) { selectTab(t); box.scrollIntoView({ block: "start" }); }
    });
    openDetailsFromHash();
  });

  /* ---------- демо-формы ----------
     <form class="form-inline js-demo-form" data-success="…">
       <input class="input input--tel" type="tel" name="phone" …> <button class="btn btn--primary">…</button>
       <p class="form-msg" role="status" aria-live="polite"></p>
     </form>
     Телефон: 10 цифр после +7/8 (начинается с 9 или 3/4/8 для городских). Остальные required-поля: не пустые. */
  function normalizePhone(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 11 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
    return d.length === 10 && /^[3489]/.test(d) ? d : null;
  }
  function formatPhone(d) {
    return "+7 (" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6, 8) + "-" + d.slice(8, 10);
  }
  function formMsg(form) {
    var m = form.querySelector(".form-msg");
    if (!m) {
      m = document.createElement("p");
      m.className = "form-msg";
      m.setAttribute("role", "status");
      m.setAttribute("aria-live", "polite");
      form.appendChild(m);
    }
    return m;
  }
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains("js-demo-form")) return;
    e.preventDefault();
    var msg = formMsg(form);
    msg.className = "form-msg";
    msg.textContent = "";
    var bad = null, badText = "";
    form.querySelectorAll("input, textarea, select").forEach(function (f) { f.removeAttribute("aria-invalid"); });
    form.querySelectorAll('input[type="tel"]').forEach(function (tel) {
      if (bad) return;
      var raw = String(tel.value || "").replace(/\D/g, "");
      var d = normalizePhone(tel.value);
      if (!raw) { bad = tel; badText = get(CONTENT, ["ui", "errors", "phoneEmpty"], "Введите номер телефона."); }
      else if (!d && raw.replace(/^[78](?=\d{10}$)/, "").length < 10) { bad = tel; badText = get(CONTENT, ["ui", "errors", "phoneShort"], "В номере не хватает цифр: нужно 10 цифр после +7."); }
      else if (!d) { bad = tel; badText = "Проверьте номер: нужен российский номер, например +7 (999) 900-55-88"; }
      else tel.value = formatPhone(d);
    });
    if (!bad) {
      form.querySelectorAll("[required]").forEach(function (f) {
        if (bad || f.type === "tel") return;
        if (f.type === "checkbox" ? !f.checked : !String(f.value || "").trim()) {
          bad = f;
          var lab = f.getAttribute("aria-label") || (f.labels && f.labels[0] && f.labels[0].textContent) || "поле";
          badText = "Заполните поле «" + String(lab).trim() + "»";
        }
      });
    }
    if (bad) {
      bad.setAttribute("aria-invalid", "true");
      msg.classList.add("is-error");
      msg.textContent = badText;
      bad.focus();
      return;
    }
    var ok = form.getAttribute("data-success") || "Заявка принята.";
    msg.classList.add("is-ok");
    msg.innerHTML = icon("check") + "<span>" + esc(ok) + " " + esc(PROTO_NOTE) + "</span>";
    form.dispatchEvent(new CustomEvent("demo:submitted", { bubbles: true }));
  });
  document.addEventListener("focusout", function (e) {
    var t = e.target;
    if (!t || t.type !== "tel" || !t.closest(".js-demo-form")) return;
    var d = normalizePhone(t.value);
    if (d) t.value = formatPhone(d);
  });

  /* ---------- спрайты inline ----------
     Внешний <use href="assets/icons.svg#id"> работает не везде (file://, строгий CSP).
     Пробуем загрузить icons.svg и bike.svg, вставить их символы в документ и переписать
     ссылки на локальные #id. Не получилось — остаются внешние ссылки. */
  var SPRITES = { "icons.svg": true, "bike.svg": true };
  var inlined = {};
  function spriteId(file, id) { return "sprite-" + file.replace(/\.svg$/, "") + "-" + id; }
  function rewriteUses(root) {
    var list = (root || document).querySelectorAll ? (root || document).querySelectorAll("use") : [];
    Array.prototype.forEach.call(list, function (u) {
      var h = u.getAttribute("href") || u.getAttribute("xlink:href") || "";
      var m = h.match(/([\w-]+\.svg)#([\w-]+)$/);
      /* символы инлайнятся с префиксом sprite-<файл>-, чтобы не конфликтовать с id секций страницы (#compare, #faq…) */
      var lid = m ? spriteId(m[1], m[2]) : "";
      if (!m || !inlined[m[1]] || !document.getElementById(lid)) return;
      u.setAttribute("href", "#" + lid);
      if (u.hasAttribute("xlink:href")) u.removeAttribute("xlink:href");
    });
  }
  function inlineSprites() {
    if (!window.fetch || location.protocol === "file:") return;
    var host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.insertBefore(host, document.body.firstChild);
    Object.keys(SPRITES).forEach(function (name) {
      fetch(url("assets/" + name)).then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); }).then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, "image/svg+xml");
        var syms = doc.querySelectorAll("symbol[id]");
        if (!syms.length) return;
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Array.prototype.forEach.call(syms, function (sym) {
          var lid = spriteId(name, sym.id);
          if (document.getElementById(lid)) return;
          var node = document.importNode(sym, true);
          node.setAttribute("id", lid);
          svg.appendChild(node);
        });
        host.appendChild(svg);
        inlined[name] = true;
        rewriteUses(document);
      }).catch(function () { /* оставляем внешние ссылки */ });
    });
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        if (!inlined["icons.svg"] && !inlined["bike.svg"]) return;
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.tagName && n.tagName.toLowerCase() === "use") rewriteUses(n.parentNode);
            else rewriteUses(n);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ---------- init ---------- */
  function init(scope) {
    initTabs(scope || document);
    initHeroVideos(scope || document);
  }

  function mountChrome() {
    var h = document.getElementById("site-header");
    if (h && !h.getAttribute("data-ui-ready")) {
      h.innerHTML = renderHeader();
      h.setAttribute("data-ui-ready", "1");
      initHeader(h);
    }
    var f = document.getElementById("site-footer");
    if (f && !f.getAttribute("data-ui-ready")) {
      f.innerHTML = renderFooter();
      f.setAttribute("data-ui-ready", "1");
    }
    var main = document.querySelector("main");
    if (main && !main.id) main.id = "main";
  }

  window.UI = {
    fmtPrice: fmtPrice,
    fmtSpec: fmtSpec,
    fmtSpecText: fmtSpecText,
    specRow: rowFor,
    flagsFor: flagsFor,
    flagHtml: flagHtml,
    modelBySlug: modelBySlug,
    priceHtml: priceHtml,
    hasOldPrice: hasOldPrice,
    saleBadge: saleBadge,
    captionFor: captionFor,
    renderModelCard: renderModelCard,
    renderStatRow: renderStatRow,
    renderSwatches: renderSwatches,
    renderSpecTable: renderSpecTable,
    launchText: launchText,
    mediaPlaceholder: mediaPlaceholder,
    photos: photos,
    photoFor: photoFor,
    photoMedia: photoMedia,
    heroVideo: heroVideo,
    initHeroVideos: initHeroVideos,
    renderPhotoSwatches: renderPhotoSwatches,
    renderGallery: renderGallery,
    galleryShow: galleryShow,
    icon: icon,
    url: url,
    esc: esc,
    init: init,
    selectTab: selectTab,
    models: MODELS,
    links: LINKS,
    PHONE: PHONE,
    EMAIL: EMAIL,
    RUTUBE: RUTUBE
  };

  mountChrome();
  inlineSprites();
  init(document);
  openDetailsFromHash();
  // второй проход после DOMContentLoaded: страница могла дорендерить табы в своём обработчике
  // (при defer readyState здесь "interactive", а DOMContentLoaded ещё впереди)
  if (document.readyState !== "complete") {
    document.addEventListener("DOMContentLoaded", function () { init(document); openDetailsFromHash(); });
    window.addEventListener("load", function () { init(document); });
  } else {
    setTimeout(function () { init(document); }, 0);
  }
  document.dispatchEvent(new CustomEvent("ui:ready"));
})();
