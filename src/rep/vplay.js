/* 30.10.2026: свои ролики 79BIKE (mp4 на сайте) — во всплывающем плеере, без перехода на YouTube.
   Работает для любой ссылки на .mp4 из папки vid/ (карточки «Производства», видео в вопросах, ролики Surge V). */
(function () {
  var dlg, vid, ttl, last;
  function build() {
    var st = document.createElement("style");
    st.textContent = ".vpl{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(6,6,10,.86);padding:16px}" +
      ".vpl[hidden]{display:none}.vpl__box{width:min(1100px,100%);max-height:100%;display:flex;flex-direction:column;gap:10px}" +
      ".vpl__bar{display:flex;align-items:center;gap:12px;color:#fff;font:600 16px/1.3 Montserrat,system-ui,sans-serif}" +
      ".vpl__t{flex:1;min-width:0}.vpl__x{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:26px;line-height:1;cursor:pointer}" +
      ".vpl__x:focus-visible{outline:2px solid #8B6BFF;outline-offset:2px}.vpl video{width:100%;max-height:calc(100vh - 110px);aspect-ratio:16/9;background:#000;border-radius:14px}";
    document.head.appendChild(st);
    dlg = document.createElement("div"); dlg.className = "vpl"; dlg.hidden = true;
    dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "vpl-t");
    dlg.innerHTML = '<div class="vpl__box"><div class="vpl__bar"><span class="vpl__t" id="vpl-t"></span><button type="button" class="vpl__x" aria-label="Закрыть видео">×</button></div><video controls playsinline preload="metadata"></video></div>';
    document.body.appendChild(dlg);
    vid = dlg.querySelector("video"); ttl = dlg.querySelector(".vpl__t");
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest(".vpl__x")) close(); });
    document.addEventListener("keydown", function (e) { if (!dlg.hidden && e.key === "Escape") close(); });
  }
  function open(a) {
    if (!dlg) build();
    last = a;
    var t = a.getAttribute("data-vt") || (a.querySelector(".fv__t, .rvt__t") || {}).textContent || "Видео 79BIKE";
    ttl.textContent = t;
    vid.src = a.getAttribute("href"); dlg.hidden = false; document.documentElement.style.overflow = "hidden";
    var p = vid.play(); if (p && p.catch) p.catch(function () {});
    dlg.querySelector(".vpl__x").focus();
  }
  function close() {
    vid.pause(); vid.removeAttribute("src"); vid.load();
    dlg.hidden = true; document.documentElement.style.overflow = "";
    if (last) last.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href$=".mp4"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault(); open(a);
  });
})();
