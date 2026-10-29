# Аудит прототипа falcon-bike.ru перед нативным переносом на Тильду

Источник: артефакт https://claude.ai/artifact/AyD6SKmq1hL2juyCRy7Tk1, версия 1793261447-4c58 (511 файлов). Дата: 29.10.2026.
Статус: анализ, ничего не опубликовано; Тильда, живые сайты и git не тронуты (файлы в src/falcon не закоммичены).

## 1. Что выгружено
- 53 текстовых файла с теми же путями: 29 html, assets/{app.js, cookie-banner.js, protect.js, range-q.js, site.css, cookie-banner.css, fonts.css}, 15 data/*.js, 2 assets/manuals/asm/*/v2/index.txt.
- 458 медиафайлов (144 МБ) не выгружались, их список с размерами лежит в `_media-list.md`. Основной объём занимают видео: сборка Lynx Trail (54 МБ) и Pro (28 МБ) в сегментах s00x.mp4, hero.mp4 и hero-m.mp4 (16 МБ), route-720.mp4 (5 МБ). Картинок (webp, jpg, png, svg) около 37 МБ.
- В `index.html` артефакт добавил свою обёртку: два `<!doctype>` и вложенный `<html>`. При сборке брать только внутренний документ.

## 2. Как рендерятся страницы
- Все html — пустые оболочки: `<title>`, иногда description и canonical, затем набор `<script defer>`. Страницу выбирает `<body data-page="…">` с уточнением `data-slug` (модель), `data-model` (инструкция) или `data-doc` (юр. документ).
- `app.js` строит разметку функцией `P[page]()`: `document.body.insertAdjacentHTML("afterbegin", header + <main id="main"> + footer + dock + msgr)`. Мета-теги, canonical, OG и JSON-LD ставит `applySeo()` из `data/seo.js` по ключу `data-page` или `model:<slug>`. У блога ключ `blogSeo()`.
- Блог-пост: `post.html?s=<slug>` (или `#<slug>`). canonical — `https://falcon-bike.ru/blog/<slug>`. Для неизвестного slug страница «Статья не найдена».
- Запчасти: отдельных страниц нет. Карточка открывается диалогом, адрес `parts.html#p-<id>` (replaceState). Корзина хранится в localStorage `falcon:cart`.
- Инструкции: 5 отдельных файлов `manual-<model>.html` с данными из `data/manuals.js`. Подключён `protect.js`: запрет копирования в `#main`.
- Особенность: `insertAdjacentHTML` добавляет разметку, а не заменяет её. Если оставить пререндер в странице, app.js продублирует шапку, main и подвал. Нужна правка в override (см. п. 7).

## 3. Пререндер (Playwright, chromium, локальный http-сервер, внешние запросы заблокированы)
Пререндер работает на всех 29 оболочках и 4 статьях. Ошибок JS (pageerror) 0. Console error — только 404 на картинки и шрифты, которые не выгружались. H1 есть везде, текст в DOM полный.

| Страница | outerHTML | из них #main | текст, символов |
|---|---|---|---|
| index | 96 КБ | 54 КБ | 9,4 тыс. |
| pro / gt / lynx-trail / lite / surge-v / lynx-x | 64–82 КБ | 29–42 КБ | 4,6–6,0 тыс. |
| parts | 64 КБ | 36 КБ | 5,5 тыс. (первая порция карточек) |
| manual-* (5) | 67–83 КБ | 32–45 КБ | 16–19 тыс. |
| post?s=… (4) | 56–61 КБ | 21–24 КБ | 10,6–11,9 тыс. |
| прочие (faq 82, delivery 53, privacy 46, остальные 27–41) | | | |

Размер outerHTML не включает CSS и JS: они подключены ссылками. Если встроить их, как в сборке 79bike, на каждую страницу добавится 715–960 КБ исходников. После terser и csso: app.js 197 КБ, site.css 123 КБ, content 66 КБ, seo 60 КБ, parts 157 КБ, manuals 62 КБ. Оценка нативной страницы: 450–650 КБ, то есть 12–17 блоков T123; parts — около 850 КБ, 21–22 блока. Для сравнения, на 79bike: index 789 КБ (19 блоков), остальные 250–350 КБ.
Снимки DOM: /tmp/claude-0/-home-claude/8e4d5a0b-9268-5c0a-b171-5ac8716480dc/scratchpad/pre/ (сводка в `_result.json`).

## 4. Страницы и адреса (canonical из data/seo.js и `<link>` в html)
| Файл | Адрес | | Файл | Адрес |
|---|---|---|---|---|
| index | / | | parts | /accessories |
| gt | /falcongt | | faq | /faq |
| pro | /falcon-pro | | testdrive | /test-drive |
| lite (slug light) | /falcon_lite | | contacts | /contacts |
| lynx-trail | /lynx | | events | /events |
| lynx-x | /lynx-x | | blog | /blog |
| surge-v | /surge-v | | post?s=slug | /blog/<slug> |
| podbor | /podbor | | bloggers | /bloggers |
| compare | /compare | | instructions | /instructions |
| video | /video | | manual-gt/-pro/-light/-lynx-trail/-surge-v | /manual-<model> |
| delivery | /delivery | | privacy | /privacy (из legal.js, canonical нет) |
| credit | /rassrochka | | consent | /consent (так же) |
| warranty | /warranty | | | |

