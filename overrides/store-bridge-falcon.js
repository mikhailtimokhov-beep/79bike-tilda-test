/* Falcon Bike · кнопки нового дизайна → корзина Тильды (t706 в шапке проекта: оплата, доставка, наличие — как на старом сайте).
   Решение Михаила 29.10: «перенести все действующие скрипты… образ страницы новый».
   На странице модели лежит скрытый блок магазина того же товара (t744 / t786). «В корзину» выбирает в нём нужный цвет
   и нажимает его кнопку — Тильда кладёт товар в свою корзину и открывает оформление заказа.
   Значок корзины в шапке нового дизайна показывает корзину Тильды. Карта цветов: window.B79_STORE_MAP (данные страницы). */
(function () {
  if (!window.B79_NATIVE) return;
  var css = document.createElement("style");
  css.textContent = 'body.fb-native[data-page="model"] .t-rec[data-record-type="744"],body.fb-native[data-page="model"] .t-rec[data-record-type="786"]{position:absolute!important;left:-10000px!important;top:0!important;width:1200px!important;height:1px!important;overflow:hidden!important}';
  (document.head || document.documentElement).appendChild(css);
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
