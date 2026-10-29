/* 79BIKE · страница успеха /spasibo для falcon-bike.ru и 79bike.ru (решение Михаила 29.10: «Проработай страницы успеха на обоих сайтах»).
   1) B79_THANKS(form, site) — вызывается только после подтверждения Тильды (заявка принята). Сохраняет короткую сводку
      без персональных данных (тип заявки, модель, дата визита, способ связи — без имени и телефона) в sessionStorage,
      отправляет цель Метрики lead_ok (если посетитель разрешил cookie) и возвращает адрес страницы успеха.
   2) B79_THANKS_RENDER(site) — разметка страницы успеха (общие классы обоих дизайнов: page-head, sec, btn, callout, chip).
   Прямой заход на /spasibo без заявки — общий текст. Страница закрыта от индексации (noindex в настройках Тильды). */
(function () {
  var KEY = "b79_thanks";
  function txt(el) { return el ? String(el.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function val(f, sel) { var el = f.querySelector(sel); return el && el.value ? String(el.value).trim() : ""; }
  function kindOf(f, site) {
    var id = f.id || "";
    if (site === "falcon") {
      if (id === "f-visit") return "testdrive";
      if (id === "f-order") return f.querySelector('input[name="ads"]') ? "notify" : "order";
      if (id === "f-credit") return "credit";
      if (id === "f-service") return "service";
      if (id === "f-parts") return "parts";
      if (id === "f-city") return "delivery";
      if (id === "f-blog") return "bloggers";
      return "consult";
    }
    if (f.querySelector('[name="channel"]')) return "bloggers";
    if (id === "pform" || f.querySelector('[name="company"]')) return "dealer";
    return "consult";
  }
  window.B79_THANKS = function (f, site) {
    try {
      var how = f.querySelector('input[name="how"]:checked, input[type="radio"]:checked');
      var model = "", ms = f.querySelector('select[name="model"]') || f.querySelector("select:not([data-visit-time])");
      if (ms && ms.value && ms.selectedOptions && ms.selectedOptions[0]) model = txt(ms.selectedOptions[0]);
      var m = /Консультация по (.+)$/.exec(f.getAttribute("aria-label") || "");
      if (!model && m) model = m[1];
      if (/^(ещё не выбрал|не выбрал|не знаю)/i.test(model)) model = "";
      if (site === "falcon" && !model && document.body.getAttribute("data-page") === "model") { var h = document.querySelector("h1"); if (h) model = txt(h).replace(/^Купить\s+/, ""); }
      var d = { k: kindOf(f, site), m: model.slice(0, 60), d: val(f, "[data-visit-date]"), t: val(f, "[data-visit-time]"), h: how ? String(how.value).slice(0, 30) : "", p: location.pathname, at: Date.now() };
      sessionStorage.setItem(KEY, JSON.stringify(d));
      try { window.CookieConsent && window.CookieConsent.goal && window.CookieConsent.goal("lead_ok", { kind: d.k, page: d.p }); } catch (e) {}
      return "/spasibo?k=" + d.k;
    } catch (e) { return "/spasibo"; }
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function dateRu(v) { var d = new Date(v + "T00:00"); return isNaN(d) ? v : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + " (" + d.toLocaleDateString("ru-RU", { weekday: "long" }) + ")"; }
  var PHONE = "+7 (999) 900-55-88", TEL = "tel:+79999005588";
  var ADDR = "Москва, ул. Речников, 21 — бизнес-пространство «Речников 21», м. «Кленовый бульвар»";
  var DELIV = ["Доставляем транспортной компанией по всей России.", "В Москве, Московской области и Санкт-Петербурге — оплата при получении.", "Посмотреть байк вживую можно в Москве и Московской области."];

  function content(site, d) {
    var k = d.k || "", m = d.m, how = d.h && !/Позвонить/i.test(d.h) ? d.h : "";
    var back = how ? "Ответим в " + how + "." : "Перезвоним с номера " + PHONE + ".";
    var F = site === "falcon";
    var T = {
      testdrive: { h: "Записали вас на тест-драйв", lead: (d.d ? "Дата визита: " + dateRu(d.d) + (d.t ? ", около " + d.t + ":00" : "") + ". " : "") + "Менеджер свяжется, согласует время и подтвердит визит.",
        steps: ["Менеджер свяжется с вами и подтвердит дату и время. " + back, "Условия: с 18 лет; залог за байк — наличными; при повреждениях вы платите за байк.", "Адрес шоурума: " + ADDR + ". Визит — по предварительному звонку."],
        links: [["/contacts", "Как добраться"], ["/compare", "Сравнить модели"], ["/faq", "Вопрос-ответ"]] },
      order: { h: "Заявка" + (m ? " на " + m : "") + " принята", lead: "Менеджер подтвердит заказ и уточнит доставку и способ оплаты. Заполнять анкету не нужно.",
        steps: ["Менеджер свяжется с вами. " + back].concat(DELIV), links: [["/delivery", "Доставка и оплата"], ["/rassrochka", "Рассрочка"], ["/test-drive", "Тест-драйв"]] },
      notify: { h: "Сообщим о старте продаж", lead: "Как только " + (m || "модель") + " можно будет заказать, мы позвоним или напишем.",
        steps: ["Ничего больше делать не нужно — заявка сохранена.", "Пока ждёте, посмотрите модели, которые уже в продаже."], links: [["/compare", "Сравнить модели"], ["/podbor", "Подбор по росту и весу"], ["/video", "Видеообзоры"]] },
      credit: { h: "Заявка на рассрочку принята", lead: "Менеджер поможет выбрать банк и оформить заявку.",
        steps: ["Менеджер свяжется с вами. " + back, "Рассрочку оформляем через Т-Банк и POSCREDIT. Вопросы по рассрочке — кредитному менеджеру: <a href=\"tel:+79995765727\">+7 (999) 576-57-27</a>, <a href=\"https://t.me/lubava90\" target=\"_blank\" rel=\"noopener\">Telegram</a>."], links: [["/rassrochka", "Условия рассрочки"], ["/delivery", "Доставка и оплата"]], raw: true },
      service: { h: "Заявка в сервис принята", lead: "Мастер свяжется и подскажет, что делать.",
        steps: ["Мастер свяжется с вами. " + back, "Если можно, подготовьте фото или видео неисправности — так быстрее разобраться."], links: [["/warranty", "Гарантия и сервис"], ["/instructions", "Инструкции"], ["/faq", "Вопрос-ответ"]] },
      parts: { h: "Заявка на запчасть принята", lead: "Менеджер уточнит модель, год выпуска и наличие детали.",
        steps: ["Менеджер свяжется с вами. " + back, "Фото детали можно прислать в мессенджер — так подберём точнее."], links: [["/accessories", "Каталог запчастей"], ["/delivery", "Доставка и оплата"]] },
      delivery: { h: "Рассчитаем доставку", lead: "Менеджер посчитает стоимость и сроки доставки" + (m ? " " + m : "") + " до вашего города.",
        steps: ["Менеджер свяжется с вами. " + back].concat(DELIV), links: [["/delivery", "Доставка и оплата"], ["/rassrochka", "Рассрочка"]] },
      bloggers: { h: "Заявка от блогера принята", lead: "Посмотрим ваш канал и ответим.",
        steps: ["Ответим в течение нескольких дней. " + (how ? "Напишем в " + how + "." : ""), F ? "Условия тест-драйва для обзора — на странице «Блогерам»." : "Доставка оплачивается отдельно. Готовый обзор публикуем в наших каналах и в каналах блогера."], links: F ? [["/bloggers", "Блогерам"], ["/video", "Видеообзоры"]] : [["/#events", "События"], ["/blog", "Блог"]] },
      dealer: { h: "Заявка на дилерство принята", lead: "Менеджер 79BIKE свяжется с вами и расскажет об условиях сотрудничества.",
        steps: ["Менеджер свяжется с вами. " + back, "Розничные цены у всех дилеров одинаковые — рекомендованная цена 79BIKE."], links: [["/#dealers", "Дилерам"], ["/garant", "Гарантия"], ["/factory", "Производство"]] },
      consult: { h: "Заявка принята", lead: (m ? "Консультация по " + m + ". " : "") + (F ? "Менеджер поможет с выбором, посчитает доставку и расскажет о рассрочке." : "Специалист 79BIKE свяжется с вами и ответит на вопросы."),
        steps: ["Мы свяжемся с вами в ближайшее время. " + back], links: F ? [["/compare", "Сравнить модели"], ["/podbor", "Подбор по росту и весу"], ["/delivery", "Доставка и оплата"]] : [["/blog", "Блог"], ["/instructions", "Инструкции"], ["/garant", "Гарантия"]] }
    };
    var c = T[k];
    if (!c) c = { h: "Спасибо!", lead: "Если вы оставили заявку, мы свяжемся с вами в ближайшее время.", steps: ["Не нашли, что искали? Позвоните или напишите нам — подскажем."], links: F ? [["/", "На главную"], ["/compare", "Сравнить модели"]] : [["/", "На главную"], ["/blog", "Блог"]] };
    return c;
  }

  window.B79_THANKS_RENDER = function (site) {
    var d = {}; try { d = JSON.parse(sessionStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    var qk = new URLSearchParams(location.search).get("k");
    if (!d.k && qk) d.k = qk.replace(/[^a-z]/g, "");
    if (d.at && Date.now() - d.at > 864e5) d = { k: d.k };
    var c = content(site, d);
    var item = function (s) { return "<li>" + (c.raw ? s : esc(s)) + "</li>"; };
    var check = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    var back = d.p && d.p !== "/spasibo" ? '<a class="btn btn--ghost" href="' + esc(d.p) + '">Вернуться на страницу</a>' : '<a class="btn btn--ghost" href="/">На главную</a>';
    return '<style>.ty{display:grid;gap:22px;max-width:760px}.ty__ok{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(118,88,245,.16);color:#7658f5}.ty__steps{margin:0;padding-left:1.2em;display:grid;gap:10px;line-height:1.5}.ty__row{display:flex;flex-wrap:wrap;gap:10px}.ty__h{margin:6px 0 12px;font-size:18px}.ty a.chip,.ty a.btn{text-decoration:none}.ty .callout p{margin:0}</style>' +
      '<section class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Навигация"><a href="/">Главная</a><span aria-hidden="true">/</span><span>Заявка принята</span></nav>' +
      '<span class="ty__ok">' + check + '</span><h1 class="h1">' + esc(c.h) + '</h1><p class="t-lead">' + esc(c.lead) + '</p></div></section>' +
      '<section class="sec"><div class="wrap"><div class="ty"><div><h2 class="ty__h">Что дальше</h2><ol class="ty__steps">' + c.steps.map(item).join("") + '</ol></div>' +
      '<div><h2 class="ty__h">Не хотите ждать?</h2><div class="ty__row"><a class="btn btn--main" href="' + TEL + '">Позвонить ' + PHONE + '</a>' +
      '<a class="btn btn--ghost" href="https://wa.me/79999005588" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn--ghost" href="https://t.me/Meliso_group" target="_blank" rel="noopener">Telegram</a><a class="btn btn--ghost" href="https://vk.me/79bike" target="_blank" rel="noopener">VK Мессенджер</a></div></div>' +
      '<div><h2 class="ty__h">Пока ждёте</h2><div class="ty__row">' + c.links.map(function (l) { return '<a class="chip" href="' + l[0] + '">' + esc(l[1]) + "</a>"; }).join("") + "</div></div>" +
      '<div class="ty__row">' + back + "</div></div></div></section>";
  };
})();
