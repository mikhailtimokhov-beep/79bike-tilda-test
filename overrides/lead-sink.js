/* 79BIKE · приёмник заявок на странице Тильды.
   Наши формы (свой дизайн и проверки) передают заявку сюда, а этот код отправляет её через обычную форму Тильды
   (блок BF204N с полями Name и Comments, спрятан с экрана). Поэтому заявки уходят во все сервисы приёма данных,
   подключённые к проекту (почта, Telegram, CRM, вебхуки), с антиспамом и записью в «Заявки» Тильды.
   B79_TILDA_SEND({ title, name, rows: [[подпись, значение], ...] }, function (ok, error) {}) */
(function () {
  if (window.B79_TILDA_SEND) return;
  var css = document.createElement("style");
  css.textContent = ".b79-sink{position:absolute!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important}" +
    ".t-form-success-popup{display:none!important}";
  (document.head || document.documentElement).appendChild(css);

  function sink() {
    if (window.B79_LEAD_FORM_ID) return document.getElementById(window.B79_LEAD_FORM_ID);
    var all = document.querySelectorAll("form.js-form-proccess");
    for (var i = 0; i < all.length; i++) if (all[i].querySelector('[name="Name"]') && all[i].querySelector('[name="Comments"]')) return all[i];
    return null;
  }
  function hide() { var f = sink(); if (f) { var r = f.closest(".r") || f; r.classList.add("b79-sink"); r.setAttribute("aria-hidden", "true"); } return f; }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hide); else hide();

  var busy = false;
  window.B79_TILDA_SEND = function (p, cb) {
    var f = hide();
    if (!f) return cb(false, "no-form");
    if (busy) return cb(false, "busy");
    busy = true;
    // имя: правило Тильды пропускает только буквы, пробел, дефис, апостроф и точку
    var name = String(p.name || "").replace(/[^A-Za-zА-Яа-яЁё\s'.-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "Клиент";
    var text = [p.title].concat((p.rows || []).map(function (r) { return r[0] + ": " + r[1]; })).join("\n");
    f.querySelector('[name="Name"]').value = name;
    f.querySelector('[name="Comments"]').value = text.slice(0, 3900);
    Array.prototype.forEach.call(f.querySelectorAll("input.b79-x"), function (x) { x.remove(); });
    function add(n, v) { var i = document.createElement("input"); i.type = "hidden"; i.className = "b79-x"; i.name = n; i.value = String(v).slice(0, 900); f.appendChild(i); }
    add("Форма", p.title || "");
    (p.rows || []).forEach(function (r) { if (r[0] && r[1] !== "") add(String(r[0]).replace(/[\[\]]/g, "").slice(0, 60), r[1]); });
    var done = false, t;
    function fin(ok, err) {
      if (done) return; done = true; busy = false; clearTimeout(t);
      f.removeEventListener("tildaform:aftersuccess", okH); f.removeEventListener("tildaform:aftererror", errH);
      cb(ok, err);
    }
    function okH() { fin(true); }
    function errH() { var b = f.querySelector(".js-errorbox-all"); fin(false, b ? b.textContent.replace(/\s+/g, " ").trim() : "error"); }
    f.addEventListener("tildaform:aftersuccess", okH);
    f.addEventListener("tildaform:aftererror", errH);
    t = setTimeout(function () { fin(false, "timeout"); }, 25000);
    var btn = f.querySelector(".t-submit");
    if (btn) btn.click(); else fin(false, "no-submit");
  };
})();
