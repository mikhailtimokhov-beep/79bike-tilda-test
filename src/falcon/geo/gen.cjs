// Генератор GEO-файлов (llms.txt, ai/summary.json, ai/faq.json, .well-known/ai.txt) для falcon-bike.ru и 79bike.ru из данных src.
const fs=require("fs"),path=require("path");
const SRC=process.argv[2], OUT=process.argv[3];
global.window=global; require(path.join(SRC,"falcon/data/content.js"));
const C=Object.values(window).find(v=>v&&v.models);
const strip=s=>String(s).replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
const noPrice=s=>!/₽|руб|скидк|СНГ|гарантия\s+\d|\d+\s*(месяц|мес\.)/i.test(s);
const today=new Date().toISOString().slice(0,10);
const F="https://falcon-bike.ru", R="https://79bike.ru";
const URLS={gt:F+"/falcongt",pro:F+"/falcon-pro","lynx-trail":F+"/lynx",light:F+"/falcon_lite","lynx-x":F+"/lynx-x","surge-v":F+"/surge-v"};
const models=Object.entries(C.models).map(([k,m])=>({id:k,name:strip(m.h1).replace(/^Электромотоцикл\s+/,""),summary:strip(m.lead),url:URLS[k]}));
// Контролёр-261105-03: в автономном JSON без ссылок «выше/ниже на странице»
const standalone=s=>s.replace(/Как байки 79BIKE проверяют водой на заводе — в роликах производителя ниже; это испытания на пределе, повторять их не стоит\./,"Заводские испытания водой — это проверка на пределе, повторять их не стоит.").replace(/в блоке «Примерка по росту» выше на странице/g,"в блоке «Примерка по росту» на странице модели");
const faq=(C.faq||[]).map(x=>({q:strip(x.q),a:standalone(strip(x.a))})).filter(x=>noPrice(x.a)&&noPrice(x.q));
const sameAs=["https://79bike.ru/","https://vk.com/79bike","https://rutube.ru/channel/65461061/","https://t.me/club79bike","https://www.avito.ru/user/2304cbf6145715d8d9c460c84c03212a/profile"];
const conds=["Доставка транспортной компанией по всей России.","Оплата при получении — в Москве и Московской области, в городах до 600 км от Москвы и в Санкт-Петербурге (условия — на странице «Оплата и доставка»).","Посмотреть байк и записаться на тест-драйв можно в Москве и Московской области (шоурум: "+strip(C.showroom.addressShort)+", звонок перед приездом).","Отправки в страны СНГ нет.","Комплектация у каждой модели одна."];
function w(p,s){p=path.join(OUT,p);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
// falcon-bike.ru
w("falcon/llms.txt",`# FALCON-BIKE — официальный магазин 79BIKE в России

> Электромотоциклы Falcon (GT, Pro, Lite, Lynx Trail, Lynx X) и Y-Volt Surge V для бездорожья, трасс и закрытых площадок. Шоурум в Москве, доставка по России. Телефон ${C.meta.phone}, почта ${C.meta.email}.

Обновлено: ${today}

## Модели
${models.map(m=>`- [${m.name}](${m.url}): ${m.summary}`).join("\n")}

## Условия
${conds.map(s=>"- "+s).join("\n")}

## Страницы
- [Сравнение моделей](${F}/compare)
- [Подбор модели](${F}/podbor)
- [Тест-драйв](${F}/test-drive)
- [Оплата и доставка](${F}/delivery)
- [Гарантия](${F}/warranty)
- [Вопросы и ответы](${F}/faq)
- [Инструкции](${F}/instructions)
- [Запчасти и аксессуары](${F}/accessories)
- [Блог](${F}/blog)
- [Контакты](${F}/contacts)

## Связанные ресурсы
- [79BIKE в России — представительство производителя](${R}/)
- [Отзывы покупателей на Авито](${sameAs[4]})

## Дополнительно
- [Краткая сводка в JSON](${F}/ai/summary.json)
- [Вопросы и ответы в JSON](${F}/ai/faq.json)
`);
w("falcon/ai/summary.json",JSON.stringify({name:"FALCON-BIKE",description:"Официальный магазин 79BIKE в России: электромотоциклы Falcon и Y-Volt Surge V",url:F+"/",language:"ru",updated:today,contact:{phone:C.meta.phone,email:C.meta.email,showroom:strip(C.showroom.address)},conditions:conds,models,sameAs},null,2));
w("falcon/ai/faq.json",JSON.stringify({source:F+"/faq",language:"ru",updated:today,items:faq},null,2));
const aitxt=s=>`# ai.txt — правила для ИИ-систем (${s})
User-Agent: *
Allow: /
# Краткая информация для ИИ: ${s}/llms.txt
# Цены и наличие — только на страницах сайта, они меняются.
`;
w("falcon/.well-known/ai.txt",aitxt(F));
// 79bike.ru
w("rep/llms.txt",`# 79BIKE в России

> Официальное представительство завода-производителя 79BIKE в России: электромотоциклы Falcon, Lynx и Y-Volt Surge V, гарантийное обслуживание, оригинальные запчасти, техподдержка на русском для официальных дилеров и клиентов Falcon-Bike, дилеры в регионах.

Обновлено: ${today}

## Разделы
- [Главная: модели и дилеры](${R}/)
- [Гарантия](${R}/garant)
- [Инструкции](${R}/instructions)
- [Производство](${R}/factory)
- [Блог](${R}/blog)

## Где купить
- [FALCON-BIKE — официальный магазин 79BIKE в России](${F}/): шоурум в Москве, доставка по России.

## Модели
${models.map(m=>`- [${m.name}](${m.url}): ${m.summary}`).join("\n")}
`);
w("rep/ai/summary.json",JSON.stringify({name:"79BIKE в России",description:"Официальное представительство завода-производителя 79BIKE в России",url:R+"/",language:"ru",updated:today,shop:F+"/",models},null,2));
w("rep/.well-known/ai.txt",aitxt(R));
console.log("models",models.length,"faq",faq.length,"/",(C.faq||[]).length);
// RSS блога falcon
require(path.join(SRC,"falcon/data/blog.js"));
const P=(window.BLOG&&window.BLOG.posts)||[];
const x=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const rd=d=>new Date(d+"T09:00:00+03:00").toUTCString();
w("falcon/blog/rss.xml",`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Блог FALCON-BIKE — официальный магазин 79BIKE</title>
<link>${F}/blog</link>
<description>${x(strip(window.BLOG.lead||"Статьи об электромотоциклах Falcon и Y-Volt"))}</description>
<language>ru</language>
<lastBuildDate>${rd(P.map(p=>p.updated||p.date).sort().pop())}</lastBuildDate>
${P.map(p=>`<item><title>${x(strip(p.h1||p.title))}</title><link>${F}/blog/${p.slug}</link><guid>${F}/blog/${p.slug}</guid><pubDate>${rd(p.date)}</pubDate><description>${x(strip(p.seoDescription||p.lead))}</description></item>`).join("\n")}
</channel></rss>
`);
console.log("rss",P.length);