Итого 28 статических страниц и 4 статьи блога из данных (zaryadka-i-hranenie-zimoy, elektromotocikl-dlya-podrostka-i-novichka, falcon-pro-ili-falcon-gt, kak-vybrat-elektromotocikl): 32 адреса.
Из данных генерируются также 344 карточки запчастей (196 Falcon/Lynx и 148 Y-Volt), но только как диалоги, без своих адресов. События (8) показываются якорями `/events#<id>`.
В seo.js нет ключей для instructions, manual-*, privacy и consent. У privacy и consent нет description и canonical. Подвал ссылается на `https://falcon-bike.ru/declaration`, такой страницы в прототипе нет.

## 5. Ссылки (полная таблица в `_audit-links.md`)
- На 79bike.ru две ссылки: `app.js` REP_EVENTS = `https://79bike.ru/events` и `data/blog.js` repBlog = `https://79bike.ru/blog`.
- Старые адреса в `data/parts.js`: 344 ссылки `url` на карточки старого Tilda Store (`falcon-bike.ru/<раздел>/tproduct/…` — 196, `y-volt.ru/zapchasti/…/tproduct/…` — 148) и 340 картинок `static.tildacdn.com`. Ссылки `url` в разметку не выводятся. Значит, при замене /accessories проиндексированные tproduct-адреса потеряются, если не оставить Store или не настроить 301.
- Внутренние ссылки вида `*.html` нужно переписать на чистые адреса (pageLink). Сейчас сборка `falcon-links.json` для 79bike уводит часть ссылок на старые адреса: /instrukciya_falcon_gt, /assembling и др. После переноса Falcon эти строки надо удалить, а для старых адресов инструкций сделать 301.
- Мессенджеры и телефоны: tel:+79999005588, wa.me/79999005588, t.me/Meliso_group, vk.me/79bike. Отдельно для кредитного менеджера: +7 (999) 576-57-27 и t.me/lubava90 (content.js). Почта: Sales@79bike.ru.
- Сервисы: Яндекс Карты (ссылки), Я.Метрика (в cookie-banner, metrikaId: null — не подключена), hls.js с cdnjs, плееры VK, RUTUBE и YouTube (nocookie). Т-Банк и POSCREDIT упомянуты только текстом, без ссылок. ЮKassa, вебхуков, CRM и form action нет.

## 6. Формы
9 форм, все демонстрационные: `submit` → `preventDefault`, проверка полей, сообщение «Спасибо» и ссылка на WhatsApp. Данные никуда не уходят. Поля `action` нет, fetch и XHR не вызываются.
f-home (index); f-order (6 моделей, поле color); f-city (delivery); f-credit (credit); f-service (warranty); f-parts (parts — сюда же оформление корзины, скрытое поле `cart` с составом заказа); f-visit (testdrive, contacts — дата и время визита); f-blog (bloggers); f-post (статьи). Общие поля: tel (data-contact), способ связи `*-how`, согласие `pd`, у части форм ещё name и age18.
Онлайн-оплаты нет: заказ подтверждает менеджер. Cookie-баннер готов отправлять журнал согласий в `logUrl`, но адрес не задан.

## 7. Рекомендация по встраиванию в нативную сборку
Переиспользовать:
- `split-native.mjs` — без изменений;
- из `build-native.mjs`: `css()` (шрифты в base64, url → asset-map), `markup()`/`asset()` (картинки → tildacdn), `pageLink()`, `render()` (пререндер через Playwright с блокировкой внешних запросов), генерацию settings.json и preview.html;
- `lead-sink.js` и `lead-bridge.js` — для отправки 9 форм через скрытую BF204N;
- `native-runtime.js` — переводчик путей; `forms.mjs` и `check-native.mjs` — как шаблон проверок.

Нужно новое:
1. Параметризовать сборку по сайту (SITE=falcon): свои ROUTES (таблица п. 4), ORIGIN, PAGES (28 + посты из `data/blog.js`).
2. Override в app.js: перед `insertAdjacentHTML` удалять пререндеренные header/main/footer (или заменить вставку на replace). slug статьи брать из `/blog/<slug>` (по образцу B79_BLOG_SLUG). FILE и ссылки `*.html` переводить в чистые адреса. Формы подключить к B79_LEAD.
3. Пререндер всей страницы, а не только отдельных id, с последующей проверкой отсутствия дублей.
4. Урезать данные под страницу: из seo.js оставить один ключ (−55 КБ), parts-данные только на /accessories, manuals — только нужную модель. Иначе 12–22 блока T123 на страницу.
5. Медиа: залить ~37 МБ картинок на сервер Тильды и расширить asset-map. Видео (≈100 МБ: hero, route, сегменты сборки) Тильда не принимает — нужен Kinescope, как hero у 79bike, иначе инструкции по сборке без видео.
6. 301-редиректы со старых адресов falcon-bike.ru (инструкции, tproduct-карточки) и решение по /declaration.

Решения для «Главной»:
- (а) Общий CSS и JS встраивать в каждую страницу, как у 79bike (просто, но 12–22 блока), или вынести в один внешний файл. Второй вариант меньше, но текст по-прежнему в HTML, а внешний хостинг становится зависимостью. Рекомендация: встраивать, но урезать данные (п. 4).
- (б) Судьба Tilda Store и tproduct-адресов при замене /accessories.
- (в) Kinescope для видео сборки.
