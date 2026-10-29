/* 27.10.2026 (Михаил): у каждой подписи «Запас хода», где нет сноски, — знак «?» и окно с объяснением. Общий файл для falcon-bike.ru и 79bike.ru. */
(function () {
  var TXT = '<p>Запас хода указан по данным производителя — для спокойной, равномерной езды на полностью заряженной батарее. В реальной поездке он зависит от условий.</p>' +
    '<p><b>Что уменьшает запас хода</b></p><ul><li>Большой вес райдера и груза</li><li>Высокая скорость и режим Sport</li><li>Затяжные подъёмы</li><li>Бездорожье: песок, грязь, глубокая трава</li><li>Холод — на морозе батарея отдаёт меньше энергии</li><li>Низкое давление в шинах</li></ul>' +
    '<p><b>Как проехать больше</b></p><ul><li>Ездите в Eco или Drive, плавно работайте газом</li><li>Держите давление в шинах по инструкции</li><li>Заряжайте и храните батарею в тепле</li><li>Перед поездкой заряжайте батарею полностью штатным зарядным устройством</li></ul>';
  var css = '.rq{display:inline-grid;place-items:center;width:18px;height:18px;margin-left:6px;padding:0;border-radius:50%;border:1.5px solid currentColor;background:none;color:inherit;font:700 11px/1 Montserrat,Arial,sans-serif;opacity:.75;cursor:pointer;vertical-align:1px;position:relative}' +
    '.rq::after{content:"";position:absolute;inset:-12px}.rq:hover,.rq:focus-visible{opacity:1;color:#A08BFF}' +
    '.rqd{width:min(520px,calc(100% - 24px));max-height:calc(100dvh - 24px);padding:22px 22px 18px;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:#16151C;color:#fff;overflow:auto;font:400 15px/1.5 Montserrat,Arial,sans-serif}' +
    '.rqd::backdrop{background:rgba(0,0,0,.7)}.rqd h3{margin:0 40px 10px 0;font-size:20px;font-weight:800}.rqd p{margin:0 0 8px;color:#D5D5DC}.rqd ul{margin:0 0 12px;padding-left:20px;color:#D5D5DC}.rqd li{margin:3px 0}' +
    '.rqd__x{position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;font-size:22px;line-height:1;cursor:pointer}.rqd__ok{display:block;width:100%;min-height:46px;margin-top:6px;border:0;border-radius:999px;background:#7658F5;color:#fff;font:700 15px Montserrat,Arial,sans-serif;cursor:pointer}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var d;
  function dlg() {
    if (d) return d;
    d = document.createElement("dialog"); d.className = "rqd"; d.setAttribute("aria-labelledby", "rqd-t");
    d.innerHTML = '<button type="button" class="rqd__x" aria-label="Закрыть">×</button><h3 id="rqd-t">Как считается запас хода</h3>' + TXT + '<button type="button" class="rqd__ok">Понятно</button>';
    d.addEventListener("click", function (e) { if (e.target === d || e.target.closest(".rqd__x,.rqd__ok")) d.close(); });
    document.body.appendChild(d); return d;
  }
  var SKIP = "details,.qa-more,.rqd,dialog,script,style,button,a,option,select,textarea,[contenteditable],.vh";
  function scan(root) {
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), n, hits = [];
    while ((n = w.nextNode())) {
      if (!/^\s*Запас хода:?\s*$/.test(n.nodeValue)) continue;
      var el = n.parentElement; if (!el || el.closest(SKIP)) continue;
      if (el.querySelector(".rq") || (el.nextElementSibling && el.nextElementSibling.classList && el.nextElementSibling.classList.contains("rq"))) continue;
      var row = el.closest("div,tr,li,p") || el;
      if (row.querySelector(".rng-q,.rq")) continue; /* уже есть сноска */
      hits.push(el);
    }
    hits.forEach(function (el) {
      var b = document.createElement("button"); b.type = "button"; b.className = "rq"; b.textContent = "?";
      b.setAttribute("aria-label", "Как считается запас хода"); b.setAttribute("aria-haspopup", "dialog");
      el.appendChild(b);
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".rq"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); var x = dlg(); if (x.showModal) x.showModal(); else x.setAttribute("open", "");
  }, true);
  var t; function later() { clearTimeout(t); t = setTimeout(function () { scan(); }, 120); }
  function start() { scan(); new MutationObserver(function (m) { if (m.some(function (r) { return r.addedNodes.length; })) later(); }).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
