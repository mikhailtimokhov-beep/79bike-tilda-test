/* 79BIKE · отправка заявок из наших форм.
   После проверки полей (app.js) форма вызывает B79_LEAD(form, cb). Данные собираются с понятными подписями и уходят:
   - на живой странице Тильды — прямо в приёмник B79_TILDA_SEND (lead-sink.js, скрытая форма Тильды);
   - в тестовой версии (страница во фрейме) — сообщением странице Тильды, которая отправляет через тот же приёмник.
   cb(true) — заявка принята Тильдой; cb(false, причина) — не отправилась, показываем телефон. */
(function () {
  var HOW = { call: "Позвонить", whatsapp: "WhatsApp", telegram: "Telegram", vk: "VK Мессенджер" };
  function txt(el) { return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function labelOf(el) {
    if (el.getAttribute("data-label")) return el.getAttribute("data-label");
    var lab = el.closest("label");
    if (lab) { var c = lab.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll("input,select,textarea,.pf-optl"), function (x) { x.remove(); }); var s = txt(c); if (s) return s.replace(/\s*\(необязательно\)\s*/i, ""); }
    var fs = el.closest("fieldset"); if (fs && fs.querySelector("legend")) return txt(fs.querySelector("legend"));
    return el.getAttribute("aria-label") || el.name;
  }
  function titleOf(form) {
    var a = form.getAttribute("data-lead") || form.getAttribute("aria-label");
    if (a) return a;
    var box = form.closest("dialog, section, .dlg__body");
    var h = box && box.querySelector("h2, h3, .h3");
    return txt(h) || "Заявка с сайта";
  }
  window.B79_COLLECT = function (form) {
    var rows = [], name = "", seen = {};
    var els = form.querySelectorAll("input[name], select[name], textarea[name]");
    Array.prototype.forEach.call(els, function (el) {
      if (el.closest("[hidden]") && el.type !== "hidden") return;
      var n = el.name, v = "";
      if (el.type === "radio") { if (!el.checked) return; v = n === "how" ? (HOW[el.value] || el.value) : el.value; }
      else if (el.type === "checkbox") {
        if (el.hasAttribute("data-req-check") || n === "pd" || n === "age18") { v = el.checked ? "да" : "нет"; }
        else {
          if (seen[n] !== undefined) return; seen[n] = 1;
          var on = form.querySelectorAll('input[type=checkbox][name="' + n + '"]:checked');
          v = Array.prototype.map.call(on, function (x) { return x.value; }).join(", "); if (!v) return;
          var fs = el.closest("fieldset"); rows.push([fs && fs.querySelector("legend") ? txt(fs.querySelector("legend")) : n, v]); return;
        }
      }
      else v = String(el.value || "").trim();
      if (el.type === "hidden" && !v) return;
      if (n === "name") name = v;
      var label = n === "source" ? "Где куплен байк" : n === "pd" ? "Согласие на обработку персональных данных" : n === "age18" ? "Есть 18 лет, готов внести залог" : labelOf(el);
      if (el.type === "tel" || el.hasAttribute("data-contact")) label = "Контакт";
      if (el.type === "radio" && n === "how") label = "Как связаться";
      if (v !== "") rows.push([label, v]);
    });
    rows.push(["Страница", (window.B79_PAGE_URL || location.href).split("#")[0]]);
    return { title: titleOf(form), name: name, rows: rows };
  };

  var T = null;
  try { var q = new URLSearchParams(location.search).get("top"); if (q && /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(q)) T = q; } catch (_) {}
  var wait = {}, seq = 0;
  window.addEventListener("message", function (e) {
    if (!T || e.origin !== T || !e.data || e.data.type !== "b79-lead-result" || !wait[e.data.id]) return;
    var cb = wait[e.data.id]; delete wait[e.data.id]; cb(!!e.data.ok, e.data.error || "");
  });
  window.B79_LEAD = function (form, cb) {
    var p = window.B79_COLLECT(form);
    if (window.B79_TILDA_SEND) return window.B79_TILDA_SEND(p, cb);          // живая страница Тильды
    if (window.top !== window && T) {                                          // тестовая версия во фрейме
      var id = "l" + (++seq) + Date.now();
      wait[id] = cb;
      setTimeout(function () { if (wait[id]) { delete wait[id]; cb(false, "timeout"); } }, 30000);
      parent.postMessage({ type: "b79-lead", id: id, payload: p }, T);
      return;
    }
    cb(false, "no-sink");
  };
})();
