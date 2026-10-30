// Единый источник характеристик для всего прототипа.
// Основа: таблица «79BIKE … .xlsx» от Михаила (лист «Сравнение моделей»), 18.10.2026,
// + ответы Михаила 19.10.2026: цены, мощности GT/Lynx Trail, колёса Pro, цвета, оснащение.
// Подвеска Falcon — 79bikeofficial.com (сравнительная таблица) и falcon-bike.ru (Fastace 2.0).
// Размеры Falcon GT / Pro / Lynx Trail / Lite (габариты, ширина руля, колёсная база, клиренс) — схемы из папки Михаила
// «Размеры байков» (assets/sizes/<slug>.webp), 19.10.2026. Высота сиденья — как на схемах (ответ Михаила 19.10.2026, четвёртая порция):
// Pro 820 мм (в таблице было 830). Lynx Trail — 855 мм (каталог 79BIKE 2026, решение Михаила 26.10.2026, как на falcon-bike.ru).
// Falcon Lynx X — лист спецификации производителя 79BIKE «LYNX X» (приложен Михаилом 19.10.2026); вес 83 кг с батареей — как в спецификации (шестая порция ответов),
// старт продаж — 2027 год, цвет — рама чёрная, вставки золотые (ответ Михаила 19.10.2026, четвёртая порция).
// oldPrice — зачёркнутая цена по текущему falcon-bike.ru (ответ Михаила 19.10.2026).
// Влагозащита IP67 — falcon-bike.ru (Falcon) и yvolt.com (Surge V). NFC — у всех, кроме Lite (ответ Михаила).
// Y-Volt Surge V — официальное руководство Y-VOLT (Surge V User Manual, техпараметры стр. 2; решение Михаила 26.10.2026 «ориентируемся на инструкцию»):
// 110 км/ч, 35 кВт / 47,6 л. с., 948 Н·м на колесе, 2000 × 830 × 1170 мм, база 1360, клиренс 300, руль 810 мм, 97 В 45 Ач Samsung 50S; цена 495 000 ₽ (ответ Михаила 19.10.2026, подтверждена в пятой порции), задний ход и режим N — ответ Михаила 19.10.2026 (третья порция).
// Строка «Цвета» (слайд 15) = поле colors: frame — цвета рамы, accents — цвета вставок, extra — отдельные варианты, names — утверждённые названия расцветок «English Name (русский)» (Михаил, 26.10.2026).
// flags — только то, что ещё не подтверждено (в прототипе — метка «сверить»). 26.10.2026: все флаги закрыты решениями Михаила.
window.MODELS = [
  {
    slug: "gt",
    page: "gt.html",
    // схема размеров из папки Михаила; seatMm — высота сиденья, напечатанная на схеме (для alt)
    sizeImage: { src: "assets/sizes/gt.webp", seatMm: 830 },
    name: "Falcon GT",
    brand: "79BIKE",
    order: 1,
    status: "available",
    tagline: "Флагманская мощная модель для продвинутых райдеров",
    useCase: "Идеально подойдёт для динамичной езды по бездорожью",
    audience: "Продвинутые райдеры",
    highlights: ["Широкое заднее колесо", "Большой дисплей", "Рекуперационный тормоз"],
    specs: {
      powerKw: 17,
      speedKmh: 95,
      torqueNm: 610,
      cells: "Samsung 50S",
      voltage: 72,
      capacityAh: 40,
      rangeKm: "60–120",
      seatMm: 830,
      wheelbaseMm: 1270,
      clearanceMm: 270,
      handlebarMm: 780,
      dimensions: { lengthMm: 1900, widthMm: 780, heightMm: 1080 }, // схема размеров; ширина — по рулю
      brakes: "220 × 2,8",
      wheels: { front: "70/100-19", rear: "3.0 × 18" },
      frontSuspension: "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока",
      rearSuspension: "Ход 85 мм",
      weightKg: 69,
      payloadKg: 120,            // макс. нагрузка — как на falcon-bike.ru (Lynx Trail: ответ Михаила 26.10.2026)
      chargeH: 3.5,
      modes: "Eco (мощность можно ограничить до 3,9 кВт), Drive, Sport, N, задний ход",
      ip: "IP67",
      nfc: true,
      motorLight: true
    },
    colors: { frame: ["Чёрный", "Белый"], accents: [], names: ["Exclusive Black (эксклюзивный чёрный)", "Exclusive White (эксклюзивный белый)"] },
    price: 372000,
    oldPrice: 420000,
    flags: []
  },
  {
    slug: "pro",
    page: "pro.html",
    // схема размеров из папки Михаила; seatMm — высота сиденья, напечатанная на схеме (для alt)
    sizeImage: { src: "assets/sizes/pro.webp", seatMm: 820 },
    name: "Falcon Pro",
    brand: "79BIKE",
    order: 2,
    status: "available",
    tagline: "Лёгкий и мощный прогулочный байк для любителей и новичков",
    useCase: "Идеально подойдёт для парков и лёгкого бездорожья",
    audience: "Любители и новички",
    highlights: ["Простое управление", "Лёгкий"],
    specs: {
      powerKw: 10,
      speedKmh: 90,
      torqueNm: 410,
      cells: "LG M50T",
      voltage: 72,
      capacityAh: 35,
      rangeKm: "60–120",
      seatMm: 820,               // как на схеме размеров (ответ Михаила 19.10.2026)
      wheelbaseMm: 1260,
      clearanceMm: 270,
      handlebarMm: 780,
      dimensions: { lengthMm: 1870, widthMm: 780, heightMm: 1080 },
      brakes: "220 × 2,8",
      wheels: { front: "70/100-19", rear: "70/100-19" },
      frontSuspension: "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока",
      rearSuspension: "Ход 85 мм",
      weightKg: 59,
      payloadKg: 120,            // макс. нагрузка — как на falcon-bike.ru (Lynx Trail: ответ Михаила 26.10.2026)
      chargeH: 3.5,
      modes: "Eco (мощность можно ограничить до 3,9 кВт), Drive, Sport, N, задний ход",
      ip: "IP67",
      nfc: true,
      motorLight: true
    },
    // 79bikeofficial.com: рама Kenshi Black или Silver Metallic со вставками фиолетовыми / красными / жёлтыми;
    // к чёрной раме — ещё полностью чёрный «Black Edition (чёрная серия)», бывш. «Эксклюзив Black» (25.10: серые вставки = тот же цвет, объединены)
    colors: { frame: ["Чёрный", "Серебристый"], accents: ["Фиолетовый", "Жёлтый", "Красный"], extra: ["Black Edition (чёрная серия)"], names: ["Black Purple (чёрный с фиолетовым)", "Black Red (чёрный с красным)", "Black Yellow (чёрный с жёлтым)", "Black Edition (чёрная серия)", "Silver Purple (серебристый с фиолетовым)", "Silver Red (серебристый с красным)", "Silver Yellow (серебристый с жёлтым)"] },
    price: 310000,
    oldPrice: 400000,
    flags: []
  },
  {
    slug: "lynx-trail",
    page: "lynx-trail.html",
    // схема размеров из папки Михаила; seatMm — высота сиденья, напечатанная на схеме (для alt)
    sizeImage: { src: "assets/sizes/lynx-trail.webp", seatMm: 855 },
    name: "Falcon Lynx Trail",
    brand: "79BIKE",
    order: 3,
    status: "available",
    tagline: "Мощный байк для высоких и крупных райдеров",
    useCase: "Идеально подойдёт для парков и лёгкого бездорожья",
    audience: "Высокие и крупные райдеры",
    highlights: ["Редуктор", "Музыка через Bluetooth", "Приложение 79BIKE"],
    specs: {
      powerKw: 10,
      speedKmh: 90,
      torqueNm: 405,
      drive: "Мотор с редуктором",   // ключевая особенность Lynx Trail (строка SPEC_EXTRA_ROWS «Привод»)
      cells: "LG NMC M50T",
      voltage: 72,
      capacityAh: 40,
      rangeKm: "60–120",
      seatMm: 855,               // каталог 79BIKE 2026 — решение Михаила 26.10.2026 (как на falcon-bike.ru)
      wheelbaseMm: 1270,
      clearanceMm: 270,
      handlebarMm: 780,
      dimensions: { lengthMm: 1900, widthMm: 780, heightMm: 1080 },
      brakes: "220 × 2,8 (перед и зад)",
      wheels: { front: "80/100-19", rear: "3.0 × 18" },
      frontSuspension: "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока",
      rearSuspension: "Ход 200 мм",
      weightKg: 69,
      payloadKg: 120,            // макс. нагрузка — как на falcon-bike.ru (Lynx Trail: ответ Михаила 26.10.2026)
      chargeH: 4,
      modes: "Eco (мощность можно ограничить до 3,9 кВт), Drive, Sport, N, задний ход",
      ip: "IP67",
      nfc: true,
      motorLight: true
    },
    // 79bikeofficial.com: Black/Gold, Black/Purple, Black/Yellow
    colors: { frame: ["Чёрный"], accents: ["Фиолетовый", "Золотой", "Жёлтый"], names: ["Black Purple (чёрный с фиолетовым)", "Black Gold (чёрный с золотым)", "Black Yellow (чёрный с жёлтым)"] },
    price: 355000,
    oldPrice: 390000,
    flags: []
  },
  {
    // slug и файл light / light.html оставлены прежними, чтобы не ломать ссылки, фото и якоря; название — Falcon Lite
    slug: "light",
    page: "light.html",
    // схема размеров из папки Михаила; seatMm — высота сиденья, напечатанная на схеме (для alt)
    sizeImage: { src: "assets/sizes/light.webp", seatMm: 820 },
    name: "Falcon Lite",
    brand: "79BIKE",
    order: 4,
    status: "available",
    tagline: "Байк для начинающих райдеров и любителей",
    useCase: "Идеально подойдёт для парков и загородных трасс",
    audience: "Начинающие райдеры",
    highlights: ["Выгодная цена", "Только самое необходимое"],
    specs: {
      powerKw: 8,
      speedKmh: 84,
      torqueNm: 340,
      cells: "LG NMC M50LT",
      voltage: 72,
      capacityAh: 30,
      rangeKm: "60–80",
      seatMm: 820,
      wheelbaseMm: 1240,
      clearanceMm: 270,
      handlebarMm: 780,
      dimensions: { lengthMm: 1860, widthMm: 780, heightMm: 1090 },
      brakes: "220 × 2,3 (перед) · 203 × 2,3 (зад)",
      wheels: { front: "70/100-19", rear: "3.0 × 18" },
      frontSuspension: "Fastace, перевёрнутая, ход 200 мм · регулировка сжатия и отскока",
      rearSuspension: "Ход 85 мм",
      weightKg: 63,
      payloadKg: 120,            // макс. нагрузка — как на falcon-bike.ru (Lynx Trail: ответ Михаила 26.10.2026)
      chargeH: 3,
      modes: "Eco (мощность можно ограничить до 3,9 кВт), Drive, Sport, N, задний ход",
      ip: "IP67",
      nfc: false,
      motorLight: false
    },
    colors: { frame: ["Чёрный"], accents: [], names: ["Black Edition (чёрная серия)"] },
    price: 280000,
    oldPrice: 330000,
    flags: []                  // тормоза перед 220 / зад 203 — как в данных falcon-bike.ru (26.10.2026)
  },
  {
    slug: "lynx-x",
    page: "lynx-x.html",
    name: "Falcon Lynx X",
    brand: "79BIKE",
    order: 5,
    status: "soon",
    tagline: "Самый мощный байк из линейки Lynx для высоких и крупных райдеров",
    useCase: "Безупречен для бездорожья и сложных участков",
    audience: "Высокие и крупные райдеры",
    highlights: ["Редуктор", "Максимум мощности", "Приложение"],
    // Спецификация производителя (лист 79BIKE «LYNX X»): размеры (сиденье 870, база 1320, клиренс 280, габариты) — оттуда;
    // вес 83 кг с батареей — как в спецификации производителя (ответ Михаила 19.10.2026, шестая порция). Пиковая мощность: в таблице 26, в спецификации 25,9.
    // Привод: в спецификации — цепь 428 (122 звена), про редуктор не сказано → строки «Привод» у Lynx X нет.
    launch: "2027",             // старт продаж (ответ Михаила 19.10.2026); цена неизвестна → «Скоро в продаже»
    specs: {
      powerKw: 26,
      ratedKw: 13,
      speedKmh: 100,
      torqueNm: 550,
      cells: "LG RH60",
      voltage: 72,
      capacityAh: 60,
      rangeKm: "60–128",        // спецификация: до 128 км при 40 км/ч
      seatMm: 870,
      wheelbaseMm: 1320,
      clearanceMm: 280,
      handlebarMm: 800,
      dimensions: { lengthMm: 1945, widthMm: 805, heightMm: 1150 },
      brakes: "240 × 3,0",
      wheels: { front: "80/100-19", rear: "4.1-18" },
      frontSuspension: "Fastace, перевёрнутая, ход 225 мм · регулировка сжатия и отскока",
      rearSuspension: "Ход 220 мм",
      weightKg: 83,             // с батареей, как в спецификации производителя (ответ Михаила 19.10.2026, шестая порция)
      payloadKg: 120, // Михаил 26.10: 120 кг
      chargeH: 4,
      chargeCurrent: "15 А (регулируется)",
      motorType: "PMSM (синхронный с постоянными магнитами)",
      controller: "72 В, синусоидальный векторный",
      frame: "Алюминий 6061 T4 и T6",
      chain: "428, 122 звена",
      commPort: "CAN",
      ageRange: "с 18 лет",
      modes: "Eco (мощность можно ограничить до 3,9 кВт), Drive, Sport, N, задний ход",
      ip: "IP67",
      nfc: true,
      motorLight: "Да, контурная Star Ring" // LED, интеллектуальная регулировка
    },
    // подписи строк только для этой модели (страница модели); в общей таблице сравнения — «Вес, кг»
    specLabels: { weightKg: "Вес (с батареей)" },
    // как Lynx Trail в золотом исполнении (ответ Михаила 19.10.2026)
    colors: { frame: ["Чёрный"], accents: ["Золотой"], names: ["Black Gold (чёрный с золотым)"] },
    price: null,                // неизвестна до старта продаж
    oldPrice: null,
    flags: []
  },
  {
    slug: "surge-v",
    page: "surge-v.html",
    name: "Y-Volt Surge V",
    brand: "Y-Volt",
    order: 6,
    status: "available",
    tagline: "Полноразмерный эндуро для профессионалов",
    useCase: "Идеально подойдёт для абсолютного бездорожья",
    audience: "Профессионалы",
    highlights: ["Полноразмерный эндуро", "Воздушная задняя подвеска", "NFC-запуск"],
    // Все цифры — официальное руководство Y-VOLT (стр. 2). Гарантия в руководстве и на yvolt.com — не условия в РФ, на сайте не используется.
    // Было yvolt.com. Гарантия производителя 1 год указана там же — это не условия в РФ, на сайте не используется.
    specs: {
      powerKw: 35,              // пиковая, 47,6 л. с.
      ratedKw: 15,              // номинальная
      speedKmh: 115, // решение Михаила 28.10
      torqueNm: 948,            // крутящий момент на колесе (руководство: Torque (wheel))
      cells: "Samsung 50S",      // тройной литий (NMC)
      voltage: 97,
      // batteryKwh не указываем (решение Михаила 26.10.2026): в руководстве только 97 В, 45 А·ч — так и выводим ёмкость
      capacityAh: 45,
      rangeKm: "до 120 (при 25 км/ч)",
      seatMm: 900,
      wheelbaseMm: 1360,
      clearanceMm: 300,
      payloadKg: 120,
      ageRange: "18–55 лет",
      handlebarMm: 810,         // руль алюминиевый 28,6/22,1 × 810 мм
      dimensions: { lengthMm: 2000, widthMm: 830, heightMm: 1170 }, // габаритная ширина
      brakes: null,             // гидравлические 4-поршневые, размер дисков не указан
      brakeType: "Гидравлические дисковые, 4-поршневые суппорты", // официальное руководство Y-VOLT; размер дисков не указан
      wheels: { front: "80/100-19", rear: "100/90-18" },
      // руководство: «Front, rear air suspension» — марка вилки и ход не указаны
      frontSuspension: "Вилка профессионального уровня (Pro-grade)",
      rearSuspension: "Воздушная",
      motorType: "PMSM (синхронный с постоянными магнитами), номинал 15 кВт, 97 В",
      drive: "Редуктор + цепь",
      controller: "97 В, синусный векторный",
      frame: "Кованая алюминиевая, трёхбалочная",
      commPort: "CAN",
      weightKg: 95,
      chargeH: 3,
      chargeCurrent: "15 А",
      modes: "Eco (E) — ограничение 40 км/ч · Drive (D) — ограничение 80 км/ч · Sport (S) · R — задний ход · P — парковка · N — удержание", // официальное руководство Y-VOLT (решение Михаила 26.10.2026)
      ip: "IP67",
      nfc: "Да, карта и браслет в комплекте", // официальное руководство Y-VOLT (решение Михаила 26.10.2026)
      motorLight: false         // подсветки двигателя нет; свет — полностью светодиодный, дальний и ближний (руководство Y-VOLT)
    },
    colors: { frame: ["Белый графит", "Серый графит"], accents: [] }, // решение Михаила 26.10.2026, как на falcon-bike.ru
    price: 495000,           // цена в России — ответ Михаила 19.10.2026 (третья порция, подтверждена в пятой); зачёркнутой нет
    oldPrice: null,
    flags: []
  }
];

