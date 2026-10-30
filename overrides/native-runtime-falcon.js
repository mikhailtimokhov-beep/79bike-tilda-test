/* Falcon Bike · переводчик путей для нативной версии на Тильде (вставляется сборкой scripts/build-falcon.mjs).
   M — путь в прототипе (assets/…) → адрес картинки на сервере Тильды; R — файл страницы (pro.html) → адрес на сайте (/falcon-pro);
   P — атрибуты <body> прототипа (data-page, data-slug, data-model, data-doc): на Тильде <body> общий, ставим их здесь. */
(function (M, R, P) {
  window.B79_NATIVE = true;
  var bm = /^[/]blog[/]([a-z0-9-]+)[/]?$/.exec(location.pathname);   // статья блога: /blog/<статья>
  if (bm) window.B79_BLOG_SLUG = bm[1];
  var SKIP = /^(https?:|data:|blob:|mailto:|tel:|#|[/])/;
  window.B79_ASSET = function (p) {
    if (!p || SKIP.test(p)) return p;
    var h = "", i = p.indexOf("#");
    if (i >= 0) { h = p.slice(i); p = p.slice(0, i); }
    var j = p.indexOf("?"), search = j >= 0 ? p.slice(j) : "", k = (j >= 0 ? p.slice(0, j) : p).replace(/^(\.[/])+/, "");
    var MM = window.B79_FB_MAP || M;                              // карта картинок — в общем подвале
    if (MM[k]) return MM[k] + h;
    var m = /^([a-z0-9-]+\.html)$/.exec(k);
    if (m && R[m[1]] !== undefined) {
      var q = new URLSearchParams(search.replace(/^[?]/, "")), s = q.get("s"); q.delete("s"); q.delete("v");
      var t = m[1] === "post.html" && s ? "/blog/" + s : R[m[1]], r = q.toString();
      return t + (r ? "?" + r : "") + h;
    }
    return k + search + h;
  };
  function fixSet(v) { return v.split(",").map(function (x) { var a = x.trim().split(/\s+/); a[0] = window.B79_ASSET(a[0]); return a.join(" "); }).join(", "); }
  function fix(el) {
    if (el.nodeType !== 1) return;
    ["src", "poster", "data-src"].forEach(function (a) { var v = el.getAttribute(a); if (v && !SKIP.test(v)) { var n = window.B79_ASSET(v); if (n !== v) el.setAttribute(a, n); } });
    ["srcset", "data-srcset"].forEach(function (a) { var v = el.getAttribute(a); if (v && /\.(webp|jpe?g|png|svg)/.test(v) && !/tildacdn/.test(v)) { var n = fixSet(v); if (n !== v) el.setAttribute(a, n); } });
    if (el.tagName === "image" || el.tagName === "IMAGE") { // картинки внутри SVG (примерка по росту, габариты): href / xlink:href
      ["href", "xlink:href"].forEach(function (a) { var v = el.getAttribute(a); if (v && !SKIP.test(v)) { var n = window.B79_ASSET(v); if (n !== v) { if (a === "href") el.setAttribute("href", n); else el.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n); } } });
    }
    if (el.tagName === "A") { var h = el.getAttribute("href"); if (h && !SKIP.test(h) && /\.html([?#]|$)/.test(h)) { var n2 = window.B79_ASSET(h); if (n2 !== h) el.setAttribute("href", n2); } }
    if (el.style && el.style.backgroundImage && /url\(["']?(?!https?:|data:)/.test(el.style.backgroundImage)) {
      el.style.backgroundImage = el.style.backgroundImage.replace(/url\((["']?)([^"')]+)\1\)/g, function (a, q, u) { return 'url("' + window.B79_ASSET(u) + '")'; });
    }
  }
  function walk(n) { fix(n); if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll("img,source,video,a,image,[data-src],[data-srcset],[style*=url]"), fix); }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { if (m.type === "attributes") fix(m.target); else Array.prototype.forEach.call(m.addedNodes, walk); });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset", "poster", "data-src", "data-srcset", "href", "xlink:href", "style"] });
  document.addEventListener("DOMContentLoaded", function () { walk(document.body); });
  for (var a in P) document.body.setAttribute(a, P[a]);
  document.body.classList.add("b79-native", "fb-native"); document.documentElement.classList.add("fb-native");
  // разметку прототип вставляет в начало <body>; на Тильде — в наш контейнер, заменяя готовый (пререндер) HTML
  window.B79_INSERT = function (html) {
    var r = document.getElementById("b79-root");
    if (!r) return document.body.insertAdjacentHTML("afterbegin", html);
    Array.prototype.forEach.call(document.querySelectorAll("[data-b79-pre], .b79-cont"), function (n) { n.parentNode.removeChild(n); });
    r.insertAdjacentHTML("afterend", html);
  };
})(/*M*/{}, /*R*/{}, /*P*/{});
