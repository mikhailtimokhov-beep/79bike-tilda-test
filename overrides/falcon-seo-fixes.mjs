// «Перенос», 04.11.2026 — SEO-261103-01 (SEO-URGENT-01, claude/seo-gsc-not-done-2026-11-03.md).
// Правки разметки и текстов поверх src/falcon (прототип «Сайтов»), чтобы утренняя синхронизация src их не стирала.
// Цены в Offer и sameAs не трогаем (Q-49 Б, Q-56). Значения характеристик = models.js (payloadKg 120, Surge V 115 — решения Михаила 26.10 и 28.10).

const FAQ_FROM = "с гарантией, запчастями и русскоязычной поддержкой";
const FAQ_TO = "с гарантией, сервисом и оригинальными запчастями в России";

// текстовые правки данных (применяются к исходнику файла до выполнения)
export function fixDataText(rel, text) {
  if (rel === "data/content.js" || rel === "data/seo.js") text = text.split(FAQ_FROM).join(FAQ_TO);
  return text;
}

function setProp(o, name, value) {
  for (const p of o.additionalProperty || []) if (p && p.name === name) p.value = value;
}

// правки объектов window.SEO_LD (после выполнения data/seo.js)
export function fixSeoLd(L) {
  if (!L) return L;
  // 06.11 «Перенос», SEO-261105-02 / SEO-261106-01 (ПРОВЕРЕНО Контролёр-261105-05): у /lynx-x (продажи с 2027) нет Product — BreadcrumbList, FAQPage, VideoObject остаются
  if (Array.isArray(L["model:lynx-x"])) L["model:lynx-x"] = L["model:lynx-x"].filter((o) => !(o && o["@type"] === "Product"));
  // 08.11 «Перенос», SEO-261107-01 п. 4 / SEO-261108-01 п. 3: VideoObject ролика Lynx X (первый в списке видео страницы, content.js «lynx-x»)
  if (Array.isArray(L["model:lynx-x"]) && !L["model:lynx-x"].some((o) => o && o["@type"] === "VideoObject")) L["model:lynx-x"].push({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Falcon Lynx X — 26 кВт на бездорожье",
    description: "Первые кадры Lynx X: прыжки, повороты и каменистый трейл. Старт продаж в России — 2027 год.",
    thumbnailUrl: ["https://static.tildacdn.com/tila3762-6561-4330-b164-343032383030/fb0443.webp"],
    uploadDate: "2026-11-01T12:00:00+03:00",
    duration: "PT20S",
    embedUrl: "https://kinescope.io/embed/vz5NznzgB8GvpnUSntuhTf",
    url: "https://falcon-bike.ru/lynx-x",
    publisher: { "@type": "Organization", name: "79BIKE", url: "https://falcon-bike.ru/" }
  });
  for (const [key, list] of Object.entries(L)) {
    for (const o of list || []) {
      if (!o || typeof o !== "object") continue;
      if (/^model:/.test(key) && o["@type"] === "Product") {
        delete o.category; // GSC «Данные о товарах продавца»: category как текст — ошибка
        if (key === "model:pro") delete o.color; // 242 символа
        if (key === "model:lynx-trail" || key === "model:lynx-x") setProp(o, "Максимальная нагрузка", 120);
        if (key === "model:surge-v") { setProp(o, "Максимальная скорость", 115); o.color = "Белый графит, Серый графит"; }
        if (typeof o.color === "string" && o.color.length > 100) delete o.color;
      }
      if ((key === "home" || key === "contacts") && o.paymentAccepted !== undefined) delete o.paymentAccepted;
    }
  }
  return L;
}
