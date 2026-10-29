// SEO-данные прототипа falcon-bike.ru. ФАЙЛ СОБИРАЕТСЯ СКРИПТОМ /home/claude/falcon/seo/build-seo.js — правьте скрипт, не этот файл.
// Сборка: 2026-10-25. Источники: data/models.js (цены, характеристики), data/content.js (FAQ, контакты), data/photos.js.
// window.SEO[key] — title (≤60), description (≤160), canonical, og*, h1check (ожидаемый H1). key = body[data-page] или "model:" + body[data-slug]; у index.html — "home".
// window.SEO_LD[key] — массив объектов JSON-LD: каждый вставлять отдельным <script type="application/ld+json">.
// window.SEO_ALT[src] — alt по шаблону «Модель, цвет, вид» для каждого фото из photos.js.
// Без рейтингов и отзывов; Lynx X — без Offer (цена неизвестна, старт продаж 2027).
window.SEO_DEFAULTS = {
  "siteName": "FALCON-BIKE",
  "locale": "ru_RU",
  "twitterCard": "summary_large_image",
  "site": "https://falcon-bike.ru",
  "themeColor": null
};
window.SEO = {
  "home": {
    "title": "Электромотоциклы и электроэндуро 79BIKE — купить в Москве",
    "description": "Фирменный магазин 79BIKE с быстрой доставкой по РФ: электромотоциклы и электроэндуро Falcon, Lynx и Y-Volt. Шоурум и тест-драйв в Москве, запчасти в наличии.",
    "ogTitle": "Электромотоциклы 79BIKE: Falcon, Lynx и Y-Volt — официальный магазин",
    "ogDescription": "Falcon GT, Pro, Lynx Trail, Lite и Y-Volt Surge V с официальной гарантией. Шоурум в Москве по записи, доставка по России.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/",
    "h1check": "Электромотоциклы 79BIKE",
    "file": "index.html"
  },
  "model:gt": {
    "title": "Купить Falcon GT — электромотоцикл 17 кВт | 79BIKE",
    "description": "Falcon GT в официальном магазине 79BIKE: 17 кВт, 610 Н·м, 95 км/ч, батарея 40 Ач. Цена 372 000 ₽, официальная гарантия, рассрочка, доставка по России.",
    "ogTitle": "Falcon GT — электромотоцикл 17 кВт",
    "ogDescription": "17 кВт, 610 Н·м, 95 км/ч, батарея 40 Ач. Цена 372 000 ₽. Официальный магазин 79BIKE.",
    "ogImage": "assets/og/gt.jpg",
    "canonical": "https://falcon-bike.ru/falcongt",
    "h1check": "Электромотоцикл Falcon GT",
    "file": "gt.html"
  },
  "model:pro": {
    "title": "Купить Falcon Pro — лёгкий электромотоцикл | 79BIKE",
    "description": "Falcon Pro в официальном магазине 79BIKE: 10 кВт, 90 км/ч, 59 кг, батарея 35 Ач. Подходит новичкам. Цена 310 000 ₽, официальная гарантия.",
    "ogTitle": "Falcon Pro — лёгкий электромотоцикл 10 кВт",
    "ogDescription": "10 кВт, 90 км/ч, 59 кг — подходит новичкам. Цена 310 000 ₽. Официальный магазин 79BIKE.",
    "ogImage": "assets/og/pro.jpg",
    "canonical": "https://falcon-bike.ru/falcon-pro",
    "h1check": "Электромотоцикл Falcon Pro",
    "file": "pro.html"
  },
  "model:light": {
    "title": "Купить Falcon Lite — электромотоцикл для новичков | 79BIKE",
    "description": "Falcon Lite в официальном магазине 79BIKE: 8 кВт, 84 км/ч, сиденье 820 мм, зарядка 3 ч. Для начинающих. Цена 280 000 ₽, официальная гарантия.",
    "ogTitle": "Falcon Lite — электромотоцикл для начинающих",
    "ogDescription": "8 кВт, 84 км/ч, сиденье 820 мм, зарядка 3 ч. Цена 280 000 ₽. Официальный магазин 79BIKE.",
    "ogImage": "assets/og/light.jpg",
    "canonical": "https://falcon-bike.ru/falcon_lite",
    "h1check": "Электромотоцикл Falcon Lite",
    "file": "lite.html"
  },
  "model:lynx-trail": {
    "title": "Купить Falcon Lynx Trail — электроэндуро | 79BIKE",
    "description": "Falcon Lynx Trail для высоких райдеров: сиденье 855 мм, мотор с редуктором, 405 Н·м, батарея 40 Ач, нагрузка до 120 кг. Цена 355 000 ₽.",
    "ogTitle": "Falcon Lynx Trail — электроэндуро для высоких райдеров",
    "ogDescription": "Сиденье 855 мм, редуктор, 405 Н·м, батарея 40 Ач, Bluetooth-колонка. Цена 355 000 ₽.",
    "ogImage": "assets/og/lynx-trail.jpg",
    "canonical": "https://falcon-bike.ru/lynx",
    "h1check": "Электромотоцикл Falcon Lynx Trail",
    "file": "lynx-trail.html"
  },
  "model:lynx-x": {
    "title": "Falcon Lynx X — электроэндуро 26 кВт, старт продаж 2027",
    "description": "Falcon Lynx X: 26 кВт, 550 Н·м, батарея 60 Ач, до 128 км, сиденье 870 мм. Старт продаж — 2027. Оставьте номер — официальный магазин 79BIKE сообщит о старте.",
    "ogTitle": "Falcon Lynx X — старт продаж в 2027 году",
    "ogDescription": "26 кВт, 550 Н·м, батарея 60 Ач, до 128 км. Оставьте номер — сообщим о старте продаж.",
    "ogImage": "assets/og/lynx-x.jpg",
    "canonical": "https://falcon-bike.ru/lynx-x",
    "h1check": "Электромотоцикл Falcon Lynx X",
    "file": "lynx-x.html"
  },
  "model:surge-v": {
    "title": "Купить Y-Volt Surge V — электроэндуро 35 кВт в Москве",
    "description": "Y-Volt Surge V: 35 кВт, 948 Н·м, до 115 км/ч, сиденье 900 мм. Цена 495 000 ₽. Фирменный магазин 79BIKE: тест-драйв в Москве и МО, доставка по РФ.",
    "ogTitle": "Y-Volt Surge V — полноразмерный электроэндуро",
    "ogDescription": "35 кВт, 948 Н·м, до 115 км/ч, цвета «Белый графит» и «Серый графит». Цена 495 000 ₽. Официальный магазин 79BIKE.",
    "ogImage": "assets/og/surge-v.jpg",
    "canonical": "https://falcon-bike.ru/surge-v",
    "h1check": "Электромотоцикл Y-Volt Surge V",
    "file": "surge-v.html"
  },
  "podbor": {
    "title": "Подбор электромотоцикла по росту и опыту | 79BIKE",
    "description": "Подберите электромотоцикл Falcon, Lynx или Y-Volt за минуту: рост, вес, опыт и где будете ездить. Сравните посадку и запишитесь на тест-драйв в Москве и МО.",
    "ogTitle": "Подбор электромотоцикла по росту и опыту",
    "ogDescription": "Ответьте на несколько вопросов — подскажем модель Falcon, Lynx или Y-Volt под ваш рост и опыт.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/podbor",
    "h1check": "Подбор электромотоцикла по росту и опыту",
    "file": "podbor.html"
  },
  "compare": {
    "title": "Сравнение электромотоциклов Falcon, Lynx и Y-Volt | 79BIKE",
    "description": "Все модели Falcon, Lynx и Y-Volt в одной таблице: мощность, скорость, батарея, запас хода, вес, высота сиденья и цены. Выберите электромотоцикл под себя.",
    "ogTitle": "Сравнение электромотоциклов Falcon, Lynx и Y-Volt",
    "ogDescription": "Мощность, скорость, батарея, запас хода, вес и высота сиденья всех моделей в одной таблице.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/compare",
    "h1check": "Сравнение моделей Falcon, Lynx и Y-Volt",
    "file": "compare.html"
  },
  "video": {
    "title": "Видеообзоры электромотоциклов Falcon, Lynx и Y-Volt | 79BIKE",
    "description": "Обзоры и тест-драйвы Falcon GT, Pro, Lynx Trail, Lite, Lynx X и Y-Volt Surge V на канале 79BIKE в RUTUBE. Смотрите байки на бездорожье и трассе.",
    "ogTitle": "Видеообзоры Falcon, Lynx и Y-Volt",
    "ogDescription": "Обзоры и тест-драйвы электромотоциклов Falcon, Lynx и Y-Volt на канале 79BIKE в RUTUBE.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/video",
    "h1check": "Видеообзоры электромотоциклов Falcon",
    "file": "video.html"
  },
  "delivery": {
    "title": "Доставка и оплата электромотоциклов по России | 79BIKE",
    "description": "Наш курьер — Москва, МО и города до 600 км, за 1–2 дня. Другие города — транспортной компанией, от 2 дней; в Петербурге — оплата при получении в пункте выдачи.",
    "ogTitle": "Доставка электромотоциклов по России",
    "ogDescription": "Москва и ближайшие города — наш курьер, регионы — ПЭК, Деловые линии и другие ТК. Запчасти — СДЭК.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/delivery",
    "h1check": "Доставка и оплата",
    "file": "delivery.html"
  },
  "credit": {
    "title": "Электромотоцикл в рассрочку — Т-Банк и POSCREDIT | 79BIKE",
    "description": "Рассрочка на электромотоциклы Falcon, Lynx и Y-Volt через Т-Банк или POSCREDIT на 6, 12 или 24 месяца. Заявка в Т-Банк — онлайн. Официальный магазин 79BIKE.",
    "ogTitle": "Электромотоцикл в рассрочку на 6, 12 или 24 месяца",
    "ogDescription": "Т-Банк или POSCREDIT. Менеджер рассчитает платёж для выбранной модели.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/rassrochka",
    "h1check": "Рассрочка на электромотоциклы",
    "file": "credit.html"
  },
  "warranty": {
    "title": "Гарантия и сервис электромотоциклов Falcon | 79BIKE",
    "description": "Официальная гарантия 79BIKE — 6 месяцев на контроллер, батарею, двигатель и раму. Сервис и оригинальные запчасти в России.",
    "ogTitle": "Гарантия 6 месяцев и сервис в России",
    "ogDescription": "Контроллер, батарея, двигатель и рама. Ремонт, запчасти и техподдержка — в России.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/warranty",
    "h1check": "Гарантия и сервис",
    "file": "warranty.html"
  },
  "parts": {
    "title": "Запчасти и аксессуары для Falcon, Lynx и Y-Volt | 79BIKE",
    "description": "Оригинальные запчасти и зарядные устройства для электромотоциклов Falcon, Lynx и Y-Volt. Подберём деталь по модели, отправим СДЭК по России.",
    "ogTitle": "Запчасти и аксессуары для Falcon, Lynx и Y-Volt",
    "ogDescription": "Оригинальные запчасти и расходники в наличии. Отправляем СДЭК по России.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/accessories",
    "h1check": "Запчасти и аксессуары",
    "file": "parts.html"
  },
  "faq": {
    "title": "Вопросы об электромотоциклах Falcon, Lynx и Y-Volt | 79BIKE",
    "description": "Ответы на частые вопросы: права и регистрация, запас хода, зарядка, езда в дождь, гарантия, доставка, рассрочка и тест-драйв в Москве и МО.",
    "ogTitle": "Вопрос-ответ об электромотоциклах Falcon, Lynx и Y-Volt",
    "ogDescription": "Права, заряд, дождь, гарантия, доставка, рассрочка и тест-драйв.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/faq",
    "h1check": "Вопрос-ответ",
    "file": "faq.html"
  },
  "testdrive": {
    "title": "Тест-драйв электромотоциклов в Москве и МО | 79BIKE",
    "description": "Тест-драйв Falcon GT, Pro, Lite, Lynx Trail и Y-Volt Surge V в шоуруме «Речников 21» в Москве. Для жителей Москвы и МО, по предварительной записи. Шлем и защиту выдаём.",
    "ogTitle": "Тест-драйв электромотоциклов 79BIKE в Москве",
    "ogDescription": "Шоурум «Речников 21»: тест-драйв Falcon и Y-Volt Surge V по предварительной записи. Москва и МО.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/test-drive",
    "h1check": "Тест-драйв электромотоциклов в Москве и МО",
    "file": "testdrive.html"
  },
  "contacts": {
    "title": "Шоурум электромотоциклов в Москве — контакты | 79BIKE",
    "description": "Шоурум Falcon, Lynx и Y-Volt в Москве, ул. Речников, 21 (м. «Кленовый бульвар»). Визит в удобное время по звонку, тест-драйв для Москвы и МО. Тел. +7 (999) 900-55-88.",
    "ogTitle": "Шоурум Falcon, Lynx и Y-Volt в Москве — по записи",
    "ogDescription": "Бизнес-пространство «Речников 21», в удобное для вас время по предварительному звонку. Тест-драйв — Москва и МО.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/contacts",
    "h1check": "Шоурум и контакты",
    "file": "contacts.html"
  },
  "events": {
    "title": "События 79BIKE — выставки и тест-драйвы | 79BIKE",
    "description": "Выставки, тест-драйвы и встречи с электромотоциклами 79BIKE: ближайшие события и фото с прошедших. Тест-драйв в шоуруме «Речников 21» в Москве.",
    "ogTitle": "События 79BIKE — выставки и тест-драйвы",
    "ogDescription": "Ближайшие выставки и тест-драйвы 79BIKE, фото и итоги прошедших событий.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/events",
    "h1check": "События 79BIKE",
    "file": "events.html"
  },
  "blog": {
    "title": "Блог 79BIKE: выбор и обслуживание электромотоциклов",
    "description": "Статьи о выборе, сравнении, зарядке и обслуживании электромотоциклов Falcon, Lynx и Y-Volt от официального магазина 79BIKE в Москве.",
    "ogTitle": "Блог 79BIKE: выбор и обслуживание электромотоциклов",
    "ogDescription": "Как выбрать электромотоцикл, чем отличаются модели Falcon, как заряжать и хранить байк.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/blog",
    "h1check": "Блог 79BIKE",
    "file": "blog.html"
  },
  "bloggers": {
    "title": "Блогерам: электромотоцикл на тест-драйв для обзора | 79BIKE",
    "description": "Сотрудничество 79BIKE с блогерами: тест-драйв Falcon и Lynx для обзора, материалы бренда, партнёрские форматы. Заявка онлайн, шоурум в Москве.",
    "ogTitle": "Блогерам и медиа — тест-драйв электромотоцикла для обзора",
    "ogDescription": "Дадим электромотоцикл 79BIKE на тест-драйв для обзора и обсудим партнёрство.",
    "ogImage": "assets/og/brand.jpg",
    "canonical": "https://falcon-bike.ru/bloggers",
    "h1check": "Блогерам и медиа",
    "file": "bloggers.html"
  }
};
window.SEO_LD = {
  "home": [
    {
      "@context": "https://schema.org",
      "@type": [
        "Store",
        "MotorcycleDealer"
      ],
      "@id": "https://falcon-bike.ru/#store",
      "name": "FALCON-BIKE",
      "alternateName": "Falcon-Bike — официальный магазин 79BIKE в России",
      "description": "FALCON-BIKE — официальный магазин 79BIKE в России. Продаём электромотоциклы Falcon, Lynx и Y-Volt с официальной гарантией, обслуживаем, держим запчасти в наличии и доставляем по всей России. Шоурум в Москве: визит по предварительному звонку, тест-драйв — для жителей Москвы и Московской области.",
      "url": "https://falcon-bike.ru/",
      "logo": "https://falcon-bike.ru/assets/logo/logo-dark.png",
      "image": "https://falcon-bike.ru/assets/photos/pro-black-violet-1.webp",
      "telephone": "+7-999-900-55-88",
      "email": "Sales@79bike.ru",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "RU",
        "addressLocality": "Москва",
        "streetAddress": "ул. Речников, 21, бизнес-пространство «Речников 21»"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Россия"
      },
      "brand": [
        {
          "@type": "Brand",
          "name": "79BIKE"
        },
        {
          "@type": "Brand",
          "name": "Falcon"
        },
        {
          "@type": "Brand",
          "name": "Y-Volt"
        }
      ],
      "currenciesAccepted": "RUB",
      "paymentAccepted": "Банковская карта, наличные, рассрочка",
      "sameAs": [
        "https://rutube.ru/channel/65461061/",
        "https://vk.com/79bike",
        "https://t.me/Meliso_group"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://falcon-bike.ru/#website",
      "name": "FALCON-BIKE",
      "alternateName": "Falcon-Bike",
      "url": "https://falcon-bike.ru/",
      "inLanguage": "ru-RU",
      "publisher": {
        "@id": "https://falcon-bike.ru/#store"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Нужны ли права и регистрация?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Байки продаются как спортивный инвентарь и предназначены для езды по бездорожью, трассам и закрытым площадкам, где права и регистрация не требуются. ПТС для всех электрических байков не предусмотрен, на учёт они не ставятся. При этом у моделей Falcon и Lynx мощность может быть ограничена режимом Eco до 3,9 кВт. Режим Eco не меняет тип транспортного средства."
          }
        },
        {
          "@type": "Question",
          "name": "Какой максимальный вес райдера?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "По данным производителя: Falcon GT — 120 кг, Falcon Pro — 120 кг, Y-Volt Surge V — 120 кг, Falcon Lite — 120 кг, Falcon Lynx X — 120 кг, Falcon Lynx Trail — 120 кг."
          }
        },
        {
          "@type": "Question",
          "name": "Какая максимальная скорость?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Y-Volt Surge V — 115 км/ч, Falcon Lynx X — 100 км/ч, Falcon GT — 95 км/ч, Falcon Pro и Lynx Trail — 90 км/ч, Falcon Lite — 84 км/ч. Скорость зависит от режима: максимум — в Sport."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько можно проехать на одном заряде?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Falcon Lite — 60–80 км, Falcon GT, Pro и Lynx Trail — 60–120 км, Lynx X — 60–128 км, Y-Volt Surge V — до 120 км. Реальный запас хода зависит от веса райдера, рельефа, скорости и режима: в Eco вы проедете больше, чем в Sport."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько времени занимает зарядка?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Falcon Lite и Y-Volt Surge V заряжаются за 3 ч, GT и Pro — за 3,5 ч, Lynx Trail и Lynx X — за 4 ч. Используйте штатное зарядное устройство: с несовместимым зарядником гарантия на батарею не действует."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько циклов зарядки выдерживает батарея?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "800–1000 полных циклов зарядки. Чтобы батарея служила дольше, заряжайте её штатным зарядным устройством и не храните байк долго полностью разряженным."
          }
        }
      ]
    }
  ],
  "contacts": [
    {
      "@context": "https://schema.org",
      "@type": [
        "Store",
        "MotorcycleDealer"
      ],
      "@id": "https://falcon-bike.ru/#store",
      "name": "FALCON-BIKE",
      "alternateName": "Falcon-Bike — официальный магазин 79BIKE в России",
      "description": "FALCON-BIKE — официальный магазин 79BIKE в России. Продаём электромотоциклы Falcon, Lynx и Y-Volt с официальной гарантией, обслуживаем, держим запчасти в наличии и доставляем по всей России. Шоурум в Москве: визит по предварительному звонку, тест-драйв — для жителей Москвы и Московской области.",
      "url": "https://falcon-bike.ru/",
      "logo": "https://falcon-bike.ru/assets/logo/logo-dark.png",
      "image": "https://falcon-bike.ru/assets/photos/pro-black-violet-1.webp",
      "telephone": "+7-999-900-55-88",
      "email": "Sales@79bike.ru",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "RU",
        "addressLocality": "Москва",
        "streetAddress": "ул. Речников, 21, бизнес-пространство «Речников 21»"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Россия"
      },
      "brand": [
        {
          "@type": "Brand",
          "name": "79BIKE"
        },
        {
          "@type": "Brand",
          "name": "Falcon"
        },
        {
          "@type": "Brand",
          "name": "Y-Volt"
        }
      ],
      "currenciesAccepted": "RUB",
      "paymentAccepted": "Банковская карта, наличные, рассрочка",
      "sameAs": [
        "https://rutube.ru/channel/65461061/",
        "https://vk.com/79bike",
        "https://t.me/Meliso_group"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Контакты",
          "item": "https://falcon-bike.ru/contacts"
        }
      ]
    }
  ],
  "model:gt": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/falcongt#product",
      "name": "Falcon GT",
      "model": "GT",
      "brand": {
        "@type": "Brand",
        "name": "79BIKE"
      },
      "category": "Электромотоцикл",
      "description": "Флагман линейки: 17 кВт, 610 Н·м и 95 км/ч. Для райдеров, которые уже уверенно чувствуют байк. Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму.",
      "url": "https://falcon-bike.ru/falcongt",
      "image": [
        "https://falcon-bike.ru/assets/photos/gt-black-1.webp",
        "https://falcon-bike.ru/assets/photos/gt-white-1.webp"
      ],
      "color": "чёрный, белый: Exclusive Black (эксклюзивный чёрный), Exclusive White (эксклюзивный белый)",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 69,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 17,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 95,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент",
          "value": 610,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 72,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 40,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "Samsung 50S"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "60–120"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 3.5,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 830,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "1900 × 780 × 1080"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 69,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 120,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 70/100-19, зад 3.0 × 18"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормозные диски, мм",
          "value": "220 × 2,8"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Ход 85 мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco, Drive, Sport, N, задний ход"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "NFC-запуск",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Официальная гарантия",
          "value": "Есть: контроллер, батарея, двигатель и рама"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://falcon-bike.ru/falcongt",
        "price": 372000,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://falcon-bike.ru/#store"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Россия"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Falcon GT",
          "item": "https://falcon-bike.ru/falcongt"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/falcongt#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Какая максимальная скорость у Falcon GT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "95 км/ч. Пиковая мощность мотора — 17 кВт, крутящий момент — 610 Н·м."
          }
        },
        {
          "@type": "Question",
          "name": "Подойдёт ли Falcon GT новичку?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "GT рассчитан на райдеров с опытом: это самая мощная модель Falcon в наличии. Если вы только начинаете, катайтесь в режиме Eco или присмотритесь к Falcon Pro и Falcon Lite — они проще в управлении."
          }
        },
        {
          "@type": "Question",
          "name": "Чем Falcon GT отличается от Falcon Pro?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "У GT мощнее мотор — 17 кВт против 10 кВт, выше момент — 610 Н·м против 410 Н·м, и скорость — 95 км/ч против 90 км/ч. Батарея GT больше — 40 Ач на элементах Samsung, а заднее колесо шире. Pro легче на 10 кг и проще для новичка."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько Falcon GT проезжает на одном заряде?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "60–120 км. Запас хода зависит от веса райдера, рельефа, скорости и режима. Батарея заряжается полностью за 3,5 ч."
          }
        },
        {
          "@type": "Question",
          "name": "В каких цветах есть Falcon GT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Модельный ряд 2026 года и позднее производится в чёрном и белом цветах — Exclusive Black и Exclusive White. Наличие цвета уточняйте у менеджера при заказе."
          }
        }
      ]
    }
  ],
  "model:pro": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/falcon-pro#product",
      "name": "Falcon Pro",
      "model": "Pro",
      "brand": {
        "@type": "Brand",
        "name": "79BIKE"
      },
      "category": "Электромотоцикл",
      "description": "10 кВт, 90 км/ч и 59 кг — самый лёгкий Falcon. Простой в управлении: подойдёт новичку и тем, кто катается для удовольствия. Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму.",
      "url": "https://falcon-bike.ru/falcon-pro",
      "image": [
        "https://falcon-bike.ru/assets/photos/pro-black-violet-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-violet-4.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-violet-2.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-violet-3.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-red-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-red-2.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-yellow-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-black-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-violet-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-violet-2.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-red-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-red-2.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-yellow-1.webp",
        "https://falcon-bike.ru/assets/photos/pro-silver-yellow-2.webp"
      ],
      "color": "Black Edition (чёрная серия), Black Purple (чёрный с фиолетовым), Black Red (чёрный с красным), Black Yellow (чёрный с жёлтым), Silver Purple (серебристый с фиолетовым), Silver Red (серебристый с красным), Silver Yellow (серебристый с жёлтым)",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 59,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 10,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 90,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент",
          "value": 410,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 72,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 35,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "LG M50T"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "60–120"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 3.5,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 820,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1260,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "1870 × 780 × 1080"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 59,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 120,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 70/100-19, зад 70/100-19"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормозные диски, мм",
          "value": "220 × 2,8"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Ход 85 мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco, Drive, Sport, N, задний ход"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "NFC-запуск",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Официальная гарантия",
          "value": "Есть: контроллер, батарея, двигатель и рама"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://falcon-bike.ru/falcon-pro",
        "price": 310000,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://falcon-bike.ru/#store"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Россия"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Falcon Pro",
          "item": "https://falcon-bike.ru/falcon-pro"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/falcon-pro#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Какая максимальная скорость у Falcon Pro?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "90 км/ч. Пиковая мощность мотора — 10 кВт, крутящий момент — 410 Н·м."
          }
        },
        {
          "@type": "Question",
          "name": "Подойдёт ли Falcon Pro новичку?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да. Pro — самый лёгкий Falcon, 59 кг, и прощает ошибки. Начните в режиме Eco, а когда освоитесь, переключайтесь на Drive и Sport."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли ездить на Falcon Pro в дождь?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да. Влагозащита Falcon Pro — IP67, дождь и лужи ему не помеха. Но не мойте байк под сильным напором и не заезжайте в глубокий брод: попадание воды внутрь узлов не покрывается гарантией."
          }
        },
        {
          "@type": "Question",
          "name": "Какие цвета есть у Falcon Pro?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Рама чёрная или серебристая со вставками фиолетового, жёлтого или красного цвета: Black Purple, Black Red, Black Yellow, Silver Purple, Silver Red и Silver Yellow. К чёрной раме есть ещё полностью чёрный вариант Black Edition (чёрная серия). Наличие сочетания уточняйте у менеджера."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько Falcon Pro проезжает на одном заряде?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "60–120 км в зависимости от веса райдера, рельефа, скорости и режима. Полная зарядка — 3,5 ч."
          }
        }
      ]
    }
  ],
  "model:light": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/falcon_lite#product",
      "name": "Falcon Lite",
      "model": "Lite",
      "brand": {
        "@type": "Brand",
        "name": "79BIKE"
      },
      "category": "Электромотоцикл",
      "description": "Самый доступный Falcon: 8 кВт, 84 км/ч и только то, что действительно нужно для езды. Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму.",
      "url": "https://falcon-bike.ru/falcon_lite",
      "image": [
        "https://falcon-bike.ru/assets/photos/light-black-1.webp",
        "https://falcon-bike.ru/assets/photos/light-black-2.webp",
        "https://falcon-bike.ru/assets/photos/light-black-3.webp",
        "https://falcon-bike.ru/assets/photos/light-black-6.webp",
        "https://falcon-bike.ru/assets/photos/light-black-4.webp",
        "https://falcon-bike.ru/assets/photos/light-black-5.webp",
        "https://falcon-bike.ru/assets/photos/light-black-7.webp"
      ],
      "color": "чёрный: Black Edition (чёрная серия)",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 63,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 8,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 84,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент",
          "value": 340,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 72,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 30,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "LG NMC M50LT"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "60–80"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 3,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 820,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1240,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "1860 × 780 × 1090"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 63,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 120,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 70/100-19, зад 3.0 × 18"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормозные диски, мм",
          "value": "220 × 2,3 (перед) · 203 × 2,3 (зад)"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Ход 85 мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco, Drive, Sport, N, задний ход"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "NFC-запуск",
          "value": "Нет"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Нет"
        },
        {
          "@type": "PropertyValue",
          "name": "Официальная гарантия",
          "value": "Есть: контроллер, батарея, двигатель и рама"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://falcon-bike.ru/falcon_lite",
        "price": 280000,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://falcon-bike.ru/#store"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Россия"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Falcon Lite",
          "item": "https://falcon-bike.ru/falcon_lite"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/falcon_lite#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Подойдёт ли Falcon Lite новичку?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да, это модель для начинающих. У Lite самая низкая посадка в линейке — 820 мм, как у Pro, мягкий режим Eco и понятное управление."
          }
        },
        {
          "@type": "Question",
          "name": "Чем Falcon Lite отличается от Falcon Pro?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lite проще и доступнее: 280 000 ₽ против 310 000 ₽, мотор 8 кВт против 10 кВт, батарея 30 Ач против 35 Ач, запас хода 60–80 км против 60–120 км, нет NFC-запуска. Зато зарядка быстрее — 3 ч, а сиденье такое же низкое — 820 мм."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько Falcon Lite проезжает на одном заряде?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "60–80 км в зависимости от веса райдера, рельефа и режима. Полная зарядка — 3 ч."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько стоит Falcon Lite?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "280 000 ₽ — это самый доступный Falcon. Lite можно взять в рассрочку: менеджер рассчитает ежемесячный платёж."
          }
        }
      ]
    }
  ],
  "model:lynx-trail": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/lynx#product",
      "name": "Falcon Lynx Trail",
      "model": "Lynx Trail",
      "brand": {
        "@type": "Brand",
        "name": "79BIKE"
      },
      "category": "Электроэндуро",
      "description": "Байк для высоких райдеров: редуктор с моментом 405 Н·м, задняя подвеска с ходом 200 мм и батарея 40 Ач. Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму.",
      "url": "https://falcon-bike.ru/lynx",
      "image": [
        "https://falcon-bike.ru/assets/photos/lynx-black-violet-1.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-violet-2.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-violet-3.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-violet-4.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-gold-1.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-gold-2.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-gold-3.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-gold-4.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-yellow-1.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-yellow-2.webp",
        "https://falcon-bike.ru/assets/photos/lynx-black-yellow-3.webp"
      ],
      "color": "Black Purple (чёрный с фиолетовым), Black Gold (чёрный с золотым), Black Yellow (чёрный с жёлтым)",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 69,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 10,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 90,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент",
          "value": 405,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Привод",
          "value": "Мотор с редуктором"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 72,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 40,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "LG NMC M50T"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "60–120"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 4,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 855,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 270,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "1900 × 780 × 1080"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 69,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 90,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 80/100-19, зад 3.0 × 18"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормозные диски, мм",
          "value": "220 × 2,8"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Ход 200 мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco, Drive, Sport, N, задний ход"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "NFC-запуск",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Официальная гарантия",
          "value": "Есть: контроллер, батарея, двигатель и рама"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://falcon-bike.ru/lynx",
        "price": 355000,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://falcon-bike.ru/#store"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Россия"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Falcon Lynx Trail",
          "item": "https://falcon-bike.ru/lynx"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/lynx#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "На какой рост рассчитан Falcon Lynx Trail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "На высоких райдеров: сиденье 855 мм, колёсная база 1270 мм, задняя подвеска с ходом 200 мм. Максимальная нагрузка по данным производителя — 120 кг. Если нужна посадка выше — посмотрите Lynx X с сиденьем 870 мм (старт продаж — 2027). Проверить посадку можно в блоке «Примерка по росту» выше на странице, а точно — на тест-драйве в шоуруме (по звонку)."
          }
        },
        {
          "@type": "Question",
          "name": "Как работает музыка и что умеет приложение?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "В Lynx Trail встроена Bluetooth-колонка: подключаете телефон и включаете треки с него прямо во время поездки. Байк поддерживает фирменное приложение 79Cloud (App Store и Google Play): запуск без ключа, данные поездки, настройка режимов, сервис и диагностика. В России оно пока работает в тестовом режиме: отдельные функции могут работать не всегда корректно, и производитель продолжает его дорабатывать. Основные функции байка от приложения не зависят — всё управление на руле. Актуальные возможности подскажет менеджер."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько стоит Falcon Lynx Trail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "355 000 ₽. Наличие цветов уточнит менеджер — оставьте номер или позвоните. Рассрочка доступна и на эту модель."
          }
        },
        {
          "@type": "Question",
          "name": "Чем Lynx Trail отличается от Lynx X?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lynx X — самая мощная версия линейки Lynx: 26 кВт против 10 кВт, батарея 60 Ач против 40 Ач, более широкое заднее колесо и сиденье выше — 870 мм против 855 мм. Lynx Trail уже в продаже, старт продаж Lynx X — 2027."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько заряжается Lynx Trail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Полная зарядка — 4 ч. Запас хода — 60–120 км в зависимости от веса райдера, рельефа и режима."
          }
        }
      ]
    }
  ],
  "model:lynx-x": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/lynx-x#product",
      "name": "Falcon Lynx X",
      "model": "Lynx X",
      "brand": {
        "@type": "Brand",
        "name": "79BIKE"
      },
      "category": "Электроэндуро",
      "description": "Самый мощный Falcon: 26 кВт, 550 Н·м и батарея 60 Ач. Старт продаж — 2027: оставьте номер, и мы сообщим о старте первыми. Цена будет объявлена к старту продаж.",
      "url": "https://falcon-bike.ru/lynx-x",
      "image": [
        "https://falcon-bike.ru/assets/photos/lynx-x-black-1.webp"
      ],
      "color": "Black Gold (чёрный с золотым)",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 83,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 26,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Номинальная мощность",
          "value": 13,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 100,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент",
          "value": 550,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Двигатель",
          "value": "PMSM (синхронный с постоянными магнитами)"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 72,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 60,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "LG RH60"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "60–128"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 4,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 870,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1320,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 280,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "1945 × 805 × 1150"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 83,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 100,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 80/100-19, зад 4.1-18"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормозные диски, мм",
          "value": "240 × 3,0"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Fastace, перевёрнутая, ход 225 мм · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Ход 220 мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco, Drive, Sport, N, задний ход"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "NFC-запуск",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Да, контурная Star Ring"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Falcon Lynx X",
          "item": "https://falcon-bike.ru/lynx-x"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/lynx-x#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Когда Falcon Lynx X поступит в продажу?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Старт продаж — 2027 год. Оставьте номер в форме «Сообщить о старте продаж» — мы позвоним или напишем, как только байк можно будет заказать."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько будет стоить Falcon Lynx X?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Цену объявим к старту продаж в 2027 году. Те, кто оставил номер, узнают её первыми."
          }
        },
        {
          "@type": "Question",
          "name": "Чем Lynx X отличается от Lynx Trail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lynx X мощнее — 26 кВт против 10 кВт, у него больше момент, батарея 60 Ач вместо 40 Ач, шире заднее колесо, крупнее тормозные диски и длиннее ход подвески. Обе модели рассчитаны на высоких райдеров, но у Lynx X сиденье выше — 870 мм против 855 мм. Lynx Trail уже в продаже, старт продаж Lynx X — 2027."
          }
        },
        {
          "@type": "Question",
          "name": "Кому подойдёт Lynx X?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Опытным и высоким райдерам, которые ездят по сложному бездорожью. Возраст райдера — с 18 лет, максимальная нагрузка — 120 кг. Новичкам лучше начать с Falcon Pro или Falcon Lite."
          }
        },
        {
          "@type": "Question",
          "name": "В каком цвете будет Falcon Lynx X?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Black Gold (чёрный с золотым): рама чёрная, вставки золотые — как у Lynx Trail в этой же расцветке. На фото — предсерийный образец из спецификации производителя."
          }
        }
      ]
    }
  ],
  "model:surge-v": [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://falcon-bike.ru/surge-v#product",
      "name": "Y-Volt Surge V",
      "model": "Surge V",
      "brand": {
        "@type": "Brand",
        "name": "Y-Volt"
      },
      "category": "Электроэндуро",
      "description": "Полноразмерный электроэндуро для профессионалов: 35 кВт пиковой мощности, 948 Н·м на колесе и до 115 км/ч. Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму.",
      "url": "https://falcon-bike.ru/surge-v",
      "image": [
        "https://falcon-bike.ru/assets/photos/surge-v-white-1.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-4.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-2.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-5.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-3.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-6.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-7.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-8.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-white-9.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-grey-1.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-grey-2.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-grey-3.webp",
        "https://falcon-bike.ru/assets/photos/surge-v-grey-4.webp"
      ],
      "color": "белый, серый",
      "weight": {
        "@type": "QuantitativeValue",
        "value": 95,
        "unitCode": "KGM"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Пиковая мощность",
          "value": 35,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Номинальная мощность",
          "value": 15,
          "unitCode": "KWT",
          "unitText": "кВт"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная скорость",
          "value": 110,
          "unitCode": "KMH",
          "unitText": "км/ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Крутящий момент на колесе",
          "value": 948,
          "unitCode": "NU",
          "unitText": "Н·м"
        },
        {
          "@type": "PropertyValue",
          "name": "Напряжение батареи",
          "value": 97,
          "unitCode": "VLT",
          "unitText": "В"
        },
        {
          "@type": "PropertyValue",
          "name": "Ёмкость батареи",
          "value": 45,
          "unitCode": "AMH",
          "unitText": "А·ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Элементы батареи",
          "value": "Samsung 50S"
        },
        {
          "@type": "PropertyValue",
          "name": "Запас хода, км",
          "value": "до 120 (при 25 км/ч)"
        },
        {
          "@type": "PropertyValue",
          "name": "Время зарядки",
          "value": 3,
          "unitCode": "HUR",
          "unitText": "ч"
        },
        {
          "@type": "PropertyValue",
          "name": "Высота сиденья",
          "value": 900,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёсная база",
          "value": 1360,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Клиренс",
          "value": 300,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Габариты (Д × Ш × В), мм",
          "value": "2000 × 830 × 1170"
        },
        {
          "@type": "PropertyValue",
          "name": "Вес",
          "value": 95,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Максимальная нагрузка",
          "value": 120,
          "unitCode": "KGM",
          "unitText": "кг"
        },
        {
          "@type": "PropertyValue",
          "name": "Колёса",
          "value": "перед 19″, зад 18″"
        },
        {
          "@type": "PropertyValue",
          "name": "Тормоза",
          "value": "Гидравлические дисковые, 4-поршневые суппорты"
        },
        {
          "@type": "PropertyValue",
          "name": "Передняя подвеска",
          "value": "Воздушная · регулировка сжатия и отскока"
        },
        {
          "@type": "PropertyValue",
          "name": "Задняя подвеска",
          "value": "Воздушная"
        },
        {
          "@type": "PropertyValue",
          "name": "Режимы езды",
          "value": "Eco (до 50 км/ч), Drive (до 80 км/ч), Sport (до 115 км/ч) · R — задний ход · P — парковка · N — удержание (Hold)"
        },
        {
          "@type": "PropertyValue",
          "name": "Влагозащита",
          "value": "IP67"
        },
        {
          "@type": "PropertyValue",
          "name": "Запуск по NFC",
          "value": "Есть"
        },
        {
          "@type": "PropertyValue",
          "name": "Свет",
          "value": "Полностью светодиодный: дальний и ближний"
        },
        {
          "@type": "PropertyValue",
          "name": "Ширина руля",
          "value": 810,
          "unitCode": "MMT",
          "unitText": "мм"
        },
        {
          "@type": "PropertyValue",
          "name": "Подсветка двигателя",
          "value": "Нет"
        },
        {
          "@type": "PropertyValue",
          "name": "Официальная гарантия",
          "value": "Есть: контроллер, батарея, двигатель и рама"
        }
      ],
      "offers": {
        "@type": "Offer",
        "url": "https://falcon-bike.ru/surge-v",
        "price": 495000,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@id": "https://falcon-bike.ru/#store"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Россия"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Y-Volt Surge V",
          "item": "https://falcon-bike.ru/surge-v"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/surge-v#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Что значит «полноразмерный эндуро»?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Это байк по размеру, весу и ходу подвески близкий к классическому кроссовому мотоциклу. У Surge V колёса 19″ и 18″, воздушная подвеска спереди и сзади, клиренс 300 мм и сиденье на высоте 900 мм. Он рассчитан на взрослого опытного райдера и серьёзное бездорожье, а не на прогулки по парку."
          }
        },
        {
          "@type": "Question",
          "name": "Какая максимальная скорость у Y-Volt Surge V?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "До 115 км/ч в режиме Sport. Пиковая мощность мотора — 35 кВт (47,6 л. с.), номинальная — 15 кВт, крутящий момент на колесе — 948 Н·м."
          }
        },
        {
          "@type": "Question",
          "name": "На какой рост рассчитан Surge V?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Высота сиденья — 900 мм, самая высокая в нашем каталоге. Комфортно на нём примерно от 165 см. Проверить посадку можно в блоке «Примерка по росту» выше на странице, а точно — на тест-драйве в шоуруме в Москве (по звонку)."
          }
        },
        {
          "@type": "Question",
          "name": "Кому подойдёт Y-Volt Surge V?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Опытным райдерам и тем, кто пересаживается с бензинового эндуро. Если вы только начинаете, выберите Falcon Pro или Falcon Lite."
          }
        },
        {
          "@type": "Question",
          "name": "Сколько стоит Y-Volt Surge V и есть ли он в наличии?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "495 000 ₽. Наличие и сроки поставки уточнит менеджер — оставьте номер или позвоните. Рассрочка доступна и на эту модель."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли прокатиться на Surge V перед покупкой?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да, если вы живёте в Москве или Московской области. Тест-драйв — в шоуруме «Речников 21», только по предварительной записи. Запишитесь по телефону или через форму — подготовим байк к вашему приезду."
          }
        },
        {
          "@type": "Question",
          "name": "Как доставляют Surge V?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "По Москве, МО и городам до 600 км от Москвы — нашим курьером за 1–2 дня. В другие города — транспортной компанией, от 2 дней. Байк едет в штатной заводской коробке 212 × 45 × 118 см, вес с упаковкой — 146 кг; груз застрахован."
          }
        },
        {
          "@type": "Question",
          "name": "Есть ли на Surge V официальная гарантия?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да. Surge V продаётся через фирменный магазин 79BIKE, поэтому на него действует официальная гарантия 6 месяцев, сервис и оригинальные запчасти в России."
          }
        }
      ]
    }
  ],
  "podbor": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Подбор электромотоцикла",
          "item": "https://falcon-bike.ru/podbor"
        }
      ]
    }
  ],
  "compare": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Сравнение моделей",
          "item": "https://falcon-bike.ru/compare"
        }
      ]
    }
  ],
  "video": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Видеообзоры",
          "item": "https://falcon-bike.ru/video"
        }
      ]
    }
  ],
  "delivery": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Доставка и оплата",
          "item": "https://falcon-bike.ru/delivery"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/delivery#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Как быстро доставите и сколько это стоит?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "По Москве и Московской области доставляем нашими курьерами — за 1–2 дня. Нашим курьером можем привезти байк собранным в радиусе до 600 км от Москвы. В регионы отправляем в течение двух рабочих дней через ПЭК, Деловые линии и другие транспортные компании — в штатной заводской коробке, она надёжно защищает байк. Все отправления застрахованы. Сроки — от 2 дней, зависят от транспортной компании; условия и стоимость обсудите с менеджером. Запчасти отправляем СДЭК."
          }
        },
        {
          "@type": "Question",
          "name": "Как оплатить и можно ли в рассрочку?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "В Москве и Московской области можно бесплатно забрать байк из шоурума «Речников 21», а при доставке нашим курьером оплатить при получении — предоплата только за доставку. Для регионов — полная предоплата до отправки, в Санкт-Петербурге — можно оплатить при получении в пункте выдачи; при доставке нашим курьером (в радиусе до 600 км от Москвы) — оплата при получении, предоплата только за доставку. Можно оформить рассрочку с процентами — условия на странице рассрочки."
          }
        }
      ]
    }
  ],
  "credit": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Рассрочка",
          "item": "https://falcon-bike.ru/rassrochka"
        }
      ]
    }
  ],
  "warranty": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Гарантия и сервис",
          "item": "https://falcon-bike.ru/warranty"
        }
      ]
    }
  ],
  "parts": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Запчасти и аксессуары",
          "item": "https://falcon-bike.ru/accessories"
        }
      ]
    }
  ],
  "faq": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Вопрос-ответ",
          "item": "https://falcon-bike.ru/faq"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://falcon-bike.ru/faq#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Какого размера коробка с байком?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Falcon (GT, Pro, Lite) и Lynx: 168 × 34 × 88 см, вес с упаковкой — 86 кг. Y-Volt Surge V: 212 × 45 × 118 см, 146 кг. Коробка стоит на деревянном поддоне — удобно грузить рохлей. Подходит для легковой машины с большим багажником или грузового такси — уточните размеры перед самовывозом."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли ездить в дождь и по лужам?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да. У всех моделей Falcon и у Y-Volt Surge V влагозащита IP67 — дождь и лужи им не помеха. Но не мойте байк под сильным напором и не заезжайте в глубокий брод: попадание воды внутрь узлов не покрывается гарантией."
          }
        },
        {
          "@type": "Question",
          "name": "Какая гарантия?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Официальная гарантия 79BIKE на контроллер, батарею, двигатель и раму. Гарантийный ремонт и техподдержка — в России. Доставка байка в сервис и обратно — за счёт покупателя; многие вопросы решаем дистанционно — диагностика по видео и отправка детали СДЭК. Подробные условия — на странице «Гарантия»."
          }
        },
        {
          "@type": "Question",
          "name": "Где взять запчасти и расходники?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "У нас. Как официальный магазин 79BIKE мы держим запчасти и расходники в наличии в России, поэтому ремонт не ждёт поставки из-за границы. Назовите модель — подберём нужную деталь; в регионы отправляем запчасти СДЭК."
          }
        },
        {
          "@type": "Question",
          "name": "Чем официальный байк отличается от «серого»?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Байки, ввезённые из других стран частным образом — не через официальный магазин 79BIKE и дилеров бренда, — блокируются после активации, и разблокировать их нельзя. На них нет гарантии, сервиса и техподдержки в России. Официальный байк вы получаете с гарантией, запчастями и русскоязычной поддержкой."
          }
        },
        {
          "@type": "Question",
          "name": "Байк приедет собранным?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Сборку и настройку байка мы делаем — условия уточняйте у менеджера. Если собираете сами, для каждой модели есть инструкция по сборке и эксплуатации, а техподдержка подскажет по телефону или в мессенджере."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли посмотреть байк вживую и прокатиться?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Да, если вы в Москве или Московской области: тест-драйв проводим только там. Шоурум — в Москве, в бизнес-пространстве «Речников 21». Приезжайте строго по предварительной договорённости: подготовим нужную модель и проведём тест-драйв по звонку. Приезжайте в удобное для вас время — просто позвоните заранее."
          }
        },
        {
          "@type": "Question",
          "name": "Можно ли вернуть байк?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Электромотоцикл — технически сложный товар, поэтому возврат после покупки невозможен. Мы хотим, чтобы вы были уверены в выборе заранее: поможем подобрать модель по росту и опыту, ответим на все вопросы, а в Москве и Московской области можно приехать на тест-драйв. Если с байком что-то случится — действует официальная гарантия."
          }
        },
        {
          "@type": "Question",
          "name": "Чем Falcon отличается от Sur-Ron и Talaria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Это байки одного класса — лёгкие электроэндуро, поэтому их удобно сравнивать по мощности, моменту, батарее и весу: все цифры Falcon есть в таблице сравнения. Для покупателя в России важнее другое: Falcon продаётся через официальный магазин 79BIKE и дилеров бренда, с гарантией, сервисом и запчастями здесь."
          }
        }
      ]
    }
  ],
  "events": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "События",
          "item": "https://falcon-bike.ru/events"
        }
      ]
    }
  ],
  "blog": [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": "https://falcon-bike.ru/blog#blog",
      "name": "Блог 79BIKE",
      "url": "https://falcon-bike.ru/blog",
      "inLanguage": "ru-RU",
      "publisher": {
        "@id": "https://falcon-bike.ru/#store"
      },
      "blogPost": [
        {
          "@type": "BlogPosting",
          "headline": "Зарядка и хранение электромотоцикла зимой",
          "url": "https://falcon-bike.ru/blog/zaryadka-i-hranenie-zimoy",
          "datePublished": "2026-10-24"
        },
        {
          "@type": "BlogPosting",
          "headline": "Электромотоцикл для подростка и новичка: на что смотреть",
          "url": "https://falcon-bike.ru/blog/elektromotocikl-dlya-podrostka-i-novichka",
          "datePublished": "2026-10-24"
        },
        {
          "@type": "BlogPosting",
          "headline": "Falcon Pro или Falcon GT: что выбрать",
          "url": "https://falcon-bike.ru/blog/falcon-pro-ili-falcon-gt",
          "datePublished": "2026-10-24"
        },
        {
          "@type": "BlogPosting",
          "headline": "Как выбрать электромотоцикл для бездорожья в 2026 году",
          "url": "https://falcon-bike.ru/blog/kak-vybrat-elektromotocikl",
          "datePublished": "2026-10-24"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Блог",
          "item": "https://falcon-bike.ru/blog"
        }
      ]
    }
  ],
  "bloggers": [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Электромотоциклы 79BIKE",
          "item": "https://falcon-bike.ru/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Блогерам и медиа",
          "item": "https://falcon-bike.ru/bloggers"
        }
      ]
    }
  ]
};
window.SEO_ALT = {
  "assets/photos/gt-black-1.webp": "Falcon GT, чёрный, вид сбоку",
  "assets/photos/gt-white-1.webp": "Falcon GT, белый, вид сбоку",
  "assets/photos/pro-black-violet-1.webp": "Falcon Pro, чёрный с фиолетовыми вставками, вид сбоку",
  "assets/photos/pro-black-violet-4.webp": "Falcon Pro, чёрный с фиолетовыми вставками, вид сбоку",
  "assets/photos/pro-black-violet-2.webp": "Falcon Pro, чёрный с фиолетовыми вставками, вид 3/4 спереди",
  "assets/photos/pro-black-violet-3.webp": "Falcon Pro, чёрный с фиолетовыми вставками, вид 3/4 спереди",
  "assets/photos/pro-black-red-1.webp": "Falcon Pro, чёрный с красными вставками, вид сбоку",
  "assets/photos/pro-black-red-2.webp": "Falcon Pro, чёрный с красными вставками, вид сбоку",
  "assets/photos/pro-black-yellow-1.webp": "Falcon Pro, чёрный с жёлтыми вставками, вид сбоку",
  "assets/photos/pro-black-grey-1.webp": "Falcon Pro, чёрный с серыми вставками, вид сбоку",
  "assets/photos/pro-black-1.webp": "Falcon Pro, полностью чёрный, вид сбоку",
  "assets/photos/pro-silver-violet-1.webp": "Falcon Pro, серебристый с фиолетовыми вставками, вид сбоку",
  "assets/photos/pro-silver-violet-2.webp": "Falcon Pro, серебристый с фиолетовыми вставками, вид сбоку",
  "assets/photos/pro-silver-red-1.webp": "Falcon Pro, серебристый с красными вставками, вид сбоку",
  "assets/photos/pro-silver-red-2.webp": "Falcon Pro, серебристый с красными вставками, вид сбоку",
  "assets/photos/pro-silver-yellow-1.webp": "Falcon Pro, серебристый с жёлтыми вставками, вид сбоку",
  "assets/photos/pro-silver-yellow-2.webp": "Falcon Pro, серебристый с жёлтыми вставками, вид сбоку",
  "assets/photos/lynx-black-violet-1.webp": "Falcon Lynx Trail, чёрный с фиолетовыми вставками, вид сбоку",
  "assets/photos/lynx-black-violet-2.webp": "Falcon Lynx Trail, чёрный с фиолетовыми вставками, вид 3/4 спереди",
  "assets/photos/lynx-black-violet-3.webp": "Falcon Lynx Trail, чёрный с фиолетовыми вставками, вид 3/4 сзади",
  "assets/photos/lynx-black-violet-4.webp": "Falcon Lynx Trail, чёрный с фиолетовыми вставками, вид спереди",
  "assets/photos/lynx-black-gold-1.webp": "Falcon Lynx Trail, чёрный с золотыми вставками, вид сбоку",
  "assets/photos/lynx-black-gold-2.webp": "Falcon Lynx Trail, чёрный с золотыми вставками, вид 3/4 спереди",
  "assets/photos/lynx-black-gold-3.webp": "Falcon Lynx Trail, чёрный с золотыми вставками, вид 3/4 сзади",
  "assets/photos/lynx-black-gold-4.webp": "Falcon Lynx Trail, чёрный с золотыми вставками, вид спереди",
  "assets/photos/lynx-black-yellow-1.webp": "Falcon Lynx Trail, чёрный с жёлтыми вставками, вид сбоку",
  "assets/photos/lynx-black-yellow-2.webp": "Falcon Lynx Trail, чёрный с жёлтыми вставками, вид 3/4 спереди",
  "assets/photos/lynx-black-yellow-3.webp": "Falcon Lynx Trail, чёрный с жёлтыми вставками, вид спереди",
  "assets/photos/light-black-1.webp": "Falcon Lite, чёрный, вид сбоку",
  "assets/photos/light-black-2.webp": "Falcon Lite, чёрный, вид сбоку",
  "assets/photos/light-black-3.webp": "Falcon Lite, чёрный, вид 3/4 спереди",
  "assets/photos/light-black-6.webp": "Falcon Lite, чёрный, вид 3/4 спереди",
  "assets/photos/light-black-4.webp": "Falcon Lite, чёрный, вид 3/4 сзади",
  "assets/photos/light-black-5.webp": "Falcon Lite, чёрный, вид 3/4 сзади",
  "assets/photos/light-black-7.webp": "Falcon Lite, чёрный, вид спереди",
  "assets/photos/lynx-x-black-1.webp": "Falcon Lynx X, чёрный с золотыми вставками, вид сбоку",
  "assets/photos/surge-v-white-1.webp": "Y-Volt Surge V, Белый графит, вид сбоку",
  "assets/photos/surge-v-white-4.webp": "Y-Volt Surge V, Белый графит, вид сбоку",
  "assets/photos/surge-v-white-2.webp": "Y-Volt Surge V, Белый графит, вид 3/4 спереди",
  "assets/photos/surge-v-white-5.webp": "Y-Volt Surge V, Белый графит, вид 3/4 спереди",
  "assets/photos/surge-v-white-3.webp": "Y-Volt Surge V, Белый графит, вид 3/4 сзади",
  "assets/photos/surge-v-white-6.webp": "Y-Volt Surge V, Белый графит, вид 3/4 сзади",
  "assets/photos/surge-v-white-7.webp": "Y-Volt Surge V, Белый графит, деталь крупным планом",
  "assets/photos/surge-v-white-8.webp": "Y-Volt Surge V, Белый графит, деталь крупным планом",
  "assets/photos/surge-v-white-9.webp": "Y-Volt Surge V, Белый графит, деталь крупным планом",
  "assets/photos/surge-v-grey-1.webp": "Y-Volt Surge V, Серый графит, вид сбоку",
  "assets/photos/surge-v-grey-2.webp": "Y-Volt Surge V, Серый графит, вид 3/4 спереди",
  "assets/photos/surge-v-grey-3.webp": "Y-Volt Surge V, Серый графит, вид 3/4 спереди",
  "assets/photos/surge-v-grey-4.webp": "Y-Volt Surge V, Серый графит, вид спереди"
};
