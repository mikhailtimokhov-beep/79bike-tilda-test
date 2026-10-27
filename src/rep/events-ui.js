/* 79bike.ru — раздел «События». Данные: events.js (копия falcon-bike.ru/data/events.js). Разметка и классы — как в P.events на falcon-bike.ru. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var SHOP = "https://falcon-bike.ru/";
  function img(src, w) { return "../assets/" + src + "-" + w + ".webp"; }
  function list() {
    var E = (window.EVENTS || []).slice();
    function k(e) { return e.date ? String(e.date) : ""; }
    return E.sort(function (a, b) { if (!!a.upcoming !== !!b.upcoming) return a.upcoming ? -1 : 1; var ka = k(a), kb = k(b); if (!ka !== !kb) return ka ? -1 : 1; return ka < kb ? 1 : ka > kb ? -1 : 0; });
  }
  function meta(e) { return '<p class="ev__meta">' + (e.dateText ? "<b>" + esc(e.dateText) + "</b>" : "") + "<span>" + esc([e.place, e.city].filter(Boolean).join(" · ")) + "</span></p>"; }
  function card(e) {
    var ph = e.photos || [], p0 = ph[0];
    return '<article class="ev" data-type="' + esc(e.type) + '">' +
      (p0 ? '<a class="ev__pic" href="' + img(p0.src, 1600) + '" target="_blank" rel="noopener"><img src="' + img(p0.src, 640) + '" alt="' + esc(p0.alt || e.title) + '" loading="lazy" decoding="async"><span class="ev__type">' + esc(e.type) + "</span></a>" : "") +
      '<div class="ev__body">' + meta(e) + '<h3 class="h3">' + esc(e.title) + "</h3><p>" + esc(e.text) + "</p>" +
      (ph.length > 1 ? '<div class="ev__thumbs">' + ph.slice(1).map(function (q) { return '<a href="' + img(q.src, 1600) + '" target="_blank" rel="noopener"><img src="' + img(q.src, 640) + '" alt="' + esc(q.alt || "") + '" loading="lazy" decoding="async"></a>'; }).join("") + "</div>" : "") +
      (e.link && e.link.url ? '<a class="ev__link" href="' + esc(e.link.url) + '" target="_blank" rel="noopener">' + esc(e.link.text || "Подробнее") + "</a>" : "") +
      "</div></article>";
  }
  function up(e) {
    var p0 = (e.photos || [])[0];
    return '<article class="ev-up">' + (p0 ? '<a class="ev-up__pic" href="' + img(p0.src, 1600) + '" target="_blank" rel="noopener"><img src="' + img(p0.src, 1600) + '" alt="' + esc(p0.alt || e.title) + '" loading="lazy" decoding="async"></a>' : "") +
      '<div class="ev-up__body"><p class="ev-up__tag">' + (e.date && /^\d{4}-\d\d(-\d\d)?$/.test(e.date) ? "Ближайшее событие" : "Действует сейчас") + " · " + esc(e.type) + '</p><h3 class="h3">' + esc(e.title) + "</h3>" + meta(e) + "<p>" + esc(e.text) + '</p><div class="visit-cta">' + cta(e) + "</div></div></article>";
  }
  /* свои кнопки события (поле cta); ссылки вида "contacts.html#visit" ведут в магазин falcon-bike.ru */
  function cta(e) {
    if (!e.cta || !e.cta.length) return '<a class="btn btn--main" href="' + SHOP + 'contacts#visit">Записаться</a><a class="btn btn--ghost" href="tel:+79999005588">Позвонить</a>';
    return e.cta.map(function (c, i) {
      var u = String(c.url || ""), m = u.match(/^([\w-]+)\.html(#.*)?$/);
      if (m) u = SHOP + m[1] + (m[2] || "");
      return '<a class="btn ' + (i ? "btn--ghost" : "btn--main") + '" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(c.text) + "</a>";
    }).join("");
  }
  function render() {
    var root = document.getElementById("rep-events"); if (!root) return;
    var E = list(), U = E.filter(function (e) { return e.upcoming; }), P = E.filter(function (e) { return !e.upcoming; });
    var types = []; P.forEach(function (e) { if (types.indexOf(e.type) < 0) types.push(e.type); });
    root.innerHTML = U.map(up).join("") +
      (types.length > 1 ? '<div class="ev-filter" role="group" aria-label="Тип события" style="margin-top:28px"><button class="chip" type="button" aria-pressed="true" data-ev="">Все</button>' + types.map(function (t) { return '<button class="chip" type="button" aria-pressed="false" data-ev="' + esc(t) + '">' + esc(t[0].toUpperCase() + t.slice(1)) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="ev-grid" id="rep-ev-grid"' + (types.length > 1 ? "" : ' style="margin-top:28px"') + ">" + P.map(card).join("") + "</div>" +
      '<div class="ev-foot"><a class="ev-rep" href="' + SHOP + 'events" target="_blank" rel="noopener">Шоурум и тест-драйвы в Москве — falcon-bike.ru/events<span aria-hidden="true"> →</span></a></div>';
    var f = root.querySelector(".ev-filter");
    if (f) f.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-ev]"); if (!b) return;
      var t = b.getAttribute("data-ev");
      f.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      root.querySelectorAll("#rep-ev-grid .ev").forEach(function (c) { c.hidden = !!t && c.getAttribute("data-type") !== t; });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
})();
