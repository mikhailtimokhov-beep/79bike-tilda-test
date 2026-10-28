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
    var text = (p.rows || []).map(function (r) { return r[0] + ": " + r[1]; }).join("\n");
    f.querySelector('[name="Name"]').value = name;
    f.querySelector('[name="Comments"]').value = text.slice(0, 3900);
    Array.prototype.forEach.call(f.querySelectorAll("input.b79-x"), function (x) { x.remove(); });
    function add(n, v) { var i = document.createElement("input"); i.type = "hidden"; i.className = "b79-x"; i.name = n; i.value = String(v).slice(0, 900); f.appendChild(i); }
    // стандартные поля, как у прежних форм 79bike.ru (Name, Phone) — их ждут подключённые CRM и уведомления;
    // всё остальное — читаемым текстом в Comments, без дублей
    var get = function (label) { var r = (p.rows || []).filter(function (x) { return x[0] === label; })[0]; return r ? String(r[1]) : ""; };
    var contact = get("Контакт"), digits = contact.replace(/\D/g, "");
    if (digits.length === 11 && /^[78]/.test(digits)) add("Phone", "+7" + digits.slice(1));
    else if (digits.length === 10 && !/^@/.test(contact)) add("Phone", "+7" + digits);
    else if (contact) add("Messenger", contact);
    add("Form", p.title || "");
    if (get("Модель")) add("Model", get("Модель"));
    else { var m = /Консультация по (.+)$/.exec(p.title || ""); if (m) add("Model", m[1]); }
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
