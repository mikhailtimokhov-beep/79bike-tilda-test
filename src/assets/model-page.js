/* falcon-bike.ru: прототип. Шаблон страницы модели. Агент «Модели».
   <body data-page="model" data-slug="gt"> → вся страница строится в <main id="model-page">.
   Цифры только из models.js (через хелперы UI), тексты из content.js с запасными значениями.
   Подключение: после models.js, photos.js, content.js, videos.js и app.js (defer):
     <script src="assets/model-page.js" defer></script>
*/
(function () {
  "use strict";

  function start() {
    var UI = window.UI;
    var body = document.body;
    var main = document.getElementById("model-page");
    if (!UI || !main || body.getAttribute("data-page") !== "model") return;
    var slug = body.getAttribute("data-slug") || "";
    var model = UI.modelBySlug(slug);
    if (!model) return;

    var C = window.CONTENT || {};
    var V = window.VIDEOS || {};
    var MC = (C.models && C.models[slug]) || {};
    var esc = UI.esc, icon = UI.icon;
    var NAME = model.name;
    var SEAT = model.specs && typeof model.specs.seatMm === "number" ? model.specs.seatMm : null;
    var soon = model.status === "soon";
    var noPrice = model.price == null;

    /* ---------- тексты ---------- */
    function get(path, fb) {
      var cur = C;
      for (var i = 0; i < path.length; i++) { if (cur == null) return fb; cur = cur[path[i]]; }
      return cur == null || cur === "" ? fb : cur;
    }
    function fill(s, vars) {
      vars = vars || {};
      return String(s == null ? "" : s).replace(/\{(\w+)\}/g, function (m, k) {
        if (k === "name") return NAME;
        if (k === "seat") return SEAT == null ? "" : UI.fmtSpecText(model, "seatMm", { unit: false });
        return vars[k] != null ? vars[k] : m;
      });
    }
    function T(path, fb, vars) { return fill(get(path, fb), vars); }
    var BTN = function (k, fb) { return get(["ui", "buttons", k], fb); };
    var EMPTY = get(["compareSection", "emptyValue"], "уточняется");
    var FLAG_TEXT = get(["ui", "badges", "flag"], "сверить");

    // слова с дефисом («Y-Volt») не переносим посередине
    function hx(t) { return esc(t).replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>'); }
    function head(id, title, sub, extra) {
      return '<div class="section__head' + (extra ? " section__head--row" : "") + '"><div class="stack" style="--stack:12px">' +
        "<h2 id=\"" + id + "\">" + hx(title) + "</h2>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>" + (extra || "") + "</div>";
    }
    function section(id, cls, inner, labelId) {
      return '<section class="section' + (cls ? " " + cls : "") + '" id="' + id + '" aria-labelledby="' + labelId + '"><div class="wrap">' + inner + "</div></section>";
    }

    /* ---------- форма по номеру: заказ / узнать цену / сообщить о старте ---------- */
    var ORDER = soon
      ? { title: T(["quickOrder", "notify", "title"], BTN("notifyLaunch", "Сообщить о старте продаж")),
          text: T(["quickOrder", "notify", "text"], "Оставьте телефон — сообщим, как только модель можно будет заказать."),
          button: T(["quickOrder", "notify", "button"], "Сообщить мне"),
          success: T(["quickOrder", "notify", "success"], "Готово! Мы сообщим, как только начнутся продажи.") }
      : noPrice
        ? { title: T(["quickOrder", "askPrice", "title"], BTN("askPrice", "Узнать цену")),
            text: T(["quickOrder", "askPrice", "text"], "Оставьте телефон — назовём актуальную цену, наличие цветов и условия рассрочки."),
            button: T(["quickOrder", "askPrice", "button"], BTN("askPrice", "Узнать цену")),
            success: T(["quickOrder", "askPrice", "success"], "Спасибо! Менеджер скоро позвонит и назовёт цену.") }
        : { title: T(["quickOrder", "title"], "Быстрый заказ — только номер"),
            text: T(["quickOrder", "text"], "Оставьте телефон — менеджер перезвонит, уточнит цвет, доставку и способ оплаты."),
            button: T(["quickOrder", "button"], "Заказать"),
            success: T(["quickOrder", "success"], "Спасибо! Заявка принята — менеджер скоро свяжется с вами.") };
    var DOCK_BTN = soon ? BTN("notifyLaunchShort", "Узнать о старте продаж") : noPrice ? BTN("askPrice", "Узнать цену") : BTN("quickOrder", "Быстрый заказ");
    /* Сообщение после отправки с названием модели (без скобок). app.js дописывает
       «В прототипе заявка никуда не отправляется». */
    var ORDER_DONE = soon
      ? T(["quickOrder", "notify", "successModel"], "Готово! Сообщим, как только начнутся продажи {name}.")
      : noPrice
        ? T(["quickOrder", "askPrice", "successModel"], "Спасибо! Менеджер позвонит и назовёт цену {name}.")
        : T(["quickOrder", "successModel"], "Спасибо! Менеджер свяжется с вами по поводу {name}.");

    function phoneForm(idSuffix, labelledBy) {
      return '<form class="form-inline js-demo-form" novalidate data-success="' + esc(ORDER_DONE) + '"' +
        (labelledBy ? ' aria-labelledby="' + labelledBy + '"' : "") + ">" +
        '<input class="input input--tel" type="tel" name="phone" id="phone-' + idSuffix + '" inputmode="tel" autocomplete="tel" placeholder="' +
          esc(get(["ui", "fields", "phone", "placeholder"], "+7 (___) ___-__-__")) + '" aria-label="' + esc(get(["ui", "fields", "phone", "label"], "Телефон")) + '" required>' +
        '<button class="btn ' + (soon ? "btn--signal" : "btn--primary") + '" type="submit">' + esc(ORDER.button) + "</button>" +
        '<p class="form-msg" role="status" aria-live="polite"></p></form>' +
        '<p class="form-note">' + esc(get(["ui", "consent"], "Нажимая кнопку, вы соглашаетесь на обработку персональных данных.")) + "</p>";
    }

    /* ---------- 1. первый экран ---------- */
    var hasPhotos = UI.photos(slug).length > 0;
    var heroMediaId = "hero-media";
    var corner = soon ? '<span class="badge badge--soon">' + esc(get(["ui", "badges", "soon"], "Скоро в продаже")) + "</span>" : UI.saleBadge(model);
    var heroMedia, heroSwatches;
    if (hasPhotos) {
      heroMedia = UI.photoMedia(slug, null, "side", { id: heroMediaId, eager: true, corner: corner });
      heroSwatches = UI.renderPhotoSwatches(slug, heroMediaId);
    } else {
      var f0 = (model.colors && model.colors.frame && model.colors.frame[0]) || "";
      var a0 = (model.colors && model.colors.accents && model.colors.accents[0]) || "";
      heroMedia = UI.mediaPlaceholder(UI.captionFor(NAME, f0, a0, "вид сбоку"), { id: heroMediaId, view: "вид сбоку", modelName: NAME, corner: corner });
      heroSwatches = UI.renderSwatches(model, heroMediaId);
    }

    var tags = (model.highlights || []).length
      ? '<ul class="tags" aria-label="Особенности">' + model.highlights.map(function (t) { return '<li class="tag">' + esc(t) + "</li>"; }).join("") + "</ul>"
      : "";
    // подпись веса: у Lynx X — «Вес (с батареей)» (model.specLabels в models.js), у остальных — «Вес»
    var WEIGHT_LABEL = (model.specLabels && model.specLabels.weightKg) || "Вес";
    var facts = '<dl class="mp-facts">' + [
      ["rangeKm", get(["bikesSection", "statLabels", "range"], "Запас хода")],
      ["weightKg", WEIGHT_LABEL],
      ["seatMm", "Сиденье"]
    ].map(function (f) {
      var label = f[1].charAt(0).toLocaleUpperCase("ru-RU") + f[1].slice(1);
      return "<div><dt>" + esc(label) + "</dt><dd>" + UI.fmtSpec(model, f[0]) + "</dd></div>";
    }).join("") + "</dl>";

    var grey = get(["greyImport"], {});
    var greyHtml = '<div class="notice">' + icon("alert") +
      '<p class="notice__title">' + esc(grey.title || "Покупайте только в официальном магазине") + "</p>" +
      '<p class="notice__text">' + esc(grey.textShort || grey.text || "Байки из других стран блокируются после активации, на них нет гарантии и техподдержки в России.") + "</p></div>";

    // soon (Lynx X): «Скоро в продаже» + «Старт продаж — 2027» — в UI.priceHtml
    var priceBlock = UI.priceHtml(model);
    var buyTop = '<div class="mp-buy__price">' + priceBlock +
      (soon ? "" : '<span class="badge badge--official">' + icon("shield") + "Официальная гарантия</span>") + "</div>";
    var cartBtn = (soon || noPrice) ? "" :
      '<div class="btn-row"><button type="button" class="btn btn--primary mp-cart" aria-pressed="false" data-label-on="В корзине">' + icon("cart") +
      "<span>" + esc(BTN("addToCart", "В корзину")) + "</span></button>" +
      '<a class="btn btn--secondary" href="compare.html#' + esc(slug) + '">' + icon("compare") + esc(BTN("compare", "Сравнить")) + "</a></div>" +
      '<p class="mp-cart-msg" role="status" aria-live="polite"></p>';
    var buy = '<div class="mp-buy' + (soon ? " mp-buy--soon" : "") + '" id="buy">' + buyTop + cartBtn +
      '<div class="mp-buy__form" id="quick-order">' +
        '<p class="mp-buy__form-title" id="qo-hero-title">' + esc(ORDER.title) + "</p>" +
        '<p class="mp-buy__form-text">' + esc(ORDER.text) + "</p>" +
        phoneForm("hero", "qo-hero-title") +
      "</div>" + greyHtml + "</div>";

    var subnav = [
      ["video", "Видео"], ["specs", "Характеристики"], ["photos", "Фото"], ["size", "Размеры"],
      ["reviews", "Обзоры"], ["compare", "Сравнение"], ["delivery", "Доставка"], ["faq", "Вопросы"]
    ].map(function (s) { return '<a class="btn btn--secondary btn--sm" href="#' + s[0] + '">' + esc(s[1]) + "</a>"; }).join("");

    /* Раскладка первого экрана.
       ≥1024 px: слева фото + свотчи + паспорт (цифры-герои, запас хода/вес/сиденье, теги) — колонка
       по высоте близка к правой (заголовок + блок покупки), пустого места под фото нет.
       <1024 px: колонки-обёртки «растворяются» (display: contents) и блоки идут в порядке
       фото → заголовок → цифры → покупка (см. model-page.css). В DOM заголовок идёт первым. */
    var heroHtml = '<section class="mp-hero" id="main" aria-labelledby="mp-h1"><div class="wrap">' +
      '<nav class="mp-crumbs" aria-label="Навигация"><a href="index.html">Главная</a><span aria-hidden="true">/</span>' +
        '<a href="compare.html">Модели</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(NAME) + "</span></nav>" +
      '<div class="mp-hero__grid">' +
        '<div class="mp-hero__info">' +
          '<div class="mp-hero__intro">' +
            '<h1 class="mp-title" id="mp-h1">' + hx(MC.h1 || "Электромотоцикл " + NAME) + UI.flagHtml(UI.flagsFor(model, "name")) + "</h1>" +
            '<p class="lead">' + esc(MC.lead || model.tagline || "") + "</p>" +
          "</div>" +
          buy +
        "</div>" +
        '<div class="mp-hero__media">' +
          '<div class="mp-hero__photo">' + heroMedia + heroSwatches + "</div>" +
          '<div class="mp-hero__specs">' + UI.renderStatRow(model, { hero: true }) + facts + tags + "</div>" +
        "</div>" +
      "</div>" +
      '<nav class="mp-subnav" aria-label="Разделы страницы">' + subnav + "</nav>" +
      "</div></section>";

    /* ---------- 2. основное видео ---------- */
    var mainVideo = section("video", "section--alt", head("h-video", T(["modelPage", "video", "title"], "{name} в движении")) +
      '<div class="mp-video">' + UI.mediaPlaceholder(T(["modelPage", "video", "caption"], "Видео: основной обзор {name}"),
        { video: true, ratio: "wide", href: V.channel || UI.RUTUBE }) + "</div>" +
      '<p class="form-note">Ролик откроется на канале 79BIKE в Rutube.</p>', "h-video");

    /* ---------- 3. характеристики ---------- */
    var bodyText = (Array.isArray(MC.body) && MC.body.length ? MC.body : [MC.lead || model.tagline || ""])
      .map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    /* строки таблицы: все SPEC_ROWS + дополнительные (SPEC_EXTRA_ROWS), если у модели есть значение
       (у Surge V — номинальная мощность, энергоёмкость батареи, тип тормозов, нагрузка); размеры — в блоке «Размеры» */
    var SPECS = model.specs || {};
    var specKeys = (window.SPEC_ROWS || []).map(function (r) { return r.key; });
    (window.SPEC_EXTRA_ROWS || []).forEach(function (r) {
      if (r.size || SPECS[r.key] == null) return;
      var at = specKeys.indexOf(r.after);
      if (at === -1) specKeys.push(r.key); else specKeys.splice(at + 1, 0, r.key);
    });
    var specs = section("specs", "", head("h-specs", T(["modelPage", "specs", "title"], "Характеристики {name}"), T(["modelPage", "specs", "subtitle"], "")) +
      '<div class="mp-specs"><div class="mp-specs__text">' + bodyText + "</div>" +
      "<div>" + UI.renderSpecTable([model], { keys: specKeys }) + "</div></div>", "h-specs");

    /* ---------- 4. галерея ---------- */
    var gallery = section("photos", "section--alt", head("h-photos", T(["modelPage", "gallery", "title"], "Фото {name}"), T(["modelPage", "gallery", "subtitle"], "")) +
      UI.renderGallery(slug, { id: "gallery", eager: false }) +
      (hasPhotos ? '<div class="mp-galalt" id="gallery-alt" hidden></div>' : ""), "h-photos");

    /* ---------- 5. размеры и рост ---------- */
    /* Кадр схемы: узкий (только байк) и широкий (байк + райдер до 200 см слева). */
    var VB_BIKE = { x: 60, y: 110, w: 1540, h: 970 };
    var VB_RIDER = { x: -560, y: -560, w: 2160, h: 1630 };
    var VB = VB_BIKE;
    var G = 898, SEAT_Y = 334, SEAT_X = 720;
    function pct(x, y) { return "left:" + ((x - VB.x) / VB.w * 100).toFixed(2) + "%;top:" + ((y - VB.y) / VB.h * 100).toFixed(2) + "%"; }
    function label(x, y, full, short, cls) {
      return '<span class="mp-draw__label' + (cls ? " " + cls : "") + '" data-x="' + x + '" data-y="' + y + '" style="' + pct(x, y) + '"><span class="mp-lf">' + full + '</span><span class="mp-ls">' + short + "</span></span>";
    }
    function setFrame(vb) {
      VB = vb;
      var svg = main.querySelector(".mp-draw__svg");
      if (svg) svg.setAttribute("viewBox", [vb.x, vb.y, vb.w, vb.h].join(" "));
      main.querySelectorAll(".mp-draw__label[data-x]").forEach(function (l) {
        l.setAttribute("style", pct(+l.getAttribute("data-x"), +l.getAttribute("data-y")));
      });
    }
    var flagUnknown = UI.flagHtml(["Размера нет в данных производителя — уточнить"]);
    /* размеры из models.js: колёсная база, габариты (длина, высота) — где есть */
    var DIM = SPECS.dimensions || {};
    function mmNum(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f"); }
    function dimLabel(v, name, shortName, key) {
      if (v == null) {
        var f = key ? UI.flagsFor(model, key) : [];
        return { full: name + " · " + EMPTY + (f.length ? UI.flagHtml(f) : flagUnknown), short: shortName + " —", known: false };
      }
      return { full: name + " · " + mmNum(v) + "\u00a0мм", short: shortName + " " + mmNum(v), known: true };
    }
    var dH = dimLabel(DIM.heightMm, "Габаритная высота", "Высота");
    var dWB = dimLabel(SPECS.wheelbaseMm, "Колёсная база", "База", "wheelbaseMm");
    var dL = dimLabel(DIM.lengthMm, "Длина", "Длина");
    var unknownDims = [[dL, "длина"], [dWB, "колёсная база"], [dH, "габаритная высота"]].filter(function (d) { return !d[0].known; }).map(function (d) { return d[1]; });
    var seatTxt = SEAT == null ? "" : esc(UI.fmtSpecText(model, "seatMm"));
    var seatFull = "Высота сиденья " + (SEAT == null ? EMPTY + UI.flagHtml(UI.flagsFor(model, "seatMm").length ? UI.flagsFor(model, "seatMm") : ["Нет данных в таблице характеристик"]) : seatTxt + UI.flagHtml(UI.flagsFor(model, "seatMm")));
    var seatShort = SEAT == null ? "Сиденье —" : "Сиденье " + seatTxt;
    var drawSvg =
      '<svg class="mp-draw__svg" viewBox="' + [VB.x, VB.y, VB.w, VB.h].join(" ") + '" aria-hidden="true" focusable="false">' +
        '<path class="mp-ground" d="M' + (VB.x + 20) + " " + G + "H" + (VB.x + VB.w - 20) + '"/>' +
        '<svg class="mp-draw__bike" x="0" y="0" width="1600" height="1000" viewBox="0 0 1600 1000"><use href="' + UI.url("assets/bike.svg#bike") + '"></use></svg>' +
        /* высота сиденья */
        '<g class="mp-dim mp-dim--seat">' +
          '<line class="mp-ext" x1="' + (SEAT_X) + '" y1="' + SEAT_Y + '" x2="120" y2="' + SEAT_Y + '"/>' +
          '<line x1="170" y1="' + SEAT_Y + '" x2="170" y2="' + G + '"/>' +
          '<path d="M150 ' + (SEAT_Y + 26) + "L170 " + SEAT_Y + "L190 " + (SEAT_Y + 26) + "M150 " + (G - 26) + "L170 " + G + "L190 " + (G - 26) + '"/>' +
        "</g>" +
        /* габаритная высота */
        '<g class="mp-dim">' +
          '<line class="mp-ext" x1="1000" y1="180" x2="1540" y2="180"/>' +
          '<line class="mp-ext" x1="1440" y1="' + G + '" x2="1540" y2="' + G + '"/>' +
          '<line x1="1500" y1="180" x2="1500" y2="' + G + '"/>' +
          '<path d="M1480 206L1500 180L1520 206M1480 ' + (G - 26) + "L1500 " + G + "L1520 " + (G - 26) + '"/>' +
        "</g>" +
        /* колёсная база и длина */
        '<g class="mp-dim">' +
          '<line class="mp-ext" x1="420" y1="690" x2="420" y2="975"/><line class="mp-ext" x1="1215" y1="690" x2="1215" y2="975"/>' +
          '<line x1="420" y1="950" x2="1215" y2="950"/>' +
          '<path d="M446 930L420 950L446 970M1189 930L1215 950L1189 970"/>' +
          '<line class="mp-ext" x1="220" y1="' + (G + 10) + '" x2="220" y2="1055"/><line class="mp-ext" x1="1421" y1="' + (G + 10) + '" x2="1421" y2="1055"/>' +
          '<line x1="220" y1="1030" x2="1421" y2="1030"/>' +
          '<path d="M246 1010L220 1030L246 1050M1395 1010L1421 1030L1395 1050"/>' +
        "</g>" +
        '<g class="mp-rider" id="mp-rider" hidden></g>' +
      "</svg>";
    var drawLabels =
      label(170, (SEAT_Y + G) / 2, seatFull, seatShort, "mp-draw__label--v mp-draw__label--seat") +
      label(1500, (180 + G) / 2, dH.full, dH.short, "mp-draw__label--v") +
      label(817, 950, dWB.full, dWB.short) +
      label(820, 1030, dL.full, dL.short) +
      '<span class="mp-draw__label mp-draw__label--rider" id="mp-rider-label" hidden></span>';
    /* Таблица размеров: длина, высота, ширина руля, база, клиренс, сиденье — всё из models.js.
       Нет значения → «уточняется» + метка «сверить». */
    function mmCell(v, key) {
      if (v == null) {
        var f = key ? UI.flagsFor(model, key) : [];
        return esc(EMPTY) + (f.length ? UI.flagHtml(f) : flagUnknown);
      }
      return '<span class="nowrap">' + mmNum(v) + " мм</span>" + (key ? UI.flagHtml(UI.flagsFor(model, key)) : "");
    }
    var HB = SPECS.handlebarMm != null ? SPECS.handlebarMm : null;
    var sizeRows = [
      ["Длина", mmCell(DIM.lengthMm)],
      ["Габаритная высота", mmCell(DIM.heightMm)],
      ["Ширина руля", mmCell(HB)],
      ["Колёсная база", mmCell(SPECS.wheelbaseMm, "wheelbaseMm")],
      ["Клиренс", mmCell(SPECS.clearanceMm, "clearanceMm")],
      ["Высота сиденья", UI.fmtSpec(model, "seatMm")]
    ];
    // габаритная ширина отличается от руля (Lynx X: 805 и 800 мм) — показываем габариты целиком
    if (DIM.widthMm != null && HB != null && DIM.widthMm !== HB) sizeRows.push(["Габариты (Д × Ш × В)", UI.fmtSpec(model, "dimensions")]);
    sizeRows.push(["Колёса", UI.fmtSpec(model, "wheels")], [WEIGHT_LABEL, UI.fmtSpec(model, "weightKg")]);
    if (SPECS.payloadKg != null) sizeRows.push(["Максимальная нагрузка", UI.fmtSpec(model, "payloadKg")]);
    var sizeList = '<dl class="kv">' + sizeRows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>";

    // «ориентир, а не правило» — только в heightNote (из content.js); вторая фраза — без повтора
    var heightNote = get(["ui", "height", "note"], "Это ориентир, а не правило: посадка зависит ещё и от длины ног и опыта.");
    var tryLive = get(["ui", "height", "tryLive"], "Лучше примерить в шоуруме — тест-драйв по записи.");
    var heightPanel = SEAT == null
      ? '<div class="notice notice--info">' + icon("ruler") +
          '<p class="notice__title">Высота сиденья ' + esc(NAME) + " уточняется" + UI.flagHtml(["Нет в таблице характеристик"]) + "</p>" +
          '<p class="notice__text">Поэтому подсказку по росту пока не показываем. Менеджер назовёт размеры и подскажет, подойдёт ли посадка при вашем росте. ' + esc(tryLive) + "</p></div>" +
          '<a class="btn btn--secondary" href="#quick-order">' + icon("phone") + "Спросить менеджера о размерах</a>"
      : '<button type="button" class="btn btn--secondary" id="mp-height-btn" aria-expanded="false" aria-controls="mp-height">' + icon("ruler") +
          "<span>" + esc(T(["modelPage", "size", "button"], BTN("showHeight", "Показать рост"))) + "</span></button>" +
        '<div class="mp-height" id="mp-height" hidden>' +
          '<div class="mp-height__head"><label for="mp-height-range">' + esc(get(["ui", "height", "label"], "Ваш рост")) + "</label>" +
            '<span class="mp-height__val" aria-hidden="true"><b id="mp-height-out">175</b><span>' + esc(get(["ui", "height", "unit"], "см")) + "</span></span></div>" +
          '<input type="range" id="mp-height-range" min="150" max="200" step="1" value="175" aria-describedby="mp-fit">' +
          '<div class="mp-height__scale" aria-hidden="true"><span>150</span><span>175</span><span>200</span></div>' +
          '<p class="mp-fit" id="mp-fit" role="status" aria-live="polite"></p>' +
          '<div class="mp-fit-links" id="mp-fit-links"></div>' +
          '<p class="mp-hint">' + esc(heightNote) + " <b>" + esc(tryLive) + "</b></p>" +
        "</div>";
    var sizeSub = SEAT == null ? "Высоту сиденья и габариты " + NAME + " уточняйте у менеджера." : T(["modelPage", "size", "subtitle"], "Высота сиденья — {seat} мм.");

    /* Схема размеров производителя (assets/sizes/<slug>.webp, models.js → sizeImage): фото байка на тёмном фоне
       с подписанными размерами — тёмная в обеих темах. Нет схемы (Lynx X, Surge V) → условный силуэт со значениями. */
    var SIZE_IMG = model.sizeImage && model.sizeImage.src ? model.sizeImage : null;
    var sizeFigure;
    if (SIZE_IMG) {
      var schemaSeat = SIZE_IMG.seatMm != null ? SIZE_IMG.seatMm : SEAT;
      var altParts = [
        DIM.lengthMm != null ? "длина " + DIM.lengthMm + " мм" : "",
        DIM.heightMm != null ? "общая высота " + DIM.heightMm + " мм" : "",
        HB != null ? "ширина руля " + HB + " мм" : "",
        SPECS.wheelbaseMm != null ? "колёсная база " + SPECS.wheelbaseMm + " мм" : "",
        SPECS.clearanceMm != null ? "клиренс " + SPECS.clearanceMm + " мм" : "",
        schemaSeat != null ? "высота сиденья " + schemaSeat + " мм" : ""
      ].filter(Boolean);
      var seatDiff = schemaSeat != null && SEAT != null && schemaSeat !== SEAT;
      sizeFigure = '<figure class="mp-sizeimg">' +
        '<img src="' + esc(UI.url(SIZE_IMG.src)) + '" alt="' + esc("Размеры " + NAME + ": " + altParts.join(", ")) + '" loading="lazy" decoding="async" width="1600" height="1200">' +
        "<figcaption>Схема размеров " + esc(NAME) + " — данные производителя." +
          (seatDiff ? " Высота сиденья на схеме — " + mmNum(schemaSeat) + " мм, в таблице характеристик — " + mmNum(SEAT) + " мм: уточняем." + UI.flagHtml(UI.flagsFor(model, "seatMm")) : "") +
        "</figcaption></figure>";
    } else {
      sizeFigure = '<figure class="mp-draw"><div class="mp-draw__canvas">' + drawSvg + drawLabels + "</div>" +
        "<figcaption>" + (SEAT == null
          ? "Схема: условный силуэт байка. Размеры " + esc(NAME) + " ещё не подтверждены."
          : "Схема: условный силуэт байка. Кнопка «Показать рост» добавит райдера в масштабе по высоте сиденья." +
            (unknownDims.length ? " Ещё не подтверждены: " + unknownDims.join(", ") + "." : " Размеры — данные производителя.")) +
        "</figcaption></figure>";
    }
    var size = section("size", "", head("h-size", T(["modelPage", "size", "title"], "Размеры и рост райдера"), sizeSub) +
      '<div class="mp-size' + (SIZE_IMG ? " mp-size--img" : "") + '">' + sizeFigure +
        '<div class="mp-size__side">' + sizeList + heightPanel + "</div>" +
      "</div>", "h-size");

    /* ---------- 6. аксессуары ---------- */
    var partsUrl = (UI.links && UI.links.parts) || "https://falcon-bike.ru/accessories";
    var accIcons = ["helmet", "shield-body", "charger", "phone-mount"]; // порядок = items: шлем, защита, зарядка, держатель
    var accItems = get(["modelPage", "accessories", "items"], [
      { title: "Шлем", text: "Кроссовый шлем под ваш размер." },
      { title: "Защита", text: "Наколенники, налокотники и защита корпуса." },
      { title: "Зарядное устройство", text: "Запасное штатное — для дачи или гаража." },
      { title: "Держатель телефона", text: "Навигация и музыка всегда перед глазами." }
    ]).slice(0, 4);
    var acc = section("accessories", "section--alt", head("h-acc", T(["modelPage", "accessories", "title"], "Аксессуары и экипировка"), T(["modelPage", "accessories", "subtitle"], ""),
        '<a class="btn btn--secondary" href="' + esc(partsUrl) + '" target="_blank" rel="noopener">' + esc(T(["modelPage", "accessories", "button"], "Подобрать аксессуары")) + icon("external") + "</a>") +
      '<div class="mp-acc-grid">' + accItems.map(function (a, i) {
        return '<a class="card mp-acc" href="' + esc(partsUrl) + '" target="_blank" rel="noopener">' +
          UI.mediaPlaceholder(lcFirst(a.title), { icon: accIcons[i] || "box" }) +
          '<div class="card__body"><h3 class="card__title">' + esc(a.title) + '</h3><p class="card__text">' + esc(a.text) + "</p></div></a>";
      }).join("") + "</div>", "h-acc");
    function lcFirst(s) { s = String(s || ""); return s.charAt(0).toLocaleLowerCase("ru-RU") + s.slice(1); }

    /* ---------- 7. видеообзоры модели ---------- */
    /* ТЗ, слайд 24: 2 закреплённых обзора модели, «далее подтяжка с Rutube последних» —
       4 свежих ролика канала (сначала про эту модель, потом остальные) + «Смотреть ещё» → reviews.html#<slug> */
    var pinned = (V.pinned && V.pinned[slug]) || [];
    var FRESH_ALL = (Array.isArray(V.fresh) ? V.fresh : []).slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
    var freshFeed = FRESH_ALL.filter(function (v) { return v.slug === slug; })
      .concat(FRESH_ALL.filter(function (v) { return v.slug !== slug; })).slice(0, 4);
    var MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    function fmtDate(iso) {
      var d = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
      return d ? parseInt(d[3], 10) + " " + MONTHS[parseInt(d[2], 10) - 1] : "";
    }
    function shortName(m) { return String(m.name).replace(/^(Falcon|Y-Volt)\s+/, ""); }
    function freshCard(v) {
      var vm = UI.modelBySlug(v.slug);
      var href = v.url || V.channel || UI.RUTUBE;
      var date = fmtDate(v.date);
      return '<li class="mp-fresh__item">' +
        UI.mediaPlaceholder(v.title, { video: true, href: href, duration: v.duration }) +
        '<div class="mp-fresh__body"><h4 class="mp-fresh__title"><a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(v.title) + "</a></h4>" +
          '<p class="mp-fresh__meta">' + (vm ? '<span class="badge' + (v.slug === slug ? " mp-fresh__cur" : "") + '">' + esc(shortName(vm)) + "</span>" : "") +
            (date ? '<time datetime="' + esc(v.date) + '">' + esc(date) + "</time>" : "") + "</p></div></li>";
    }
    var revMore = '<a class="btn btn--secondary" href="reviews.html#' + esc(slug) + '">' + esc(T(["modelPage", "reviews", "more"], BTN("more", "Смотреть ещё"))) + icon("chevron-right") + "</a>";
    var freshHtml = freshFeed.length
      ? '<div class="mp-fresh" role="group" aria-labelledby="h-rev-fresh">' +
          '<div class="mp-fresh__head"><h3 id="h-rev-fresh">' + esc(T(["modelPage", "reviews", "freshTitle"], "Свежие с Rutube")) + "</h3>" +
            '<p class="proto-note">' + esc(T(["reviews", "tildaNote"], "В Tilda — виджет канала Rutube (подгружает новые ролики автоматически).")) + "</p></div>" +
          '<ul class="mp-fresh__list">' + freshFeed.map(freshCard).join("") + "</ul>" +
        "</div>"
      : "";
    var reviews = section("reviews", "", head("h-rev", T(["modelPage", "reviews", "title"], "Видеообзоры {name}"), T(["modelPage", "reviews", "subtitle"], "")) +
      (pinned.length
        ? '<div class="grid-2 mp-reviews">' + pinned.slice(0, 2).map(function (v) {
            return '<figure class="media-figure">' + UI.mediaPlaceholder(v.title, { video: true, href: v.url, duration: v.duration }) +
              "<figcaption>" + esc(v.title) + "<span>Закреплённый обзор · Rutube" + (v.duration ? " · " + esc(v.duration) : "") + "</span></figcaption></figure>";
          }).join("") + "</div>" +
          '<p class="proto-note">' + esc(T(["reviews", "pinnedNote"], "Закреплённые ролики — самые популярные ролики модели из группы ВКонтакте 79BIKE (подберём в конце проекта).")) + "</p>"
        : '<p class="muted">Обзоры этой модели скоро появятся на канале.</p>') +
      freshHtml +
      '<div class="mp-fresh__more">' + revMore + "</div>", "h-rev");

    /* ---------- 8. сравнение ---------- */
    var cmpLink = '<a class="btn btn--secondary" href="compare.html#' + esc(slug) + '">' + icon("compare") + esc(T(["modelPage", "compare", "link"], "Полное сравнение всех моделей")) + "</a>";
    var compare = section("compare", "section--alt", head("h-cmp", T(["modelPage", "compare", "title"], "{name} и другие модели"), T(["modelPage", "compare", "subtitle"], ""), cmpLink) +
      UI.renderSpecTable(UI.models, { compact: true, current: slug }), "h-cmp");

    /* ---------- 9. другие модели ---------- */
    var others = section("others", "", head("h-others", T(["modelPage", "others", "title"], "Другие модели"), T(["modelPage", "others", "subtitle"], "")) +
      '<div class="rail">' + UI.models.filter(function (m) { return m.slug !== slug; }).map(function (m) {
        return UI.renderModelCard(m, { headingLevel: 3, showTags: false });
      }).join("") + "</div>", "h-others");

    /* ---------- 10. расчёт доставки ---------- */
    // TODO: интеграция СДЭК (отдельная задача) — пока форма уходит менеджеру, он присылает расчёт в WhatsApp
    var dc = get(["deliveryCalc"], {});
    var calcResult = dc.result || "Город: {city}. Менеджер рассчитает доставку и пришлёт стоимость в WhatsApp.";
    /* Текст результата с городом; app.js дописывает «В прототипе заявка никуда не отправляется» */
    function calcDone(city) {
      var s = String(fill(calcResult, { city: city })).trim();
      return /[.!?…]$/.test(s) ? s : s + ".";
    }
    var calc = section("delivery", "section--alt",
      '<div class="mp-calc">' +
        head("h-calc", T(["modelPage", "deliveryCalc", "title"], dc.title || "Рассчитать доставку в ваш город"), dc.subtitle || "") +
        '<form class="js-demo-form" id="mp-calc-form" novalidate data-success="' + esc(calcDone("ваш город")) + '" aria-labelledby="h-calc">' +
          '<label class="field"><span class="field__label">' + esc(dc.field || "Город") + '</span><input class="input" name="city" autocomplete="address-level2" placeholder="' + esc(dc.placeholder || "Например, Екатеринбург") + '" required></label>' +
          '<label class="field"><span class="field__label">Телефон для WhatsApp</span><input class="input input--tel" type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="' + esc(get(["ui", "fields", "phone", "placeholder"], "+7 (___) ___-__-__")) + '" required></label>' +
          '<button class="btn btn--primary" type="submit">' + icon("calculator") + esc(dc.button || BTN("calcDelivery", "Рассчитать")) + "</button>" +
          '<p class="form-msg" role="status" aria-live="polite"></p>' +
        "</form>" +
      "</div>", "h-calc");

    /* ---------- 11. оплата и доставка ---------- */
    var dl = get(["delivery"], {});
    function list(items) {
      return '<ul class="mp-list">' + (items || []).map(function (i) { return "<li><b>" + esc(i.title) + "</b><span>" + esc(i.text) + "</span></li>"; }).join("") + "</ul>";
    }
    var links = UI.links || {};
    var SR = get(["showroom"], {}), WR = get(["warranty"], {});
    var pay = section("payment", "",
      head("h-pay", T(["modelPage", "payment", "title"], dl.title || "Оплата и доставка"), "") +
      '<div class="mp-pay">' +
        '<div class="mp-pay__col"><h3>' + icon("card") + "Оплата</h3>" + list(dl.payment || [
          { title: "Картой онлайн", text: "Банковской картой через ЮKassa." },
          { title: "В рассрочку", text: "Менеджер рассчитает ежемесячный платёж." },
          { title: "Обсудить с менеджером", text: "Договоримся при звонке." }]) + "</div>" +
        '<div class="mp-pay__col"><h3>' + icon("truck") + "Доставка</h3>" + list(dl.shipping || [
          { title: "СДЭК до пункта выдачи", text: "Стоимость и срок рассчитаем по вашему городу." },
          { title: "СДЭК курьером до двери", text: "Курьер СДЭК привезёт байк к дому." },
          { title: "Самовывоз в Москве", text: "Из шоурума «Речников 21» — по предварительной договорённости." }]) + "</div>" +
      "</div>" +
      /* шоурум и гарантия — CONTENT.showroom / CONTENT.warranty */
      '<div class="mp-pay mp-pay--extra">' +
        '<div class="mp-pay__col mp-pay__card"><h3>' + icon("pin") + esc(SR.title || "Шоурум и тест-драйв в Москве") + "</h3>" +
          '<p class="mp-pay__lead">' + esc(SR.address || "Москва, бизнес-пространство «Речников 21»") + "</p>" +
          "<p>" + esc(SR.text || "Визит строго по предварительной договорённости. Тест-драйв — по записи.") + "</p>" +
          (SR.hours ? '<p class="mp-pay__meta">' + esc(SR.hours) + "</p>" : "") + "</div>" +
        '<div class="mp-pay__col mp-pay__card"><h3>' + icon("shield") + esc(WR.title || "Гарантия 6 месяцев") + "</h3>" +
          "<p>" + esc(WR.text || "На контроллер, батарею, двигатель и раму.") + "</p>" +
          '<p><a href="' + esc(WR.url || links.warranty || "https://falcon-bike.ru/warranty") + '" target="_blank" rel="noopener">' + esc(WR.linkText || "Условия гарантии") + icon("external") + "</a></p></div>" +
      "</div>" +
      '<div class="mp-pay-note"><p>' + esc(dl.note || "") + '</p><div class="btn-row">' +
        '<a class="btn btn--ghost" href="' + esc(links.delivery || "https://falcon-bike.ru/pay") + '" target="_blank" rel="noopener">Подробнее о доставке</a>' +
        '<a class="btn btn--ghost" href="' + esc(links.installment || "https://falcon-bike.ru/rassrochka") + '" target="_blank" rel="noopener">Условия рассрочки</a>' +
      "</div></div>", "h-pay");

    /* ---------- 12. повтор быстрого заказа ---------- */
    var order = '<section class="section section--tight" id="order" aria-labelledby="h-order"><div class="wrap">' +
      '<div class="mp-order' + (soon ? " mp-order--soon" : "") + '"><div>' +
        '<h2 id="h-order">' + esc(soon || noPrice ? ORDER.title + ": " + NAME : T(["modelPage", "quickOrder", "title"], ORDER.title)) + "</h2>" +
        "<p>" + esc(ORDER.text) + "</p></div>" +
        "<div>" + UI.priceHtml(model, { size: "sm" }).replace("Цена по запросу", soon ? esc(get(["ui", "badges", "soon"], "Скоро в продаже")) : "Цена по запросу") +
          '<div style="margin-top:12px">' + phoneForm("order", "h-order") + "</div></div>" +
      "</div></div></section>";

    /* ---------- 13. вопрос-ответ ---------- */
    var allFaq = Array.isArray(C.faq) ? C.faq : [];
    var modelFaq = Array.isArray(MC.faq) && MC.faq.length ? MC.faq : allFaq.filter(function (f) { return Array.isArray(f.models) && f.models.indexOf(slug) !== -1; });
    var seen = {};
    modelFaq.forEach(function (f) { seen[f.q] = 1; });
    var generalFaq = allFaq.filter(function (f) { return !f.models && !seen[f.q]; });
    function faqItem(f, i, pre) {
      return '<details class="accordion__item" id="' + pre + (i + 1) + '"' + (pre === "faq-m" && i === 0 ? " open" : "") + '><summary class="accordion__summary">' + esc(f.q) + icon("chevron-down") +
        '</summary><div class="accordion__body"><p>' + esc(f.a) + "</p></div></details>";
    }
    var faq = section("faq", "section--alt",
      head("h-faq", T(["modelPage", "faq", "title"], "Вопросы о {name}"), get(["faqSection", "subtitle"], "")) +
      '<div class="mp-faq"><div class="accordion" data-accordion="single">' + modelFaq.map(function (f, i) { return faqItem(f, i, "faq-m"); }).join("") + "</div>" +
      (generalFaq.length
        ? '<div id="faq-general" class="accordion" data-accordion="single" hidden>' + generalFaq.map(function (f, i) { return faqItem(f, i, "faq-g"); }).join("") + "</div>" +
          '<button type="button" class="btn btn--secondary mp-faq-more" data-toggle aria-controls="faq-general" aria-expanded="false" data-label-open="Скрыть общие вопросы" data-label-closed="Ещё ' + generalFaq.length + ' общих вопросов">' +
            '<span data-toggle-label>Ещё ' + generalFaq.length + " общих вопросов</span>" + icon("chevron-down") + "</button>"
        : "") +
      "</div>", "h-faq");

    /* ---------- мини-панель на мобиле ---------- */
    // в мини-панели места мало: у Lynx X вместо «Скоро в продаже» — «Старт продаж — 2027»
    var dockPrice = soon ? '<p class="price price--request"><span class="price__now">' + esc((UI.launchText && UI.launchText(model)) || get(["ui", "badges", "soon"], "Скоро в продаже")) + "</span></p>" : UI.priceHtml(model, { size: "sm" });
    var dock = '<div class="mp-dock" id="mp-dock" aria-hidden="true">' +
      '<div class="mp-dock__info"><span class="mp-dock__name">' + esc(NAME) + "</span>" + dockPrice + "</div>" +
      '<a class="btn ' + (soon ? "btn--signal" : "btn--primary") + '" href="#quick-order" tabindex="-1">' + esc(DOCK_BTN) + "</a></div>";

    main.innerHTML = heroHtml + mainVideo + specs + gallery + size + acc + reviews + compare + others + calc + pay + order + faq + dock;
    if (MC.seoTitle && document.title !== MC.seoTitle) document.title = MC.seoTitle;
    UI.init(main);

    /* ---------- цвет: первый экран ↔ галерея ----------
       Свотчи первого экрана и галереи — два независимых блока из app.js. Выбор в одном программно
       нажимает такой же свотч в другом (app.js сам меняет фото / перестраивает галерею).
       Якорь #color-<id> (например, pro.html#color-silver-red с 79bike.ru) выбирает расцветку при загрузке. */
    var syncing = false;
    function colorBoxes() {
      return Array.prototype.filter.call(main.querySelectorAll("[data-photo-swatches], [data-swatches]"), function (b) {
        return b.closest(".mp-hero") || b.closest("#gallery");
      });
    }
    function pressPhotoColor(box, colorId) {
      if (!box.hasAttribute("data-photo-swatches") || box.getAttribute("data-slug") !== slug) return;
      var sw = box.querySelector('.swatch[data-photo-color="' + colorId + '"]');
      if (sw && sw.getAttribute("aria-pressed") !== "true") sw.click();
    }
    function pressPlainColor(box, group, value) {
      if (!box.hasAttribute("data-swatches") || !value) return;
      var sw = box.querySelector('.swatch[data-group="' + group + '"][data-color="' + value + '"]');
      if (sw && sw.getAttribute("aria-pressed") !== "true") sw.click();
    }
    function setColor(colorId, except) {
      syncing = true;
      try { colorBoxes().forEach(function (b) { if (b !== except) pressPhotoColor(b, colorId); }); }
      finally { syncing = false; }
      renderGalAlt();
    }
    main.addEventListener("swatch:change", function (e) {
      if (syncing) return;
      var src = e.target.closest && e.target.closest("[data-photo-swatches], [data-swatches]");
      if (!src || colorBoxes().indexOf(src) < 0) return;
      var d = e.detail || {};
      if (src.hasAttribute("data-photo-swatches")) { setColor(d.color, src); return; }
      syncing = true;
      try {
        colorBoxes().forEach(function (b) {
          if (b === src) return;
          pressPlainColor(b, "frame", d.frame);
          pressPlainColor(b, "accent", d.accent);
        });
      } finally { syncing = false; }
    });

    /* Галерея с одним кадром в расцветке (у GT — по кадру на цвет): под фото лента «этот ракурс
       в других цветах» + подпись «Другие ракурсы — скоро», чтобы блок не выглядел пустым. */
    function renderGalAlt() {
      var box = document.getElementById("gallery-alt");
      var g = document.getElementById("gallery");
      if (!box || !g) return;
      var list = UI.photos(slug);
      var cur = g.getAttribute("data-color");
      var curColor = list.filter(function (c) { return c.id === cur; })[0] || list[0];
      var single = curColor && curColor.images.length < 2;
      box.hidden = !single;
      if (!single) { box.innerHTML = ""; return; }
      var others = list.length > 1;
      box.innerHTML =
        '<p class="mp-galalt__note">' + icon("clock") + "<span>Другие ракурсы " + esc(NAME) + " — скоро." +
          (others ? " Пока можно сравнить расцветки в одном ракурсе:" : "") + "</span></p>" +
        (others
          ? '<div class="mp-galalt__list" role="group" aria-label="Расцветки ' + esc(NAME) + '">' + list.map(function (c) {
              var ph = UI.photoFor(slug, c.id, 0);
              return '<button type="button" class="mp-galalt__item" data-galalt="' + esc(c.id) + '" aria-pressed="' + (c.id === curColor.id) + '">' +
                '<span class="mp-galalt__pic"><img src="' + esc(ph.src) + '" alt="" loading="lazy" decoding="async" width="160" height="100"></span>' +
                "<span>" + esc(c.label || c.frame) + "</span></button>";
            }).join("") + "</div>"
          : "");
    }
    main.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-galalt]");
      if (b) setColor(b.getAttribute("data-galalt"));
    });
    renderGalAlt();

    function colorFromHash() {
      var mm = /^#color-([\w-]+)$/.exec(location.hash || "");
      if (!mm || !hasPhotos) return false;
      var id = mm[1];
      if (!UI.photos(slug).some(function (c) { return c.id === id; })) return false;
      setColor(id);
      return true;
    }
    colorFromHash();
    window.addEventListener("hashchange", function () {
      if (colorFromHash()) {
        var top = document.getElementById("main");
        if (top) top.scrollIntoView({ block: "start" });
      }
    });

    /* ---------- поведение ---------- */
    // «В корзину»: в прототипе корзины нет — показываем состояние и пояснение
    var cart = main.querySelector(".mp-cart");
    if (cart) cart.addEventListener("click", function () {
      var on = cart.getAttribute("aria-pressed") !== "true";
      cart.setAttribute("aria-pressed", String(on));
      cart.innerHTML = icon(on ? "check" : "cart") + "<span>" + esc(on ? cart.getAttribute("data-label-on") : BTN("addToCart", "В корзину")) + "</span>";
      var msg = main.querySelector(".mp-cart-msg");
      if (msg) msg.textContent = on ? NAME + " в корзине. В прототипе корзины нет: в Tilda здесь стандартная корзина магазина с оплатой через ЮKassa." : "";
    });

    // расчёт доставки: текст результата с городом из CONTENT.deliveryCalc.result
    var calcForm = document.getElementById("mp-calc-form");
    if (calcForm) {
      var cityInput = calcForm.querySelector('[name="city"]');
      var syncCity = function () {
        var city = String(cityInput.value || "").trim();
        calcForm.setAttribute("data-success", calcDone(city || "ваш город"));
      };
      cityInput.addEventListener("input", syncCity);
      calcForm.addEventListener("submit", syncCity, true);
    }

    // рост райдера
    var hBtn = document.getElementById("mp-height-btn");
    if (hBtn && SEAT != null) {
      var panel = document.getElementById("mp-height");
      var range = document.getElementById("mp-height-range");
      var out = document.getElementById("mp-height-out");
      var fit = document.getElementById("mp-fit");
      var fitLinks = document.getElementById("mp-fit-links");
      var rider = document.getElementById("mp-rider");
      var rLabel = document.getElementById("mp-rider-label");
      /* «Высокие» рекомендации — только среди Falcon: полноразмерный Surge V (сиденье 900 мм) новичку на компактном байке не советуем.
         Высота сиденья — по схемам размеров (19.10.2026): Pro и Lite 820, GT и Lynx Trail 830, Lynx X 870, Surge V 900. */
      var FULL_SIZE = 900; // мм: полноразмерный эндуро, комфортно примерно от 180 см
      var withSeat = UI.models.filter(function (m) { return m.specs && typeof m.specs.seatMm === "number"; });
      var falconSeats = withSeat.filter(function (m) { return m.specs.seatMm < FULL_SIZE; }).map(function (m) { return m.specs.seatMm; });
      var minSeat = Math.min.apply(null, falconSeats), maxSeat = Math.max.apply(null, falconSeats);
      var lowest = withSeat.filter(function (m) { return m.specs.seatMm === minSeat && m.slug !== slug && m.status !== "soon"; });
      var tallest = withSeat.filter(function (m) { return m.specs.seatMm === maxSeat && m.slug !== slug; });
      var mid = withSeat.filter(function (m) { return m.specs.seatMm < maxSeat && m.specs.seatMm > minSeat && m.slug !== slug; });
      /* Высокая посадка среди Falcon — от 850 мм (Lynx X, 870); у остальных Falcon сиденье 820–830 мм.
         «Для высоких и крупных райдеров» (audience в models.js) — Lynx Trail и Lynx X: Lynx Trail — не за счёт сиденья
         (с GT сиденья не сравниваем — уточняется), а за счёт задней подвески с ходом 200 мм и тяги редуктора. Им при росте выше 180 см
         не пишем «байк может показаться компактным», а другим компактным Falcon советуем именно их. */
      var TALL_SEAT = 850;
      function forTall(m) { return /высок/i.test(m.audience || "") && m.specs.seatMm < FULL_SIZE; }
      var tallFalcons = withSeat.filter(function (m) { return forTall(m) && m.slug !== slug; });
      var lowerFalcons = withSeat.filter(function (m) { return m.specs.seatMm < TALL_SEAT && m.slug !== slug && m.status !== "soon"; });
      var IS_TALL_MODEL = forTall(model);
      var seatTextVal = UI.fmtSpecText(model, "seatMm", { unit: false });
      var H_TXT = get(["ui", "height"], {});

      var renderRider = function (h) {
        if (!rider || !rLabel) return; // схема-фото: райдера в масштабе не рисуем, остаются ползунок и подсказка
        var ppm = (G - SEAT_Y) / SEAT;           // px схемы на мм
        var H = h * 10 * ppm, cx = -250;
        var r = H * 0.062, sw = H * 0.13, lw = H * 0.062, aw = H * 0.045;
        var headY = G - H + r;
        var sh = G - H * 0.80, hip = G - H * 0.5;
        rider.innerHTML =
          '<g class="mp-rider__body">' +
            '<circle cx="' + cx + '" cy="' + headY.toFixed(1) + '" r="' + r.toFixed(1) + '" stroke="none"/>' +
            '<line x1="' + cx + '" y1="' + (sh + sw / 2).toFixed(1) + '" x2="' + cx + '" y2="' + (hip - lw * 0.3).toFixed(1) + '" stroke-width="' + sw.toFixed(1) + '"/>' +
            '<line x1="' + (cx - H * 0.03).toFixed(1) + '" y1="' + hip.toFixed(1) + '" x2="' + (cx - H * 0.045).toFixed(1) + '" y2="' + (G - lw / 2).toFixed(1) + '" stroke-width="' + lw.toFixed(1) + '"/>' +
            '<line x1="' + (cx + H * 0.03).toFixed(1) + '" y1="' + hip.toFixed(1) + '" x2="' + (cx + H * 0.045).toFixed(1) + '" y2="' + (G - lw / 2).toFixed(1) + '" stroke-width="' + lw.toFixed(1) + '"/>' +
            '<line x1="' + (cx - H * 0.095).toFixed(1) + '" y1="' + (sh + aw).toFixed(1) + '" x2="' + (cx - H * 0.12).toFixed(1) + '" y2="' + (G - H * 0.46).toFixed(1) + '" stroke-width="' + aw.toFixed(1) + '"/>' +
            '<line x1="' + (cx + H * 0.095).toFixed(1) + '" y1="' + (sh + aw).toFixed(1) + '" x2="' + (cx + H * 0.12).toFixed(1) + '" y2="' + (G - H * 0.46).toFixed(1) + '" stroke-width="' + aw.toFixed(1) + '"/>' +
          "</g>" +
          '<line class="mp-ref" x1="' + (cx - H * 0.16).toFixed(1) + '" y1="' + SEAT_Y + '" x2="120" y2="' + SEAT_Y + '"/>';
        rLabel.setAttribute("data-x", cx);
        rLabel.setAttribute("data-y", Math.round(G - H - 40));
        rLabel.setAttribute("style", pct(cx, G - H - 40));
        rLabel.textContent = "Райдер " + h + " см";
      };
      var linksHtml = function (list) {
        return list.map(function (m) { return '<a class="btn btn--secondary btn--sm" href="' + esc(m.page) + '#size">' + esc(m.name) + " · " + esc(UI.fmtSpecText(m, "seatMm")) + "</a>"; }).join("");
      };
      var update = function () {
        var h = parseInt(range.value, 10) || 175;
        out.textContent = String(h);
        range.setAttribute("aria-valuetext", h + " см");
        var state = "good", text, recs = [];
        var vars = { h: h, seat: seatTextVal };
        if (SEAT >= FULL_SIZE && h < 180) {
          state = "warn";
          text = fill(H_TXT.fitFull || "При росте {h} см сиденье {seat} мм будет высоковато: это полноразмерный эндуро, на нём комфортно примерно от 180 см. Посмотрите Falcon с посадкой ниже.", vars);
          recs = tallest.concat(mid).filter(function (m) { return m.status !== "soon"; });
        } else if (h < 160) {
          state = "warn";
          if (SEAT <= minSeat) text = fill("При росте {h} см даже самое низкое в линейке сиденье {seat} мм может быть высоковато: на остановке вы будете касаться земли носками. Лучше примерить байк вживую.", vars);
          else { text = fill(H_TXT.fitLow || "При росте {h} см сиденье {seat} мм может быть высоковато.", vars); recs = lowest; }
        } else if (SEAT >= TALL_SEAT && h < 175) {
          state = "warn";
          text = fill("При росте {h} см сиденье {seat} мм может быть высоковато: на остановке вы будете касаться земли носками. Посмотрите модели с посадкой ниже.", vars);
          recs = lowerFalcons;
        } else if (SEAT < TALL_SEAT && h > 180 && !IS_TALL_MODEL) {
          state = "warn";
          text = fill(H_TXT.fitHigh || "При росте {h} см этот байк может показаться компактным.", vars);
          recs = tallFalcons;
        } else {
          text = fill(H_TXT.fitGood || "При росте {h} см сиденье {seat} мм подходит.", vars);
        }
        fit.textContent = text;
        fit.setAttribute("data-fit", state);
        if (rider) rider.setAttribute("data-fit", state);
        fitLinks.innerHTML = linksHtml(recs);
        renderRider(h);
      };
      hBtn.addEventListener("click", function () {
        var open = hBtn.getAttribute("aria-expanded") !== "true";
        hBtn.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
        if (rider) {
          if (open) rider.removeAttribute("hidden"); else rider.setAttribute("hidden", ""); // у SVG-элементов нет свойства .hidden
          rLabel.hidden = !open;
          setFrame(open ? VB_RIDER : VB_BIKE);
        }
        hBtn.querySelector("span").textContent = open ? "Скрыть рост" : T(["modelPage", "size", "button"], BTN("showHeight", "Показать рост"));
        if (open) { update(); range.focus(); }
      });
      range.addEventListener("input", update);
    }

    // мини-панель: видна, когда блок покупки ушёл с экрана и нижняя форма ещё не видна
    var dockEl = document.getElementById("mp-dock");
    var buyEl = document.getElementById("buy");
    var orderEl = document.getElementById("order");
    if (dockEl && buyEl && "IntersectionObserver" in window) {
      body.classList.add("has-mp-dock");
      var vis = { buy: true, order: false };
      var sync = function () {
        var show = !vis.buy && !vis.order;
        dockEl.classList.toggle("is-visible", show);
        dockEl.setAttribute("aria-hidden", String(!show));
        var a = dockEl.querySelector("a");
        if (a) a.tabIndex = show ? 0 : -1;
      };
      // «блок покупки не мешает» = он уже прокручен вверх за экран (ниже экрана при загрузке — панель не нужна)
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { vis.buy = e.isIntersecting || e.boundingClientRect.top > 0; });
        sync();
      }).observe(buyEl);
      if (orderEl) new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { vis.order = e.isIntersecting; });
        sync();
      }).observe(orderEl);
      // по клику ведём к форме и ставим фокус в поле телефона
      dockEl.querySelector("a").addEventListener("click", function () {
        setTimeout(function () { var i = document.getElementById("phone-hero"); if (i) i.focus({ preventScroll: true }); }, 400);
      });
    }

    // якорь на форму заказа (#quick-order с карточек): фокус в поле телефона
    if (location.hash === "#quick-order") {
      requestAnimationFrame(function () {
        var q = document.getElementById("quick-order");
        if (q) q.scrollIntoView({ block: "start" });
        var i = document.getElementById("phone-hero");
        if (i) i.focus({ preventScroll: true });
      });
    } else if (location.hash && /^#[\w-]+$/.test(location.hash)) {
      // контент построен скриптом: браузер не успел прокрутить к якорю
      requestAnimationFrame(function () {
        var t = document.getElementById(location.hash.slice(1));
        if (t) t.scrollIntoView({ block: "start" });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
