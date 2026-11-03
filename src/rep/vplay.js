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
/* 02.11.2026: иностранные обзоры YouTube (англ., нем.) — во всплывающем плеере с русскими субтитрами
   (автоперевод YouTube). Ролик не перезаливаем — смотрится с канала автора. */
(function () {
  var dlg, box, ttl, fr, last;
  function build() {
    var st = document.createElement("style");
    st.textContent = ".ypl{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(6,6,10,.86);padding:16px}.ypl[hidden]{display:none}" +
      ".ypl__box{width:min(1100px,100%);display:flex;flex-direction:column;gap:10px}.ypl__bar{display:flex;align-items:center;gap:12px;color:#fff;font:600 16px/1.3 Montserrat,system-ui,sans-serif}" +
      ".ypl__t{flex:1;min-width:0}.ypl__n{display:block;font-weight:400;font-size:13px;opacity:.75}.ypl__x{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:26px;line-height:1;cursor:pointer}" +
      ".ypl__x:focus-visible{outline:2px solid #8B6BFF;outline-offset:2px}.ypl__f{position:relative;width:100%;aspect-ratio:16/9;max-height:calc(100vh - 120px);background:#000;border-radius:14px;overflow:hidden}.ypl__f iframe{position:absolute;inset:0;width:100%;height:100%;border:0}";
    document.head.appendChild(st);
    dlg = document.createElement("div"); dlg.className = "ypl"; dlg.hidden = true;
    dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "ypl-t");
    dlg.innerHTML = '<div class="ypl__box"><div class="ypl__bar"><span class="ypl__t" id="ypl-t"></span><button type="button" class="ypl__x" aria-label="Закрыть видео">×</button></div><div class="ypl__f"></div></div>';
    document.body.appendChild(dlg); box = dlg.querySelector(".ypl__f"); ttl = dlg.querySelector(".ypl__t");
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest(".ypl__x")) close(); });
    document.addEventListener("keydown", function (e) { if (!dlg.hidden && e.key === "Escape") close(); });
  }
  function open(a, id, t) {
    if (!dlg) build(); last = a;
    ttl.innerHTML = ""; ttl.appendChild(document.createTextNode(t)); var n = document.createElement("span"); n.className = "ypl__n"; n.textContent = "Русские субтитры — автоперевод YouTube"; ttl.appendChild(n);
    var lang = id === "dV1ApTmbYx0" ? "de" : "en";
    fr = document.createElement("iframe");
    fr.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&enablejsapi=1&hl=ru&cc_load_policy=1&cc_lang_pref=ru";
    fr.title = t; fr.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture"; fr.referrerPolicy = "strict-origin-when-cross-origin";
    var f = fr, send = function (o) { try { f.contentWindow.postMessage(JSON.stringify(o), "*"); } catch (x) {} };
    fr.addEventListener("load", function () {
      send({ event: "listening", id: 1 });
      [1200, 3500, 7000].forEach(function (ms) { setTimeout(function () { if (fr !== f) return; send({ event: "command", func: "loadModule", args: ["captions"] }); send({ event: "command", func: "setOption", args: ["captions", "track", { languageCode: lang, translationLanguage: { languageCode: "ru", languageName: "Русский" } }] }); }, ms); });
    });
    box.appendChild(fr); dlg.hidden = false; document.documentElement.style.overflow = "hidden"; dlg.querySelector(".ypl__x").focus();
  }
  function close() { if (fr) { fr.remove(); fr = null; } dlg.hidden = true; document.documentElement.style.overflow = ""; if (last) last.focus(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var m = a.href.match(/(?:v=|youtu\.be\/)([\w-]{11})/); if (!m) return;
    var t = a.getAttribute("data-vt") || ((a.querySelector(".rvt__t, .fv__t") || {}).textContent) || a.textContent || "";
    if (/[а-яё]/i.test(t) && m[1] !== "dV1ApTmbYx0") return; /* русские ролики — как раньше */
    e.preventDefault(); open(a, m[1], t.trim() || "Видеообзор");
  });
})();
