/* Подбор мотоцикла: рост, опыт, задача, бюджет. Правила открытые и считаются по данным MODELS.
   Ничего не выдумываем: все доводы берутся из характеристик (сиденье, вес, мощность, ход вилки, цена).
   Подключение: <div data-picker></div> + assets/picker.js + assets/picker.css (после app.js). */
(function () {
  "use strict";
  var NB = " ";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + "₽"; }
  function num(n) { return String(n).replace(".", ","); }
  function fork(m) { var r = /ход\s*(\d+)\s*мм/i.exec(m.specs.frontSuspension || ""); return r ? +r[1] : 0; }
  function norm(v, arr, inv) { var lo = Math.min.apply(null, arr), hi = Math.max.apply(null, arr); var x = hi === lo ? 0.5 : (v - lo) / (hi - lo); return inv ? 1 - x : x; }

  var EXP = [["new", "Новичок", "Первый электробайк или не ездил на эндуро"], ["mid", "Есть опыт", "Ездил(а) на питбайках, эндуро или электро"], ["pro", "Опытный", "Уверенно езжу по бездорожью"]];
  var TASK = [["park", "Парк и прогулки", "Дача, парк, спокойный темп"], ["soft", "Лес и лёгкое бездорожье", "Лесные дороги и тропы"], ["fast", "Быстрая езда", "Динамика и скорость"], ["hard", "Жёсткий эндуро", "Крутые подъёмы, камни, грязь"]];
  var BUD = [[300000, "до 300 000 ₽"], [360000, "до 360 000 ₽"], [0, "Любой"]];

  function pool() { return window.MODELS.filter(function (m) { return m.status !== "soon" && m.price; }); }

  function evaluate(st) {
    var P = pool(), pw = P.map(function (m) { return m.specs.powerKw; }), wt = P.map(function (m) { return m.specs.weightKg; }),
      pr = P.map(function (m) { return m.price; }), sp = P.map(function (m) { return m.specs.speedKmh; }), tq = P.map(function (m) { return m.specs.torqueNm; }),
      fk = P.map(fork), cl = P.map(function (m) { return m.specs.clearanceMm; });
    return P.map(function (m) {
      var s = m.specs, f = fork(m), reasons = [], warns = [], score;
      var n = { pw: norm(s.powerKw, pw), w: norm(s.weightKg, wt, true), pr: norm(m.price, pr, true), sp: norm(s.speedKmh, sp), tq: norm(s.torqueNm, tq), f: norm(f, fk), c: norm(s.clearanceMm, cl) };
      var t = { park: 0.5 * n.w + 0.3 * n.pr + 0.2 * (1 - n.pw), soft: 0.35 * n.w + 0.35 * n.pw + 0.3 * n.f, fast: 0.5 * n.pw + 0.3 * n.sp + 0.2 * n.tq, hard: 0.4 * n.f + 0.3 * n.pw + 0.3 * n.c }[st.task];
      score = t * 10;
      // рост: носки достают до земли, если сиденье не выше половины роста (ориентир)
      var minH = Math.ceil(s.seatMm / 10 / 0.5 / 5) * 5;
      if (st.h < minH) { var d = minH - st.h; score -= 3 + d / 3; warns.push("Сиденье " + s.seatMm + " мм высоковато для роста " + st.h + " см: комфортнее от " + minH + " см."); }
      else reasons.push("Сиденье " + s.seatMm + " мм подходит к росту " + st.h + " см (ориентир: от " + minH + " см).");
      if (st.h > 185 && s.wheelbaseMm < 1270) { score -= 1.5; warns.push("При росте " + st.h + " см байк компактный (колёсная база " + s.wheelbaseMm + " мм), посадка может быть тесной."); }
      if (st.h > 185 && s.wheelbaseMm >= 1270) { score += 0.8; reasons.push("Колёсная база " + s.wheelbaseMm + " мм: больше места для высокого райдера."); }
      // опыт: сайт сам советует новичкам Pro и Lite, а GT и Surge V опытным
      if (st.exp === "new") {
        if (s.powerKw > 20) { score -= 5; warns.push("Мощность " + num(s.powerKw) + " кВт: для новичка это много."); }
        else if (s.powerKw > 12) { score -= 2.5; warns.push("Мощность " + num(s.powerKw) + " кВт: новичку лучше начинать с режима Eco."); }
        else reasons.push("Мощность " + num(s.powerKw) + " кВт: спокойно для первого байка.");
      } else if (st.exp === "pro" && s.powerKw >= 17) { score += 1; reasons.push("Мощность " + num(s.powerKw) + " кВт и момент " + s.torqueNm + " Н·м для уверенной езды."); }
      // доводы по задаче
      if (st.task === "park") reasons.push("Вес " + s.weightKg + " кг, цена " + money(m.price) + ".");
      if (st.task === "soft") reasons.push("Вес " + s.weightKg + " кг, ход вилки " + f + " мм.");
      if (st.task === "fast") reasons.push("До " + s.speedKmh + " км/ч, мощность " + num(s.powerKw) + " кВт.");
      if (st.task === "hard") reasons.push("Ход вилки " + f + " мм, клиренс " + s.clearanceMm + " мм.");
      var over = st.budget && m.price > st.budget ? m.price - st.budget : 0;
      if (over) { score -= 6; warns.push("Дороже бюджета на " + money(over) + "."); }
      return { m: m, score: score, reasons: reasons, warns: warns, over: over, minH: minH };
    }).sort(function (a, b) { return b.score - a.score; });
  }

  function radio(name, items, cur) {
    return '<div class="pk-chips" role="radiogroup">' + items.map(function (x) {
      var v = x[0], on = String(v) === String(cur);
      return '<label class="pk-chip"><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (on ? " checked" : "") + '><span><b>' + esc(x[1]) + "</b>" + (x[2] ? "<small>" + esc(x[2]) + "</small>" : "") + "</span></label>";
    }).join("") + "</div>";
  }

  function card(r, main) {
    var m = r.m, p = window.UI && UI.photoMedia ? UI.photoMedia(m.slug, undefined, "side", { eager: false }) : "";
    var s = m.specs;
    return '<article class="pk-card' + (main ? " pk-card--main" : "") + '"><div class="pk-card__img">' + p + '</div><div class="pk-card__b">' +
      (main ? '<p class="pk-badge">Вам подходит</p>' : "") +
      '<h3><a href="' + esc(m.page) + '">' + esc(m.name) + "</a></h3>" +
      '<p class="pk-line">' + num(s.powerKw) + " кВт · " + s.speedKmh + " км/ч · " + s.capacityAh + " Ач · " + s.weightKg + " кг</p>" +
      '<p class="pk-price">' + (window.UI ? UI.priceHtml(m, { size: "sm" }) : money(m.price)) + "</p>" +
      (main ? "<ul class=pk-why>" + r.reasons.slice(0, 3).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + r.warns.map(function (x) { return '<li class="pk-warn">' + esc(x) + "</li>"; }).join("") + "</ul>" :
        "<ul class=pk-why>" + r.warns.slice(0, 1).map(function (x) { return '<li class="pk-warn">' + esc(x) + "</li>"; }).join("") + (r.warns.length ? "" : "<li>" + esc(r.reasons[1] || r.reasons[0] || "") + "</li>") + "</ul>") +
      '<div class="pk-act"><a class="btn btn--primary btn--sm" href="' + esc(m.page) + '">Смотреть ' + esc(m.name.replace("Falcon ", "")) + "</a>" + (main ? '<a class="btn btn--secondary btn--sm" href="compare.html">Сравнить модели</a>' : "") + "</div></div></article>";
  }

  function mount(root) {
    var st = { h: 175, exp: "mid", task: "soft", budget: 0 };
    root.innerHTML = '<div class="pk"><form class="pk-form" novalidate aria-label="Параметры подбора">' +
      '<fieldset class="pk-f"><legend>Ваш рост</legend><div class="pk-h"><input id="pk-h" type="range" min="150" max="200" step="1" value="' + st.h + '" aria-label="Рост, см"><output id="pk-hout" for="pk-h">' + st.h + " <small>см</small></output></div></fieldset>" +
      '<fieldset class="pk-f"><legend>Опыт езды</legend>' + radio("exp", EXP, st.exp) + "</fieldset>" +
      '<fieldset class="pk-f"><legend>Что будете делать</legend>' + radio("task", TASK, st.task) + "</fieldset>" +
      '<fieldset class="pk-f"><legend>Бюджет</legend>' + radio("budget", BUD, st.budget) + "</fieldset></form>" +
      '<div class="pk-res" aria-live="polite" id="pk-res"></div></div>' +
      '<p class="pk-note">Подбор даёт ориентир по характеристикам, а не гарантию посадки. Сиденье, вес и мощность лучше проверить вживую: запишитесь на тест-драйв в Москве (Речников 21, по записи 12:00–20:00) или спросите менеджера.</p>';
    var res = root.querySelector("#pk-res");
    function render() {
      var r = evaluate(st), top = r[0], alts = r.slice(1, 3), soon = window.MODELS.filter(function (m) { return m.status === "soon"; })[0];
      var hint = soon && st.h >= 175 && st.exp !== "new" && (st.task === "hard" || st.task === "fast") ? '<p class="pk-soon">Для высоких и опытных скоро будет ' + esc(soon.name) + ": " + num(soon.specs.powerKw) + " кВт, старт продаж " + esc(soon.launch || "") + ' (<a href="' + esc(soon.page) + '">оставить номер</a>).</p>' : "";
      res.innerHTML = card(top, true) + (alts.length ? '<h3 class="pk-alth">Ещё варианты</h3><div class="pk-alts">' + alts.map(function (x) { return card(x, false); }).join("") + "</div>" : "") + hint;
      if (window.UI && UI.init) UI.init(res);
    }
    root.querySelector(".pk-form").addEventListener("input", function (e) {
      if (e.target.id === "pk-h") { st.h = +e.target.value; root.querySelector("#pk-hout").innerHTML = st.h + " <small>см</small>"; }
      else if (e.target.name === "exp") st.exp = e.target.value;
      else if (e.target.name === "task") st.task = e.target.value;
      else if (e.target.name === "budget") st.budget = +e.target.value;
      render();
    });
    render();
  }
  function start() { document.querySelectorAll("[data-picker]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
