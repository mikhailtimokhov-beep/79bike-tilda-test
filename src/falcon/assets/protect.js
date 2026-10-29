/*
 * protect.js — лёгкая защита страниц инструкций от бездумного копирования.
 * 26.10 (Михаил, вопрос 28): включено ВСЁ, в том числе строгий режим. Подключён только на instructions.html и manual-*.html.
 *
 * Что делает (каждое — отключаемо в CONFIG):
 *  1. Картинки: запрет перетаскивания, контекстного меню («Сохранить как…») и выделения.
 *  2. Текст: при копировании больше N символов добавляет подпись-источник со ссылкой.
 *     Сам текст копировать не мешаем (по умолчанию), чтобы не ломать доступность и цитирование.
 *  3. Водяная подпись поверх изображений — CSS-слой с текстом (картинка-файл не меняется).
 *  4. Строгий режим (выкл. по умолчанию): запрет выделения текста и контекстного меню на всей статье.
 *
 * Чего НЕ делает и не может: защитить от скриншота, «Просмотра кода», отключения JS,
 * сохранения страницы целиком, парсеров. Это «забор от случайных прохожих», а не DRM.
 *
 * Подключение (когда согласуют):  <script src="assets/protect.js" defer data-scope="#manual"></script>
 */
(function () {
  "use strict";
  var me = document.currentScript;
  var CONFIG = {
    scope: (me && me.getAttribute("data-scope")) || "#main", // где действует защита
    images: true,             // 1. картинки: drag / contextmenu / select
    copyNote: true,           // 2. подпись при копировании
    copyMin: 120,             //    подпись добавляется, если скопировано больше N символов
    copyText: "Источник: falcon-bike.ru — {url}. Копирование материалов без письменного разрешения правообладателя не допускается.",
    watermark: false,         // 3. подпись поверх картинок — 26.10 (правка 10): выключено, водяные знаки с фото убраны везде
    watermarkText: "falcon-bike.ru",
    watermarkSel: ".mn-other__pic img, figure img", // какие картинки подписывать
    strict: true              // 4. запрет выделения текста и правой кнопки на всей статье
  };

  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function inScope(el) { var r = document.querySelector(CONFIG.scope); return !!(r && el && r.contains(el)); }
  function isField(el) { return !!(el && el.closest && el.closest("input,textarea,select,[contenteditable='true']")); }

  ready(function () {
    var root = document.querySelector(CONFIG.scope);
    if (!root) return;

    /* стили — один тег, без внешних файлов */
    var css = "";
    if (CONFIG.images) css += CONFIG.scope + " img{-webkit-user-drag:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}";
    if (CONFIG.strict) css += CONFIG.scope + "{user-select:none;-webkit-user-select:none}" + CONFIG.scope + " input," + CONFIG.scope + " textarea{user-select:text;-webkit-user-select:text}";
    if (CONFIG.watermark) css +=
      ".pw-wm{position:relative}" +
      ".pw-wm::after{content:attr(data-wm);position:absolute;right:10px;bottom:8px;font:600 12px/1 Montserrat,system-ui,sans-serif;letter-spacing:.04em;color:rgba(0,0,0,.38);" +
      "text-shadow:0 0 2px rgba(255,255,255,.7);pointer-events:none;user-select:none}" +
      "@media print{.pw-wm::after{color:rgba(0,0,0,.5)}}";
    if (css) { var st = document.createElement("style"); st.setAttribute("data-protect", ""); st.textContent = css; document.head.appendChild(st); }

    /* 1. картинки */
    if (CONFIG.images) {
      root.addEventListener("dragstart", function (e) { if (e.target && e.target.tagName === "IMG") e.preventDefault(); });
      root.addEventListener("contextmenu", function (e) { if (e.target && e.target.tagName === "IMG") e.preventDefault(); });
    }

    /* 4. строгий режим: правая кнопка на всей статье (кроме полей ввода) */
    if (CONFIG.strict) {
      root.addEventListener("contextmenu", function (e) { if (!isField(e.target)) e.preventDefault(); });
    }

    /* 2. подпись при копировании (текст копируется, к нему добавляется источник) */
    if (CONFIG.copyNote) {
      document.addEventListener("copy", function (e) {
        var sel = window.getSelection ? window.getSelection() : null;
        if (!sel || sel.isCollapsed || !e.clipboardData) return;
        var node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode);
        if (!inScope(node) || isField(node)) return;
        var txt = sel.toString();
        if (txt.length < CONFIG.copyMin) return;
        var url = location.href.split("#")[0];
        var note = CONFIG.copyText.replace("{url}", url);
        try {
          e.clipboardData.setData("text/plain", txt + "\n\n" + note);
          var box = document.createElement("div"); box.appendChild(sel.getRangeAt(0).cloneContents());
          e.clipboardData.setData("text/html", box.innerHTML + '<p>' + note.replace(url, '<a href="' + url + '">' + url + "</a>") + "</p>");
          e.preventDefault();
        } catch (err) { /* браузер не дал доступ к буферу — копируем как есть */ }
      });
    }

    /* 3. водяная подпись на картинках: оборачиваем родителя, сам файл не трогаем */
    if (CONFIG.watermark) {
      [].forEach.call(root.querySelectorAll(CONFIG.watermarkSel), function (img) {
        var box = img.closest("figure") || img.parentNode;
        if (!box || box.classList.contains("pw-wm")) return;
        box.classList.add("pw-wm");
        box.setAttribute("data-wm", CONFIG.watermarkText);
      });
    }
  });
})();
