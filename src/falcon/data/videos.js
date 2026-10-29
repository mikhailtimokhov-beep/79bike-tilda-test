// Видеообзоры для прототипа. Реальных ссылок на ролики пока нет — все записи заглушки.
// pinned — закреплённые статичные обзоры модели (по ТЗ: «заранее залитые статичные видео про модель»).
// Решение Михаила 19.10.2026: закреплённые ролики — самые популярные ролики модели из группы ВКонтакте 79Bike
// (vk.com/79bike), подберём в конце проекта. До этого — заглушки с рабочими названиями.
// fresh — «последние с Rutube»: в Tilda заменяется виджетом канала Rutube (подгружает новые ролики автоматически).
// Названия pinned — рабочие, из content.js (CONTENT.reviews.pinned). url → канал, пока нет ссылок на ролики.
(function () {
  var CH = "https://rutube.ru/channel/65461061/";
  var P = (window.CONTENT && window.CONTENT.reviews && window.CONTENT.reviews.pinned) || {};
  function pin(slug, i, dur) {
    var t = (P[slug] && P[slug][i]) || "Обзор " + (i + 1);
    return { id: slug + "-pin-" + (i + 1), slug: slug, title: t, duration: dur, url: CH, placeholder: true };
  }
  window.VIDEOS = {
    channel: CH,
    pinned: {
      "gt": [pin("gt", 0, "12:40"), pin("gt", 1, "9:15")],
      "pro": [pin("pro", 0, "14:05"), pin("pro", 1, "8:30")],
      "lynx-trail": [pin("lynx-trail", 0, "10:20"), pin("lynx-trail", 1, "7:45")],
      "light": [pin("light", 0, "9:50"), pin("light", 1, "6:35")],
      "lynx-x": [pin("lynx-x", 0, "5:10"), pin("lynx-x", 1, "4:25")],
      "surge-v": [pin("surge-v", 0, "13:30"), pin("surge-v", 1, "8:55")]
    },
    // Свежие ролики канала (по разным моделям), новые сверху. 12 штук: показываем 4, «Ещё» раскрывает по 4.
    fresh: [
      { id: "f1", slug: "gt", title: "Falcon GT: зимняя эксплуатация", date: "2026-10-14", duration: "11:02" },
      { id: "f2", slug: "pro", title: "Falcon Pro: настройка вилки Fastace", date: "2026-10-09", duration: "7:18" },
      { id: "f3", slug: "lynx-trail", title: "Lynx Trail: музыка через Bluetooth", date: "2026-10-02", duration: "6:40" },
      { id: "f4", slug: "light", title: "Falcon Lite: первый выезд новичка", date: "2026-09-26", duration: "9:12" },
      { id: "f5", slug: "gt", title: "GT против Pro: что выбрать", date: "2026-09-19", duration: "15:30" },
      { id: "f6", slug: "surge-v", title: "Surge V: полноразмерный эндуро в лесу", date: "2026-09-12", duration: "10:05" },
      { id: "f7", slug: "pro", title: "Как заряжать батарею Falcon", date: "2026-09-05", duration: "5:44" },
      { id: "f8", slug: "lynx-trail", title: "Lynx Trail: посадка при росте 190 см", date: "2026-08-29", duration: "8:01" },
      { id: "f9", slug: "gt", title: "Falcon GT: рекуперация на спусках", date: "2026-08-22", duration: "6:55" },
      { id: "f10", slug: "light", title: "Falcon Lite: обслуживание цепи", date: "2026-08-15", duration: "7:30" },
      { id: "f11", slug: "pro", title: "Сборка Falcon Pro после доставки", date: "2026-08-08", duration: "12:10" },
      { id: "f12", slug: "lynx-x", title: "Lynx X: первые кадры", date: "2026-08-01", duration: "3:20" }
    ].map(function (v) { v.url = CH; v.placeholder = true; return v; })
  };
})();
