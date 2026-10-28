/* 79BIKE · переводчик путей для нативной версии на Тильде (вставляется сборкой scripts/build-native.mjs).
   M — путь в сборке → адрес картинки на сервере Тильды; R — страница → адрес на Тильде; P — атрибуты <body>.
   Картинки и ссылки, которые скрипты сайта собирают на ходу, переводятся здесь и при вставке в страницу. */
(function (M, R, P) {
  window.B79_NATIVE = true;
  // статья блога по адресу /blog/<статья> (на Тильде — отдельная страница для каждой статьи)
  var bm = /^[/]blog[/]([a-z0-9-]+)[/]?$/.exec(location.pathname);
  if (bm) window.B79_BLOG_SLUG = bm[1];
  var SKIP = /^(https?:|data:|blob:|mailto:|tel:|#|[/])/;
  function route(page, search, hash) {
    var q = new URLSearchParams((search || "").replace(/^[?]/, "")), s = q.get("s");
    q.delete("s"); q.delete("v");
    var t = page === "blog" && s ? "/blog/" + s : R[page];
    var r = q.toString();
    return t + (r ? "?" + r : "") + (hash || "");
  }
  window.B79_ASSET = function (p) {
    if (!p || SKIP.test(p)) return p;
    var h = "", i = p.indexOf("#");
    if (i >= 0) { h = p.slice(i); p = p.slice(0, i); }
    var j = p.indexOf("?"), search = j >= 0 ? p.slice(j) : "", q = j >= 0 ? p.slice(0, j) : p;
    var k = q.replace(/^(\.\.[/])+/, "");
    if (!/^(assets|rep)[/]/.test(k)) k = "rep/" + k;
    if (/[/](icons|bike)\.svg$/.test(k)) return h;               // иконки встроены в страницу
    if (M[k]) return M[k] + h;
    var m = /^rep[/]([a-z-]+)\.html$/.exec(k);
    if (m && R[m[1]]) return route(m[1], search, h);
    return q + search + h;
  };
  function fixSet(v) {
    return v.split(",").map(function (x) { var a = x.trim().split(/\s+/); a[0] = window.B79_ASSET(a[0]); return a.join(" "); }).join(", ");
  }
  function fix(el) {
    if (el.nodeType !== 1) return;
    ["src", "poster", "data-src"].forEach(function (a) {
      var v = el.getAttribute(a);
      if (v && !SKIP.test(v)) { var n = window.B79_ASSET(v); if (n !== v) el.setAttribute(a, n); }
    });
    ["srcset", "data-srcset"].forEach(function (a) {
      var v = el.getAttribute(a);
      if (v && /\.(webp|jpe?g|png|svg)/.test(v) && !/tildacdn/.test(v)) { var n = fixSet(v); if (n !== v) el.setAttribute(a, n); }
    });
    if (el.tagName === "A") {
      var h = el.getAttribute("href");
      if (h && !SKIP.test(h) && /\.html([?#]|$)/.test(h)) { var n2 = window.B79_ASSET(h); if (n2 !== h) el.setAttribute("href", n2); }
    }
  }
  function walk(n) {
    fix(n);
    if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll("img,source,video,a,[data-src],[data-srcset]"), fix);
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { if (m.type === "attributes") fix(m.target); else Array.prototype.forEach.call(m.addedNodes, walk); });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset", "poster", "data-src", "data-srcset", "href"] });
  document.addEventListener("DOMContentLoaded", function () { walk(document.body); });
  for (var a in P) document.body.setAttribute(a, P[a]);
  document.body.classList.add("b79-native");
})(/*M*/{}, /*R*/{}, /*P*/{});
