// Проверка juliettes.ru по задачам SEO-001, SITE-002, SITE-003.
// Запуск: node scripts/check-site.mjs   (нужен playwright с chromium)
// Код выхода 0 — всё OK, 1 — есть проблемы.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // работает и с глобально установленным playwright

const BASE = 'https://juliettes.ru';
const MUST_OPEN = ['/about', '/delivery', '/kontakti', '/garantii', '/payments', '/gravirovka', '/podarochnie-sertificaty'];
const EXTRA_PAGES = ['/', '/otsivi'];
const BAD_DATE = /\b(3[01]\.02|31\.0[469]|31\.11)\.20\d\d\b/g; // SITE-004: несуществующие даты
const META_NOTE = /Meta Platforms|экстремистск/i;

const rows = [];
const add = (task, page, ok, note) => rows.push({ task, page, ok, note });

const robots = await (await fetch(`${BASE}/robots.txt`)).text();
const disallowed = new Set(
  robots.split('\n').map(l => l.trim()).filter(l => l.startsWith('Disallow:')).map(l => l.slice(9).trim())
);

const browser = await chromium.launch();
const page = await browser.newPage();

for (const path of [...MUST_OPEN, ...EXTRA_PAGES]) {
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
  const status = resp ? resp.status() : 'ERR';
  const info = await page.evaluate(() => ({
    robots: document.querySelector('meta[name=robots]')?.content || '',
    hasInsta: !!document.querySelector('a[href*="instagram.com"]') || /instagram|инстаграм/i.test(document.body.innerText),
    text: document.body.innerText,
  }));

  if (MUST_OPEN.includes(path)) {
    const blocked = disallowed.has(path);
    const noindex = /noindex/i.test(info.robots);
    add('SEO-001', path, status === 200 && !blocked && !noindex,
      `HTTP ${status}; robots.txt: ${blocked ? 'Disallow' : 'открыта'}; meta: ${info.robots || '—'}`);
  }

  if (info.hasInsta) {
    add('SITE-002', path, META_NOTE.test(info.text), META_NOTE.test(info.text) ? 'пометка есть' : 'нет пометки о Meta');
  }

  const bad = [...new Set(info.text.match(BAD_DATE) || [])];
  if (path === '/' || path === '/otsivi' || path === '/delivery' || bad.length)
    add('SITE-004', path, bad.length === 0, bad.length ? 'несуществующие даты: ' + bad.join(', ') : 'дат-ошибок нет');

  if (path === '/podarochnie-sertificaty') {
    const problems = [];
    if (/Тут должен быть текст/i.test(info.text)) problems.push('заглушка «Тут должен быть текст»');
    // Номинал в названии должен совпадать с ценой под ним.
    const re = /сертификат на\s*([\d\s]+)\s*р\.?[\s\S]{0,200}?\n\s*([\d\s]+)р\./gi;
    for (const m of info.text.matchAll(re)) {
      const nominal = m[1].replace(/\s/g, ''), price = m[2].replace(/\s/g, '');
      if (nominal !== price) problems.push(`номинал ${nominal} ≠ цена ${price}`);
    }
    add('SITE-003', path, problems.length === 0, problems.join('; ') || 'ошибок не найдено');
  }
}
await browser.close();

console.log('| Задача | Страница | Итог | Детали |\n|---|---|---|---|');
for (const r of rows) console.log(`| ${r.task} | ${r.page} | ${r.ok ? 'OK' : 'НЕ OK'} | ${r.note} |`);
const failed = rows.filter(r => !r.ok).length;
console.log(`\nПроблем: ${failed} из ${rows.length} проверок`);
process.exit(failed ? 1 : 0);