// Подписи строк для таблицы сравнения и блока характеристик.
window.SPEC_ROWS = [
  { key: "powerKw", label: "Пиковая мощность", unit: "кВт" },
  { key: "speedKmh", label: "Максимальная скорость", unit: "км/ч" },
  { key: "torqueNm", label: "Крутящий момент", unit: "Н·м" },
  // значение = напряжение + элементы («72 В, Samsung 50S»), формат — в app.js (fmtSpecText)
  { key: "cells", label: "Аккумулятор: напряжение, элементы", unit: "" },
  { key: "capacityAh", label: "Ёмкость батареи", unit: "Ач" },
  { key: "rangeKm", label: "Запас хода", unit: "км" },
  { key: "seatMm", label: "Высота сиденья", unit: "мм" },
  { key: "wheelbaseMm", label: "Колёсная база", unit: "мм" },
  { key: "clearanceMm", label: "Клиренс", unit: "мм" },
  // ширина — по рулю (у Lynx X — габаритная ширина из спецификации, 805 мм; руль 800 мм)
  { key: "dimensions", label: "Габариты (Д × Ш × В)", unit: "мм" },
  { key: "brakes", label: "Тормозные диски, диаметр × толщина", unit: "мм" },
  { key: "wheels", label: "Колёса", unit: "" },
  { key: "frontSuspension", label: "Передняя подвеска", unit: "" },
  { key: "rearSuspension", label: "Задняя подвеска", unit: "" },
  { key: "weightKg", label: "Вес", unit: "кг" },
  { key: "chargeH", label: "Время зарядки", unit: "ч" },
  { key: "modes", label: "Режимы езды", unit: "" },
  { key: "ip", label: "Влагозащита", unit: "" },
  { key: "nfc", label: "NFC-запуск", unit: "" },
  { key: "motorLight", label: "Подсветка двигателя", unit: "" },
  // Цвета берутся не из specs, а из model.colors (frame — рама, accents — вставки); формат строки — в app.js (fmtSpecText)
  { key: "colors", label: "Цвета", unit: "" }
];

