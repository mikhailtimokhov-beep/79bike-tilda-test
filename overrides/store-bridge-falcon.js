/* Falcon Bike · кнопки нового дизайна → корзина Тильды (t706 в шапке проекта: оплата, доставка, наличие — как на старом сайте).
   Решение Михаила 29.10: «перенести все действующие скрипты… образ страницы новый».
   На странице модели лежит скрытый блок магазина того же товара (t744 / t786). «В корзину» выбирает в нём нужный цвет
   и нажимает его кнопку — Тильда кладёт товар в свою корзину и открывает оформление заказа.
   Значок корзины в шапке нового дизайна показывает корзину Тильды. Карта цветов: window.B79_STORE_MAP (данные страницы). */
(function () {
  if (!window.B79_NATIVE) return;
  var css = document.createElement("style");
  // корзина и карточки Тильды — светлые, как на старом сайте (тёмная схема нового дизайна красила поля формы в тёмно-серый);
  // плавающий значок корзины Тильды скрыт — корзину открывает значок в шапке нового дизайна
  css.textContent = '.t706,.t706__cartwin,.t-popup,.t-store{color-scheme:light}body.fb-native .t706__carticon{display:none!important}' +
    'body.fb-native[data-page="model"] .t-rec[data-record-type="744"],body.fb-native[data-page="model"] .t-rec[data-record-type="786"]{position:absolute!important;left:-10000px!important;top:0!important;width:1200px!important;height:1px!important;overflow:hidden!important}';
  (document.head || document.documentElement).appendChild(css);
  // каталоги магазина (/accessories и разделы): каталог t786 и поиск t838 Тильды переезжают в оболочку нового дизайна (#b79-tilda-slot),
  // старое оформление страницы (zero-блоки, хлебные крошки Тильды) скрыто, карточки — в цветах нового дизайна
  var TS = 'body.fb-native[data-page="tstore"]';
  css.textContent += TS + ' .t-rec[data-record-type="396"],' + TS + ' .t-rec[data-record-type="758"]{display:none!important}' +
    '.tstore .t-rec{padding:0!important;background:none!important}.tstore .t-container,.tstore .t-store .t-container{max-width:none!important;width:auto!important;padding:0!important;margin:0!important}' +
    '.tstore .t-col,.tstore .t-store__grid-cont .t-col{margin-left:0!important;margin-right:0!important}' +
    '.tstore .t838{margin:0 0 18px}.tstore .t838 input,.tstore .t-store__filter input{background:#fff!important;color:#111!important;border-radius:14px!important}' +
    '.tstore .js-product.t-store__card{background:#15151d;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:12px 12px 16px;box-sizing:border-box}' +
    '.tstore .t-store__card__imgwrapper,.tstore .t-store__card__bgimg{border-radius:14px;background-color:#fff}' +
    '.tstore .t-store__card__title,.tstore .t-store__card .t-name,.tstore .t-store__card__price,.tstore .t-store__card__price-value,.tstore .t-store__card__price-currency{color:#fff!important;font-family:inherit!important}' +
    '.tstore .t-store__card__price_old,.tstore .t-store__card__price_old *{color:#8b8b99!important}.tstore .t-store__card__descr,.tstore .t-store__card .t-descr{color:#b9b9c6!important;font-family:inherit!important}' +
    '.tstore .t-store__card .t-btn,.tstore .t-store__load-more-btn,.tstore .t-store .t-btn{background:#7658F5!important;color:#fff!important;border:0!important;border-radius:999px!important;font-family:inherit!important}' +
    '.tstore .t-store__filter,.tstore .t-store__filter *,.tstore .t-store__sort-select,.tstore .js-store-parts-select-container,.tstore .js-store-parts-select-container *{color:#fff;font-family:inherit}' +
    '.tstore .t-store__parts-switch-btn{color:#fff!important;border-color:rgba(255,255,255,.25)!important;border-radius:999px!important}.tstore .t-store__parts-switch-btn.t-active{background:#7658F5!important;border-color:#7658F5!important}' +
    '.tstore .t-store__filter__item-title,.tstore .t-store__filter__title{color:#fff!important}.tstore select{color-scheme:light}';
  function moveStore() {
    var slot = document.getElementById("b79-tilda-slot"); if (!slot) return false;
    ["838", "786"].forEach(function (t) { [].forEach.call(document.querySelectorAll('.t-rec[data-record-type="' + t + '"]'), function (r) { if (!slot.contains(r)) slot.appendChild(r); }); });
    return true;
  }
  if (document.body && document.body.getAttribute("data-page") === "tstore" || /\/(accessories|kusov|hodovaya_chast|dvigatel_i_pitanie|electronika|sidenya_i_podnozki|krilya|tormosa|amortisaciya|kolesa|aksessuari)\/?$/.test(location.pathname)) {
    var tries = 0, iv = setInterval(function () { if (moveStore() || ++tries > 40) clearInterval(iv); }, 250);
  }

  function prodFor(slug, ci) {
    var m = (window.B79_STORE_MAP || {})[slug]; if (!m) return null;
    var root = document.getElementById("rec" + m.rec) || document;
    var el = m.uids ? root.querySelector('.js-product[data-product-gen-uid="' + m.uids[ci] + '"]') : root.querySelector(".js-product");
    return el ? { el: el, m: m } : null;
  }
  window.B79_BUY_BIKE = function (slug, ci) {
    var p = prodFor(slug, ci || 0); if (!p) return false;
    if (p.m.option) {
      var v = p.m.option[ci || 0]; if (v === undefined) return false;
      var r = [].filter.call(p.el.querySelectorAll('input[type="radio"]'), function (i) { return i.value === v; })[0];
      if (r && !r.checked) r.click();
      var s = p.el.querySelector("select");
      if (s && [].some.call(s.options, function (o) { return o.value === v; }) && s.value !== v) { s.value = v; s.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    var b = p.el.querySelector('a[href="#order"]'); if (!b) return false;
    b.click(); return true;
  };
  window.B79_CART_N = function () {
    try { return ((window.tcart && window.tcart.products) || []).filter(function (x) { return x && !x.deleted; }).reduce(function (n, x) { return n + (+x.quantity || 1); }, 0); } catch (e) { return 0; }
  };
  window.B79_OPEN_CART = function () { if (typeof window.tcart__openCart === "function") { window.tcart__openCart(); return true; } return false; };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".hdr-cart"); if (!a) return;
    if (window.B79_OPEN_CART()) e.preventDefault();
  }, true);
  setInterval(function () { if (window.B79_HDR_CART) window.B79_HDR_CART(); }, 1500);
})();
