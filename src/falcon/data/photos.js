// Реальные фото из папки Михаила «Фото с сайта 15.10.2026» (Яндекс Диск), сжаты в webp 1600px.
// view: side — сбоку; front34 — 3/4 спереди; rear34 — 3/4 сзади; front — анфас.
// Фон у всех снимков белый (у GT и Lynx — прозрачный PNG). Показывать на светлой «студийной» подложке
// (.media--photo, см. styles.css) в обеих темах; для JPG с белым фоном — mix-blend-mode: multiply.
// Surge V: фото от Михаила (22.10.2026), две расцветки — «Белый графит» и «Серый графит» (решение Михаила 26.10). Lynx X — один кадр из спецификации производителя (предсерийный образец; серийный цвет — чёрный с золотыми вставками).
// Lynx Trail: три расцветки — как на 79bikeofficial.com (Black/Purple, Black/Gold, Black/Yellow). Слаг "light" = Falcon Lite.
window.PHOTOS = {
  "gt": [
    { id: "black", frame: "Чёрный", accent: null, label: "Exclusive Black (эксклюзивный чёрный)", paint: ["black"], images: [
      { src: "assets/photos/gt-black-1.webp", view: "side" } ] },
    { id: "white", frame: "Белый", accent: null, label: "Exclusive White (эксклюзивный белый)", paint: ["white"], images: [
      { src: "assets/photos/gt-white-1.webp", view: "side" } ] }
  ],
  "pro": [
    { id: "black-violet", frame: "Чёрный", accent: "Фиолетовый", label: "Black Purple (чёрный с фиолетовым)", paint: ["black", "violet"], images: [
      { src: "assets/photos/pro-black-violet-1.webp", view: "side" },
      { src: "assets/photos/pro-black-violet-4.webp", view: "side" },
      { src: "assets/photos/pro-black-violet-2.webp", view: "front34" },
      { src: "assets/photos/pro-black-violet-3.webp", view: "front34" } ] },
    { id: "black-red", frame: "Чёрный", accent: "Красный", label: "Black Red (чёрный с красным)", paint: ["black", "red"], images: [
      { src: "assets/photos/pro-black-red-1.webp", view: "side" },
      { src: "assets/photos/pro-black-red-2.webp", view: "side" } ] },
    { id: "black-yellow", frame: "Чёрный", accent: "Жёлтый", label: "Black Yellow (чёрный с жёлтым)", paint: ["black", "yellow"], images: [
      { src: "assets/photos/pro-black-yellow-1.webp", view: "side" } ] },
    { id: "black", frame: "Чёрный", accent: null, label: "Black Edition (чёрная серия)", paint: ["black"], images: [
      { src: "assets/photos/pro-black-1.webp", view: "side" } ] },
    { id: "silver-violet", frame: "Серебристый", accent: "Фиолетовый", label: "Silver Purple (серебристый с фиолетовым)", paint: ["silver", "violet"], images: [
      { src: "assets/photos/pro-silver-violet-1.webp", view: "side" },
      { src: "assets/photos/pro-silver-violet-2.webp", view: "side" } ] },
    { id: "silver-red", frame: "Серебристый", accent: "Красный", label: "Silver Red (серебристый с красным)", paint: ["silver", "red"], images: [
      { src: "assets/photos/pro-silver-red-1.webp", view: "side" },
      { src: "assets/photos/pro-silver-red-2.webp", view: "side" } ] },
    { id: "silver-yellow", frame: "Серебристый", accent: "Жёлтый", label: "Silver Yellow (серебристый с жёлтым)", paint: ["silver", "yellow"], images: [
      { src: "assets/photos/pro-silver-yellow-1.webp", view: "side" },
      { src: "assets/photos/pro-silver-yellow-2.webp", view: "side" } ] }
  ],
  "lynx-trail": [
    { id: "black-violet", frame: "Чёрный", accent: "Фиолетовый", label: "Black Purple (чёрный с фиолетовым)", paint: ["black", "violet"], images: [
      { src: "assets/photos/lynx-black-violet-1.webp", view: "side" },
      { src: "assets/photos/lynx-black-violet-2.webp", view: "front34" },
      { src: "assets/photos/lynx-black-violet-3.webp", view: "rear34" },
      { src: "assets/photos/lynx-black-violet-4.webp", view: "front" } ] },
    { id: "black-gold", frame: "Чёрный", accent: "Золотой", label: "Black Gold (чёрный с золотым)", paint: ["black", "gold"], images: [
      { src: "assets/photos/lynx-black-gold-1.webp", view: "side" },
      { src: "assets/photos/lynx-black-gold-2.webp", view: "front34" },
      { src: "assets/photos/lynx-black-gold-3.webp", view: "rear34" },
      { src: "assets/photos/lynx-black-gold-4.webp", view: "front" } ] },
    { id: "black-yellow", frame: "Чёрный", accent: "Жёлтый", label: "Black Yellow (чёрный с жёлтым)", paint: ["black", "yellow"], images: [
      { src: "assets/photos/lynx-black-yellow-1.webp", view: "side" },
      { src: "assets/photos/lynx-black-yellow-2.webp", view: "front34" },
      { src: "assets/photos/lynx-black-yellow-3.webp", view: "front" } ] }
  ],
  "light": [
    { id: "black", frame: "Чёрный", accent: null, label: "Black Edition (чёрная серия)", paint: ["black"], images: [
      { src: "assets/photos/light-black-1.webp", view: "side" },
      { src: "assets/photos/light-black-2.webp", view: "side" },
      { src: "assets/photos/light-black-3.webp", view: "front34" },
      { src: "assets/photos/light-black-6.webp", view: "front34" },
      { src: "assets/photos/light-black-4.webp", view: "rear34" },
      { src: "assets/photos/light-black-5.webp", view: "rear34" },
      { src: "assets/photos/light-black-7.webp", view: "front" } ] }
  ],
  "lynx-x": [
    { id: "black-gold", frame: "Чёрный", accent: "Золотой", label: "Black Gold (чёрный с золотым)", paint: ["black", "gold"],
      images: [ /* 30.10: студийные фото нового Lynx X от Михаила */
      { src: "assets/photos/lynx-x-black-1.webp", view: "side" },
      { src: "assets/photos/lynx-x-black-2.webp", view: "side" },
      { src: "assets/photos/lynx-x-black-3.webp", view: "front34" } ] }
  ],
  "surge-v": [
    { id: "white", frame: "Белый графит", accent: null, label: "Белый графит", paint: ["white"], images: [
      { src: "assets/photos/surge-v-white-1.webp", view: "side" },
      { src: "assets/photos/surge-v-white-4.webp", view: "side" },
      { src: "assets/photos/surge-v-white-2.webp", view: "front34" },
      { src: "assets/photos/surge-v-white-5.webp", view: "front34" },
      { src: "assets/photos/surge-v-white-3.webp", view: "rear34" },
      { src: "assets/photos/surge-v-white-6.webp", view: "rear34" },
      { src: "assets/photos/surge-v-white-7.webp", view: "detail" },
      { src: "assets/photos/surge-v-white-8.webp", view: "detail" },
      { src: "assets/photos/surge-v-white-9.webp", view: "detail" } ] },
    { id: "grey", frame: "Серый графит", accent: null, label: "Серый графит", paint: ["grey"], images: [
      { src: "assets/photos/surge-v-grey-0.webp", view: "side" },
      { src: "assets/photos/surge-v-grey-1.webp", view: "side" },
      { src: "assets/photos/surge-v-grey-2.webp", view: "front34" },
      { src: "assets/photos/surge-v-grey-3.webp", view: "front34" },
      { src: "assets/photos/surge-v-grey-4.webp", view: "front" } ] }
  ]
};
window.PHOTO_VIEWS = { side: "Сбоку", front34: "3/4 спереди", rear34: "3/4 сзади", front: "Спереди", detail: "Деталь" };