// Строки, которые есть не у всех моделей (у Lynx X — по спецификации производителя: двигатель, контроллер, рама, цепь…): в общую таблицу не входят, показываются на странице модели,
// если значение есть (after — после какой строки SPEC_ROWS вставить в таблицу характеристик модели;
// size: true — в блоке «Размеры»).
window.SPEC_EXTRA_ROWS = [
  { key: "ratedKw", label: "Номинальная мощность", unit: "кВт", after: "powerKw" },
  { key: "batteryKwh", label: "Энергоёмкость батареи", unit: "кВт·ч", after: "capacityAh" },
  { key: "brakeType", label: "Тормоза", unit: "", after: "brakes" },
  { key: "payloadKg", label: "Максимальная нагрузка", unit: "кг", after: "weightKg" },
  { key: "ageRange", label: "Возраст райдера", unit: "", after: "payloadKg" },
  { key: "chargeCurrent", label: "Ток зарядки", unit: "", after: "chargeH" },
  { key: "motorType", label: "Двигатель", unit: "", after: "torqueNm" },
  { key: "drive", label: "Привод", unit: "", after: "torqueNm" },   // Lynx Trail: мотор с редуктором
  { key: "controller", label: "Контроллер", unit: "", after: "motorType" },
  { key: "frame", label: "Рама", unit: "", after: "rearSuspension" },
  { key: "chain", label: "Цепь", unit: "", after: "wheels" },
  { key: "commPort", label: "Порт связи", unit: "", after: "nfc" },
  { key: "handlebarMm", label: "Ширина руля", unit: "мм", size: true }
];
