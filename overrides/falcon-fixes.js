/* Falcon Bike · исправления для Тильды (общий подвал, после app.js). 31.10.2026, чат «Сайты» по жалобе Михаила. */
(function () {
  if (!window.B79_NATIVE) return;
  /* 1. Тильда занимает адрес #order под свою корзину и глушит клик по таким ссылкам: «Заказать», «Сообщить о старте продаж»,
        «Узнать условия», «Добавить к заказу» не вели к форме. Перехватываем раньше Тильды: на время клика меняем адрес ссылки
        (обработчик корзины её не узнаёт), наши обработчики (data-acc и др.) срабатывают как обычно, к форме прокручиваем сами. */
  window.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href="#order"]') : null, t = document.getElementById("order");
    if (!a || !t || e.button || e.ctrlKey || e.metaKey) return;
    /* кнопки магазина Тильды («В корзину» в блоках Store, корзина) не трогаем — им #order и нужен */
    if (a.closest('.js-product, .t-store, .t706, .t-rec[data-record-type="744"], .t-rec[data-record-type="786"], .t-rec[data-record-type="706"]')) return;
    e.preventDefault();
    a.setAttribute("href", "#b79-order"); setTimeout(function () { a.setAttribute("href", "#order"); }, 0);
    t.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", "#order"); } catch (x) {}
  }, true);
  /* 2. Ссылки «открыть фото крупно» (шоурум, события) вели на assets/…webp — на Тильде таких файлов нет (404). Берём адрес с сервера Тильды. */
  function fixA(a) {
    var h = a.getAttribute("href");
    if (!h || !/^(\.\/)?assets\/[^?#]+\.(webp|jpe?g|png)([?#]|$)/.test(h) || !window.B79_ASSET) return;
    var n = window.B79_ASSET(h); if (n && n !== h) a.setAttribute("href", n);
  }
  function walk(n) { if (n.nodeType !== 1) return; if (n.tagName === "A") fixA(n); if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll('a[href*="assets/"]'), fixA); }
  walk(document.body);
  new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, walk); }); }).observe(document.body, { childList: true, subtree: true });
})();
