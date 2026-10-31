/* Плеер Kinescope во всплывающем окне. Подключается сборкой (исходник прототипа не меняется).
   Ссылки на YouTube-ролики, которые уже лежат в Kinescope (window.B79_KINESCOPE), открываются прямо на сайте. */
(function () {
  var MAP = window.B79_KINESCOPE || {};
  var dlg, frame, lastFocus;
  function css() {
    var s = document.createElement("style");
    s.textContent = ".kdlg{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(5,5,10,.86);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}" +
      ".kdlg.is-open{display:flex}.kdlg__box{position:relative;width:min(1100px,100%);aspect-ratio:16/9;max-height:calc(100dvh - 96px);border-radius:16px;overflow:hidden;background:#000;box-shadow:0 20px 60px rgba(0,0,0,.6)}" +
      ".kdlg__box--v{width:min(100%,calc((100dvh - 96px)*9/16),484px);aspect-ratio:9/16}.kdlg__box iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
      ".kdlg__x{position:absolute;top:12px;right:12px;width:44px;height:44px;border:0;border-radius:50%;background:#7658F5;color:#fff;font:700 24px/1 Montserrat,system-ui,sans-serif;cursor:pointer;z-index:1}" +
      ".kdlg__x:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
      "@media (max-width:600px){.kdlg{padding:0}.kdlg__box{border-radius:0;max-height:100dvh}.kdlg__x{top:8px;right:8px}}";
    document.head.appendChild(s);
  }
  function build() {
    css();
    dlg = document.createElement("div");
    dlg.className = "kdlg"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-label", "Видео");
    dlg.innerHTML = '<button type="button" class="kdlg__x" aria-label="Закрыть видео">×</button><div class="kdlg__box"></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest(".kdlg__x")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && dlg.classList.contains("is-open")) close(); });
  }
  function open(id, title, vert) {
    if (!dlg) build();
    lastFocus = document.activeElement;
    frame = document.createElement("iframe");
    frame.src = "https://kinescope.io/embed/" + id + "?autoplay=1";
    frame.title = title || "Видео";
    frame.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write");
    frame.setAttribute("allowfullscreen", "");
    var box = dlg.querySelector(".kdlg__box"); box.classList.toggle("kdlg__box--v", !!vert); box.appendChild(frame);
    dlg.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    dlg.querySelector(".kdlg__x").focus();
  }
  function close() {
    dlg.classList.remove("is-open");
    if (frame) { frame.remove(); frame = null; }
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="youtube.com/watch"],a[href*="youtu.be/"],a[href*=".mp4"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    /* 31.10: свои ролики (vid/<имя>.mp4) — по имени файла; на Тильде самих mp4 нет */
    var f = a.href.match(/\/([\w-]+)\.mp4(?:[?#]|$)/), m = a.href.match(/(?:v=|youtu\.be\/)([\w-]{11})/), hit = (f && MAP[f[1]]) || (m && MAP[m[1]]);
    if (!hit) return;
    e.preventDefault(); e.stopPropagation();
    open(hit.k, a.getAttribute("data-vt") || hit.t, hit.v);
  }, true);
  window.B79_KINESCOPE_OPEN = open;
})();
